import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     // remotePatterns: [
//     //   {
//     //     protocol: "https",
//     //     hostname: "fal.run",
//     //   },
//     //   {
//     //     protocol: "https",
//     //     hostname: "v3.fal.media",
//     //   },
//     //   { 
//     //     protocol: "https",
//     //     hostname: "v3b.fal.media",
//     //   },
//     // ],
//     remotePatterns: [
//       { protocol: "https", hostname: "fal.run",         pathname: "/**" },
//       { protocol: "https", hostname: "fal.media",       pathname: "/**" },
//       { protocol: "https", hostname: "*.fal.media",     pathname: "/**" }, 
//       { protocol: "https", hostname: "**.fal.media",    pathname: "/**" }, 
//     ],
//   },
// };


// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       { protocol: "http", hostname: "193.84.3.222", port: "3002", pathname: "/images/**" },
//     ],
//   },
// };
const nextConfig: NextConfig = { images: { unoptimized: true } };


export default nextConfig;