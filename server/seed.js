const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
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

const sampleRacks = [
  {
    rackId: 'ZONE-A1',
    name: 'Zone A1 Storage',
    slots: {
      'Slot 1': {
        slotName: 'Slot 1',
        items: [
          { itemId: 'mock-1', name: 'Logitech G Pro X Superlight', qty: 40 },
          { itemId: 'mock-2', name: 'Keyboard RGB Gaming', qty: 30 }
        ]
      },
      'Slot 2': {
        slotName: 'Slot 2',
        items: [
          { itemId: 'mock-2', name: 'Keyboard RGB Gaming', qty: 60 }
        ]
      },
      'Slot 5': {
        slotName: 'Slot 5',
        items: [
          { itemId: 'mock-3', name: 'USB Hub 7-Port Type-C', qty: 100 }
        ]
      },
      'Slot 8': {
        slotName: 'Slot 8',
        items: [
          { itemId: 'mock-4', name: 'RAM DDR5 32GB Kit', qty: 120 }
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
          { itemId: 'mock-5', name: 'Monitor ASUS TUF Gaming 27"', qty: 90 }
        ]
      },
      'Slot 3': {
        slotName: 'Slot 3',
        items: [
          { itemId: 'mock-6', name: 'Graphics Card RTX 4060', qty: 120 }
        ]
      },
      'Slot 4': {
        slotName: 'Slot 4',
        items: [
          { itemId: 'mock-6', name: 'Graphics Card RTX 4060', qty: 40 }
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
          { itemId: 'mock-7', name: 'Power Supply 850W', qty: 85 }
        ]
      },
      'Slot 6': {
        slotName: 'Slot 6',
        items: [
          { itemId: 'mock-8', name: 'SSD NVMe 2TB', qty: 120 }
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

    await Rack.deleteMany({});
    await Rack.insertMany(sampleRacks);
    console.log('📦 Racks seeded successfully!');

    process.exit();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();