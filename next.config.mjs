/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/account",
        destination: "/account/activity",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
