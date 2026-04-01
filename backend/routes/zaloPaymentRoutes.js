const express = require('express');
const { createZaloPaymentUrl, zaloCallback } = require('../controllers/zaloPaymentController');
const { checkAuthAndRole } = require('../middleware/authMiddleware');

const router = express.Router();

// 1. Tạo Link Thanh toán (Cần Login)
router.post('/create_payment_url', checkAuthAndRole(['User', 'Court Owner']), createZaloPaymentUrl);

// 2. Nhận Callback (Public - ZaloPay gọi vào)
router.post('/callback', zaloCallback); 

module.exports = router;