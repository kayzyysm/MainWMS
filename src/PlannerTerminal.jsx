import React, { useState, useEffect } from 'react';
import { ChevronUp, Bell, ArrowLeft, Box, CheckCircle2, Layers, History, Clock, MapPin, Sparkles, Wrench, Building2, Search, Scan } from 'lucide-react';

export default function PlannerTerminal({ currentUser, onLogout }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State เก็บรายการใบเสร็จจาก MongoDB (ที่ผ่าน Reception แล้ว)
  const [plannerReceipts, setPlannerReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);

  // State เก็บรายการสินค้าคงเหลือในใบเสร็จ
  const [remainingItems, setRemainingItems] = useState([]);

  // State สำหรับสินค้าที่กำลังถูกเลือก
  const [selectedItemToStore, setSelectedItemToStore] = useState(null);

  // State เก็บข้อมูล Slot ของแต่ละ Rack (ดึงจาก MongoDB)
  const [rackStorage, setRackStorage] = useState({});
  const [loadingRacks, setLoadingRacks] = useState(false);

  // State เก็บประวัติการจัดเก็บ (Activity Log)
  const [storageLogs, setStorageLogs] = useState([]);

  // --- Modal 1: Smart Location Popup ---
  const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
  const [smartTargetLocation, setSmartTargetLocation] = useState(null);
  const [smartInputQty, setSmartInputQty] = useState(1);

  // --- Modal 2: 9 Slots Inspection Popup ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetRackId, setTargetRackId] = useState(null);
  const [selectedSlotForAction, setSelectedSlotForAction] = useState(null);
  const [inputQty, setInputQty] = useState(1);

  const MAX_PALLET_CAPACITY = 120; // ความจุชิ้นสินค้ารวมสูงสุดต่อ slot
  const MAX_ITEMS_PER_SLOT = 4;    // จำนวนชนิดสินค้าสูงสุดต่อ slot
  const SLOTS_PER_RACK = 9;
  const MAX_RACK_CAPACITY = MAX_PALLET_CAPACITY * SLOTS_PER_RACK; // 1,080 ชิ้นต่อ Rack

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

  // 1. ดึงข้อมูลใบเสร็จจาก MongoDB (เฉพาะที่ได้รับการยืนยันหรือรอจัดเก็บตาม Flow จริง)
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoadingReceipts(true);
        const res = await fetch('https://mainwms-backend.onrender.com/api/receipts');
        if (res.ok) {
          const data = await res.json();
          // กรองเอาเฉพาะใบเสร็จที่ Reception กด Approve / Confirmed แล้วเท่านั้น
          const confirmedReceipts = data.filter(rec => rec.status === 'Confirmed');
          setPlannerReceipts(confirmedReceipts);
        }
      } catch (err) {
        console.error('Failed to fetch receipts:', err);
      } finally {
        setLoadingReceipts(false);
      }
    };
    fetchReceipts();
  }, []);

  // 2. ดึงข้อมูล Rack จาก MongoDB API (`/api/racks`)
  useEffect(() => {
    const fetchRacks = async () => {
      try {
        setLoadingRacks(true);
        const res = await fetch('https://mainwms-backend.onrender.com/api/racks');
        if (res.ok) {
          const data = await res.json();
          // แปลงโครงสร้างข้อมูลจาก DB ให้แมตช์กับรูปแบบ rackStorage state
          // สมมติโครงสร้างจาก /api/racks ส่งมาเป็นอาเรย์หรือออบเจ็กต์รหัส Rack
          const formattedRacks = {};
          if (Array.isArray(data)) {
            data.forEach(r => {
              formattedRacks[r.rackId || r.id] = r.slots || {};
            });
          } else if (typeof data === 'object' && data !== null) {
            Object.assign(formattedRacks, data);
          }
          setRackStorage(formattedRacks);
        }
      } catch (err) {
        console.error('Failed to fetch racks:', err);
      } finally {
        setLoadingRacks(false);
      }
    };
    fetchRacks();
  }, []);

  // คำนวณจำนวนชิ้นสินค้ารวมใน Slot
  const getSlotTotalQty = (slotData) => {
    if (!slotData || !slotData.items) return 0;
    return slotData.items.reduce((sum, item) => sum + item.qty, 0);
  };

  // ค้นหาว่าสินค้าชิ้นนี้มีจัดเก็บอยู่ที่ตำแหน่งไหนบ้างในคลัง
  const getExistingLocationsForItem = (itemName) => {
    const locations = [];
    Object.entries(rackStorage).forEach(([rackId, slots]) => {
      if (slots && typeof slots === 'object') {
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
      }
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
    const formattedItems = (receipt.items || []).map((item, idx) => ({
      id: item.id || `item-${idx}`,
      name: item.productName || item.name,
      qty: item.quantity || item.qty,
      weight: `${item.totalWeight || item.weight || '0'} KG`
    }));
    setRemainingItems(formattedItems);
    setSelectedItemToStore(null);
    setStorageLogs([]);
    setViewMode('organize');
  };

  const handleSelectItem = (item) => {
    setSelectedItemToStore(item);
    setSmartTargetLocation(null);
    setSmartInputQty(Math.min(item.qty, MAX_PALLET_CAPACITY));
    setIsSmartModalOpen(true);
  };

  // ฟังก์ชันบันทึกการจัดเก็บลงฐานข้อมูลผ่าน API
  const executeStore = async (rackId, slotName, qtyToStore) => {
    console.log('--- กำลังกดจัดเก็บ ---', { rackId, slotName, qtyToStore });

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
      alert(`ความจุเกิน! Slot นี้จุได้สูงสุด ${MAX_PALLET_CAPACITY} ชิ้น`);
      return false;
    }

    const itemIndex = currentItems.findIndex(i => i.name === selectedItemToStore.name);

    if (itemIndex > -1) {
      currentItems[itemIndex] = {
        ...currentItems[itemIndex],
        qty: currentItems[itemIndex].qty + numQty
      };
    } else {
      if (currentItems.length >= MAX_ITEMS_PER_SLOT) {
        alert(`Slot นี้วางสินค้าเต็มโควต้า ${MAX_ITEMS_PER_SLOT} ชนิดแล้ว!`);
        return false;
      }
      currentItems.push({
        name: selectedItemToStore.name,
        qty: numQty,
        itemId: selectedItemToStore.id
      });
    }

    currentSlots[slotName] = { items: currentItems };
    const updatedRackStorage = {
      ...rackStorage,
      [rackId]: currentSlots
    };

    // อัปเดตข้อมูล Rack ลง MongoDB ผ่าน API
    try {
      await fetch(`https://mainwms-backend.onrender.com/api/racks/${rackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: currentSlots })
      });

      // อัปเดต targetLocation ลงในรายการสินค้า
      const formattedLocation = `${rackId} (${slotName})`; // จะได้ "ZONE-A1 (Slot 4)"
      const updatedItemsForReceipt = selectedReceipt.items.map(it => {
        if (it.id === selectedItemToStore.id || it.productName === selectedItemToStore.name || it.name === selectedItemToStore.name) {
          return { ...it, targetLocation: formattedLocation };
        }
        return it;
      });

      // เช็กดูใน Console (F12) ว่ามี targetLocation โผล่มาในก้อนนี้ไหม
      console.log("Payload ที่กำลังจะส่งไปอัปเดตใบเสร็จ:", updatedItemsForReceipt);

      await fetch(`https://mainwms-backend.onrender.com/api/receipts/${selectedReceipt._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItemsForReceipt })
      });
      // ------------------------------------------------------------------------------------------

    } catch (err) {
      console.error('Error updating rack or receipt in database:', err);
    }

    setRackStorage(updatedRackStorage);

    // บันทึก Activity Log
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

  const handleConfirmSmartStore = async () => {
    if (!smartTargetLocation) {
      alert('กรุณาเลือกตำแหน่งที่ต้องการจัดวางก่อนครับ');
      return;
    }
    // ใช้ executeStore ตัวเดียวกับระบบ Manual เพื่อให้มันยิงอัปเดตทั้งตู้ Rack และใบเสร็จพร้อมกันครับ
    const success = await executeStore(smartTargetLocation.rackId, smartTargetLocation.slotName, smartInputQty);
    if (success) {
      setIsSmartModalOpen(false);
      setSmartTargetLocation(null);
    }
  };

  const handleSwitchToManual = () => {
    setIsSmartModalOpen(false);
  };

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

  const confirmStoreToSlot = async () => {
    const success = await executeStore(targetRackId, selectedSlotForAction, inputQty);
    if (success) {
      setSelectedSlotForAction(null);
      setIsModalOpen(false);
    }
  };

  const handleApproveAll = async () => { // <--- เติม async ตรงนี้
    try {
      const res = await fetch(`https://mainwms-backend.onrender.com/api/receipts/${selectedReceipt._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Ready to Pick' })
      });

      if (res.ok) {
        alert(`อนุมัติและบันทึกการจัดเก็บใบเสร็จ ${selectedReceipt.docNo || selectedReceipt.receiptId} เรียบร้อยแล้ว!`);
        setViewMode('list');
        setSelectedReceipt(null);
        // รีเฟรชรายการใบเสร็จ
        const updatedRes = await fetch('https://mainwms-backend.onrender.com/api/receipts');
        if (updatedRes.ok) {
          const data = await updatedRes.json();
          setPlannerReceipts(data.filter(rec => rec.status === 'Confirmed'));
        }
      }
    } catch (err) {
      console.error('Error finishing receipt storage:', err);
      alert('ไม่สามารถบันทึกสถานะลงฐานข้อมูลได้');
    }
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
          <p className="text-3xl font-bold tracking-[0.35em] text-slate-200 mt-2">W M S</p>
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
                ROLE: Planner {currentUser?.username || 'PN001'} (Live MongoDB)
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
                <span className="text-sm font-semibold text-rose-500">Receipt Status - Ready for Putaway</span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {loadingReceipts ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">กำลังโหลดใบเสร็จจากฐานข้อมูล...</div>
                ) : plannerReceipts.length > 0 ? (
                  plannerReceipts.map((rec) => (
                    <div key={rec._id || rec.id} className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm hover:border-indigo-400 hover:shadow-md transition">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">
                          {rec.receiptId || `RECEIPT`} <span className="text-slate-500 font-normal">[{rec.docNo}]</span>
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mt-0.5">
                          <Building2 size={13} /> {rec.company || 'Vendor Partner'}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Quantity : {rec.quantity || rec.items?.length || 0} items | Status: <b className="text-amber-600">{rec.status}</b></p>
                      </div>
                      <button onClick={() => handleOpenOrganize(rec)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow">
                        Organize
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs">ไม่มีใบเสร็จที่รอการจัดเก็บในขณะนี้</div>
                )}
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
                      <h3 className="font-bold text-slate-800 text-sm">3D WAREHOUSE MODEL (Live DB)</h3>
                    </div>
                    <button onClick={() => setViewMode('list')} className="bg-slate-900 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-1.5">
                      <ArrowLeft size={14} /> Back to List
                    </button>
                  </div>

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
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                              {rack.name}
                            </span>
                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-black border ${statusBadgeColor}`}>
                              {metrics.percent}% Full
                            </span>
                          </div>

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
                      <p className="text-[11px] text-indigo-600 font-bold">{selectedReceipt?.docNo || selectedReceipt?.receiptId}</p>
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

      {/* 3. POPUP MODAL 1: SMART LOCATION RECOMMENDATION */}
      {isSmartModalOpen && selectedItemToStore && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-[560px] shadow-2xl border border-slate-200 animate-fade-in flex flex-col">
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
              <button onClick={() => setIsSmartModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1">✕</button>
            </div>

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
                            <p className="font-bold text-xs text-slate-800">{loc.rackId} — <span className="text-indigo-600">{loc.slotName}</span></p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              มีสินค้านี้อยู่แล้ว: <b>{loc.qty}</b> ชิ้น {isFull ? '(เต็มแล้ว)' : `(ว่างอีก ${loc.availableSpace} ชิ้น)`}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-xl ${isSelectedLoc ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {isSelectedLoc ? 'เลือกอยู่' : 'คลิกเลือก'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {smartTargetLocation && (
              <div className="mt-3 p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-800 mb-2">ระบุจำนวนที่จะวางที่ {smartTargetLocation.rackId} ({smartTargetLocation.slotName}):</p>
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

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button onClick={handleSwitchToManual} className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5">
                <Wrench size={14} /> จัดด้วยตนเอง (Manual)
              </button>
              <button
                onClick={handleConfirmSmartStore}
                disabled={!smartTargetLocation}
                className={`font-bold px-6 py-2.5 rounded-xl text-xs transition shadow ${smartTargetLocation ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
              >
                ยืนยันการจัดเก็บ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. POPUP MODAL 2: INSPECTING 9 SLOTS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-[780px] shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-800 text-base">ตรวจสอบ 9 Slot ของ Rack: <span className="text-indigo-600">{targetRackId}</span></h3>
                <p className="text-xs text-slate-500 mt-0.5">กำลังวาง: <b className="text-slate-800">{selectedItemToStore?.name}</b></p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1">✕</button>
            </div>

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
                    <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-200/60">
                      <span className="font-bold text-xs text-slate-800">{slotName}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isFullSpace ? 'bg-slate-400 text-white' : 'bg-indigo-600 text-white'}`}>
                        {totalSlotQty}/{MAX_PALLET_CAPACITY} pcs
                      </span>
                    </div>

                    <div className="my-1.5 space-y-1 flex-1 max-h-[85px] overflow-y-auto pr-1">
                      {!isOccupied ? (
                        <p className="text-slate-400 italic text-center text-[11px] py-4">Slot ว่าง</p>
                      ) : (
                        itemsList.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white/70 px-2 py-0.5 rounded border border-slate-200/80 text-[10px]">
                            <span className="font-medium text-slate-700 truncate max-w-[120px]">• {item.name}</span>
                            <span className="font-bold text-indigo-600 shrink-0 ml-1">{item.qty} ชิ้น</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                      <div className="h-full bg-indigo-600" style={{ width: `${slotPercent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSlotForAction && (
              <div className="bg-slate-50 border border-indigo-200 rounded-2xl p-4 mt-2">
                <p className="text-xs font-bold text-slate-800 mb-2">เลือก: <span className="text-indigo-600">{selectedSlotForAction}</span></p>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="1"
                    max={Math.min(selectedItemToStore?.qty || 0, MAX_PALLET_CAPACITY - getSlotTotalQty(currentSlotsData[selectedSlotForAction]))}
                    value={inputQty}
                    onChange={(e) => setInputQty(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <button onClick={confirmStoreToSlot} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition shadow">
                    ยืนยัน
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}