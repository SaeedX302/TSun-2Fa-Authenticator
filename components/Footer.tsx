// components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500">
      <p className="mb-2">A vibe by {`༯𝙎ค૯𝙀𝘿✘🫀`} | © {currentYear} | Built with Next.js & Supabase</p>
      <div className="space-x-4 flex justify-center items-center text-sm">
        {/* Add My PortFolio into Footer */}
        <a href="https://linktr.ee/saeedxdie" target="_blank" className="hover:text-blue-400 transition">My PortFolio (Linktree)</a>
        <span>•</span>
        <a href="https://gravatar.com/cheerfuld27b01881a" target="_blank" className="hover:text-blue-400 transition">Gravatar Profile</a>
        <span>•</span>
        <a href="https://github.com/SaeedX302" target="_blank" className="hover:text-blue-400 transition">GitHub 💾</a>
        <span>•</span>
        <a href="https://www.tiktok.com/@saeedxdie" target="_blank" className="hover:text-blue-400 transition">TikTok 🎵</a>
      </div>
    </footer>
  );
};

export default Footer;