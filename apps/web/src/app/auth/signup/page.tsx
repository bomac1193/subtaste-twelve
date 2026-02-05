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

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
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

      // Auto sign in after successful signup
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but failed to sign in');
      } else {
        router.push('/training'); // Start with training
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="container-sm page-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl text-bone mb-2 tracking-tight">
              CREATE ACCOUNT
            </h1>
            <p className="text-bone-faint text-sm">
              Begin your taste profiling journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-bone-muted text-sm mb-2"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded bg-void-lighter border border-bone-faint/20 text-bone placeholder-bone-faint/40 focus:outline-none focus:border-bone-faint/40 transition-colors"
                placeholder="Your name"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-bone-muted text-sm mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded bg-void-lighter border border-bone-faint/20 text-bone placeholder-bone-faint/40 focus:outline-none focus:border-bone-faint/40 transition-colors"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-bone-muted text-sm mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded bg-void-lighter border border-bone-faint/20 text-bone placeholder-bone-faint/40 focus:outline-none focus:border-bone-faint/40 transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
              <p className="text-bone-faint text-xs mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-bone-muted text-sm mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded bg-void-lighter border border-bone-faint/20 text-bone placeholder-bone-faint/40 focus:outline-none focus:border-bone-faint/40 transition-colors"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-state-error text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-bone-faint text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-bone hover:text-bone-muted transition-colors">
              Sign in
            </Link>
          </p>

          {/* Home Link */}
          <p className="text-center mt-4">
            <Link href="/" className="text-bone-faint text-xs hover:text-bone-muted transition-colors">
              ← Back to home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
