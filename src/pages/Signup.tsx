import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatPhoneNumber(phone: string) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
}

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
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
  const [emailCheckMsg, setEmailCheckMsg] = useState('');
  const [emailChecking, setEmailChecking] = useState(false);

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
    if (!form.email.trim() || !/^[\w-.]+@[\w-]+\.[\w-.]+$/.test(form.email)) newErrors.email = true;
    if (!form.pwd.trim() || !/^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[\da-z@$!%*#?&]{8,20}$/.test(form.pwd)) newErrors.pwd = true;
    if (!form.name.trim()) newErrors.name = true;
    if (!form.phoneNumber.trim()) newErrors.phoneNumber = true;
    if (!form.gender) newErrors.gender = true;
    if (!form.company.trim()) newErrors.company = true;
    if (!profileImage) newErrors.profileImage = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleEmailCheck = async () => {
    setEmailChecking(true);
    setEmailCheckMsg('');
    try {
      const res = await fetch('http://localhost:8082/api/v0/email/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      if (!res.ok) throw new Error('중복확인 실패');
      const data = await res.json();
      if (data.data === true) {
        setEmailCheckMsg('이미 존재하는 이메일입니다.');
      } else {
        setEmailCheckMsg('사용 가능한 이메일입니다.');
      }
    } catch (e) {
      setEmailCheckMsg('중복확인 중 오류 발생');
    } finally {
      setEmailChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      const dto = {
        email: form.email,
        pwd: form.pwd,
        name: form.name,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
        company: form.company
      };
      const formData = new FormData();
      formData.append('signUpRequestDto', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
      if (profileImage) {
        formData.append('file', profileImage);
      }
      const res = await fetch('http://localhost:8082/api/v0/signup', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('회원가입 실패');
      setMessage('회원가입이 완료되었습니다!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage('회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 py-10">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mt-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-pink-500 mb-2">회원가입</h2>
          <p className="text-gray-600">모든 항목을 입력해주세요</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-200 shadow-lg">
                {imagePreview ? (
                  <img src={imagePreview} alt="프로필 이미지" className="w-full h-full object-cover" />
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
            <label className="block text-sm font-medium text-gray-700 mb-2">이메일 <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="이메일을 입력하세요"
                className={`flex-1 min-w-0 p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                style={{ maxWidth: 480 }}
              />
              <button
                type="button"
                onClick={handleEmailCheck}
                disabled={emailChecking || !form.email.trim()}
                className="w-32 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailChecking ? '확인중...' : '중복확인'}
              </button>
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">올바른 이메일을 입력해주세요</p>
            )}
            {emailCheckMsg && (
              <p className={`text-sm mt-1 ${emailCheckMsg.includes('가능') ? 'text-green-600' : 'text-red-500'}`}>{emailCheckMsg}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={form.pwd}
              onChange={e => handleChange('pwd', e.target.value)}
              placeholder="8~20자, 영문+숫자+특수문자 포함"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ${errors.pwd ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            <div className="flex flex-col gap-1 mt-2">
              <span className={`flex items-center gap-1 text-sm ${form.pwd.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                <span>✓</span>8자 이상
              </span>
              <span className={`flex items-center gap-1 text-sm ${/^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])/.test(form.pwd) ? 'text-green-600' : 'text-gray-400'}`}>
                <span>✓</span>영문, 숫자, 특수문자 포함
              </span>
            </div>
            {errors.pwd && (
              <p className="text-red-500 text-sm mt-1">8~20자, 영문+숫자+특수문자를 포함해야 합니다.</p>
            )}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">전화번호 <span className="text-red-500">*</span></label>
            <input
              type="tel"
              value={formatPhoneNumber(form.phoneNumber)}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              placeholder="전화번호를 입력하세요"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition ${errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">전화번호를 입력해주세요</p>
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
                '회원가입'
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

export default Signup; 