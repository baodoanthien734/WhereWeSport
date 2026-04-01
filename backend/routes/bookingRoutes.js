const express = require('express');
const { 
    createBooking,
    getPendingBookings, 
    approveBooking,     
    rejectBooking,      
    payBooking,
    getMyBookings,
    cancelBookingByUser          
} = require('../controllers/bookingController.js');

const { checkAuthAndRole } = require('../middleware/authMiddleware.js');

const router = express.Router();

// 1. Tạo Booking (User & Owner)
router.post('/', checkAuthAndRole(['User', 'Court Owner']), createBooking);

// 2. Lấy danh sách Pending (Chỉ Owner)
router.get('/pending', checkAuthAndRole(['Court Owner']), getPendingBookings);

// 3. Duyệt Booking (Chỉ Owner)
router.post('/:id/approve', checkAuthAndRole(['Court Owner']), approveBooking);

// 4. Từ chối Booking (Chỉ Owner)
router.post('/:id/reject', checkAuthAndRole(['Court Owner']), rejectBooking);

// 5. Thanh toán Booking (Chỉ User - hoặc cả 2 nếu muốn test dễ)
// Logic: User bấm nút thanh toán
router.post('/:id/pay', checkAuthAndRole(['User', 'Court Owner']), payBooking);

// 6. Lấy lịch sử của tôi (User)
router.get('/mine', checkAuthAndRole(['User', 'Court Owner']), getMyBookings);

// 7. Hủy booking bởi User
router.put('/:id/cancel', checkAuthAndRole(['User', 'Court Owner']), cancelBookingByUser);

module.exports = router;