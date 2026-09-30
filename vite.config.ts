import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Serve the standalone API docs page (public/apidocs/get-payment.html) at /apidocs/get-payment,
 * for both `vite` and `vite preview`. On Vercel the same mapping lives in vercel.json.
 */
function apiDocsRoute(): Plugin {
  const rewrite = (req: { url?: string }) => {
    if (req.url && /^\/apidocs\/get-payment\/?(\?.*)?$/.test(req.url)) req.url = '/apidocs/get-payment.html';
  };
  return {
    name: 'api-docs-route',
    configureServer(server) { server.middlewares.use((req, _res, next) => { rewrite(req); next(); }); },
    configurePreviewServer(server) { server.middlewares.use((req, _res, next) => { rewrite(req); next(); }); },
  };
}

export default defineConfig({ plugins: [react(), apiDocsRoute()] });
