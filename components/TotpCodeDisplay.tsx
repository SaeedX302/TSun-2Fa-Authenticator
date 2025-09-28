// components/TotpCodeDisplay.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { authenticator, totp, hotp } from 'otplib';
import { decryptConfig } from '@/lib/crypto';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, RefreshCcw, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
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
    const [counter, setCounter] = useState(0);
    const [isDecrypted, setIsDecrypted] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handlePasswordSubmit = async () => {
        try {
            const config = await decryptConfig(encryptedSecret, password);
            if (config.secret) {
                setIsDecrypted(true);
                setError(null);
                generateCode(password);
            }
        } catch (e) {
            setError('Incorrect password.');
        }
    };

    const generateCode = async (currentPassword: string) => {
        try {
            const config = await decryptConfig(encryptedSecret, currentPassword);
            let newToken;

            if (config.type === 'hotp') {
                // HOTP logic remains, but needs careful review for state management
            } else {
                authenticator.options = {
                    algorithm: config.algorithm?.toLowerCase() as any || 'sha1',
                    digits: config.digits || 6,
                    period: config.period || 30,
                };
                newToken = authenticator.generate(config.secret);
                setTimeLeft(authenticator.timeRemaining());
            }

            setCode(newToken);
        } catch (error) {
            console.error('Failed to generate code:', error);
            setCode('Error!');
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isDecrypted) {
            generateCode(password);
            timer = setInterval(() => {
                const timeRemaining = authenticator.timeRemaining();
                if (timeRemaining <= 1) {
                    generateCode(password);
                }
                setTimeLeft(timeRemaining);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isDecrypted, password]);

    const handleCopy = () => {
        if (code !== '------' && code !== 'Error!') {
            navigator.clipboard.writeText(code);
            // In a real app, you'd use a toast notification here.
            alert('Copied to clipboard!');
        }
    };

    return (
        <motion.div
            className="glass-card flex flex-col items-center p-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-center space-x-3 mb-2 w-full">
                <i className={`${getServiceIcon(serviceName)} text-2xl text-text-light`}></i>
                <div>
                    <h3 className="text-md font-semibold text-text-dark">{accountName}</h3>
                    <p className="text-sm text-text-light">{serviceName}</p>
                </div>
            </div>

            {!isDecrypted ? (
                <div className="flex flex-col items-center justify-center w-full h-24">
                    <div className="flex items-center space-x-2">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full p-2 rounded-lg bg-secondary/50 text-text-main focus:outline-none focus:ring-2 focus:ring-highlight"
                        />
                        <button onClick={handlePasswordSubmit} className="p-2 rounded-lg bg-accent hover:bg-highlight text-text-dark font-semibold">Unlock</button>
                    </div>
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </div>
            ) : (
                <div className="my-2 text-center w-full h-24 flex flex-col justify-center">
                    <motion.h4
                        key={code}
                        className="text-3xl font-bold text-text-dark tracking-wider font-mono"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {code.match(/.{1,3}/g)?.join(' ')}
                    </motion.h4>
                    <div className="relative w-full h-1 bg-secondary rounded-full overflow-hidden mt-2">
                        <motion.div
                            className="h-full bg-highlight rounded-full"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(timeLeft / (authenticator.options.period || 30)) * 100}%` }}
                            transition={{ duration: 1, ease: "linear" }}
                        />
                    </div>
                </div>
            )}

            <div className="flex space-x-2 mt-2 text-text-light">
                <motion.button
                    onClick={() => isDecrypted && generateCode(password)}
                    whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-full bg-secondary/70 hover:bg-accent/70 transition"
                >
                    <RefreshCcw size={18} />
                </motion.button>
                <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-full bg-secondary/70 hover:bg-accent/70 transition"
                >
                    <Copy size={18} />
                </motion.button>
                <motion.button
                    onClick={() => deleteSecret(id)}
                    whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 transition"
                >
                    <Trash2 size={18} />
                </motion.button>
            </div>
        </motion.div>
    );
}
