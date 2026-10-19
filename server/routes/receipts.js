const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');

router.get('/', async (req, res) => {
  try {
    const receipts = await Receipt.find({}).sort({ createdAt: -1 });
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newReceipt = new Receipt(req.body);
    const saved = await newReceipt.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;