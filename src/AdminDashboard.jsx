import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Text } from '@react-three/drei';
import gsap from 'gsap';
import { LayoutDashboard, RotateCcw, Package, Layers, ChevronUp, RefreshCcw, Search } from 'lucide-react';
import { getRacks } from './services/api'; // ปรับ path ตามโครงสร้างโปรเจกต์ของคุณ

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
      case 'Critical': return '#ef4444'; // สีแดง
      case 'Occupied': return '#3b82f6'; // สีน้ำเงิน
      default: return '#94a3b8';         // สีเทาโปร่งสำหรับพื้นที่ว่าง
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
      gsap.to(camera.position, { x: 0, y: 2.5, z: 4.5, duration: 1.2, ease: "power2.inOut" });
    } else {
      gsap.to(camera.position, { x: 6, y: 8, z: 8, duration: 1.2, ease: "power2.inOut" });
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
  const [searchSuggestions, setSearchSuggestions] = useState([]); // State สำหรับ Dropdown

  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const abortControllerRef = useRef(null);
  const viewModeRef = useRef(viewMode);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  const memoizedRacks = React.useMemo(() => racks, [racks]);

  // 1. ฟังก์ชันดึงข้อมูลแบบ Real-Time จาก MongoDB Atlas
  const fetchRacksFromAPI = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const response = await getRacks({
        signal: abortControllerRef.current.signal
      });

      const formattedRacks = response.data.map(rack => {
        let rawSlots = rack.slots;

        const slotsArray = Array.from({ length: 9 }, (_, index) => {
          const slotKeyNum = index + 1;
          
          let slotData = null;
          if (rawSlots) {
            const foundKey = Object.keys(rawSlots).find(k =>
              k.toLowerCase() === `slot ${slotKeyNum}` ||
              k.toLowerCase() === `slot${slotKeyNum}` ||
              k.toLowerCase() === `s${slotKeyNum}`
            );
            if (foundKey) {
              slotData = rawSlots[foundKey];
            }
          }

          let itemName = 'พื้นที่ว่าง';
          let itemQty = 0;

          if (slotData) {
            if (slotData.items && Array.isArray(slotData.items) && slotData.items.length > 0) {
              itemName = slotData.items[0].name || slotData.items[0].item || 'สินค้า';
              itemQty = slotData.items[0].qty ?? 0;
            } else if (slotData.item || slotData.itemName) {
              itemName = slotData.item || slotData.itemName;
              itemQty = slotData.qty ?? 0;
            } else if (slotData.qty > 0) {
              itemQty = slotData.qty;
              itemName = 'สินค้าในสต็อก';
            }
          }

          let slotStatus = 'Empty';
          if (itemQty > 0 || itemName !== 'พื้นที่ว่าง') {
            slotStatus = itemQty < 10 ? 'Critical' : 'Occupied';
          }

          return {
            id: `${rack.rackId || rack.id}-S${slotKeyNum}`,
            slotNumber: slotKeyNum,
            item: itemName,
            qty: itemQty,
            status: slotStatus
          };
        });

        return {
          ...rack,
          id: rack.rackId || rack.id,
          slots: slotsArray
        };
      });

      setRacks(formattedRacks);
      setErrorMsg('');
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED' || err.message === 'canceled') {
        return;
      }
      console.error('Failed to fetch racks:', err);
      setErrorMsg('ไม่สามารถโหลดข้อมูลคลังสินค้าจากเซิร์ฟเวอร์ได้');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // 2. ฟังก์ชันเมื่อคลิกเลือก Slot เพื่อโฟกัสโมเดล 3D
  const handleSlotClick = (slotData, index, rackId) => {
    const targetRack = racks.find(r => r.id === rackId);
    if (!targetRack) return;

    const slotNum = slotData.slotNumber || (index + 1);

    setSelectedRack({
      id: rackId,
      displayTitle: `${targetRack.name || rackId} Slot ${slotNum}`,
      currentSlot: slotData,
      item: slotData.item,
      qty: slotData.qty
    });
    setSelectedSlot(slotData);
    setViewMode('focus');
  };

  // 3. Auto Refresh ดึงข้อมูลอัตโนมัติ
  useEffect(() => {
    fetchRacksFromAPI(true);

    const interval = setInterval(() => {
      if (viewModeRef.current === 'overview') {
        fetchRacksFromAPI(false);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // 4. ฟังก์ชันจัดการเมื่อผู้ใช้นำคำค้นหาไปใช้ (ผ่านปุ่มกด หรือกด Enter)
  const handleManagerSearch = () => {
    if (!managerSearch.trim()) return;
    
    let foundMatch = false;
    for (const rack of racks) {
      const foundSlot = rack.slots.find(s =>
        (s.item && s.item.toLowerCase().includes(managerSearch.toLowerCase())) ||
        (s.itemName && s.itemName.toLowerCase().includes(managerSearch.toLowerCase()))
      );
      
      if (foundSlot) {
        const index = rack.slots.indexOf(foundSlot);
        handleSlotClick(foundSlot, index, rack.rackId || rack.id);
        foundMatch = true;
        break;
      }
    }
    
    setSearchSuggestions([]);
    if (!foundMatch) {
      alert(`ไม่พบสินค้าที่ตรงกับคำว่า "${managerSearch}" ในคลังสินค้า`);
    }
  };

  // 5. ฟังก์ชันเมื่อพิมพ์ตัวอักษรเพื่อกรองทำ Dropdown แนะนำ
  const handleInputChange = (e) => {
    const keyword = e.target.value;
    setManagerSearch(keyword);

    if (!keyword.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const matches = [];
    racks.forEach(rack => {
      rack.slots.forEach((slot, index) => {
        if (slot.item && slot.item !== 'พื้นที่ว่าง' && slot.item.toLowerCase().includes(keyword.toLowerCase())) {
          matches.push({
            ...slot,
            slotIndex: index,
            rackId: rack.rackId || rack.id,
            rackName: rack.name || rack.rackId || rack.id
          });
        }
      });
    });

    setSearchSuggestions(matches);
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <RefreshCcw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
          <p className="text-sm font-semibold tracking-wider">กำลังเชื่อมต่อฐานข้อมูลคลังสินค้า...</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-5xl font-black tracking-widest text-white leading-none">
            KPA
          </h1>
          <p className="text-3xl font-bold tracking-[0.35em] text-slate-200 mt-2">
            W M S
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-[#1a233a]/80 backdrop-blur-md border border-slate-700/60 rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <ChevronUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-200">
                {currentUser?.username || 'Admin'}
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

      <div className="flex-1 mx-auto bg-slate-100 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden p-6 flex flex-col">

        {/* Top Header Bar ของระบบ */}
        <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl mb-6 flex justify-between items-center shadow-md border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl">
              <Layers size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider uppercase">Warehouse Automation System</h1>
              <p className="text-xs text-slate-400">ADMIN CONTROL PANEL: 3D MONITORING & REAL-TIME DB</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRacksFromAPI(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCcw size={14} /> Refresh
            </button>
            <div className="bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-blue-400">
              ROLE: System Administrator
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-rose-100 border border-rose-400 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Grid หลัก แบ่งสัดส่วน 3D Canvas และ Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">

          {/* ฝั่ง 3D Canvas */}
          <div className="lg:col-span-3 h-[600px] bg-slate-950 rounded-3xl shadow-2xl overflow-hidden relative border-4 border-slate-800">

            <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
              <div className="bg-white/95 backdrop-blur p-4 rounded-xl shadow-xl border border-blue-200">
                <p className="text-blue-900 font-black flex items-center gap-2 uppercase tracking-tighter">
                  <LayoutDashboard size={18} className="text-blue-500" />
                  {viewMode === 'overview' ? 'Warehouse Overview (Live DB)' : `Focus Mode: ${selectedRack?.id}`}
                </p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Status: Connected to MongoDB Atlas</p>
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

            {/* Search Box พร้อม Dropdown แนะนำรายการ */}
            <div className="absolute top-6 right-6 z-20">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อสินค้า..."
                  className="p-2.5 rounded-xl bg-white border-2 border-blue-500 shadow-lg outline-none w-64 text-sm text-slate-800 font-medium focus:ring-2 focus:ring-blue-400"
                  value={managerSearch}
                  onChange={handleInputChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleManagerSearch()}
                />
                <button
                  onClick={handleManagerSearch}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Package size={18} /> SEARCH
                </button>
              </div>

              {/* Dropdown รายชื่อสินค้าแนะนำ */}
              {searchSuggestions.length > 0 && (
                <div className="absolute top-12 left-0 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 mt-2 max-h-60 overflow-y-auto z-30 divide-y divide-slate-100">
                  {searchSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setManagerSearch(item.item);
                        setSearchSuggestions([]);
                        handleSlotClick(item, item.slotIndex, item.rackId);
                      }}
                      className="p-3 hover:bg-blue-50/80 cursor-pointer transition text-xs flex flex-col gap-0.5 group"
                    >
                      <p className="font-bold text-slate-800 group-hover:text-blue-600">{item.item}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-500">
                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {item.rackName} (Slot {item.slotNumber})
                        </span>
                        <span className="font-bold text-slate-600">{item.qty} ชิ้น</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* R3F Canvas */}
            <Canvas camera={{ position: [6, 8, 8] }}>
              <color attach="background" args={['#f1f5f9']} />
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 10, 10]} intensity={1.5} />
              <spotLight position={[-10, 10, 10]} angle={0.15} />
              <gridHelper args={[20, 20, 0xcbd5e1, 0xe2e8f0]} position={[0, -0.05, 0]} />

              <SceneManager viewMode={viewMode} />

              {memoizedRacks.map((rack, index) => {
                const rackCode = (rack.rackId || rack.id || '').toUpperCase();

                let pos = [-3.0, 0, 2.0];
                if (rackCode.includes('A2') || index === 1) pos = [-3.0, 0, -2.0];
                if (rackCode.includes('B1') || index === 2) pos = [3.0, 0, 2.0];
                if (rackCode.includes('B2') || index === 3) pos = [3.0, 0, -2.0];

                if (viewMode === 'focus' && selectedRack?.id !== (rack.rackId || rack.id)) return null;

                return (
                  <Rack
                    key={rack._id || rack.rackId || index}
                    position={viewMode === 'focus' ? [0, 0, 0] : pos}
                    name={rack.name || `ZONE ${rackCode}`}
                    slots={rack.slots || []}
                    onSlotClick={(slotData, slotIdx) => handleSlotClick(slotData, slotIdx, rack.rackId || rack.id)}
                    selectedSlotId={selectedRack?.id === (rack.rackId || rack.id) ? selectedSlot?.id : null}
                    onClick={() => {
                      if (viewMode === 'overview') {
                        setSelectedRack({ id: rack.rackId || rack.id });
                        setViewMode('focus');
                      }
                    }}
                  />
                );
              })}

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
                <Package size={20} className="text-blue-500" /> RACK INFO (LIVE)
              </h3>

              {selectedRack && selectedRack.currentSlot ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-2xl font-black text-blue-600 uppercase">
                      {selectedRack.displayTitle}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      MongoDB Atlas Synced
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
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${selectedRack.currentSlot.status === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
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
                  <p className="text-xs mt-1">คลิกที่กล่องในชั้นวางหรือใช้ช่องค้นหาด้านบน เพื่อดูรายละเอียดสินค้าจริงจากฐานข้อมูล</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}