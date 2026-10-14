import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML/CSS/JS for the Tauri desktop shell.
  output: "export",
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
