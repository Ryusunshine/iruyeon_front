import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '../hooks/useAuthGuard';

type PendingMemberItem = {
  id: number;
  email: string;
  name: string;
  phoneNumber: string;
  company: string;
  image?: { uri: string } | null;
};

const PendingMember = () => {
  useAuthGuard();
  const [members, setMembers] = useState<PendingMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPendingMembers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8082/api/v0/admin/member/pending', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('목록을 불러오지 못했습니다.');
        const data = await res.json();
        setMembers(data.data || []);
      } catch (e: any) {
        setError(e.message || '오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchPendingMembers();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8082/api/v0/admin/member/approve/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('승인에 실패했습니다.');
      // 성공 시 목록 새로고침
      setMembers(members => members.filter(m => m.id !== id));
    } catch (e: any) {
      setError(e.message || '승인 중 오류 발생');
    }
  };
  const handleReject = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8082/api/v0/admin/member/reject/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('거부에 실패했습니다.');
      // 성공 시 목록 새로고침
      setMembers(members => members.filter(m => m.id !== id));
    } catch (e: any) {
      setError(e.message || '거부 중 오류 발생');
    }
  };

  // 메뉴 항목
  const menu = [
    { label: '모든 회원', path: '/admin/member' },
    { label: '승인 대기중 명단', path: '/admin/member/pending' },
    { label: '내 정보 수정', path: '/admin/mypage' },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50">
      {/* 상단바 */}
      <header className="fixed top-0 left-0 w-full h-16 bg-white shadow flex items-center justify-between px-8 z-50 border-b border-pink-100">
        <span className="text-xl font-bold text-black tracking-tight">이루연 관리자</span>
        <button onClick={() => {
          localStorage.clear();
          navigate('/login');
        }} className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-semibold shadow transition-all">로그아웃</button>
      </header>
      <div className="flex w-full pt-16">
        {/* 왼쪽 메뉴바 */}
        <nav className="w-64 min-h-screen bg-white shadow-2xl flex flex-col py-10 px-6 border-r border-pink-100">
          <h2 className="text-2xl font-extrabold mb-10 text-black tracking-tight">관리자 메뉴</h2>
          {menu.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 text-left px-5 py-3 mb-3 rounded-xl font-semibold text-lg transition-all duration-150 shadow-sm hover:shadow-md hover:scale-[1.03] border-2 border-transparent ${location.pathname === item.path ? 'bg-gradient-to-r from-pink-100 to-yellow-100 text-black border-pink-300' : 'hover:bg-gray-50 text-black'}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        {/* 오른쪽 내용 */}
        <main className="flex-1 p-10 md:p-16">
          <h2 className="text-3xl font-extrabold mb-8 text-black tracking-tight">승인 대기 회원 명단</h2>
          {/* 표 헤더 */}
          <div className="flex items-center bg-gray-200 rounded-lg px-4 py-3 font-bold text-gray-700 mb-2 text-lg">
            <div className="w-16 text-center">이미지</div>
            <div className="flex-1 text-center">이름</div>
            <div className="flex-1 text-center">전화번호</div>
            <div className="flex-1 text-center">회사명</div>
            <div className="w-48 text-center">관리</div>
          </div>
          {loading ? (
            <div className="text-black animate-pulse">불러오는 중...</div>
          ) : error ? (
            <div className="text-red-500 font-semibold">{error}</div>
          ) : members.length === 0 ? (
            <div className="text-black">대기 중인 회원이 없습니다.</div>
          ) : (
            <ul className="space-y-2">
              {members.map(member => (
                <li key={member.id} className="flex items-center bg-gray-100 rounded-lg px-4 py-3 shadow-sm text-lg">
                  <div className="w-16 flex justify-center">
                    <img
                      src={member.image && member.image.uri ? member.image.uri : '/default-profile.png'}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border"
                      onError={e => (e.currentTarget.src = '/default-profile.png')}
                    />
                  </div>
                  <div className="flex-1 text-center truncate">{member.name}</div>
                  <div className="flex-1 text-center truncate">{member.phoneNumber}</div>
                  <div className="flex-1 text-center truncate">{member.company}</div>
                  <div className="w-48 flex flex-row gap-2 justify-center">
                    <button
                      onClick={() => handleApprove(member.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow text-lg min-w-[90px]"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleReject(member.id)}
                      className="bg-red-400 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold shadow text-lg min-w-[90px]"
                    >
                      거부
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default PendingMember; 