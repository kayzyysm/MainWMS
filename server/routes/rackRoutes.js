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

// PUT /api/racks/:rackId/slot - อัปเดตสินค้าใน Slot (รองรับ Putaway / Pick)
router.put('/:rackId/slot', async (req, res) => {
  try {
    const { rackId } = req.params;
    const { slotKey, items } = req.body; // items คือ array ของ { itemId, name, qty }

    const rack = await Rack.findOne({ rackId });
    if (!rack) return res.status(404).json({ message: 'ไม่พบตู้ Rack' });

    // อัปเดต Slot ใน Map
    rack.slots.set(slotKey, { slotName: slotKey, items });
    await rack.save();

    res.json({ message: 'อัปเดตตำแหน่งจัดเก็บสำเร็จ', rack });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;