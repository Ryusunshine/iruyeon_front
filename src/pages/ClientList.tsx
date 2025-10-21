import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/Common/TopBar';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { handleUnauthorized } from '../utils/auth';
import sampleImage from '../sample_Image.webp';

interface ImageResponseDTO {
  id: number;
  uri: string;
}

interface ClientResponseDTO {
  memberId: number;
  memberName: string;
  memberImage: ImageResponseDTO;
  clientId: number;
  clientName: string;  
  age: string;
  address: string;
  university: string;
  currentJob: string;
  clientImage: ImageResponseDTO;
}

const ClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientResponseDTO[]>([]);
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
        const res = await fetch('http://localhost:8082/api/v0/client', {
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
        console.log('API Response:', data); // 디버깅용 로그
        
        // 백엔드 Response<Page<MemberClientResponseDTO>> 형태 처리
        if (data && data.data && data.data.content && Array.isArray(data.data.content)) {
          // Spring Boot Pageable 응답: data.data.content
          setClients(data.data.content);
          // 페이징 정보 설정
          if (data.data.totalPages !== undefined) {
            setTotalPages(data.data.totalPages);
          }
        } else if (data && Array.isArray(data.content)) {
          // 직접 Page 형태일 경우
          setClients(data.content);
          if (data.totalPages !== undefined) {
            setTotalPages(data.totalPages);
          }
        } else if (data && Array.isArray(data)) {
          // 배열 형태일 경우
          setClients(data);
        } else if (data && Array.isArray(data.data)) {
          // 일반적인 API 응답 형태일 경우
          setClients(data.data);
        } else {
          console.warn('Unexpected data format:', data);
          setClients([]);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        // 백엔드 서버가 실행되지 않은 경우 임시 데이터 사용
        setError('서버 연결에 실패했습니다. 임시 데이터를 표시합니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // 백엔드에서 페이징된 데이터를 받으므로 클라이언트 사이드 페이징 불필요
  const pagedClients = clients;

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

  const token = localStorage.getItem('token');
  const currentUser = token ? {
    id: localStorage.getItem('userId'),
    isAdmin: localStorage.getItem('role') === 'ROLE_ADMIN'
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 flex flex-col items-center justify-center">
        <TopBar currentUser={currentUser} onLogout={handleLogout} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 flex flex-col items-center justify-center">
        <TopBar currentUser={currentUser} onLogout={handleLogout} />
        <div className="text-center">
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
      <h2 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight mt-20">이루연 회원 리스트</h2>
      {clients.length > 0 && (
        <div className="w-full max-w-6xl flex justify-end mb-6">
          <button
            onClick={() => navigate('/client/new')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-3 rounded-lg font-bold shadow"
          >
            회원 프로필 생성하기
          </button>
        </div>
      )}
      
      {clients.length === 0 ? (
        <div className="text-center flex-1 flex flex-col items-center justify-center w-full">
          <p className="text-gray-600 text-lg mb-6">등록된 회원이 없습니다.</p>
          <button
            onClick={() => navigate('/client/new')}
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-bold shadow"
          >
            회원 프로필 생성하기
          </button>
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {pagedClients.map(client => (
          <div 
            key={client.clientId} 
            className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl cursor-pointer"
            onClick={() => navigate(`/client/detail/${client.clientId}`)}
          >
            <div className="flex items-center gap-3 mb-3 w-full justify-center">
              <div className="w-14 h-14 rounded-full border-2 border-pink-400 flex items-center justify-center bg-gradient-to-tr from-pink-200 to-yellow-100 shadow">
                    <img 
                      src={client.memberImage?.uri || sampleImage}
                      alt={client.memberName} 
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // 무한 루프 방지
                        e.currentTarget.src = sampleImage;
                      }}
                    />
              </div>
              <div className="flex flex-col justify-center">
                <div className="font-bold text-base text-black-700 leading-tight">{client.memberName}</div>
              </div>
            </div>
            <div className="flex justify-center w-full mb-3">
                  <img 
                    src={client.clientImage?.uri || sampleImage} 
                    alt={client.clientName} 
                    className="w-32 h-32 rounded-full object-cover border-4 border-pink-200 shadow-lg"
                    onError={(e) => {
                      e.currentTarget.onerror = null; // 무한 루프 방지
                      e.currentTarget.src = sampleImage;
                    }}
                  />
            </div>
            <div className="w-full text-center">
              <div className="font-bold text-lg text-black-600 mb-1">{client.clientName} <span className="text-gray-400 text-base">({client.age}세)</span></div>
                  <div className="text-gray-600 text-sm mb-0.5">{client.currentJob || '직업 정보 없음'}</div>
                  <div className="text-gray-500 text-xs mb-0.5">{client.university || '학교 정보 없음'}</div>
                  <div className="text-gray-400 text-xs">{client.address || '주소 정보 없음'}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-10">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600 font-bold disabled:opacity-50"
        >
          이전
        </button>
        <span className="px-4 py-2 font-semibold text-pink-500">{page} / {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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

export default ClientList; 