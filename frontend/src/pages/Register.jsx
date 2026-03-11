import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
    }
    catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-bg px-4 py-8 medical-grid relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-medical-primary/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-medical-accent/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-medical-primary rounded-xl flex items-center justify-center shadow-medical-soft group-hover:scale-110 transition-transform">
              <Stethoscope className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold text-medical-text tracking-tight">
              Medi<span className="text-medical-primary">Connect</span>
            </span>
          </Link>
          <h2 className="text-3xl font-bold text-medical-text">Create Account</h2>
          <p className="text-medical-secondary mt-2 text-sm uppercase tracking-widest font-semibold">Join the Health Network</p>
        </div>

        {/* Register Card */}
        <div className="glass-card border border-medical-border relative group shadow-medical-card">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-medical-primary/50 to-transparent"></div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl animate-pulse">
                <div className="flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-medical-secondary uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-medical-border rounded-xl py-3 pl-12 pr-4 text-medical-text placeholder:text-slate-400 focus:border-medical-primary/50 focus:ring-1 focus:ring-medical-primary/50 outline-none transition-all shadow-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-medical-secondary uppercase tracking-wider ml-1">Email ID</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-medical-border rounded-xl py-3 pl-12 pr-4 text-medical-text placeholder:text-slate-400 focus:border-medical-primary/50 focus:ring-1 focus:ring-medical-primary/50 outline-none transition-all shadow-sm"
                  placeholder="name@enterprise.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-medical-secondary uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                  className="w-full bg-white border border-medical-border rounded-xl py-3 pl-12 pr-4 text-medical-text placeholder:text-slate-400 focus:border-medical-primary/50 focus:ring-1 focus:ring-medical-primary/50 outline-none transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-medical-secondary uppercase tracking-wider ml-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full bg-white border border-medical-border rounded-xl py-3 pl-12 pr-4 text-medical-text placeholder:text-slate-400 focus:border-medical-primary/50 focus:ring-1 focus:ring-medical-primary/50 outline-none transition-all shadow-sm"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-medical-primary group relative overflow-hidden flex items-center justify-center gap-2 mt-4"
            >
              <span className="relative z-10">{loading ? 'PROJECTING...' : 'REGISTER ACCESS'}</span>
              {!loading && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm border-t border-medical-border pt-6">
            <p className="text-medical-secondary">
              Already have authorized access?{' '}
              <Link to="/login" className="text-medical-primary hover:underline font-bold">
                Relink Account
              </Link>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
