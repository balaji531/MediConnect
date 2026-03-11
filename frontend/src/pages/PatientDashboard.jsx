import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Calendar, MessageCircle, FileText, Brain, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function PatientDashboard() {
  const { user } = useAuth();

  const menuItems = [
    { to: "/doctors", icon: Stethoscope, title: "Find Doctors", desc: "Search and book appointments", color: "text-medical-primary", bg: "bg-medical-soft" },
    { to: "/appointments", icon: Calendar, title: "My Appointments", desc: "View and manage appointments", color: "text-medical-accent", bg: "bg-teal-50" },
    { to: "/chat", icon: MessageCircle, title: "Secure Chat", desc: "Message your doctors", color: "text-medical-primary", bg: "bg-blue-50" },
    { to: "/prescriptions", icon: FileText, title: "Digital Prescriptions", desc: "View and download records", color: "text-medical-accent", bg: "bg-teal-50" },
    { to: "/symptom-checker", icon: Brain, title: "AI Symptom Checker", desc: "Smart diagnostics with AI", color: "text-medical-primary", bg: "bg-medical-soft" },
  ];

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text medical-grid pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-medical-text">
              Welcome, <span className="text-medical-primary">{user?.name}</span>
            </h1>
            <p className="text-medical-secondary max-w-lg">
             Stay healthy with easy online doctor consultations and smart medical management.
            </p>
          </div>
        </div>

        {/* Dashboard Grid */}
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
                <span>View </span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
