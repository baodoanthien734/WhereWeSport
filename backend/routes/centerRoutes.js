const express = require('express');
const { 
    getCenters, 
    getCenterDetail,
    getCenterCourts,   
    getPublicBookings  
} = require('../controllers/centerController.js');

const router = express.Router();

// 1. GET /api/centers (List)
router.get('/', getCenters);

// 2. GET /api/centers/bookings (Public Calendar) <-- Đặt lên trên :id để tránh trùng
router.get('/bookings', getPublicBookings);

// 3. GET /api/centers/:id (Detail)
router.get('/:id', getCenterDetail);

// 4. GET /api/centers/:id/courts (List Courts of Center)
router.get('/:id/courts', getCenterCourts);

module.exports = router;