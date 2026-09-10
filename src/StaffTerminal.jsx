import React, { useState } from 'react';
import { ChevronUp, ArrowLeft, CheckCircle2, QrCode, ScanLine, Truck, MapPin, Sparkles, RefreshCw } from 'lucide-react';

export default function StaffTerminal({ currentUser, onLogout }) {
  // Mock รายการใบเสร็จที่ Planner อนุมัติแล้ว (ประกอบด้วยสินค้าทั้งแบบขึ้นใหม่ และเติมเดิม)
  const [approvedReceipts, setApprovedReceipts] = useState([
    {
      id: 'REC-2026-001',
      code: 'WH-INV-342321',
      supplier: 'TechCorp Global',
      items: [
        { id: 'item-1', name: 'Keyboard RGB Gaming', qty: 60, targetLocation: 'ZONE-A1 (Slot 1)', actionType: 'NEW', actionLabel: '✨ พาเลทใหม่', sku: 'KB-8821', weight: '2.40 KG' },
        { id: 'item-2', name: 'Logitech G Pro X Superlight', qty: 120, targetLocation: 'ZONE-A1 (Slot 2)', actionType: 'REFILL', actionLabel: '🔄 เติมพาเลทเดิม', sku: 'MS-3342', weight: '1.25 KG' },
        { id: 'item-3', name: 'Monitor ASUS TUF Gaming 27"', qty: 5, targetLocation: 'ZONE-A2 (Slot 4)', actionType: 'NEW', actionLabel: '✨ พาเลทใหม่', sku: 'MN-2700', weight: '6.50 KG' }
      ]
    },
    {
      id: 'REC-2026-002',
      code: 'WH-INV-442747',
      supplier: 'LogiTech Solutions',
      items: [
        { id: 'item-5', name: 'Graphics Card RTX 4060', qty: 6, targetLocation: 'ZONE-B1 (Slot 1)', actionType: 'NEW', actionLabel: '✨ พาเลทใหม่', sku: 'GPU-4060', weight: '1.80 KG' },
        { id: 'item-6', name: 'Power Supply 850W', qty: 10, targetLocation: 'ZONE-B1 (Slot 3)', actionType: 'REFILL', actionLabel: '🔄 เติมพาเลทเดิม', sku: 'PSU-850W', weight: '3.10 KG' }
      ]
    }
  ]);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // เปิดดูรายละเอียดของใบเสร็จที่เลือก (พร้อมเลือกสินค้าชิ้นแรกให้อัตโนมัติ)
  const handleOpenReceipt = (receipt) => {
    setSelectedReceipt(receipt);
    setSelectedItem(receipt.items.length > 0 ? receipt.items[0] : null);
    setScanSuccess(false);
  };

  // จำลองการสแกน QR Code และตัดสินค้านั้นออกจากรายการ
  const handleMockScanItem = () => {
    if (!selectedItem || !selectedReceipt) return;
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);

      setTimeout(() => {
        // 1. กรองตัดสินค้าชิ้นที่สแกนเสร็จแล้วออกจากใบเสร็จปัจจุบัน
        const updatedItems = selectedReceipt.items.filter(i => i.id !== selectedItem.id);

        if (updatedItems.length === 0) {
          // 2ก. ถ้าจัดเก็บสินค้าครบทุกชิ้นแล้ว -> ลบใบเสร็จนี้ออก และกลับไปหน้าใบเสร็จทั้งหมด
          setApprovedReceipts(prev => prev.filter(r => r.id !== selectedReceipt.id));
          setSelectedReceipt(null);
          setSelectedItem(null);
        } else {
          // 2ข. ถ้ายังมีสินค้าเหลืออยู่ -> อัปเดตรายการ และเลือกสินค้าชิ้นถัดไปให้อัตโนมัติ
          const updatedReceipt = { ...selectedReceipt, items: updatedItems };
          setSelectedReceipt(updatedReceipt);
          setApprovedReceipts(prev => prev.map(r => r.id === updatedReceipt.id ? updatedReceipt : r));
          setSelectedItem(updatedItems[0]); // เลือกสินค้าชิ้นถัดไป
        }
        
        setScanSuccess(false);
      }, 800);
    }, 800);
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
          <h1 className="text-5xl font-black tracking-widest text-white leading-none">KPA</h1>
          <p className="text-3xl font-bold tracking-[0.35em] text-slate-200 mt-2">W . M S</p>
          <div className="mt-8 relative inline-block">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center animate-spin-slow">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-[#1a233a]/85 backdrop-blur-md border border-slate-700/60 rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentUser?.username || 'STAFF-01'}
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
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-8 py-5 rounded-2xl mb-6 flex justify-between items-center shadow-md border border-slate-800">
            <div>
              <h2 className="text-2xl font-serif tracking-wide">Warehouse Automation System</h2>
              <p className="text-[11px] text-emerald-400 tracking-[0.2em] uppercase mt-0.5">
                ROLE: Staff Putaway Terminal ({currentUser?.username || 'ST001'})
              </p>
            </div>
            {selectedReceipt && (
              <button
                onClick={() => { setSelectedReceipt(null); setSelectedItem(null); }}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
              >
                <ArrowLeft size={14} /> กลับหน้ารายการใบเสร็จทั้งหมด
              </button>
            )}
          </div>

          {/* Dynamic Views */}
          {!selectedReceipt ? (
            /* View 1: รายการใบเสร็จทั้งหมดที่อนุมัติแล้ว */
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 min-h-[520px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-wider">ใบเสร็จที่ Planner อนุมัติแล้ว (รอดำเนินการจัดเก็บ)</h3>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">
                  รอดำเนินการ: {approvedReceipts.length} ใบเสร็จ
                </span>
              </div>

              {approvedReceipts.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  🎉 จัดเก็บสินค้าครบทุกใบเสร็จเรียบร้อยแล้ว!
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedReceipts.map((rec) => (
                    <div
                      key={rec.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-emerald-500 hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-slate-900 text-sm">{rec.id}</span>
                          <span className="text-xs text-slate-400 font-medium">[{rec.code}]</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">Approved</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-1">
                          <Truck size={13} className="text-slate-400" /> ซัพพลายเออร์: <strong className="text-slate-800">{rec.supplier}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          รายการสินค้าคงเหลือ: <b className="text-indigo-600">{rec.items.length} รายการ</b>
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenReceipt(rec)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer shadow flex items-center gap-1.5"
                      >
                        <ScanLine size={14} /> เริ่มจัดเก็บสินค้านี้
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* View 2: รายการสินค้าในใบเสร็จที่เลือก (จัดเก็บทีละชิ้น) */
            <div className="flex gap-6">
              
              {/* รายการสินค้าคงเหลือในใบเสร็จ */}
              <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-800 text-sm">
                      ใบเสร็จ: {selectedReceipt.id} <span className="text-slate-400 font-normal">[{selectedReceipt.code}]</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">คลิกเลือกรวมถึงตรวจสอบประเภทการจัดเก็บ และสแกน QR เพื่อตัดรายการ</p>
                  </div>
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-xl border border-amber-200">
                    เหลืออีก {selectedReceipt.items.length} รายการ
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {selectedReceipt.items.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`border rounded-2xl p-4 transition cursor-pointer shadow-sm flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400 shadow-md'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-2 py-0.5 rounded font-bold">{item.sku}</span>
                            <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-600 flex items-center gap-1 font-semibold">
                              <MapPin size={12} className="text-indigo-500" /> {item.targetLocation}
                            </span>
                            
                            {/* แสดง Badge แยกประเภทการนำเข้าชัดเจน */}
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                              item.actionType === 'NEW' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            }`}>
                              {item.actionType === 'NEW' ? <Sparkles size={10} /> : <RefreshCw size={10} />}
                              {item.actionLabel}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">จำนวน</span>
                          <span className="text-sm font-black text-slate-800">{item.qty} ชิ้น</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* แท่นสแกนและยืนยันการจัดเก็บ */}
              <div className="w-[360px] bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between text-center">
                <div>
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <QrCode size={32} />
                  </div>
                  
                  <h3 className="font-black text-slate-800 text-sm mb-1">สแกน QR Code ยืนยันตำแหน่ง</h3>
                  
                  {selectedItem ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-3 text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">รายการที่เลือกสแกน:</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{selectedItem.name}</p>
                      <p className="text-xs text-indigo-600 font-bold mt-1">📍 ตำแหน่ง: {selectedItem.targetLocation}</p>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between text-[11px]">
                        <span className="text-slate-500">รูปแบบ: <b>{selectedItem.actionLabel}</b></span>
                        <span className="text-slate-800 font-bold">{selectedItem.qty} ชิ้น</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3 my-4 font-medium">
                      ⚠️ เลือกรายการสินค้าทางซ้ายเพื่อเริ่มสแกน
                    </p>
                  )}

                  {scanSuccess && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-2xl p-3 text-xs font-bold mb-4 animate-fade-in flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> สแกนสำเร็จ! นำสินค้าขึ้นชั้นเรียบร้อย
                    </div>
                  )}
                </div>

                <button
                  onClick={handleMockScanItem}
                  disabled={!selectedItem || isScanning || scanSuccess}
                  className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition text-sm flex items-center justify-center gap-2 cursor-pointer ${
                    !selectedItem
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : scanSuccess 
                      ? 'bg-emerald-600 text-white' 
                      : isScanning 
                      ? 'bg-slate-300 text-slate-500 cursor-wait' 
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white transform hover:scale-[1.02]'
                  }`}
                >
                  {isScanning ? (
                    'กำลังตรวจสอบ QR Code...'
                  ) : scanSuccess ? (
                    'จัดเก็บเรียบร้อย!'
                  ) : (
                    <>
                      <ScanLine size={16} /> สแกนยืนยันจัดเก็บชิ้นนี้
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}