const mongoose = require('mongoose');

const ItemDetailSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sku: { type: String },
  qty: { type: Number, required: true },
  weight: { type: String },
  targetLocation: { type: String }
});

const DocumentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // เช่น 'WH-INV-342321' หรือ 'WH-OUT-982131'
  type: { type: String, required: true, enum: ['inbound', 'outbound'] },
  companyOrCustomer: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'approved', 'completed'], 
    default: 'pending' 
  },
  items: [ItemDetailSchema],
  createdBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Document', DocumentSchema);