'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Minimum 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but failed to sign in');
      } else {
        router.push('/training');
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.03)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Invitation header */}
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
            Create your profile
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
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 pt-4 pb-3 bg-transparent border-0 border-b border-bone-faint/15 text-bone text-sm placeholder-bone-faint/30 focus:outline-none focus:border-bone-faint/40 transition-colors"
              placeholder="Name"
              disabled={loading}
            />
          </div>

          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 pt-4 pb-3 bg-transparent border-0 border-b border-bone-faint/15 text-bone text-sm placeholder-bone-faint/30 focus:outline-none focus:border-bone-faint/40 transition-colors"
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
              minLength={8}
              className="w-full px-3 pt-4 pb-3 bg-transparent border-0 border-b border-bone-faint/15 text-bone text-sm placeholder-bone-faint/30 focus:outline-none focus:border-bone-faint/40 transition-colors"
              placeholder="Password"
              disabled={loading}
            />
          </div>

          <div>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 pt-4 pb-3 bg-transparent border-0 border-b border-bone-faint/15 text-bone text-sm placeholder-bone-faint/30 focus:outline-none focus:border-bone-faint/40 transition-colors"
              placeholder="Confirm password"
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
            {loading ? 'Initiating...' : 'Begin'}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.div
          className="mt-16 text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
        >
          <p className="text-bone-faint/40 text-xs">
            Already have a profile?{' '}
            <Link href="/auth/signin" className="text-bone-faint/60 hover:text-bone-muted transition-colors duration-300">
              Enter
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
