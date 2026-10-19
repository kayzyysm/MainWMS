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
    const newReceipt = new Receipt(req.body);
    const savedReceipt = await newReceipt.save();
    res.status(201).json(savedReceipt);
  } catch (err) {
    res.status(400).json({ message: 'Error saving receipt', error: err.message });
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