import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handleApiRequest } from './server/apiRouter.js'

function nodeApiMiddleware() {
  return {
    name: 'node-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          const handled = await handleApiRequest(req, res);
          if (handled) return;
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
