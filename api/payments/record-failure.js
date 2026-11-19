// api/payments/record-failure.js
import { handleApiRequest } from '../../server/apiRouter.js';

export default async function handler(req, res) {
  req.url = '/api/payments/record-failure';
  await handleApiRequest(req, res);
}
