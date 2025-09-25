'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let error: any = null;
    if (isLogin) {
        const result = await supabase.auth.signInWithPassword({ email, password });
        error = result.error;
    } else {
        const result = await supabase.auth.signUp({ email, password });
        error = result.error;
    }
    
    if (error) {
      alert(error.message)
    } else if (isLogin) {
      router.push('/dashboard') 
    } else {
      alert('Sign up successful! Check your email for the verification link! 🎉')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tsun-bg text-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 rounded-xl shadow-2xl w-full max-w-sm"
      >
        <div className="flex justify-center mb-6">
             {/* Replace with your 3D icon */}
             <Image src="/public/icons/lock-3d.png" alt="Lock Icon" width={60} height={60} className="w-16 h-16"/> 
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">TSun Authenticator</h2>
        
        <form onSubmit={handleAuth}>
          {/* ... (Email and Password inputs, same as before) */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800/70 border border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800/70 border border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>

          <motion.button 
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login 🔑' : 'Sign Up ✨')}
          </motion.button>
        </form>
        
        <p className="mt-6 text-center text-sm">
          {isLogin ? 'New user?' : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:underline ml-2 transition-colors">
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}