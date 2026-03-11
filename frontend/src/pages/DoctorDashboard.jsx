import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageCircle, FileText, Activity, Users, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function DoctorDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { to: "/appointments", icon: Calendar, title: "Appointments", desc: "View and manage patient appointments", color: "text-medical-primary", bg: "bg-medical-soft" },
    { to: "/chat", icon: MessageCircle, title: "Patient Chat", desc: "Secure messaging with patients", color: "text-medical-accent", bg: "bg-teal-50" },
    { to: "/prescriptions", icon: FileText, title: "Manage Records", desc: "Create and manage prescriptions", color: "text-medical-primary", bg: "bg-blue-50" },
  ];

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text medical-grid pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-soft border border-medical-primary/20 text-medical-primary text-[10px] font-bold uppercase tracking-widest">
              Specialist Active
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-medical-text">
              Welcome, <span className="text-medical-primary">Dr. {user?.name}</span>
            </h1>
            <p className="text-medical-secondary max-w-lg">
              Authorized clinical workstation. Monitor patient load and manage priority protocols securely.
            </p>
          </div>

          <div className="flex items-center gap-4">
             <div className="glass p-3 rounded-xl border-medical-border flex items-center gap-4 px-6 shadow-sm">
                <div className="h-6 w-[1px] bg-medical-border"></div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">LIVE</span>
                </div>
             </div>
          </div>
        </div>

        {/* Doctor Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="glass-card group flex flex-col items-start gap-6 border-medical-border hover:bg-white transition-all shadow-medical-card"
            >
              <div className={`p-4 rounded-xl ${item.bg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <item.icon className={`${item.color} w-8 h-8`} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight text-medical-text group-hover:text-medical-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-medical-secondary text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-auto pt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-medical-secondary group-hover:text-medical-primary transition-colors">
                <span>View</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
