const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';


const checkAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Middleware: Không tìm thấy Bearer Token');
        return res.status(401).json({ msg: 'Không có token hoặc token không hợp lệ' });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        req.user = { 
            userId: decoded.id, 
            username: decoded.username,
            roles: decoded.roles || [] 
        }; 
        
        console.log(`Middleware: User ${req.user.username} đã xác thực với quyền:`, req.user.roles);
        next(); 

    } catch (err) {
        console.error("Middleware: Lỗi xác thực token:", err.message); 
        return res.status(401).json({ msg: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};


const checkAuthAndRole = (allowedRoles) => {
    return [
        checkAuth, 
        
        (req, res, next) => {

            if (!allowedRoles || allowedRoles.length === 0) {
                return next();
            }

            const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));

            if (!hasPermission) {
                console.warn(`Middleware: TỪ CHỐI. User ${req.user.username} (Roles: ${req.user.roles}) 
                             cố gắng truy cập tài nguyên yêu cầu (Roles: ${allowedRoles})`);
                             
                return res.status(403).json({ msg: 'Cấm truy cập (Không đủ quyền)' });
            }

            // Nếu có quyền
            console.log(`Middleware: CHO PHÉP. User ${req.user.username} có quyền.`);
            next();
        }
    ];
};

module.exports = { checkAuthAndRole };