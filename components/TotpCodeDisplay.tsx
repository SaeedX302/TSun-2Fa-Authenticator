// components/TotpCodeDisplay.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { authenticator } from 'otplib';
import { motion } from 'framer-motion';
import { Copy, RefreshCcw, Trash2 } from 'lucide-react';
import { getServiceIcon } from '@/utils/iconMapping';

interface TotpCodeDisplayProps {
    id: string;
    serviceName: string;
    accountName: string;
    encryptedSecret: string;
    deleteSecret: (id: string) => void;
}

export default function TotpCodeDisplay({ id, serviceName, accountName, encryptedSecret, deleteSecret }: TotpCodeDisplayProps) {
    const [code, setCode] = useState('------');
    const [timeLeft, setTimeLeft] = useState(0);

    const generateCode = () => {
        try {
            const config = JSON.parse(encryptedSecret);
            authenticator.options = {
                algorithm: config.algorithm?.toLowerCase() as any || 'sha1',
                digits: config.digits || 6,
                period: config.period || 30,
            };
            const newToken = authenticator.generate(config.secret);
            setCode(newToken);
            setTimeLeft(authenticator.timeRemaining());
        } catch (error) {
            console.error('Failed to generate code:', error);
            setCode('Error!');
        }
    };

    useEffect(() => {
        generateCode();
        const timer = setInterval(() => {
            const timeRemaining = authenticator.timeRemaining();
            if (timeRemaining <= 1) {
                generateCode();
            }
            setTimeLeft(timeRemaining);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCopy = () => {
        if (code !== '------' && code !== 'Error!') {
            navigator.clipboard.writeText(code);
            alert('Copied to clipboard!');
        }
    };

    return (
        <motion.div
            className="glass-card flex flex-col items-center p-3 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center space-x-2 mb-1 w-full">
                {getServiceIcon(serviceName)}
                <div>
                    <h3 className="text-sm font-semibold text-text-dark">{accountName}</h3>
                    <p className="text-xs text-text-light">{serviceName}</p>
                </div>
            </div>

            <div className="my-1 text-center w-full h-20 flex flex-col justify-center">
                <motion.h4
                    key={code}
                    className="text-2xl font-bold text-text-dark tracking-wider font-mono"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {code}
                </motion.h4>
                <div className="relative w-full h-0.5 bg-secondary rounded-full overflow-hidden mt-1">
                    <motion.div
                        className="h-full bg-highlight rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(timeLeft / (authenticator.options.period || 30)) * 100}%` }}
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </div>
            </div>

            <div className="flex space-x-1 mt-1 text-text-light">
                <motion.button
                    onClick={generateCode}
                    whileHover={{ scale: 1.1 }}
                    className="p-1.5 rounded-full bg-secondary/60 hover:bg-accent/60 transition"
                >
                    <RefreshCcw size={16} />
                </motion.button>
                <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.1 }}
                    className="p-1.5 rounded-full bg-secondary/60 hover:bg-accent/60 transition"
                >
                    <Copy size={16} />
                </motion.button>
                <motion.button
                    onClick={() => deleteSecret(id)}
                    whileHover={{ scale: 1.1 }}
                    className="p-1.5 rounded-full bg-red-500/15 hover:bg-red-500/30 transition"
                >
                    <Trash2 size={16} />
                </motion.button>
            </div>
        </motion.div>
    );
}
