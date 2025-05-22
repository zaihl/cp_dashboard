import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://cdn.codechef.com/**'), new URL('https://userpic.codeforces.org/**')],
  },
};

export default nextConfig;
