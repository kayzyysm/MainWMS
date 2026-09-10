import React, { useState } from 'react';
import { ChevronUp, Bell, ArrowLeft, Box, CheckCircle2, Layers, History, Clock } from 'lucide-react';

export default function PlannerTerminal({ currentUser, onLogout }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  
  // State เก็บรายการสินค้าคงเหลือในใบเสร็จ
  const [remainingItems, setRemainingItems] = useState([]);
  
  // State สำหรับสินค้าที่กำลังถูกคลิกเลือกจากฝั่งขวา
  const [selectedItemToStore, setSelectedItemToStore] = useState(null);
  
  // State เก็บข้อมูล 9 Slot ของแต่ละ Rack: { 'ZONE-A1': { 'Slot 1': { name: '...', qty: 100 }, 'Slot 2': null, ... } }
  const [rackStorage, setRackStorage] = useState({});

  // State เก็บประวัติการจัดเก็บ (Activity Log)
  const [storageLogs, setStorageLogs] = useState([]);

  // State ควบคุม Modal แสดง 9 Slot ของ Rack ที่เลือก
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRackId, setTargetRackId] = useState(null);
  
  // State สำหรับ Modal ย่อยเวลากดเลือก Slot ที่ต้องการเติมหรือใส่ของ
  const [selectedSlotForAction, setSelectedSlotForAction] = useState(null);
  const [inputQty, setInputQty] = useState(1);

  const MAX_PALLET_CAPACITY = 120; // กำหนดความจุสูงสุดต่อพาเลท/slot

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

  // สร้างรายชื่อ 9 Slot มาตรฐานต่อ Rack
  const rackSlots = [
    'Slot 1', 'Slot 2', 'Slot 3', 
    'Slot 4', 'Slot 5', 'Slot 6', 
    'Slot 7', 'Slot 8', 'Slot 9'
  ];

  const handleOpenOrganize = (receipt) => {
    setSelectedReceipt(receipt);
    setRemainingItems(receipt.items.map(i => ({ ...i })));
    setSelectedItemToStore(null);
    setRackStorage({});
    setStorageLogs([]);
    setViewMode('organize');
  };

  // เมื่อคลิกที่ Rack ใน 3D Model ฝั่งซ้าย
  const handleRackClick = (rackId) => {
    if (!selectedItemToStore) {
      alert('⚠️ กรุณาคลิกเลือกสินค้าจากเมนูด้านขวาก่อนคลิกเลือก Rack');
      return;
    }
    setTargetRackId(rackId);
    setSelectedSlotForAction(null);
    setIsModalOpen(true);
  };

  // ดึงข้อมูล 9 Slot ของ Rack ที่กำลังเลือกอยู่ (ถ้ายังไม่มีให้สร้างโครงว่าง 9 Slot)
  const getRackSlotsData = (rackId) => {
    if (!rackId) return {};
    const currentRack = rackStorage[rackId] || {};
    const initialized = { ...currentRack };
    rackSlots.forEach(slot => {
      if (!initialized[slot]) {
        initialized[slot] = null; // null คือว่าง
      }
    });
    return initialized;
  };

  // คลิกเลือก Slot เฉพาะใน Modal 9 ช่อง เพื่อจัดการเติมของหรือเปิดพาเลทใหม่
  const handleSelectSlotInModal = (slotName, slotData) => {
    setSelectedSlotForAction(slotName);
    
    if (slotData) {
      // กรณีมีพาเลทเดิมอยู่แล้ว คำนวณพื้นที่เหลือ (Remaining capacity)
      const remainingSpace = MAX_PALLET_CAPACITY - slotData.qty;
      const defaultFill = Math.min(selectedItemToStore.qty, Math.max(0, remainingSpace));
      setInputQty(defaultFill);
    } else {
      // กรณี Slot ว่าง (พาเลทใหม่) ใส่จำนวนเต็มของสินค้าที่เลือก หรือเต็มความจุ
      setInputQty(Math.min(selectedItemToStore.qty, MAX_PALLET_CAPACITY));
    }
  };

  // ยืนยันการจัดเก็บลง Slot ที่เลือก
  const confirmStoreToSlot = () => {
    const qtyToStore = parseInt(inputQty);
    if (isNaN(qtyToStore) || qtyToStore <= 0) {
      alert('กรุณาระบุจำนวนให้ถูกต้อง');
      return;
    }
    if (qtyToStore > selectedItemToStore.qty) {
      alert(`จำนวนเกินกว่าสินค้าที่มีอยู่ (เหลือ ${selectedItemToStore.qty} ชิ้น)`);
      return;
    }

    const currentSlots = getRackSlotsData(targetRackId);
    const existingPallet = currentSlots[selectedSlotForAction];
    const isNew = !existingPallet;

    if (existingPallet) {
      // เติมลงพาเลทเดิม
      const newTotalQty = existingPallet.qty + qtyToStore;
      if (newTotalQty > MAX_PALLET_CAPACITY) {
        alert(`ความจุเกิน! พาเลทนี้จุได้สูงสุด ${MAX_PALLET_CAPACITY} ชิ้น (ปัจจุบันมี ${existingPallet.qty} เติมได้อีก ${MAX_PALLET_CAPACITY - existingPallet.qty} ชิ้นเท่านั้น ส่วนที่เกินต้องแยกไปขึ้นพาเลทใหม่ใน Slot ว่างอื่น)`);
        return;
      }
      currentSlots[selectedSlotForAction] = {
        ...existingPallet,
        qty: newTotalQty
      };
    } else {
      // เปิดพาเลทใหม่ใน Slot ว่างนี้
      if (qtyToStore > MAX_PALLET_CAPACITY) {
        alert(`ความจุพาเลทสูงสุดคือ ${MAX_PALLET_CAPACITY} ชิ้นต่อพาเลท`);
        return;
      }
      currentSlots[selectedSlotForAction] = {
        name: selectedItemToStore.name,
        qty: qtyToStore,
        itemId: selectedItemToStore.id
      };
    }

    // อัปเดต State Rack Storage
    setRackStorage(prev => ({
      ...prev,
      [targetRackId]: currentSlots
    }));

    // บันทึกประวัติการจัดเก็บ (Activity Log)
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      itemName: selectedItemToStore.name,
      qty: qtyToStore,
      rackId: targetRackId,
      slotName: selectedSlotForAction,
      isNewPallet: isNew
    };
    setStorageLogs(prev => [newLog, ...prev]);

    // หักลบจำนวนสินค้าคงเหลือในรายการฝั่งขวา
    setRemainingItems(prev => {
      return prev.map(item => {
        if (item.id === selectedItemToStore.id) {
          return { ...item, qty: item.qty - qtyToStore };
        }
        return item;
      }).filter(item => item.qty > 0);
    });

    // Reset ค่าใน Modal
    setSelectedSlotForAction(null);
    setSelectedItemToStore(null);
    setIsModalOpen(false);
  };

  const handleApproveAll = () => {
    alert(`อนุมัติและบันทึกการจัดเก็บใบเสร็จ ${selectedReceipt.code} เข้าคลังสินค้าเรียบร้อยแล้ว!`);
    setViewMode('list');
    setSelectedReceipt(null);
  };

  const isAllStored = remainingItems.length === 0;
  const currentSlotsData = getRackSlotsData(targetRackId);

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
            <div className="flex gap-6 relative">
              
              {/* Left 3D Warehouse Overview Mockup & Activity Log */}
              <div className="flex-1 flex flex-col gap-6">
                
                {/* 3D Warehouse Model Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-indigo-600 rounded-full inline-block"></span>
                      <h3 className="font-bold text-slate-800 text-sm">3D WAREHOUSE MODEL (Click rack to inspect 9 slots)</h3>
                    </div>
                    <button
                      onClick={() => setViewMode('list')}
                      className="bg-slate-900 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} /> Back to List
                    </button>
                  </div>

                  <div className="bg-slate-900 rounded-2xl h-[360px] relative p-6 flex flex-wrap gap-4 items-center justify-center border border-slate-800 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    
                    {racks.map((rack) => {
                      const rackSlotsData = rackStorage[rack.id] || {};
                      const filledSlotsCount = Object.values(rackSlotsData).filter(Boolean).length;

                      return (
                        <div
                          key={rack.id}
                          onClick={() => handleRackClick(rack.id)}
                          className={`w-[45%] h-[40%] rounded-2xl border-2 p-4 flex flex-col justify-between transition cursor-pointer relative z-10 shadow-lg ${
                            selectedItemToStore 
                              ? 'border-indigo-400 bg-slate-800 hover:bg-indigo-950/50 ring-2 ring-indigo-500/50 animate-pulse' 
                              : filledSlotsCount > 0 
                              ? 'border-blue-500 bg-blue-950/60 hover:border-blue-400' 
                              : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">{rack.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${filledSlotsCount > 0 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                              {filledSlotsCount > 0 ? `${filledSlotsCount}/9 Slots Used` : 'All Empty (9 Slots)'}
                            </span>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-300 font-semibold flex items-center justify-center gap-1">
                              <Layers size={14} className="text-indigo-400" /> Click to inspect 9 slots
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Storage Activity Log (New Section) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">Storage Activity Log (ประวัติการจัดเก็บในรอบนี้)</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Total Actions: {storageLogs.length}</span>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {storageLogs.length === 0 ? (
                      <div className="text-center py-5 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        ยังไม่มีประวัติการจัดเก็บ — เลือกสินค้าและระบุ Slot เพื่อเริ่มบันทึก
                      </div>
                    ) : (
                      storageLogs.map((log) => (
                        <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${log.isNewPallet ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                            <p className="text-slate-800">
                              จัดเก็บ <strong className="text-indigo-600">{log.itemName}</strong> จำนวน <strong className="text-slate-900">{log.qty} ชิ้น</strong> ไปที่ <strong className="text-slate-900">{log.rackId} ({log.slotName})</strong>
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${log.isNewPallet ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {log.isNewPallet ? '✨ พาเลทใหม่' : '🔄 เติมพาเลทเดิม'}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock size={10} /> {log.time}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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

                  <p className="text-[11px] text-slate-400 mb-3">คลิกเลือกสินค้า แล้วคลิก Rack เพื่อเช็ค 9 Slot:</p>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
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

      {/* ================= 3. POPUP MODAL INSPECTING 9 SLOTS ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-[650px] shadow-2xl border border-slate-200 animate-scale-up max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  ตรวจสอบ 9 Slot ของ Rack: <span className="text-indigo-600">{targetRackId}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  กำลังจัดเก็บสินค้า: <b className="text-slate-800">{selectedItemToStore?.name}</b> (ต้องจัดเก็บอีก {selectedItemToStore?.qty} ชิ้น) | ความจุสูงสุดต่อพาเลท: {MAX_PALLET_CAPACITY} ชิ้น
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Grid 9 Slots ของ Rack */}
            <div className="grid grid-cols-3 gap-3 my-4 overflow-y-auto pr-1">
              {rackSlots.map((slotName) => {
                const pallet = currentSlotsData[slotName];
                const isOccupied = pallet !== null;
                const isSelectedThisSlot = selectedSlotForAction === slotName;
                const isFull = isOccupied && pallet.qty >= MAX_PALLET_CAPACITY;

                return (
                  <div
                    key={slotName}
                    onClick={() => !isFull && handleSelectSlotInModal(slotName, pallet)}
                    className={`border-2 rounded-2xl p-3.5 transition flex flex-col justify-between ${
                      isFull 
                        ? 'bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed'
                        : isSelectedThisSlot 
                        ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-400 shadow-md cursor-pointer' 
                        : isOccupied 
                        ? 'border-blue-300 bg-blue-50/40 hover:border-blue-400 cursor-pointer' 
                        : 'border-slate-200 bg-slate-50 hover:border-indigo-400 cursor-pointer'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-xs text-slate-800">{slotName}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        isFull ? 'bg-slate-400 text-white' : isOccupied ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        {isFull ? 'พาเลทเต็ม' : isOccupied ? 'มีพาเลทเดิม' : 'Slot ว่าง (พาเลทใหม่)'}
                      </span>
                    </div>

                    <div className="text-xs min-h-[45px] flex flex-col justify-center">
                      {isOccupied ? (
                        <>
                          <p className="font-bold text-slate-800 truncate">{pallet.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            จำนวน: <b className="text-indigo-600">{pallet.qty}</b> / {MAX_PALLET_CAPACITY} ชิ้น
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-400 italic text-center text-[11px]">ว่าง — คลิกเพื่อตั้งพาเลทใหม่</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ส่วนระบุจำนวนเมื่อคลิกเลือก Slot แล้ว */}
            {selectedSlotForAction && (
              <div className="bg-slate-50 border border-indigo-200 rounded-2xl p-4 mt-2 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-slate-800">
                    จัดการ Slot: <span className="text-indigo-600">{selectedSlotForAction}</span> ({currentSlotsData[selectedSlotForAction] ? 'เติมพาเลทเดิม' : 'สร้างพาเลทใหม่'})
                  </p>
                  <span className="text-[11px] text-slate-500">
                    {currentSlotsData[selectedSlotForAction] 
                      ? `เติมได้อีกสูงสุด: ${MAX_PALLET_CAPACITY - currentSlotsData[selectedSlotForAction].qty} ชิ้น` 
                      : `จุได้สูงสุด: ${MAX_PALLET_CAPACITY} ชิ้น`}
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ระบุจำนวนที่จะจัดเก็บใส่ Slot นี้:</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedItemToStore?.qty}
                      value={inputQty}
                      onChange={(e) => setInputQty(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    onClick={confirmStoreToSlot}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition shadow cursor-pointer"
                  >
                    ยืนยันการจัดเก็บ
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}