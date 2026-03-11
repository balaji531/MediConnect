import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { format } from 'date-fns';
import { Download, FileText, Clipboard, Activity, Printer, ChevronLeft, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function PrescriptionDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const { data } = await api.get(`/prescriptions/${id}`);
        setPrescription(data.prescription);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize record stream');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPrescription();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const res = await api.get(`/prescriptions/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `protocol-rx-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('PDF generation protocol failed');
    }
  };

  const handleDownloadPNG = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('prescription-content');
      if (!element) return;

      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#f8fafc' });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `record-manifest-${id}.png`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }, 'image/png');
    } catch (err) {
      alert('Asset export protocol failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-bg medical-grid">
        <div className="flex flex-col items-center gap-4">
           <div className="h-10 w-10 border-4 border-medical-primary border-t-transparent rounded-full animate-spin shadow-medical-soft" />
           <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-medical-primary">Initializing Stream...</p>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-medical-bg medical-grid p-6 flex flex-col items-center justify-center text-center">
        <div className="p-8 glass-card border-medical-border bg-white shadow-medical-card max-w-sm">
           <ShieldCheck className="text-red-500 mx-auto mb-6" size={48} />
           <h2 className="text-xl font-bold mb-2 uppercase tracking-tight text-medical-text">ACCESS TERMINATED</h2>
           <p className="text-medical-secondary text-xs mb-8 uppercase tracking-widest font-medium leading-loose">{error || 'Data manifest not found.'}</p>
           <Link to="/prescriptions" className="btn-medical-outline w-full py-4 font-bold">Return to Manifest</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text medical-grid pb-20 pt-20">
      <Navbar backTo={true} />

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-10">
           <div className="flex items-center gap-4">
              <Link to="/prescriptions" className="w-10 h-10 rounded-xl bg-white border border-medical-border flex items-center justify-center text-medical-secondary hover:text-medical-primary hover:border-medical-primary/50 transition-all group shadow-sm">
                <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-medical-text">Record View</h1>
                <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest leading-none">Manifest ID: #{id?.slice(-6).toUpperCase()}</p>
              </div>
           </div>

           <div className="flex gap-2">
             <button
               onClick={handleDownloadPNG}
               className="bg-white border border-medical-border px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-medical-secondary hover:text-medical-primary hover:border-medical-primary/20 transition-all shadow-sm"
             >
               <Download size={14} /> EXPORT ASSET
             </button>
             {isDoctor && (
               <button
                 onClick={handleDownloadPDF}
                 className="btn-medical-primary px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-medical-soft"
               >
                 <Printer size={14} /> GENERATE PDF
               </button>
             )}
           </div>
        </div>

        {/* Prescription Doc */}
        <div id="prescription-content" className="glass-card border-medical-border p-12 relative overflow-hidden group shadow-medical-doc bg-white rounded-[2rem]">
           <div className="absolute top-0 right-0 p-8 text-medical-primary/5 pointer-events-none">
              <Clipboard size={260} />
           </div>
           <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-transparent via-medical-primary/40 to-transparent"></div>

           {/* Header */}
           <div className="flex justify-between items-start mb-16 border-b border-medical-border pb-10">
              <div className="space-y-6">
                 <div>
                    <h2 className="text-[10px] font-bold text-medical-primary uppercase tracking-[0.4em] mb-3">Issued Prescription</h2>
                    <h3 className="text-2xl font-bold text-medical-text uppercase tracking-tight">{prescription.doctorId?.name}</h3>
                    <p className="text-xs text-medical-secondary font-bold uppercase tracking-widest">{prescription.doctorId?.specialization || 'General Protocol'}</p>
                 </div>
                 <div>
                    <h2 className="text-[10px] font-bold text-medical-primary uppercase tracking-[0.4em] mb-3">Subject Identification</h2>
                    <h3 className="text-xl font-bold text-medical-text uppercase tracking-tight">{prescription.patientId?.name}</h3>
                    <p className="text-xs text-medical-secondary font-medium">{prescription.patientId?.email}</p>
                 </div>
              </div>

              <div className="text-right flex flex-col items-end gap-1">
                 <div className="w-12 h-12 rounded-2xl bg-medical-soft border border-medical-primary/20 flex items-center justify-center text-medical-primary mb-6 shadow-sm">
                    <FileText size={24} />
                 </div>
                 <h2 className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest">Timestamp</h2>
                 <p className="text-sm font-bold text-medical-text">{format(new Date(prescription.date), 'dd.MM.yyyy')}</p>
                 <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest">{format(new Date(prescription.date), 'HH:mm')} LOCAL</p>
              </div>
           </div>

           {/* Core Manifest */}
           <div className="space-y-12">
              <div>
                 <h2 className="text-[10px] font-bold text-medical-text uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                    <Activity size={14} className="text-medical-primary" />
                    Pharmacological Manifest
                 </h2>
                 <div className="space-y-6">
                    {prescription.medicines?.map((m, i) => (
                      <div key={i} className="bg-medical-soft/20 border border-medical-border p-6 rounded-2xl hover:border-medical-primary/20 transition-colors shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                           <h4 className="text-lg font-bold text-medical-text tracking-tight">{m.name}</h4>
                           <span className="px-3 py-1 rounded-md bg-white border border-medical-border text-[9px] font-bold text-medical-secondary uppercase tracking-widest shadow-sm">Active Component</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                           <div>
                              <p className="text-[9px] font-bold text-medical-secondary uppercase tracking-widest mb-1">Dosage</p>
                              <p className="text-sm font-bold text-medical-text">{m.dosage}</p>
                           </div>
                           <div>
                              <p className="text-[9px] font-bold text-medical-secondary uppercase tracking-widest mb-1">Duration</p>
                              <p className="text-sm font-bold text-medical-text">{m.duration}</p>
                           </div>
                           {m.instructions && (
                             <div className="col-span-full md:col-span-1">
                                <p className="text-[9px] font-bold text-medical-secondary uppercase tracking-widest mb-1">Execution Notes</p>
                                <p className="text-sm text-medical-secondary italic font-medium">"{m.instructions}"</p>
                             </div>
                           )}
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              {prescription.notes && (
                <div className="bg-medical-soft/30 border border-medical-border p-8 rounded-3xl shadow-inner">
                   <h2 className="text-[10px] font-bold text-medical-secondary uppercase tracking-[0.4em] mb-4">Addendum</h2>
                   <p className="text-medical-text text-sm leading-relaxed font-medium">{prescription.notes}</p>
                </div>
              )}
           </div>

           {/* Footer */}
           <div className="mt-16 pt-10 border-t border-medical-border flex justify-between items-center opacity-40">
              <div className="text-[10px] font-bold uppercase tracking-widest text-medical-text">
                 MediConnect v2.0
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}