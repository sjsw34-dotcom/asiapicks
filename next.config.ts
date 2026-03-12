import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "*.agoda.net" },
      { hostname: "res.klook.com" },
    ],
  },
};

export default nextConfig;
