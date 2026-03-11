import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Stethoscope, LogOut, ChevronLeft } from 'lucide-react';

export default function Navbar({ backTo, title, extra }) {
  const { user, logout } = useAuth();
  
  let defaultBack = '/dashboard/patient';
  if (user?.role === 'doctor') {
    defaultBack = '/dashboard/doctor';
  } else if (user?.role === 'admin') {
    defaultBack = '/dashboard/admin';
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-medical-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo & Back */}
        <div className="flex items-center gap-6">
          {backTo && (
            <Link 
              to={backTo === true ? defaultBack : backTo}
              className="w-10 h-10 rounded-xl border border-medical-border flex items-center justify-center text-medical-secondary hover:text-medical-primary hover:border-medical-primary/50 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </Link>
          )}
          
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-medical-primary rounded-lg flex items-center justify-center shadow-medical-soft">
              <i className="fas fa-heartbeat text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-medical-text hidden sm:block">
              Medi<span className="text-medical-primary">Connect</span>
            </span>
          </Link>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <p className="text-xs font-bold text-medical-text uppercase tracking-wider">{user?.name}</p>
            <p className="text-[10px] text-medical-primary font-bold uppercase tracking-[0.2em]">{user?.role}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass p-2 rounded-xl border-medical-border shadow-sm">
              <NotificationBell />
            </div>
            
            <button
              onClick={logout}
              className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all shadow-sm"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
