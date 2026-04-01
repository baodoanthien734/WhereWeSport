import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ approvedAt, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!approvedAt) return;

            const startTime = new Date(approvedAt).getTime();
            const deadline = startTime + (15 * 60 * 1000); 
            const now = new Date().getTime();
            const distance = deadline - now;

            if (distance < 0) {
                setIsExpired(true);
                setTimeLeft("00:00");
                if (onExpire) onExpire(); 
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                
                const mStr = minutes < 10 ? "0" + minutes : minutes;
                const sStr = seconds < 10 ? "0" + seconds : seconds;
                
                setTimeLeft(`${mStr}:${sStr}`);
            }
        };

        calculateTimeLeft();

        const timerId = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timerId);
    }, [approvedAt]);

    if (isExpired) return <span style={{ color: 'red', fontWeight: 'bold' }}>Hết hạn</span>;

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#d9534f', fontWeight: 'bold' }}>
            <span>⏱ Thanh toán trong:</span>
            <span style={{ fontSize: '1.1em' }}>{timeLeft}</span>
        </div>
    );
};

export default CountdownTimer;