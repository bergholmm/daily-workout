/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/training",
        permanent: false,
      },
    ]
  },
}

export default nextConfig
