const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');

// GET /api/receipts -> ดึงรายการใบเสร็จทั้งหมด (เอาเงื่อนไข status ออก เพื่อให้ Planner เอาไปกรองต่อได้)
router.get('/', async (req, res) => {
    try {
        const receipts = await Receipt.find({}).sort({ createdAt: -1 });
        res.json(receipts);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching receipts', error: err.message });
    }
});

// POST /api/receipts -> บันทึกใบเสร็จใหม่จาก Vendor
router.post('/', async (req, res) => {
  try {
    // 🔍 ให้แก้ไข/เพิ่มการแมปข้อมูล items ตรงนี้ก่อนนำไปบันทึก
    const processedItems = (req.body.items || []).map(item => ({
      ...item,
      targetLocation: item.targetLocation || 'ZONE-A1 (Slot 1)' // กำหนดค่าเริ่มต้นจองไว้ก่อน
    }));

    // สร้างเอกสารใหม่โดยใช้ items ที่ผ่านการแมปแล้ว
    const newReceipt = new Receipt({
      ...req.body,
      items: processedItems
    });

    const savedReceipt = await newReceipt.save();
    res.status(201).json(savedReceipt);
  } catch (err) {
    res.status(400).json({ message: 'Error saving receipt', error: err.message });
  }
});

// PUT /api/receipts/:id -> อัปเดตข้อมูลรายการสินค้าและ targetLocation (จาก Planner)
router.put('/:id', async (req, res) => {
  try {
    const { items } = req.body;
    
    // ค้นหาใบเสร็จเดิมก่อน
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // อัปเดต items ให้มีข้อมูล targetLocation ครบถ้วนตามที่ส่งมาจากหน้าบ้าน
    receipt.items = items;
    const updatedReceipt = await receipt.save();

    res.json(updatedReceipt);
  } catch (err) {
    res.status(500).json({ message: 'Error updating receipt items', error: err.message });
  }
});

// PATCH /api/receipts/:id/status -> อัปเดตสถานะใบเสร็จ (เช่น เป็น 'Confirmed' หรือ 'Stored')
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedReceipt = await Receipt.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedReceipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }
        res.json(updatedReceipt);
    } catch (err) {
        res.status(500).json({ message: 'Error updating receipt status', error: err.message });
    }
});

module.exports = router;