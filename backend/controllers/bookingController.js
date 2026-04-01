const bookingModel = require('../models/bookingModel');
const ownerModel = require('../models/ownerModel'); 

/**
 * @desc   Tạo booking mới (Logic tính toán Server-side)
 * @route  POST /api/bookings
 */
const createBooking = async (req, res) => {
    try {
        const {
            court_id,
            start_time, 
            duration,   
            customer_name_offline,
            payment_amount 
        } = req.body;

        const userId = req.user.userId;
        const userRoles = req.user.roles || [];
        // Chỉ được coi là Owner khi:
        // 1. Có role 'Court Owner'
        // 2. VÀ là chủ sở hữu của chính cái sân này
        const hasOwnerRole = userRoles.includes('Court Owner');
        let isTrueOwner = false;

        if (hasOwnerRole) {
            isTrueOwner = await ownerModel.checkCourtOwnership(userId, court_id);
        }

        // 1. Tính toán Thời gian 
        const startDate = new Date(start_time);
        const durationMs = duration * 60 * 60 * 1000;
        const endDate = new Date(startDate.getTime() + durationMs);

        // 2. Lấy giá sân từ DB để tính tiền
        const pricePerHour = await bookingModel.getCourtPrice(court_id);
        
        // Tính tổng tiền: Giá/giờ * Số giờ (Giữ nguyên số lẻ 1.5)
        const totalPrice = pricePerHour * duration;

        // Thiết lập trạng thái dựa trên isTrueOwner 
        let status = 'Pending';
        let bookedByOwner = 0;
        let finalUserId = userId;

        if (isTrueOwner) {
            status = 'Confirmed'; // Chủ sân -> Duyệt luôn
            bookedByOwner = 1;
            finalUserId = null;
        } else {
            status = 'Pending';   // Khách (kể cả chủ sân khác) -> Chờ duyệt
            bookedByOwner = 0;
        }

        // 4. Kiểm tra trùng lịch (Có buffer 30p)
        const isOverlap = await bookingModel.checkBookingOverlap(court_id, startDate, endDate);
        if (isOverlap) {
            return res.status(409).json({ 
                msg: 'Khung giờ này đã có người đặt thành công. Vui lòng chọn giờ khác.' 
            });
        }

        // 5. Tạo Booking
        const newBooking = await bookingModel.createBooking({
            court_id,
            user_id: finalUserId,
            booked_by_owner: bookedByOwner,
            customer_name_offline: isTrueOwner ? customer_name_offline : null,
            start_time: startDate,
            end_time: endDate,
            total_price: totalPrice,
            status: status,
            paid_amount: payment_amount || 0
        });

        res.status(201).json({ 
            msg: isTrueOwner ? 'Đặt sân thành công!' : 'Gửi yêu cầu thành công! Vui lòng chờ duyệt.', 
            booking: newBooking 
        });

    } catch (err) {
        console.error('Lỗi Controller (createBooking):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

/**
 * @desc   Lấy danh sách yêu cầu chờ duyệt (Chỉ Owner)
 * @route  GET /api/bookings/pending
 */
const getPendingBookings = async (req, res) => {
    const ownerId = req.user.userId;
    try {
        const bookings = await bookingModel.getPendingBookingsByOwner(ownerId);
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Lỗi Controller (getPendingBookings):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

/**
 * @desc   Duyệt yêu cầu (Pending -> Approved_Unpaid)
 * @route  POST /api/bookings/:id/approve
 */
const approveBooking = async (req, res) => {
    const bookingId = req.params.id;
    try {
        // 1. Lấy thông tin booking hiện tại để biết giờ và sân
        const currentBooking = await bookingModel.getBookingById(bookingId);
        
        if (!currentBooking) {
            return res.status(404).json({ msg: 'Không tìm thấy booking.' });
        }

        if (currentBooking.status !== 'Pending') {
            return res.status(400).json({ msg: 'Chỉ có thể duyệt các yêu cầu đang chờ.' });
        }

        // 2. KIỂM TRA LẠI: Giờ này đã bị ai "Chốt" (Confirmed/Approved) chưa?
        const isOverlap = await bookingModel.checkBookingOverlap(
            currentBooking.court_id, 
            currentBooking.start_time, 
            currentBooking.end_time
        );

        if (isOverlap) {
            // Nếu đã bị trùng -> Tự động Từ chối
            await bookingModel.updateBookingStatus(bookingId, 'Rejected');
            return res.status(409).json({ 
                msg: 'Rất tiếc, khung giờ này đã có người khác đặt thành công. Yêu cầu này đã bị chuyển sang Từ chối.',
                status: 'Rejected' 
            });
        }

        // 3. Nếu còn trống -> Duyệt thành công
        await bookingModel.approveBookingWithTimestamp(bookingId);
        
        res.status(200).json({ 
            msg: 'Đã duyệt yêu cầu. Khách có 15 phút để thanh toán.',
            status: 'Approved_Unpaid'
        });

    } catch (err) {
        console.error('Lỗi Controller (approveBooking):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

/**
 * @desc   Từ chối yêu cầu (Pending -> Rejected)
 * @route  POST /api/bookings/:id/reject
 */
const rejectBooking = async (req, res) => {
    const bookingId = req.params.id;
    try {
        await bookingModel.updateBookingStatus(bookingId, 'Rejected');
        res.status(200).json({ msg: 'Đã từ chối yêu cầu.' });
    } catch (err) {
        console.error('Lỗi Controller (rejectBooking):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

/**
 * @desc   Thanh toán (Approved_Unpaid -> Confirmed)
 * @route  POST /api/bookings/:id/pay
 */
const payBooking = async (req, res) => {
    const bookingId = req.params.id;
    try {
        // 1. Kiểm tra trạng thái hiện tại
        const booking = await bookingModel.getBookingById(bookingId);
        if (!booking) return res.status(404).json({ msg: 'Không tìm thấy booking.' });

        if (booking.status !== 'Approved_Unpaid') {
            return res.status(400).json({ msg: 'Booking này không ở trạng thái chờ thanh toán.' });
        }

        // 2. Cập nhật thành Confirmed (Hiện lên lịch)
        await bookingModel.updateBookingStatus(bookingId, 'Confirmed');
        
        res.status(200).json({ msg: 'Thanh toán thành công! Lịch đã được xác nhận.' });
    } catch (err) {
        console.error('Lỗi Controller (payBooking):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

/**
 * @desc   Lấy lịch sử đặt sân của tôi (User)
 * @route  GET /api/bookings/mine
 */
const getMyBookings = async (req, res) => {
    const userId = req.user.userId; // Lấy từ token
    try {
        const bookings = await bookingModel.getBookingsByUserId(userId);
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Lỗi Controller (getMyBookings):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

const cancelBookingByUser = async (req, res) => {
    const bookingId = req.params.id;
    const userId = req.user.userId; 

    try {
        const booking = await bookingModel.getBookingById(bookingId);
        if (!booking) return res.status(404).json({ msg: 'Không tìm thấy booking.' });

        // 1. Check quyền: Phải là chủ đơn
        if (booking.user_id !== userId) {
            return res.status(403).json({ msg: 'Bạn không có quyền hủy đơn này.' });
        }

        // 2. Check trạng thái: Chỉ được hủy khi chưa thanh toán xong
        if (!['Pending', 'Approved_Unpaid'].includes(booking.status)) {
            return res.status(400).json({ msg: 'Không thể hủy đơn hàng đã hoàn thành hoặc đã hủy.' });
        }

        // 3. Thực hiện hủy
        await bookingModel.cancelBooking(bookingId, 'Người dùng tự hủy');

        res.status(200).json({ msg: 'Đã hủy đơn đặt sân thành công.', status: 'Cancelled' });

    } catch (err) {
        console.error('Lỗi Controller (cancelBookingByUser):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

module.exports = {
    createBooking,
    getPendingBookings,
    approveBooking,
    rejectBooking,
    payBooking,
    getMyBookings,
    cancelBookingByUser
};