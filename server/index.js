const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const rackRoutes = require('./routes/rackRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

// Middlewares - ปรับแต่ง CORS ให้ครอบคลุมทุก Request
app.use(cors({
  origin: '*', // หรือกำหนดเป็น 'http://localhost:5173' ตาม Port ของ Vite/React
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/racks', rackRoutes);
app.use('/api/documents', documentRoutes);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Test Route
app.get('/', (req, res) => {
  res.send('Warehouse Automation System API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});