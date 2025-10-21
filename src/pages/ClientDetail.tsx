import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/Common/TopBar';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { handleUnauthorized } from '../utils/auth';
import sampleImage from '../sample_Image.webp';

interface ImageResponseDTO {
  id: number;
  uri: string;
}

interface ClientDetailData {
  id: number;
  name: string;
  address: string;
  birthYear?: number;
  age?: string;
  highSchool?: string;
  university?: string;
  major?: string;
  property?: string;
  religion?: string;
  currentJob?: string;
  previousJob?: string;
  jobDetail?: string;
  info?: string;
  homeTown?: string;
  gender?: string;
  relationship?: string;
  status?: string;
  ageGapLower?: number;
  ageGapHigher?: number;
  interest?: string;
  idealType?: string;
  personality?: string;
  hasChild?: boolean;
  hobby?: string;
  profileImages?: ImageResponseDTO[];
  families?: Array<{
    id: number;
    name: string;
    address?: string;
    birthYear?: number;
    university?: string;
    major?: string;
    property?: string;
    religion?: string;
    currentJob?: string;
    previousJob?: string;
    jobDetail?: string;
    info?: string;
    homeTown?: string;
    gender?: string;
    relationship?: string;
  }>;
}


const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [clientData, setClientData] = useState<ClientDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAuthGuard();

  useEffect(() => {
    const fetchClientDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8082/api/v0/client/${id}`, {
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
        setClientData(data.data || data);
      } catch (err: any) {
        console.error('Error fetching client detail:', err);
        setError('정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClientDetail();
    }
  }, [id]);

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
          <p className="text-gray-600">정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 flex flex-col items-center justify-center">
        <TopBar currentUser={currentUser} onLogout={handleLogout} />
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || '정보를 찾을 수 없습니다.'}</p>
          <button 
            onClick={() => navigate('/client')} 
            className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <TopBar currentUser={currentUser} onLogout={handleLogout} />
      <div className="bg-white rounded-2xl shadow-xl px-4 py-6 w-full max-w-3xl mt-20 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-black-500">상세 정보</h2>
        

        <div className="flex gap-4 justify-center mb-6 flex-wrap">
          {Array.isArray(clientData.profileImages) && clientData.profileImages.length > 0 ? (
            clientData.profileImages
              .slice() // 원본 배열 보호
              .sort((a, b) => {
                // uri가 있는 이미지를 먼저 보여주고, id 기준으로 정렬
                if (!!a.uri && !b.uri) return -1;
                if (!a.uri && !!b.uri) return 1;
                return a.id - b.id;
              })
              .map((image, index) => (
                <div key={image.id || index} className="flex flex-col items-center">
                  <div className="w-52 h-52 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-pink-200 overflow-hidden">
                    <img
                      src={image.uri || sampleImage} // uri 없으면 기본 이미지
                      alt="프로필 이미지"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // 무한 루프 방지
                        e.currentTarget.src = sampleImage;
                      }}
                    />
                  </div>
                </div>
              ))
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-52 h-52 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-pink-200 overflow-hidden">
                <img
                  src={sampleImage} // 기본 이미지
                  alt="기본 프로필"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>



        {/* 기본 정보 */}
        <div className="flex flex-col gap-4 w-full max-h-[70vh] overflow-y-auto px-2">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">이름</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.name || '정보 없음'}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">나이</label>
            <div className="border p-3 rounded text-lg bg-gray-50"> {clientData.age}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">성별</label>
            <div className="border p-3 rounded text-lg bg-gray-50">
              {clientData.gender === 'MALE' ? '남성' : clientData.gender === 'FEMALE' ? '여성' : clientData.gender || '정보 없음'}
            </div>
          </div>
          
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">거주지</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.address || '정보 없음'}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">현재 직업</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.currentJob || '정보 없음'}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">이전 직업</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.previousJob || '정보 없음'}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">직업 상세</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.jobDetail || '정보 없음'}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">대학교</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.university || '정보 없음'}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">전공</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.major || '정보 없음'}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">고향</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.homeTown || '정보 없음'}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">재산</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.property || '정보 없음'}</div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold">종교</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.religion || '정보 없음'}</div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold">성격</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.interest || '정보 없음'}</div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold">취미</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.hobby || '정보 없음'}</div>
          </div>

          {clientData.ageGapLower !== undefined && clientData.ageGapHigher !== undefined && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold">원하는 상대방 나이 범위</label>
              <div className="border p-3 rounded text-lg bg-gray-50">
                {`${clientData.ageGapLower}세 ~ ${clientData.ageGapHigher}세`}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="font-semibold">이상형</label>
            <div className="border p-3 rounded text-lg bg-gray-50">{clientData.idealType || '정보 없음'}</div>
          </div>

          {/* 추가 정보 */}
          {clientData.info && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold">소개</label>
              <div className="border p-3 rounded text-lg bg-gray-50">{clientData.info}</div>
            </div>
          )}

          {/* 가족 정보 */}
          {Array.isArray(clientData.families) && clientData.families.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold">가족 정보</label>
              <div className="border p-3 rounded text-lg bg-gray-50">
                {clientData.families.map((member, index) => {
                  const currentYear = new Date().getFullYear();
                  const age = member.birthYear ? currentYear - member.birthYear : 0;
                  
                  return (
                    <div key={member.id || index} className="mb-4 last:mb-0 p-3 bg-white rounded border">
                      <div className="font-semibold text-lg mb-2">{member.relationship || '관계 정보 없음'}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">이름:</span> {member.name}</div>
                        <div><span className="font-medium">나이:</span> {age}세 ({member.birthYear}년생)</div>
                        <div><span className="font-medium">성별:</span> {member.gender === 'MALE' ? '남성' : member.gender === 'FEMALE' ? '여성' : member.gender}</div>
                        <div><span className="font-medium">직업:</span> {member.currentJob || '정보 없음'}</div>
                        <div><span className="font-medium">이전 직업:</span> {member.previousJob || '정보 없음'}</div>
                        <div><span className="font-medium">대학교:</span> {member.university || '정보 없음'}</div>
                        <div><span className="font-medium">전공:</span> {member.major || '정보 없음'}</div>
                        <div><span className="font-medium">주소:</span> {member.address || '정보 없음'}</div>
                        <div><span className="font-medium">고향:</span> {member.homeTown || '정보 없음'}</div>
                        <div><span className="font-medium">재산:</span> {member.property || '정보 없음'}</div>
                        <div><span className="font-medium">종교:</span> {member.religion || '정보 없음'}</div>
                      </div>
                      {member.info && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="font-medium">소개:</div>
                          <div className="text-sm text-gray-600">{member.info}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 뒤로 가기 버튼 */}
        <div className="flex justify-center mt-6">
          <button 
            onClick={() => navigate('/client')} 
            className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail; 