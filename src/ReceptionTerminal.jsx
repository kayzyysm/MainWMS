import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, Scan, Bell, ArrowLeft, Package, Check, Search, Building2, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function ReceptionTerminal({ currentUser, onLogout }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State สำหรับเก็บรายการใบเสร็จจาก MongoDB
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  // State สำหรับเช็คลิสต์รายการสินค้าของใบเสร็จที่เลือก
  const [currentReceiptItems, setCurrentReceiptItems] = useState([]);

  // State และ Ref สำหรับระบบเปิดกล้องสแกนจริง
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  // 1. ดึงรายการใบเสร็จทั้งหมดจาก MongoDB ผ่าน API (กรองเฉพาะ Pending สำหรับหน้า Reception)
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://mainwms-backend.onrender.com/api/receipts');
      if (res.ok) {
        const data = await res.json();
        const pendingReceipts = data.filter(rec => rec.status === 'Pending' || !rec.status);
        setReceipts(pendingReceipts);
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

  // ฟังก์ชันเริ่มเปิดกล้องสแกนจริง
  const startCameraScan = () => {
    setIsScannerOpen(true);
    setTimeout(() => {
      const scannerId = "qr-reader-container";
      if (document.getElementById(scannerId)) {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(scannerId);
        }
        
        const html5QrCode = html5QrCodeRef.current;
        html5QrCode.start(
          { facingMode: "environment" }, // ใช้กล้องหลังมือถือ
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            // เมื่อสแกน QR โค้ดสำเร็จจากสติกเกอร์
            handleSuccessfulScan(decodedText);
            stopCameraScan();
          },
          (errorMessage) => {
            // กำลังกวาดหา QR Code (ปล่อยว่างไว้ได้)
          }
        ).catch(err => {
          console.error("Unable to start scanning.", err);
          alert("ไม่สามารถเปิดใช้งานกล้องได้ กรุณาตรวจสอบสิทธิ์การเข้าถึงกล้อง (HTTPS Required)");
          setIsScannerOpen(false);
        });
      }
    }, 200);
  };

  // ฟังก์ชันปิดกล้องสแกน
  const stopCameraScan = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        setIsScannerOpen(false);
      }).catch(err => {
        console.error("Failed to clear html5QrCode instance.", err);
        setIsScannerOpen(false);
      });
    } else {
      setIsScannerOpen(false);
    }
  };

  // จัดการเมื่อสแกน QR Code สำเร็จ (เช็กเลขใบเสร็จ + ตัดยอด SKU)
  const handleSuccessfulScan = (scannedText) => {
    console.log("Scanned QR Text:", scannedText);
    const text = scannedText.trim();

    // รูปแบบสติกเกอร์ของคุณคือ: WH-INV-xxxxxx-SKU (เช่น WH-INV-763959-PRD-001)
    const parts = text.split('-');
    
    if (parts.length >= 4) {
      const scannedDocNo = `${parts[0]}-${parts[1]}-${parts[2]}`;
      const scannedSku = `${parts[3]}-${parts[4]}`;

      // 1. เช็กความถูกต้อง: เลขใบเสร็จใน QR ต้องตรงกับใบเสร็จที่กำลังเปิดตรวจรับอยู่ตอนนี้
      const activeDocNo = selectedReceipt?.docNo || selectedReceipt?.receiptId;
      if (activeDocNo && scannedDocNo !== activeDocNo) {
        alert(`❌ ผิดพลาด! สติกเกอร์นี้เป็นของใบเสร็จ "${scannedDocNo}" แต่คุณกำลังตรวจรับใบเสร็จ "${activeDocNo}" อยู่`);
        return;
      }

      // 2. ค้นหาสินค้าในเช็คลิสต์ของใบเสร็จนี้
      const matchedIndex = currentReceiptItems.findIndex(item => 
        item.id?.toLowerCase() === scannedSku.toLowerCase()
      );

      if (matchedIndex > -1) {
        setCurrentReceiptItems(prev => {
          const updated = [...prev];
          if (updated[matchedIndex].qty > 0) {
            updated[matchedIndex] = {
              ...updated[matchedIndex],
              qty: updated[matchedIndex].qty - 1
            };
          }
          return updated;
        });
        alert(`✅ สแกนสำเร็จ: ${currentReceiptItems[matchedIndex].name} (${scannedSku}) ตัดยอดเหลือ ${Math.max(0, currentReceiptItems[matchedIndex].qty - 1)} ชิ้น`);
      } else {
        alert(`⚠️ ไม่พบสินค้า SKU "${scannedSku}" ในใบเสร็จนี้`);
      }

    } else {
      alert(`⚠️ รูปแบบ QR Code ไม่ถูกต้อง: "${text}"`);
    }
  };

  // กรองรายการใบเสร็จตามคำค้นหา
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

  // เช็คว่าสินค้าทุกชิ้นในใบเสร็จถูกสแกนครบจำนวนหรือยัง
  const allScanned = currentReceiptItems.length > 0 && currentReceiptItems.every(item => item.qty === 0);

  // 2. ฟังก์ชันกด APPROVE เพื่อเปลี่ยนสถานะเป็น Confirmed ใน MongoDB
  const handleApprove = async () => {
    if (!allScanned || !selectedReceipt) return;

    try {
      const dbId = selectedReceipt._id;
      const res = await fetch(`https://mainwms-backend.onrender.com/api/receipts/${dbId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Confirmed' })
      });

      if (res.ok) {
        alert(`อนุมัติใบเสร็จ ${selectedReceipt.docNo || selectedReceipt.receiptId} เรียบร้อยแล้ว! ส่งข้อมูลเข้าคลังสำเร็จ`);
        await fetchReceipts();
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
    <div className="p-3 sm:p-6 bg-slate-900 min-h-screen font-sans flex flex-col lg:flex-row gap-4 sm:gap-6 relative">
      
      {/* ================= MODAL กล้องสแกนจริง ================= */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-700 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-sm tracking-wide">สแกน QR Code สินค้า</h3>
              <button 
                onClick={stopCameraScan} 
                className="bg-rose-500/20 text-rose-400 p-2 rounded-full hover:bg-rose-500/30 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* กรอบแสดงวิดีโอจากกล้อง */}
            <div id="qr-reader-container" className="w-full overflow-hidden rounded-2xl bg-black"></div>
            
            <p className="text-slate-400 text-xs text-center mt-3 leading-relaxed">
              ส่องกล้องไปที่ QR Code บนสติกเกอร์กล่องสินค้าเพื่อตัดยอดอัตโนมัติ
            </p>
          </div>
        </div>
      )}

      {/* ================= 1. LEFT SIDEBAR (แก้ไขปัญหาภาพซ้อนด้วย relative และ z-10) ================= */}
      <div className="w-full lg:w-[320px] lg:xl:w-[380px] lg:h-[calc(100vh-3rem)] lg:sticky lg:top-6 bg-[#0b0f19] text-white flex flex-col justify-between p-6 sm:p-8 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl relative">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop"
            alt="Logistics Fleet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
        </div>

        {/* Top Branding Content (z-10 อยู่บนสุด ป้องกันภาพทับ) */}
        <div className="relative z-10 flex flex-row lg:flex-col justify-between items-center lg:items-start">
          <div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-widest text-white leading-none">
              KPA
            </h1>
            <p className="text-xl lg:text-3xl font-bold tracking-[0.35em] text-slate-200 mt-1 lg:mt-2">
              W M S
            </p>
          </div>
          
          <div className="bg-[#1a233a]/90 backdrop-blur-md border border-slate-700/60 rounded-full px-4 py-2 lg:hidden flex items-center gap-2 shadow-lg">
            <span className="text-xs font-semibold text-slate-200">
              {currentUser?.username || 'Receipt001'}
            </span>
            {onLogout && (
              <button onClick={onLogout} className="text-xs text-rose-400 font-medium ml-2 cursor-pointer">
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Bottom User Info Content (z-10) */}
        <div className="relative z-10 hidden lg:flex">
          <div className="w-full bg-[#1a233a]/80 backdrop-blur-md border border-slate-700/60 rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg">
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
      <div className="flex-1 mx-auto w-full bg-slate-100 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-slate-700 shadow-2xl overflow-hidden p-4 sm:p-6 flex flex-col justify-between">
        
        <div>
          {/* Top Header Bar */}
          <div className="bg-slate-900 text-white px-4 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 flex justify-between items-center shadow-md border border-slate-800">
            <div>
              <h2 className="text-lg sm:text-2xl font-serif tracking-wide text-left">Warehouse Automation System</h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 tracking-[0.1em] sm:tracking-[0.2em] uppercase text-left mt-0.5">
                ROLE: Reception {currentUser?.username || 'Receipt001'}
              </p>
            </div>
          </div>

          {/* Dynamic Content Container */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 min-h-[450px] sm:min-h-[520px] flex flex-col justify-between">
            
            {viewMode === 'list' ? (
              /* VIEW 1: RECEPTION TERMINAL LIST */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wider">RECEPTION TERMINAL</h3>
                  
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2 rounded-xl font-bold text-xs shadow-md transition transform active:scale-95 cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0"
                    >
                      <Scan size={16} /> SCAN
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3 shadow-inner">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                    <Bell size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-rose-500">Receipt Status - Pending Inspection (Live MongoDB)</span>
                </div>

                {/* รายการใบเสร็จจาก DB */}
                <div className="space-y-3 max-h-[350px] sm:max-h-[380px] overflow-y-auto pr-1">
                  {loading ? (
                    <div className="text-center py-12 text-slate-400 text-xs font-medium">
                      กำลังโหลดรายการใบเสร็จ...
                    </div>
                  ) : filteredReceipts.length > 0 ? (
                    filteredReceipts.map((rec) => (
                      <div
                        key={rec._id || rec.id}
                        className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-indigo-400 hover:shadow-md transition"
                      >
                        <div>
                          <p className="font-bold text-slate-800 text-xs sm:text-sm">
                            {rec.receiptId || `RECEIPT`} <span className="text-slate-500 font-normal">[{rec.docNo}]</span>
                          </p>
                          <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mt-0.5">
                            <Building2 size={13} /> {rec.company || 'Vendor Partner Co., Ltd.'}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Quantity : {rec.quantity || (rec.items ? rec.items.length : 0)} items | Status: {' '}
                            <span className="text-amber-600 font-bold">
                              {rec.status || 'Pending'}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelectReceipt(rec)}
                          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 sm:py-2 rounded-xl transition cursor-pointer shadow text-center"
                        >
                          Detail
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      ไม่พบใบเสร็จรับเข้าที่รอตรวจสอบ (Pending) ในระบบ
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* VIEW 2: RECEIPT DETAIL & SCAN CHECKLIST */
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setViewMode('list'); setSelectedReceipt(null); }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 text-xs"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wider">RECEPTION TERMINAL</h3>
                  </div>

                  {/* ปุ่มเปิดกล้องสแกนจริงหลัก */}
                  <button
                    onClick={startCameraScan}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 cursor-pointer animate-pulse"
                  >
                    <Scan size={16} /> เปิดกล้องสแกน QR Code
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center gap-3 shadow-inner">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                    <Bell size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-rose-500 truncate">
                    Scanning items in <span className="font-bold">{selectedReceipt?.receiptId || selectedReceipt?.docNo}</span>
                  </span>
                </div>

                {/* Items Scan Checklist */}
                <div className="space-y-3 max-h-[280px] sm:max-h-[320px] overflow-y-auto pr-1 mb-4 sm:mb-6">
                  {currentReceiptItems.map((item, idx) => {
                    const isCompleted = item.qty === 0;
                    return (
                      <div
                        key={idx}
                        className={`border rounded-xl sm:rounded-2xl p-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition ${
                          isCompleted ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition ${
                            isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white text-slate-400'
                          }`}>
                            {isCompleted ? <Check size={14} strokeWidth={3} /> : <Package size={14} />}
                          </div>
                          <div>
                            <p className={`font-bold text-xs sm:text-sm ${isCompleted ? 'text-emerald-900 line-through opacity-80' : 'text-slate-800'}`}>
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              SKU: <span className="font-mono text-indigo-600">{item.id}</span> | Remaining Qty: <strong className={item.qty > 0 ? 'text-indigo-600' : 'text-emerald-600'}>{item.qty}</strong> / {item.initialQty} pcs
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200">
                          <span className="text-xs font-semibold text-slate-500">{item.weight}</span>
                          <button
                            onClick={startCameraScan}
                            disabled={isCompleted}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow ${
                              isCompleted
                                ? 'bg-emerald-200 text-emerald-700 cursor-not-allowed shadow-none'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                            }`}
                          >
                            <Scan size={14} /> สแกนด้วยกล้อง
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* APPROVE BUTTON */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    Completed Items: {currentReceiptItems.filter(i => i.qty === 0).length} / {currentReceiptItems.length}
                  </span>
                  <button
                    onClick={handleApprove}
                    disabled={!allScanned}
                    className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold shadow-lg transition text-sm flex items-center justify-center gap-2 ${
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