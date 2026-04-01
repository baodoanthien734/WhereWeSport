const { sql } = require('../config/db');

/**
 * @desc Lấy danh sách tất cả trung tâm đang hoạt động
 */
async function getAllActiveCenters() {
    try {
        // Chỉ lấy những trung tâm có is_active = 1
        const result = await sql.query`
            SELECT 
                center_id, 
                center_name, 
                address_text, 
                contact_phone, 
                image_url, 
                description
            FROM SportsCenters 
            WHERE is_active = 1
            ORDER BY created_at DESC
        `;
        return result.recordset;
    } catch (err) {
        console.error('Lỗi Model (getAllActiveCenters):', err.message);
        throw err;
    }
}

/**
 * @desc Lấy chi tiết một trung tâm theo ID 
 */
async function getCenterById(centerId) {
    try {
        const result = await sql.query`
            SELECT * FROM SportsCenters 
            WHERE center_id = ${centerId} AND is_active = 1
        `;
        return result.recordset[0];
    } catch (err) {
        console.error('Lỗi Model (getCenterById):', err.message);
        throw err;
    }
}

/**
 * @desc Lấy danh sách sân của một trung tâm (Public)
 */
async function getCourtsByCenterId(centerId) {
    try {
        const result = await sql.query`
            SELECT * FROM Courts 
            WHERE center_id = ${centerId} 
            AND status != 'Deleted' -- Chỉ lấy sân chưa xóa
        `;
        return result.recordset;
    } catch (err) {
        console.error('Lỗi Model (getCourtsByCenterId):', err.message);
        throw err;
    }
}

/**
 * @desc Lấy lịch đặt sân (Public)
 * Lưu ý: Có thể ẩn bớt thông tin nhạy cảm của khách hàng nếu muốn
 */
async function getPublicBookings(courtId, date) {
    try {
        const result = await sql.query`
            SELECT 
                b.start_time, 
                b.end_time, 
                b.status,
                b.booked_by_owner,
                u.username,
                b.customer_name_offline
            FROM Bookings b
            LEFT JOIN Users u ON b.user_id = u.user_id
            WHERE b.court_id = ${courtId}
            AND CAST(b.start_time AS DATE) = ${date}
            
            -- SỬA LỖI: Chỉ hiện lịch đã chốt
            AND b.status IN ('Confirmed', 'Approved_Unpaid')
        `;
        return result.recordset;
    } catch (err) {
        console.error('Lỗi Model (getPublicBookings):', err.message);
        throw err;
    }
}

module.exports = {
    getAllActiveCenters,
    getCenterById,
    getCourtsByCenterId,
    getPublicBookings
};