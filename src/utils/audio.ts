/**
 * Audio helpers for Gemini Live API and Voice Assistant
 */

// Convert Float32Array PCM audio to Base64 Int16 Little-Endian PCM
export function float32ToInt16Base64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to [-1, 1] range
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

// Convert Base64 Int16 Little-Endian PCM to AudioBuffer at 24000Hz
export function base64ToAudioBuffer(
  audioCtx: AudioContext,
  base64Data: string,
  sampleRate = 24000
): AudioBuffer {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // 16-bit mono PCM = 2 bytes per sample
  const sampleCount = Math.floor(len / 2);
  const audioBuffer = audioCtx.createBuffer(1, sampleCount, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  for (let i = 0; i < sampleCount; i++) {
    const int16 = dataView.getInt16(i * 2, true); // little-endian
    channelData[i] = int16 / 32768.0;
  }

  return audioBuffer;
}

export class LiveAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private analyser: AnalyserNode | null = null;

  init() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playChunk(base64Pcm: string) {
    this.init();
    if (!this.audioCtx) return;

    try {
      const buffer = base64ToAudioBuffer(this.audioCtx, base64Pcm, 24000);
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;

      if (this.analyser) {
        source.connect(this.analyser);
      } else {
        source.connect(this.audioCtx.destination);
      }

      const currentTime = this.audioCtx.currentTime;
      const startTime = Math.max(currentTime, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + buffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const index = this.activeSources.indexOf(source);
        if (index !== -1) {
          this.activeSources.splice(index, 1);
        }
      };
    } catch (err) {
      console.error('Error playing audio chunk:', err);
    }
  }

  stop() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
  }

  getVolume(): number {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / (dataArray.length * 255);
  }

  close() {
    this.stop();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

export class LiveAudioRecorder {
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private onChunkCallback: ((base64: string) => void) | null = null;
  private analyser: AnalyserNode | null = null;

  async start(onChunk: (base64: string) => void) {
    this.onChunkCallback = onChunk;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioCtxClass({ sampleRate: 16000 });

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    this.source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 64;

    // ScriptProcessor for 16kHz PCM capture
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);
    this.source.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);

    this.processor.onaudioprocess = (e) => {
      if (!this.onChunkCallback) return;
      const inputData = e.inputBuffer.getChannelData(0);
      const base64 = float32ToInt16Base64(inputData);
      this.onChunkCallback(base64);
    };
  }

  getVolume(): number {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / (dataArray.length * 255);
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.onChunkCallback = null;
  }
}
