import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, CheckCircle, ShieldAlert, Activity, ArrowRight } from 'lucide-react';

export default function VerifyEmail() {
  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const res = await verifyEmail(token);
        if (!isMounted) return;
        setMessage(res.message || 'Identity verified successfully. Protocol access granted.');
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Verification manifest invalid or expired.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => { isMounted = false; };
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bipsync-bg hex-bg px-4 py-20">
      <div className="w-full max-w-md glass-card border-white/5 p-10 relative overflow-hidden text-center group">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-bipsync-green to-transparent"></div>
         <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <ShieldAlert size={160} />
         </div>

         <div className="flex flex-col items-center mb-8 relative z-10">
           <div className="w-16 h-16 rounded-2xl bg-bipsync-green/10 border border-bipsync-green/20 flex items-center justify-center text-bipsync-green mb-6 shadow-glow-green/10">
             <Stethoscope size={32} />
           </div>
           <h1 className="text-2xl font-bold tracking-tight text-white mb-2 uppercase">Credential Verification</h1>
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Neural Identity Check</p>
         </div>

         <div className="relative z-10">
            {loading ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="animate-spin h-8 w-8 border-4 border-bipsync-green border-t-transparent rounded-full" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scanning Manifest...</p>
              </div>
            ) : message ? (
              <div className="space-y-8">
                <div className="bg-bipsync-green/10 border border-bipsync-green/20 text-bipsync-green p-6 rounded-2xl">
                   <CheckCircle className="mx-auto mb-3" size={24} />
                   <p className="text-xs font-bold leading-relaxed uppercase tracking-wider">{message}</p>
                </div>
                <Link
                  to="/login"
                  className="w-full btn-bipsync-primary py-4 flex items-center justify-center gap-2 group"
                >
                  <span className="tracking-[0.1em]">PROCEED</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl">
                   <ShieldAlert className="mx-auto mb-3" size={24} />
                   <p className="text-xs font-bold leading-relaxed uppercase tracking-wider">{error}</p>
                </div>
                <Link
                  to="/login"
                  className="w-full py-4 rounded-2xl border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
                >
                  RETURN TO LOGIN
                </Link>
              </div>
            )}
         </div>

         <div className="mt-12 pt-6 border-t border-white/5 opacity-40">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-bipsync-green animate-pulse"></div>
                  <span className="text-[8px] font-bold uppercase tracking-widest">SECURE SCAN ACTIVE</span>
               </div>
               <span className="text-[8px] font-bold uppercase tracking-widest">Ver: 2.0.4-Sync</span>
            </div>
         </div>
      </div>
    </div>
  );
}
