// components/AddSecretForm.tsx
'use client'

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getServiceIcon, supportedServices } from '@/utils/iconMapping';
import QrScanner from './QrScanner';
import { Camera } from 'lucide-react';

interface AddSecretFormProps {
    onSecretAdded: () => void;
}

export default function AddSecretForm({ onSecretAdded }: AddSecretFormProps) {
    const [secret, setSecret] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [accountName, setAccountName] = useState('');
    const [algorithm, setAlgorithm] = useState('SHA1');
    const [digits, setDigits] = useState('6');
    const [period, setPeriod] = useState('30');
    const [type, setType] = useState('totp');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showScanner, setShowScanner] = useState(false);
    const router = useRouter();

    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setServiceName(value);
        if (value.length > 0) {
            const filtered = supportedServices.filter(service =>
                service.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (name: string) => {
        setServiceName(name);
        setSuggestions([]);
    };

    const handleScanSuccess = (decoded: any) => {
        setSecret(decoded.secret);
        setServiceName(decoded.issuer || '');
        setAccountName(decoded.account || '');
        setAlgorithm(decoded.algorithm || 'SHA1');
        setDigits(String(decoded.digits) || '6');
        setPeriod(String(decoded.period) || '30');
        setType(decoded.type || 'totp');
        setShowScanner(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!secret || !serviceName || !accountName) {
            setError('Please fill out all fields.');
            setLoading(false);
            return;
        }

        const { data: { user } = {} } = await supabase.auth.getUser();

        if (!user) {
            router.push('/auth');
            return;
        }

        const secretConfig = {
            secret,
            serviceName,
            accountName,
            algorithm,
            digits: parseInt(digits),
            period: parseInt(period),
            type,
        };

        const { data, error } = await supabase
            .from('authenticator_secrets')
            .insert([
                {
                    user_id: user.id,
                    service_name: serviceName,
                    account_name: accountName,
                    encrypted_secret: JSON.stringify(secretConfig),
                },
            ])
            .select();

        if (error) {
            console.error('Error adding secret:', error);
            setError('Failed to add account. Please try again.');
        } else {
            onSecretAdded();
        }

        setLoading(false);
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="glass-card flex flex-col p-6 rounded-xl shadow-2xl space-y-4 max-w-lg mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-center text-text-dark">Add New 2FA Account</h2>
                <motion.button
                    type="button"
                    onClick={() => setShowScanner(!showScanner)}
                    whileHover={{ scale: 1.1 }}
                    className="p-2 rounded-full bg-accent hover:bg-highlight transition"
                >
                    <Camera size={20} />
                </motion.button>
            </div>

            {showScanner && <QrScanner onScanSuccess={handleScanSuccess} />}

            <div className="relative">
                <div className="flex items-center space-x-2">
                    {getServiceIcon(serviceName)}
                    <input
                        type="text"
                        value={serviceName}
                        onChange={handleServiceChange}
                        placeholder="Service Name (e.g., Google, GitHub)"
                        className="w-full p-2 rounded-lg bg-secondary/50 text-text-main border-none focus:outline-none focus:ring-2 focus:ring-highlight transition"
                        required
                    />
                </div>
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-secondary rounded-b-lg shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                        {suggestions.map((name, index) => (
                            <div
                                key={index}
                                onClick={() => handleSuggestionClick(name)}
                                className="flex items-center p-2 hover:bg-accent/50 cursor-pointer transition-colors"
                            >
                                {getServiceIcon(name)}
                                <span className="text-text-main ml-2">{name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account Name (e.g., user@example.com)"
                className="w-full p-2 rounded-lg bg-secondary/50 text-text-main border-none focus:outline-none focus:ring-2 focus:ring-highlight transition"
                required
            />
            <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="2FA Secret Key"
                className="w-full p-2 rounded-lg bg-secondary/50 text-text-main border-none focus:outline-none focus:ring-2 focus:ring-highlight transition"
                required
            />

            <div className="flex space-x-4">
                <div className="flex-1">
                    <label className="text-sm text-text-light block mb-1">Algorithm</label>
                    <select
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value)}
                        className="w-full p-2 rounded-lg bg-secondary/50 text-text-main focus:outline-none focus:ring-2 focus:ring-highlight"
                    >
                        <option value="SHA1">SHA1</option>
                        <option value="SHA256">SHA256</option>
                        <option value="SHA512">SHA512</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-sm text-text-light block mb-1">Digits</label>
                    <select
                        value={digits}
                        onChange={(e) => setDigits(e.target.value)}
                        className="w-full p-2 rounded-lg bg-secondary/50 text-text-main focus:outline-none focus:ring-2 focus:ring-highlight"
                    >
                        <option value="6">6</option>
                        <option value="8">8</option>
                    </select>
                </div>
            </div>

            <div className="flex space-x-4">
                <div className="flex-1">
                    <label className="text-sm text-text-light block mb-1">Period</label>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full p-2 rounded-lg bg-secondary/50 text-text-main focus:outline-none focus:ring-2 focus:ring-highlight"
                    >
                        <option value="30">30s</option>
                        <option value="60">60s</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-sm text-text-light block mb-1">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full p-2 rounded-lg bg-secondary/50 text-text-main focus:outline-none focus:ring-2 focus:ring-highlight"
                    >
                        <option value="totp">TOTP</option>
                        <option value="hotp">HOTP</option>
                    </select>
                </div>
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-center"
                >
                    {error}
                </motion.p>
            )}

            <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-3 rounded-lg font-bold transition ${loading ? 'bg-gray-500' : 'bg-accent hover:bg-highlight'}`}
            >
                {loading ? 'Adding...' : 'Add Account'}
            </motion.button>
        </motion.form>
    );
}
