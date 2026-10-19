const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // ทำความสะอาดข้อความ ป้องกันปัญหาช่องว่างหรือตัวพิมพ์ใหญ่-เล็ก
    const cleanUsername = username ? username.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';

    const user = await User.findOne({ username: cleanUsername });
    
    if (!user || user.password !== cleanPassword) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
    
    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/register (หรือสร้าง User ใหม่)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const cleanUsername = username ? username.trim().toLowerCase() : '';

    const existing = await User.findOne({ username: cleanUsername });
    if (existing) return res.status(400).json({ message: 'มีชื่อผู้ใช้นี้อยู่แล้ว' });

    const newUser = new User({ username: cleanUsername, password, role });
    await newUser.save();
    res.status(201).json({ message: 'สร้างบัญชีผู้ใช้เรียบร้อย', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;