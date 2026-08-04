import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: "https", hostname: "kjtxkdztssbymtloafrb.supabase.co" }] },
  experimental: { serverActions: { bodySizeLimit: "45mb" } },
};
export default nextConfig;
