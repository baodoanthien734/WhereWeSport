
const { sql } = require('../config/db');

const findRoleByName = async (roleName) => {
    try {
        const result = await sql.query`
            SELECT * FROM Roles WHERE role_name = ${roleName}
        `;

        if (result.recordset.length > 0) {
            return result.recordset[0];
        }
        return null; 
    } catch (error) {
        console.error('Lỗi khi tìm role bằng tên:', error.message);
        throw error;
    }
};

const assignRoleToUser = async (userId, roleId) => {
    try {
        await sql.query`
            INSERT INTO User_role (user_id, role_id) VALUES (${userId}, ${roleId})
        `;
        console.log(`Đã gán vai trò ${roleId} cho người dùng ${userId}`);
    } catch (error) {
        if (error.number === 2627 || error.number === 2601) { 
            console.warn(`Cảnh báo: Người dùng ${userId} đã có vai trò ${roleId}.`);
            return;
        }
        console.error('Lỗi khi gán vai trò cho người dùng:', error.message);
        throw error;
    }
};


const getRolesByUserId = async (userId) => {
    try {
        const result = await sql.query`
            SELECT r.role_name
            FROM Roles r
            JOIN User_role ur ON r.role_id = ur.role_id
            WHERE ur.user_id = ${userId}
        `;

        const roles = result.recordset.map(record => record.role_name);
        
        return roles; 

    } catch (error) {
        console.error('Lỗi khi lấy vai trò của người dùng:', error.message);
        throw error;
    }
};

module.exports = {
    findRoleByName,
    assignRoleToUser,
    getRolesByUserId 
};