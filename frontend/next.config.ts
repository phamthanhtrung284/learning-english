import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        // Forward all /api/* calls to the catch-all proxy handler.
        // The negative lookahead (?!proxy) prevents /api/proxy/* from being
        // rewritten again, which would cause an infinite loop.
        source: "/api/:path((?!proxy).*)",
        destination: "/api/proxy/:path*",
      },
    ];
  },
};

export default nextConfig;
