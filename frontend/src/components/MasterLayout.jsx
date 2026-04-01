import React, { useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import api from '../services/api'; 
import AvatarDropdown from './AvatarDropdown.js'; 
import styles from './MasterLayout.module.css'; 
import useAuthStore from '../store/authStore';
import { logout } from '../services/authService';

const backendUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : '';

const MasterLayout = () => { 
    const navigate = useNavigate();

    const user = useAuthStore(state => state.user);
    const roles = useAuthStore(state => state.roles);
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const _hasHydrated = useAuthStore(state => state._hasHydrated);

    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [_hasHydrated, isAuthenticated, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        }
    };

    const getFullAvatarUrl = (avatarPath, userId) => {
        const placeholder = 'https://placehold.co/48x48?text=A';
        if (!avatarPath) return placeholder;
        const cacheBuster = userId || new Date().getTime();
        return `${backendUrl}${avatarPath}?v=${cacheBuster}`;
    };

    const isCourtOwner = roles?.includes('Court Owner');
    const isAdmin = roles?.includes('Admin');

    if (!_hasHydrated || !user) {
        return <div style={{padding: '20px', textAlign: 'center'}}>Đang tải MasterLayout...</div>;
    }

    return (
        <div className={styles.appLayoutWrapper}>
            <header className={styles.masterHeader}>
                <div className={styles.masterHeaderRow1}>
                    <div className={styles.headerLogo}>
                        <Link to="/dashboard">
                            <img src="/images/wws_logo.png" alt="Logo" className={styles.headerLogoImg} />
                        </Link>
                    </div>

                    <div className={styles.headerAvatar}>
                        <AvatarDropdown 
                            avatarUrl={getFullAvatarUrl(user.avatar_url, user.user_id)} 
                            username={user.username}
                            onLogout={handleLogout}
                        />
                    </div>
                </div>

                <nav className={styles.masterHeaderRow2}>
                    <Link to="/dashboard" className={styles.navButton}>Trang chủ</Link>
                    <Link to="/centers" className={styles.navButton} style={{color: '#4f46e5', fontWeight: 'bold'}}>
                        Đặt sân ngay
                    </Link>
                    {isCourtOwner && (
                        <Link to="/owner" className={styles.navButton}>Trang chủ sân</Link>
                    )}

                    {!isCourtOwner && (
                        <Link to="/get-owner-access" className={styles.navButton}>Cấp quyền chủ sân</Link>
                    )}
                    
                    {isAdmin && (
                        <Link to="/admin" className={styles.navButton}>Quản lý Admin</Link>
                    )}

                    <Link to="/profile" className={styles.navButton}>Hồ sơ cá nhân</Link>
                </nav>
            </header>

            <main className={styles.appMainContent}>
                <Outlet />
            </main>
        </div>
    );
};

export default MasterLayout;

