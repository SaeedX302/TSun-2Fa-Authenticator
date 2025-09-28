// components/BackupRestore.tsx
'use client'

import React, { useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Upload, Download } from 'lucide-react';
import { encryptConfig, decryptConfig } from '@/lib/crypto';

interface BackupRestoreProps {
    onRestore: () => void;
}

export default function BackupRestore({ onRestore }: BackupRestoreProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleBackup = async () => {
        if (!password) {
            setError('Please enter a password for the backup.');
            return;
        }

        setLoading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to backup your accounts.');
            setLoading(false);
            return;
        }

        const { data, error: fetchError } = await supabase
            .from('authenticator_secrets')
            .select('*')
            .eq('user_id', user.id);

        if (fetchError) {
            alert('Failed to fetch data for backup.');
            console.error(fetchError);
            setLoading(false);
            return;
        }

        try {
            const encryptedBackup = await encryptConfig({ secrets: data }, password);
            const blob = new Blob([encryptedBackup], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `TSun-Auth-Encrypted-${date}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('Encrypted backup file downloaded successfully!');
        } catch (e) {
            alert('Failed to encrypt backup.');
            console.error(e);
        }

        setLoading(false);
    };

    const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!password) {
            setError('Please enter the password for the backup file.');
            return;
        }

        setLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const fileContent = e.target?.result as string;
                const decryptedData = await decryptConfig(fileContent, password);

                if (!decryptedData || !Array.isArray((decryptedData as any).secrets)) {
                    throw new Error('Invalid file format or incorrect password.');
                }

                const restoredAccounts = (decryptedData as any).secrets;

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    alert('Please log in to restore accounts.');
                    setLoading(false);
                    return;
                }

                // Delete existing accounts to avoid duplicates
                await supabase.from('authenticator_secrets').delete().eq('user_id', user.id);

                // Insert restored accounts
                const secretsToInsert = restoredAccounts.map((acc: any) => ({
                    ...acc,
                    user_id: user.id,
                    id: undefined // Let Supabase generate a new ID
                }));

                const { error: insertError } = await supabase.from('authenticator_secrets').insert(secretsToInsert);

                if (insertError) {
                    alert('Error restoring accounts: ' + insertError.message);
                } else {
                    alert('Accounts restored successfully! 🎉');
                    onRestore(); // Refresh dashboard data
                }

            } catch (e: any) {
                alert('Error restoring file. Please ensure it is a valid TSun-Auth backup file and the password is correct.');
                console.error('Restore error:', e);
            }
            setLoading(false);
        };
        reader.readAsText(file);
    };

    return (
        <motion.div
            className="glass-card p-6 rounded-xl shadow-2xl w-full max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-xl font-bold mb-4 text-text-dark">Backup & Restore</h3>
            <p className="text-text-light mb-6">Encrypt and backup your accounts to a local file or restore from a previously created backup.</p>
            
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a strong password for encryption"
                className="w-full p-2 rounded-lg bg-secondary/50 text-text-main border-none focus:outline-none focus:ring-2 focus:ring-highlight transition mb-4"
            />

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.button
                    onClick={handleBackup}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-lg bg-accent text-text-dark font-semibold hover:bg-highlight transition-colors shadow-lg flex items-center justify-center"
                >
                    <Download size={20} className="mr-2" />
                    {loading ? 'Backing up...' : 'Backup Accounts'}
                </motion.button>
                <input
                    type="file"
                    accept=".txt"
                    onChange={handleRestore}
                    className="hidden"
                    ref={fileInputRef}
                />
                <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-lg bg-accent text-text-dark font-semibold hover:bg-highlight transition-colors shadow-lg flex items-center justify-center"
                >
                    <Upload size={20} className="mr-2" />
                    {loading ? 'Restoring...' : 'Restore Accounts'}
                </motion.button>
            </div>
        </motion.div>
    );
}
