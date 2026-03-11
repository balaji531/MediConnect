import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { ChevronLeft, Plus, Trash2, Clipboard, ArrowRight, User, Info, Activity } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function CreatePrescription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialPatientId = searchParams.get('patientId') || '';
  const initialAppointmentId = searchParams.get('appointmentId') || '';

  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: initialPatientId,
    appointmentId: initialAppointmentId,
    notes: '',
    medicines: [{ name: '', dosage: '', duration: '', instructions: '' }],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/users?role=patient');
        const list = Array.isArray(data) ? data : data.users || [];
        setPatients(list);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to initialize patient manifest');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleMedicineChange = (index, field, value) => {
    const meds = [...formData.medicines];
    meds[index][field] = value;
    setFormData({ ...formData, medicines: meds });
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', duration: '', instructions: '' }],
    });
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length === 1) return;
    const meds = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: meds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) return alert('Select a subject target');
    if (!formData.medicines.length || formData.medicines.some(m => !m.name || !m.dosage || !m.duration)) {
      return alert('Incomplete pharmacological manifest');
    }

    try {
      setSubmitting(true);
      await api.post('/prescriptions', formData);
      navigate('/prescriptions');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize prescription');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-bg medical-grid">
        <div className="flex flex-col items-center gap-4">
           <div className="h-10 w-10 border-4 border-medical-primary border-t-transparent rounded-full animate-spin shadow-medical-soft" />
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-medical-primary">Syncing Patient Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text medical-grid pb-20 pt-20">
      <Navbar backTo={true} />

      <main className="max-w-4xl mx-auto px-6 pt-12">
        <div className="flex items-center justify-between mb-10">
           <div className="flex items-center gap-4">
              <Link to="/prescriptions" className="w-10 h-10 rounded-xl bg-white border border-medical-border flex items-center justify-center text-medical-secondary hover:text-medical-primary hover:border-medical-primary/50 transition-all group shadow-sm">
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-medical-text">Enroll</h1>
                <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest leading-none">New Medical Manifest</p>
              </div>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
           {/* Subject & Reference */}
           <div className="glass-card border-medical-border p-8 relative overflow-hidden group bg-white shadow-medical-card">
              <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-medical-primary/40 to-transparent"></div>
              <h2 className="text-[10px] font-bold text-medical-text uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                 <User size={14} className="text-medical-primary" /> Primary Information
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Target Patient</label>
                    <div className="relative">
                      <select
                        value={formData.patientId}
                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                        className="w-full bg-medical-soft/30 border border-medical-border rounded-2xl py-4 px-6 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                        required
                      >
                        <option value="">Select target...</option>
                        {patients.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.email})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-medical-secondary">
                        <ArrowRight size={14} className="rotate-90" />
                      </div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Reference Appointment (Optional)</label>
                    <input
                      type="text"
                      placeholder="Manifest Reference ID"
                      value={formData.appointmentId}
                      onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                      className="w-full bg-medical-soft/30 border border-medical-border rounded-2xl py-4 px-6 text-sm text-medical-text placeholder:text-medical-secondary/50 focus:border-medical-primary/50 outline-none transition-all shadow-sm"
                    />
                 </div>
              </div>
           </div>

           {/* Medicine Rows */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                 <h2 className="text-[10px] font-bold text-medical-text uppercase tracking-[0.3em] flex items-center gap-2">
                    <Activity size={14} className="text-medical-primary" /> Pharmacological Manifest
                 </h2>
                 <button
                    type="button"
                    onClick={addMedicine}
                    className="text-[10px] font-bold text-medical-primary hover:text-medical-accent flex items-center gap-1 group transition-colors"
                 >
                    <Plus size={14} className="group-hover:rotate-90 transition-transform" /> ADD CONSTITUENT
                 </button>
              </div>

              {formData.medicines.map((med, i) => (
                <div key={i} className="glass-card border-medical-border p-8 space-y-6 animate-in slide-in-from-left-4 duration-500 relative bg-white shadow-medical-card">
                   <div className="flex justify-between items-center">
                      <div className="px-3 py-1 rounded-md bg-medical-soft border border-medical-primary/10 text-[9px] font-bold text-medical-primary uppercase tracking-widest">
                         ENTRY #{i + 1}
                      </div>
                      {formData.medicines.length > 1 && (
                         <button onClick={() => removeMedicine(i)} type="button" className="text-medical-secondary hover:text-red-500 transition-colors bg-medical-soft/50 p-2 rounded-lg">
                            <Trash2 size={16} />
                         </button>
                      )}
                   </div>

                   <div className="grid md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Compound Name</label>
                         <input
                           type="text"
                           placeholder="Active Agent"
                           value={med.name}
                           onChange={(e) => handleMedicineChange(i, 'name', e.target.value)}
                           className="w-full bg-medical-soft/20 border border-medical-border rounded-xl py-3 px-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all shadow-sm font-bold"
                           required
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Dosage </label>
                         <input
                           type="text"
                           placeholder="e.g. 500mg BID"
                           value={med.dosage}
                           onChange={(e) => handleMedicineChange(i, 'dosage', e.target.value)}
                           className="w-full bg-medical-soft/20 border border-medical-border rounded-xl py-3 px-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all shadow-sm"
                           required
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Duration Cycle</label>
                         <input
                           type="text"
                           placeholder="e.g. 7 Days"
                           value={med.duration}
                           onChange={(e) => handleMedicineChange(i, 'duration', e.target.value)}
                           className="w-full bg-medical-soft/20 border border-medical-border rounded-xl py-3 px-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all shadow-sm"
                           required
                         />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Execution Instructions</label>
                         <input
                           type="text"
                           placeholder="Post-prandial, etc."
                           value={med.instructions}
                           onChange={(e) => handleMedicineChange(i, 'instructions', e.target.value)}
                           className="w-full bg-medical-soft/20 border border-medical-border rounded-xl py-3 px-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all shadow-sm italic"
                         />
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Notes & Submission */}
           <div className="glass-card border-medical-border p-8 space-y-8 bg-white shadow-medical-card">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Diagnostic Addendum (Optional)</label>
                 <textarea
                   value={formData.notes}
                   onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                   placeholder="Enter clinical notes for the subject..."
                   className="w-full bg-medical-soft/20 border border-medical-border rounded-2xl py-6 px-6 text-sm text-medical-text placeholder:text-medical-secondary/50 focus:border-medical-primary/50 outline-none min-h-[160px] resize-none transition-all shadow-inner font-medium"
                 />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-medical-primary py-5 flex items-center justify-center gap-3 shadow-medical-soft group"
              >
                <span className="font-bold tracking-[0.2em]">{submitting ? "INITIALIZING ..." : "INITIALIZE PRESCRIPTION MANIFEST"}</span>
                {!submitting && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
              
              <div className="flex items-center justify-center gap-2 opacity-50">
                 <Info size={12} className="text-medical-primary" />
                 <span className="text-[9px] font-bold uppercase tracking-widest text-medical-secondary">Authorized clinician portal · MediConnect v2.0</span>
              </div>
           </div>
        </form>
      </main>
    </div>
  );
}
