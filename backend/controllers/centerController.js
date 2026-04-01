const centerModel = require('../models/centerModel');

/**
 * @desc   Lấy danh sách tất cả trung tâm (Public)
 * @route  GET /api/centers
 */
const getCenters = async (req, res) => {
    try {
        const centers = await centerModel.getAllActiveCenters();
        res.status(200).json(centers);
    } catch (err) {
        console.error('Lỗi Controller (getCenters):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

/**
 * @desc   Lấy chi tiết 1 trung tâm
 * @route  GET /api/centers/:id
 */
const getCenterDetail = async (req, res) => {
    const centerId = req.params.id;
    try {
        const center = await centerModel.getCenterById(centerId);
        if (center) {
            res.status(200).json(center);
        } else {
            res.status(404).json({ message: 'Không tìm thấy trung tâm.' });
        }
    } catch (err) {
        console.error('Lỗi Controller (getCenterDetail):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

const getCenterCourts = async (req, res) => {
    const centerId = req.params.id;
    try {
        const courts = await centerModel.getCourtsByCenterId(centerId);
        res.status(200).json(courts);
    } catch (err) {
        console.error('Lỗi Controller (getCenterCourts):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

const getPublicBookings = async (req, res) => {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
        return res.status(400).json({ msg: 'Thiếu tham số courtId hoặc date.' });
    }

    try {
        const bookings = await centerModel.getPublicBookings(courtId, date);
        res.status(200).json(bookings);
    } catch (err) {
        console.error('Lỗi Controller (getPublicBookings):', err.message);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

module.exports = {
    getCenters,
    getCenterDetail,
    getCenterCourts,
    getPublicBookings
};