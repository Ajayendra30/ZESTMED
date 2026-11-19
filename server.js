// server.js
/**
 * Standalone Node.js Backend Server for ZESTMED
 * Run with: node server.js
 */
import http from 'http';
import dotenv from 'dotenv';
import { handleApiRequest } from './server/apiRouter.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(async (req, res) => {
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Endpoint not found', apiPrefix: '/api/' }));
  }
});

server.listen(PORT, () => {
  console.log(`[ZESTMED Backend Server] Protected Node.js API running on http://localhost:${PORT}`);
});
