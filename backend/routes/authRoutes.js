const express = require('express');
const router = express.Router();

const { 
    login, 
    register, 
    requestOtp, 
    verifyOtp
} = require('../controllers/authController.js');

const { checkAuthAndRole } = require('../middleware/authMiddleware.js');


router.post('/login', login);
router.post('/register', register);
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);

module.exports = router;