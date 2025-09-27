// components/TotpCodeDisplay.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { authenticator, totp, hotp } from 'otplib';
import { decryptConfig } from '@/lib/crypto';
import { motion } from 'framer-motion';
import { Copy, RefreshCcw, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getServiceIcon } from '@/utils/iconMapping';

interface TotpCodeDisplayProps {
    id: string;
    serviceName: string;
    accountName: string;
    encryptedSecret: string;
    onDelete: (id: string) => void;
}

export default function TotpCodeDisplay({ id, serviceName, accountName, encryptedSecret, onDelete }: TotpCodeDisplayProps) {
    const [code, setCode] = useState('------');
    const [timeLeft, setTimeLeft] = useState(0);
    const [counter, setCounter] = useState(0);

    const generateCode = async () => {
        try {
            const config = decryptConfig(encryptedSecret);
            let newToken;

            if (config.type === 'hotp') {
                if (counter === 0) {
                    const { data, error } = await supabase.from('authenticator_secrets').select('counter').eq('id', id).single();
                    if (error) throw error;
                    setCounter(data.counter || 0);
                }
                newToken = hotp.generate(config.secret, counter);
            } else {
                authenticator.options = {
                    algorithm: config.algorithm.toLowerCase() as 'sha1' | 'sha256' | 'sha512',
                    digits: config.digits,
                    period: config.period,
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
        generateCode();
        const timer = setInterval(() => {
            try {
                const config = decryptConfig(encryptedSecret);
                if (config.type === 'totp') {
                    authenticator.options = {
                        algorithm: config.algorithm.toLowerCase() as 'sha1' | 'sha256' | 'sha512',
                        digits: config.digits,
                        period: config.period,
                    };
                    const timeRemaining = authenticator.timeRemaining();
                    if (timeRemaining === authenticator.options.period || timeRemaining === 1) {
                        generateCode();
                    }
                    setTimeLeft(timeRemaining);
                }
            } catch (e) {
                // Do nothing, let the error be handled by generateCode
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [encryptedSecret, code]);

    const handleRefresh = async () => {
        const config = decryptConfig(encryptedSecret);
        if (config.type === 'hotp') {
            const newCounter = counter + 1;
            setCounter(newCounter);
            const { error } = await supabase.from('authenticator_secrets').update({ counter: newCounter }).eq('id', id);
            if (error) console.error('Failed to update counter:', error);
            hotp.options = {
                 algorithm: config.algorithm.toLowerCase() as 'sha1' | 'sha256' | 'sha512',
                 digits: config.digits
            };
            setCode(hotp.generate(config.secret, newCounter));
        } else {
            generateCode();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        // Use custom modal instead of alert
    };

    return (
        <motion.div
            className="flex flex-col items-center p-2 border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="flex items-center space-x-2 mb-1">
                <i className={`${getServiceIcon(serviceName)} text-xl text-gray-400`}></i>
                <div>
                    <h3 className="text-sm font-semibold text-gray-100">{accountName}</h3>
                    <p className="text-xs text-gray-400">{serviceName}</p>
                </div>
            </div>

            <div className="my-1 text-center">
                <motion.h4
                    key={code}
                    className="text-2xl font-extrabold text-blue-400 tracking-wider font-mono"
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {code}
                </motion.h4>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-400">
                <motion.div
                    className="relative w-16 h-1 bg-gray-700 rounded-full overflow-hidden"
                >
                    <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(timeLeft / (authenticator.options.period || 30)) * 100}%` }}
                        transition={{ duration: timeLeft, ease: "linear" }}
                    />
                </motion.div>
                <p>{timeLeft}s</p>
            </div>

            <div className="flex space-x-2 mt-2 text-white">
                <motion.button
                    onClick={handleRefresh}
                    whileHover={{ scale: 1.1 }}
                    className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                >
                    <RefreshCcw size={16} />
                </motion.button>
                <motion.button
                    onClick={handleCopy}
                    whileHover={{ scale: 1.1 }}
                    className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                >
                    <Copy size={16} />
                </motion.button>
                <motion.button
                    onClick={() => onDelete(id)}
                    whileHover={{ scale: 1.1 }}
                    className="p-1 rounded-full bg-red-600 hover:bg-red-700 transition"
                >
                    <Trash2 size={16} />
                </motion.button>
            </div>
        </motion.div>
    );
}