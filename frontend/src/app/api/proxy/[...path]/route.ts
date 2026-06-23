import type { NextRequest } from 'next/server';

// Must use Node.js runtime — this handler uses node:http/node:https which are
// not available in the Edge runtime.
export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, params);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, params);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, params);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, params);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return handleProxy(request, params);
}

// Only these headers are forwarded from the client to the backend.
// Whitelisting prevents internal/platform headers from being spoofed.
const ALLOWED_REQUEST_HEADERS = new Set([
  'accept',
  'accept-language',
  'authorization',
  'content-type',
  'cache-control',
  'x-requested-with',
]);

// Headers from the backend response that should NOT be forwarded to the browser
// (they conflict with Next.js / the edge runtime).
const BLOCKED_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
]);

// 10 MB request body limit
const MAX_BODY_BYTES = 10 * 1024 * 1024;

// 30-second backend timeout
const BACKEND_TIMEOUT_MS = 30_000;

async function handleProxy(
  request: NextRequest,
  paramsPromise: Promise<{ path: string[] }>
) {
  const { default: http } = await import('node:http');
  const { default: https } = await import('node:https');
  const API_URL = process.env.API_URL || 'http://localhost:4000';

  const { path: pathSegments } = await paramsPromise;
  const url = new URL(request.url);

  // Reconstruct the backend path from the catch-all segments
  // e.g. ['auth', 'login'] → '/api/auth/login'
  const backendPath = `/api/${(pathSegments ?? []).join('/')}`;

  // Prevent path traversal: ensure path stays under /api
  if (!backendPath.startsWith('/api')) {
    return new Response(JSON.stringify({ error: 'Invalid proxy path' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const target = new URL(backendPath + url.search, API_URL);

  // Build a whitelisted header set
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (ALLOWED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers[key] = value;
    }
  });

  // Read body with size guard
  let body: ArrayBuffer | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) {
      return new Response(JSON.stringify({ error: 'Request body too large' }), {
        status: 413,
        headers: { 'content-type': 'application/json' },
      });
    }
  }

  return new Promise<Response>((resolve) => {
    const client = target.protocol === 'https:' ? https : http;

    const req = client.request(
      target.toString(),
      {
        method: request.method,
        headers: {
          ...headers,
          ...(body ? { 'content-length': String(body.byteLength) } : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const responseHeaders = Object.fromEntries(
            Object.entries(res.headers)
              .filter(([k, v]) => v !== undefined && !BLOCKED_RESPONSE_HEADERS.has(k.toLowerCase()))
              .map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : (v as string)])
          );
          resolve(
            new Response(Buffer.concat(chunks), {
              status: res.statusCode,
              statusText: res.statusMessage,
              headers: responseHeaders,
            })
          );
        });
      }
    );

    // Enforce backend timeout
    req.setTimeout(BACKEND_TIMEOUT_MS, () => {
      req.destroy();
      resolve(
        new Response(JSON.stringify({ error: 'Backend request timed out' }), {
          status: 504,
          headers: { 'content-type': 'application/json' },
        })
      );
    });

    req.on('error', (err) => {
      console.error('[proxy] backend error:', err.message);
      resolve(
        new Response(JSON.stringify({ error: 'Backend unavailable' }), {
          status: 502,
          headers: { 'content-type': 'application/json' },
        })
      );
    });

    if (body) req.write(Buffer.from(body));
    req.end();
  });
}
