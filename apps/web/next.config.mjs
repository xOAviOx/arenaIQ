/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@arenaiq/types'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Don't reuse cached dynamic pages on client-side navigation, so the
    // dashboard/leaderboard always show post-match ratings immediately.
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
