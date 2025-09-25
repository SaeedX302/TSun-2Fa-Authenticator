/** @type {import('next').NextConfig} */
const nextConfig = {
  // Aapka code yahan aayega, agar koi custom settings hain
  // Jaise: compiler: { styledComponents: true }
  
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