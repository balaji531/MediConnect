import { Bell, Info, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";

export default function NotificationBell() {
  const { notifications } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          open ? 'bg-bipsync-green text-bipsync-bg shadow-glow-green' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-80 glass border border-white/10 rounded-2xl shadow-2xl p-4 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-bipsync-green/30 to-transparent"></div>
            
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Signal Manifest</h3>
              <span className="px-2 py-0.5 rounded bg-bipsync-bg-soft text-bipsync-green text-[9px] font-bold border border-bipsync-green/20">
                {notifications.length} ACTIVE
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-8 text-center opacity-30">
                   <ShieldAlert size={32} className="mx-auto mb-2" />
                   <p className="text-[10px] font-bold uppercase tracking-widest">No Signals Detected</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-bipsync-green/10 flex items-center justify-center text-bipsync-green shrink-0">
                      <Info size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors">
                        {n.message}
                      </p>
                      <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Status: Logged</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 text-center">
               <p className="text-[8px] font-bold text-slate-700 uppercase tracking-[0.3em]">SECURE CHANNEL 01</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
