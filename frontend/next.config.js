/** @type {import('next').NextConfig} */

// Where the frontend's own server proxies /api/* to. Read at BUILD time -- Next
// freezes rewrite destinations into the build manifests -- so it arrives as a
// Dockerfile ARG, not a runtime env var. Under Compose it is the backend service
// name, which a container cannot reach as "localhost".
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd', '@ant-design/icons'],

  // Bundles only the files the server needs, keeping the runtime image small.
  output: 'standalone',

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
