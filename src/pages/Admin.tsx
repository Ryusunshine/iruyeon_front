import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthGuard } from '../hooks/useAuthGuard';
import sampleImage from '../sample_Image.webp';


interface AdminMember {
  id?: string;
  name: string;
  phoneNumber: string;
  company: string;
  memberImage: string;
}

const Admin = () => {
  useAuthGuard();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 모든 회원 목록 불러오기
    const fetchMembers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8082/api/v0/admin/member', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('회원 목록을 불러오지 못했습니다.');
        const data = await res.json();
        // data가 배열이거나 data.data가 배열일 수 있음
        const list = Array.isArray(data) ? data : data.data;
        setMembers(list || []);
      } catch (err: any) {
        setError(err.message || '에러 발생');
      } finally {
        setLoading(false);
      }
    };
    // 현재 경로가 /admin/member일 때만 호출
    if (location.pathname === '/admin/member') {
      fetchMembers();
    }
  }, [location.pathname]);

  // 로그아웃 함수
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
      // 실패해도 무시하고 로그아웃 처리
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  // 메뉴 항목
  const menu = [
    { label: '모든 매니저', path: '/admin/member' },
    { label: '승인 대기중 명단', path: '/admin/member/pending' },
    { label: '내 정보 수정', path: '/admin/mypage' },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50">
      {/* 상단바 */}
      <header className="fixed top-0 left-0 w-full h-16 bg-white shadow flex items-center justify-between px-8 z-50 border-b border-pink-100">
        <span className="text-xl font-bold text-black tracking-tight">이루연 관리자</span>
        <button onClick={handleLogout} className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-full font-semibold shadow transition-all">로그아웃</button>
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
          {location.pathname === '/admin/member' && (
            <div>
              <h2 className="text-3xl font-extrabold mb-8 text-black tracking-tight">모든 매니저</h2>
              {/* 표 헤더 */}
              <div className="flex items-center bg-gray-200 rounded-lg px-4 py-3 font-bold text-gray-700 mb-2 text-lg">
                <div className="w-16 text-center">이미지</div>
                <div className="flex-1 text-center">이름</div>
                <div className="flex-1 text-center">전화번호</div>
                <div className="flex-1 text-center">회사명</div>
              </div>
              {loading ? (
                <div className="text-black animate-pulse">불러오는 중...</div>
              ) : error ? (
                <div className="text-red-500 font-semibold">{error}</div>
              ) : (!members || members.length === 0 || members.every(m => !m.name && !m.phoneNumber && !m.company)) ? (
                <div className="text-black">매니저가 없습니다.</div>
              ) : (
                <ul className="space-y-2">
                  {members.map((m, idx) => (
                    <li key={idx} className="flex items-center bg-gray-100 rounded-lg px-4 py-3 shadow-sm text-lg">
                      <div className="w-16 flex justify-center">
                        <img src={m.memberImage || sampleImage} alt="프로필" className="w-12 h-12 rounded-full object-cover border" />
                      </div>
                      <div className="flex-1 text-center truncate cursor-pointer hover:text-blue-600" onClick={() => navigate(`/admin/member/detail/${m.id || idx}`)}>{m.name || '-'}</div>
                      <div className="flex-1 text-center truncate">{m.phoneNumber || '-'}</div>
                      <div className="flex-1 text-center truncate">{m.company || '-'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {/* 승인 대기중 명단 */}
          {location.pathname === '/admin/member/pending' && (
            <PendingMemberList />
          )}
          {/* 관리자 상세 페이지 */}
          {location.pathname.startsWith('/admin/member/detail/') && (
            <AdminMemberDetail />
          )}
          {location.pathname === '/admin/mypage' && (
            <AdminMyPage />
          )}
        </main>
      </div>
    </div>
  );
};

// 승인 대기중 명단 컴포넌트
const PendingMemberList = () => {
  const [pendingMembers, setPendingMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingMembers = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8082/api/v0/admin/member/pending', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('승인 대기중 명단을 불러오지 못했습니다.');
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data;
        setPendingMembers(list || []);
      } catch (err: any) {
        setError(err.message || '에러 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingMembers();
  }, []);

  const handleApprove = async (memberId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8082/api/v0/admin/member/approve/${memberId}`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('승인 처리에 실패했습니다.');
      
      // 승인 후 목록에서 제거
      setPendingMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err: any) {
      setError(err.message || '승인 처리 중 오류 발생');
    }
  };

  const handleReject = async (memberId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8082/api/v0/admin/member/reject/${memberId}`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('거절 처리에 실패했습니다.');
      
      // 거절 후 목록에서 제거
      setPendingMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (err: any) {
      setError(err.message || '거절 처리 중 오류 발생');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-extrabold mb-8 text-black tracking-tight">승인 대기중 명단</h2>
      {/* 표 헤더 */}
      <div className="flex items-center bg-gray-200 rounded-lg px-4 py-3 font-bold text-gray-700 mb-2 text-lg">
        <div className="w-16 text-center">이미지</div>
        <div className="flex-1 text-center">이름</div>
        <div className="flex-1 text-center">전화번호</div>
        <div className="flex-1 text-center">회사명</div>
        <div className="w-32 text-center">작업</div>
      </div>
      {loading ? (
        <div className="text-black animate-pulse">불러오는 중...</div>
      ) : error ? (
        <div className="text-red-500 font-semibold">{error}</div>
      ) : pendingMembers.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-gray-400 text-lg">빈칸</div>
        </div>
      ) : (
        <ul className="space-y-2">
          {pendingMembers.map((member, idx) => (
                            <li key={idx} className="flex items-center bg-gray-100 rounded-lg px-4 py-3 shadow-sm text-lg">
                  <div className="w-16 flex justify-center">
                    <img src={member.memberImage || sampleImage} alt="프로필" className="w-12 h-12 rounded-full object-cover border" />
                  </div>
                  <div className="flex-1 text-center truncate cursor-pointer hover:text-blue-600" onClick={() => navigate(`/admin/member/detail/${member.id || idx}`)}>{member.name || '-'}</div>
                  <div className="flex-1 text-center truncate">{member.phoneNumber || '-'}</div>
                  <div className="flex-1 text-center truncate">{member.company || '-'}</div>
                  <div className="w-32 flex justify-center gap-2">
                    <button
                      onClick={() => handleApprove(member.id || idx.toString())}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => handleReject(member.id || idx.toString())}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                    >
                      거절
                    </button>
                  </div>
                </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// 관리자 회원 상세 페이지 컴포넌트
const AdminMemberDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemberDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const memberId = location.pathname.split('/').pop();
        if (!memberId) throw new Error('회원 ID가 없습니다.');
        
        const res = await fetch(`http://localhost:8082/api/v0/admin/member/detail/${memberId}`, {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('회원 정보를 불러오지 못했습니다.');
        const data = await res.json();
        setMemberData(data.data);
      } catch (err: any) {
        setError(err.message || '에러 발생');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDetail();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            뒤로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-extrabold text-black tracking-tight">회원 상세 정보</h2>
        <button 
          onClick={() => navigate(-1)} 
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          뒤로 가기
        </button>
      </div>
      
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg mb-4">
            <img 
              src={memberData?.image || '/logo192.png'} 
              alt="프로필 이미지" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{memberData?.name || '이름 없음'}</h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">이메일</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{memberData?.email || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">전화번호</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{memberData?.phoneNumber || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">회사명</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-700">{memberData?.company || '-'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">성별</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                {memberData?.gender === 'MALE' ? '남성' : memberData?.gender === 'FEMALE' ? '여성' : '-'}
              </div>
            </div>
          </div>

          {memberData?.status && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">상태</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                {memberData.status === 'ACTIVE' ? '활성' : 
                 memberData.status === 'INACTIVE' ? '비활성' : 
                 memberData.status === 'PENDING' ? '승인 대기' : memberData.status}
              </div>
            </div>
          )}

          {memberData?.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">가입일</label>
              <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                {new Date(memberData.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 관리자 마이페이지 컴포넌트
const AdminMyPage = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState<any>(null);
  const [form, setForm] = useState({ name: '', gender: '', company: '', phoneNumber: '' });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAdminDetail();
  }, []);

  const fetchAdminDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const idStr = localStorage.getItem('id');
      if (!idStr) throw new Error('id가 없습니다.');
      const id = Number(idStr);
      const res = await fetch(`http://localhost:8082/api/v0/admin/member/detail/${id}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('관리자 정보를 불러오지 못했습니다.');
      const data = await res.json();
      setAdminData(data.data);
      setForm({
        name: data.data.name || '',
        gender: data.data.gender || '',
        company: data.data.company || '',
        phoneNumber: data.data.phoneNumber || ''
      });
      if (data.data.image) {
        setImagePreview(data.data.image);
      }
    } catch (e: any) {
      setMessage(e.message || '오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: {[key: string]: boolean} = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.gender) newErrors.gender = true;
    if (!form.company.trim()) newErrors.company = true;
    if (!profileImage && !imagePreview) newErrors.profileImage = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const idStr = localStorage.getItem('id');
      if (!idStr) throw new Error('id가 없습니다.');
      const id = Number(idStr);
      const dto = {
        name: form.name,
        gender: form.gender,
        company: form.company,
        phoneNumber: form.phoneNumber
      };
      const formData = new FormData();
      formData.append('adminDetailRequestDTO', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
      if (profileImage) {
        formData.append('file', profileImage);
      }
      const res = await fetch(`http://localhost:8082/api/v0/admin/member/detail/${id}`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      if (!res.ok) throw new Error('수정에 실패했습니다.');
      setMessage('관리자 정보가 수정되었습니다.');
      setTimeout(() => setMessage(''), 2000);
    } catch (e: any) {
      setMessage(e.message || '수정 중 오류 발생');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-auto mt-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-pink-500 mb-2">관리자 정보 수정</h2>
        <p className="text-gray-600">관리자 정보를 수정할 수 있습니다.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="프로필 이미지" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full cursor-pointer hover:bg-pink-600 transition shadow-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 text-center">
            프로필 이미지를 업로드해주세요 <span className="text-red-500">*</span><br/>
            {errors.profileImage && (
              <span className="text-xs text-red-500">프로필 이미지는 필수입니다.</span>
            )}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-2">이메일</label>
          <input
            type="email"
            value={adminData?.email || ''}
            disabled
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이름 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="이름을 입력하세요"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">이름을 입력해주세요</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">성별 <span className="text-red-500">*</span></label>
          <select
            value={form.gender}
            onChange={e => handleChange('gender', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ${errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          >
            <option value="">성별을 선택하세요</option>
            <option value="MALE">남성</option>
            <option value="FEMALE">여성</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-sm mt-1">성별을 선택해주세요</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">회사명 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.company}
            onChange={e => handleChange('company', e.target.value)}
            placeholder="회사명을 입력하세요"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ${errors.company ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
          />
          {errors.company && (
            <p className="text-red-500 text-sm mt-1">회사명을 입력해주세요</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">전화번호</label>
          <input
            type="tel"
            value={form.phoneNumber}
            disabled
            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {submitting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                처리중...
              </div>
            ) : (
              '수정 완료'
            )}
          </button>
        </div>
      </form>
      {message && (
        <div className="mt-6 text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            message.includes('실패') 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 