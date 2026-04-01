const { sql } = require('../config/db');

async function createUsers(username, passwordHash, email) {
  await sql.query`
    INSERT INTO Users (username, passwordHash, email)
    VALUES (${username}, ${passwordHash}, ${email})
  `;
}

async function findByUsernameOrEmail(identifier) {
  const result = await sql.query`
    SELECT * FROM Users
    WHERE username = ${identifier} OR email = ${identifier}
  `;
  return result.recordset[0];
}

async function findByEmail(email) {
  const result = await sql.query`
    SELECT * FROM Users WHERE email = ${email}
  `;
  return result.recordset[0];
}

module.exports = { 
  createUsers, 
  findByUsernameOrEmail,
  findByEmail 
};
