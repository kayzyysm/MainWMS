const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  }, // เช่น 'PRD-001' (SKU อ้างอิง)
  name: {
    type: String,
    required: true
  }, // ชื่อสินค้า เช่น 'Mechanical Keyboard RGB (Blue Switch)'
  category: {
    type: String,
    default: 'General'
  }, // หมวดหมู่สินค้า เช่น 'Peripherals', 'Audio', 'Storage'
  weight: {
    type: Number,
    required: true,
    default: 0.5
  }, // น้ำหนักต่อหน่วย (KG)
  price: {
    type: Number,
    default: 0
  } // ราคาสินค้า (เผื่อใช้ต่อยอดในอนาคต)
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);