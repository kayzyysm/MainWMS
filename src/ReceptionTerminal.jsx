import React, { useState, useEffect } from 'react';
import { ChevronUp, Scan, Bell, CheckCircle, ArrowLeft, Layers, Package, Check } from 'lucide-react';

export default function ReceptionTerminal({ currentUser, onLogout }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  // State สำหรับเก็บสถานะการติ๊กของแต่ละชิ้นสินค้า (index ของ item)
  const [checkedItems, setCheckedItems] = useState({});

  const receipts = [
    { id: '1', code: 'WH-INV-561563', qtyItems: 4, items: [
      { name: 'Keyboard RGB Gaming', qty: 60, weight: '2.40 KG' },
      { name: 'Logitech G Pro X Superlight', qty: 120, weight: '1.25 KG' },
      { name: 'Monitor ASUS TUF Gaming 27"', qty: 5, weight: '6.50 KG' },
      { name: 'USB Hub 7-Port Type-C', qty: 20, weight: '0.65 KG' }
    ]},
    { id: '2', code: 'WH-INV-524531', qtyItems: 2, items: [
      { name: 'Graphics Card RTX 4060', qty: 6, weight: '1.80 KG' },
      { name: 'Power Supply 850W', qty: 10, weight: '3.10 KG' }
    ]},
    { id: '3', code: 'WH-INV-642747', qtyItems: 12, items: [{ name: 'Thermal Paste 4g', qty: 50, weight: '0.10 KG' }] },
    { id: '4', code: 'WH-INV-761563', qtyItems: 5, items: [{ name: 'DDR5 RAM 32GB', qty: 30, weight: '0.20 KG' }] },
    { id: '5', code: 'WH-INV-764222', qtyItems: 7, items: [{ name: 'CPU Air Cooler', qty: 15, weight: '1.10 KG' }] },
    { id: '6', code: 'WH-INV-767752', qtyItems: 13, items: [{ name: 'NVMe SSD 2TB', qty: 25, weight: '0.05 KG' }] },
    { id: '7', code: 'WH-INV-824523', qtyItems: 13, items: [{ name: 'PC Case ATX', qty: 8, weight: '5.20 KG' }] },
    { id: '8', code: 'WH-INV-832123', qtyItems: 13, items: [{ name: 'Wireless Mouse', qty: 40, weight: '0.30 KG' }] },
  ];

  // เมื่อเลือกใบเสร็จ ให้รีเซ็ตค่าการติ๊กทั้งหมดเป็น false
  const handleSelectReceipt = (rec) => {
    setSelectedReceipt(rec);
    setCheckedItems({});
    setViewMode('detail');
  };

  const handleScanClick = () => {
    const randomReceipt = receipts[Math.floor(Math.random() * receipts.length)];
    handleSelectReceipt(randomReceipt);
  };

  // ฟังก์ชันสลับสถานะการติ๊กของแต่ละสินค้า
  const toggleCheckItem = (index) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // ตรวจสอบว่าติ๊กครบทุกชิ้นหรือยัง
  const allChecked = selectedReceipt && selectedReceipt.items.every((_, idx) => checkedItems[idx]);

  const handleApprove = () => {
    if (!allChecked) return;
    alert(`อนุมัติใบเสร็จ ${selectedReceipt.code} เรียบร้อยแล้ว! ส่งข้อมูลเข้าคลังสำเร็จ`);
    setViewMode('list');
    setSelectedReceipt(null);
    setCheckedItems({});
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans flex gap-6">
      
      {/* ================= 1. LEFT SIDEBAR ================= */}
      <div className="w-[320px] lg:w-[380px] h-[calc(100vh-3rem)] sticky top-6 bg-[#0b0f19] text-white flex flex-col justify-between p-8 shrink-0 overflow-hidden rounded-3xl border border-slate-800 shadow-xl">

        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop"
            alt="Logistics Fleet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-black tracking-widest text-white leading-none">
            KPA
          </h1>
          <p className="text-3xl font-bold tracking-[0.35em] text-slate-200 mt-2">
            W . M S
          </p>
          <div className="mt-8 relative inline-block">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center animate-spin-slow">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-[#1a233a]/80 backdrop-blur-md border border-slate-700/60 rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentUser?.username || 'Receipt001'}
              </span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
              >
                Logout
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ================= 2. RIGHT MAIN CONTENT AREA ================= */}
      <div className="flex-1 mx-auto bg-slate-100 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden p-6 flex flex-col justify-between">
        
        <div>
          {/* Top Header Bar */}
          <div className="bg-slate-900 text-white px-8 py-5 rounded-2xl mb-6 flex justify-between items-center shadow-md border border-slate-800">
            <div>
              <h2 className="text-2xl font-serif tracking-wide text-center lg:text-left">Warehouse Automation System</h2>
              <p className="text-[11px] text-slate-400 tracking-[0.2em] uppercase text-center lg:text-left mt-0.5">
                ROLE: Reception {currentUser?.username || 'Receipt001'}
              </p>
            </div>
          </div>

          {/* Dynamic Content Container */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 min-h-[520px] flex flex-col justify-between">
            
            {viewMode === 'list' ? (
              // ================= VIEW 1: RECEPTION TERMINAL (LIST) =================
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900 tracking-wider">RECEPTION TERMINAL</h3>
                  <button
                    onClick={handleScanClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition transform hover:scale-105 cursor-pointer flex items-center gap-2"
                  >
                    <Scan size={18} /> SCAN
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-inner">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                    <Bell size={18} />
                  </div>
                  <span className="text-sm font-semibold text-rose-500">Receipt Status</span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {receipts.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm hover:border-indigo-400 hover:shadow-md transition"
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          RECEIPT {rec.id} <span className="text-slate-500 font-normal">[{rec.code}]</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Quantity : {rec.qtyItems} items
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectReceipt(rec)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer shadow"
                      >
                        Detail
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // ================= VIEW 2: RECEIPT DETAIL & CHECKLIST APPROVAL =================
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900 tracking-wider">RECEPTION TERMINAL</h3>
                  <button
                    onClick={() => { setViewMode('list'); setSelectedReceipt(null); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md transition cursor-pointer flex items-center gap-2 text-xs"
                  >
                    RECEIPT DOC
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-inner">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                    <Bell size={18} />
                  </div>
                  <span className="text-sm font-semibold text-rose-500">
                    You are organizing the items in <span className="font-bold">RECEIPT {selectedReceipt?.id} [{selectedReceipt?.code}]</span>
                  </span>
                </div>

                {/* Items Checklist List */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 mb-6">
                  {selectedReceipt?.items.map((item, idx) => {
                    const isChecked = !!checkedItems[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleCheckItem(idx)}
                        className={`border rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm cursor-pointer transition ${
                          isChecked ? 'bg-emerald-50/60 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Custom Checkbox Box */}
                          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                            isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <Check size={14} strokeWidth={3} />}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isChecked ? 'text-emerald-900 line-through opacity-80' : 'text-slate-800'}`}>
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Quantity : {item.qty} items</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{item.weight}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Approve Button (Disabled until all items are checked) */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    Checked: {Object.values(checkedItems).filter(Boolean).length} / {selectedReceipt?.items.length} items
                  </span>
                  <button
                    onClick={handleApprove}
                    disabled={!allChecked}
                    className={`px-8 py-3 rounded-xl font-bold shadow-lg transition text-sm flex items-center gap-2 ${
                      allChecked
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer transform hover:scale-105'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    APPROVE
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}