import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../hooks/useAuthGuard';

const Pending = () => {
  const navigate = useNavigate();
  useAuthGuard();

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
  };

  const name = localStorage.getItem('name') || '회원';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 flex flex-col items-center py-10">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mt-20">
        <div className="text-center">
          {/* 아이콘 */}
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4">승인 대기 중입니다</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8 border border-blue-100">
            <p className="text-gray-700 leading-relaxed mb-4">
              안녕하세요! <span className="font-semibold text-pink-600">{name}</span>님의 정보를 검토하고 있습니다.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              관리자의 승인을 기다려주세요.<br/>
              승인 완료 시 이메일 또는 문자로 안내됩니다.
            </p>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-4 mb-8 border border-yellow-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">문의사항이 있으신가요?</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>전화: <span className="font-semibold">02-514-3651</span></p>
                  <p>운영시간: 평일 09:00 - 18:00</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleLogout}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-gray-400 text-xs">ⓒ 이루연</div>
    </div>
  );
};

export default Pending; 