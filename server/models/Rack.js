const mongoose = require('mongoose');

const SubItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 }
});

const SlotSchema = new mongoose.Schema({
  slotName: { type: String, required: true },
  items: [SubItemSchema] // รองรับสูงสุด 4 ชนิดต่อ Slot
});

const RackSchema = new mongoose.Schema({
  rackId: { type: String, required: true, unique: true }, // เช่น 'ZONE-A1'
  name: { type: String, required: true },
  slots: {
    type: Map,
    of: SlotSchema,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Rack', RackSchema);