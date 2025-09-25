// components/AddSecretForm.tsx
'use client'

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { encryptConfig } from '@/lib/crypto';
import { getServiceIcon, supportedServices } from '@/utils/iconMapping';

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

        const encryptedSecret = encryptConfig(secretConfig);

        const { data, error } = await supabase
            .from('authenticator_secrets')
            .insert([
                {
                    user_id: user.id,
                    service_name: serviceName,
                    account_name: accountName,
                    encrypted_secret: encryptedSecret,
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
            className="flex flex-col p-6 rounded-xl bg-gray-800/50 backdrop-blur-lg shadow-2xl space-y-4 max-w-lg mx-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-2xl font-bold text-center text-gray-200">Add New 2FA Account</h2>

            <div className="relative">
                <div className="flex items-center space-x-2">
                    <i className={`${getServiceIcon(serviceName)} text-xl text-gray-400`}></i>
                    <input
                        type="text"
                        value={serviceName}
                        onChange={handleServiceChange}
                        placeholder="Service Name (e.g., Google, GitHub)"
                        className="w-full p-2 rounded-lg bg-gray-700 text-gray-200 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                </div>
                {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-gray-700 rounded-b-lg shadow-lg z-10 max-h-40 overflow-y-auto mt-1">
                        {suggestions.map((name, index) => (
                            <div
                                key={index}
                                onClick={() => handleSuggestionClick(name)}
                                className="flex items-center p-2 hover:bg-gray-600 cursor-pointer transition-colors"
                            >
                                <i className={`${getServiceIcon(name)} mr-2 text-gray-400`}></i>
                                <span className="text-gray-200">{name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account Name (e.g., saeed@gmail.com)"
                className="w-full p-2 rounded-lg bg-gray-700 text-gray-200 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
            />
            <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="2FA Secret Key"
                className="w-full p-2 rounded-lg bg-gray-700 text-gray-200 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
            />

            <div className="flex space-x-4">
                <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">Algorithm</label>
                    <select
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="SHA1">SHA1</option>
                        <option value="SHA256">SHA256</option>
                        <option value="SHA512">SHA512</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">Digits</label>
                    <select
                        value={digits}
                        onChange={(e) => setDigits(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="6">6</option>
                        <option value="8">8</option>
                    </select>
                </div>
            </div>

            <div className="flex space-x-4">
                <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">Period</label>
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="30">30s</option>
                        <option value="60">60s</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-sm text-gray-400 block mb-1">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full p-2 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className={`w-full p-3 rounded-lg font-bold transition ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {loading ? 'Adding...' : 'Add Account'}
            </motion.button>
        </motion.form>
    );
}
