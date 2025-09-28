'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-primary p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="relative w-full max-w-4xl h-[550px] grid grid-cols-1 md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden glass-card"
      >
        {/* Left Panel - Form */}
        <div className="p-8 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h2 className="text-4xl font-bold text-text-dark mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-text-light mb-8">{isLogin ? 'Login to access your 2FA codes.' : 'Join us to secure your accounts.'}</p>
          </motion.div>
          
          <form onSubmit={handleAuth}>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="relative mb-4">
              <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-text-light" size={20}/>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg bg-secondary/40 border-2 border-transparent focus:border-highlight focus:ring-0 transition-all text-text-main placeholder-text-light"
                placeholder="Email"
                required
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="relative mb-6">
              <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-text-light" size={20}/>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg bg-secondary/40 border-2 border-transparent focus:border-highlight focus:ring-0 transition-all text-text-main placeholder-text-light"
                placeholder="Password"
                required
              />
            </motion.div>

            <motion.button 
              type="submit"
              whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.8 }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-highlight to-accent text-white font-bold flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
              ) : (
                isLogin ? <><LogIn size={20}/> Login</> : <><UserPlus size={20}/> Sign Up</>
              )}
            </motion.button>
          </form>
          
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1 }} className="mt-6 text-center text-sm text-text-light">
            {isLogin ? 'New to TSun?' : 'Already have an account?'}
            <button onClick={() => setIsLogin(!isLogin)} className="text-highlight hover:underline ml-2 font-semibold">
              {isLogin ? 'Create an account' : 'Log in'}
            </button>
          </motion.p>
        </div>

        {/* Right Panel - Art */}
        <div className="hidden md:flex items-center justify-center p-8 relative overflow-hidden bg-gradient-to-br from-accent to-highlight">
            <motion.div 
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 100, delay: 0.3 }}
              className="text-center text-white"
            >
                <div className="relative w-64 h-64 flex items-center justify-center">
                    <div className="absolute w-full h-full bg-white/10 rounded-full animate-pulse"></div>
                    <div className="absolute w-48 h-48 bg-white/20 rounded-full animate-pulse [animation-delay:-1s]"></div>
                    <div className="z-10">
                      <h3 className="text-3xl font-extrabold tracking-tight">TSun Auth</h3>
                      <p className="text-lg mt-2 font-light">Your Security, Reimagined.</p>
                    </div>
                </div>
            </motion.div>
            {/* Abstract shapes */}
            <motion.div className="absolute top-10 left-10 w-24 h-24 bg-white/5 rounded-full filter blur-xl" animate={{ x: [0, 20, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}></motion.div>
            <motion.div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-2xl filter blur-xl" animate={{ x: [0, -20, 0], y: [0, 20, 0] }} transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse' }}></motion.div>
            <motion.div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/10 rounded-full filter blur-2xl -translate-x-1/2 -translate-y-1/2" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}></motion.div>
        </div>
      </motion.div>
    </div>
  )
}
