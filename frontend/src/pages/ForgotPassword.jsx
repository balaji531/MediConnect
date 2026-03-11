import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Mail, ShieldCheck, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setMessage(res.message || 'Manifest dispatched. If an entity exists for this ID, a reset link has been transmitted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch reset manifest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bipsync-bg hex-bg px-4 py-20">
      <div className="w-full max-w-md glass-card border-white/5 p-10 relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-bipsync-green to-transparent"></div>
         <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Mail size={180} />
         </div>

         <div className="flex flex-col items-center mb-10 relative z-10 text-center">
           <div className="w-16 h-16 rounded-2xl bg-bipsync-green/10 border border-bipsync-green/20 flex items-center justify-center text-bipsync-green mb-6 shadow-glow-green/10">
             <Stethoscope size={30} />
           </div>
           <h1 className="text-2xl font-bold tracking-tight text-white mb-2 uppercase">Protocol Recovery</h1>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Request Credential Reset</p>
         </div>

         <div className="relative z-10 space-y-6">
            {message && (
              <div className="bg-bipsync-green/10 border border-bipsync-green/20 text-bipsync-green p-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in zoom-in-95">
                <ShieldCheck size={20} className="mx-auto mb-3" />
                {message}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {!message && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@enterprise.com"
                      className="w-full bg-bipsync-bg/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-bipsync-green/50 outline-none transition-all placeholder:text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-bipsync-primary py-4 mt-2 flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  <span className="font-black tracking-[0.1em] uppercase">{loading ? 'DISPATCHING...' : 'DISPATCH RESET LINK'}</span>
                  {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            )}

            <div className="flex flex-col items-center gap-4 pt-6 border-t border-white/5">
               <Link to="/login" className="text-[10px] font-bold text-slate-500 hover:text-bipsync-green uppercase tracking-widest transition-colors">
                  Return to Access
               </Link>
            </div>
         </div>

         <div className="absolute bottom-0 right-0 p-4 opacity-20 pointer-events-none">
            <Info size={14} className="text-slate-500" />
         </div>
      </div>
    </div>
  );
}
