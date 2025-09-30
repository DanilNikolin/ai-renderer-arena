import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fal.run", // Оставляем на всякий случай
      },
      {
        protocol: "https",
        hostname: "v3.fal.media", // <<< ДОБАВЛЕНО: Явно разрешаем этот
      },
    ],
  },
};

export default nextConfig;