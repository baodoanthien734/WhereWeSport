CREATE TABLE UserProfile (
    user_id INT PRIMARY KEY,
    full_name NVARCHAR(50),      
    phone_number VARCHAR(20),      
    avatar_url NVARCHAR(255),    
    gender NVARCHAR(20),
    CONSTRAINT FK_UserProfile_Users FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

SELECT * FROM Users

DELETE FROM Users
WHERE user_id = 2;

SELECT * FROM UserProfile