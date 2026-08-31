import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loginUser, loginWithGoogle, registerUser } from '../lib/auth';

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function getPasswordStrength(value: string) {
    if (!value) return { label: 'Enter a password', color: 'text-slate-400' };
    if (value.length < 8) return { label: 'Too short', color: 'text-amber-400' };
    if (value.length >= 12 && /[A-Z]/.test(value) && /[0-9]/.test(value)) return { label: 'Strong', color: 'text-emerald-400' };
    return { label: 'Good', color: 'text-cyan-400' };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginUser(email, password);
      } else {
        if (password.length < 8) {
          throw new Error('Use at least 8 characters for your password.');
        }
        await registerUser(name, email, password);
      }
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.07] p-6 shadow-[0_8px_40px_rgba(2,6,23,0.45)] backdrop-blur-2xl ring-1 ring-inset ring-white/10"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <div className="pointer-events-none absolute -left-1/3 -top-1/2 h-[140%] w-2/3 rotate-12 bg-gradient-to-br from-white/[0.15] via-white/[0.02] to-transparent blur-2xl" />
        <div className="relative">
        <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
          <ArrowLeft size={16} />
          Back to weather
        </Link>
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Secure access</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Skypulse weather</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to save your searches, history, and weather preferences.</p>
        </div>

        <div className="mb-4 flex rounded-full border border-white/15 bg-white/[0.06] p-1 backdrop-blur-md">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 rounded-full px-3 py-2 text-sm transition ${mode === 'login' ? 'bg-cyan-400/20 text-cyan-200 shadow-[0_4px_16px_rgba(56,189,248,0.2)]' : 'text-slate-300'}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 rounded-full px-3 py-2 text-sm transition ${mode === 'register' ? 'bg-cyan-400/20 text-cyan-200 shadow-[0_4px_16px_rgba(56,189,248,0.2)]' : 'text-slate-300'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' ? (
            <label className="flex items-center gap-3 rounded-[1rem] border border-white/15 bg-white/[0.06] px-3 py-3 text-sm text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-md">
              <User size={16} className="text-cyan-300" />
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" className="w-full bg-transparent outline-none" />
            </label>
          ) : null}

          <label className="flex items-center gap-3 rounded-[1rem] border border-white/15 bg-white/[0.06] px-3 py-3 text-sm text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-md">
            <Mail size={16} className="text-cyan-300" />
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full bg-transparent outline-none" />
          </label>

          <label className="flex items-center gap-3 rounded-[1rem] border border-white/15 bg-white/[0.06] px-3 py-3 text-sm text-slate-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-md">
            <Lock size={16} className="text-cyan-300" />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full bg-transparent outline-none" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 transition hover:text-white">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </label>

          {mode === 'register' ? (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className={`font-medium ${getPasswordStrength(password).color}`}>{getPasswordStrength(password).label}</span>
              <span>Use 8+ characters with a mix of numbers and symbols.</span>
            </div>
          ) : null}

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-[1rem] border border-white/20 bg-gradient-to-r from-cyan-400/90 to-sky-500/90 px-4 py-3 text-sm font-semibold text-slate-950 shadow-[0_8px_24px_rgba(56,189,248,0.35)] backdrop-blur-md transition hover:opacity-90 disabled:opacity-50">
            {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
          </button>

          <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-[1rem] border border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/[0.12] disabled:opacity-50">
            <Sparkles size={16} className="text-cyan-300" />
            Continue with Google
          </button>
        </form>
        </div>
      </motion.div>
    </div>
  );
}
