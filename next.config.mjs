/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/account",
        destination: "/account/swaps",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
