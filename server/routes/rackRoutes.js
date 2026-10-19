const express = require('express');
const router = express.Router();
const Rack = require('../models/Rack');

// GET /api/racks - ดึงข้อมูลโซนและตู้ Rack ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const racks = await Rack.find();
    res.json(racks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/racks - สร้าง Rack ใหม่
router.post('/', async (req, res) => {
  try {
    const { rackId, name, slots } = req.body;
    const newRack = new Rack({ rackId, name, slots });
    await newRack.save();
    res.status(201).json(newRack);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/racks/:rackId - อัปเดตข้อมูล Slots ของ Rack เมื่อมีการจัดเก็บสินค้า (Putaway)
router.put('/:rackId', async (req, res) => {
  try {
    const { rackId } = req.params;
    const { slots } = req.body; // รับค่า slots ทั้งก้อนที่ส่งมาจากหน้า PlannerTerminal

    const rack = await Rack.findOne({ rackId });
    if (!rack) {
      return res.status(404).json({ message: 'ไม่พบตู้ Rack' });
    }

    // วนลูปอัปเดตค่าลงใน Mongoose Map พร้อมเติม slotName อัตโนมัติ
    if (slots && typeof slots === 'object') {
      for (const [key, value] of Object.entries(slots)) {
        rack.slots.set(key, {
          slotName: key, // <--- เติมตรงนี้เพื่อให้ผ่าน Mongoose Schema Validation
          items: value.items || []
        });
      }
    }

    await rack.save();
    res.json({ message: 'อัปเดตตำแหน่งจัดเก็บสำเร็จ', rack });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;