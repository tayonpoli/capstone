import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

module.exports = {
  output: "standalone",
};

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
