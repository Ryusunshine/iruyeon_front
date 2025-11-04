import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/Common/TopBar';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { handleUnauthorized } from '../utils/auth';
import sampleImage from '../sample_Image.webp';

interface ClientResponse {
  id: number;
  name: string;
  address: string;
  age: string;
  university: string;
  job: string;
  profileImage: string;
}

const MyClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useAuthGuard();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8082/api/v0/client/my', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // ✅ 응답 구조: data -> content[]
        if (data && data.data && Array.isArray(data.data.content)) {
          setClients(data.data.content);
          setTotalPages(data.data.totalPages || 1);
        } else {
          console.warn('⚠️ Unexpected data format:', data);
          setClients([]);
        }

      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('서버 연결에 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8082/api/v0/logout', {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const token = localStorage.getItem('token');
  const currentUser = token
    ? {
        id: localStorage.getItem('id'),
        isAdmin: localStorage.getItem('role') === 'ROLE_ADMIN',
      }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100">
        <TopBar currentUser={currentUser} onLogout={handleLogout} />
        <div className="text-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100">
        <TopBar currentUser={currentUser} onLogout={handleLogout} />
        <div className="text-center mt-10">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 flex flex-col items-center py-10">
      <TopBar currentUser={currentUser} onLogout={handleLogout} />
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight mt-20">
        내 회원 목록
      </h2>

      {clients.length === 0 ? (
        <div className="text-center flex-1 flex flex-col items-center justify-center w-full">
          <p className="text-gray-600 text-lg mb-6">등록된 회원이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl cursor-pointer"
                onClick={() => navigate(`/client/detail/${client.id}`)}
              >
                <img
                  src={client.profileImage|| sampleImage}
                  alt={client.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-pink-200 shadow-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = sampleImage;
                  }}
                />
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800 mb-1">
                    {client.name}
                  </div>
                  <div className="text-gray-600 text-sm mb-0.5">
                    {client.job || '직업 정보 없음'}
                  </div>
                  <div className="text-gray-500 text-xs mb-0.5">
                    {client.university || '학교 정보 없음'}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {client.address || '주소 정보 없음'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-bold disabled:opacity-50"
            >
              이전
            </button>
            <span className="px-4 py-2 font-semibold text-pink-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-bold disabled:opacity-50"
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyClientList;
