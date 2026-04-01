import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function GuestLayout() {
    const navigate = useNavigate();
    
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const _hasHydrated = useAuthStore(state => state._hasHydrated);

    useEffect(() => {
        if (_hasHydrated && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, _hasHydrated, navigate]);

    if (!_hasHydrated) {
        return <div className="loading-screen">Đang tải...</div>;
    }

    return (
        <div className="guest-layout-wrapper">
            <Outlet />
        </div>
    );
}

export default GuestLayout;