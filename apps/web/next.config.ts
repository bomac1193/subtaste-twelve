import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@subtaste/core', '@subtaste/profiler', '@subtaste/sdk'],
};

export default nextConfig;
