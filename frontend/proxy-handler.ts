import { createProxyMiddleware } from 'http-proxy-middleware';
import type { IncomingMessage, ServerResponse } from 'http';

const API_URL = process.env.API_URL || 'http://localhost:4000';

const proxy = createProxyMiddleware({
  target: API_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/proxy': '/api' },
});

export function proxyHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proxy as any)(req, res, (result: unknown) => {
      if (result instanceof Error) reject(result);
      resolve();
    });
  });
}
