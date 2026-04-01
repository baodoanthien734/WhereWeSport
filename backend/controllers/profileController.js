const profileModel = require('../models/profileModel');

async function getProfile(req, res) {
  try {
    const profile = await profileModel.getProfile(req.user.userId);
    if (!profile) {
      return res.status(404).json({ msg: 'Không tìm thấy thông tin người dùng' });
    }
    res.json(profile);
  } catch (err) {
    console.error('❌ Lỗi trong getProfile:', err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { full_name, phone_number, gender } = req.body;
    
    await profileModel.updateProfile(userId, full_name, phone_number, gender);

    res.json({ msg: 'Cập nhật thông tin thành công' });
  } catch (err) {
    console.error('❌ Lỗi trong updateProfile:', err);
    res.status(500).json({ msg: 'Lỗi server' });
  }
}

async function uploadAvatar(req, res) {
  try {
    const { userId } = req.user;
    
    if (!req.file) {
      return res.status(400).json({ msg: 'Vui lòng chọn một file ảnh' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`.replace(/\\/g, '/');

    await profileModel.updateAvatarUrl(userId, avatarUrl);

    res.json({ msg: 'Tải avatar thành công', avatarUrl: avatarUrl });

  } catch (err) {
    console.error('❌ Lỗi trong uploadAvatar:', err);
    res.status(500).json({ msg: 'Lỗi server', error: err.message });
  }
}

module.exports = { 
  getProfile, 
  updateProfile,
  uploadAvatar 
};

