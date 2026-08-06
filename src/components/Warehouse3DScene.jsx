import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Grid } from '@react-three/drei';

// คอมโพเนนต์สร้างชั้นวาง (Rack) แต่ละตัว
function Rack({ position, name, boxesConfig }) {
  return (
    <group position={position}>
      {/* ป้ายชื่อ Zone ด้านบน */}
      <Html position={[0, 3.2, 0]} center>
        <div className="bg-slate-900/90 text-white px-2.5 py-1 rounded-md text-xs font-bold tracking-wider whitespace-nowrap shadow-lg">
          {name}
        </div>
      </Html>

      {/* เสาทั้ง 4 มุมของ Rack */}
      <mesh position={[-0.9, 1.25, 0.6]}>
        <boxGeometry args={[0.1, 2.5, 0.1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.9, 1.25, 0.6]}>
        <boxGeometry args={[0.1, 2.5, 0.1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[-0.9, 1.25, -0.6]}>
        <boxGeometry args={[0.1, 2.5, 0.1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.9, 1.25, -0.6]}>
        <boxGeometry args={[0.1, 2.5, 0.1]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* ชั้นวาง (Shelves) และ กล่องสินค้า (Boxes) ในแต่ละระดับความสูง */}
      {[0, 1.1, 2.2].map((yLevel, levelIdx) => (
        <group key={levelIdx} position={[0, yLevel, 0]}>
          {/* แผ่นไม้ชั้นวาง */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.9, 0.08, 1.3]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>

          {/* กล่องสินค้าบนชั้น */}
          {boxesConfig[levelIdx]?.map((box, boxIdx) => (
            <mesh key={boxIdx} position={box.pos}>
              <boxGeometry args={[0.5, 0.45, 0.5]} />
              <meshStandardMaterial color={box.status === 'critical' ? '#ef4444' : '#1d4ed8'} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function Warehouse3DScene() {
  // ข้อมูลตำแหน่งและการจัดวางกล่องในแต่ละ Rack ให้ตรงตามเลย์เอาต์ภาพตัวอย่าง
  const racksData = [
    {
      name: 'ZONE A-1',
      position: [-2.2, 0, -1.2],
      boxes: [
        [{ pos: [-0.5, 0.28, 0] }, { pos: [0, 0.28, 0], status: 'critical' }, { pos: [0.5, 0.28, 0] }],
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0] }],
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0] }],
      ]
    },
    {
      name: 'ZONE A-2',
      position: [-0.7, 0, 0.6],
      boxes: [
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0] }],
        [{ pos: [-0.5, 0.28, 0], status: 'critical' }, { pos: [0, 0.28, 0] }, { pos: [0.5, 0.28, 0] }],
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0] }],
      ]
    },
    {
      name: 'ZONE B-1',
      position: [0.7, 0, -0.6],
      boxes: [
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0] }],
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0], status: 'critical' }],
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0] }],
      ]
    },
    {
      name: 'ZONE B-2',
      position: [2.2, 0, 1.2],
      boxes: [
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0] }],
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0] }],
        [{ pos: [-0.4, 0.28, 0] }, { pos: [0.4, 0.28, 0], status: 'critical' }],
      ]
    }
  ];

  return (
    <div className="w-full h-full min-h-[500px] bg-slate-50 relative rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [6, 7, 8], fov: 45 }}>
        <color attach="background" args={['#f8fafc']} />
        
        {/* แสงสว่างภายใน Scene */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 20, 10]} intensity={1.1} />
        
        {/* พื้นตาราง Grid ด้านล่าง */}
        <Grid 
          position={[0, -0.01, 0]} 
          args={[25, 25]} 
          cellSize={1} 
          cellThickness={1} 
          cellColor="#e2e8f0" 
          sectionSize={5} 
          sectionThickness={1.5} 
          sectionColor="#cbd5e1" 
          fadeDistance={30} 
        />

            {/* เรนเดอร์ Rack ทั้ง 4 โซน */}
        {racksData.map((rack, idx) => (
          <Rack 
            key={idx} 
            position={rack.position} 
            name={rack.name} 
            boxesConfig={rack.boxes} 
          />
        ))}

        {/* ควบคุมการหมุน/ซูมมุมมอง 3D ด้วยเมาส์ */}
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          minDistance={3} 
          maxDistance={15} 
          maxPolarAngle={Math.PI / 2 - 0.05} // ไม่ให้กล้องมุดลงใต้พื้น
        />
      </Canvas>
    </div>
  );
}