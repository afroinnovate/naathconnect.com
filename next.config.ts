import type { NextConfig } from "next";
import { robotsTag } from "./lib/config";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    const headers = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    const tag = robotsTag();
    if (tag) headers.push({ key: "X-Robots-Tag", value: tag });
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
