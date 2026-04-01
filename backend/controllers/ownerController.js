// 1. CHỈ import Model
const ownerModel = require('../models/ownerModel');

/**
 * @desc   Lấy thông tin SportsCenter của chủ sở hữu (dựa trên token)
 * @route  GET /api/owner/my-center
 */
const getMyCenter = async (req, res) => {
    // req.user.userId đã được gán bởi middleware
    const ownerId = req.user.userId;

    try {
        // 2. Controller gọi Model
        const center = await ownerModel.findCenterByOwnerId(ownerId);

        if (center) {
            res.status(200).json(center);
        } else {
            res.status(404).json({ msg: 'Chủ sở hữu này chưa có trung tâm thể thao.' });
        }
        
    } catch (err) {
        console.error('Lỗi Controller (getMyCenter):', err.message);
        res.status(500).json({ message: 'Lỗi server' });
    }
};


/**
 * @desc   Tạo SportsCenter mới cho chủ sở hữu
 * @route  POST /api/owner/my-center
 */
const createMyCenter = async (req, res) => {
    const ownerId = req.user.userId;
    const { center_name, contact_phone, address_text } = req.body;

    // --- Validate dữ liệu cơ bản ---
    if (!center_name || !contact_phone || !address_text) {
        return res.status(400).json({ msg: 'Vui lòng cung cấp tên trung tâm, SĐT, và địa chỉ.' });
    }

    try {
        // 3. Controller gọi Model để kiểm tra
        const existingCenter = await ownerModel.findCenterByOwnerId(ownerId);

        if (existingCenter) {
            // 400 Bad Request: Mỗi chủ sân chỉ được tạo 1 trung tâm
            return res.status(400).json({ msg: 'Bạn đã sở hữu một trung tâm thể thao. Không thể tạo thêm.' });
        }

        // 4. Controller gọi Model để tạo mới
        const newCenter = await ownerModel.createCenter(ownerId, req.body);
        
        // 201 Created: Trả về dữ liệu trung tâm vừa tạo
        res.status(201).json(newCenter);

    } catch (err) {
        console.error('Lỗi Controller (createMyCenter):', err.message);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const getMyCourts = async (req, res) => {
    const ownerId = req.user.userId;

    try {
        const courts = await ownerModel.getCourtsByOwnerId(ownerId);
        
        res.status(200).json(courts);
        
    } catch (err) {
        console.error('Lỗi Controller (getMyCourts):', err.message);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách sân.' });
    }
};

const getBookings = async (req, res) => {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
        return res.status(400).json({ msg: 'Thiếu tham số courtId hoặc date.' });
    }

    try {
        const bookings = await ownerModel.getBookingsByDate(courtId, date);
        
        res.status(200).json(bookings);
        
    } catch (err) {
        console.error('Lỗi Controller (getBookings):', err.message);
        res.status(500).json({ message: 'Lỗi server khi lấy lịch.' });
    }
};

const addCourt = async (req, res) => {
    const ownerId = req.user.userId;
    const { court_name, court_type, price_per_hour } = req.body;

    // Validate
    if (!court_name || !court_type || !price_per_hour) {
        return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ tên sân, loại sân và giá tiền.' });
    }

    try {
        // 1. Tìm Center ID của chủ sân này
        const center = await ownerModel.findCenterByOwnerId(ownerId);
        if (!center) {
            return res.status(404).json({ msg: 'Bạn chưa tạo trung tâm thể thao nào.' });
        }

        // 2. Tạo sân mới gắn với center_id đó
        const newCourt = await ownerModel.createCourt(center.center_id, req.body);

        res.status(201).json(newCourt);

    } catch (err) {
        console.error('Lỗi Controller (addCourt):', err.message);
        res.status(500).json({ message: 'Lỗi server khi thêm sân.' });
    }
};

const updateCourt = async (req, res) => {
    const courtId = req.params.id;
    const { court_name, court_type, price_per_hour } = req.body;

    if (!court_name || !court_type || !price_per_hour) {
        return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ thông tin.' });
    }

    try {
        // 1. Kiểm tra quyền sở hữu sân này (Đảm bảo chủ sân chỉ được sửa sân của mình)
        const userId = req.user.userId;
            const isTrueOwner = await ownerModel.checkCourtOwnership(userId, courtId);
        if (!isTrueOwner) {
            return res.status(403).json({ msg: 'Bạn không có quyền chỉnh sửa sân này.' });
        }

        const updatedCourt = await ownerModel.updateCourt(courtId, req.body);
        
        if (updatedCourt) {
            res.json({ msg: 'Cập nhật thành công', data: updatedCourt });
        } else {
            res.status(404).json({ msg: 'Không tìm thấy sân.' });
        }
    } catch (err) {
        console.error('Lỗi Controller (updateCourt):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

const deleteCourt = async (req, res) => {
    const courtId = req.params.id;

    try {
        await ownerModel.deleteCourt(courtId);
        res.json({ msg: 'Đã xóa sân thành công (Soft Delete)', deletedId: courtId });
    } catch (err) {
        console.error('Lỗi Controller (deleteCourt):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

module.exports = {
    getMyCenter,
    createMyCenter,
    getMyCourts,
    getBookings,
    addCourt,
    updateCourt,
    deleteCourt
};