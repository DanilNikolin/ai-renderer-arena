import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // <<< ДОБАВЛЯЕМ ЭТОТ БЛОК
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fal.run",
      },
    ],
  },
};

export default nextConfig;