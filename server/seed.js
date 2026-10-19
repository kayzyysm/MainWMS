const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');
const Rack = require('./models/Rack');

const sampleUsers = [
  { username: 'admin', password: '123', role: 'admin' },
  { username: 'staff', password: '123', role: 'staff' },
  { username: 'staffout', password: '123', role: 'staffout' },
  { username: 'reception', password: '123', role: 'reception' },
  { username: 'vendor', password: '123', role: 'vendor' },
  { username: 'planner', password: '123', role: 'planner' },
  { username: 'plannerout', password: '123', role: 'plannerout' },
  { username: 'user', password: '123', role: 'user' },
];

const centralProducts = [
  { id: 'PRD-001', name: 'Keyboard RGB', category: 'Peripherals', weight: 0.8, price: 1590 },
  { id: 'PRD-002', name: 'Laptop Stand', category: 'Accessories', weight: 1.2, price: 690 },
  { id: 'PRD-003', name: 'Webcam 1080p', category: 'Streaming', weight: 0.3, price: 1150 },
  { id: 'PRD-004', name: 'Mouse Pad XL', category: 'Peripherals', weight: 0.5, price: 450 },
  { id: 'PRD-005', name: 'Mouse Wireless', category: 'Peripherals', weight: 0.2, price: 1290 },
  { id: 'PRD-006', name: 'Mechanical Keyboard 65% (Red Switch)', category: 'Peripherals', weight: 0.7, price: 1790 },
  { id: 'PRD-007', name: 'Ultralight Honeycomb Gaming Mouse', category: 'Peripherals', weight: 0.15, price: 990 },
  { id: 'PRD-008', name: 'Numeric Keypad Mechanical Wireless', category: 'Peripherals', weight: 0.3, price: 650 },
  { id: 'PRD-009', name: 'Glass Gaming Mouse Pad', category: 'Peripherals', weight: 0.8, price: 1250 },
  { id: 'PRD-010', name: 'Wrist Rest Pad Memory Foam for Keyboard', category: 'Peripherals', weight: 0.35, price: 350 },
  { id: 'PRD-011', name: 'Condenser USB Microphone', category: 'Streaming', weight: 0.75, price: 1890 },
  { id: 'PRD-012', name: 'Wireless Over-Ear Gaming Headset', category: 'Audio', weight: 0.40, price: 2590 },
  { id: 'PRD-013', name: 'In-Ear Monitor (IEM) Hi-Fi Earphones', category: 'Audio', weight: 0.10, price: 790 },
  { id: 'PRD-014', name: 'Desktop Bluetooth Soundbar', category: 'Audio', weight: 1.20, price: 1490 },
  { id: 'PRD-015', name: 'Capture Card 4K@60Hz HDMI to USB 3.0', category: 'Streaming', weight: 0.20, price: 2200 },
  { id: 'PRD-016', name: 'Studio Microphone Arm Stand', category: 'Streaming', weight: 1.10, price: 590 },
  { id: 'PRD-017', name: 'Active Noise Canceling TWS Earbuds', category: 'Audio', weight: 0.12, price: 1690 },
  { id: 'PRD-018', name: 'Headphone Stand Aluminum Holder', category: 'Audio', weight: 0.40, price: 420 },
  { id: 'PRD-019', name: 'Pop Filter for Studio Microphone', category: 'Streaming', weight: 0.15, price: 220 },
  { id: 'PRD-020', name: 'Aluminum Laptop Stand (Foldable)', category: 'Accessories', weight: 0.65, price: 690 },
  { id: 'PRD-021', name: 'Dual Monitor Arm Desk Mount', category: 'Workstation', weight: 3.50, price: 1850 },
  { id: 'PRD-022', name: 'Vertical Laptop Stand Dual Slot', category: 'Accessories', weight: 0.80, price: 550 },
  { id: 'PRD-023', name: 'RGB Headphone Stand with USB Hub', category: 'Accessories', weight: 0.45, price: 750 },
  { id: 'PRD-024', name: 'Ergonomic Memory Foam Footrest', category: 'Workstation', weight: 1.10, price: 890 },
  { id: 'PRD-025', name: 'Single Monitor Arm Gas Spring', category: 'Workstation', weight: 2.80, price: 1390 },
  { id: 'PRD-026', name: 'Laptop Cooling Pad with 6 Fans', category: 'Accessories', weight: 0.90, price: 790 },
  { id: 'PRD-027', name: 'Desk Organizer Drawer Under Table', category: 'Workstation', weight: 0.50, price: 390 },
  { id: 'PRD-028', name: 'Tablet Stand Aluminum Adjustable', category: 'Accessories', weight: 0.45, price: 490 },
  { id: 'PRD-029', name: 'Anti-Fatigue Standing Desk Mat', category: 'Workstation', weight: 1.80, price: 1290 },
  { id: 'PRD-030', name: 'External SSD 1TB Portable USB-C', category: 'Storage', weight: 0.08, price: 3290 },
  { id: 'PRD-031', name: 'External Hard Drive 2TB', category: 'Storage', weight: 0.22, price: 2100 },
  { id: 'PRD-032', name: 'Wi-Fi 6 Router Dual-Band Gigabit', category: 'Networking', weight: 0.95, price: 2790 },
  { id: 'PRD-033', name: '5-Port Gigabit Desktop Switch', category: 'Networking', weight: 0.35, price: 590 },
  { id: 'PRD-034', name: 'USB-C Multiport Hub 7-in-1 Adapter', category: 'Accessories', weight: 0.12, price: 950 },
  { id: 'PRD-035', name: 'M.2 NVMe SSD Enclosure USB 3.2', category: 'Storage', weight: 0.10, price: 550 },
  { id: 'PRD-036', name: 'USB 3.2 Flash Drive 256GB', category: 'Storage', weight: 0.03, price: 690 },
  { id: 'PRD-037', name: 'Network Cable CAT6 LAN 10M', category: 'Networking', weight: 0.25, price: 250 },
  { id: 'PRD-038', name: 'Wi-Fi USB Adapter AC1300', category: 'Networking', weight: 0.05, price: 490 },
  { id: 'PRD-039', name: 'USB-C to Ethernet Adapter Gigabit', category: 'Networking', weight: 0.06, price: 390 },
  { id: 'PRD-040', name: 'GaN Charger 65W Fast Charging', category: 'Power', weight: 0.15, price: 990 },
  { id: 'PRD-041', name: 'Power Strip Surge Protector 4 Sockets', category: 'Power', weight: 0.70, price: 490 },
  { id: 'PRD-042', name: 'Logitech G Pro X Superlight', category: 'Peripherals', weight: 0.15, price: 4990 },
  { id: 'PRD-043', name: 'Keyboard RGB Gaming', category: 'Peripherals', weight: 0.80, price: 2590 },
  { id: 'PRD-044', name: 'USB Hub 7-Port Type-C', category: 'Accessories', weight: 0.20, price: 890 },
  { id: 'PRD-045', name: 'RAM DDR5 32GB Kit', category: 'Components', weight: 0.10, price: 4200 },
  { id: 'PRD-046', name: 'Monitor ASUS TUF Gaming 27"', category: 'Monitors', weight: 5.50, price: 7900 },
  { id: 'PRD-047', name: 'Graphics Card RTX 4060', category: 'Components', weight: 1.10, price: 11500 },
  { id: 'PRD-048', name: 'Power Supply 850W', category: 'Components', weight: 2.20, price: 3890 },
  { id: 'PRD-049', name: 'SSD NVMe 2TB', category: 'Storage', weight: 0.08, price: 4500 }
];

const sampleRacks = [
  {
    rackId: 'ZONE-A1',
    name: 'Zone A1 Storage',
    slots: {
      'Slot 1': {
        slotName: 'Slot 1',
        items: [
          { itemId: 'PRD-042', name: 'Logitech G Pro X Superlight', qty: 40 },
          { itemId: 'PRD-043', name: 'Keyboard RGB Gaming', qty: 30 }
        ]
      },
      'Slot 2': {
        slotName: 'Slot 2',
        items: [
          { itemId: 'PRD-043', name: 'Keyboard RGB Gaming', qty: 60 }
        ]
      },
      'Slot 5': {
        slotName: 'Slot 5',
        items: [
          { itemId: 'PRD-044', name: 'USB Hub 7-Port Type-C', qty: 100 }
        ]
      },
      'Slot 8': {
        slotName: 'Slot 8',
        items: [
          { itemId: 'PRD-045', name: 'RAM DDR5 32GB Kit', qty: 120 }
        ]
      }
    }
  },
  {
    rackId: 'ZONE-A2',
    name: 'Zone A2 Storage',
    slots: {
      'Slot 1': {
        slotName: 'Slot 1',
        items: [
          { itemId: 'PRD-046', name: 'Monitor ASUS TUF Gaming 27"', qty: 90 }
        ]
      },
      'Slot 3': {
        slotName: 'Slot 3',
        items: [
          { itemId: 'PRD-047', name: 'Graphics Card RTX 4060', qty: 120 }
        ]
      },
      'Slot 4': {
        slotName: 'Slot 4',
        items: [
          { itemId: 'PRD-047', name: 'Graphics Card RTX 4060', qty: 40 }
        ]
      }
    }
  },
  {
    rackId: 'ZONE-B1',
    name: 'Zone B1 Storage',
    slots: {
      'Slot 2': {
        slotName: 'Slot 2',
        items: [
          { itemId: 'PRD-048', name: 'Power Supply 850W', qty: 85 }
        ]
      },
      'Slot 6': {
        slotName: 'Slot 6',
        items: [
          { itemId: 'PRD-049', name: 'SSD NVMe 2TB', qty: 120 }
        ]
      }
    }
  },
  {
    rackId: 'ZONE-B2',
    name: 'Zone B2 Storage',
    slots: {}
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB for Seeding...');

    await User.deleteMany({});
    await User.insertMany(sampleUsers);
    console.log('👤 Users seeded successfully!');

    await Product.deleteMany({});
    await Product.insertMany(centralProducts);
    console.log('📦 Products (Master) seeded successfully!');

    await Rack.deleteMany({});
    await Rack.insertMany(sampleRacks);
    console.log('🗄️ Racks seeded successfully!');

    process.exit();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();