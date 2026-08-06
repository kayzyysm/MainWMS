import React, { useState } from 'react';
import { ChevronUp, Bell, ArrowLeft, Box, CheckCircle2 } from 'lucide-react';

export default function PlannerTerminal({ currentUser, onLogout }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  // State เก็บรายการสินค้าคงเหลือในใบเสร็จ
  const [remainingItems, setRemainingItems] = useState([]);
  
  // State สำหรับสินค้าที่กำลังถูกคลิกเลือกจากฝั่งขวา (เพื่อให้กระพริบ)
  const [selectedItemToStore, setSelectedItemToStore] = useState(null);
  
  // State เก็บข้อมูลสินค้าที่จัดเก็บลง Rack และ Slot { rackId: [{ slot: 'Slot 1', name: '...', qty: ... }, ...] }
  const [rackStorage, setRackStorage] = useState({});

  // State ควบคุม Modal สำหรับเลือก Slot และจำนวน
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRackId, setTargetRackId] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState('Slot 1 (Top)');
  const [inputQty, setInputQty] = useState(1);

  const plannerReceipts = [
    { id: '1', code: 'WH-INV-342321', qtyItems: 4, items: [
      { id: 'item-1', name: 'Keyboard RGB Gaming', qty: 60, weight: '2.40 KG' },
      { id: 'item-2', name: 'Logitech G Pro X Superlight', qty: 120, weight: '1.25 KG' },
      { id: 'item-3', name: 'Monitor ASUS TUF Gaming 27"', qty: 5, weight: '6.50 KG' },
      { id: 'item-4', name: 'USB Hub 7-Port Type-C', qty: 20, weight: '0.65 KG' }
    ]},
    { id: '2', code: 'WH-INV-442747', qtyItems: 2, items: [
      { id: 'item-5', name: 'Graphics Card RTX 4060', qty: 6, weight: '1.80 KG' },
      { id: 'item-6', name: 'Power Supply 850W', qty: 10, weight: '3.10 KG' }
    ]},
    { id: '3', code: 'WH-INV-512747', qtyItems: 1, items: [
      { id: 'item-7', name: 'Thermal Paste 4g', qty: 50, weight: '0.10 KG' }
    ]},
    { id: '4', code: 'WH-INV-561563', qtyItems: 1, items: [
      { id: 'item-8', name: 'DDR5 RAM 32GB', qty: 30, weight: '0.20 KG' }
    ]}
  ];

  const racks = [
    { id: 'ZONE-A1', name: 'Zone A-1 (Rack 1)' },
    { id: 'ZONE-A2', name: 'Zone A-2 (Rack 2)' },
    { id: 'ZONE-B1', name: 'Zone B-1 (Rack 3)' },
    { id: 'ZONE-B2', name: 'Zone B-2 (Rack 4)' },
  ];

  const slotOptions = [
    'Slot 1 (Top)', 
    'Slot 2 (Middle-Top)', 
    'Slot 3 (Middle-Bottom)', 
    'Slot 4 (Bottom)'
  ];

  const handleOpenOrganize = (receipt) => {
    setSelectedReceipt(receipt);
    setRemainingItems(receipt.items.map(i => ({ ...i })));
    setSelectedItemToStore(null);
    setRackStorage({});
    setViewMode('organize');
  };

  // เมื่อคลิกที่ Rack ใน 3D Model ฝั่งซ้าย
  const handleRackClick = (rackId) => {
    if (!selectedItemToStore) {
      alert('⚠️ กรุณาคลิกเลือกสินค้าจากเมนูด้านขวาก่อนคลิกเลือก Rack ใน 3D Model');
      return;
    }
    setTargetRackId(rackId);
    setSelectedSlot(slotOptions[0]);
    setInputQty(selectedItemToStore.qty); // ตั้งค่าจำนวนเริ่มต้นเป็นจำนวนที่เหลือทั้งหมด
    setIsModalOpen(true);
  };

  // ยืนยันการจัดเก็บจาก Modal
  const confirmStoreItem = () => {
    const qtyToStore = parseInt(inputQty);
    if (isNaN(qtyToStore) || qtyToStore <= 0) {
      alert('กรุณาระบุจำนวนให้ถูกต้อง');
      return;
    }
    if (qtyToStore > selectedItemToStore.qty) {
      alert(`จำนวนเกินกว่าที่มีอยู่ (เหลือ ${selectedItemToStore.qty} ชิ้น)`);
      return;
    }

    // 1. บันทึกลง Rack และ Slot ใน 3D Model
    setRackStorage(prev => {
      const currentRackItems = prev[targetRackId] || [];
      return {
        ...prev,
        [targetRackId]: [...currentRackItems, { slot: selectedSlot, name: selectedItemToStore.name, qty: qtyToStore }]
      };
    });

    // 2. หักลบจำนวนในรายการด้านขวา ถ้าหมดให้ลบออกอัตโนมัติ
    setRemainingItems(prev => {
      return prev.map(item => {
        if (item.id === selectedItemToStore.id) {
          return { ...item, qty: item.qty - qtyToStore };
        }
        return item;
      }).filter(item => item.qty > 0);
    });

    // Reset ค่า
    setIsModalOpen(false);
    setSelectedItemToStore(null);
    setTargetRackId(null);
  };

  const handleApproveAll = () => {
    alert(`อนุมัติและบันทึกการจัดเก็บใบเสร็จ ${selectedReceipt.code} เข้าคลังสินค้าเรียบร้อยแล้ว!`);
    setViewMode('list');
    setSelectedReceipt(null);
  };

  const isAllStored = remainingItems.length === 0;

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
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center animate-spin-slow">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="bg-[#1a233a]/85 backdrop-blur-md border border-slate-700/60 rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentUser?.username || 'PN001'}
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
              <h2 className="text-2xl font-serif tracking-wide">Warehouse Automation System</h2>
              <p className="text-[11px] text-slate-400 tracking-[0.2em] uppercase mt-0.5">
                ROLE: Planner {currentUser?.username || 'PN001'}
              </p>
            </div>
          </div>

          {/* Dynamic View Mode */}
          {viewMode === 'list' ? (
            // ================= VIEW 1: PLANNER TERMINAL (RECEIPT LIST) =================
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 min-h-[520px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-wider">PLANNER TERMINAL</h3>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-inner">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                  <Bell size={18} />
                </div>
                <span className="text-sm font-semibold text-rose-500">Receipt Status - Pending Organization</span>
              </div>

              <div className="space-y-3">
                {plannerReceipts.map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm hover:border-indigo-400 hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        RECEIPT {rec.id} <span className="text-slate-500 font-normal">[{rec.code}]</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Quantity : {rec.qtyItems} items</p>
                    </div>
                    <button
                      onClick={() => handleOpenOrganize(rec)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer shadow"
                    >
                      Organize
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // ================= VIEW 2: 3D MODEL & RECEIPT ITEMS PANEL =================
            <div className="flex gap-6 relative">
              
              {/* Left 3D Warehouse Overview Mockup */}
              <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-600 rounded-full inline-block"></span>
                    <h3 className="font-bold text-slate-800 text-sm">3D WAREHOUSE MODEL (Click slot/rack to place item)</h3>
                  </div>
                  <button
                    onClick={() => setViewMode('list')}
                    className="bg-slate-900 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back to List
                  </button>
                </div>

                {/* 3D Visual Box Area */}
                <div className="bg-slate-900 rounded-2xl h-[400px] relative p-6 flex flex-wrap gap-4 items-center justify-center border border-slate-800 shadow-inner overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                  
                  {racks.map((rack) => {
                    const rackStoredItems = rackStorage[rack.id] || [];
                    const isHasItems = rackStoredItems.length > 0;

                    return (
                      <div
                        key={rack.id}
                        onClick={() => handleRackClick(rack.id)}
                        className={`w-[45%] h-[40%] rounded-2xl border-2 p-4 flex flex-col justify-between transition cursor-pointer relative z-10 shadow-lg ${
                          selectedItemToStore 
                            ? 'border-indigo-400 bg-slate-800 hover:bg-indigo-950/50 ring-2 ring-indigo-500/50 animate-pulse' 
                            : isHasItems 
                            ? 'border-blue-500 bg-blue-950/60 hover:border-blue-400' 
                            : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">{rack.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${isHasItems ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            {isHasItems ? `${rackStoredItems.length} entries` : 'Available'}
                          </span>
                        </div>
                        <div className="overflow-y-auto max-h-[75px] pr-1 space-y-1">
                          {isHasItems ? (
                            rackStoredItems.map((st, i) => (
                              <div key={i} className="flex justify-between text-[10px] text-slate-200 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                                <div>
                                  <span className="text-indigo-300 font-bold block">{st.slot}</span>
                                  <span className="text-slate-300">{st.name}</span>
                                </div>
                                <span className="text-emerald-400 font-bold self-center">x{st.qty}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic text-center mt-3">
                              {selectedItemToStore ? '👉 Click here to store selected item' : 'Click rack to assign'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Receipt Items Panel */}
              <div className="w-[340px] bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Box className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-black text-slate-800 text-sm">RECEIPT ITEMS</h3>
                      <p className="text-[11px] text-indigo-600 font-bold">{selectedReceipt?.code}</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3">คลิกเลือกสินค้า (จะกระพริบ) แล้วไปคลิก Rack ฝั่งซ้าย:</p>

                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                    {remainingItems.length === 0 ? (
                      <div className="text-center py-8 text-emerald-600 font-bold text-xs bg-emerald-50 rounded-2xl border border-emerald-200">
                        ✨ จัดเก็บสินค้าครบทุกชิ้นแล้ว!
                      </div>
                    ) : (
                      remainingItems.map((item) => {
                        const isSelected = selectedItemToStore?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedItemToStore(item)}
                            className={`border rounded-2xl p-3.5 transition cursor-pointer shadow-sm ${
                              isSelected 
                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-400 animate-pulse' 
                                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                              {isSelected && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">Selected</span>}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[11px] text-slate-500">Remaining: <b className="text-indigo-600">{item.qty}</b> pcs</span>
                              <span className="text-[11px] text-slate-400">{item.weight}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="pt-4 border-t border-slate-100 mt-4 flex flex-col gap-3">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                    <p className="text-[11px] text-slate-600 font-medium">
                      {selectedItemToStore ? `Selected: "${selectedItemToStore.name}"` : '⚠️ กรุณาคลิกเลือกสินค้าด้านบนก่อน'}
                    </p>
                  </div>

                  <button
                    onClick={handleApproveAll}
                    disabled={!isAllStored}
                    className={`w-full py-3 rounded-xl font-bold shadow-lg transition text-sm flex items-center justify-center gap-2 ${
                      isAllStored
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer transform hover:scale-105'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <CheckCircle2 size={16} /> APPROVE
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ================= 3. POPUP MODAL FOR SLOT & QTY ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-6 w-[400px] shadow-2xl border border-slate-200 animate-scale-up">
            <h3 className="font-black text-slate-800 text-base mb-1">ระบุ Slot และจำนวนจัดเก็บ</h3>
            <p className="text-xs text-slate-500 mb-4">
              สินค้า: <b className="text-slate-800">{selectedItemToStore?.name}</b> (เหลือ {selectedItemToStore?.qty} ชิ้น)
            </p>

            {/* Dropdown เลือก Slot */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">เลือก Slot ชั้นวาง:</label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {slotOptions.map((slot, index) => (
                  <option key={index} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            {/* ช่องกรอกจำนวน */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">จำนวนชิ้น (Quantity):</label>
              <input
                type="number"
                min="1"
                max={selectedItemToStore?.qty}
                value={inputQty}
                onChange={(e) => setInputQty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmStoreItem}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                ยืนยันจัดเก็บ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}