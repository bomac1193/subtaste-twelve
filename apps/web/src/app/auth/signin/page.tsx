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
        setError('Invalid email or password');
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
              SIGN IN
            </h1>
            <p className="text-bone-faint text-sm">
              Access your taste genome
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-bone-faint/20" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-void px-2 text-bone-faint">OR</span>
            </div>
          </div>

          {/* Google Sign In */}
          {process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED && (
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full btn btn-secondary"
            >
              Continue with Google
            </button>
          )}

          {/* Sign Up Link */}
          <p className="text-center text-bone-faint text-sm mt-6">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-bone hover:text-bone-muted transition-colors">
              Sign up
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
