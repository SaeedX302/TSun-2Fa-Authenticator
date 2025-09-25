// components/BackupRestore.tsx
'use client'

import React, { useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Upload, Download } from 'lucide-react';

interface BackupRestoreProps {
    onRestore: () => void;
}

export default function BackupRestore({ onRestore }: BackupRestoreProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleBackup = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Please log in to backup your accounts.');
            return;
        }

        const { data, error } = await supabase
            .from('authenticator_secrets')
            .select('*')
            .eq('user_id', user.id);

        if (error) {
            alert('Failed to fetch data for backup.');
            console.error(error);
            return;
        }

        const backupData = JSON.stringify(data, null, 2);
        const blob = new Blob([backupData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `TSun-Auth-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Backup file downloaded successfully!');
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.name.startsWith('TSun-Auth') && file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const fileContent = e.target?.result;
                    const restoredAccounts = JSON.parse(fileContent as string);

                    if (!Array.isArray(restoredAccounts)) {
                        throw new Error('Invalid file format.');
                    }

                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        alert('Please log in to restore accounts.');
                        return;
                    }

                    // Delete existing accounts to avoid duplicates
                    await supabase.from('authenticator_secrets').delete().eq('user_id', user.id);

                    // Insert restored accounts
                    const secretsToInsert = restoredAccounts.map(acc => ({
                        ...acc,
                        user_id: user.id,
                        id: undefined // Let Supabase generate a new ID
                    }));

                    const { error } = await supabase.from('authenticator_secrets').insert(secretsToInsert);

                    if (error) {
                        alert('Error restoring accounts: ' + error.message);
                    } else {
                        alert('Accounts restored successfully! 🎉');
                        onRestore(); // Refresh dashboard data
                    }

                } catch (e: any) {
                    alert('Error restoring file. Please ensure it is a valid TSun-Auth JSON file.');
                    console.error('Restore error:', e);
                }
            };
            reader.readAsText(file);
        } else {
            alert('This is not a valid TSun-Auth backup file. File name must be TSun-Auth-{date}.json');
        }
    };

    return (
        <motion.div
            className="glass-card p-6 rounded-xl shadow-2xl w-full max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-xl font-bold mb-4">Backup & Restore</h3>
            <p className="text-gray-400 mb-6">Backup your accounts to a local file or restore from a previously created backup file.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.button
                    onClick={handleBackup}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-lg flex items-center justify-center"
                >
                    <Download size={20} className="mr-2" />
                    Backup Accounts
                </motion.button>
                <input
                    type="file"
                    accept=".json"
                    onChange={handleRestore}
                    className="hidden"
                    ref={fileInputRef}
                />
                <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center"
                >
                    <Upload size={20} className="mr-2" />
                    Restore Accounts
                </motion.button>
            </div>
        </motion.div>
    );
}
