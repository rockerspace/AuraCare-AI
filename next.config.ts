import type { NextConfig } from 
ext;

const nextConfig: NextConfig = {
  output: standalone,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
