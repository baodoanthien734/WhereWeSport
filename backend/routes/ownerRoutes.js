const express = require('express');
const {
    getMyCenter,
    createMyCenter,
    getMyCourts,
    getBookings,
    addCourt,
    updateCourt,
    deleteCourt
} = require('../controllers/ownerController.js');

const { checkAuthAndRole } = require('../middleware/authMiddleware.js');

const router = express.Router();

// 1. GET /api/owner/my-center
router.get(
    '/my-center',
    checkAuthAndRole(['Court Owner']), // Yêu cầu xác thực VÀ có quyền 'Court Owner'
    getMyCenter
);

// 2. POST /api/owner/my-center
router.post(
    '/my-center',
    checkAuthAndRole(['Court Owner']), // Yêu cầu xác thực VÀ có quyền 'Court Owner'
    createMyCenter
);

// 3. GET /api/owner/courts (Lấy danh sách sân)
router.get(
    '/courts',
    checkAuthAndRole(['Court Owner']),
    getMyCourts
);

// 4. GET /api/owner/bookings (Lấy lịch đặt sân)
router.get(
    '/bookings',
    checkAuthAndRole(['Court Owner']),
    getBookings
);

// 5. POST /api/owner/courts (Thêm sân mới)
router.post(
    '/courts',
    checkAuthAndRole(['Court Owner']),
    addCourt
);

// 6. PUT /api/owner/courts/:id (Sửa sân)
router.put(
    '/courts/:id',
    checkAuthAndRole(['Court Owner']),
    updateCourt
);

// 7. DELETE /api/owner/courts/:id (Xóa sân)
router.delete(
    '/courts/:id',
    checkAuthAndRole(['Court Owner']),
    deleteCourt
);
module.exports = router;