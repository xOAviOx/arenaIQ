/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@arenaiq/types'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
