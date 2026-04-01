const { sql } = require('../config/db');

/**
 * @desc Tìm một SportsCenter bằng center_owner_id (user_id)
 * @param {number} ownerId - ID của người dùng (chủ sân)
 */
async function findCenterByOwnerId(ownerId) {
    try {
        const result = await sql.query`
            SELECT * FROM SportsCenters 
            WHERE center_owner_id = ${ownerId}
        `;
        return result.recordset[0];
    } catch (err) {
        console.error('Lỗi Model (findCenterByOwnerId):', err.message);
        throw err; 
    }
}

/**
 * @desc Tạo một SportsCenter mới trong database
 * @param {number} ownerId - ID của chủ sân
 * @param {object} centerData - Dữ liệu từ req.body
 */
async function createCenter(ownerId, centerData) {
    const { 
        center_name, 
        contact_phone, 
        description,
        image_url,
        address_text,
        latitude,
        longitude 
    } = centerData;

    try {
        const result = await sql.query`
            INSERT INTO SportsCenters 
                (center_owner_id, center_name, contact_phone, description, image_url, address_text, latitude, longitude, is_active, created_at, updated_at)
            VALUES 
                (${ownerId}, ${center_name}, ${contact_phone}, ${description}, ${image_url}, ${address_text}, ${latitude}, ${longitude}, 1, GETDATE(), GETDATE());
            
            SELECT * FROM SportsCenters WHERE center_id = SCOPE_IDENTITY();
        `;
        
        return result.recordset[0]; // Trả về trung tâm vừa tạo
    } catch (err) {
        console.error('Lỗi Model (createCenter):', err.message);
        throw err;
    }
}

async function getCourtsByOwnerId(ownerId) {
    try {
        const result = await sql.query`
            SELECT C.* FROM Courts C
            JOIN SportsCenters S ON C.center_id = S.center_id
            WHERE S.center_owner_id = ${ownerId}
            AND C.status != 'Deleted' 
        `;
        return result.recordset;
    } catch (err) {
        console.error('Lỗi Model (getCourtsByOwnerId):', err.message);
        throw err;
    }
}

async function getBookingsByDate(courtId, date) {
    try {
        const result = await sql.query`
            SELECT 
                b.*,
                u.username,
                u.email,
                up.full_name,
                up.phone_number
            FROM Bookings b
            LEFT JOIN Users u ON b.user_id = u.user_id
            LEFT JOIN UserProfile up ON u.user_id = up.user_id
            WHERE b.court_id = ${courtId}
            AND CAST(b.start_time AS DATE) = ${date}
            
            -- SỬA LỖI: Chỉ lấy lịch ĐÃ CHỐT (Confirmed hoặc Approved_Unpaid)
            -- Ẩn luôn Pending, Rejected, Cancelled khỏi lịch
            AND b.status IN ('Confirmed', 'Approved_Unpaid')
            
            ORDER BY b.start_time ASC
        `;
        return result.recordset;
    } catch (err) {
        console.error('Lỗi Model (getBookingsByDate):', err.message);
        throw err;
    }
}

async function createCourt(centerId, courtData) {
    const { court_name, court_type, price_per_hour } = courtData;

    try {
        const result = await sql.query`
            INSERT INTO Courts 
                (center_id, court_name, court_type, price_per_hour, status, created_at, updated_at)
            VALUES 
                (${centerId}, ${court_name}, ${court_type}, ${price_per_hour}, 'Active', GETDATE(), GETDATE());
            
            SELECT * FROM Courts WHERE court_id = SCOPE_IDENTITY();
        `;
        return result.recordset[0];
    } catch (err) {
        console.error('Lỗi Model (createCourt):', err.message);
        throw err;
    }
}

async function updateCourt(courtId, courtData) {
    const { court_name, court_type, price_per_hour, status } = courtData;
    
    // Nếu status không được gửi lên, mặc định giữ nguyên (hoặc Active)
    // Lưu ý: Frontend của chúng ta luôn gửi status ("Active" hoặc "Maintenance")
    const newStatus = status || 'Active';

    try {
        await sql.query`
            UPDATE Courts
            SET 
                court_name = ${court_name},
                court_type = ${court_type},
                price_per_hour = ${price_per_hour},
                status = ${newStatus}, -- <<< BỔ SUNG DÒNG NÀY
                updated_at = GETDATE()
            WHERE court_id = ${courtId}
        `;
        
        // Trả về sân vừa update
        const result = await sql.query`SELECT * FROM Courts WHERE court_id = ${courtId}`;
        return result.recordset[0];
    } catch (err) {
        console.error('Lỗi Model (updateCourt):', err.message);
        throw err;
    }
}

async function deleteCourt(courtId) {
    try {
        await sql.query`
            UPDATE Courts 
            SET status = 'Deleted', updated_at = GETDATE()
            WHERE court_id = ${courtId}
        `;
        return true;
    } catch (err) {
        console.error('Lỗi Model (deleteCourt):', err.message);
        throw err;
    }
}

async function checkCourtOwnership(userId, courtId) {
    try {
        const result = await sql.query`
            SELECT COUNT(*) as count 
            FROM Courts c
            JOIN SportsCenters s ON c.center_id = s.center_id
            WHERE c.court_id = ${courtId} AND s.center_owner_id = ${userId}
        `;
        return result.recordset[0].count > 0;
    } catch (err) {
        console.error('Lỗi Model (checkCourtOwnership):', err.message);
        return false;
    }
}
module.exports = {
    findCenterByOwnerId,
    createCenter,
    getCourtsByOwnerId,
    getBookingsByDate,
    createCourt,
    updateCourt,
    deleteCourt,
    checkCourtOwnership
};