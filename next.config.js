/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.GH_PAGES ? '/chaufflor-console' : '',
  images: { unoptimized: true },
};
module.exports = nextConfig;
