import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Activity, Brain, ShieldCheck, Info, AlertTriangle, ArrowRight, Globe, Search } from "lucide-react";

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [language, setLanguage] = useState("en");
  const [predictions, setPredictions] = useState([]);
  const [matched, setMatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPredictions([]);
    setMatched([]);

    try {
      const response = await fetch(
        "http://localhost:5000/check-symptoms",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: symptoms,
            lang: language,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Diagnostic protocol failed");
      }

      setPredictions(data.predictions || []);
      setMatched(data.matched || []);
    } catch (err) {
      setError("Failed to initialize neural diagnostic stream");
    }

    setLoading(false);
  };

  const getBadgeColor = (triage) => {
    switch (triage) {
      case "EMERGENCY": return "bg-red-50 text-red-600 border-red-200 shadow-sm";
      case "URGENT": return "bg-orange-50 text-orange-600 border-orange-200 shadow-sm";
      case "GP": return "bg-medical-soft text-medical-primary border-medical-primary/20 shadow-sm";
      case "SELF-CARE": return "bg-slate-50 text-medical-secondary border-slate-200 shadow-sm";
      default: return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text medical-grid pb-20 pt-20">
      <Navbar backTo={true} />

      <main className="max-w-4xl mx-auto px-6 pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-medical-text">
              Symptom <span className="text-medical-primary">Analysis</span>
            </h1>
            <p className="text-medical-secondary max-w-lg text-sm">
              Input physiological anomalies for neural network processing. Protocol facilitates instant triage assessment.
            </p>
          </div>

          <div className="hidden md:flex gap-4">
             <div className="glass px-6 py-3 rounded-xl border-medical-border shadow-sm">
                <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest mb-1">AI CORE</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <p className="text-sm font-bold text-green-600 uppercase">Active</p>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Analysis Form */}
          <div className="lg:col-span-3">
             <div className="glass-card border-medical-border p-8 relative overflow-hidden h-full bg-white shadow-medical-card">
                <div className="absolute top-0 right-0 p-8 text-medical-primary/5 pointer-events-none">
                   <Brain size={200} />
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Globe size={14} className="text-medical-primary" /> Linguistic Filter
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                         {["en", "ta"].map((lang) => (
                           <button
                             key={lang}
                             type="button"
                             onClick={() => setLanguage(lang)}
                             className={`py-3 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                               language === lang 
                               ? "bg-medical-primary text-white border-medical-primary shadow-medical-soft" 
                               : "bg-white border-medical-border text-medical-secondary hover:text-medical-primary hover:bg-medical-soft/30"
                             }`}
                           >
                             {lang === 'en' ? 'ENGLISH' : 'TAMIL'}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Search size={14} className="text-medical-primary" /> Physiological Input data
                      </label>
                      <textarea
                        placeholder="Describe anomalies (ex: persistent headache, localized pain...)"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full h-40 bg-medical-soft/20 border border-medical-border rounded-2xl p-6 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all placeholder:text-medical-secondary/40 resize-none selection:bg-medical-primary/20 shadow-inner"
                        required
                      />
                   </div>

                   <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full btn-medical-primary py-5 group flex items-center justify-center gap-2 shadow-md"
                   >
                     <span className="font-bold tracking-[0.2em] uppercase">{loading ? "PROCESSING..." : "Run Neural Analysis"}</span>
                     {!loading && <Activity size={20} className="group-hover:scale-110 transition-transform" />}
                   </button>
                </form>
             </div>
          </div>

          {/* Results Stream */}
          <div className="lg:col-span-2 space-y-6">
             {error && (
               <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-3">
                  <AlertTriangle size={18} /> {error}
               </div>
             )}

             {matched.length > 0 && (
               <div className="glass-card border-medical-border p-6 bg-white shadow-medical-card animate-in slide-in-from-right-4 duration-500">
                  <h3 className="text-[10px] font-bold text-medical-secondary uppercase tracking-[0.2em] mb-4">Detected Patterns</h3>
                  <div className="flex flex-wrap gap-2">
                    {matched.map((m, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-medical-soft border border-medical-primary/10 text-[10px] font-bold text-medical-primary uppercase tracking-tight shadow-sm">
                         {m}
                      </span>
                    ))}
                  </div>
               </div>
             )}

             <div className="glass-card border-medical-border p-6 flex-1 min-h-[300px] flex flex-col bg-white shadow-medical-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-medical-soft/50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>
                <h3 className="text-[10px] font-bold text-medical-secondary uppercase tracking-[0.2em] mb-6 relative z-10">Prediction stream</h3>
                
                {predictions.length > 0 ? (
                  <div className="space-y-4 relative z-10">
                    {predictions.map((item, index) => (
                      <div key={index} className="glass border-medical-border p-4 rounded-xl group hover:border-medical-primary/30 transition-all duration-500 bg-medical-soft/10">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="text-sm font-bold text-medical-text group-hover:text-medical-primary transition-colors tracking-tight">
                             {language === "ta" ? item.name_ta : item.name_en}
                           </h4>
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest border border-current ${getBadgeColor(item.triage)}`}>
                             {item.triage}
                           </span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3 shadow-inner">
                           <div className="bg-medical-primary h-full shadow-medical-soft transition-all duration-1000 ease-out" style={{ width: `${item.confidence}%` }}></div>
                        </div>
                        <p className="text-[9px] font-bold text-medical-secondary uppercase tracking-widest mt-2">{item.confidence}% CONFIDENCE MATCH</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-medical-secondary/20 py-20 text-center relative z-10">
                     <Brain size={48} className="mb-4 opacity-10" />
                     <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Awaiting Input Manifest</p>
                  </div>
                )}
             </div>

             <div className="bg-teal-50 border border-teal-100 p-6 rounded-2xl shadow-sm border-l-4 border-l-medical-accent">
                <div className="flex gap-4 items-start">
                   <Info size={20} className="text-medical-accent shrink-0 mt-1" />
                   <div>
                      <p className="text-[10px] font-bold text-medical-accent uppercase tracking-[0.2em] mb-1">Diagnostic Disclaimer</p>
                      <p className="text-xs text-medical-secondary leading-relaxed italic font-medium">Neural analysis is for informational triage only. Not a definitive clinical protocol.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SymptomChecker;
