// src/app/user/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css"; // Стили глобальные, нам это подходит

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Sauna Constructor Visualizer",
  description: "Photorealistic Sauna Visualization",
};

export default function UserLayout({ children }: { children: React.ReactNode }) {
  // Максимально пустой layout, чтобы ничего не мешало при встраивании
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  );
}