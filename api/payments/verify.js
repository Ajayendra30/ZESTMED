// api/payments/verify.js
import { handleApiRequest } from '../../server/apiRouter.js';

export default async function handler(req, res) {
  req.url = '/api/payments/verify';
  await handleApiRequest(req, res);
}
