// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Image from 'next/image'
import TotpCodeDisplay from '@/components/TotpCodeDisplay'
import AddSecretForm from '@/components/AddSecretForm'
import ChangelogModal from '@/components/ChangelogModal'
import Footer from '@/components/Footer'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [secrets, setSecrets] = useState<any[]>([]);
  const router = useRouter()
  const CURRENT_VERSION = "1.0.11"; 

  const fetchSecrets = async () => {
    // Only fetch if user is not null to utilize RLS
    if (!user) return; 
    
    // setLoading(true); // Don't block UI for this smaller fetch
    const { data, error } = await supabase
        .from('authenticator_secrets')
        .select('*')
        .order('service_name', { ascending: true });
    
    if (error) {
        console.error('Error fetching secrets:', error);
    } else {
        setSecrets(data || []);
    }
    // setLoading(false);
  };

  useEffect(() => {
    async function checkUser() {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        router.push('/auth')
      } else {
        setUser(session.user)
        setLoading(false)
      }
    }
    checkUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/auth')
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
        }
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    if (!loading && user) {
        fetchSecrets();
    }
  }, [loading, user]); // Fetch secrets once user is loaded

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // Redirect handled by auth listener
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-tsun-bg text-white">
        <p className="text-2xl font-medium">Loading the Magic... 💫</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-tsun-bg text-white">
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-4">
        <h1 className="text-4xl font-extrabold flex items-center text-blue-400">
            {/* Replace with 3D Lock icon */}
            <Image src="/icons/lock-3d.png" alt="Lock Icon" width={32} height={32} className="w-8 h-8 mr-3"/>
            TSun-Authenticator
        </h1>
        <div className="flex items-center space-x-4">
            <ChangelogModal currentVersion={CURRENT_VERSION} />
            <motion.button 
                onClick={handleLogout} 
                className="text-red-400 hover:text-red-500 transition px-4 py-2 border border-red-400 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Logout
            </motion.button>
        </div>
      </header>

      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="grid md:grid-cols-3 gap-8"
      >
        <div className="md:col-span-2">
            <h2 className="text-3xl font-semibold mb-6">Your 2FA Accounts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {secrets.length > 0 ? (
                    secrets.map((secret) => (
                        <TotpCodeDisplay 
                            key={secret.id}
                            encryptedSecret={secret.encrypted_secret}
                            serviceName={secret.service_name}
                        />
                    ))
                ) : (
                    <div className="glass-card col-span-full p-8 text-center rounded-xl shadow-inner">
                        <p className="text-gray-400 text-xl">No accounts yet. Add your first 2FA secret on the right. 🔑</p>
                    </div>
                )}
            </div>
        </div>
        <div>
            <h2 className="text-3xl font-semibold mb-6">Add New Account</h2>
            <AddSecretForm onSecretAdded={fetchSecrets} />
        </div>
      </motion.main>
      
      <Footer />
    </div>
  )
}