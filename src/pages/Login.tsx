import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Lock, User, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoadingSubmit(true);
    try {
      await login(username.trim());
      navigate(from, { replace: true });
    } catch (err) {
      setError('Failed to login. Please try again.');
    } finally {
      setIsLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 m-4">
        {/* Logo/Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
            <TrendingUp className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome to FXJournal</h1>
          <p className="text-sm text-slate-400 mt-1">Advanced Forex Journal & Analytics Platform</p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                disabled={isLoadingSubmit}
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">You can type any username to enter the demo.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all"
                disabled={isLoadingSubmit}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoadingSubmit}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 mt-6"
          >
            {isLoadingSubmit ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <span>Access Journal</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-800/60 mt-8 pt-4 flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500">
            Secure client-side storage. Data remains on this browser.
          </p>
          <div className="flex gap-4 mt-2">
            <span className="text-xs text-slate-600 font-mono bg-slate-950 px-2 py-0.5 rounded">v1.0.0</span>
            <span className="text-xs text-slate-600 font-mono bg-slate-950 px-2 py-0.5 rounded">React 19 + Vite</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
