/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["diplomatcorner.net"],
  },
  typescript: {
    // This will ignore TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
