import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@arenaiq/types'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
