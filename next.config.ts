import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from the public folder
    unoptimized: false,
    remotePatterns: [],
  },
};

export default nextConfig;
