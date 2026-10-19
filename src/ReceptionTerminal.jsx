import React, { useState, useEffect } from 'react';
import { ChevronUp, Scan, Bell, ArrowLeft, Package, Check, Search, Building2 } from 'lucide-react';

export default function ReceptionTerminal({ currentUser, onLogout }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State สำหรับเก็บรายการใบเสร็จจาก MongoDB
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  // State สำหรับเช็คลิสต์รายการสินค้าของใบเสร็จที่เลือก
  const [currentReceiptItems, setCurrentReceiptItems] = useState([]);

  // 1. ดึงรายการใบเสร็จทั้งหมดจาก MongoDB ผ่าน API
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/receipts');
      if (res.ok) {
        const data = await res.json();
        setReceipts(data);
      }
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // กรองรายการใบเสร็จตามคำค้นหา (ค้นจาก ID, docNo, หรือ status)
  const filteredReceipts = receipts.filter(rec => {
    const q = searchQuery.toLowerCase().trim();
    const docNo = (rec.docNo || '').toLowerCase();
    const receiptId = (rec.receiptId || rec.id || '').toLowerCase();
    const company = (rec.company || 'Vendor Partner').toLowerCase();
    return receiptId.includes(q) || docNo.includes(q) || company.includes(q);
  });

  // เมื่อเลือกใบเสร็จ
  const handleSelectReceipt = (rec) => {
    setSelectedReceipt(rec);
    const formattedItems = (rec.items || []).map(item => ({
      name: item.productName || item.name,
      id: item.id,
      qty: item.quantity || item.qty,
      initialQty: item.quantity || item.qty,
      weight: `${item.totalWeight || item.weight || '0'} KG`
    }));
    setCurrentReceiptItems(formattedItems);
    setViewMode('detail');
  };

  const handleScanGlobal = () => {
    if (receipts.length === 0) return alert('ไม่มีใบเสร็จในระบบ');
    const randomReceipt = receipts[Math.floor(Math.random() * receipts.length)];
    handleSelectReceipt(randomReceipt);
  };

  // ฟังก์ชันสแกนสินค้าแต่ละรายการ (ลด Qty ลงทีละ 1)
  const handleScanItem = (index, e) => {
    e.stopPropagation();
    setCurrentReceiptItems(prev => {
      const updated = [...prev];
      if (updated[index].qty > 0) {
        updated[index] = {
          ...updated[index],
          qty: updated[index].qty - 1
        };
      }
      return updated;
    });
  };

  // เช็คว่าสินค้าทุกชิ้นในใบเสร็จถูกสแกนครบจำนวนหรือยัง
  const allScanned = currentReceiptItems.length > 0 && currentReceiptItems.every(item => item.qty === 0);

  // 2. ฟังก์ชันกด APPROVE เพื่อเปลี่ยนสถานะเป็น Confirmed ใน MongoDB
  const handleApprove = async () => {
    if (!allScanned || !selectedReceipt) return;

    try {
      const dbId = selectedReceipt._id;
      const res = await fetch(`http://localhost:5000/api/receipts/${dbId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Confirmed' })
      });

      if (res.ok) {
        alert(`อนุมัติใบเสร็จ ${selectedReceipt.docNo} เรียบร้อยแล้ว! ส่งข้อมูลเข้าคลังสำเร็จ`);
        await fetchReceipts(); // ดึงข้อมูลล่าสุดมาอัปเดตหน้าจอ
        setViewMode('list');
        setSelectedReceipt(null);
        setCurrentReceiptItems([]);
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะใบเสร็จ');
      }
    } catch (err) {
      console.error('Error approving receipt:', err);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    }
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
            W M S
          </p>
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
              /* VIEW 1: RECEPTION TERMINAL LIST */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-lg font-black text-slate-900 tracking-wider shrink-0">RECEPTION TERMINAL</h3>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="ค้นหาเลขใบเสร็จ หรือ ชื่อบริษัท..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                      />
                    </div>

                    <button
                      onClick={handleScanGlobal}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md transition transform hover:scale-105 cursor-pointer flex items-center gap-2 shrink-0"
                    >
                      <Scan size={16} /> SCAN
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-inner">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                    <Bell size={18} />
                  </div>
                  <span className="text-sm font-semibold text-rose-500">Receipt Status (Live MongoDB)</span>
                </div>

                {/* รายการใบเสร็จจาก DB */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {loading ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-medium">
                      กำลังโหลดรายการใบเสร็จ...
                    </div>
                  ) : filteredReceipts.length > 0 ? (
                    filteredReceipts.map((rec) => (
                      <div
                        key={rec._id || rec.id}
                        className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm hover:border-indigo-400 hover:shadow-md transition"
                      >
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {rec.receiptId || `RECEIPT ${rec.id}`} <span className="text-slate-500 font-normal">[{rec.docNo}]</span>
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mt-0.5">
                            <Building2 size={13} /> {rec.company || 'Vendor Partner Co., Ltd.'}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Quantity : {rec.quantity || (rec.items ? rec.items.length : 0)} items | Status: {' '}
                            <span className={rec.status === 'Confirmed' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                              {rec.status || 'Pending'}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelectReceipt(rec)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2 rounded-xl transition cursor-pointer shadow"
                        >
                          Detail
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      ไม่พบใบเสร็จรับเข้าในระบบ
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* VIEW 2: RECEIPT DETAIL & SCAN CHECKLIST */
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
                    Scanning items in <span className="font-bold">{selectedReceipt?.receiptId || selectedReceipt?.docNo}</span>
                  </span>
                </div>

                {/* Items Scan Checklist */}
                <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 mb-6">
                  {currentReceiptItems.map((item, idx) => {
                    const isCompleted = item.qty === 0;
                    return (
                      <div
                        key={idx}
                        className={`border rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm transition ${
                          isCompleted ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition ${
                            isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white text-slate-400'
                          }`}>
                            {isCompleted ? <Check size={14} strokeWidth={3} /> : <Package size={14} />}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isCompleted ? 'text-emerald-900 line-through opacity-80' : 'text-slate-800'}`}>
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Remaining Qty: <strong className={item.qty > 0 ? 'text-indigo-600' : 'text-emerald-600'}>{item.qty}</strong> / {item.initialQty} pcs
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-500">{item.weight}</span>
                          <button
                            onClick={(e) => handleScanItem(idx, e)}
                            disabled={isCompleted}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                              isCompleted
                                ? 'bg-emerald-200 text-emerald-700 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-95'
                            }`}
                          >
                            <Scan size={14} /> Scan QR
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* APPROVE BUTTON */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    Completed Items: {currentReceiptItems.filter(i => i.qty === 0).length} / {currentReceiptItems.length}
                  </span>
                  <button
                    onClick={handleApprove}
                    disabled={!allScanned}
                    className={`px-8 py-3 rounded-xl font-bold shadow-lg transition text-sm flex items-center gap-2 ${
                      allScanned
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