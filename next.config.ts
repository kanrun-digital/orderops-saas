import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@tanstack/react-query", "@tanstack/query-core"],
};

export default nextConfig;
