import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { format } from 'date-fns';
import { FileText, Plus, Search, ChevronRight, Activity, Clipboard } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Prescriptions() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'doctor';

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/prescriptions');
        setPrescriptions(data.prescriptions || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize record stream');
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, []);

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text medical-grid pb-20">
      <Navbar backTo={true} />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-medical-text">
              Medical <span className="text-medical-primary">Manifest</span>
            </h1>
            <p className="text-medical-secondary max-w-lg text-sm">
              Archived prescriptions and therapeutic protocols. Access secure medical history.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isDoctor && (
              <Link
                to="/prescriptions/new"
                className="btn-medical-primary py-4 px-8 shadow-medical-soft group flex items-center gap-2"
              >
                <Plus size={18} />
                <span className="font-bold tracking-widest text-[10px]">INITIALIZE PRESCRIPTION</span>
              </Link>
            )}
             <div className="glass px-6 py-3 rounded-xl border-medical-border bg-white shadow-sm shadow-medical-soft/5 hidden sm:block">
                <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest mb-1">Total Entries</p>
                <p className="text-xl font-bold text-medical-text">{prescriptions.length}</p>
             </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl mb-8 flex items-center gap-3 shadow-sm">
            <Activity size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-medical-primary border-t-transparent rounded-full shadow-medical-soft"/>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-medical-primary">Querying Database...</p>
          </div>
        ) : prescriptions.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescriptions.map((rx) => (
              <Link
                key={rx._id}
                to={`/prescriptions/${rx._id}`}
                className="glass-card group flex flex-col gap-6 border-medical-border bg-white hover:border-medical-primary/30 transition-all duration-500 relative overflow-hidden shadow-medical-card"
              >
                  <div className="absolute top-0 right-0 p-4 text-medical-primary/5 group-hover:text-medical-primary/10 transition-colors">
                     <Clipboard size={64} />
                  </div>

                  <div className="flex justify-between items-start">
                     <div className="w-12 h-12 rounded-xl bg-medical-soft border border-medical-primary/20 flex items-center justify-center text-medical-primary group-hover:bg-medical-primary/10 transition-colors shadow-inner">
                        <FileText size={24} />
                     </div>
                     <div className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest">
                        Ref: {rx._id?.slice(-8).toUpperCase()}
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-medical-text group-hover:text-medical-primary transition-colors truncate">
                         {isDoctor ? rx.patientId?.name : rx.doctorId?.name}
                      </h3>
                      <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest leading-loose">
                        {isDoctor ? "Assigned Patient" : "Issuing Clinician"}
                      </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-medical-border">
                       <div className="flex items-center gap-3 text-medical-text">
                          <Activity size={14} className="text-medical-primary" />
                          <span className="text-sm font-bold">{format(new Date(rx.date || rx.createdAt), 'PPP')}</span>
                       </div>
                       <div className="flex items-center gap-3 text-medical-secondary">
                          <span className="text-[9px] font-bold uppercase tracking-widest">
                             {rx.medicines?.length || 0} CONSTITUENTS DETECTED
                          </span>
                       </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-medical-secondary group-hover:text-medical-primary transition-colors border-t border-medical-border">
                     <span>View</span>
                     <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-medical-border rounded-3xl bg-white/50 shadow-inner">
            <div className="w-20 h-20 rounded-full bg-medical-soft flex items-center justify-center text-medical-primary border border-medical-primary/10 mx-auto mb-6 opacity-30">
               <Clipboard size={40} />
            </div>
            <h2 className="text-2xl font-bold text-medical-text opacity-30 tracking-tight uppercase">No Records Initialized</h2>
            <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-[0.4em] mt-2 leading-loose">
              Initialize a new prescription or sync with main database.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
