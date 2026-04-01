GO

IF NOT EXISTS (SELECT 1 FROM User_role WHERE user_id = 3 AND role_id = 1)
BEGIN
    INSERT INTO User_role (user_id, role_id) VALUES (3, 1);
    PRINT 'Da gan quyen User (id=1) cho user_id=3.';
END
ELSE
BEGIN
    PRINT 'User_id=3 da co quyen User (id=1).';
END
GO

IF NOT EXISTS (SELECT 1 FROM User_role WHERE user_id = 3 AND role_id = 2)
BEGIN
    INSERT INTO User_role (user_id, role_id) VALUES (3, 2);
    PRINT 'Da gan quyen Customer (id=2) cho user_id=3.';
END
ELSE
BEGIN
    PRINT 'User_id=3 da co quyen Customer (id=2).';
END
GO

IF NOT EXISTS (SELECT 1 FROM User_role WHERE user_id = 3 AND role_id = 3)
BEGIN
    INSERT INTO User_role (user_id, role_id) VALUES (3, 3);
    PRINT 'Da gan quyen Court Owner (id=3) cho user_id=3.';
END
ELSE
BEGIN
    PRINT 'User_id=3 da co quyen Court Owner (id=3).';
END
