import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily ignore ESLint during builds to focus on functionality
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Handle pdfmake import issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        canvas: false,
      };
    }

    return config;
  },
  transpilePackages: ['pdfmake'],
};

export default nextConfig;
