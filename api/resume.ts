import { RESUME_DATA } from '../lib/profile.js';

export function GET(): Response {
  return Response.json(RESUME_DATA);
}
