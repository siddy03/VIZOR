/** @type {import('next').NextConfig} */
const API_TARGET = process.env.API_TARGET || 'http://localhost:8080';

const nextConfig = {
  reactStrictMode: true,
  // Proxy /api requests to the Spring Boot backend (mirrors Angular's proxy.conf.json)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
