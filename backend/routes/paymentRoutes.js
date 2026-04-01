const express = require('express');
const paymentController = require('../controllers/paymentController');
const { checkAuthAndRole } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/payment/create_payment_url
router.post('/create_payment_url', checkAuthAndRole(['User', 'Court Owner']), paymentController.createPaymentUrl);
router.get('/vnpay_ipn', paymentController.vnpayIpn);
router.get('/vnpay_return', paymentController.vnpayReturn);

module.exports = router;