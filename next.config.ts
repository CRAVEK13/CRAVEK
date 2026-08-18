import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
  },
};

export default nextConfig;
