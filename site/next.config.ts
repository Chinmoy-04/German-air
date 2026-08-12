import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server's JS/HMR assets load when the site is opened through
  // a tunnel (Cloudflare quick tunnel / localtunnel) for on-device testing —
  // otherwise Next.js blocks those cross-origin chunk requests by default,
  // which silently breaks any component whose code lives in a lazily-loaded
  // chunk (e.g. the chart library). Dev-only; irrelevant in production.
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt"],
};

export default nextConfig;
