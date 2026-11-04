import type { NextConfig } from "next";
import legacy from "./src/data/legacy-urls.json";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    // 301 (not Next's default 308) so Search Console and every crawler read a plain permanent move.
    return legacy.redirects.map((r) => ({ source: r.from, destination: r.to, statusCode: 301 as const }));
  },
};

export default nextConfig;
