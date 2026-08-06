import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// =================================================================
// 1. ระบบคำนวณเส้นทางถนนวงกลม (รัศมี 3.2)
// =================================================================
const ROAD_RADIUS = 3.2;

const getRoadPoint = (t, radius = ROAD_RADIUS) => {
  const angle = t * Math.PI * 2;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  const dx = -Math.sin(angle);
  const dz = Math.cos(angle);
  const rotationY = Math.atan2(dx, dz);

  return { x, z, rotationY };
};

// =================================================================
// 2. รั้วรอบขอบชิดสำหรับจัดอาณาเขตแต่ละตึก/บ้าน (Fence Plot)
// =================================================================
function FencePlot({ width = 1.8, depth = 1.8, height = 0.35 }) {
  const halfW = width / 2;
  const halfD = depth / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* เสามุมรั้ว 4 มุม */}
      {[
        [-halfW, -halfD], [halfW, -halfD],
        [-halfW, halfD], [halfW, halfD]
      ].map(([px, pz], i) => (
        <mesh key={i} position={[px, height / 2, pz]} castShadow>
          <boxGeometry args={[0.08, height + 0.08, 0.08]} />
          <meshStandardMaterial color="#334155" roughness={0.4} />
        </mesh>
      ))}

      {/* รั้วด้านหลัง */}
      <mesh position={[0, height / 2, -halfD]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.04]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>

      {/* รั้วด้านซ้าย */}
      <mesh position={[-halfW, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, height, depth]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>

      {/* รั้วด้านขวา */}
      <mesh position={[halfW, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, height, depth]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.6} />
      </mesh>

      {/* ปากทางเข้ารั้วด้านหน้า (เปิดช่องตรงกลางไว้เข้าถนน) */}
      {[-halfW + 0.25, halfW - 0.25].map((xP, i) => (
        <mesh key={i} position={[xP, height / 2, halfD]} castShadow receiveShadow>
          <boxGeometry args={[0.4, height, 0.04]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// =================================================================
// 3. อาคารคลังสินค้าหลัก + หลังคาจั่วอุตสาหกรรมถูกต้อง
// =================================================================
function CentralWarehouse() {
  // สร้าง Geometry หลังคาจั่วสามเหลี่ยมชี้ขึ้นฟ้าอย่างถูกต้อง
  const roofShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.15, 0);      // มุมหลังซ้าย
    shape.lineTo(0, 0.7);        // สันหลังคาตรงกลาง (ชี้ขึ้นฟ้า)
    shape.lineTo(1.15, 0);       // มุมหน้าขวา
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = useMemo(() => ({
    depth: 3.1,
    bevelEnabled: false,
  }), []);

  return (
    <group position={[0, 0, 0]}>
      {/* ตัวอาคารคลังสินค้า */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 1.2, 2.1]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.4} />
      </mesh>

      {/* หลังคาจั่วโรงงาน (Gable Roof) ชี้ขึ้นฟ้าถูกต้อง */}
      <mesh
        position={[1.55, 1.2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry args={[roofShape, extrudeSettings]} />
        <meshStandardMaterial color="#334155" roughness={0.3} />
      </mesh>

      {/* ช่องระบายอากาศบนสันหลังคา */}
      <mesh position={[0, 1.95, 0]} castShadow>
        <boxGeometry args={[2.6, 0.1, 0.25]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* ประตูโหลดสินค้า 3 ช่อง (Loading Docks) ด้านหน้า */}
      {[-0.85, 0, 0.85].map((xPos, idx) => (
        <group key={idx} position={[xPos, 0.42, 1.06]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.68, 0.82, 0.04]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.01]} receiveShadow>
            <boxGeometry args={[0.6, 0.74, 0.03]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* แท่นโหลดสินค้าหน้าประตู */}
      <mesh position={[0, 0.05, 1.2]} receiveShadow castShadow>
        <boxGeometry args={[2.8, 0.1, 0.25]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
    </group>
  );
}

// =================================================================
// 4. ตึกออฟฟิศพร้อมรั้วกั้น (หน้าตึกหันเข้าถนน)
// =================================================================
function FencedOffice({ position }) {
  // คำนวณหมุนตึกให้หันหน้าเข้าหาจุดศูนย์กลางถนน [0,0,0] อัตโนมัติ
  const rotY = Math.atan2(-position[0], -position[2]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <FencePlot width={2.0} depth={2.0} height={0.4} />

      {/* ตัวตึกออฟฟิศ */}
      <mesh position={[0, 1.1, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 2.2, 1.3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* กระจกหน้าอาคาร (Glass Facade) หันเข้าหาถนน */}
      <mesh position={[0, 1.2, 0.56]} castShadow>
        <boxGeometry args={[1.05, 1.7, 0.02]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* ขอบดาดฟ้า */}
      <mesh position={[0, 2.22, -0.1]} castShadow>
        <boxGeometry args={[1.36, 0.06, 1.36]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* ซุ้มทางเข้าออฟฟิศ */}
      <mesh position={[0, 0.25, 0.6]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}

// =================================================================
// 5. บ้านพักอาศัยพร้อมรั้วกั้น (หันหน้าเข้าถนน)
// =================================================================
function FencedHouse({ position, roofColor = "#ef4444" }) {
  const rotY = Math.atan2(-position[0], -position[2]);

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <FencePlot width={1.6} depth={1.6} height={0.32} />

      {/* ตัวบ้าน */}
      <mesh position={[0, 0.35, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.7, 0.85]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>

      {/* ประตูบ้าน */}
      <mesh position={[0, 0.22, 0.38]}>
        <boxGeometry args={[0.22, 0.42, 0.02]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>

      {/* หลังคาบ้าน */}
      <mesh position={[0, 0.95, -0.05]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.75, 0.55, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.4} />
      </mesh>
    </group>
  );
}

// =================================================================
// 6. รถบรรทุกวิ่งวนตามเลนถนน
// =================================================================
function AnimatedTruck({ speed = 0.05, initialOffset = 0, color = "#ffffff" }) {
  const truckRef = useRef();
  const progress = useRef(initialOffset);

  useFrame((_, delta) => {
    progress.current = (progress.current + delta * speed) % 1;
    const { x, z, rotationY } = getRoadPoint(progress.current);
    if (truckRef.current) {
      truckRef.current.position.set(x, 0.18, z);
      truckRef.current.rotation.y = rotationY;
    }
  });

  return (
    <group ref={truckRef}>
      <mesh position={[0, 0.3, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.42, 0.65]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.23, 0.28]} castShadow receiveShadow>
        <boxGeometry args={[0.46, 0.34, 0.28]} />
        <meshStandardMaterial color="#1e293b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.28, 0.43]} castShadow>
        <boxGeometry args={[0.4, 0.16, 0.02]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} />
      </mesh>
      {[-0.25, 0.25].map((xSide) =>
        [-0.25, 0.25].map((zPos, idx) => (
          <mesh key={`${xSide}-${idx}`} position={[xSide, 0.08, zPos]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.05, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.8} />
          </mesh>
        ))
      )}
    </group>
  );
}

// =================================================================
// 7. ถนนวงกลม + ต้นไม้ + แท่นรองฉาก
// =================================================================
function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#10b981" roughness={0.6} />
      </mesh>
    </group>
  );
}

function RoadLoop() {
  const dashCount = 20;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <ringGeometry args={[2.4, 4.0, 64]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {Array.from({ length: dashCount }).map((_, i) => {
        const t = i / dashCount;
        const { x, z, rotationY } = getRoadPoint(t);
        return (
          <group key={i} position={[x, 0.02, z]} rotation={[0, rotationY, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.08, 0.26]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function FloatingPlatform() {
  return (
    <group position={[0, -0.2, 0]}>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[11.8, 0.1, 11.8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[11.8, 0.7, 11.8]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.7} />
      </mesh>
    </group>
  );
}

// =================================================================
// MAIN EXPORT COMPONENT
// =================================================================
export default function Warehouse3DCanvas() {
  return (
    <div className="w-full h-[360px] md:h-[530px] rounded-[2rem] shadow-2xl overflow-hidden bg-[#f1f5f9]">
      <Canvas
        shadows
        orthographic
        camera={{
          position: [10, 10, 10],
          zoom: 46,
          near: 0.1,
          far: 1000
        }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight
          position={[14, 20, 12]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={8}
          shadow-camera-bottom={-8}
        />

        <FloatingPlatform />
        <RoadLoop />
        <CentralWarehouse />

        {/* รถบรรทุกวิ่งวนตามถนน 2 คัน */}
        <AnimatedTruck speed={0.04} initialOffset={0.0} color="#ffffff" />
        <AnimatedTruck speed={0.04} initialOffset={0.5} color="#cbd5e1" />

        {/* ตึกออฟฟิศพร้อมรั้วกั้น (หันหน้าเข้าหาถนนเป๊ะ) */}
        <FencedOffice position={[-4.5, 0, -3.2]} />
        <FencedOffice position={[4.5, 0, -3.2]} />

        {/* บ้านพักอาศัยพร้อมรั้วกั้น (หันหน้าเข้าหาถนนเป๊ะ) */}
        <FencedHouse position={[-4.5, 0, 3.2]} roofColor="#ef4444" />
        <FencedHouse position={[4.5, 0, 3.2]} roofColor="#3b82f6" />
        <FencedHouse position={[0, 0, 4.8]} roofColor="#10b981" />

        {/* ต้นไม้จัดแต่งตามพื้นที่ว่างอย่างสวยงาม */}
        <Tree position={[-4.8, 0, -4.8]} scale={1.2} />
        <Tree position={[-3.3, 0, -4.8]} scale={0.9} />
        <Tree position={[4.8, 0, -4.8]} scale={1.1} />
        <Tree position={[3.3, 0, -4.8]} scale={0.9} />
        
        <Tree position={[-4.8, 0, 4.8]} scale={1.1} />
        <Tree position={[4.8, 0, 4.8]} scale={1.2} />
        <Tree position={[0, 0, -4.8]} scale={1.1} />

        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 6}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}