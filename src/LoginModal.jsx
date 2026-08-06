import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // รายชื่อ Roles ทั้งหมดสำหรับ Demo
  const roles = [
    { id: 'admin', label: 'Admin' },
    { id: 'staff', label: 'Staff' },
    { id: 'reception', label: 'Reception' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'planner', label: 'Planner' },
    { id: 'user', label: 'User' },
  ];

  // คลิกปุ่ม Role แล้ว Auto-fill Username & Password
  const handleSelectRole = (roleId) => {
    setUsername(roleId);
    setPassword(roleId);
    setError('');
  };

  // จัดการ Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim().toLowerCase();

    if (!cleanUser || !cleanPass) {
      setError('กรุณากรอก Username และ Password');
      return;
    }

    // ตรวจสอบว่า Password ตรงกับ Username หรือไม่
    if (cleanUser !== cleanPass) {
      setError('Password ต้องตรงกับ Username (สำหรับระบบ Demo)');
      return;
    }

    // ตรวจสอบว่าอยู่ใน Role ที่กำหนดไว้ไหม
    const validRoles = roles.map((r) => r.id);
    if (!validRoles.includes(cleanUser)) {
      setError('ไม่พบ Role นี้ในระบบ (ใช้ได้เฉพาะ admin, staff, reception, vendor, user)');
      return;
    }

    setError('');
    
    // ส่งข้อมูลเข้า Callback หรือแจ้งเตือน
    if (onLoginSuccess) {
      onLoginSuccess({ username: cleanUser, role: cleanUser });
    } else {
      alert(`เข้าสู่ระบบสำเร็จ! Role: ${cleanUser.toUpperCase()}`);
    }

    // รีเซ็ตค่าและปิด Modal
    setUsername('');
    setPassword('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop (พื้นหลังสีดำจาง + เบลอ) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl bg-[#0b051b] rounded-3xl overflow-hidden shadow-2xl border border-purple-900/30 flex flex-col md:flex-row min-h-[500px]"
          >
            {/* ปุ่มปิด (X) มุมขวาบน */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition-all"
            >
              ✕
            </button>

            {/* ฝั่งซ้าย: รูปภาพแทร็กเกอร์ Logistics & Text */}
            <div className="relative w-full md:w-1/2 p-8 flex flex-col justify-between overflow-hidden min-h-[220px] md:min-h-full">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000"
                alt="Logistics Background"
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b051b] via-transparent to-black/40" />
              <div className="absolute inset-0 bg-purple-900/20 mix-blend-overlay" />

              <div className="relative z-10">
                <span className="text-white font-extrabold tracking-wider text-xl drop-shadow-md">
                  KPA
                </span>
              </div>

              <div className="relative z-10 mt-auto">
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                  SIGN IN TO YOUR <br />
                  <span className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                    COMFORTABLE!
                  </span>
                </h2>
              </div>
            </div>

            {/* ฝั่งขวา: ฟอร์ม Login */}
            <div className="w-full md:w-1/2 bg-[#0d0722] p-8 md:p-10 flex flex-col justify-center">
              <div className="mb-6">
                <h1 className="text-3xl font-black text-white tracking-wide">
                  LOGIN
                </h1>
                <p className="text-xs text-gray-400 mt-1 tracking-wider uppercase">
                  Select role or type account ID
                </p>
              </div>

              {/* Quick Role Selector (กดเพื่อ Auto-fill) */}
              <div className="mb-6">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                  Quick Demo Select:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectRole(r.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        username === r.id
                          ? 'bg-purple-600 border-purple-400 text-white font-bold shadow-lg shadow-purple-900/50'
                          : 'bg-[#180f33] border-purple-900/40 text-purple-200 hover:border-purple-500 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Username (e.g. admin, staff, vendor)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#180f33] border border-purple-900/40 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#180f33] border border-purple-900/40 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>

                {/* แสดงข้อความแจ้งเตือนเมื่อเกิด Error */}
                {error && (
                  <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/50 px-3 py-2 rounded-lg">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 bg-gradient-to-r from-[#4f38a8] to-[#2e5cc0] hover:from-[#5b41be] hover:to-[#3567d6] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-950/50 hover:shadow-purple-900/60 active:scale-[0.98]"
                >
                  LOGIN
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}