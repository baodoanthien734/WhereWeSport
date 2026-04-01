const { sql } = require('../config/db');

// Dùng để Thêm mới hoặc Cập nhật OTP cho email 
async function upsertOtp(email, otpCode, expiresAt) {
  await sql.query`
    MERGE INTO EmailVerification AS target
    USING (VALUES (${email})) AS source (Email)
    ON (target.Email = source.Email)
    WHEN MATCHED THEN
      UPDATE SET OtpCode = ${otpCode}, ExpiresAt = ${expiresAt}, IsVerified = 0
    WHEN NOT MATCHED THEN
      INSERT (Email, OtpCode, ExpiresAt, IsVerified)
      VALUES (${email}, ${otpCode}, ${expiresAt}, 0);
  `;
}

// Tìm OTP hợp lệ cho email và mã OTP
async function findValidOtp(email, otpCode) {
  const result = await sql.query`
    SELECT * FROM EmailVerification
    WHERE Email = ${email} 
      AND OtpCode = ${otpCode} 
      AND ExpiresAt > GETUTCDATE() -- cho đúng múi giờ UTC
      AND IsVerified = 0
  `;
  return result.recordset[0];
}

// Cập nhật trạng thái đã xác thực
async function setVerified(email) {
  await sql.query`
    UPDATE EmailVerification SET IsVerified = 1 WHERE Email = ${email}
  `;
}

// Lấy thông tin xác thực bằng email 
async function getVerificationStatus(email) {
    const result = await sql.query`
      SELECT IsVerified FROM EmailVerification WHERE Email = ${email}
    `;
    return result.recordset[0];
}

async function deleteVerification(email) {
  await sql.query`
    DELETE FROM EmailVerification WHERE Email = ${email}
  `;
}

module.exports = {
  upsertOtp,
  findValidOtp,
  setVerified,
  getVerificationStatus,
  deleteVerification,
};