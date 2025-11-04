import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TopBar = ({ currentUser, onLogout }: { currentUser?: any, onLogout: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const id = localStorage.getItem('id');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2">
        <button 
          onClick={toggleMenu}
          className="p-2 hover:bg-gray-100 rounded transition"
        >
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black mb-1"></span>
          <span className="block w-6 h-0.5 bg-black"></span>
        </button>
      </div>
      <Link to="/" className="text-xl font-bold text-black-600">이루연</Link>
      <div className="flex items-center gap-2">
        {currentUser ? (
          <button onClick={onLogout} className="bg-gray-200 px-3 py-1 rounded font-semibold text-gray-700 hover:bg-gray-300 transition">로그아웃</button>
        ) : (
          <>
            <Link to="/login" className="bg-blue-500 text-white px-3 py-1 rounded font-semibold hover:bg-blue-600 transition">로그인</Link>
            <Link to="/signup" className="bg-pink-500 text-white px-3 py-1 rounded font-semibold hover:bg-pink-600 transition">회원가입</Link>
          </>
        )}
      </div>

      {/* 토글 메뉴 */}
      {isMenuOpen && (
        <div className="fixed top-16 left-0 w-56 h-full bg-white shadow-lg z-40 flex flex-col p-6">
          <Link to="/client" onClick={() => setIsMenuOpen(false)} className="mb-4 text-lg font-semibold hover:text-pink-600 transition">프로필</Link>
          <Link to="/matches" onClick={() => setIsMenuOpen(false)} className="mb-4 text-lg font-semibold hover:text-pink-600 transition">매칭내역</Link>
          <Link to="/myclient" onClick={() => setIsMenuOpen(false)} className="mb-4 text-lg font-semibold hover:text-pink-600 transition">내 회원목록</Link>
          <Link to={`/member/detail/${id}`} onClick={() => setIsMenuOpen(false)} className="mb-4 text-lg font-semibold hover:text-pink-600 transition">마이페이지</Link>

          {currentUser?.isAdmin && <Link to="/admin/member" onClick={() => setIsMenuOpen(false)} className="mb-4">관리자</Link>}

          {!currentUser && (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="mb-4">로그인</Link>
              <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="mb-4">회원가입</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default TopBar; 