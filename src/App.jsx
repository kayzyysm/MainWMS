import React, { useState } from 'react';
import WarehouseLandingPage from './WarehouseLandingPage';
import VendorTerminal from './VendorTerminal';
import ReceptionTerminal from './ReceptionTerminal';
import AdminDashboard from './AdminDashboard';
import PlannerTerminal from './PlannerTerminal';
import StaffTerminal from './StaffTerminal';

const TerminalPlaceholder = ({ title, roleName, onBack }) => (
  <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col items-center justify-center p-6 text-center">
    <div className="bg-[#161d2f] border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl">
      <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block mb-2">
        {roleName} Section
      </span>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-slate-400 text-sm mb-6">
        หน้านี้กำลังอยู่ในระหว่างการพัฒนา (Under Construction)
      </p>
      <button
        onClick={onBack}
        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-xs tracking-wider transition-all"
      >
        BACK TO LANDING PAGE
      </button>
    </div>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState('landing');

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('was_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('was_user');
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen">
      {currentView === 'landing' && (
        <WarehouseLandingPage
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onLogout={handleLogout}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {currentView === 'vendor' && (
        <VendorTerminal
          currentUser={currentUser}
          onBack={() => setCurrentView('landing')}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'reception' && (
        <ReceptionTerminal
          currentUser={currentUser}
          onBack={() => setCurrentView('landing')}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'admin' && (
        <AdminDashboard
          currentUser={currentUser}
          onBack={() => setCurrentView('landing')}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'staff' && (
        <StaffTerminal
          currentUser={currentUser}
          onBack={() => setCurrentView('landing')}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'planner' && (
        <PlannerTerminal
          currentUser={currentUser}
          onBack={() => setCurrentView('landing')}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'outbound' && (
        <TerminalPlaceholder
          title="OUTBOUND DASHBOARD"
          roleName="User / Outbound"
          onBack={() => setCurrentView('landing')}
        />
      )}
    </div>
  );
}