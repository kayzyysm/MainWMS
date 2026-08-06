import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import gsap from 'gsap';
import { LayoutDashboard, RotateCcw, Package, Layers, ChevronUp } from 'lucide-react';

// 1. คอมโพเนนต์กล่องสินค้าพร้อมเอฟเฟกต์กระพริบ
function BlinkingSlotBox({ args, position, color, isSelected, onClick, status }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (isSelected && meshRef.current) {
      const time = state.clock.getElapsedTime();
      const blinkIntensity = Math.sin(time * 6) * 0.75 + 1.25;
      meshRef.current.material.emissiveIntensity = blinkIntensity;
    }
  });

  return (
    <Box args={args} position={position} onClick={onClick} ref={meshRef}>
      <meshStandardMaterial
        color={color}
        emissive={isSelected ? "#ffffff" : (status === 'Critical' ? '#ef4444' : '#000000')}
        emissiveIntensity={isSelected ? 1.5 : (status === 'Critical' ? 0.4 : 0)}
        toneMapped={false}
      />
      {isSelected && <pointLight distance={3} intensity={8} color="white" />}
    </Box>
  );
}

// 2. คอมโพเนนต์ Rack จัดระเบียบพิกัด
function Rack({ position, name, slots, onSlotClick, onClick, selectedSlotId }) {
  const shelfHeight = 4.2;
  const levels = [0.2, 1.6, 3.0];
  const columns = [-0.7, 0, 0.7];

  const getSlotColor = (status) => {
    switch (status) {
      case 'Critical': return '#ef4444';
      case 'Occupied': return '#3b82f6';
      default: return '#3b82f6';
    }
  };

  return (
    <group position={position} onClick={onClick}>
      <Box args={[0.15, shelfHeight, 0.15]} position={[-1.1, shelfHeight / 2, 0.55]}><meshStandardMaterial color="#1e293b" /></Box>
      <Box args={[0.15, shelfHeight, 0.15]} position={[1.1, shelfHeight / 2, 0.55]}><meshStandardMaterial color="#1e293b" /></Box>
      <Box args={[0.15, shelfHeight, 0.15]} position={[-1.1, shelfHeight / 2, -0.55]}><meshStandardMaterial color="#1e293b" /></Box>
      <Box args={[0.15, shelfHeight, 0.15]} position={[1.1, shelfHeight / 2, -0.55]}><meshStandardMaterial color="#1e293b" /></Box>

      {levels.map((yPos, lIndex) => (
        <group key={`level-${lIndex}`}>
          <Box args={[2.3, 0.1, 0.08]} position={[0, yPos, 0.55]}><meshStandardMaterial color="#f59e0b" /></Box>
          <Box args={[2.3, 0.1, 0.08]} position={[0, yPos, -0.55]}><meshStandardMaterial color="#f59e0b" /></Box>

          {columns.map((xPos, cIndex) => {
            const slotIndex = lIndex * 3 + cIndex;
            const slotData = slots[slotIndex];
            if (!slotData) return null;

            const isSelected = selectedSlotId === slotData.id;

            return (
              <group key={`slot-${slotIndex}`} position={[xPos, yPos, 0]}>
                <Box args={[0.65, 0.08, 1.0]} position={[0, 0.08, 0]}>
                  <meshStandardMaterial color="#78350f" />
                </Box>

                <BlinkingSlotBox
                  args={[0.6, 0.55, 0.9]}
                  position={[0, 0.4, 0]}
                  color={getSlotColor(slotData.status)}
                  status={slotData.status}
                  isSelected={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotClick(slotData, slotIndex);
                  }}
                />
              </group>
            );
          })}
        </group>
      ))}

      <Text position={[0, shelfHeight + 0.4, 0]} fontSize={0.35} color="#0f172a" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  );
}

// 3. จัดการมุมมองกล้องด้วย GSAP
function SceneManager({ viewMode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (viewMode === 'focus') {
      gsap.to(camera.position, { x: 0, y: 2.5, z: 4.5, duration: 1.5, ease: "power2.inOut" });
    } else {
      gsap.to(camera.position, { x: 6, y: 8, z: 8, duration: 1.5, ease: "power2.inOut" });
    }
  }, [viewMode, camera]);

  return null;
}

// 4. Main Admin Warehouse Dashboard Component
export default function WarehouseDashboard({ currentUser, onLogout }) {
  const [viewMode, setViewMode] = useState('overview');
  const [selectedRack, setSelectedRack] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [managerSearch, setManagerSearch] = useState('');

  // ฟังก์ชันช่วยคำนวณ status อัตโนมัติ: ถ้า qty < 10 ให้เป็น 'Critical' (แดง) นอกนั้นเป็น 'Occupied' (น้ำเงิน)
  const createSlots = (baseSlots) => {
    return baseSlots.map(slot => ({
      ...slot,
      status: slot.qty < 10 ? 'Critical' : 'Occupied'
    }));
  };

  const [racks, setRacks] = useState([
    {
      id: 'A1',
      name: 'ZONE A-1',
      slots: createSlots([
        { id: 'A1-S1', item: 'RGB Headset', qty: 20 },
        { id: 'A1-S2', item: 'Gaming Mouse', qty: 5 },  // น้อยกว่า 10 -> แดง (Critical)
        { id: 'A1-S3', item: 'Mechanical Keyboard', qty: 30 },
        { id: 'A1-S4', item: 'Mouse Pad XL', qty: 50 },
        { id: 'A1-S5', item: 'Gaming Chair', qty: 4 },   // น้อยกว่า 10 -> แดง (Critical)
        { id: 'A1-S6', item: 'USB Microphone', qty: 12 },
        { id: 'A1-S7', item: 'Desk Lamp RGB', qty: 25 },
        { id: 'A1-S8', item: 'UltraWide Monitor', qty: 8 }, // น้อยกว่า 10 -> แดง (Critical)
        { id: 'A1-S9', item: 'Stream Deck', qty: 10 }
      ])
    },
    {
      id: 'A2',
      name: 'ZONE A-2',
      slots: createSlots([
        { id: 'A2-S1', item: 'Graphics Card RTX', qty: 4 }, // น้อยกว่า 10 -> แดง (Critical)
        { id: 'A2-S2', item: 'Processor i7', qty: 14 },
        { id: 'A2-S3', item: 'Motherboard Z790', qty: 9 }, // น้อยกว่า 10 -> แดง (Critical)
        { id: 'A2-S4', item: 'CPU Air Cooler', qty: 18 },
        { id: 'A2-S5', item: 'DDR5 RAM 32GB', qty: 22 },
        { id: 'A2-S6', item: 'NVMe SSD 2TB', qty: 35 },
        { id: 'A2-S7', item: 'Thermal Paste', qty: 60 },
        { id: 'A2-S8', item: 'Case Fan 3-Pack', qty: 28 },
        { id: 'A2-S9', item: 'PCIe Riser Cable', qty: 15 }
      ])
    },
    {
      id: 'B1',
      name: 'ZONE B-1',
      slots: createSlots([
        { id: 'B1-S1', item: 'Power Supply 850W', qty: 3 }, // น้อยกว่า 10 -> แดง (Critical)
        { id: 'B1-S2', item: 'Liquid Cooler 360mm', qty: 11 },
        { id: 'B1-S3', item: 'PC Case ATX', qty: 7 },        // น้อยกว่า 10 -> แดง (Critical)
        { id: 'B1-S4', item: 'Wi-Fi 6E PCIe Card', qty: 19 },
        { id: 'B1-S5', item: 'Bluetooth Adapter', qty: 24 },
        { id: 'B1-S6', item: 'SATA SSD 1TB', qty: 30 },
        { id: 'B1-S7', item: 'External HDD 4TB', qty: 13 },
        { id: 'B1-S8', item: 'UPS Battery Backup', qty: 5 }, // น้อยกว่า 10 -> แดง (Critical)
        { id: 'B1-S9', item: 'HDMI 2.1 Cable', qty: 45 }
      ])
    },
    {
      id: 'B2',
      name: 'ZONE B-2',
      slots: createSlots([
        { id: 'B2-S1', item: 'CPU Cooler AIO', qty: 10 },
        { id: 'B2-S2', item: 'RAM 16GB Kit', qty: 25 },
        { id: 'B2-S3', item: 'Graphics Card RTX 4060', qty: 6 }, // น้อยกว่า 10 -> แดง (Critical)
        { id: 'B2-S4', item: 'Sound Card PCIe', qty: 8 },    // น้อยกว่า 10 -> แดง (Critical)
        { id: 'B2-S5', item: 'Capture Card 4K', qty: 4 },     // น้อยกว่า 10 -> แดง (Critical)
        { id: 'B2-S6', item: 'Antistatic Wrist Strap', qty: 50 },
        { id: 'B2-S7', item: 'Toolkit Precision', qty: 20 },
        { id: 'B2-S8', item: 'Cable Extension Kit', qty: 33 },
        { id: 'B2-S9', item: 'Graphics Card Holder', qty: 16 }
      ])
    }
  ]);

  const handleSlotClick = (slotData, index, rackId) => {
    const targetRack = racks.find(r => r.id === rackId);
    setSelectedRack({
      id: rackId,
      displayTitle: `${targetRack.name} - Slot ${index + 1}`,
      currentSlot: slotData,
      item: slotData.item,
      qty: slotData.qty
    });
    setSelectedSlot(slotData);
    setViewMode('focus');
  };

  const handleManagerSearch = () => {
    if (!managerSearch) return;
    for (const rack of racks) {
      const foundSlot = rack.slots.find(s => s.item.toLowerCase().includes(managerSearch.toLowerCase()));
      if (foundSlot) {
        const index = rack.slots.indexOf(foundSlot);
        handleSlotClick(foundSlot, index, rack.id);
        break;
      }
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen font-sans flex gap-6">
      {/* ================= 1. LEFT SIDEBAR ================= */}
      <div className="w-[320px] lg:w-[380px] h-[calc(100vh-3rem)] sticky top-6 bg-[#0b0f19] text-white flex flex-col justify-between p-8 shrink-0 overflow-hidden rounded-3xl border border-slate-800 shadow-xl">

        {/* Background Image / Overlay */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-luminosity pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop"
            alt="Logistics Fleet"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-transparent" />
        </div>

        {/* Sidebar Content (Top Logo) */}
        <div className="relative z-10">
          <h1 className="text-5xl font-black tracking-widest text-white leading-none">
            KPA
          </h1>
          <p className="text-3xl font-bold tracking-[0.35em] text-slate-200 mt-2">
            W.M.S
          </p>
        </div>

        {/* Sidebar Content (Bottom User Profile) */}
        <div className="relative z-10">
          <div className="bg-[#1a233a]/80 backdrop-blur-md border border-slate-700/60 rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentUser?.username || 'Vendor001'}
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
      
      <div className="flex-1 mx-auto bg-slate-100 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden p-6">
        
        {/* Top Header Bar ของระบบ */}
        <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl mb-6 flex justify-between items-center shadow-md border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl">
              <Layers size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider uppercase">Warehouse Automation System</h1>
              <p className="text-xs text-slate-400">ADMIN CONTROL PANEL: 3D MONITORING & INVENTORY</p>
            </div>
          </div>
          <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-blue-400">
            ROLE: System Administrator
          </div>
        </div>

        {/* Grid หลัก แบ่งสัดส่วน 3D Canvas และ Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* ฝั่ง 3D Canvas */}
          <div className="lg:col-span-3 h-[600px] bg-slate-950 rounded-3xl shadow-2xl overflow-hidden relative border-4 border-slate-800">
            
            {/* Header ใน Canvas & ปุ่มย้อนกลับ */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
              <div className="bg-white/95 backdrop-blur p-4 rounded-xl shadow-xl border border-blue-200">
                <p className="text-blue-900 font-black flex items-center gap-2 uppercase tracking-tighter">
                  <LayoutDashboard size={18} className="text-blue-500" />
                  {viewMode === 'overview' ? 'Warehouse Overview' : `Focus Mode: ${selectedRack?.id}`}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Status: Monitoring Mode</p>
              </div>

              {viewMode === 'focus' && (
                <button
                  onClick={() => { setViewMode('overview'); setSelectedRack(null); setSelectedSlot(null); }}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 cursor-pointer transition transform hover:scale-105"
                >
                  <RotateCcw size={18} /> BACK TO OVERVIEW
                </button>
              )}
            </div>

            {/* Legend สี */}
            {viewMode === 'overview' && (
              <div className="absolute bottom-6 left-6 z-10 flex gap-4 text-[10px] bg-black/60 p-3 rounded-xl text-white backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Occupied (&ge; 10 pcs)</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Critical (&lt; 10 pcs)</div>
              </div>
            )}

            {/* Search Box */}
            <div className="absolute top-6 right-6 z-10 flex gap-2">
              <input
                type="text"
                placeholder="พิมพ์ชื่อสินค้า..."
                className="p-2.5 rounded-xl bg-white border-2 border-blue-500 shadow-lg outline-none w-64 text-sm"
                value={managerSearch}
                onChange={(e) => setManagerSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManagerSearch()}
              />
              <button
                onClick={handleManagerSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer"
              >
                <Package size={18} /> SEARCH
              </button>
            </div>

            {/* R3F Canvas */}
            <Canvas camera={{ position: [6, 8, 8] }}>
              <color attach="background" args={['#f1f5f9']} />
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <spotLight position={[-10, 10, 10]} angle={0.15} />
              <gridHelper args={[20, 20, 0xcbd5e1, 0xe2e8f0]} position={[0, -0.05, 0]} />

              <SceneManager viewMode={viewMode} />

              {/* ZONE A-1 */}
              {(viewMode === 'overview' || selectedRack?.id === 'A1') && (
                <Rack
                  position={viewMode === 'focus' ? [0, 0, 0] : [-3.0, 0, 2.0]}
                  name="ZONE A-1"
                  slots={racks.find(r => r.id === 'A1')?.slots || []}
                  onSlotClick={(slotData, index) => handleSlotClick(slotData, index, 'A1')}
                  selectedSlotId={selectedRack?.id === 'A1' ? selectedSlot?.id : null}
                  onClick={() => { if (viewMode === 'overview') { setSelectedRack({ id: 'A1' }); setViewMode('focus'); }}}
                />
              )}

              {/* ZONE A-2 */}
              {(viewMode === 'overview' || selectedRack?.id === 'A2') && (
                <Rack
                  position={viewMode === 'focus' ? [0, 0, 0] : [-3.0, 0, -2.0]}
                  name="ZONE A-2"
                  slots={racks.find(r => r.id === 'A2')?.slots || []}
                  onSlotClick={(slotData, index) => handleSlotClick(slotData, index, 'A2')}
                  selectedSlotId={selectedRack?.id === 'A2' ? selectedSlot?.id : null}
                  onClick={() => { if (viewMode === 'overview') { setSelectedRack({ id: 'A2' }); setViewMode('focus'); }}}
                />
              )}

              {/* ZONE B-1 */}
              {(viewMode === 'overview' || selectedRack?.id === 'B1') && (
                <Rack
                  position={viewMode === 'focus' ? [0, 0, 0] : [3.0, 0, 2.0]}
                  name="ZONE B-1"
                  slots={racks.find(r => r.id === 'B1')?.slots || []}
                  onSlotClick={(slotData, index) => handleSlotClick(slotData, index, 'B1')}
                  selectedSlotId={selectedRack?.id === 'B1' ? selectedSlot?.id : null}
                  onClick={() => { if (viewMode === 'overview') { setSelectedRack({ id: 'B1' }); setViewMode('focus'); }}}
                />
              )}

              {/* ZONE B-2 */}
              {(viewMode === 'overview' || selectedRack?.id === 'B2') && (
                <Rack
                  position={viewMode === 'focus' ? [0, 0, 0] : [3.0, 0, -2.0]}
                  name="ZONE B-2"
                  slots={racks.find(r => r.id === 'B2')?.slots || []}
                  onSlotClick={(slotData, index) => handleSlotClick(slotData, index, 'B2')}
                  selectedSlotId={selectedRack?.id === 'B2' ? selectedSlot?.id : null}
                  onClick={() => { if (viewMode === 'overview') { setSelectedRack({ id: 'B2' }); setViewMode('focus'); }}}
                />
              )}

              <OrbitControls
                makeDefault
                target={[0, 2, 0]}
                enablePan={viewMode === 'overview'}
                enableRotate={viewMode === 'overview'}
              />
            </Canvas>
          </div>

          {/* Sidebar ฝั่งขวา: RACK INFO */}
          <div className="bg-white p-6 rounded-3xl shadow-xl border-2 border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Package size={20} className="text-blue-500" /> RACK INFO
              </h3>

              {selectedRack && selectedRack.currentSlot ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-2xl font-black text-blue-600 uppercase">
                      {selectedRack.displayTitle}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      Location detail
                    </p>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 shadow-inner">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Product Name</p>
                      <p className="text-lg font-bold text-slate-700">
                        {selectedRack.item}
                      </p>
                    </div>

                    <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Quantity</p>
                        <p className="text-3xl font-black text-blue-600">
                          {selectedRack.qty} <span className="text-xs font-normal text-slate-400">PCS</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          selectedRack.currentSlot.status === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {selectedRack.currentSlot.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 h-80">
                  <div className="bg-slate-50 p-4 rounded-full mb-4 shadow-sm">
                    <Package size={32} />
                  </div>
                  <p className="font-bold text-slate-500">โปรดเลือก Slot</p>
                  <p className="text-xs mt-1">คลิกที่กล่องในชั้นวางเพื่อดูรายละเอียด</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}