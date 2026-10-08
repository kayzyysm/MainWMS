import React, { useState } from 'react';
import { ChevronUp, Bell, ArrowLeft, Box, CheckCircle2, Layers, History, Clock, MapPin, Sparkles, Wrench } from 'lucide-react';

// Mock Data สินค้าที่มีจัดเก็บอยู่ใน Rack และ Slot ต่างๆ (ปรับให้แต่ละ Slot เก็บอาร์เรย์รายการสินค้า items ได้สูงสุด 4 ชนิด)
const initialRackStorageData = {
  'ZONE-A1': {
    'Slot 1': {
      items: [
        { name: 'Logitech G Pro X Superlight', qty: 40, itemId: 'mock-1' },
        { name: 'Keyboard RGB Gaming', qty: 30, itemId: 'mock-2' }
      ]
    },
    'Slot 2': {
      items: [
        { name: 'Keyboard RGB Gaming', qty: 60, itemId: 'mock-2' }
      ]
    },
    'Slot 5': {
      items: [
        { name: 'USB Hub 7-Port Type-C', qty: 100, itemId: 'mock-3' }
      ]
    },
    'Slot 8': {
      items: [
        { name: 'RAM DDR5 32GB Kit', qty: 120, itemId: 'mock-4' }
      ]
    },
  },
  'ZONE-A2': {
    'Slot 1': {
      items: [
        { name: 'Monitor ASUS TUF Gaming 27"', qty: 90, itemId: 'mock-5' }
      ]
    },
    'Slot 3': {
      items: [
        { name: 'Graphics Card RTX 4060', qty: 120, itemId: 'mock-6' }
      ]
    },
    'Slot 4': {
      items: [
        { name: 'Graphics Card RTX 4060', qty: 40, itemId: 'mock-6' }
      ]
    },
  },
  'ZONE-B1': {
    'Slot 2': {
      items: [
        { name: 'Power Supply 850W', qty: 85, itemId: 'mock-7' }
      ]
    },
    'Slot 6': {
      items: [
        { name: 'SSD NVMe 2TB', qty: 120, itemId: 'mock-8' }
      ]
    },
  },
  'ZONE-B2': {}
};

export default function PlannerTerminal({ currentUser, onLogout }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // State เก็บรายการสินค้าคงเหลือในใบเสร็จ
  const [remainingItems, setRemainingItems] = useState([]);

  // State สำหรับสินค้าที่กำลังถูกเลือก
  const [selectedItemToStore, setSelectedItemToStore] = useState(null);

  // State เก็บข้อมูล Slot ของแต่ละ Rack
  const [rackStorage, setRackStorage] = useState(initialRackStorageData);

  // State เก็บประวัติการจัดเก็บ (Activity Log)
  const [storageLogs, setStorageLogs] = useState([]);

  // --- Modal 1: Smart Location Popup (เด้งทันทีที่คลิกสินค้า) ---
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [smartTargetLocation, setSmartTargetLocation] = useState(null); // { rackId, slotName, qty, availableSpace }
  const [smartInputQty, setSmartInputQty] = useState(1);

  // --- Modal 2: 9 Slots Inspection Popup (เมื่อเลือกจัด Manual แล้วกดคลิกที่ Rack) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRackId, setTargetRackId] = useState(null);
  const [selectedSlotForAction, setSelectedSlotForAction] = useState(null);
  const [inputQty, setInputQty] = useState(1);

  const MAX_PALLET_CAPACITY = 120; // ความจุชิ้นสินค้ารวมสูงสุดต่อ slot
  const MAX_ITEMS_PER_SLOT = 4;    // จำนวนชนิดสินค้าสูงสุดต่อ slot
  const SLOTS_PER_RACK = 9;
  const MAX_RACK_CAPACITY = MAX_PALLET_CAPACITY * SLOTS_PER_RACK; // 1,080 ชิ้นต่อ Rack

  const plannerReceipts = [
    {
      id: '1', code: 'WH-INV-342321', qtyItems: 4, items: [
        { id: 'item-1', name: 'Keyboard RGB Gaming', qty: 60, weight: '2.40 KG' },
        { id: 'item-2', name: 'Logitech G Pro X Superlight', qty: 120, weight: '1.25 KG' },
        { id: 'item-3', name: 'Monitor ASUS TUF Gaming 27"', qty: 5, weight: '6.50 KG' },
        { id: 'item-4', name: 'USB Hub 7-Port Type-C', qty: 20, weight: '0.65 KG' }
      ]
    },
    {
      id: '2', code: 'WH-INV-442747', qtyItems: 2, items: [
        { id: 'item-5', name: 'Graphics Card RTX 4060', qty: 6, weight: '1.80 KG' },
        { id: 'item-6', name: 'Power Supply 850W', qty: 10, weight: '3.10 KG' }
      ]
    }
  ];

  const racks = [
    { id: 'ZONE-A1', name: 'Zone A-1 (Rack 1)' },
    { id: 'ZONE-A2', name: 'Zone A-2 (Rack 2)' },
    { id: 'ZONE-B1', name: 'Zone B-1 (Rack 3)' },
    { id: 'ZONE-B2', name: 'Zone B-2 (Rack 4)' },
  ];

  const rackSlots = [
    'Slot 1', 'Slot 2', 'Slot 3',
    'Slot 4', 'Slot 5', 'Slot 6',
    'Slot 7', 'Slot 8', 'Slot 9'
  ];

  // คำนวณจำนวนชิ้นสินค้ารวมใน Slot
  const getSlotTotalQty = (slotData) => {
    if (!slotData || !slotData.items) return 0;
    return slotData.items.reduce((sum, item) => sum + item.qty, 0);
  };

  // ค้นหาว่าสินค้าชิ้นนี้มีจัดเก็บอยู่ที่ตำแหน่งไหนบ้างในคลัง
  const getExistingLocationsForItem = (itemName) => {
    const locations = [];
    Object.entries(rackStorage).forEach(([rackId, slots]) => {
      Object.entries(slots).forEach(([slotName, slotData]) => {
        if (slotData && slotData.items) {
          const foundItem = slotData.items.find(i => i.name === itemName);
          if (foundItem) {
            const totalQty = getSlotTotalQty(slotData);
            locations.push({
              rackId,
              slotName,
              qty: foundItem.qty,
              totalSlotQty: totalQty,
              availableSpace: MAX_PALLET_CAPACITY - totalQty
            });
          }
        }
      });
    });
    return locations;
  };

  // คำนวณสถิติความจุของ Rack
  const getRackMetrics = (rackId) => {
    const rackData = rackStorage[rackId] || {};
    let totalStoredQty = 0;
    let filledSlotsCount = 0;

    Object.values(rackData).forEach(slot => {
      if (slot && slot.items && slot.items.length > 0) {
        totalStoredQty += getSlotTotalQty(slot);
        filledSlotsCount += 1;
      }
    });

    const percent = Math.round((totalStoredQty / MAX_RACK_CAPACITY) * 100);

    return {
      totalStoredQty,
      filledSlotsCount,
      percent: Math.min(percent, 100)
    };
  };

  const handleOpenOrganize = (receipt) => {
    setSelectedReceipt(receipt);
    setRemainingItems(receipt.items.map(i => ({ ...i })));
    setSelectedItemToStore(null);
    setStorageLogs([]);
    setViewMode('organize');
  };

  // เมื่อผู้ใช้คลิกเลือกสินค้าจากฝั่งขวา -> เปิด Popup Smart Recommendation ทันที
  const handleSelectItem = (item) => {
    setSelectedItemToStore(item);
    setSmartTargetLocation(null);

    // คำนวณจำนวนตั้งต้นที่จะใส่
    setSmartInputQty(Math.min(item.qty, MAX_PALLET_CAPACITY));
    setIsSmartModalOpen(true);
  };

  // ฟังก์ชันส่วนกลางบันทึกสินค้าลง Slot (รองรับสินค้าหลายชนิดสูงสุด 4 ชนิด)
  const executeStore = (rackId, slotName, qtyToStore) => {
    const numQty = parseInt(qtyToStore);
    if (isNaN(numQty) || numQty <= 0) {
      alert('กรุณาระบุจำนวนให้ถูกต้อง');
      return false;
    }
    if (numQty > selectedItemToStore.qty) {
      alert(`จำนวนเกินกว่าสินค้าที่มีอยู่ (เหลือ ${selectedItemToStore.qty} ชิ้น)`);
      return false;
    }

    const currentSlots = getRackSlotsData(rackId);
    const existingSlot = currentSlots[slotName] || { items: [] };
    const currentItems = [...existingSlot.items];
    const currentTotalQty = getSlotTotalQty(existingSlot);

    if (currentTotalQty + numQty > MAX_PALLET_CAPACITY) {
      alert(`ความจุเกิน! Slot นี้จุได้สูงสุด ${MAX_PALLET_CAPACITY} ชิ้น (ปัจจุบันมี ${currentTotalQty} เติมได้อีก ${MAX_PALLET_CAPACITY - currentTotalQty} ชิ้น)`);
      return false;
    }

    const itemIndex = currentItems.findIndex(i => i.name === selectedItemToStore.name);

    if (itemIndex > -1) {
      // มีสินค้านี้อยู่แล้วใน Slot ให้บวกจำนวนเพิ่ม
      currentItems[itemIndex] = {
        ...currentItems[itemIndex],
        qty: currentItems[itemIndex].qty + numQty
      };
    } else {
      // เป็นสินค้าชนิดใหม่สำหรับ Slot นี้ Check เงื่อนไขห้ามเกิน 4 ชนิด
      if (currentItems.length >= MAX_ITEMS_PER_SLOT) {
        alert(`Slot นี้วางสินค้าเต็มโควต้า ${MAX_ITEMS_PER_SLOT} ชนิดแล้ว! ไม่สามารถเพิ่มสินค้าประเภทอื่นได้อีก`);
        return false;
      }

      // ใส่เป็นชนิดใหม่ (ต่อท้ายลำดับล่าสุด)
      currentItems.push({
        name: selectedItemToStore.name,
        qty: numQty,
        itemId: selectedItemToStore.id
      });
    }

    // อัปเดตข้อมูล Rack
    currentSlots[slotName] = { items: currentItems };
    setRackStorage(prev => ({
      ...prev,
      [rackId]: currentSlots
    }));

    // บันทึก Log
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      itemName: selectedItemToStore.name,
      qty: numQty,
      rackId: rackId,
      slotName: slotName,
      isNewType: itemIndex === -1
    };
    setStorageLogs(prev => [newLog, ...prev]);

    // ตัดจำนวนคงเหลือในใบเสร็จ
    setRemainingItems(prev => {
      return prev.map(item => {
        if (item.id === selectedItemToStore.id) {
          return { ...item, qty: item.qty - numQty };
        }
        return item;
      }).filter(item => item.qty > 0);
    });

    setSelectedItemToStore(null);
    return true;
  };

  // ยืนยันการวางจาก Smart Modal
  const handleConfirmSmartStore = () => {
    if (!smartTargetLocation) {
      alert('กรุณาเลือกตำแหน่งที่ต้องการจัดวางก่อนครับ');
      return;
    }
    const success = executeStore(smartTargetLocation.rackId, smartTargetLocation.slotName, smartInputQty);
    if (success) {
      setIsSmartModalOpen(false);
      setSmartTargetLocation(null);
    }
  };

  // ปุ่มกดเพื่อเปลี่ยนไปจัดแบบ Manual (ปิด Popup ปัจจุบันแล้วให้ไปกด Rack เอง)
  const handleSwitchToManual = () => {
    setIsSmartModalOpen(false);
  };

  // เมื่อคลิกที่ Rack จากหน้าหลัก (ทำงานเฉพาะกรณี Manual Organize)
  const handleRackClick = (rackId) => {
    if (!selectedItemToStore) {
      alert('⚠️ กรุณาคลิกเลือกสินค้าจากเมนูด้านขวาก่อนคลิกเลือก Rack');
      return;
    }
    setTargetRackId(rackId);
    setSelectedSlotForAction(null);
    setIsModalOpen(true);
  };

  const getRackSlotsData = (rackId) => {
    if (!rackId) return {};
    const currentRack = rackStorage[rackId] || {};
    const initialized = { ...currentRack };
    rackSlots.forEach(slot => {
      if (!initialized[slot]) {
        initialized[slot] = { items: [] };
      }
    });
    return initialized;
  };

  const handleSelectSlotInModal = (slotName, slotData) => {
    setSelectedSlotForAction(slotName);

    const totalSlotQty = getSlotTotalQty(slotData);
    const remainingSpace = MAX_PALLET_CAPACITY - totalSlotQty;
    const defaultFill = Math.min(selectedItemToStore.qty, Math.max(0, remainingSpace));
    setInputQty(defaultFill);
  };

  // ยืนยันการวางจาก 9-Slot Manual Modal
  const confirmStoreToSlot = () => {
    const success = executeStore(targetRackId, selectedSlotForAction, inputQty);
    if (success) {
      setSelectedSlotForAction(null);
      setIsModalOpen(false);
    }
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

      {/* 1. LEFT SIDEBAR */}
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
              <button onClick={onLogout} className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors">
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 mx-auto bg-slate-100 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden p-6 flex flex-col justify-between">

        <div>
          <div className="bg-slate-900 text-white px-8 py-5 rounded-2xl mb-6 flex justify-between items-center shadow-md border border-slate-800">
            <div>
              <h2 className="text-2xl font-serif tracking-wide">Warehouse Automation System</h2>
              <p className="text-[11px] text-slate-400 tracking-[0.2em] uppercase mt-0.5">
                ROLE: Planner {currentUser?.username || 'PN001'}
              </p>
            </div>
          </div>

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
                  <div key={rec.id} className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm hover:border-indigo-400 hover:shadow-md transition">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        RECEIPT {rec.id} <span className="text-slate-500 font-normal">[{rec.code}]</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Quantity : {rec.qtyItems} items</p>
                    </div>
                    <button onClick={() => handleOpenOrganize(rec)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow">
                      Organize
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-6 relative">

              {/* Left 3D Model Card */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-indigo-600 rounded-full inline-block"></span>
                      <h3 className="font-bold text-slate-800 text-sm">3D WAREHOUSE MODEL</h3>
                    </div>
                    <button onClick={() => setViewMode('list')} className="bg-slate-900 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-1.5">
                      <ArrowLeft size={14} /> Back to List
                    </button>
                  </div>

                  {/* Manual Mode Banner */}
                  {selectedItemToStore && !isSmartModalOpen && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4 flex items-center justify-between text-xs text-amber-800 font-semibold animate-pulse">
                      <span>📌 โหมดจัดวางด้วยตนเอง (Manual): เลือกคลิกที่ Rack เพื่อดู 9 Slots ของสินค้า <b>{selectedItemToStore.name}</b></span>
                      <button onClick={() => setIsSmartModalOpen(true)} className="text-indigo-600 underline text-[11px]">เปิด Popup แนะนำอีกครั้ง</button>
                    </div>
                  )}

                  <div className="bg-slate-900 rounded-2xl min-h-[380px] relative p-6 flex flex-wrap gap-4 items-center justify-center border border-slate-800 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                    {racks.map((rack) => {
                      const metrics = getRackMetrics(rack.id);

                      let statusBadgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                      let progressBarColor = 'bg-emerald-500';
                      if (metrics.percent > 80) {
                        statusBadgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                        progressBarColor = 'bg-rose-500';
                      } else if (metrics.percent > 30) {
                        statusBadgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                        progressBarColor = 'bg-amber-500';
                      }

                      return (
                        <div
                          key={rack.id}
                          onClick={() => handleRackClick(rack.id)}
                          className={`w-[47%] rounded-2xl border-2 p-4 flex flex-col justify-between transition cursor-pointer relative z-10 shadow-lg ${selectedItemToStore
                              ? 'border-indigo-400 bg-slate-800/90 hover:bg-indigo-950/60 ring-2 ring-indigo-500/50'
                              : metrics.filledSlotsCount > 0
                                ? 'border-slate-700 bg-slate-800/90 hover:border-indigo-400'
                                : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                            }`}
                        >
                          {/* Rack Header */}
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                              {rack.name}
                            </span>

                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-black border ${statusBadgeColor}`}>
                              {metrics.percent}% Full
                            </span>
                          </div>

                          {/* Progress Bar & Details */}
                          <div className="space-y-2 my-1">
                            <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                              <span>Capacity ({metrics.totalStoredQty}/{MAX_RACK_CAPACITY} pcs)</span>
                              <span className="text-slate-400">{metrics.filledSlotsCount}/9 Slots</span>
                            </div>

                            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
                                style={{ width: `${metrics.percent}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-center mt-3 pt-2 border-t border-slate-800/60">
                            <p className="text-[11px] text-indigo-300 font-medium flex items-center justify-center gap-1">
                              <Layers size={13} /> Click to manage 9 slots
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Storage Activity Log */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-indigo-600" />
                      <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">Storage Activity Log (ประวัติการจัดเก็บ)</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Total Actions: {storageLogs.length}</span>
                  </div>

                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {storageLogs.length === 0 ? (
                      <div className="text-center py-5 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        ยังไม่มีประวัติการจัดเก็บในรอบนี้ — เลือกสินค้าและระบุ Slot เพื่อเริ่มบันทึก
                      </div>
                    ) : (
                      storageLogs.map((log) => (
                        <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${log.isNewType ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                            <p className="text-slate-800">
                              จัดเก็บ <strong className="text-indigo-600">{log.itemName}</strong> จำนวน <strong className="text-slate-900">{log.qty} ชิ้น</strong> ไปที่ <strong className="text-slate-900">{log.rackId} ({log.slotName})</strong>
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} /> {log.time}
                          </span>
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

                  <p className="text-[11px] text-slate-400 mb-3">คลิกเลือกสินค้าเพื่อดูตำแหน่งจัดเก็บแนะนำ:</p>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
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
                            onClick={() => handleSelectItem(item)}
                            className={`border rounded-2xl p-3.5 transition cursor-pointer shadow-sm ${isSelected
                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-400'
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
                  <button
                    onClick={handleApproveAll}
                    disabled={!isAllStored}
                    className={`w-full py-3 rounded-xl font-bold shadow-lg transition text-sm flex items-center justify-center gap-2 ${isAllStored
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

      {/* ------------------------------------------------------------- */}
      {/* 3. POPUP MODAL 1: SMART LOCATION RECOMMENDATION (เด้งทันทีที่กดสินค้า) */}
      {/* ------------------------------------------------------------- */}
      {isSmartModalOpen && selectedItemToStore && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-[560px] shadow-2xl border border-slate-200 animate-fade-in flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">ตำแหน่งจัดเก็บสินค้า</h3>
                  <p className="text-xs text-indigo-600 font-bold">{selectedItemToStore.name} (คงเหลือ {selectedItemToStore.qty} ชิ้น)</p>
                </div>
              </div>
              <button onClick={() => setIsSmartModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1">
                ✕
              </button>
            </div>

            {/* Existing Locations Display */}
            <div className="my-2">
              <p className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-indigo-600" /> ตำแหน่งปัจจุบันของสินค้านี้ในคลัง:
              </p>

              {(() => {
                const existingLocs = getExistingLocationsForItem(selectedItemToStore.name);
                if (existingLocs.length === 0) {
                  return (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 my-2">
                      ยังไม่มีสินค้านี้จัดวางอยู่ใน Rack/Slot ใดๆ ในคลัง
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {existingLocs.map((loc, idx) => {
                      const isSelectedLoc = smartTargetLocation?.rackId === loc.rackId && smartTargetLocation?.slotName === loc.slotName;
                      const isFull = loc.availableSpace <= 0;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (!isFull) {
                              setSmartTargetLocation(loc);
                              setSmartInputQty(Math.min(selectedItemToStore.qty, loc.availableSpace));
                            }
                          }}
                          className={`p-3.5 border-2 rounded-2xl flex items-center justify-between transition ${isFull
                              ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                              : isSelectedLoc
                                ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-300 cursor-pointer'
                                : 'bg-white border-slate-200 hover:border-indigo-400 cursor-pointer shadow-sm'
                            }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-800">
                              {loc.rackId} — <span className="text-indigo-600">{loc.slotName}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              มีสินค้านี้อยู่แล้ว: <b>{loc.qty}</b> ชิ้น (รวมใน Slot: {loc.totalSlotQty}/{MAX_PALLET_CAPACITY} ชิ้น) {isFull ? '(เต็มแล้ว)' : `(ว่างอีก ${loc.availableSpace} ชิ้น)`}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-xl ${isSelectedLoc ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                            {isSelectedLoc ? 'เลือกอยู่' : 'คลิกเพื่อเลือกวางตรงนี้'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Input Qty if location selected */}
            {smartTargetLocation && (
              <div className="mt-3 p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    ระบุจำนวนที่จะวางที่ {smartTargetLocation.rackId} ({smartTargetLocation.slotName}):
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={Math.min(selectedItemToStore.qty, smartTargetLocation.availableSpace)}
                  value={smartInputQty}
                  onChange={(e) => setSmartInputQty(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={handleSwitchToManual}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5"
              >
                <Wrench size={14} /> จัดด้วยตนเอง (Manual)
              </button>

              <button
                onClick={handleConfirmSmartStore}
                disabled={!smartTargetLocation}
                className={`font-bold px-6 py-2.5 rounded-xl text-xs transition shadow ${smartTargetLocation
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
              >
                ยืนยันการจัดเก็บ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. POPUP MODAL 2: INSPECTING 9 SLOTS (แสดงรายการสินค้าได้สูงสุด 4 ชนิดต่อ Slot) */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-[780px] shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">

            <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-800 text-base">
                  ตรวจสอบ 9 Slot ของ Rack: <span className="text-indigo-600">{targetRackId}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  กำลังวาง: <b className="text-slate-800">{selectedItemToStore?.name}</b> (เหลืออีก {selectedItemToStore?.qty} ชิ้น) — <span className="text-indigo-600">จำกัดสูงสุด 4 ชนิด/Slot</span>
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1">
                ✕
              </button>
            </div>

            {/* Grid 9 Slots (รองรับสูงสุด 4 ชนิดต่อ Slot) */}
            <div className="grid grid-cols-3 gap-3 my-2 overflow-y-auto pr-1">
              {rackSlots.map((slotName) => {
                const slotData = currentSlotsData[slotName] || { items: [] };
                const itemsList = slotData.items || [];
                const isOccupied = itemsList.length > 0;
                const isSelectedThisSlot = selectedSlotForAction === slotName;
                const totalSlotQty = getSlotTotalQty(slotData);
                const slotPercent = Math.round((totalSlotQty / MAX_PALLET_CAPACITY) * 100);
                const isFullSpace = totalSlotQty >= MAX_PALLET_CAPACITY;
                const isItemAlreadyInSlot = itemsList.some(i => i.name === selectedItemToStore?.name);
                const isTypesFull = itemsList.length >= MAX_ITEMS_PER_SLOT && !isItemAlreadyInSlot;
                const isDisabled = isFullSpace || isTypesFull;

                return (
                  <div
                    key={slotName}
                    onClick={() => !isDisabled && handleSelectSlotInModal(slotName, slotData)}
                    className={`border-2 rounded-2xl p-3 transition flex flex-col justify-between min-h-[140px] relative ${isDisabled
                        ? 'bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed'
                        : isSelectedThisSlot
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-400 shadow-md cursor-pointer'
                          : isOccupied
                            ? 'border-blue-300 bg-blue-50/30 hover:border-blue-400 cursor-pointer'
                            : 'border-slate-200 bg-slate-50 hover:border-indigo-400 cursor-pointer'
                      }`}
                  >
                    {/* Header Slot */}
                    <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800">{slotName}</span>
                        <span className="text-[10px] text-slate-400">({itemsList.length}/4 Types)</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isFullSpace ? 'bg-slate-400 text-white' : isOccupied ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'
                        }`}>
                        {totalSlotQty}/{MAX_PALLET_CAPACITY} pcs
                      </span>
                    </div>

                    {/* รายการสินค้าย่อยที่มีอยู่ (สูงสุด 4 รายการ) */}
                    <div className="my-1.5 space-y-1 flex-1 max-h-[85px] overflow-y-auto pr-1 custom-scrollbar">
                      {!isOccupied ? (
                        <p className="text-slate-400 italic text-center text-[11px] py-4">Slot ว่าง</p>
                      ) : (
                        itemsList.slice(0, MAX_ITEMS_PER_SLOT).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/70 px-2 py-0.5 rounded border border-slate-200/80 text-[10px]">
                            <span className="font-medium text-slate-700 truncate max-w-[120px]" title={item.name}>
                              • {item.name}
                            </span>
                            <span className="font-bold text-indigo-600 shrink-0 ml-1">{item.qty} ชิ้น</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Mini Slot Capacity Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${isFullSpace ? 'bg-slate-500' : 'bg-indigo-600'}`}
                        style={{ width: `${slotPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Form for Slot */}
            {selectedSlotForAction && (
              <div className="bg-slate-50 border border-indigo-200 rounded-2xl p-4 mt-2 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-slate-800">
                    เลือก: <span className="text-indigo-600">{selectedSlotForAction}</span> ({currentSlotsData[selectedSlotForAction]?.items?.some(i => i.name === selectedItemToStore?.name) ? 'เติมสินค้าเดิม' : 'เพิ่มสินค้าชนิดใหม่ลง Slot'})
                  </p>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="1"
                      max={Math.min(
                        selectedItemToStore?.qty || 0,
                        MAX_PALLET_CAPACITY - getSlotTotalQty(currentSlotsData[selectedSlotForAction])
                      )}
                      value={inputQty}
                      onChange={(e) => setInputQty(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button onClick={confirmStoreToSlot} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition shadow">
                    ยืนยันการจัดเก็บ
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-5 py-2 rounded-xl text-xs">
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}