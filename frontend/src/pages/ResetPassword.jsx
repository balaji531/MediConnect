import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Lock, ShieldCheck, Activity, ArrowRight, AlertCircle } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Credential mismatch: Passwords do not align.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      setMessage(res.message || 'Credential override successful. Re-initializing access...');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to override credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bipsync-bg hex-bg px-4 py-20">
      <div className="w-full max-w-md glass-card border-white/5 p-10 relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-bipsync-emerald to-transparent"></div>
         <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
            <Lock size={180} />
         </div>

         <div className="flex flex-col items-center mb-10 relative z-10">
           <div className="w-16 h-16 rounded-2xl bg-bipsync-emerald/10 border border-bipsync-emerald/20 flex items-center justify-center text-bipsync-emerald mb-6 shadow-glow-emerald/10">
             <Lock size={30} />
           </div>
           <h1 className="text-2xl font-bold tracking-tight text-white mb-2 uppercase">Credential Reset</h1>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Initialize Secure Override</p>
         </div>

         <div className="relative z-10 space-y-6">
            {message && (
              <div className="bg-bipsync-emerald/10 border border-bipsync-emerald/20 text-bipsync-emerald p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <ShieldCheck size={16} /> {message}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-in shake duration-300">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">New Access Code</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  placeholder="••••••••"
                  className="w-full bg-bipsync-bg/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-bipsync-emerald/50 outline-none transition-all placeholder:text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Access Code</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  placeholder="••••••••"
                  className="w-full bg-bipsync-bg/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-bipsync-emerald/50 outline-none transition-all placeholder:text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-bipsync-primary py-4 mt-4 flex items-center justify-center gap-3 group !bg-bipsync-emerald !text-bipsync-bg !shadow-glow-emerald/20 disabled:opacity-50"
              >
                <span className="font-black tracking-[0.2em]">{loading ? 'INITIALIZING...' : 'COMMIT OVERRIDE'}</span>
                {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
         </div>

         <div className="mt-12 pt-6 border-t border-white/5 flex justify-center">
            <Link to="/login" className="text-[10px] font-bold text-slate-500 hover:text-bipsync-emerald uppercase tracking-widest transition-colors">
               RETURN
            </Link>
         </div>
      </div>
    </div>
  );
}
