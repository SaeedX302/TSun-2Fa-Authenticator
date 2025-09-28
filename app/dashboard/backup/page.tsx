'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { saveAs } from 'file-saver'

export default function BackupPage() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleExport = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/auth')
            return
        }

        const { data, error } = await supabase
            .from('authenticator_secrets')
            .select('encrypted_secret')
            .eq('user_id', user.id)

        if (error) {
            alert('Error exporting secrets: ' + error.message)
            setLoading(false)
            return
        }

        const secrets = data.map(row => JSON.parse(row.encrypted_secret))
        const blob = new Blob([JSON.stringify(secrets, null, 2)], { type: 'application/json' })
        saveAs(blob, 'tsun-authenticator-backup.json')
        setLoading(false)
    }

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true)
        const file = event.target.files?.[0]
        if (!file) {
            setLoading(false)
            return
        }

        const reader = new FileReader()
        reader.onload = async (e) => {
            const content = e.target?.result as string
            try {
                const secrets = JSON.parse(content)
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/auth')
                    return
                }

                const { error } = await supabase
                    .from('authenticator_secrets')
                    .insert(secrets.map((secret: any) => ({
                        user_id: user.id,
                        service_name: secret.serviceName,
                        account_name: secret.accountName,
                        encrypted_secret: JSON.stringify(secret)
                    })))

                if (error) {
                    alert('Error importing secrets: ' + error.message)
                } else {
                    alert('Secrets imported successfully!')
                    router.push('/dashboard')
                }
            } catch (error) {
                alert('Invalid backup file.')
            }
            setLoading(false)
        }
        reader.readAsText(file)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-primary text-text-main p-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-8 rounded-xl shadow-2xl w-full max-w-sm"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-text-dark">Backup & Restore</h2>
                <div className="space-y-4">
                    <motion.button
                        onClick={handleExport}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full py-3 rounded-lg bg-highlight text-white font-semibold hover:bg-accent transition-colors"
                        disabled={loading}
                    >
                        {loading ? 'Exporting...' : 'Export Secrets'}
                    </motion.button>
                    <div>
                        <label htmlFor="import-file" className="w-full py-3 rounded-lg bg-highlight text-white font-semibold hover:bg-accent transition-colors text-center block cursor-pointer">
                            Import Secrets
                        </label>
                        <input id="import-file" type="file" className="hidden" onChange={handleImport} accept=".json" />
                    </div>
                </div>
                <button onClick={() => router.push('/dashboard')} className="text-highlight hover:underline mt-6 text-center w-full">
                    Back to Dashboard
                </button>
            </motion.div>
        </div>
    )
}
