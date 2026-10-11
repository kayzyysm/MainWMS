import React, { useState } from 'react';
import { ChevronUp, Bell, ArrowLeft, Box, CheckCircle2, Layers, History, Clock, MapPin, Sparkles, Wrench, Building2, ShoppingCart, ArrowUpRight } from 'lucide-react';

// Mock Data สินค้าที่มีจัดเก็บอยู่ใน Rack และ Slot ต่างๆ สำหรับให้ระบบ Outbound มาตัดสต็อก
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

export default function PlannerTerminaloutbound({ currentUser, onLogout }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State เก็บรายการสินค้าคงเหลือที่ต้องหยิบในออร์เดอร์
  const [remainingOrderItems, setRemainingOrderItems] = useState([]);

  // State สำหรับสินค้าที่กำลังถูกเลือกเพื่อวางแผนหยิบออก
  const [selectedItemToPick, setSelectedItemToPick] = useState(null);

  // State เก็บข้อมูล Slot ของแต่ละ Rack (สต็อกในคลัง)
  const [rackStorage, setRackStorage] = useState(initialRackStorageData);

  // State เก็บประวัติการหยิบสินค้า (Activity Log)
  const [outboundLogs, setOutboundLogs] = useState([]);

  // --- Modal: เลือกตำแหน่งที่จะหยิบสินค้าออก (Outbound Pick Modal) ---
  const [isPickModalOpen, setIsPickModalOpen] = useState(false);
  const [targetPickLocation, setTargetPickLocation] = useState(null); // { rackId, slotName, availableQty }
  const [pickInputQty, setPickInputQty] = useState(1);

  const MAX_PALLET_CAPACITY = 120;
  const SLOTS_PER_RACK = 9;
  const MAX_RACK_CAPACITY = MAX_PALLET_CAPACITY * SLOTS_PER_RACK;

  // Mock Data: คำสั่งซื้อขาออก (Outbound Orders จากลูกค้า)
  const outboundOrders = [
    {
      id: '1', code: 'WH-OUT-982131', customer: 'PC Gamer Studio Thailand', qtyItems: 3, items: [
        { id: 'item-1', name: 'Keyboard RGB Gaming', qty: 25, weight: '1.00 KG' },
        { id: 'item-2', name: 'Logitech G Pro X Superlight', qty: 10, weight: '0.12 KG' },
        { id: 'item-3', name: 'USB Hub 7-Port Type-C', qty: 15, weight: '0.48 KG' }
      ]
    },
    {
      id: '2', code: 'WH-OUT-982132', customer: 'Esports Arena Bangkok', qtyItems: 2, items: [
        { id: 'item-4', name: 'Graphics Card RTX 4060', qty: 4, weight: '1.20 KG' },
        { id: 'item-5', name: 'Power Supply 850W', qty: 5, weight: '1.55 KG' }
      ]
    }
  ];

  const racks = [
    { id: 'ZONE-A1', name: 'Zone A-1 (Rack 1)' },
    { id: 'ZONE-A2', name: 'Zone A-2 (Rack 2)' },
    { id: 'ZONE-B1', name: 'Zone B-1 (Rack 3)' },
    { id: 'ZONE-B2', name: 'Zone B-2 (Rack 4)' },
  ];

  // คำนวณจำนวนชิ้นสินค้ารวมใน Slot
  const getSlotTotalQty = (slotData) => {
    if (!slotData || !slotData.items) return 0;
    return slotData.items.reduce((sum, item) => sum + item.qty, 0);
  };

  // ค้นหาตำแหน่ง Rack และ Slot ที่มีสินค้าตัวนี้จัดเก็บอยู่ เพื่อให้ Outbound Planner เลือกหยิบออก
  const getLocationsToPickFromItem = (itemName) => {
    const locations = [];
    Object.entries(rackStorage).forEach(([rackId, slots]) => {
      Object.entries(slots).forEach(([slotName, slotData]) => {
        if (slotData && slotData.items) {
          const foundItem = slotData.items.find(i => i.name === itemName);
          if (foundItem && foundItem.qty > 0) {
            locations.push({
              rackId,
              slotName,
              qtyInSlot: foundItem.qty
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

  const handleOpenOutboundPlan = (order) => {
    setSelectedOrder(order);
    setRemainingOrderItems(order.items.map(i => ({ ...i })));
    setSelectedItemToPick(null);
    setOutboundLogs([]);
    setViewMode('plan');
  };

  // เมื่อ Planner คลิกเลือกสินค้าที่ลูกค้าสั่ง เพื่อวางแผนว่าจะไปหยิบจาก Slot ไหน
  const handleSelectItemToPick = (item) => {
    setSelectedItemToPick(item);
    setTargetPickLocation(null);
    setPickInputQty(Math.min(item.qty, MAX_PALLET_CAPACITY));
    setIsPickModalOpen(true);
  };

  // ฟังก์ชันตัดสต็อกสินค้าออกจาก Slot ที่เลือก (Outbound Execution)
  const executePick = (rackId, slotName, qtyToPick) => {
    const numQty = parseInt(qtyToPick);
    if (isNaN(numQty) || numQty <= 0) {
      alert('กรุณาระบุจำนวนที่จะหยิบให้ถูกต้อง');
      return false;
    }
    if (numQty > selectedItemToPick.qty) {
      alert(`จำนวนเกินกว่าที่ลูกค้าสั่ง (ต้องการหยิบแค่ ${selectedItemToPick.qty} ชิ้น)`);
      return false;
    }

    const currentRackSlots = { ...(rackStorage[rackId] || {}) };
    const targetSlot = currentRackSlots[slotName];

    if (!targetSlot || !targetSlot.items) {
      alert('ไม่พบข้อมูลสินค้าในตำแหน่งดังกล่าว');
      return false;
    }

    const itemIndex = targetSlot.items.findIndex(i => i.name === selectedItemToPick.name);
    if (itemIndex === -1) {
      alert('ไม่พบสินค้านี้ใน Slot ที่เลือก');
      return false;
    }

    const availableInSlot = targetSlot.items[itemIndex].qty;
    if (numQty > availableInSlot) {
      alert(`สินค้าใน Slot นี้มีไม่พอ (มีอยู่ ${availableInSlot} ชิ้น)`);
      return false;
    }

    // หักจำนวนใน Slot ลง
    const updatedItems = [...targetSlot.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      qty: updatedItems[itemIndex].qty - numQty
    };

    // กรองเอาสินค้าที่หมดเกลี้ยงออกไปจาก Slot
    const filteredItems = updatedItems.filter(i => i.qty > 0);

    if (filteredItems.length === 0) {
      delete currentRackSlots[slotName]; // ถ้าไม่มีสินค้าเหลือใน Slot เลย ให้เคลียร์ Slot นั้นว่าง
    } else {
      currentRackSlots[slotName] = { items: filteredItems };
    }

    // อัปเดตคลังสินค้า
    setRackStorage(prev => ({
      ...prev,
      [rackId]: currentRackSlots
    }));

    // บันทึก Log การหยิบสินค้าออก
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      itemName: selectedItemToPick.name,
      qty: numQty,
      rackId: rackId,
      slotName: slotName
    };
    setOutboundLogs(prev => [newLog, ...prev]);

    // ตัดจำนวนสินค้าที่ต้องหยิบในออร์เดอร์ลง
    setRemainingOrderItems(prev => {
      return prev.map(item => {
        if (item.id === selectedItemToPick.id) {
          return { ...item, qty: item.qty - numQty };
        }
        return item;
      }).filter(item => item.qty > 0);
    });

    setSelectedItemToPick(null);
    return true;
  };

  const handleConfirmPick = () => {
    if (!targetPickLocation) {
      alert('กรุณาเลือกตำแหน่ง Slot ที่ต้องการไปหยิบสินค้าออกก่อนครับ');
      return;
    }
    const success = executePick(targetPickLocation.rackId, targetPickLocation.slotName, pickInputQty);
    if (success) {
      setIsPickModalOpen(false);
      setTargetPickLocation(null);
    }
  };

  const handleApproveOutbound = () => {
    alert(`อนุมัติแผน Outbound สำหรับคำสั่งซื้อ ${selectedOrder.code} เรียบร้อยแล้ว! ส่งข้อมูลให้ทีม Picker ดำเนินการหยิบสินค้า`);
    setViewMode('list');
    setSelectedOrder(null);
  };

  const isAllPicked = remainingOrderItems.length === 0;

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
              <h2 className="text-2xl font-serif tracking-wide">Warehouse Outbound Automation</h2>
              <p className="text-[11px] text-slate-400 tracking-[0.2em] uppercase mt-0.5">
                ROLE: Planner Outbound {currentUser?.username || 'PN001'}
              </p>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 min-h-[520px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900 tracking-wider">OUTBOUND PLANNER TERMINAL</h3>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center gap-3 shadow-inner">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <ShoppingCart size={18} />
                </div>
                <span className="text-sm font-semibold text-amber-700">Customer Orders - Pending Outbound Planning</span>
              </div>

              <div className="space-y-3">
                {outboundOrders.map((ord) => (
                  <div key={ord.id} className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm hover:border-amber-400 hover:shadow-md transition">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">
                        ORDER {ord.id} <span className="text-slate-500 font-normal">[{ord.code}]</span>
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold mt-0.5">
                        <Building2 size={13} /> {ord.customer}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Requested Items : {ord.qtyItems} types</p>
                    </div>
                    <button onClick={() => handleOpenOutboundPlan(ord)} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow flex items-center gap-1">
                      <ArrowUpRight size={14} /> Plan Outbound
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex gap-6 relative">

              {/* Left 3D Warehouse Model & Rack Status */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-amber-600 rounded-full inline-block"></span>
                      <h3 className="font-bold text-slate-800 text-sm">WAREHOUSE STOCK OVERVIEW</h3>
                    </div>
                    <button onClick={() => setViewMode('list')} className="bg-slate-900 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-1.5">
                      <ArrowLeft size={14} /> Back to Orders
                    </button>
                  </div>

                  {selectedItemToPick && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4 flex items-center justify-between text-xs text-amber-800 font-semibold">
                      <span>📤 กำลังวางแผนหยิบสินค้า: <b>{selectedItemToPick.name}</b> (ต้องการ {selectedItemToPick.qty} ชิ้น) — คลิกเลือกสินค้าจากขวาเพื่อดูตำแหน่งในคลัง</span>
                    </div>
                  )}

                  <div className="bg-slate-900 rounded-2xl min-h-[380px] relative p-6 flex flex-wrap gap-4 items-center justify-center border border-slate-800 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                    {racks.map((rack) => {
                      const metrics = getRackMetrics(rack.id);

                      return (
                        <div
                          key={rack.id}
                          className="w-[47%] rounded-2xl border-2 border-slate-700 bg-slate-800/90 p-4 flex flex-col justify-between relative z-10 shadow-lg"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                              {rack.name}
                            </span>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-black border bg-slate-700 text-slate-300">
                              {metrics.percent}% Full
                            </span>
                          </div>

                          <div className="space-y-2 my-1">
                            <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                              <span>Stock ({metrics.totalStoredQty} pcs)</span>
                              <span className="text-slate-400">{metrics.filledSlotsCount}/9 Slots</span>
                            </div>

                            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                              <div
                                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                                style={{ width: `${metrics.percent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Outbound Activity Log */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-amber-600" />
                      <h3 className="font-black text-slate-800 text-xs tracking-wider uppercase">Outbound Picking Log (ประวัติการวางแผนหยิบออก)</h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">Total Picks: {outboundLogs.length}</span>
                  </div>

                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {outboundLogs.length === 0 ? (
                      <div className="text-center py-5 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        ยังไม่มีประวัติการหยิบสินค้าในรอบนี้ — เลือกรายการสินค้าทางขวาเพื่อเริ่มวางแผนหยิบออก
                      </div>
                    ) : (
                      outboundLogs.map((log) => (
                        <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <p className="text-slate-800">
                              หยิบ <strong className="text-amber-700">{log.itemName}</strong> จำนวน <strong className="text-slate-900">{log.qty} ชิ้น</strong> ออกจาก <strong className="text-slate-900">{log.rackId} ({log.slotName})</strong>
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

              {/* Right Order Items Panel */}
              <div className="w-[340px] bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <ShoppingCart className="w-5 h-5 text-amber-600" />
                    <div>
                      <h3 className="font-black text-slate-800 text-sm">CUSTOMER ORDER</h3>
                      <p className="text-[11px] text-amber-600 font-bold">{selectedOrder?.code} <span className="text-slate-500 font-normal">({selectedOrder?.customer})</span></p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3">คลิกเลือกสินค้าเพื่อเลือกตำแหน่ง Slot ที่จะหยิบออก:</p>

                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {remainingOrderItems.length === 0 ? (
                      <div className="text-center py-8 text-emerald-600 font-bold text-xs bg-emerald-50 rounded-2xl border border-emerald-200">
                        ✨ วางแผนหยิบสินค้าครบทุกรายการแล้ว!
                      </div>
                    ) : (
                      remainingOrderItems.map((item) => {
                        const isSelected = selectedItemToPick?.id === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleSelectItemToPick(item)}
                            className={`border rounded-2xl p-3.5 transition cursor-pointer shadow-sm ${
                              isSelected 
                                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400' 
                                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-bold text-slate-800 text-xs">{item.name}</p>
                              {isSelected && <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded font-bold">Picking...</span>}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[11px] text-slate-500">Need to Pick: <b className="text-amber-600">{item.qty}</b> pcs</span>
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
                    onClick={handleApproveOutbound}
                    disabled={!isAllPicked}
                    className={`w-full py-3 rounded-xl font-bold shadow-lg transition text-sm flex items-center justify-center gap-2 ${
                      isAllPicked
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer transform hover:scale-105'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <CheckCircle2 size={16} /> APPROVE OUTBOUND PLAN
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* POPUP MODAL: OUTBOUND PICK LOCATION SELECTION */}
      {/* ------------------------------------------------------------- */}
      {isPickModalOpen && selectedItemToPick && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-[560px] shadow-2xl border border-slate-200 animate-fade-in flex flex-col">
            
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-base">เลือกตำแหน่ง Slot ที่จะหยิบสินค้าออก</h3>
                  <p className="text-xs text-amber-600 font-bold">{selectedItemToPick.name} (ต้องการหยิบ {selectedItemToPick.qty} ชิ้น)</p>
                </div>
              </div>
              <button onClick={() => setIsPickModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold px-2 py-1">
                ✕
              </button>
            </div>

            {/* แสดงตำแหน่งในคลังที่มีสินค้านี้อยู่ */}
            <div className="my-2">
              <p className="text-xs font-bold text-slate-700 mb-2.5">
                ตำแหน่งจัดเก็บสินค้าชิ้นนี้ในคลังปัจจุบัน:
              </p>

              {(() => {
                const availableLocations = getLocationsToPickFromItem(selectedItemToPick.name);
                if (availableLocations.length === 0) {
                  return (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs text-rose-600 my-2 font-bold">
                      ⚠️ สินค้าหมดสต็อกในคลังทุกตำแหน่ง! ไม่สามารถหยิบออกได้
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {availableLocations.map((loc, idx) => {
                      const isSelected = targetPickLocation?.rackId === loc.rackId && targetPickLocation?.slotName === loc.slotName;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setTargetPickLocation(loc);
                            setPickInputQty(Math.min(selectedItemToPick.qty, loc.qtyInSlot));
                          }}
                          className={`p-3.5 border-2 rounded-2xl flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-300 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-amber-400'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-800">
                              {loc.rackId} — <span className="text-amber-600">{loc.slotName}</span>
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              มีสินค้าใน Slot นี้: <b>{loc.qtyInSlot}</b> ชิ้น
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-xl ${isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                            {isSelected ? 'เลือกหยิบจากจุดนี้' : 'คลิกเพื่อเลือก'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Input จำนวนที่จะหยิบ */}
            {targetPickLocation && (
              <div className="mt-3 p-4 bg-amber-50/60 border border-amber-200 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    ระบุจำนวนที่จะหยิบออกจาก {targetPickLocation.rackId} ({targetPickLocation.slotName}):
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={Math.min(selectedItemToPick.qty, targetPickLocation.qtyInSlot)}
                  value={pickInputQty}
                  onChange={(e) => setPickInputQty(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={handleConfirmPick}
                disabled={!targetPickLocation}
                className={`font-bold px-6 py-2.5 rounded-xl text-xs transition shadow ${
                  targetPickLocation 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                ยืนยันการหยิบสินค้าออก
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}