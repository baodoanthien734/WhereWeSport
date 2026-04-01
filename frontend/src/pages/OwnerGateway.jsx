import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useOwnerStore } from '../store/ownerStore.js';

const OwnerGateway = () => {
    const navigate = useNavigate();
    const setCenter = useOwnerStore((state) => state.setCenter);
    const setLoading = useOwnerStore((state) => state.setLoading);
    const setError = useOwnerStore((state) => state.setError);

    useEffect(() => {
        const checkOwnerStatus = async () => {
            setLoading(true);
            try {
                const response = await api.get('/owner/my-center');
                
                if (response.data) {
                    console.log("OwnerGateway: Đã tìm thấy trung tâm, chuyển hướng Dashboard.");
                    setCenter(response.data); // Lưu vào "Ví Chủ Sân"
                    navigate('/owner/dashboard', { replace: true });
                }

            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log("OwnerGateway: Chưa có trung tâm, chuyển hướng Form Tạo Mới.");
                    navigate('/owner/create-center', { replace: true });
                } else {
                    console.error("OwnerGateway: Lỗi kiểm tra trạng thái chủ sân:", error);
                    setError("Không thể tải thông tin trung tâm. Vui lòng thử lại sau.");
                }
            } finally {
                setLoading(false);
            }
        };

        checkOwnerStatus();
    }, [navigate, setCenter, setLoading, setError]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-lg font-semibold text-gray-600">Đang kiểm tra thông tin chủ sân...</div>
        </div>
    );
};

export default OwnerGateway;