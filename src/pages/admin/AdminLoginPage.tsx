import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { ShieldCheck, Lock, User, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ username, password });
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify administrative credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-primary filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500 filter blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img src="/sbu-emblem.png" alt="SBU Logo" className="w-16 h-16 rounded-full mx-auto shadow-md object-contain bg-white p-1 border border-amber-500/30" />
          </Link>
          <h2 className="text-2xl font-bold font-serif text-white tracking-tight">
            Administrative Control Center
          </h2>
          <p className="text-xs text-stone-400">
            {settings?.university_name || "Sarala Birla University, Ranchi"}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
          <div className="bg-stone-950/80 border border-stone-800 backdrop-blur-md py-8 px-6 sm:px-10 rounded-2xl shadow-2xl space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start space-x-2.5">
                <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-900 border border-stone-700 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary placeholder:text-stone-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Administrative Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-stone-900 border border-stone-700 text-white rounded-xl focus:outline-hidden focus:ring-2 focus:ring-brand-primary placeholder:text-stone-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-white bg-brand-primary hover:bg-stone-800 transition-all shadow-lg hover:shadow-brand-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <ShieldCheck size={16} />
                  <span>{submitting ? 'Verifying Credentials...' : 'Authenticate & Enter Admin Center'}</span>
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-stone-800 text-center space-y-2">
              <p className="text-[11px] text-stone-500">
                Authorized Personnel Only • IP & attempts logged for audit security.
              </p>
              <Link to="/" className="inline-flex items-center space-x-1 text-xs text-stone-400 hover:text-white pt-1">
                <ArrowLeft size={12} />
                <span>Return to Public SBU Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
