import type { NextConfig } from "next";
import legacy from "./src/data/legacy-urls.json";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return legacy.redirects.map((r) => ({ source: r.from, destination: r.to, permanent: true }));
  },
};

export default nextConfig;
