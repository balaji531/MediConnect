import { useEffect, useState } from "react";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { UserPlus, Users, Shield, Trash2, Plus, Info, Mail, User, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("doctors");
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    availability: [{ day: "Monday", slots: "" }]
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDoctors();
      fetchPatients();
    }
  }, [user]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get("/auth/admin/doctors");
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await axios.get("/auth/admin/patients");
      setPatients(res.data.patients || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    const updated = [...form.availability];
    updated[index][field] = value;
    setForm({ ...form, availability: updated });
  };

  const addAvailabilityRow = () => {
    setForm({
      ...form,
      availability: [...form.availability, { day: "Monday", slots: "" }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const formattedAvailability = form.availability.map((a) => ({
        day: a.day,
        slots: a.slots.split(",").map((s) => s.trim())
      }));
      await axios.post("/users/admin/add-doctor", {
        ...form,
        availability: formattedAvailability
      });
      setMessage("Doctor protocol initialized successfully.");
      setForm({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        qualification: "",
        availability: [{ day: "Monday", slots: "" }]
      });
      fetchDoctors();
      setActiveTab("doctors");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to initialize.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("ARE YOU SURE YOU WANT TO TERMINATE THIS DOCTOR ACCESS?")) return;
    try {
      await axios.delete(`/auth/admin/doctor/${id}`);
      fetchDoctors();
    } catch (err) {
      alert("Termination failed.");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-medical-bg flex items-center justify-center p-6 text-center medical-grid">
        <div className="glass-card border-red-200 text-red-600 max-w-sm shadow-medical-card bg-white/80">
           <Shield className="mx-auto mb-4 text-red-500" size={48} />
           <h2 className="text-xl font-bold mb-2">ACCESS DENIED</h2>
           <p className="text-sm opacity-80 uppercase tracking-widest text-red-500 font-semibold">Unauthorized Access Detected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-medical-bg text-medical-text medical-grid pb-20 pt-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-soft border border-medical-primary/20 text-medical-primary text-[10px] font-bold uppercase tracking-widest">
              Admin Active
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-medical-text">
              Control <span className="text-medical-primary">Center</span>
            </h1>
            <p className="text-medical-secondary max-w-lg text-sm">
              Manage system users, medical personnel, and enterprise protocols securely.
            </p>
          </div>

          <div className="flex gap-4">
             <div className="glass px-6 py-3 rounded-xl border-medical-border shadow-sm">
                <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest mb-1">Total Users</p>
                <p className="text-xl font-bold text-medical-text">{doctors.length + patients.length}</p>
             </div>
             <div className="glass px-6 py-3 rounded-xl border-medical-border shadow-sm">
                <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest mb-1">Active </p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <p className="text-sm font-bold text-green-600">STABLE</p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex gap-2 mb-10 p-1 bg-medical-soft/50 rounded-2xl w-fit border border-medical-border shadow-sm">
          {[
            { id: "doctors", label: "Medical Staff", icon: Users },
            { id: "patients", label: "Patient Registry", icon: Users },
            { id: "create", label: "Enroll Doctor", icon: UserPlus },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all duration-300 ${
                activeTab === tab.id 
                ? "bg-medical-primary text-white shadow-medical-soft" 
                : "text-medical-secondary hover:text-medical-primary hover:bg-white/50"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === "doctors" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {doctors.map((doc) => (
                <div key={doc._id} className="glass-card group border-medical-border hover:border-medical-primary/30 shadow-medical-card transition-all hover:bg-white">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-12 h-12 rounded-xl bg-medical-soft flex items-center justify-center text-medical-primary">
                       <Shield size={22} />
                     </div>
                     <button
                      onClick={() => handleDeleteDoctor(doc._id)}
                      className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-medical-text mb-1">{doc.name}</h3>
                  <p className="text-[9px] font-bold text-medical-primary uppercase tracking-widest mb-4 inline-block px-2 py-1 rounded bg-medical-soft border border-medical-primary/10">
                    {doc.specialization}
                  </p>
                  <p className="text-xs text-medical-secondary flex items-center gap-2 italic">
                    <Mail size={12} className="text-medical-primary opacity-50" /> {doc.email}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "patients" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {patients.map((pat) => (
                <div key={pat._id} className="glass-card border-medical-border hover:bg-white transition-all shadow-medical-card">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="w-10 h-10 rounded-full bg-medical-soft flex items-center justify-center text-medical-primary shadow-inner">
                       <User size={18} />
                     </div>
                     <div>
                       <h3 className="font-bold text-medical-text text-sm">{pat.name}</h3>
                       <p className="text-[9px] font-bold text-medical-secondary uppercase tracking-widest leading-none">Registered Patient</p>
                     </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-medical-border text-[11px] text-medical-secondary">
                     <p className="flex justify-between"><span>Identity:</span> <span className="text-medical-text font-medium">{pat.email}</span></p>
                     <p className="flex justify-between"><span>Comms:</span> <span className="text-medical-text font-medium">{pat.phone}</span></p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "create" && (
            <div className="max-w-2xl glass-card border-medical-border p-8 relative overflow-hidden group shadow-medical-card bg-white">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-medical-primary/50 to-transparent"></div>
                <div className="flex items-center gap-3 mb-8">
                   <div className="p-3 bg-medical-soft rounded-xl border border-medical-primary/20 text-medical-primary shadow-sm transition-transform group-hover:scale-110">
                      <UserPlus size={22} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold tracking-tight text-medical-text">Staff Enrollment</h2>
                      <p className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest">Protocol Initialization</p>
                   </div>
                </div>

                {message && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-xs flex items-center gap-3"><Info size={16} />{message}</div>}
                {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-xs flex items-center gap-3"><Info size={16} />{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Full Name</label>
                        <input type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} className="w-full bg-medical-bg/50 border border-medical-border rounded-xl py-3 px-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all focus:ring-1 focus:ring-medical-primary/50" />
                    </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">System Email</label>
                        <input type="email" name="email" placeholder="name@enterprise.com" value={form.email} onChange={handleChange} className="w-full bg-medical-bg/50 border border-medical-border rounded-xl py-3 px-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all focus:ring-1 focus:ring-medical-primary/50" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Phone</label>
                        <input type="text" name="phone" placeholder="+1..." value={form.phone} onChange={handleChange} className="w-full bg-medical-bg/50 border border-medical-border rounded-xl py-3 px-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all focus:ring-1 focus:ring-medical-primary/50" />
                    </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Specialization</label>
                        <input type="text" name="specialization" placeholder="Cardiology" value={form.specialization} onChange={handleChange} className="w-full bg-medical-bg/50 border border-medical-border rounded-xl py-3 px-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all focus:ring-1 focus:ring-medical-primary/50" />
                    </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-medical-secondary uppercase tracking-widest ml-1">Qualification</label>
                        <input type="text" name="qualification" placeholder="MD, PhD" value={form.qualification} onChange={handleChange} className="w-full bg-medical-bg/50 border border-medical-border rounded-xl py-3 px-4 text-sm text-medical-text focus:border-medical-primary/50 outline-none transition-all focus:ring-1 focus:ring-medical-primary/50" />
                    </div>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-medical-text uppercase tracking-widest flex items-center justify-between">Operating Schedule <button type="button" onClick={addAvailabilityRow} className="text-medical-primary hover:underline flex items-center gap-1 font-bold"><Plus size={12}/> ADD SLOT</button></p>
                     <div className="space-y-3">
                      {form.availability.map((item, index) => (
                        <div key={index} className="flex gap-4 items-center">
                          <select value={item.day} onChange={(e) => handleAvailabilityChange(index, "day", e.target.value)} className="bg-white border border-medical-border rounded-xl py-2.5 px-3 text-[11px] text-medical-text focus:border-medical-primary/50 outline-none transition-all shadow-sm">
                            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                              <option key={day}>{day}</option>
                            ))}
                          </select>
                          <input type="text" placeholder="Slots (ex: 09:00, 10:00)" value={item.slots} onChange={(e) => handleAvailabilityChange(index, "slots", e.target.value)} className="flex-1 bg-white border border-medical-border rounded-xl py-2.5 px-4 text-[11px] text-medical-text focus:border-medical-primary/50 outline-none shadow-sm" />
                        </div>
                      ))}
                     </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-medical-primary group flex items-center justify-center gap-2 py-4">
                    <span className="relative z-10">{loading ? "INITIALIZING..." : "INITIALIZE DOCTOR ACCESS"}</span>
                    {!loading && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
