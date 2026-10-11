import React, { useState } from 'react';
import { ChevronUp, ArrowLeft, CheckCircle2, QrCode, ScanLine, Building2, MapPin, Sparkles, ArrowUpRight } from 'lucide-react';

export default function StaffTerminalOutbound({ currentUser, onLogout }) {
  // Mock รายการคำสั่งซื้อที่ Planner Outbound วางแผนและอนุมัติแล้ว
  const [approvedOutboundOrders, setApprovedOutboundOrders] = useState([
    {
      id: 'ORD-2026-001',
      code: 'WH-OUT-982131',
      customer: 'PC Gamer Studio Thailand',
      items: [
        { id: 'item-1', name: 'Keyboard RGB Gaming', qty: 25, sourceLocation: 'ZONE-A1 (Slot 1 & 2)', sku: 'KB-8821', weight: '1.00 KG' },
        { id: 'item-2', name: 'Logitech G Pro X Superlight', qty: 10, sourceLocation: 'ZONE-A1 (Slot 1)', sku: 'MS-3342', weight: '0.12 KG' },
        { id: 'item-3', name: 'USB Hub 7-Port Type-C', qty: 15, sourceLocation: 'ZONE-A1 (Slot 5)', sku: 'UB-7PORT', weight: '0.48 KG' }
      ]
    },
    {
      id: 'ORD-2026-002',
      code: 'WH-OUT-982132',
      customer: 'Esports Arena Bangkok',
      items: [
        { id: 'item-4', name: 'Graphics Card RTX 4060', qty: 4, sourceLocation: 'ZONE-A2 (Slot 3)', sku: 'GPU-4060', weight: '1.20 KG' },
        { id: 'item-5', name: 'Power Supply 850W', qty: 5, sourceLocation: 'ZONE-B1 (Slot 2)', sku: 'PSU-850W', weight: '1.55 KG' }
      ]
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  // เปิดดูรายละเอียดออร์เดอร์ที่เลือก (พร้อมเลือกสินค้าชิ้นแรกให้อัตโนมัติ)
  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setSelectedItem(order.items.length > 0 ? order.items[0] : null);
    setScanSuccess(false);
  };

  // จำลองการสแกน QR Code ยืนยันการหยิบสินค้าออก
  const handleMockScanPickItem = () => {
    if (!selectedItem || !selectedOrder) return;
    setIsScanning(true);

    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);

      setTimeout(() => {
        // 1. กรองตัดสินค้าชิ้นที่หยิบเสร็จแล้วออกจากออร์เดอร์ปัจจุบัน
        const updatedItems = selectedOrder.items.filter(i => i.id !== selectedItem.id);

        if (updatedItems.length === 0) {
          // 2ก. ถ้าหยิบสินค้าครบทุกชิ้นในออร์เดอร์แล้ว -> ลบออร์เดอร์นี้ออก และกลับไปหน้าหลัก
          setApprovedOutboundOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
          setSelectedOrder(null);
          setSelectedItem(null);
        } else {
          // 2ข. ถ้ายังมีสินค้าเหลือ -> อัปเดตรายการ และเลือกสินค้าชิ้นถัดไป
          const updatedOrder = { ...selectedOrder, items: updatedItems };
          setSelectedOrder(updatedOrder);
          setApprovedOutboundOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          setSelectedItem(updatedItems[0]);
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
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-400 flex items-center justify-center animate-spin-slow">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-[#1a233a]/85 backdrop-blur-md border border-slate-700/60 rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentUser?.username || 'STAFF-02'}
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
              <h2 className="text-2xl font-serif tracking-wide">Warehouse Outbound Picking</h2>
              <p className="text-[11px] text-amber-400 tracking-[0.2em] uppercase mt-0.5">
                ROLE: Staff Outbound Picker ({currentUser?.username || 'ST002'})
              </p>
            </div>
            {selectedOrder && (
              <button
                onClick={() => { setSelectedOrder(null); setSelectedItem(null); }}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-700"
              >
                <ArrowLeft size={14} /> กลับหน้ารายการออร์เดอร์ทั้งหมด
              </button>
            )}
          </div>

          {/* Dynamic Views */}
          {!selectedOrder ? (
            /* View 1: รายการออร์เดอร์ทั้งหมดที่ Planner อนุมัติแผน Outbound แล้ว */
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 min-h-[520px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-wider">คำสั่งซื้อที่รอการหยิบสินค้า (Outbound Picking)</h3>
                <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-200">
                  รอดำเนินการ: {approvedOutboundOrders.length} ออร์เดอร์
                </span>
              </div>

              {approvedOutboundOrders.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-sm font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  🎉 หยิบและจัดส่งสินค้าครบทุกออร์เดอร์เรียบร้อยแล้ว!
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedOutboundOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-amber-500 hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black text-slate-900 text-sm">{ord.id}</span>
                          <span className="text-xs text-slate-400 font-medium">[{ord.code}]</span>
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">Ready to Pick</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-1">
                          <Building2 size={13} className="text-slate-400" /> ลูกค้า: <strong className="text-slate-800">{ord.customer}</strong>
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          รายการสินค้าที่ต้องหยิบ: <b className="text-amber-600">{ord.items.length} รายการ</b>
                        </p>
                      </div>

                      <button
                        onClick={() => handleOpenOrder(ord)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer shadow flex items-center gap-1.5"
                      >
                        <ArrowUpRight size={14} /> เริ่มหยิบสินค้าออร์เดอร์นี้
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* View 2: รายการสินค้าในออร์เดอร์ที่ต้องหยิบ (Pick ทีละชิ้น) */
            <div className="flex gap-6">
              
              {/* รายการสินค้าคงเหลือที่ต้องหยิบ */}
              <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-black text-slate-800 text-sm">
                      ออร์เดอร์: {selectedOrder.id} <span className="text-slate-400 font-normal">[{selectedOrder.code}]</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">เดินไปยังตำแหน่งที่ระบุเพื่อหยิบสินค้าออก และสแกน QR เพื่อยืนยัน</p>
                  </div>
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-xl border border-amber-200">
                    คงเหลือต้องหยิบ {selectedOrder.items.length} รายการ
                  </span>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {selectedOrder.items.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`border rounded-2xl p-4 transition cursor-pointer shadow-sm flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400 shadow-md'
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
                              <MapPin size={12} className="text-amber-500" /> ตำแหน่งต้นทาง: {item.sourceLocation}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block">จำนวนหยิบ</span>
                          <span className="text-sm font-black text-slate-800">{item.qty} ชิ้น</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* แท่นสแกนและยืนยันการหยิบสินค้าออก */}
              <div className="w-[360px] bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between text-center">
                <div>
                  <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                    <QrCode size={32} />
                  </div>
                  
                  <h3 className="font-black text-slate-800 text-sm mb-1">สแกน QR Code ยืนยันการหยิบ</h3>
                  
                  {selectedItem ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-3 text-left">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">กำลังหยิบสินค้า:</p>
                      <p className="text-xs font-bold text-slate-900 truncate">{selectedItem.name}</p>
                      <p className="text-xs text-amber-600 font-bold mt-1">📍 ไปหยิบจาก: {selectedItem.sourceLocation}</p>
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-between text-[11px]">
                        <span className="text-slate-500">น้ำหนักรวม: <b>{selectedItem.weight}</b></span>
                        <span className="text-slate-800 font-bold">{selectedItem.qty} ชิ้น</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3 my-4 font-medium">
                      ⚠️ เลือกรายการสินค้าทางซ้ายเพื่อเริ่มสแกนหยิบออก
                    </p>
                  )}

                  {scanSuccess && (
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-2xl p-3 text-xs font-bold mb-4 animate-fade-in flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} /> สแกนสำเร็จ! หยิบสินค้าออกจากชั้นเรียบร้อย
                    </div>
                  )}
                </div>

                <button
                  onClick={handleMockScanPickItem}
                  disabled={!selectedItem || isScanning || scanSuccess}
                  className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition text-sm flex items-center justify-center gap-2 cursor-pointer ${
                    !selectedItem
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : scanSuccess 
                      ? 'bg-emerald-600 text-white' 
                      : isScanning 
                      ? 'bg-slate-300 text-slate-500 cursor-wait' 
                      : 'bg-amber-500 hover:bg-amber-600 text-white transform hover:scale-[1.02]'
                  }`}
                >
                  {isScanning ? (
                    'กำลังตรวจสอบ QR Code...'
                  ) : scanSuccess ? (
                    'หยิบออกเรียบร้อย!'
                  ) : (
                    <>
                      <ScanLine size={16} /> สแกนยืนยันการหยิบชิ้นนี้
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