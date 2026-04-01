const { sql } = require('../config/db');

// Lấy thông tin profile bằng user_id 
async function getProfile(userId) {
  const result = await sql.query`
    SELECT 
      u.user_id, u.username, u.email,
      p.full_name, p.phone_number, p.avatar_url, p.gender
    FROM Users u
    LEFT JOIN UserProfile p ON u.user_id = p.user_id
    WHERE u.user_id = ${userId}
  `;
  return result.recordset[0];
}

// Cập nhật thông tin profile 
async function updateProfile(userId, fullName, phoneNumber, gender) {
  await sql.query`
    MERGE INTO UserProfile AS target
    USING (VALUES (${userId})) AS source (user_id)
    ON (target.user_id = source.user_id)
    WHEN MATCHED THEN
      UPDATE SET 
        full_name = ${fullName}, 
        phone_number = ${phoneNumber}, 
        gender = ${gender}
    WHEN NOT MATCHED THEN
      INSERT (user_id, full_name, phone_number, gender)
      VALUES (${userId}, ${fullName}, ${phoneNumber}, ${gender});
  `;
}

// Chỉ cập nhật cột avatar_url
async function updateAvatarUrl(userId, avatarUrl) {
    await sql.query`
    MERGE INTO UserProfile AS target
    USING (VALUES (${userId})) AS source (user_id)
    ON (target.user_id = source.user_id)
    WHEN MATCHED THEN
      UPDATE SET avatar_url = ${avatarUrl}
    WHEN NOT MATCHED THEN
      INSERT (user_id, avatar_url)
      VALUES (${userId}, ${avatarUrl});
  `;
}

module.exports = { 
  getProfile, 
  updateProfile,
  updateAvatarUrl 
};

