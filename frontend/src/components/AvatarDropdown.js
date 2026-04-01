import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './AvatarDropdown.module.css';


function AvatarDropdown({ avatarUrl, username, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className={styles.avatarDropdownContainer} ref={dropdownRef}>
      <div className={styles.avatar} onClick={() => setIsOpen(!isOpen)}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className={styles.avatarImage} />
        ) : (
          <span>?</span>
        )}
      </div>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {/* Thêm phần hiển thị username */}
          <div className={styles.dropdownHeader}>
            Chào, {username || 'User'}
          </div>

          <Link to="/profile" className={styles.dropdownItem}>
          Tài khoản của tôi
          </Link>
          <Link to="/my-bookings" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
            Lịch sử đặt sân
          </Link>
          <div className={styles.dropdownItem} onClick={onLogout}>
            Đăng xuất
          </div>
        </div>
      )}
    </div>
  );
}

export default AvatarDropdown;

