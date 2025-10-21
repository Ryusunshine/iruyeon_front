import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/Common/TopBar';
import { useAuthGuard } from '../hooks/useAuthGuard';

// 전화번호 포맷 함수 추가
function formatPhoneNumber(phone: string) {
  if (!phone) return '';
  // 숫자만 남기기
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}

const MemberDetail = () => {
  const navigate = useNavigate();
  const [memberData, setMemberData] = useState<any>(null);
  const [form, setForm] = useState({ name: '', gender: '', company: '', phoneNumber: '' });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useAuthGuard();

  useEffect(() => {
    fetchMemberDetail();
  }, []);

  const fetchMemberDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const idStr = localStorage.getItem('id');
      if (!idStr) throw new Error('id가 없습니다.');
      const id = Number(idStr);
      const res = await fetch(`http://localhost:8082/api/v0/member/detail/${id}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch member detail');
      }

      const data = await res.json();
      setMemberData(data.data);
      setForm({
        name: data.data.name || '',
        gender: '',
        company: data.data.company || '',
        phoneNumber: data.data.phoneNumber || ''
      });
      if (data.data.image) {
        setImagePreview(data.data.image);
      }
    } catch (error: any) {
      console.error('Error fetching member detail:', error);
    } finally {
      setLoading(false);
    }
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
    } catch (e) {}
    finally {
      localStorage.clear();
      navigate('/login');
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

      // 2. 정보(JSON) 전송
      const dto = {
        name: form.name,
        gender: form.gender,
        company: form.company,
        phoneNumber: form.phoneNumber
      };
      const formData = new FormData();
      formData.append('memberDetailRequestDTO', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
      if (profileImage) {
        formData.append('file', profileImage);
      }
      const res = await fetch(`http://localhost:8082/api/v0/member/detail/${id}`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('수정에 실패했습니다.');
      }

      setMessage('승인 대기중입니다.');
      setTimeout(() => navigate('/pending'), 1500);
    } catch (error) {
      console.error('Error updating member detail:', error);
      setMessage('수정에 실패했습니다.');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 flex flex-col items-center py-10">
      <TopBar currentUser={currentUser} onLogout={handleLogout} />
      
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mt-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-pink-500 mb-2">회원 정보 수정</h2>
          <p className="text-gray-600">추가 정보를 입력해주세요</p>
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
              value={memberData?.email || ''}
              disabled
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="이름을 입력하세요"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ${
                errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">이름을 입력해주세요</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">전화번호</label>
            <input
              type="tel"
              value={formatPhoneNumber(form.phoneNumber)}
              disabled
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              성별 <span className="text-red-500">*</span>
            </label>
            <select
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ${
                errors.gender ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              회사명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="회사명을 입력하세요"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ${
                errors.company ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.company && (
              <p className="text-red-500 text-sm mt-1">회사명을 입력해주세요</p>
            )}
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
    </div>
  );
};

export default MemberDetail; 