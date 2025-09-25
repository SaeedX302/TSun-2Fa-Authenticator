/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Next.js to use SWC for minification (WebAssembly version)
  swcMinify: true,
  
  // Compiler configuration
  compiler: {
    // Enable SWC minification
    minify: true,
  },
  
  // Images ke liye agar aap Icons8 ya Flaticon se directly URLs use karte to:
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.icons8.com',
      },
    ],
  },
};

module.exports = nextConfig;