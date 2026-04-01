console.log('>>> AUTH CONTROLLER ĐÃ ĐƯỢC LOAD!'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 
const otpGenerator = require('otp-generator'); 
const { 
    createUsers, 
    findByUsernameOrEmail, 
    findByEmail } = require('../models/accountModels');
const verificationModel = require('../models/verificationModel'); 

const { 
    findRoleByName, 
    assignRoleToUser,
    getRolesByUserId } = require('../models/roleModel');

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';
const TEMP_JWT_SECRET = process.env.TEMP_JWT_SECRET || 'mytempsecretkeyforotp'; 

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false, 
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

// ##### HÀM: Yêu cầu OTP #####
async function requestOtp(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ msg: 'Vui lòng nhập email' });
    }

    try {
        // 1. Kiểm tra email đã tồn tại trong bảng Users chưa
        const existingUsers = await findByEmail(email);
        if (existingUsers) {
            return res.status(400).json({ msg: 'Email này đã được đăng ký' });
        }

        // 2. Tạo OTP
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false,
            lowerCaseAlphabets: false,
        });
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

        // 3. Lưu OTP vào bảng EmailVerification
        await verificationModel.upsertOtp(email, otp, expiresAt);

        // 4. Gửi email
        await transporter.sendMail({
            from: `"WhereWeSport" <${process.env.MAIL_USER}>`,
            to: email,
            subject: 'Mã xác thực đăng ký',
            html: `
                <p>Mã OTP của bạn là:</p>
                <h1 style="color: blue;">${otp}</h1>
                <p>Mã này sẽ hết hạn sau 5 phút.</p>
            `,
        });

        res.status(200).json({ msg: 'Đã gửi OTP thành công. Vui lòng kiểm tra email.' });

    } catch (err) {
        console.error('❌ Lỗi trong requestOtp:', err);
        res.status(500).json({ msg: 'Lỗi server', error: err.message });
    }
}

// ##### HÀM: Xác thực OTP #####
async function verifyOtp(req, res) {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ msg: 'Vui lòng nhập email và OTP' });
    }

    try {
        // 1. Kiểm tra OTP
        const verification = await verificationModel.findValidOtp(email, otp);
        if (!verification) {
            return res.status(400).json({ msg: 'OTP không chính xác hoặc đã hết hạn' });
        }

        // 2. Cập nhật trạng thái đã xác thực
        await verificationModel.setVerified(email);

        // 3. Tạo token TẠM THỜI
        const tempToken = jwt.sign(
            { email: email, type: 'email_verification' },
            TEMP_JWT_SECRET,
            { expiresIn: '10m' } // Cho phép 10 phút để điền form đăng ký
        );
        
        res.status(200).json({ msg: 'Xác thực email thành công', tempToken });

    } catch (err) {
        console.error('❌ Lỗi trong verifyOtp:', err);
        res.status(500).json({ msg: 'Lỗi server', error: err.message });
    }
}

// ##### SỬA LẠI HÀM: Đăng ký #####
async function register(req, res) {
    // 1. Lấy thông tin từ body VÀ token tạm thời từ header
    const { username, password } = req.body;
    const tempToken = req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"

    if (!tempToken) {
        return res.status(401).json({ msg: 'Không tìm thấy token xác thực' });
    }
    
    try {
        // 2. Xác thực token tạm thời
        let decoded;
        try {
            decoded = jwt.verify(tempToken, TEMP_JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ msg: 'Token không hợp lệ hoặc hết hạn' });
        }
        
        const { email } = decoded; // Lấy email từ token

        // 3. Kiểm tra xem email này đã thực sự được xác thực chưa
        const verificationStatus = await verificationModel.getVerificationStatus(email);
        if (!verificationStatus || !verificationStatus.IsVerified) {
            return res.status(400).json({ msg: 'Email chưa được xác thực' });
        }

        // 4. Kiểm tra username có bị trùng không
        const existing = await findByUsernameOrEmail(username);
        if (existing) {
            return res.status(400).json({ msg: 'Username đã tồn tại' });
        }

        // 5. Tạo tài khoản
        const hashedPassword = await bcrypt.hash(password, 10);
        await createUsers(username, hashedPassword, email); // email được lấy từ token

        
        // 5.1. Lấy user_id của tài khoản vừa tạo
        const newUser = await findByUsernameOrEmail(username);
        if (!newUser) {
            throw new Error('Không thể tìm thấy tài khoản vừa tạo.');
        }

        // 5.2. Tìm role_id của 'User' (Mặc định)
        const defaultRole = await findRoleByName('User');
        if (!defaultRole) {
            throw new Error("Cấu hình lỗi: Không tìm thấy vai trò 'User' mặc định.");
        }

        // 5.3. Gán role 'User' cho user mới
        await assignRoleToUser(newUser.user_id, defaultRole.role_id);
        

        // 6. Xóa bản ghi OTP sau khi đã đăng ký thành công
        await verificationModel.deleteVerification(email);

        res.status(201).json({ msg: 'Đăng ký tài khoản thành công (đã gán role User)' });

    } catch (err) {
        console.error('❌ Lỗi trong register:', err);
        res.status(500).json({ msg: 'Lỗi server', error: err.message });
    }
}

// Đăng nhập
async function login(req, res) {
    const { identifier, password } = req.body;
    try {
        const users = await findByUsernameOrEmail(identifier);
        if (!users) return res.status(400).json({ msg: 'Tài khoản không tồn tại' });

        const match = await bcrypt.compare(password, users.passwordHash);
        if (!match) return res.status(400).json({ msg: 'Sai mật khẩu' });
        let roles = [];
        try {
          roles = await getRolesByUserId(users.user_id);
        } catch (roleError) {
          console.error('Lỗi nghiêm trọng khi lấy roles:', roleError);
          // Dù lỗi, vẫn tạm gán role 'User' để đăng nhập
          roles = ['User'];
        }  
        // Đảm bảo user luôn có ít nhất 1 role (phòng trường hợp lỗi logic)
        if (!roles || roles.length === 0) {
            console.warn(`User ${users.user_id} không có role nào. Tạm gán 'User'`);
            roles = ['User'];
        }

        console.log(`User ${users.username} đăng nhập với các quyền:`, roles);
        const tokenPayload = {
          id: users.user_id,
          username: users.username,
          roles: roles
        };

        const token = jwt.sign(
          tokenPayload,
          JWT_SECRET,
          { expiresIn: '2h' }
        );

        res.json({ msg: 'Đăng nhập thành công', token });
    } catch (err) {
        console.error('❌ Lỗi không xác định trong login:', err);
        res.status(500).json({ msg: 'Lỗi server', error: err.message });
    }
}

module.exports = { 
    requestOtp, 
    verifyOtp,  
    register, 
    login 
};