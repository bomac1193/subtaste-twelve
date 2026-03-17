'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Sigil mark */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <motion.div
            className="text-bone-faint/20 text-6xl font-display mb-8 select-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            XII
          </motion.div>
          <motion.p
            className="text-bone-faint/50 text-xs tracking-[0.3em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Return to your profile
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-0 pt-4 pb-3 bg-transparent border-0 border-b border-bone-faint/15 text-bone text-sm placeholder-bone-faint/30 focus:outline-none focus:border-bone-faint/40 transition-colors"
              placeholder="Email"
              disabled={loading}
            />
          </div>

          <div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-0 pt-4 pb-3 bg-transparent border-0 border-b border-bone-faint/15 text-bone text-sm placeholder-bone-faint/30 focus:outline-none focus:border-bone-faint/40 transition-colors"
              placeholder="Password"
              disabled={loading}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-ember/70 text-xs text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs tracking-[0.2em] uppercase text-void bg-bone hover:bg-bone/90 transition-all duration-300 disabled:opacity-40"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Entering...' : 'Enter'}
          </motion.button>
        </motion.form>

        {/* Google OAuth */}
        {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-bone-faint/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-void px-4 text-bone-faint/30 text-[10px] tracking-[0.2em] uppercase">or</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 text-xs tracking-[0.15em] text-bone-faint border border-bone-faint/10 hover:border-bone-faint/25 hover:text-bone-muted transition-all duration-300"
            >
              Continue with Google
            </button>
          </motion.div>
        )}

        {/* Footer links */}
        <motion.div
          className="mt-16 text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          <p className="text-bone-faint/40 text-xs">
            No profile yet?{' '}
            <Link href="/auth/signup" className="text-bone-faint/60 hover:text-bone-muted transition-colors duration-300">
              Begin
            </Link>
          </p>
          <p>
            <Link href="/" className="text-bone-faint/25 text-[10px] tracking-[0.15em] hover:text-bone-faint/50 transition-colors duration-300">
              The Twelve
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
