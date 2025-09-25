// components/AddSecretForm.tsx
'use client'

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { encryptSecret } from '@/lib/crypto';
import { motion } from 'framer-motion';
// Icons8 3D Icons jaisa feel dene ke liye temporary icons
import { QrCodeIcon, KeyIcon } from 'lucide-react'; 
import dynamic from 'next/dynamic';

// react-qr-reader ko dynamic import karen taake SSR mein issue na ho
const QrReader = dynamic(() => import('react-qr-reader').then((mod) => mod.QrReader), {
    ssr: false,
    loading: () => <p className="text-gray-400">Loading Scanner...</p>
});

interface AddSecretFormProps {
    onSecretAdded: () => void; // Jab secret add ho jaye, toh dashboard refresh karne ke liye callback
}

export default function AddSecretForm({ onSecretAdded }: AddSecretFormProps) {
    const [view, setView] = useState<'form' | 'scanner'>('form');
    const [serviceName, setServiceName] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [loading, setLoading] = useState(false);

    // Function to parse the secret key from the QR code URL
    const parseSecretFromUrl = (url: string) => {
        try {
            const urlObj = new URL(url);
            // OTP URL format: otpauth://totp/ServiceName:User?secret=KEY&...
            const secret = urlObj.searchParams.get('secret');
            const pathParts = urlObj.pathname.split('/');
            const namePart = pathParts[pathParts.length - 1]; // "ServiceName:User"
            
            const name = namePart.split(':')[0].trim();
            return { secret, name };
        } catch (e) {
            console.error("Invalid QR Code URL:", e);
            return { secret: null, name: null };
        }
    };

    // QR Code Scan Result Handler
    const handleScan = (result: any) => {
        if (result) {
            const { secret, name } = parseSecretFromUrl(result?.text);
            if (secret && name) {
                setSecretKey(secret);
                setServiceName(name);
                setView('form'); // Form view par wapis le jaen taake user confirm kar sake
                // Optional: Yahan direct store bhi kar sakte hain
            } else {
                 alert('Error: Invalid QR code format. Please use a standard TOTP QR.');
            }
        }
    };

    // Form Submit Handler (Manual Entry & Scanner Result)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 1. Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Error: User not logged in.');
            setLoading(false);
            return;
        }

        // 2. Encrypt the secret key
        const encryptedSecret = encryptSecret(secretKey.trim());
        
        // 3. Store in Supabase
        const { error } = await supabase
            .from('authenticator_secrets')
            .insert([
                { 
                    user_id: user.id, // RLS will check this!
                    service_name: serviceName.trim(),
                    encrypted_secret: encryptedSecret 
                },
            ]);

        if (error) {
            alert('Error saving secret: ' + error.message);
        } else {
            alert('Account added successfully! 🎉');
            setServiceName('');
            setSecretKey('');
            setView('form');
            onSecretAdded(); // Dashboard ko refresh karne ke liye
        }
        setLoading(false);
    };


    return (
        <div className="p-4 rounded-xl shadow-inner bg-gray-800/50">
            <div className="flex justify-around mb-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setView('form')}
                    className={`flex items-center p-2 rounded-lg transition ${view === 'form' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <KeyIcon className="w-5 h-5 mr-2" /> Manual Entry
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setView('scanner')}
                    className={`flex items-center p-2 rounded-lg transition ${view === 'scanner' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                >
                    <QrCodeIcon className="w-5 h-5 mr-2" /> QR Scanner
                </motion.button>
            </div>

            {view === 'form' ? (
                <motion.form 
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    <input
                        type="text"
                        placeholder="Service Name (e.g., GitHub, Vercel)"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <textarea
                        placeholder="Secret Key (Base32 format)"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        required
                    />
                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Add Account Securely 🔒'}
                    </motion.button>
                </motion.form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center items-center h-full min-h-[300px] p-2"
                >
                    <QrReader
                        onResult={handleScan}
                        scanDelay={300}
                        constraints={{ facingMode: 'environment' }} // Mobile pe back camera use kare
                        videoContainerStyle={{ padding: '0px' }}
                        videoStyle={{ borderRadius: '0.75rem' }}
                    />
                </motion.div>
            )}
        </div>
    );
}