// api/index.js
// Vercel Serverless Function entrypoint for all /api/* routes
import { handleApiRequest } from '../server/apiRouter.js';

export default async function handler(req, res) {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled && !res.headersSent) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Endpoint not found', apiPrefix: '/api/' }));
    }
  } catch (err) {
    console.error('[Vercel API Handler Error]:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
    }
  }
}
