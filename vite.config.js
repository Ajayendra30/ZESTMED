import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleApiRequest } from './server/apiRouter.js'

function nodeApiMiddleware() {
  return {
    name: 'node-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          if (req.url && (req.url === '/api' || req.url.startsWith('/api/') || req.url.startsWith('/api?'))) {
            const handled = await handleApiRequest(req, res);
            if (handled) return;
          }
        } catch (err) {
          console.error('[Vite node-api-middleware error]:', err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'SERVER_MIDDLEWARE_ERROR', message: err.message }));
          }
          return;
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodeApiMiddleware()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true
  }
})
