const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');

router.get('/', async (req, res) => {
  try {
    // กรองเอาเฉพาะ status: 'Pending'
    const receipts = await Receipt.find({ status: 'Pending' }).sort({ createdAt: -1 });
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

// PATCH /api/receipts/:id/status -> อัปเดตสถานะใบเสร็จ (เช่น เป็น 'Confirmed')
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