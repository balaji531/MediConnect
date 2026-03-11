import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Stethoscope, Search, Star, Clock, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Doctors() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const params = {};
        if (search) params.search = search;
        const { data } = await api.get('/users/doctors', { params });
        setDoctors(data.doctors);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize personnel manifest');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [search]);

  return (
    <div className="min-h-screen bg-bipsync-bg text-white hex-bg pb-20 pt-20">
      <Navbar backTo={true} />

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Available <span className="text-bipsync-green">Doctors</span>
            </h1>
            <p className="text-slate-400 max-w-lg">
              Access your healthcare anytime, anywhere.
Consult trusted doctors from the comfort of your home.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="IDENTITY SEARCH (NAME, SPEC...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray/[0.03] border border-gray/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold tracking-widest text-white focus:border-bipsync-green/50 outline-none transition-all placeholder:text-slate-600 uppercase"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-4 rounded-xl mb-8 flex items-center gap-3 animate-pulse">
            <ShieldCheck size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
          </div>
        )}

        {/* Loading / Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-50">
            <div className="animate-spin h-10 w-10 border-4 border-bipsync-green border-t-transparent rounded-full shadow-glow-green" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Querying Registry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <div key={doc._id} className="glass-card group flex flex-col items-start gap-6 border-white/5 hover:border-bipsync-green/30 transition-all duration-500 relative overflow-hidden h-full">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-bipsync-green pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <Stethoscope size={120} />
                </div>

                <div className="flex justify-between items-start w-full relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-bipsync-green/10 border border-bipsync-green/20 flex items-center justify-center text-bipsync-green group-hover:shadow-glow-green transition-all duration-500">
                    <Stethoscope size={28} />
                  </div>
                </div>

                <div className="space-y-4 w-full flex-1 relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold text-bipsync-green group-hover:text-bipsync-green transition-colors tracking-tight">
                      Dr. {doc.name}
                    </h3>
                    <p className="text-[10px] font-extrabold text-bipsync-green uppercase tracking-[0.2em] mt-1">
                      {doc.specialization || 'Clinical Generalist'}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    {doc.qualification && (
                      <div className="flex items-start gap-3 text-slate-400">
                        <ShieldCheck size={14} className="mt-0.5 text-slate-500" />
                        <span className="text-[11px] font-medium leading-relaxed">{doc.qualification}</span>
                      </div>
                    )}
                  </div>

                  {Array.isArray(doc.availability) && doc.availability.length > 0 && (
                    <div className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
                       <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">Available on:</p>
                       <div className="flex flex-wrap gap-2">
                          {doc.availability.slice(0, 3).map((day, i) => (
                            <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-white/5 text-slate-400 uppercase tracking-tighter">
                               {day.day}
                            </span>
                          ))}
                          {doc.availability.length > 3 && <span className="text-[9px] font-bold text-slate-600">+{doc.availability.length - 3} More</span>}
                       </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate('/appointments/book', { state: { doctor: doc } })}
                  className="w-full btn-bipsync-primary group relative z-10 mt-2 flex items-center justify-center gap-2 py-4"
                >
                  <span className="tracking-[0.1em]">INITIALIZE BOOKING</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        )}

        {doctors.length === 0 && !loading && (
          <div className="text-center py-32 border border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
            <Search size={64} className="mx-auto text-slate-800 mb-6" />
            <h3 className="text-2xl font-bold opacity-30 tracking-tight uppercase">No Entities Found</h3>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.4em] mt-2">Modify query parameters to continue.</p>
          </div>
        )}
      </main>
    </div>
  );
}
