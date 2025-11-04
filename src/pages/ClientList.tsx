import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/Common/TopBar';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { handleUnauthorized } from '../utils/auth';
import sampleImage from '../sample_Image.webp';

interface ClientResponse {
  clientId: number;
  clientName: string;
  address: string;
  age: string;
  university: string;
  job: string;
  clientImage: string;
  memberName: string;
  memberImage: string;
}

interface SearchRequestDTO {
  job: string[] | null;
  minBirthYear: number | null;
  maxBirthYear: number | null;
  eduLevel: string[] | null;
  universities: string[] | null;
  gender: string | null;
  maritalStatus: string[] | null;
}

const ClientList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchParams, setSearchParams] = useState<SearchRequestDTO>({
    job: null,
    minBirthYear: null,
    maxBirthYear: null,
    eduLevel: null,
    universities: null,
    gender: null,
    maritalStatus: null,
  });

  const [openSection, setOpenSection] = useState<string | null>(null);

  useAuthGuard();

  useEffect(() => {
    fetchClients();
  }, [page]);
  
  const handleSearch = () => {
    setPage(1); // 검색 시 항상 첫 페이지부터
    fetchClients(searchParams);
  };
  
  const fetchClients = async (dto?: SearchRequestDTO) => {
    try {
      setLoading(true);
      setError(null);
  
      const token = localStorage.getItem('token');
      const res = await fetch(
        dto
          ? `http://localhost:8082/api/v0/client/search?page=${page - 1}`
          : `http://localhost:8082/api/v0/client?page=${page - 1}`,
        {
          method: dto ? 'POST' : 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: dto ? JSON.stringify(dto) : undefined,
        }
      );
  
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
  
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
  
      const data = await res.json();
      if (data && data.data && Array.isArray(data.data.content)) {
        setClients(data.data.content);
        setTotalPages(data.data.totalPages || 1);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (field: keyof SearchRequestDTO, value: string) => {
    setSearchParams(prev => {
      const current = prev[field] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

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

  const jobList = [
    { label: '대기업', value: 'LARGE_COMPANY' },
    { label: '중견기업', value: 'MID_SIZED_COMPANY' },
    { label: '중소기업', value: 'SMALL_COMPANY' },
    { label: '공기업/기관', value: 'PUBLIC_INSTITUTION' },
    { label: '교육', value: 'EDUCATION' },
    { label: '군인', value: 'SOLDIER' },
    { label: '전문직', value: 'PROFESSIONAL' },
    { label: '프리랜서', value: 'FREELANCER' },
    { label: '기타', value: 'OTHER' },
  ];
  const eduList = ['고졸', '전문대', '학사', '석사', '박사'];
  const maritalList = ['초혼', '재혼'];

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
      <h2 className="text-3xl font-extrabold text-gray-800 mb-4 tracking-tight mt-10">
        회원 목록
      </h2>

          {/* 🔹 아코디언 검색바 (간결하고 공간 효율) */}
      <div className="bg-white shadow-md rounded-xl p-4 w-full max-w-6xl mb-8">

      {/* 직업 */}
      <div className="mb-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('job')}>
          <p className="font-semibold text-gray-700">직업</p>
          <span>{openSection === 'job' ? '−' : '+'}</span>
        </div>
        {openSection === 'job' && (
          <div className="flex flex-wrap gap-2 mt-2">
            {jobList.map(job => (
              <button
                key={job.value}
                onClick={() => toggleSelection('job', job.value)}
                className={`px-2 py-1 rounded-full text-sm transition border ${
                  (searchParams.job || []).includes(job.value)                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {job.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 성별 */}
      <div className="mb-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('gender')}>
          <p className="font-semibold text-gray-700">성별</p>
          <span>{openSection === 'gender' ? '−' : '+'}</span>
        </div>
        {openSection === 'gender' && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {['남자', '여자'].map(g => (
              <button
                key={g}
                onClick={() => setSearchParams(prev => ({ ...prev, gender: g }))}
                className={`px-3 py-1 rounded-full text-sm transition border ${
                  searchParams.gender === g
                    ? 'bg-blue-400 text-white border-blue-400'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 출생년도 */}
      <div className="mb-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('birthYear')}>
          <p className="font-semibold text-gray-700">출생년도</p>
          <span>{openSection === 'birthYear' ? '−' : '+'}</span>
        </div>
        {openSection === 'birthYear' && (
          <div className="flex gap-2 mt-2 flex-wrap">
            <input
              type="number"
              placeholder="최소년도"
              value={searchParams.minBirthYear || ''}
              onChange={e =>
                setSearchParams(prev => ({ ...prev, minBirthYear: Number(e.target.value) }))
              }
              className="border rounded p-2 w-32"
            />
            <span className="self-center">~</span>
            <input
              type="number"
              placeholder="최대년도"
              value={searchParams.maxBirthYear || ''}
              onChange={e =>
                setSearchParams(prev => ({ ...prev, maxBirthYear: Number(e.target.value) }))
              }
              className="border rounded p-2 w-32"
            />
          </div>
        )}
      </div>

      {/* 학력 */}
      <div className="mb-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('eduLevel')}>
          <p className="font-semibold text-gray-700">학력</p>
          <span>{openSection === 'eduLevel' ? '−' : '+'}</span>
        </div>
        {openSection === 'eduLevel' && (
          <div className="flex flex-wrap gap-2 mt-2">
            {eduList.map(level => (
              <button
                key={level}
                onClick={() => toggleSelection('eduLevel', level)}
                className={`px-2 py-1 rounded-full text-sm transition border ${
                  (searchParams.eduLevel || []).includes(level)
                  ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 결혼 여부 */}
      <div className="mb-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSection('maritalStatus')}>
          <p className="font-semibold text-gray-700">결혼 여부</p>
          <span>{openSection === 'maritalStatus' ? '−' : '+'}</span>
        </div>
        {openSection === 'maritalStatus' && (
          <div className="flex flex-wrap gap-2 mt-2">
            {maritalList.map(status => (
              <button
                key={status}
                onClick={() => toggleSelection('maritalStatus', status)}
                className={`px-2 py-1 rounded-full text-sm transition border ${
                  (searchParams.maritalStatus || []).includes(status)
                  ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={handleSearch}
          className="bg-pink-500 text-white px-5 py-2 rounded-lg hover:bg-pink-600 transition"
        >
          검색하기
        </button>
      </div>
      </div>
      {clients.length === 0 ? (
        <div className="text-center flex-1 flex flex-col items-center justify-center w-full">
          <p className="text-gray-600 text-lg mb-6">등록된 회원이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
            {clients.map((client) => (
              <div
                key={client.clientId}
                className="bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl cursor-pointer"
                onClick={() => navigate(`/client/detail/${client.clientId}`)}
              >
                {/* 멤버 정보 */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={client.memberImage || sampleImage}
                    alt={client.memberName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = sampleImage;
                    }}
                  />
                  <span className="text-base font-semibold text-gray-800">
                    {client.memberName || '회원 이름 없음'}
                  </span>
                </div>

                {/* 기존 클라이언트 프로필 */}
                <img
                  src={client.clientImage || sampleImage}
                  alt={client.clientName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-pink-200 shadow-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = sampleImage;
                  }}
                />
                <div className="text-center">
                  <div className="font-bold text-lg text-gray-800 mb-1">
                    {client.clientName}
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

export default ClientList;
