import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { format } from 'date-fns';
import { Calendar, ArrowRight, Video, MessageSquare, Clipboard, CheckCircle, XCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  const isDoctor = user?.role === 'doctor';

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data.appointments);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    if (!updating) setUpdating(id);
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      await fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const statusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return { color: 'text-medical-primary', bg: 'bg-medical-soft', border: 'border-medical-primary/20', icon: CheckCircle };
      case 'pending':
        return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock };
      case 'rejected':
      case 'cancelled':
        return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle };
      case 'completed':
        return { color: 'text-medical-secondary', bg: 'bg-slate-50', border: 'border-slate-200', icon: Clipboard };
      default:
        return { color: 'text-medical-secondary', bg: 'bg-slate-50', border: 'border-slate-100', icon: Clipboard };
    }
  };

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text medical-grid pb-20 pt-20">
      <Navbar backTo={true} />

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-medical-text">
              My <span className="text-medical-primary">Appointments</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {!isDoctor && (
              <Link
                to="/doctors"
                className="btn-medical-primary group"
              >
                + INITIALIZE BOOKING
              </Link>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-xl mb-8 flex items-center gap-3 shadow-sm">
            <XCircle size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">{error}</span>
          </div>
        )}

        {/* Loading / Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4 opacity-50">
            <div className="animate-spin h-12 w-12 border-4 border-medical-primary border-t-transparent rounded-full shadow-medical-soft"/>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-medical-secondary">Syncing ...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((apt) => {
              const cfg = statusConfig(apt.status);
              return (
                <div key={apt._id} className="glass-card group flex flex-col items-start gap-6 border-medical-border hover:bg-white transition-all shadow-medical-card relative overflow-hidden">
                   {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 w-full h-[2px] ${cfg.color.replace('text', 'bg-')}`}></div>
                  
                  <div className="flex justify-between w-full">
                     <div className="w-12 h-12 rounded-xl bg-medical-soft flex items-center justify-center text-medical-secondary group-hover:text-medical-primary transition-colors">
                        <cfg.icon size={24} />
                     </div>
                     <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        {apt.status}
                     </div>
                  </div>

                  <div className="space-y-4 w-full flex-1">
                    <div>
                      <h3 className="text-xl font-bold text-medical-text group-hover:text-medical-primary transition-colors truncate">
                        {isDoctor ? apt.patientId?.name : apt.doctorId?.name}
                      </h3>
                      <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest leading-loose">
                        {isDoctor ? "Patient Entity" : "Medical Specialist"}
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-medical-border">
                       <div className="flex items-center gap-3 text-medical-text font-medium">
                          <Clock size={14} className="text-medical-primary" />
                          <span className="text-sm">{format(new Date(apt.date), 'PPP')}</span>
                       </div>
                       <div className="flex items-center gap-3 text-medical-secondary">
                          <Calendar size={14} className="text-medical-secondary/50" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{apt.time} SCHEDULED TIME</span>
                       </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="w-full pt-6 flex flex-wrap gap-2 border-t border-medical-border">
                    {isDoctor && apt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(apt._id, 'accepted')}
                          disabled={updating === apt._id}
                          className="flex-1 bg-medical-soft hover:bg-blue-100 text-medical-primary py-2.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-medical-primary/20"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(apt._id, 'rejected')}
                          disabled={updating === apt._id}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-red-200"
                        >
                          Decline
                        </button>
                      </>
                    )}

                    {isDoctor && apt.status === 'accepted' && (
                      <button
                        onClick={() => updateStatus(apt._id, 'completed')}
                        disabled={updating === apt._id}
                        className="w-full bg-slate-50 hover:bg-slate-100 text-medical-secondary py-2.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-200"
                      >
                        CLOSE SESSION
                      </button>
                    )}

                    {(apt.status === 'accepted' || apt.status === 'completed') && (
                      <div className="flex gap-2 w-full">
                        <Link
                          to={`/chat/${isDoctor ? apt.patientId?._id : apt.doctorId?._id}`}
                          state={{ peer: isDoctor ? apt.patientId : apt.doctorId }}
                          className="flex-1 glass py-2.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-medical-secondary hover:text-medical-primary hover:border-medical-primary/50 transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <MessageSquare size={12} /> CHAT
                        </Link>
                        
                        {(() => {
                          const appointmentDateTime = new Date(apt.date);
                          const [hours, minutes] = apt.time.split(':');
                          appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                          const canJoin = new Date() >= appointmentDateTime;
                          return (
                            <Link
                              to={canJoin ? `/video/${apt._id}` : '#'}
                              onClick={(e) => {
                                if (!canJoin) {
                                  e.preventDefault();
                                  alert("INACTIVE: Access available at scheduled time.");
                                }
                              }}
                              className={`flex-1 py-2.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm ${
                                canJoin ? 'bg-medical-primary text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <Video size={12} /> VIDEO
                            </Link>
                          );
                        })()}
                      </div>
                    )}

                    {isDoctor && apt.status === 'accepted' && (
                      <Link
                        to={`/prescriptions/new?patientId=${apt.patientId?._id}&appointmentId=${apt._id}`}
                        className="w-full py-2.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest text-medical-accent border border-medical-accent/30 bg-teal-50 hover:bg-teal-100 transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Clipboard size={12} /> GENERATE PRESCRIPTION
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {appointments.length === 0 && !loading && (
          <div className="text-center py-32 border border-dashed border-medical-border rounded-3xl bg-white/50 shadow-inner">
            <Calendar size={64} className="mx-auto text-medical-soft mb-6" />
            <h3 className="text-2xl font-bold text-medical-secondary/30 tracking-tight uppercase">No Appointments Found</h3>
            <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-[0.4em] mt-2">Check scheduled bookings or contact support.</p>
          </div>
        )}
      </main>
    </div>
  );
}