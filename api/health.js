// api/health.js
import { handleApiRequest } from '../server/apiRouter.js';

export default async function handler(req, res) {
  req.url = '/api/health';
  await handleApiRequest(req, res);
}
