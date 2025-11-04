import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/Common/TopBar';

interface MemberForm {
  id: number;
  email: string;
  pwd: string;
  name: string;
  phoneNumber: string;
  gender: string;
  company: string;
}

const MemberDetail = () => {
  const [form, setForm] = useState<MemberForm>({
    id: 0,
    email: '',
    pwd: '',
    name: '',
    phoneNumber: '',
    gender: '',
    company: ''
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const id = Number(localStorage.getItem('id'));
  const navigate = useNavigate();

  // 페이지 로드 시 회원 정보 가져오기
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`http://localhost:8082/api/v0/member/detail/${id}`);
        if (!res.ok) throw new Error('회원 정보 가져오기 실패');
        const data = await res.json();
        if (data.data) {
          setForm({
            id: data.data.id, // 여기서 id 가져오기
            email: data.data.email,
            pwd: '',
            name: data.data.name,
            phoneNumber: data.data.phoneNumber,
            gender: data.data.gender === 'FEMALE' ? '여자' : data.data.gender === 'MALE' ? '남자' : '',
            company: data.data.company
          });
          setImagePreview(data.data.memberImage|| null);
        }
      } catch (err) {
        console.error(err);
        setMessage('회원 정보를 가져오는데 실패했습니다.');
      }
    };
    fetchMember();
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
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (form.pwd && !/^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[\da-z@$!%*#?&]{8,20}$/.test(form.pwd)) newErrors.pwd = true;
    if (!form.name.trim()) newErrors.name = true;
    if (!form.phoneNumber.trim()) newErrors.phoneNumber = true;
    if (!form.gender) newErrors.gender = true;
    if (!form.company.trim()) newErrors.company = true;
    if (!imagePreview && !profileImage) newErrors.profileImage = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const dto = {
        pwd: form.pwd,
        name: form.name,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
        company: form.company
      };
      const formData = new FormData();
      formData.append('memberDetailRequestDto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
      if (profileImage) formData.append('file', profileImage);

      // 여기서 form.id 사용
      const res = await fetch(`http://localhost:8082/api/v0/member/detail/${id}`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('수정 실패');
      const responseData = await res.json();
      setMessage('수정이 완료되었습니다!');
      if (responseData.data) {
        setForm(prev => ({ ...prev, ...responseData.data }));
        setImagePreview(responseData.data.image?.uri || null);
      }
      navigate("/pending");
    } catch (err) {
      console.error(err);
      setMessage('수정이 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 py-10">
      <TopBar onLogout={handleLogout} />
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mt-10">
        <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-6 text-pink-500">프로필 수정하기</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

        <div>
        <div className="flex flex-col items-center gap-1">
            <label
              className={`w-36 h-36 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer overflow-hidden border-2 ${
                errors ? 'border-pink-500' : 'border-pink-200'
              } hover:border-pink-400 transition`}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="프로필 이미지"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">사진추가</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>
        
          <div>
            <label className="block text-gray-700 font-semibold mb-2">이메일</label>
            <input
              type="email"
              value={form.email}
              readOnly
              className="w-full border border-gray-300 bg-gray-100 text-gray-500 rounded-lg p-3 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">비밀번호</label>
            <input
              type="password"
              value={form.pwd}
              onChange={e => handleChange('pwd', e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none ${errors.pwd ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="영문, 숫자, 특수문자 포함 8~20자"
            />
            {errors.pwd && <p className="text-red-500 text-sm mt-1">8~20자, 영문+숫자+특수문자를 포함해야 합니다.</p>}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">이름</label>
            <input
              type="text"
              value={form.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">전화번호</label>
            <input
              type="tel"
              value= {form.phoneNumber}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none ${errors.phoneNumber ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">성별</label>
            <select
              value={form.gender} 
              onChange={e => handleChange('gender', e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none ${
                errors.gender ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">선택</option>
              <option value="FEMALE">여자</option>
              <option value="MALE">남자</option>
            </select>
            {errors['gender'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">회사명</label>
            <input
              type="text"
              value={form.company || ''}
              onChange={e => handleChange('company', e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none ${errors.company ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition disabled:opacity-50"
          >
            {submitting ? '처리 중...' : '수정 완료'}
          </button>
        </form>

        {message && (
          <div className="mt-6 text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              message.includes('실패') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
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
