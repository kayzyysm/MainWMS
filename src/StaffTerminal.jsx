import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ArrowLeft, CheckCircle2, QrCode, ScanLine, Truck, MapPin, Sparkles, Scan, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function StaffTerminal({ currentUser, onLogout }) {
  const [readyReceipts, setReadyReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // State สำหรับควบคุมระบบกล้องสแกนจริง
  const [scanStep, setScanStep] = useState(null); // 'slot' หรือ 'item'
  const [scannedSlotTarget, setScannedSlotTarget] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const html5QrCodeRef = useRef(null);
  const [scanSuccess, setScanSuccess] = useState(false);

  // ดึงข้อมูลใบเสร็จจาก Backend (เฉพาะ Ready to Pick)
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await fetch('https://mainwms-backend.onrender.com/api/receipts');
      if (res.ok) {
        const data = await res.json();
        const staffReady = data.filter(rec => rec.status === 'Ready to Pick');

        const formatted = staffReady.map(rec => ({
          id: rec._id,
          receiptId: rec.receiptId || rec.docNo || 'RECEIPT',
          code: rec.docNo || 'WH-INV',
          supplier: rec.company || 'Vendor Partner',
          items: (rec.items || []).map((item, idx) => ({
            id: item.id || `item-${idx}`,
            name: item.productName || item.name,
            qty: item.quantity || item.qty,
            targetLocation: item.targetLocation || 'ZONE-A1 (Slot 1)',
            actionType: item.actionType || 'NEW',
            actionLabel: item.actionLabel || '✨ พาเลทใหม่',
            sku: item.sku || 'SKU-001',
            weight: `${item.totalWeight || item.weight || '0'} KG`
          }))
        }));
        setReadyReceipts(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch receipts for staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleOpenReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setSelectedItem(receipt.items.length > 0 ? receipt.items[0] : null);
    setScannedSlotTarget(null);
    setScanSuccess(false);
  };

  // เปิดใช้งานกล้องมือถือจริง
  const startCameraScan = (stepType) => {
    setScanStep(stepType);
    setIsScannerOpen(true);
    setTimeout(() => {
      const scannerId = "staff-qr-reader-container";
      if (document.getElementById(scannerId)) {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(scannerId);
        }
        
        const html5QrCode = html5QrCodeRef.current;
        html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            handleScanResult(decodedText, stepType);
            stopCameraScan();
          },
          (errorMessage) => {}
        ).catch(err => {
          console.error("Unable to start scanning.", err);
          alert("ไม่สามารถเปิดกล้องได้ กรุณาตรวจสอบสิทธิ์กล้องของเบราว์เซอร์ (HTTPS Required)");
          setIsScannerOpen(false);
        });
      }
    }, 200);
  };

  const stopCameraScan = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        setIsScannerOpen(false);
      }).catch(err => {
        setIsScannerOpen(false);
      });
    } else {
      setIsScannerOpen(false);
    }
  };

  // ตรวจสอบข้อความ QR Code ที่สแกนได้จากกล้องจริง (รองรับทั้งรูปแบบ PDF และข้อความระบบ)
  const handleScanResult = (decodedText, stepType) => {
    const text = decodedText.trim();
    
    if (stepType === 'slot') {
      const cleanScanned = text.toUpperCase().replace(/[\s\(\)]/g, ''); // ตัดช่องว่างและวงเล็บออก เช่น "ZONE-A1(SLOT1)"
      const targetLoc = (selectedItem?.targetLocation || '').toUpperCase();
      const cleanTarget = targetLoc.replace(/[\s\(\)]/g, '');

      // ดึงโซนและเลข Slot ออกมาเทียบกันโดยตรง เพื่อความแม่นยำสูงสุด
      const scannedMatch = text.match(/(ZONE-[A-Z0-9]+).*?(\d+)/i);
      const targetMatch = targetLoc.match(/(ZONE-[A-Z0-9]+).*?(\d+)/i);

      let isMatch = false;
      if (cleanScanned.includes(cleanTarget) || cleanTarget.includes(cleanScanned)) {
        isMatch = true;
      } else if (scannedMatch && targetMatch) {
        const scannedZone = scannedMatch[1];
        const scannedSlotNum = parseInt(scannedMatch[2], 10);
        
        const targetZone = targetMatch[1];
        const targetSlotNum = parseInt(targetMatch[2], 10);

        if (scannedZone === targetZone && scannedSlotNum === targetSlotNum) {
          isMatch = true;
        }
      }

      if (isMatch) {
        setScannedSlotTarget(selectedItem.targetLocation);
        alert(`✅ ยืนยันตำแหน่งถูกต้อง! คุณอยู่ที่ ${selectedItem.targetLocation}`);
      } else {
        alert(`❌ ยืนยันตำแหน่งไม่ถูกต้อง!\n\nคุณสแกนได้: "${text}"\nตำแหน่งที่ต้องการคือ: "${selectedItem.targetLocation}"`);
      }

    } else if (stepType === 'item') {
      executePutawayStorage();
    }
  };

  // บันทึกจัดเก็บเข้า MongoDB
  const executePutawayStorage = async () => {
    if (!selectedItem || !selectedReceipt) return;
    setScanSuccess(true);

    try {
      const locString = selectedItem.targetLocation;
      const rackMatch = locString.match(/(ZONE-[A-Z0-9-]+)/);
      const slotMatch = locString.match(/(Slot\s*\d+)/i);

      if (rackMatch) {
        const rackId = rackMatch[1];
        const slotName = slotMatch ? slotMatch[1] : 'Slot 1';

        const rackRes = await fetch(`https://mainwms-backend.onrender.com/api/racks/${rackId}`);
        if (rackRes.ok) {
          const rackData = await rackRes.json();
          const currentSlots = rackData.slots || {};
          const targetSlotData = currentSlots[slotName] || { items: [] };
          const currentItems = [...targetSlotData.items];

          const existingItemIndex = currentItems.findIndex(i => i.name === selectedItem.name);
          if (existingItemIndex > -1) {
            currentItems[existingItemIndex] = {
              ...currentItems[existingItemIndex],
              qty: currentItems[existingItemIndex].qty + selectedItem.qty
            };
          } else {
            currentItems.push({
              name: selectedItem.name,
              qty: selectedItem.qty,
              itemId: selectedItem.id
            });
          }

          currentSlots[slotName] = { items: currentItems };

          await fetch(`https://mainwms-backend.onrender.com/api/racks/${rackId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slots: currentSlots })
          });
        }
      }
    } catch (err) {
      console.error('Failed to update rack storage in DB:', err);
    }

    // ตัดรายการออกจากใบเสร็จ
    setTimeout(async () => {
      const updatedItems = selectedReceipt.items.filter(i => i.id !== selectedItem.id);

      if (updatedItems.length === 0) {
        try {
          await fetch(`https://mainwms-backend.onrender.com/api/receipts/${selectedReceipt.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Completed' })
          });
        } catch (err) {
          console.error('Failed to update receipt status to Completed:', err);
        }

        setReadyReceipts(prev => prev.filter(r => r.id !== selectedReceipt.id));
        setSelectedReceipt(null);
        setSelectedItem(null);
        setScannedSlotTarget(null);
      } else {
        const updatedReceipt = { ...selectedReceipt, items: updatedItems };
        setSelectedReceipt(updatedReceipt);
        setReadyReceipts(prev => prev.map(r => r.id === updatedReceipt.id ? updatedReceipt : r));
        setSelectedItem(updatedItems[0]);
        setScannedSlotTarget(null);
      }

      setScanSuccess(false);
    }, 1000);
  };

  return (
    <div className="p-3 sm:p-6 bg-slate-900 min-h-screen font-sans flex flex-col lg:flex-row gap-4 sm:gap-6 relative">

      {/* ================= MODAL กล้องสแกนจริง ================= */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-700 flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3">
              <h3 className="text-white font-bold text-sm tracking-wide">
                {scanStep === 'slot' ? 'สแกน QR Code ประจำ Slot ที่ชั้น' : 'สแกน QR Code สินค้า'}
              </h3>
              <button 
                onClick={stopCameraScan} 
                className="bg-rose-500/20 text-rose-400 p-2 rounded-full hover:bg-rose-500/30 transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div id="staff-qr-reader-container" className="w-full overflow-hidden rounded-2xl bg-black"></div>
            
            <p className="text-slate-400 text-xs text-center mt-3 leading-relaxed">
              {scanStep === 'slot' 
                ? 'ส่องกล้องไปที่ QR Code หน้าตู้ชั้นวางเพื่อยืนยันจุดจัดวาง' 
                : 'ส่องกล้องไปที่ QR Code บนสติกเกอร์กล่องสินค้าเพื่อหักยอดเข้าคลัง'}
            </p>
          </div>
        </div>
      )}

      {/* ================= 1. LEFT SIDEBAR (Responsive) ================= */}
      <div className="w-full lg:w-[320px] lg:xl:w-[380px] lg:h-[calc(100vh-3rem)] lg:sticky lg:top-6 bg-[#0b0f19] text-white flex flex-col justify-between p-6 sm:p-8 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl relative">
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop"
            alt="Logistics Fleet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-row lg:flex-col justify-between items-center lg:items-start">
          <div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-widest text-white leading-none">KPA</h1>
            <p className="text-xl lg:text-3xl font-bold tracking-[0.35em] text-slate-200 mt-1 lg:mt-2">W M S</p>
          </div>

          <div className="bg-[#1a233a]/90 backdrop-blur-md border border-slate-700/60 rounded-full px-4 py-2 lg:hidden flex items-center gap-2 shadow-lg">
            <span className="text-xs font-semibold text-slate-200">
              {currentUser?.username || 'STAFF-01'}
            </span>
            {onLogout && (
              <button onClick={onLogout} className="text-xs text-rose-400 font-medium ml-2 cursor-pointer">
                Logout
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 hidden lg:flex">
          <div className="w-full bg-[#1a233a]/85 backdrop-blur-md border border-slate-700/60 rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentUser?.username || 'STAFF-01'}
              </span>
            </div>
            {onLogout && (
              <button onClick={onLogout} className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= 2. RIGHT MAIN CONTENT AREA (Responsive) ================= */}
      <div className="flex-1 mx-auto w-full bg-slate-100 rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-slate-700 shadow-2xl overflow-hidden p-4 sm:p-6 flex flex-col justify-between">

        <div>
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-4 sm:px-8 py-4 sm:py-5 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-md border border-slate-800">
            <div>
              <h2 className="text-lg sm:text-2xl font-serif tracking-wide">Warehouse Automation System</h2>
              <p className="text-[10px] sm:text-[11px] text-emerald-400 tracking-[0.1em] sm:tracking-[0.2em] uppercase mt-0.5">
                ROLE: Staff Putaway Terminal ({currentUser?.username || 'ST001'}) (Live MongoDB)
              </p>
            </div>
            {selectedReceipt && (
              <button
                onClick={() => { setSelectedReceipt(null); setSelectedItem(null); setScannedSlotTarget(null); }}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-700 self-end sm:self-auto"
              >
                <ArrowLeft size={14} /> กลับหน้ารายการ
              </button>
            )}
          </div>

          {!selectedReceipt ? (
            /* VIEW 1: RECEPTION / READY RECEIPTS LIST */
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 min-h-[450px] sm:min-h-[520px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-wider">รายการสินค้า (Ready to Pick)</h3>
                <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-200">
                  พร้อมจัดเก็บ: {readyReceipts.length} ใบเสร็จ
                </span>
              </div>

              {loading ? (
                <div className="text-center py-20 text-slate-400 text-xs">กำลังโหลดข้อมูลจากฐานข้อมูล...</div>
              ) : readyReceipts.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  ✨ ไม่มีใบเสร็จสถานะ Ready to Pick ในขณะนี้
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] sm:max-h-[420px] overflow-y-auto pr-1">
                  {readyReceipts.map((rec) => (
                    <div key={rec.id} className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-emerald-500 hover:shadow-md transition">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-black text-slate-900 text-sm">{rec.receiptId}</span>
                          <span className="text-xs text-slate-400 font-medium">[{rec.code}]</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Ready to Pick</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-1">
                          <Truck size={13} className="text-slate-400 shrink-0" /> ซัพพลายเออร์: <strong className="text-slate-800 truncate">{rec.supplier}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          รายการสินค้า: <b className="text-emerald-600">{rec.items.length} รายการ</b>
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenReceipt(rec)}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer shadow flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <ScanLine size={14} /> เริ่มจัดเก็บสินค้านี้
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* VIEW 2: SCAN PROCESS TERMINAL */
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">

              {/* ฝั่งซ้าย: รายการสินค้าในใบเสร็จ */}
              <div className="flex-1 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-3 sm:mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-800 text-xs sm:text-sm">
                      ใบเสร็จ: {selectedReceipt.receiptId} <span className="text-slate-400 font-normal">[{selectedReceipt.code}]</span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">เลือกรายการสินค้าเพื่อเริ่มกระบวนการสแกน Slot และตัวสินค้า</p>
                  </div>
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl border border-amber-200 shrink-0">
                    เหลือ {selectedReceipt.items.length} รายการ
                  </span>
                </div>

                <div className="space-y-3 max-h-[280px] sm:max-h-[360px] overflow-y-auto pr-1">
                  {selectedReceipt.items.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => { setSelectedItem(item); setScannedSlotTarget(null); }}
                        className={`border rounded-xl sm:rounded-2xl p-3 sm:p-4 transition cursor-pointer shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 ${isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400 shadow-md'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">{item.sku}</span>
                            <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-[11px] sm:text-xs text-slate-600 flex items-center gap-1 font-semibold">
                              <MapPin size={12} className="text-emerald-500 shrink-0" /> เป้าหมาย: {item.targetLocation}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                              <Sparkles size={10} /> {item.actionLabel}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                          <span className="text-[10px] sm:text-[11px] text-slate-400 block">จำนวน</span>
                          <span className="text-xs sm:text-sm font-black text-slate-800">{item.qty} ชิ้น</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ฝั่งขวา: แผงสแกนกล้องจริง 2 สเต็ป */}
              <div className="w-full lg:w-[360px] xl:w-[380px] bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col justify-between shrink-0">
                <div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 border border-emerald-200">
                    <QrCode size={26} />
                  </div>

                  <h3 className="font-black text-slate-800 text-xs sm:text-sm mb-1 text-center">สแกนจัดเก็บด้วยกล้องจริง (Putaway)</h3>

                  {selectedItem ? (
                    <div className="space-y-3 mt-3">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 text-left">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">รายการที่เลือก:</p>
                        <p className="text-xs font-bold text-slate-900 truncate">{selectedItem.name}</p>
                        <p className="text-xs text-emerald-600 font-bold mt-0.5">📍 ตำแหน่งเป้าหมาย: {selectedItem.targetLocation}</p>
                      </div>

                      {/* สเต็ป 1: สแกนป้าย Slot ที่ตู้ */}
                      <div className={`border rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition ${scannedSlotTarget ? 'bg-emerald-50/80 border-emerald-400' : 'bg-indigo-50/60 border-indigo-200'}`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            สเต็ป 1: สแกนป้าย Slot หน้าตู้
                          </span>
                          {scannedSlotTarget ? (
                            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">ยืนยันแล้ว ✓</span>
                          ) : (
                            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold animate-pulse">รอสแกนป้าย</span>
                          )}
                        </div>

                        {scannedSlotTarget ? (
                          <p className="text-xs text-emerald-800 font-bold">📍 ยืนยันตำแหน่ง {scannedSlotTarget} เรียบร้อย</p>
                        ) : (
                          <button
                            onClick={() => startCameraScan('slot')}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow active:scale-95"
                          >
                            <Scan size={16} /> เปิดกล้องสแกนป้าย Slot
                          </button>
                        )}
                      </div>

                      {/* สเต็ป 2: สแกนตัวสินค้า */}
                      <div className={`border rounded-xl sm:rounded-2xl p-3 sm:p-3.5 transition ${!scannedSlotTarget ? 'opacity-50 bg-slate-50 border-slate-200' : 'bg-emerald-50/80 border-emerald-400'}`}>
                        <span className="text-xs font-bold text-slate-800 block mb-1.5">
                          สเต็ป 2: สแกนตัวสินค้าเพื่อหักยอด
                        </span>

                        {scanSuccess ? (
                          <div className="bg-emerald-600 text-white rounded-xl p-2.5 text-xs font-bold flex items-center justify-center gap-1.5 animate-bounce">
                            <CheckCircle2 size={16} /> จัดเก็บสำเร็จ! ตัดยอดเข้าคลังแล้ว
                          </div>
                        ) : (
                          <button
                            onClick={() => startCameraScan('item')}
                            disabled={!scannedSlotTarget}
                            className={`w-full text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow active:scale-95 ${!scannedSlotTarget ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}`}
                          >
                            <ScanLine size={16} /> เปิดกล้องสแกนสินค้า
                          </button>
                        )}
                      </div>

                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3 my-4 font-medium text-center">
                      ⚠️ เลือกรายการสินค้าทางซ้ายเพื่อเริ่มสแกน
                    </p>
                  )}
                </div>

                <div className="text-[10px] sm:text-[11px] text-slate-400 text-center mt-3 pt-2 border-t border-slate-100">
                  ระบบตรวจสอบพิกัดและตัดสต็อกอัตโนมัติ (Live MongoDB)
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}