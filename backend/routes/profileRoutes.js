const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { getProfile, updateProfile, uploadAvatar } = require('../controllers/profileController');

const { checkAuthAndRole } = require('../middleware/authMiddleware');

// Cấu hình Multer để lưu file vào thư mục 'uploads' và đặt tên file duy nhất
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Tạo tên file duy nhất để tránh trùng lặp: userId-timestamp.ext
        //Phải đảm bảo req.user.userId đã tồn tại (checkAuthAndRole sẽ đảm bảo)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.user.userId + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', checkAuthAndRole([]), getProfile);


router.put('/', checkAuthAndRole([]), updateProfile);

// (Middleware checkAuthAndRole phải chạy TRƯỚC upload, để Multer có thể lấy req.user.userId)
router.post('/avatar', checkAuthAndRole([]), upload.single('avatar'), uploadAvatar);

module.exports = router;