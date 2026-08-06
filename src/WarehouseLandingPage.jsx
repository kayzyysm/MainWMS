import React, { useState } from 'react';
import Warehouse3DCanvas from './components/Warehouse3DCanvas';
import LoginModal from './LoginModal';

export default function WarehouseLandingPage({ currentUser, setCurrentUser, onLogout, onNavigate }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('was_user', JSON.stringify(userData));
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 font-sans scroll-smooth">

      {/* ================= 1. NAVBAR ================= */}
      <nav className="sticky top-0 z-50 bg-[#fafafa]/90 backdrop-blur-md px-8 py-5 flex justify-between items-center border-b border-gray-100">
        <div className="flex-1 flex justify-start">
          <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="text-2xl font-bold tracking-tighter">
            KPA
          </a>
        </div>

        <div className="hidden md:flex space-x-12 text-sm font-semibold text-gray-600">
          <a href="#benefits" onClick={(e) => scrollToSection(e, 'benefits')} className="hover:text-black transition-colors">
            Benefits
          </a>
          <a href="#how-to" onClick={(e) => scrollToSection(e, 'how-to')} className="hover:text-black transition-colors">
            How-to
          </a>
          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="hover:text-black transition-colors">
            Contact Us
          </a>
        </div>

        <div className="flex-1 flex justify-end">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="bg-[#1e293b] text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{currentUser.username || 'USER'} ({currentUser.role})</span>
              </div>
              <button
                onClick={onLogout}
                className="text-xs text-gray-500 hover:text-rose-600 font-semibold px-3 py-2 rounded-full hover:bg-rose-50 transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="bg-[#1e293b] text-white px-6 py-2.5 rounded-full text-xs font-semibold hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
            >
              SIGN IN <span>↗</span>
            </button>
          )}
        </div>
      </nav>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* ================= 2. HERO SECTION ================= */}
      <section id="hero" className="px-6 pt-12 pb-16 max-w-6xl mx-auto text-center scroll-mt-28">
        <h1 className="text-5xl md:text-7xl font-serif tracking-tight leading-tight mb-12">
          Warehouse<br />Automation System
        </h1>

        {currentUser ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left max-w-5xl mx-auto">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {(() => {
                  const role = currentUser?.role?.toLowerCase() || '';

                  if (role.includes('vendor') || role.includes('vender')) {
                    return (
                      <button 
                        onClick={() => onNavigate('vendor')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4c1d95] to-[#2563eb] text-white font-bold tracking-widest text-sm shadow-md hover:brightness-110 transition-all uppercase cursor-pointer"
                      >
                        INBOUND
                      </button>
                    );
                  }

                  if (role.includes('reception')) {
                    return (
                      <button 
                        onClick={() => onNavigate('reception')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4c1d95] to-[#2563eb] text-white font-bold tracking-widest text-sm shadow-md hover:brightness-110 transition-all uppercase cursor-pointer"
                      >
                        RECEPTION TERMINAL
                      </button>
                    );
                  }

                  if (role.includes('admin')) {
                    return (
                      <button 
                        onClick={() => onNavigate('admin')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4c1d95] to-[#2563eb] text-white font-bold tracking-widest text-sm shadow-md hover:brightness-110 transition-all uppercase cursor-pointer"
                      >
                        3D WAREHOUSE DASHBOARD
                      </button>
                    );
                  }

                  if (role.includes('staff')) {
                    return (
                      <button 
                        onClick={() => onNavigate('staff')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4c1d95] to-[#2563eb] text-white font-bold tracking-widest text-sm shadow-md hover:brightness-110 transition-all uppercase cursor-pointer"
                      >
                        STAFF TERMINAL
                      </button>
                    );
                  }

                  if (role.includes('planner')) {
                    return (
                      <button 
                        onClick={() => onNavigate('planner')}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4c1d95] to-[#2563eb] text-white font-bold tracking-widest text-sm shadow-md hover:brightness-110 transition-all uppercase cursor-pointer"
                      >
                        PLANNER TERMINAL
                      </button>
                    );
                  }

                  return (
                    <button 
                      onClick={() => onNavigate('outbound')}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4c1d95] to-[#2563eb] text-white font-bold tracking-widest text-sm shadow-md hover:brightness-110 transition-all uppercase cursor-pointer"
                    >
                      OUTBOUND
                    </button>
                  );
                })()}
              </div>

              {/* Profile Card */}
              <div className="flex-1 bg-[#182032] text-white rounded-3xl p-6 shadow-xl border border-slate-800 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
                    <span className="text-[11px] font-mono text-purple-400 font-semibold tracking-wider uppercase">User Profile & Role</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 uppercase">
                      ● Active
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">
                    {currentUser.username || 'USER_001'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mb-5">
                    ROLE: <span className="text-purple-300 font-semibold uppercase">{currentUser.role}</span>
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40 flex justify-between items-center">
                      <span className="text-slate-400">Assigned Gate:</span>
                      <span className="font-semibold text-purple-200">Dock A-04</span>
                    </div>
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40 flex justify-between items-center">
                      <span className="text-slate-400">Scheduled Time:</span>
                      <span className="font-semibold text-emerald-300">14:30 PM</span>
                    </div>
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40 flex justify-between items-center">
                      <span className="text-slate-400">System Status:</span>
                      <span className="font-semibold text-amber-300">Ready</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/40 mt-4 text-[10px] text-slate-500 flex justify-between font-mono">
                  <span>SYSTEM_ID: #WAS-8821</span>
                  <span>VER 2.4</span>
                </div>
              </div>

            </div>

            <div className="lg:col-span-7 h-[380px] lg:h-auto min-h-[350px] bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-900 relative">
              <Warehouse3DCanvas />
            </div>
          </div>
        ) : (
          <div className="w-full px-4">
            <div className="max-w-3xl mx-auto h-[320px] md:h-[420px] relative z-10 -mb-35 md:-mb-40">
              <Warehouse3DCanvas />
            </div>
            <div className="w-full h-[300px] md:h-[300px] bg-[#1e293b] rounded-[2rem] shadow-xl pt-30 md:pt-39 flex items-center justify-center text-white">
              <p className="text-sm font-medium text-slate-300">
                Please <button onClick={() => setIsLoginOpen(true)} className="underline text-purple-300 font-bold hover:text-white">Sign In</button> to access the automation dashboard.
              </p>
            </div>
          </div>
        )}

        <div className="mt-20 pt-8 flex flex-wrap justify-between items-center opacity-40 grayscale gap-6">
          <span className="text-xl font-bold italic">Logoipsum</span>
          <span className="text-xl font-bold">Logoipsum</span>
          <span className="text-xl font-serif">LOGOIPSUM</span>
          <span className="text-xl font-mono">logoipsum</span>
          <span className="text-xl font-sans font-black">LOGOIPSUM</span>
        </div>
      </section>

      {/* ================= 3. BENEFITS SECTION ================= */}
      <section id="benefits" className="py-24 max-w-6xl mx-auto px-6 border-t border-gray-200/60 scroll-mt-20">
        <p className="text-xs font-mono font-semibold text-gray-500 mb-4 tracking-wider uppercase">Benefits</p>
        <h2 className="text-5xl font-serif mb-4">We've cracked the code.</h2>
        <p className="text-gray-500 mb-16 text-sm">Area provides real insights, without the data overload.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div>
            <div className="mb-3 text-lg">🔗</div>
            <h3 className="font-semibold text-sm mb-2">Amplify Insights</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Unlock data-driven decisions with comprehensive analytics, revealing key opportunities for strategic regional growth.
            </p>
          </div>
          <div>
            <div className="mb-3 text-lg">🌐</div>
            <h3 className="font-semibold text-sm mb-2">Control Your Global Presence</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Manage and track satellite offices, ensuring consistent performance and streamlined operations everywhere.
            </p>
          </div>
          <div>
            <div className="mb-3 text-lg">🗣️</div>
            <h3 className="font-semibold text-sm mb-2">Remove Language Barriers</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Adapt to diverse markets with built-in localization for clear communication and enhanced user experience.
            </p>
          </div>
          <div>
            <div className="mb-3 text-lg">📈</div>
            <h3 className="font-semibold text-sm mb-2">Visualize Growth</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Generate precise, visually compelling reports that illustrate your growth trajectories across all regions.
            </p>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full h-[450px] rounded-[2rem] overflow-hidden shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop" 
            alt="Landscape" 
            className="w-full h-full object-cover" 
          />
        </div>
      </section>

      {/* ================= 3. HOW-TO / FEATURES SECTION ================= */}
      <section id="how-to" className="py-24 max-w-6xl mx-auto px-6 border-t border-gray-200/60 scroll-mt-20">
        
        {/* Part A: See the Big Picture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <h2 className="text-5xl font-serif mb-6">See the Big Picture</h2>
            <p className="text-xs text-gray-500 mb-10 leading-relaxed max-w-md">
              Area turns your data into clear, vibrant visuals that show you exactly what's happening in each region.
            </p>
            
            <div className="space-y-6 border-t border-gray-100 pt-6">
              {[
                "Spot Trends in Seconds: No more digging through numbers.",
                "Get Everyone on the Same Page: Share easy-to-understand reports with your team.",
                "Make Presentations Pop: Interactive maps and dashboards keep your audience engaged.",
                "Your Global Snapshot: Get a quick, clear overview of your entire operation."
              ].map((text, idx) => (
                <div key={idx} className="flex items-start gap-4 text-xs font-medium border-b border-gray-100 pb-4">
                  <span className="text-gray-400">0{idx + 1}</span>
                  <p className="text-gray-800">{text}</p>
                </div>
              ))}
            </div>

            <button className="mt-8 bg-[#1e293b] text-white px-6 py-3 rounded-full text-xs font-medium hover:bg-black transition-all">
              Discover More
            </button>
          </div>

          <div className="h-[500px] bg-[#eae5d9] rounded-[2rem] overflow-hidden flex items-center justify-center p-8">
            <img 
              src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1000&auto=format&fit=crop" 
              alt="Artistic 3D Display" 
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Part B: Why Choose Area? Comparison Table */}
        <div className="text-center mb-24">
          <p className="text-xs font-mono text-gray-400 mb-2">Specs</p>
          <h2 className="text-5xl font-serif mb-4">Why Choose Area?</h2>
          <p className="text-xs text-gray-500 max-w-lg mx-auto mb-8">
            You need a solution that keeps up. That's why we developed Area. A developer-friendly approach to streamline your business.
          </p>
          <button className="bg-[#1e293b] text-white px-6 py-3 rounded-full text-xs font-medium hover:bg-black transition-all mb-16">
            Discover More
          </button>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-gray-200 rounded-3xl overflow-hidden bg-white text-left text-xs">
            {/* Column 1: Area */}
            <div className="p-8 bg-white border-b md:border-b-0 md:border-r border-gray-200">
              <h3 className="text-xl font-bold mb-8">Area</h3>
              <ul className="space-y-6 text-gray-700">
                <li className="flex items-center gap-2">✓ Ultra-fast browsing</li>
                <li className="flex items-center gap-2">✓ Advanced AI insights</li>
                <li className="flex items-center gap-2">✓ Seamless integration</li>
                <li className="flex items-center gap-2">✓ Advanced AI insights</li>
                <li className="flex items-center gap-2">✓ Ultra-fast browsing</li>
                <li className="flex items-center gap-2">✓ Full UTF-8 support</li>
              </ul>
            </div>

            {/* Column 2: WebSurge */}
            <div className="p-8 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-200">
              <h3 className="text-xl font-bold text-gray-400 mb-8">WebSurge</h3>
              <ul className="space-y-6 text-gray-500">
                <li className="flex items-center gap-2">✓ Fast browsing</li>
                <li className="flex items-center gap-2">✓ Basic AI recommendations</li>
                <li className="flex items-center gap-2">✕ Restricts customization</li>
                <li className="flex items-center gap-2">✕ Basic AI insights</li>
                <li className="flex items-center gap-2">✓ Fast browsing</li>
                <li className="flex items-center gap-2">✕ Potential display errors</li>
              </ul>
            </div>

            {/* Column 3: HyperView */}
            <div className="p-8 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-400 mb-8">HyperView</h3>
              <ul className="space-y-6 text-gray-400">
                <li className="flex items-center gap-2">✕ Moderate speeds</li>
                <li className="flex items-center gap-2">✕ No AI assistance</li>
                <li className="flex items-center gap-2">✕ Steep learning curve</li>
                <li className="flex items-center gap-2">✕ No AI assistance</li>
                <li className="flex items-center gap-2">✕ Moderate speeds</li>
                <li className="flex items-center gap-2">✕ Partial UTF-8 support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Part C: Testimonial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-32">
          <div className="h-[400px] rounded-[2rem] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1000&auto=format&fit=crop" 
              alt="Testimonial Art" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <blockquote className="text-2xl md:text-3xl font-serif leading-snug mb-8">
              “I was skeptical, but Area has completely transformed the way I manage my business. The data visualizations are so clear and intuitive, and the platform is so easy to use. I can't imagine running my company without it.”
            </blockquote>
            <p className="font-semibold text-sm">John Smith</p>
            <p className="text-xs text-gray-400 font-mono">Head of Data</p>
          </div>
        </div>

        {/* Part D: Map Your Success */}
        <div className="pt-12 border-t border-gray-200">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-serif">Map Your Success</h2>
            <button className="bg-[#1e293b] text-white px-6 py-2.5 rounded-full text-xs hover:bg-black transition-all">
              Discover More
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div>
              <span className="text-6xl font-light text-gray-300 block mb-6">01</span>
              <h3 className="font-semibold text-sm mb-2">Get Started</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                With our intuitive setup, you're up and running in minutes.
              </p>
            </div>
            <div>
              <span className="text-6xl font-light text-gray-300 block mb-6">02</span>
              <h3 className="font-semibold text-sm mb-2">Customize and Configure</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Adapt Area to your specific requirements and preferences.
              </p>
            </div>
            <div>
              <span className="text-6xl font-light text-gray-300 block mb-6">03</span>
              <h3 className="font-semibold text-sm mb-2">Grow Your Business</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Make informed decisions to exceed your goals.
              </p>
            </div>
          </div>

          <div className="w-full h-[400px] rounded-[2rem] overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop" 
              alt="Map landscape" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

      </section>
      
      
      {/* ================= 4. FOOTER ================= */}
      <footer id="contact" className="py-20 max-w-6xl mx-auto px-6 text-center border-t border-gray-200 scroll-mt-20">
        <h2 className="text-4xl font-serif mb-4">Connect with us</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          Schedule a quick call to learn how KPA Warehouse Automation System can work for you.
        </p>
        
        <div className="mt-16 pt-8 border-t border-gray-200/60 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
          <div className="flex gap-6 font-semibold text-gray-700">
            <a href="#benefits" onClick={(e) => scrollToSection(e, 'benefits')}>Benefits</a>
            <a href="#how-to" onClick={(e) => scrollToSection(e, 'how-to')}>How-to</a>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-black text-lg">KPA</span>
            <span>© KPA. 2026</span>
          </div>

          <div>All Rights Reserved</div>
        </div>
      </footer>

    </div>
  );
}