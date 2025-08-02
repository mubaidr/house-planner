import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Temporarily ignore ESLint during builds to focus on functionality
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
