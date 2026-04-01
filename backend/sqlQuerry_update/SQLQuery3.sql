DROP TABLE IF EXISTS Role_menu;
DROP TABLE IF EXISTS User_role;
DROP TABLE IF EXISTS Menu;
DROP TABLE IF EXISTS Roles;

CREATE TABLE Roles (
    role_id INT PRIMARY KEY IDENTITY(1,1),
    role_name NVARCHAR(50) NOT NULL UNIQUE, 
    role_description NVARCHAR(500) 
);

CREATE TABLE Menu (
    menu_id INT PRIMARY KEY IDENTITY(1,1),
    menu_name NVARCHAR(100) NOT NULL,
    menu_path NVARCHAR(255) NOT NULL UNIQUE 
);

CREATE TABLE User_role (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE
);

CREATE TABLE Role_menu (
    role_id INT NOT NULL,
    menu_id INT NOT NULL,
    PRIMARY KEY (role_id, menu_id),
    FOREIGN KEY (role_id) REFERENCES Roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES Menu(menu_id) ON DELETE CASCADE
);

INSERT INTO Roles (role_name, role_description)
VALUES
    ('User', 'Có quyền tham gia cộng đồng.'),
    ('Customer', 'Kế thừa mọi quyền của user, ngoài ra có thêm quyền đặt sân (chỉ khi cập nhập profile).'),
    ('Court Owner', 'Kế thừa mọi quyền của customer, ngoài ra có thể xài trang chủ sân với các chức năng dành riêng cho chủ sân.'),
    ('Admin', 'Kế thừa mọi quyền, ngoài ra còn có trang quản lý dành riêng cho admin.');
