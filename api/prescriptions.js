// api/prescriptions.js
import { handleApiRequest } from '../server/apiRouter.js';

export default async function handler(req, res) {
  if (!req.url.startsWith('/api/')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  await handleApiRequest(req, res);
}
