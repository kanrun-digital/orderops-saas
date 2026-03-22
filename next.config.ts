import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  transpilePackages: ["@tanstack/react-query", "@tanstack/query-core"],
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@tanstack/react-query$": path.resolve(
        __dirname,
        "node_modules/@tanstack/react-query/src/index.ts",
      ),
      "@tanstack/query-core$": path.resolve(
        __dirname,
        "node_modules/@tanstack/query-core/src/index.ts",
      ),
    };

    return config;
  },
};

export default nextConfig;
