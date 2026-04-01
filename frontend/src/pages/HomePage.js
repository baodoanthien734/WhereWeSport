import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="page-container">
      <header className="home-header">
        <h1>Chào mừng đến với WhereWeSpork</h1>
        <nav>
          <Link to="/login" className="nav-link">Đăng nhập</Link>
          <Link to="/register" className="nav-link auth-button">Đăng ký</Link>
        </nav>
      </header>
      <main className="home-main">
        <h2>Nơi kết nối đam mê thể thao</h2>
        <p>Tìm kiếm sân đấu, tham gia trận đấu, và kết nối với cộng đồng.</p>
      </main>
    </div>
  );
}

export default HomePage;