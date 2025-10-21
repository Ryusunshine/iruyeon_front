import React from 'react';
import { Link } from 'react-router-dom';

// 임시 mock 데이터
const profiles = [
  { id: '1', name: '홍길동', userId: '1' },
  { id: '2', name: '김영희', userId: '2' },
];
const matches = [
  { id: '1', fromProfileId: '1', toProfileId: '2', status: '매칭됨' },
  { id: '2', fromProfileId: '2', toProfileId: '1', status: '진행중' },
];
const myProfileIds = ['1']; // 임시 내 프로필 id 목록

const sentMatches = matches.filter((m: any) => myProfileIds.includes(m.fromProfileId));
const receivedMatches = matches.filter((m: any) => myProfileIds.includes(m.toProfileId));
const getProfile = (id: string) => profiles.find((p: any) => p.id === id);

const statusBadge = (status: string) => {
  if (status === '매칭됨') return <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs">매칭됨</span>;
  if (status === '진행중') return <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">진행중</span>;
  if (status === '거절됨') return <span className="ml-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs">거절됨</span>;
  return null;
};

const ProfileMatches = () => {
  if (!localStorage.getItem('token')) return <div className="p-8 text-center">로그인 후 이용 가능합니다.</div>;
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h2 className="text-2xl font-bold mb-4">매칭 내역</h2>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">보낸 매칭</h3>
        {sentMatches.length === 0 ? (
          <div className="text-gray-400 py-8">보낸 매칭이 없습니다.</div>
        ) : (
          <ul className="space-y-2">
            {sentMatches.map((m: any) => (
              <li key={m.id} className="border rounded p-3 bg-white flex flex-col md:flex-row md:items-center md:justify-between shadow hover:shadow-lg transition">
                <div>
                  <span className="font-bold">상대:</span> {getProfile(m.toProfileId)?.name || '알 수 없음'}
                  {statusBadge(m.status)}
                </div>
                {m.status === '매칭됨' && (
                  <Link to={`/matching/${m.id}`} className="text-white bg-blue-500 px-3 py-1 rounded mt-2 md:mt-0 hover:bg-blue-600 transition">매칭방 이동</Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">받은 매칭</h3>
        {receivedMatches.length === 0 ? (
          <div className="text-gray-400 py-8">받은 매칭이 없습니다.</div>
        ) : (
          <ul className="space-y-2">
            {receivedMatches.map((m: any) => (
              <li key={m.id} className="border rounded p-3 bg-white flex flex-col md:flex-row md:items-center md:justify-between shadow hover:shadow-lg transition">
                <div>
                  <span className="font-bold">보낸 사람:</span> {getProfile(m.fromProfileId)?.name || '알 수 없음'}
                  {statusBadge(m.status)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProfileMatches; 