/** @type {import('next').NextConfig} */
const nextConfig = {
  // WSL / LAN access: browser Origin is the machine IP, not localhost.
  // Without this, Next 16 blocks /_next chunks → no hydration, dead clicks, no HMR.
  allowedDevOrigins: ["172.23.228.255", "127.0.0.1", "localhost"],
};

export default nextConfig;
