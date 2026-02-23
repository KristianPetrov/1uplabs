import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@ap/shared-ui", "@ap/shared-core"],
  experimental: {
    externalDir: true,
  },
  async headers() {
    return [
      {
        // These are stable, versioned-by-filename assets; cache aggressively.
        source: "/molecules/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
