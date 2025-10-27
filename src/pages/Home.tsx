import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HamburgerMenu } from '../components/Common';
import { useAuthGuard } from '../hooks/useAuthGuard';

const Home = () => {
  const navigate = useNavigate();
  
  useAuthGuard();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    // 로그인 후 바로 /client 페이지로 이동
    navigate('/client');
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8082/api/v0/logout', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
    } catch (e) {}
    finally {
      localStorage.clear();
      navigate('/login');
    }
  }

  const token = localStorage.getItem('token');
  const currentUser = token ? {
    id: localStorage.getItem('id'),
    isAdmin: localStorage.getItem('role') === 'ROLE_ADMIN'
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <nav className="w-full bg-white shadow flex items-center justify-between px-6 py-3 mb-8">
        <Link to="/" className="text-xl font-bold text-blue-600">이루연</Link>
        <div className="flex gap-4 items-center">
          <div className="md:hidden">
            <HamburgerMenu currentUser={currentUser} onLogout={handleLogout} />
          </div>
          <div className="hidden md:flex gap-4 items-center">
            {currentUser ? (
              <>
                <Link to="/client" className="hover:underline">프로필</Link>
                <Link to="/matches" className="hover:underline">매칭내역</Link>
                <button onClick={handleLogout} className="bg-gray-200 px-3 py-1 rounded">로그아웃</button>
              </>
            ) : (
              <>
                <Link to="/login" className="bg-blue-500 text-white px-3 py-1 rounded font-semibold hover:bg-blue-600 transition">로그인</Link>
                <Link to="/signup" className="bg-pink-500 text-white px-3 py-1 rounded font-semibold hover:bg-pink-600 transition">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center mt-24">
        <h1 className="text-3xl font-bold mb-4">이루연 데이팅 플랫폼</h1>
        <p className="mb-8 text-gray-600">진지한 만남을 위한 프리미엄 매칭 서비스</p>
      </div>
    </div>
  );
};

export default Home; 