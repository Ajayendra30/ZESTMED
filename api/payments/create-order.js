// api/payments/create-order.js
import { handleApiRequest } from '../../server/apiRouter.js';

export default async function handler(req, res) {
  req.url = '/api/payments/create-order';
  await handleApiRequest(req, res);
}
