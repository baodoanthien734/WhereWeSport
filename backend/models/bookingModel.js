const { sql } = require('../config/db');

async function getCourtPrice(courtId) {
    try {
        const result = await sql.query`
            SELECT price_per_hour FROM Courts WHERE court_id = ${courtId}
        `;
        return result.recordset[0]?.price_per_hour || 0;
    } catch (err) {
        console.error('Lỗi Model (getCourtPrice):', err.message);
        throw err;
    }
}

async function checkBookingOverlap(courtId, startTime, endTime) {
    try {
        const BUFFER_MINUTES = 30;
        const result = await sql.query`
            SELECT COUNT(*) as count
            FROM Bookings
            WHERE court_id = ${courtId}
            AND status IN ('Confirmed', 'Approved_Unpaid') 
            AND start_time < ${endTime}
            AND DATEADD(minute, ${BUFFER_MINUTES}, end_time) > ${startTime}
        `;
        return result.recordset[0].count > 0; 
    } catch (err) {
        console.error('Lỗi Model (checkBookingOverlap):', err.message);
        throw err;
    }
}

async function createBooking(bookingData) {
    const {
        court_id, user_id, booked_by_owner, customer_name_offline,
        start_time, end_time, total_price, status, paid_amount
    } = bookingData;

    try {
        const result = await sql.query`
            INSERT INTO Bookings 
            (court_id, user_id, booked_by_owner, customer_name_offline, start_time, end_time, total_price, status, paid_amount, created_at, updated_at)
            VALUES 
            (${court_id}, ${user_id}, ${booked_by_owner}, ${customer_name_offline}, ${start_time}, ${end_time}, ${total_price}, ${status}, ${paid_amount}, GETDATE(), GETDATE());

            SELECT * FROM Bookings WHERE booking_id = SCOPE_IDENTITY();
        `;
        return result.recordset[0];
    } catch (err) {
        console.error('Lỗi Model (createBooking):', err.message);
        throw err;
    }
}

async function getPendingBookingsByOwner(ownerId) {
    try {
        const result = await sql.query`
            SELECT 
                b.booking_id, b.start_time, b.end_time, b.total_price, b.created_at,
                c.court_name, u.username, up.full_name, up.phone_number
            FROM Bookings b
            JOIN Courts c ON b.court_id = c.court_id
            JOIN SportsCenters sc ON c.center_id = sc.center_id
            LEFT JOIN Users u ON b.user_id = u.user_id
            LEFT JOIN UserProfile up ON u.user_id = up.user_id
            WHERE sc.center_owner_id = ${ownerId}
            AND b.status = 'Pending'
            ORDER BY b.created_at DESC
        `;
        return result.recordset;
    } catch (err) {
        console.error('Lỗi Model (getPendingBookingsByOwner):', err.message);
        throw err;
    }
}

async function getBookingById(bookingId) {
    try {
        const result = await sql.query`
            SELECT * FROM Bookings WHERE booking_id = ${bookingId}
        `;
        return result.recordset[0];
    } catch (err) {
        console.error('Lỗi Model (getBookingById):', err.message);
        throw err;
    }
}

async function updateBookingStatus(bookingId, newStatus) {
    try {
        await sql.query`
            UPDATE Bookings 
            SET status = ${newStatus}, updated_at = GETDATE()
            WHERE booking_id = ${bookingId}
        `;
        return true;
    } catch (err) {
        console.error('Lỗi Model (updateBookingStatus):', err.message);
        throw err;
    }
}

async function approveBookingWithTimestamp(bookingId) {
    try {
        await sql.query`
            UPDATE Bookings 
            SET status = 'Approved_Unpaid', 
                approved_at = GETDATE(), 
                updated_at = GETDATE()
            WHERE booking_id = ${bookingId}
        `;
        return true;
    } catch (err) {
        console.error('Lỗi Model (approveBookingWithTimestamp):', err.message);
        throw err;
    }
}

async function cancelBooking(bookingId, reason) {
    try {
        await sql.query`
            UPDATE Bookings 
            SET status = 'Cancelled', 
                cancellation_reason = ${reason}, 
                updated_at = GETDATE()
            WHERE booking_id = ${bookingId}
        `;
        return true;
    } catch (err) {
        console.error('Lỗi Model (cancelBooking):', err.message);
        throw err;
    }
}

async function scanAndCancelExpiredBookings() {
    try {
        const result = await sql.query`
            UPDATE Bookings
            SET status = 'Cancelled',
                cancellation_reason = N'Hết hạn thanh toán (Quá 15 phút)',
                updated_at = GETDATE()
            OUTPUT inserted.booking_id, inserted.user_id
            WHERE status = 'Approved_Unpaid'
            AND approved_at IS NOT NULL
            AND DATEDIFF(minute, approved_at, GETDATE()) >= 15
        `;
        return result.recordset; 
    } catch (err) {
        console.error('Lỗi Cron Job Model:', err.message);
        return [];
    }
}

async function getBookingsByUserId(userId) {
    try {
        const result = await sql.query`
            SELECT 
                b.booking_id, b.start_time, b.end_time, b.total_price, b.status, b.created_at,
                b.approved_at, -- Lấy thêm approved_at để frontend đếm ngược
                b.cancellation_reason, -- Lấy lý do hủy
                c.court_name, sc.center_name, sc.address_text
            FROM Bookings b
            JOIN Courts c ON b.court_id = c.court_id
            JOIN SportsCenters sc ON c.center_id = sc.center_id
            WHERE b.user_id = ${userId}
            ORDER BY b.created_at DESC
        `;
        return result.recordset;
    } catch (err) {
        console.error('Lỗi Model (getBookingsByUserId):', err.message);
        throw err;
    }
}

module.exports = {
    getCourtPrice,
    checkBookingOverlap,
    createBooking,
    getPendingBookingsByOwner,
    getBookingById,
    updateBookingStatus,
    getBookingsByUserId,
    approveBookingWithTimestamp,
    cancelBooking,
    scanAndCancelExpiredBookings
};