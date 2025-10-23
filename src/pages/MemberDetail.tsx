import React, { useState, useEffect } from 'react';

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
  const memberId = Number(localStorage.getItem('id'));
  // 페이지 로드 시 회원 정보 가져오기
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch(`http://localhost:8082/api/v0/member/detail/me?memberId=${memberId}`);
        if (!res.ok) throw new Error('회원 정보 가져오기 실패');
        const data = await res.json();
        if (data.data) {
          setForm({
            id: data.data.id, // 여기서 id 가져오기
            email: data.data.email,
            pwd: '',
            name: data.data.name,
            phoneNumber: data.data.phoneNumber,
            gender: data.data.gender,
            company: data.data.company
          });
          setImagePreview(data.data.image?.uri || null);
        }
      } catch (err) {
        console.error(err);
        setMessage('회원 정보를 가져오는데 실패했습니다.');
      }
    };
    fetchMember();
  }, []);

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
      const res = await fetch(`http://localhost:8082/api/v0/member/detail/${memberId}`, {
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
    } catch (err) {
      console.error(err);
      setMessage('수정이 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100 py-10">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mt-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-pink-500 mb-2">마이페이지</h2>
          <p className="text-gray-600">회원 정보를 확인 및 수정할 수 있습니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">전화번호</label>
            <input
              type="tel"
              value={formatPhoneNumber(form.phoneNumber)}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none ${errors.phoneNumber ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">성별</label>
            <select
              value={form.gender}
              onChange={e => handleChange('gender', e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none ${errors.gender ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">성별을 선택하세요</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">회사명</label>
            <input
              type="text"
              value={form.company}
              onChange={e => handleChange('company', e.target.value)}
              className={`w-full border rounded-lg p-3 focus:outline-none ${errors.company ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">프로필 이미지</label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-200">
                {imagePreview ? (
                  <img src={imagePreview} alt="프로필" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
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
