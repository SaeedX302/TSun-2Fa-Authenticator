// components/Dashboard.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, PlusCircle, Info, File, DownloadCloud, UploadCloud, XCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import AddSecretForm from '@/components/AddSecretForm';
import TOTPDisplay from '@/components/TotpCodeDisplay';
import BackupRestore from './BackupRestore';
import Link from 'next/link';
import ChangelogModal from './ChangelogModal'; // Corrected import
import { getServiceIcon } from '@/utils/iconMapping';

interface Secret {
    id: string;
    service_name: string;
    account_name: string;
    encrypted_secret: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [secrets, setSecrets] = useState<Secret[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('dashboard');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [secretToDelete, setSecretToDelete] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const currentVersion = "1.2.0"; // Example version

    const getSecrets = async () => {
        setLoading(true);
        const { data: { user } = {} } = await supabase.auth.getUser();

        if (!user) {
            router.push('/auth');
            return;
        }

        const { data, error } = await supabase
            .from('authenticator_secrets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching secrets:', error);
        } else {
            setSecrets(data as Secret[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        getSecrets();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth');
    };

    const handleDeleteClick = (secretId: string) => {
        setSecretToDelete(secretId);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!secretToDelete) return;

        const { error } = await supabase
            .from('authenticator_secrets')
            .delete()
            .eq('id', secretToDelete);

        if (error) {
            console.error('Error deleting secret:', error);
        } else {
            setSecrets(secrets.filter(secret => secret.id !== secretToDelete));
        }

        setShowDeleteModal(false);
        setSecretToDelete(null);
    };
    
    const filteredSecrets = secrets.filter(secret =>
        secret.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        secret.service_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-primary text-text-main p-4 sm:p-8 relative">
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <motion.div
                    className="flex items-center mb-4 sm:mb-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Image src="/icons/lock-3d.png" alt="TSun-Authenticator" width={48} height={48} className="mr-3" />
                    <h1 className="text-3xl font-bold tracking-tight text-text-dark">TSun-Authenticator</h1>
                </motion.div>

                <div className="flex items-center space-x-2 sm:space-x-4">
                    <ChangelogModal currentVersion={currentVersion} />
                    <motion.button
                        onClick={() => setView('add')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center p-2 rounded-full bg-accent hover:bg-highlight transition-colors shadow-lg"
                    >
                        <PlusCircle size={20} />
                    </motion.button>
                    <motion.button
                        onClick={() => setView('backup')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center p-2 rounded-full bg-accent hover:bg-highlight transition-colors shadow-lg"
                    >
                        <UploadCloud size={20} />
                    </motion.button>
                    <motion.button
                        onClick={handleLogout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 rounded-full bg-accent hover:bg-highlight transition-colors shadow-lg"
                    >
                        <LogOut size={20} />
                    </motion.button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {view === 'add' ? (
                    <motion.div
                        key="add-form"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="py-8"
                    >
                        <AddSecretForm onSecretAdded={() => { getSecrets(); setView('dashboard'); }} />
                    </motion.div>
                ) : view === 'backup' ? (
                    <motion.div
                        key="backup-restore"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5 }}
                        className="py-8"
                    >
                        <BackupRestore onRestore={() => { getSecrets(); setView('dashboard'); }} />
                    </motion.div>
                ) : (
                    <motion.main
                        key="dashboard"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.5 }}
                        className="py-8"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold mb-4 sm:mb-0 text-text-dark">Your 2FA Accounts</h2>
                            <div className="w-full sm:w-auto">
                                <div className="relative">
                                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-light"></i>
                                    <input
                                        type="text"
                                        placeholder="Search accounts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-full bg-secondary/50 text-text-main border border-accent/30 focus:outline-none focus:ring-2 focus:ring-highlight transition"
                                    />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <motion.p className="text-center text-text-light"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                Loading accounts...
                            </motion.p>
                        ) : filteredSecrets.length === 0 ? (
                            <motion.div
                                className="text-center p-8 glass-card rounded-xl"
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                            >
                                <p className="text-text-light text-lg">
                                    {searchTerm
                                        ? `No accounts found for \"${searchTerm}\".`
                                        : "You haven't added any accounts yet. Click the + button to get started!"}
                                </p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredSecrets.map(secret => (
                                    <TOTPDisplay
                                        key={secret.id}
                                        id={secret.id}
                                        serviceName={secret.service_name}
                                        accountName={secret.account_name}
                                        encryptedSecret={secret.encrypted_secret}
                                        deleteSecret={handleDeleteClick}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.main>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="glass-card p-8 rounded-xl shadow-lg border border-red-500/50 w-full max-w-sm text-center"
                            initial={{ scale: 0.8, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                        >
                            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2 text-text-dark">Are you sure?</h3>
                            <p className="text-text-light mb-6">This action cannot be undone.</p>
                            <div className="flex justify-center space-x-4">
                                <motion.button
                                    onClick={handleDelete} 
                                    whileHover={{ scale: 1.05 }}
                                    className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-white"
                                >
                                    <CheckCircle size={20} className="inline-block mr-2" /> Yes, Delete
                                </motion.button>
                                <motion.button
                                    onClick={() => setShowDeleteModal(false)}
                                    whileHover={{ scale: 1.05 }}
                                    className="px-6 py-2 rounded-lg bg-secondary hover:bg-accent font-semibold text-text-dark"
                                >
                                    No, Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <footer className="mt-8 pt-4 border-t border-accent/30 text-center text-text-light text-sm">
                <p>&copy; 2024 TSun-Authenticator. All rights reserved.</p>
                <div className="flex justify-center space-x-4 mt-2">
                    <Link href="https://github.com/SaeedX302" target="_blank" className="hover:text-text-dark transition-colors">
                        <i className="fab fa-github fa-2x"></i>
                    </Link>
                    <Link href="https://www.tiktok.com/@saeedxdie" target="_blank" className="hover:text-text-dark transition-colors">
                        <i className="fab fa-tiktok fa-2x"></i>
                    </Link>
                    <Link href="https://linktr.ee/saeedxdie" target="_blank" className="hover:text-text-dark transition-colors">
                        <i className="fas fa-link fa-2x"></i>
                    </Link>
                    <Link href="https://gravatar.com/cheerfuld27b01881a" target="_blank" className="hover:text-text-dark transition-colors">
                        <i className="fas fa-user-circle fa-2x"></i>
                    </Link>
                </div>
            </footer>
        </div>
    );
}
