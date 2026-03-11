import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-bipsync-bg overflow-x-hidden hex-bg">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-medical-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-medical-primary rounded-lg flex items-center justify-center shadow-medical-soft">
              <i className="fas fa-heartbeat text-white text-xl"></i>
            </div>
            <span className="text-2xl font-bold tracking-tight text-medical-text">
              Medi<span className="text-medical-primary">Connect</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-medical-secondary">
            <a href="#" className="hover:text-medical-primary transition-colors">Platform</a>
            <a href="#" className="hover:text-medical-primary transition-colors">Solutions</a>
            <a href="#" className="hover:text-medical-primary transition-colors">About</a>
            <Link to="/login" className="btn-medical-outline py-2 px-5">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Image/Pattern Wrapper */}
        <div className="absolute inset-0 z-0 bg-medical-gradient opacity-50">
          <div className="absolute inset-0 medical-grid"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto lg:flex items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-medical-soft border border-medical-primary/20 text-medical-primary text-xs font-bold uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-primary"></span>
              </span>
              Next-Gen Telemedicine
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-medical-text">
              Bring Your <span className="text-medical-primary">Health</span> Within Reach
            </h1>
            
            <p className="text-xl text-medical-secondary max-w-lg leading-relaxed">
              Experience a premium, secure, and intuitive investment in your well-being. Connect with specialists instantly.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link to="/register" className="btn-medical-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn-medical-outline">
                Login
              </Link>
            </div>
          </div>

          <div className="hidden lg:block lg:w-1/2 relative">
             <div className="relative z-10 animate-float">
                <div className="glass-card w-[500px] h-[350px] relative overflow-hidden group border-medical-border">
                   <div className="absolute inset-0 bg-medical-primary/5 group-hover:bg-medical-primary/10 transition-colors"></div>
                   <div className="relative z-20 h-full flex flex-col justify-end p-8">
                      <div className="text-medical-primary text-4xl mb-4">
                        <i className="fas fa-shield-alt"></i>
                      </div>
                      <h3 className="text-2xl font-bold text-medical-text mb-2">Secure & Compliant</h3>
                      <p className="text-medical-secondary">Enterprise-grade security for your medical records and consultations.</p>
                   </div>
                </div>
             </div>

             {/* Floating mini cards */}
             <div className="absolute -top-10 -right-10 glass rounded-xl p-4 w-48 shadow-medical-soft border-medical-border z-20 animate-pulse-slow">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-medical-accent flex items-center justify-center text-xs text-white">
                    <i className="fas fa-video"></i>
                   </div>
                   <div className="text-[10px] font-bold text-medical-text">4.2k Active Users</div>
                </div>
             </div>

             <div className="absolute -bottom-10 -left-10 glass rounded-xl p-4 w-56 shadow-medical-soft border-medical-border z-20 animate-float" style={{animationDelay: '1s'}}>
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-medical-primary flex items-center justify-center text-xs text-white">
                    <i className="fas fa-user-md"></i>
                   </div>
                   <div className="text-[10px] font-bold text-medical-text">Top Rated Specialists</div>
                </div>
             </div>
          </div>
        </div>
      </section>

       <section className="py-24 px-6 bg-medical-soft/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-bold text-medical-text">Build the future <span className="text-medical-primary">with us</span></h2>
            <div className="w-24 h-1 bg-medical-primary mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'fa-user-nurse', title: 'Expert Consult', desc: 'Real-time video access to thousands of specialists.' },
              { icon: 'fa-microchip', title: 'AI Diagnostics', desc: 'Leverage modern technology for symptom analysis.' },
              { icon: 'fa-vials', title: 'Secure Data', desc: 'Your health data is encrypted and always accessible.' }
            ].map((feature, idx) => (
              <div key={idx} className="glass-card group hover:scale-[1.02] border-medical-border">
                <div className="w-12 h-12 rounded-xl bg-medical-soft flex items-center justify-center mb-6 group-hover:bg-medical-primary/10 transition-all">
                  <i className={`fas ${feature.icon} text-medical-primary text-xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-medical-text mb-4">{feature.title}</h3>
                <p className="text-medical-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}