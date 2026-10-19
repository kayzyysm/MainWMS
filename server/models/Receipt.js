const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptId: { type: String, required: true }, // เช่น 'RECEIPT 1'
  docNo: { type: String, required: true, unique: true }, // เช่น 'WH-INV-761561'
  date: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed'], default: 'Pending' },
  items: [
    {
      id: { type: String, required: true }, // SKU เช่น 'PRD-001'
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      weight: { type: Number, required: true },
      totalWeight: { type: String, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Receipt', receiptSchema);