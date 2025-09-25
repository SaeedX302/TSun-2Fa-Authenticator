// components/TotpCodeDisplay.tsx
import { useState, useEffect } from 'react';
// otp-generator library se TOTP function import karen
import { generate } from 'otp-generator'; 
import { decryptSecret } from '@/lib/crypto';
import { motion } from 'framer-motion';

interface TotpCodeDisplayProps {
  encryptedSecret: string;
  serviceName: string;
}

const TotpCodeDisplay: React.FC<TotpCodeDisplayProps> = ({ encryptedSecret, serviceName }) => {
  const [otp, setOtp] = useState('------');
  const [progress, setProgress] = useState(0); // For the cool progress bar

  const generateNewCode = (secret: string) => {
    // Note: otp-generator works with 'base32' encoded secrets which is standard for TOTP.
    // Google Authenticator keys are usually base32. 
    // If you use a different format (e.g., hex), you might need to convert it.
    const newOtp = generate(secret, {
      digits: 6,
      algorithm: 'sha1',
      period: 30, // 30 seconds standard
    });
    setOtp(newOtp.match(/.{1,3}/g)?.join(' ') || newOtp); // 3-digit groups mein split kar ke display karen
  };

  useEffect(() => {
    // 1. Decrypt the secret key
    const secret = decryptSecret(encryptedSecret);
    if (!secret) return; // Agar decryption fail ho jaye

    // 2. Initial code generation and setup interval
    generateNewCode(secret);

    // Update interval: code har 30s mein update hoga
    const intervalId = setInterval(() => {
      generateNewCode(secret);
    }, 30000); // 30 seconds

    // Progress bar interval: har 1 second mein progress update hogi
    const progressInterval = setInterval(() => {
        const secondsRemaining = 30 - (Math.floor(Date.now() / 1000) % 30);
        setProgress((secondsRemaining / 30) * 100);
    }, 1000);


    return () => {
      clearInterval(intervalId);
      clearInterval(progressInterval);
    };
  }, [encryptedSecret]); // Dependency mein encryptedSecret rakhen

  return (
    <motion.div 
      className="glass-card p-4 rounded-xl shadow-lg border border-gray-700 overflow-hidden relative"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
        {/* Progress Bar (smoother than silk transition!) */}
        <div 
            className="absolute top-0 left-0 h-1 bg-blue-500/50" 
            style={{ width: `${progress}%`, transition: 'width 1s linear' }} 
        />
        
        <h3 className="text-xl font-medium mb-2">{serviceName}</h3>
        <div className="text-5xl font-extrabold tracking-widest text-blue-400">
            {otp}
        </div>
        <p className="text-xs mt-2 text-gray-400">New code in {Math.ceil((progress/100) * 30)}s</p>
    </motion.div>
  );
};

export default TotpCodeDisplay;