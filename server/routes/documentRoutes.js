const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// GET /api/documents?type=inbound (หรือ type=outbound&status=approved)
router.get('/', async (req, res) => {
  try {
    const { type, status } = req.query;
    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const documents = await Document.find(query).sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/documents - สร้างเอกสารใหม่ (Vendor/Reception ออก Inbound หรือ POS ออก Outbound)
router.post('/', async (req, res) => {
  try {
    const { code, type, companyOrCustomer, items, createdBy } = req.body;
    const newDoc = new Document({
      code,
      type,
      companyOrCustomer,
      items,
      createdBy,
      status: 'pending'
    });
    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/documents/:id/status - อัปเดตสถานะ (เช่น Planner กด อนุมัติ 'approved' หรือ Staff ทำสำเร็จ 'completed')
router.put('/:id/status', async (req, res) => {
  try {
    const { status, items } = req.body;
    const updateData = { status };
    if (items) updateData.items = items; // อัปเดตพร้อมตำแหน่ง Target Location ที่ Planner วางแผน

    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;