import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { Stethoscope, Calendar, Clock, ChevronLeft, ShieldCheck, Info, CheckCircle, Wallet } from "lucide-react";
import Navbar from "../components/Navbar";

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showEnroll, setShowEnroll] = useState(false);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!doctor || !date) return;
      try {
        const res = await api.get(`/appointments/doctor-slots/${doctor._id}?date=${date}`);
        setBookedSlots(res.data.bookedSlots);
      } catch (err) {
        console.log(err);
      }
    };
    fetchBookedSlots();
  }, [date, doctor]);

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-bg medical-grid">
        <div className="glass-card text-center max-w-sm border-medical-border shadow-medical-card bg-white/80">
          <Info size={48} className="text-medical-secondary mx-auto mb-4 opacity-50" />
          <p className="text-medical-text text-sm font-bold uppercase tracking-widest mb-6">NULL REFERENCE: No Specialist Selected</p>
          <Link to="/doctors" className="btn-medical-outline w-full py-3">Return to Registry</Link>
        </div>
      </div>
    );
  }
  

  const getSlotsForDate = () => {
    if (!date || !Array.isArray(doctor.availability)) return [];
    const selectedDay = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    const dayAvailability = doctor.availability.find((a) => a.day === selectedDay);
    return dayAvailability ? dayAvailability.slots : [];
  };

  const availableSlots = getSlotsForDate();
  const morningSlots = availableSlots.filter((slot) => parseInt(slot.split(":")[0]) < 12);
  const afternoonSlots = availableSlots.filter((slot) => parseInt(slot.split(":")[0]) >= 12);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");
    if (!time) {
      setError("Time protocol selection required.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/appointments", {
        doctorId: doctor._id,
        date,
        time
      });
      navigate("/appointments", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Initialization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text medical-grid pb-20 pt-20">
      <Navbar backTo="/doctors" />

      <main className="max-w-4xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Side: Specialist Profile */}
          <div className="md:w-1/3">
             <div className="glass-card border-medical-border sticky top-32 overflow-hidden group shadow-medical-card bg-white">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-medical-primary"></div>
                <div className="w-20 h-20 rounded-3xl bg-medical-soft border border-medical-primary/20 flex items-center justify-center text-medical-primary mb-6 shadow-sm transition-transform group-hover:scale-110">
                   <Stethoscope size={36} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-1 text-medical-text">Dr. {doctor.name}</h2>
                <p className="text-[10px] font-extrabold text-medical-primary uppercase tracking-[0.3em] mb-6">{doctor.specialization || "Medical Specialist"}</p>
                
                <div className="space-y-4 pt-6 border-t border-medical-border">
                   <div className="flex items-center gap-3 text-medical-secondary">
                      <ShieldCheck size={16} className="text-medical-primary opacity-50" />
                      <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Verified Identity</span>
                   </div>
                   <div className="flex items-center gap-3 text-medical-primary bg-medical-soft p-3 rounded-xl border border-medical-primary/20 font-bold">
                      <Wallet size={16} />
                      <span className="text-xs font-bold uppercase tracking-widest">Protocol Fee: ¥0.00</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side: Booking Form */}
          <div className="md:w-2/3">
            <div className="glass-card border-medical-border p-8 relative overflow-hidden shadow-medical-card bg-white">
               <div className="absolute top-0 right-0 p-8 text-medical-primary/5 pointer-events-none">
                  <Calendar size={200} />
               </div>

               <h3 className="text-xl font-bold tracking-tight mb-8 flex items-center gap-3 text-medical-text">
                  <span className="w-8 h-8 rounded-lg bg-medical-soft flex items-center justify-center text-medical-primary text-sm shadow-sm">01</span>
                  Appointment Scheduling
               </h3>

               <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-3">
                       <Info size={16} /> {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Calendar size={14} className="text-medical-primary" /> Target Date Manifest
                    </label>
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setTime("");
                      }}
                      required
                      className="w-full bg-medical-soft/30 border border-medical-border rounded-2xl py-4 px-6 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all placeholder:text-medical-secondary/50 appearance-none shadow-sm"
                    />
                  </div>

                  {date && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                       <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Clock size={14} className="text-medical-primary" /> Temporal Slot Selection
                       </label>

                       {/* Slots Visualization */}
                       <div className="space-y-8">
                          {morningSlots.length > 0 && (
                            <div className="space-y-3">
                               <p className="text-[9px] font-bold text-medical-secondary uppercase tracking-[0.2em] px-1 italic">Morning Manifest (00:00 - 12:00)</p>
                               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                  {morningSlots.map(slot => {
                                    const isBooked = bookedSlots.some((b) => b.slice(0, 5) === slot);
                                    const isSelected = time === slot;
                                    return (
                                      <button
                                        key={slot}
                                        type="button"
                                        disabled={isBooked}
                                        onClick={() => { if (!isBooked) { setTime(slot); setError(""); } }}
                                        className={`py-3 rounded-xl text-[11px] font-bold transition-all border shadow-sm ${
                                          isBooked ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through" :
                                          isSelected ? "bg-medical-primary text-white shadow-medical-soft border-medical-primary" :
                                          "bg-white border-medical-border text-medical-text hover:border-medical-primary/40 hover:text-medical-primary"
                                        }`}
                                      >
                                        {slot}
                                      </button>
                                    );
                                  })}
                               </div>
                            </div>
                          )}

                          {afternoonSlots.length > 0 && (
                            <div className="space-y-3">
                               <p className="text-[9px] font-bold text-medical-secondary uppercase tracking-[0.2em] px-1 italic">Afternoon Manifest (12:00 - 23:59)</p>
                               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                  {afternoonSlots.map(slot => {
                                    const isBooked = bookedSlots.includes(slot);
                                    const isSelected = time === slot;
                                    return (
                                      <button
                                        key={slot}
                                        type="button"
                                        disabled={isBooked}
                                        onClick={() => { if (!isBooked) { setTime(slot); setError(""); } }}
                                        className={`py-3 rounded-xl text-[11px] font-bold transition-all border shadow-sm ${
                                          isBooked ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed line-through" :
                                          isSelected ? "bg-medical-primary text-white shadow-medical-soft border-medical-primary" :
                                          "bg-white border-medical-border text-medical-text hover:border-medical-primary/40 hover:text-medical-primary"
                                        }`}
                                      >
                                        {slot}
                                      </button>
                                    );
                                  })}
                               </div>
                            </div>
                          )}
                          
                          {availableSlots.length === 0 && (
                             <div className="p-10 text-center border border-dashed border-medical-border rounded-2xl bg-medical-soft/20">
                                <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest leading-loose">No temporal windows available on this date manifest.</p>
                             </div>
                          )}
                       </div>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!time || loading}
                    onClick={() => {
                        if (!time) return setError("Select temporal slot.");
                        setShowEnroll(true);
                    }}
                    className="w-full btn-medical-primary py-5 flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                  >
                    <span className="relative z-10 font-bold tracking-[0.2em] uppercase">Book the Appointment</span>
                    <CheckCircle size={20} className="relative z-10 opacity-80 group-hover:scale-110 transition-transform" />
                  </button>
               </form>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showEnroll && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-medical-text/20 backdrop-blur-md" onClick={() => setShowEnroll(false)}></div>
          <div className="glass border border-medical-border p-8 rounded-3xl max-w-md w-full relative z-[110] shadow-2xl animate-in zoom-in-95 duration-300 bg-white">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-medical-primary to-transparent"></div>
             
             <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-medical-soft flex items-center justify-center text-medical-primary border border-medical-primary/20 shadow-sm">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h2 className="text-2xl font-bold tracking-tight text-medical-text">Final Authorization</h2>
                   <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest leading-none mt-1">Enroll</p>
                </div>
             </div>

             <div className="space-y-4 mb-10 text-sm">
                <p className="text-medical-secondary leading-relaxed font-medium">
                   You are about to authorize a medical engagement manifest with:
                </p>
                <div className="bg-medical-soft border border-medical-primary/10 p-4 rounded-2xl shadow-inner">
                   <p className="text-medical-text font-bold text-lg mb-1">Dr. {doctor.name}</p>
                   <p className="text-[10px] font-bold text-medical-primary uppercase tracking-[0.2em]">{doctor.specialization || "Clinical Protocol"}</p>
                   <div className="flex items-center gap-2 mt-4 pt-4 border-t border-medical-primary/10 text-medical-secondary">
                      <Clock size={12} className="text-medical-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest">{date} @ {time} SYNC</span>
                   </div>
                </div>
             </div>

             <div className="flex gap-4">
                <button
                  onClick={() => setShowEnroll(false)}
                  className="flex-1 py-4 px-6 rounded-2xl border border-medical-border text-[10px] font-bold uppercase tracking-widest text-medical-secondary hover:text-medical-text hover:bg-slate-50 transition-all shadow-sm"
                >
                  DE-INITIALIZE
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-4 px-6 rounded-2xl bg-medical-primary text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-medical-soft hover:brightness-110 transition-all"
                >
                  {loading ? "ENROLLING..." : "COMMIT ENROLLMENT"}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}