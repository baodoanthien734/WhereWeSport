const express = require('express');
const router = express.Router();

const { checkAuthAndRole } = require('../middleware/authMiddleware');

router.get(
    '/dashboard', 
    checkAuthAndRole(['Admin']), 
    (req, res) => {
        res.json({ 
            msg: `Chào mừng Admin ${req.user.username} đến với khu vực quản lý!`,
            userId: req.user.userId,
            roles: req.user.roles
        });
    }
);

router.get(
    '/shared-data',
    checkAuthAndRole(['Admin', 'Court Owner']), 
    (req, res) => {
        res.json({ msg: 'Đây là dữ liệu chung cho Admin và Chủ Sân' });
    }
);

module.exports = router;