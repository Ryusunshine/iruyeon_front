import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/Common/TopBar';

// 임시 mock 데이터
const profiles = [
  { id: '1', name: '홍길동', age: 28, job: '개발자', region: '서울', photoUrl: '', userId: '1' },
  { id: '2', name: '김영희', age: 25, job: '디자이너', region: '부산', photoUrl: '', userId: '2' },
];

const ProfileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editJob, setEditJob] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const profile = profiles.find((p: any) => p.id === id);

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

  if (!profile) return <div className="p-8 text-center">프로필을 찾을 수 없습니다.</div>;

  // 내 프로필 여부는 임시로 false
  const isMine = false;

  const handleMatch = () => {
    setMessage('매칭 요청이 전송되었습니다! (mock)');
  };

  const handleEditSave = () => {
    setEditMode(false);
    setMessage('프로필이 수정되었습니다! (mock)');
  };

  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      navigate('/profiles');
    }
  };

  const token = localStorage.getItem('token');
  const currentUser = token ? {
    id: localStorage.getItem('id'),
    isAdmin: localStorage.getItem('role') === 'ROLE_ADMIN'
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <TopBar currentUser={currentUser} onLogout={handleLogout} />
      <h2 className="text-2xl font-bold mb-4">프로필 상세</h2>
      <div className="border rounded p-4 bg-white mb-4 flex flex-col md:flex-row gap-6">
        {profile.photoUrl && (
          <img src={profile.photoUrl} alt="프로필" className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0" />
        )}
        <div className="flex-1">
          {editMode ? (
            <>
              <input className="border p-2 mb-2 w-full" value={editName} onChange={e => setEditName(e.target.value)} placeholder="이름" />
              <input className="border p-2 mb-2 w-full" value={editAge} onChange={e => setEditAge(e.target.value)} placeholder="나이" />
              <input className="border p-2 mb-2 w-full" value={editJob} onChange={e => setEditJob(e.target.value)} placeholder="직업" />
              <input className="border p-2 mb-2 w-full" value={editRegion} onChange={e => setEditRegion(e.target.value)} placeholder="지역" />
              <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={handleEditSave}>저장</button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditMode(false)}>취소</button>
            </>
          ) : (
            <>
              <div className="mb-2"><span className="font-bold">이름:</span> {profile.name}</div>
              <div className="mb-2"><span className="font-bold">나이:</span> {profile.age}</div>
              <div className="mb-2"><span className="font-bold">직업:</span> {profile.job}</div>
              <div className="mb-2"><span className="font-bold">지역:</span> {profile.region}</div>
              {isMine && (
                <>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded mr-2" onClick={() => setEditMode(true)}>수정</button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleDelete}>삭제</button>
                </>
              )}
              {!isMine && (
                <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={handleMatch}>매칭 요청</button>
              )}
            </>
          )}
        </div>
      </div>
      {message && <div className="text-center text-green-600 mb-4">{message}</div>}
    </div>
  );
};

export default ProfileDetail; 