import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/Common/TopBar';
import { useAuthGuard } from '../hooks/useAuthGuard';

const jobList = [
  '대기업', '중견기업', '중소기업',
  '간호사', '건설', '경영', '공기업/기관', '교육', '군인', '농업',
  '문화/예술', '방송', '부동산/임대', '서비스직', '엔터테인먼트', '연구원', '개발원', '운동', '의사',
  '판사', '검사', '변호사', '회계사', '세무사', '프리랜서', '기타'
];
const eduLevelList = [
  '고졸', '전문대', '학사', '석사', '박사', '기타'
];
const religionList = [
  '무교', '기독교', '천주교', '불교', '기타'
];
const marriageTypeList = ['초혼', '재혼'];
// const yesNoList = ['예', '아니오'];
const relationOptions = [
  { label: '부', value: 'FATHER' },
  { label: '모', value: 'MOTHER' },
  { label: '오빠/형', value: 'OLDER_BROTHER' },
  { label: '누나/언니', value: 'OLDER_SISTER' },
  { label: '여동생', value: 'YOUNGER_SISTER' },
  { label: '남동생', value: 'YOUNGER_BROTHER' },
];

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part) return part.split(';').shift();
  }
  return undefined;
}

const ProfileForm = () => {
  const [form, setForm] = useState<{
    name: string;
    phoneNumber: string;
    address: string;
    birthYear: string;
    job: string;
    jobDetail: string;
    eduLevel: string;
    university: string;
    highSchool: string;
    major: string;
    maritalStatus: string;
    height: string;
    property: string;
    religion: string;
    currentJob: string;
    previousJob: string;
    info: string;
    homeTown: string;
    gender: string;
    status: string;
    minPreferredAge: string;
    maxPreferredAge: string;
    hobby: string;
    idealType: string[];
    personality: string[];
    hasChild: string;
    childCnt: string;
    etc: string;
  }>({
    name: '',
    phoneNumber: '',
    address: '',
    birthYear: '',
    job: jobList[0],
    jobDetail: '',
    eduLevel: eduLevelList[0],
    highSchool: '',
    university: '',
    major: '',
    maritalStatus: marriageTypeList[0],
    height: '',
    property: '',
    religion: religionList[0],
    currentJob: '',
    previousJob: '',
    info: '',
    homeTown: '',
    gender: '',
    status: '',
    minPreferredAge: '',
    maxPreferredAge: '',
    hobby: '',
    idealType: [],
    personality: [],
    hasChild: '아니오',
    childCnt: '',
    etc: '',
  });
  const [family, setFamily] = useState([
    { name: '', relation: '', job: '', education: '', age: '', religion: '' }
  ]);
  const [photos, setPhotos] = useState<(File | null)[]>([null, null, null]);
  const [photoUrls, setPhotoUrls] = useState<(string | null)[]>([null, null, null]);
  const [errors, setErrors] = useState<{[key:string]: boolean}>({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 생년월일 드롭박스용 state
  const years = Array.from({length: 81}, (_, i) => String(2005 - i));
  // const months = Array.from({length: 12}, (_, i) => String(i+1).padStart(2, '0'));
  // const days = Array.from({length: 31}, (_, i) => String(i+1).padStart(2, '0'));
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');

  // 가족 정보용 출생년도 드롭박스
  const familyBirthYears = Array.from({length: 81}, (_, i) => String(2005 - i));

  // 생년월일 드롭박스 값이 바뀔 때 form.birth에 YYYY-MM-DD로 저장
  useEffect(() => {
    if (birthYear && birthMonth && birthDay) {
      setForm(f => ({ ...f, birth: `${birthYear}-${birthMonth}-${birthDay}` }));
    } else {
      setForm(f => ({ ...f, birth: '' }));
    }
  }, [birthYear, birthMonth, birthDay]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[ProfileForm] token:', token);
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

  const handlePhotoChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newPhotos = [...photos];
      const newPhotoUrls = [...photoUrls];
      newPhotos[idx] = e.target.files[0];
      newPhotoUrls[idx] = URL.createObjectURL(e.target.files[0]);
      setPhotos(newPhotos);
      setPhotoUrls(newPhotoUrls);
    }
  };

  const handleFamilyChange = (idx: number, key: string, value: string) => {
    setFamily(fam => fam.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  };

  const addFamily = () => {
    if (family.length < 5) setFamily(fam => [...fam, { name: '', relation: '', job: '', education: '', age: '', religion: '' }]);
  };
  const removeFamily = (idx: number) => {
    setFamily(fam => fam.filter((_, i) => i !== idx));
  };

  const handleChange = (key: string, value: any) => {
    if (key === 'personality') {
      setForm(f => ({ ...f, personality: value }));
    } else {
      setForm(f => ({ ...f, [key]: value }));
    }
  };

  const validate = () => {
    const newErrors: {[key:string]: boolean} = {};
    if (!photos[0]) newErrors['photo0'] = true;
    if (!form.name) newErrors['name'] = true;
    if (!form.birthYear) newErrors['birthYear'] = true;
    if (!form.job) newErrors['job'] = true;
    if (!form.eduLevel) newErrors['eduLevel'] = true;
    if (!form.maritalStatus) newErrors['maritalStatus'] = true;
    if (!form.height) newErrors['height'] = true;
    if (!form.religion) newErrors['religion'] = true;
    if (!form.address) newErrors['address'] = true;
    if (form.hasChild === '예' && !form.childCnt) newErrors['childCnt'] = true;
    if (!form.gender) newErrors['gender'] = true;
    // 가족정보 전체 및 학력(f.education)은 필수 아님
    family.forEach((f, i) => {
      if (!f.name) newErrors[`family_name_${i}`] = true;
      if (!f.relation) newErrors[`family_relation_${i}`] = true;
      if (!f.job) newErrors[`family_job_${i}`] = true;
      if (!f.age) newErrors[`family_age_${i}`] = true;
      if (!f.religion) newErrors[`family_religion_${i}`] = true;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validate();
    if (!isValid) return;

    // 빈 문자열은 null로 변환
    const nullIfEmpty = (v: any) => v === '' ? null : v;

    // 한글 label → 영어 enum value 변환 맵
    const relationLabelToEnum: Record<string, string> = {
      '부': 'FATHER',
      '모': 'MOTHER',
      '여동생': 'YOUNGER_SISTER',
      '누나/언니': 'OLDER_SISTER',
      '남동생': 'YOUNGER_BROTHER',
      '오빠/형': 'OLDER_BROTHER',
    };

    // 혼인여부 한글 → 영어 변환 맵
    const maritalStatusLabelToEnum: Record<string, string> = {
      '초혼': 'UNMARRIED',
      '재혼': 'REMARRIED',
    };

    // clientRequestDTO 객체 생성
    const mappedFamily = family.map(f => ({
      name: f.name,
      relationShip: relationLabelToEnum[f.relation] || f.relation || '',
      job: f.job,
      birthYear: f.age ? Number(f.age) : null,
      religion: f.religion
    }));
    const clientRequestDTO = {
      // memberProfileId: ... (필요시),
      name: nullIfEmpty(form.name),
      phoneNumber: nullIfEmpty(form.phoneNumber),
      address: nullIfEmpty(form.address),
      birthYear: form.birthYear === '' ? null : Number(form.birthYear),
      maritalStatus: maritalStatusLabelToEnum[form.maritalStatus] || nullIfEmpty(form.maritalStatus),
      highSchool: nullIfEmpty(form.highSchool),
      university: nullIfEmpty(form.university),
      major: form.major ? `${form.major}(학과)` : null,
      property: nullIfEmpty(form.property),
      religion: nullIfEmpty(form.religion),
      currentJob: nullIfEmpty(form.currentJob),
      previousJob: nullIfEmpty(form.previousJob),
      jobDetail: nullIfEmpty(form.jobDetail),
      info: nullIfEmpty(form.info),
      homeTown: nullIfEmpty(form.homeTown),
      gender: form.gender === '여자' ? 'FEMALE' : form.gender === '남자' ? 'MALE' : null,
      status: nullIfEmpty(form.status),
      height: form.height === '' ? null : Number(form.height),
      minPreferredAge: form.minPreferredAge === '' ? null : Number(form.minPreferredAge),
      maxPreferredAge: form.maxPreferredAge === '' ? null : Number(form.maxPreferredAge),
      hobby: nullIfEmpty(form.hobby),
      idealType: form.idealType && form.idealType.length > 0 ? JSON.stringify(form.idealType) : null,
      personality: form.personality && form.personality.length > 0 ? JSON.stringify(form.personality) : null,
      hasChild: form.hasChild === '예' ? true : false,
      childCnt: form.childCnt === '' ? null : Number(form.childCnt),
      familyRequestDTOList: mappedFamily,
      etc: nullIfEmpty(form.etc),
      eduLevel: nullIfEmpty(form.eduLevel),
    };

    const formData = new FormData();
    formData.append('clientRequestDTO', new Blob([JSON.stringify(clientRequestDTO)], { type: 'application/json' }));
    photos.forEach(file => {
      if (file) formData.append('fileList', file);
    });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8082/api/v0/client', {
        method: 'POST',
        body: formData,
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        return;
      }
      if (!res.ok) throw new Error('등록 실패');
      setMessage('프로필이 등록되었습니다!');
      setTimeout(() => navigate('/client'), 1000);
    } catch (err) {
      setMessage('등록에 실패했습니다.');
    }
  };

  // personalityOptions 정의
  const personalityOptions = [
    '외향적', '내향적', '유머러스함', '차분함', '꼼꼼함', '즉흥적', '감성적', '이성적',
    '리더형', '분위기메이커', '계획적', '낙천적', '신중함', '도전적',
  ];
  // idealTypeOptions를 personalityOptions와 동일하게, 색상도 동일하게
  const idealTypeOptions = personalityOptions.map(label => ({ label, color: 'bg-gray-100 text-gray-700' }));

  const handleIdealTypeToggle = (label: string) => {
    setForm(f => {
      const arr = Array.isArray(f.idealType) ? f.idealType : [];
      if (arr.includes(label)) {
        return { ...f, idealType: arr.filter((v: string) => v !== label) };
      } else {
        return { ...f, idealType: [...arr, label] };
      }
    });
  };

  useAuthGuard();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <TopBar onLogout={handleLogout} />
      <div className="bg-white rounded-2xl shadow-xl px-4 py-6 w-full max-w-3xl mt-20 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-pink-500">프로필 등록</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-h-[70vh] overflow-y-auto px-2">
          <div className="flex gap-4 justify-center mb-2">
            {[0,1,2].map(idx => (
              <div key={idx} className="flex flex-col items-center">
                <label className={`w-52 h-52 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 ${errors[`photo${idx}`] ? 'border-red-500' : 'border-pink-200'} hover:border-pink-400 transition`}>
                  {photoUrls[idx] ? (
                    <img src={photoUrls[idx]!} alt={`미리보기${idx+1}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400">사진추가</span>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handlePhotoChange(idx, e)} />
                </label>
                <span className="text-xs text-gray-400 mt-1">사진 {idx+1}</span>
                {idx === 0 && errors['photo0'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">이름 <span className="text-pink-500">*</span></label>
            <input type="text" maxLength={4} placeholder="이름(한글, 최대 4자)" value={form.name} onChange={e => handleChange('name', e.target.value)} className={`border p-3 rounded text-lg ${errors['name'] ? 'border-red-500' : ''}`} />
            {errors['name'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">출생년도 <span className="text-pink-500">*</span></label>
            <select value={form.birthYear} onChange={e => handleChange('birthYear', e.target.value)} className={`border p-3 rounded text-lg w-32 ${errors['birthYear'] ? 'border-red-500' : ''}`}>
              <option value="">년도</option>
              {years.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            {errors['birthYear'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">성별 <span className="text-pink-500">*</span></label>
            <select value={form.gender} onChange={e => handleChange('gender', e.target.value)} className={`border p-3 rounded text-lg ${errors['gender'] ? 'border-red-500' : ''}`}> 
              <option value="">선택</option>
              <option value="여자">여자</option>
              <option value="남자">남자</option>
            </select>
            {errors['gender'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">거주지 <span className="text-pink-500">*</span></label>
            <input type="text" placeholder="주소" value={form.address} onChange={e => handleChange('address', e.target.value)} className={`border p-3 rounded text-lg ${errors['address'] ? 'border-red-500' : ''}`} />
            {errors['address'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">키 <span className="text-pink-500">*</span></label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                placeholder="키"
                value={form.height}
                onChange={e => handleChange('height', e.target.value)}
                className={`border p-3 rounded text-lg w-32 ${errors['height'] ? 'border-red-500' : ''}`}
              />
              <span className="text-gray-600 text-lg">cm</span>
            </div>
            {errors['height'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">직업 <span className="text-pink-500">*</span></label>
            <select value={form.job} onChange={e => handleChange('job', e.target.value)} className={`border p-3 rounded text-lg ${errors['job'] ? 'border-red-500' : ''}`}>{jobList.map(j => <option key={j} value={j}>{j}</option>)}</select>
            {errors['job'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
            <input type="text" placeholder="직업 상세사항" value={form.currentJob} onChange={e => handleChange('currentJob', e.target.value)} className="border p-3 rounded text-lg mt-1" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">이전 직업</label>
            <input type="text" placeholder="이전 직업" value={form.previousJob} onChange={e => handleChange('previousJob', e.target.value)} className="border p-3 rounded text-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">학력 <span className="text-pink-500">*</span></label>
            <select value={form.eduLevel} onChange={e => handleChange('eduLevel', e.target.value)} className={`border p-3 rounded text-lg ${errors['eduLevel'] ? 'border-red-500' : ''}`}>{eduLevelList.map(e => <option key={e} value={e}>{e}</option>)}</select>
            {errors['eduLevel'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">대학교</label>
            <input type="text" placeholder="대학교" value={form.university} onChange={e => handleChange('university', e.target.value)} className="border p-3 rounded text-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">고등학교</label>
            <input type="text" placeholder="고등학교" value={form.highSchool} onChange={e => handleChange('highSchool', e.target.value)} className="border p-3 rounded text-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">전공</label>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="전공" value={form.major} onChange={e => handleChange('major', e.target.value)} className="border p-3 rounded text-lg flex-1" />
              <span className="text-gray-600 text-lg">학과</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">성격</label>
            <div className="flex flex-wrap gap-2">
              {personalityOptions.map(opt => (
                <button
                  type="button"
                  key={opt}
                  className={`px-2 py-1 text-sm rounded-full font-semibold shadow transition border-2 border-transparent bg-gray-100 text-gray-700 ${Array.isArray(form.personality) && form.personality.includes(opt) ? 'ring-2 ring-gray-400 scale-105 bg-gray-300 text-gray-900' : 'opacity-80 hover:opacity-100'} ${!form.personality.includes(opt) && form.personality.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (form.personality.includes(opt)) {
                      handleChange('personality', form.personality.filter(v => v !== opt));
                    } else if (form.personality.length < 5) {
                      handleChange('personality', [...form.personality, opt]);
                    }
                  }}
                  disabled={!form.personality.includes(opt) && form.personality.length >= 5}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">원하는 상대 나이</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" placeholder="최소" value={form.minPreferredAge} onChange={e => handleChange('minPreferredAge', e.target.value)} className="border p-3 rounded text-lg w-24" />
              <span className="text-gray-500">세 ~</span>
              <input type="number" min="0" placeholder="최대" value={form.maxPreferredAge} onChange={e => handleChange('maxPreferredAge', e.target.value)} className="border p-3 rounded text-lg w-24" />
              <span className="text-gray-500">세</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">취미</label>
            <input type="text" placeholder="취미" value={form.hobby} onChange={e => handleChange('hobby', e.target.value)} className="border p-3 rounded text-lg" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">이상형</label>
            <div className="flex flex-wrap gap-2">
              {idealTypeOptions.map(opt => (
                <button
                  type="button"
                  key={opt.label}
                  className={`px-2 py-1 text-sm rounded-full font-semibold shadow transition border-2 border-transparent bg-gray-100 text-gray-700 ${Array.isArray(form.idealType) && form.idealType.includes(opt.label) ? 'ring-2 ring-gray-400 scale-105 bg-gray-300 text-gray-900' : 'opacity-80 hover:opacity-100'} ${!form.idealType.includes(opt.label) && form.idealType.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => handleIdealTypeToggle(opt.label)}
                  disabled={!form.idealType.includes(opt.label) && form.idealType.length >= 5}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">혼인 여부 <span className="text-pink-500">*</span></label>
            <select
              value={form.maritalStatus}
              onChange={e => handleChange('maritalStatus', e.target.value)}
              className={`border p-3 rounded text-lg ${errors['maritalStatus'] ? 'border-red-500' : ''}`}
            >
              {marriageTypeList.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors['maritalStatus'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
          </div>
          {form.maritalStatus === '재혼' && (
            <div className="flex flex-col gap-2">
              <label className="font-semibold">아이 유무 <span className="text-pink-500">*</span></label>
              <select value={form.hasChild} onChange={e => handleChange('hasChild', e.target.value)} className={`border p-3 rounded text-lg ${errors['hasChild'] ? 'border-red-500' : ''}`}> 
                <option value="아니오">아니오</option>
                <option value="예">예</option>
              </select>
              {errors['hasChild'] && <span className="text-xs text-red-500">필수 항목입니다.</span>}
              {form.hasChild === '예' && (
                <div className="mt-2">
                  <label className="font-semibold mr-2">아이 수</label>
                  <select value={form.childCnt} onChange={e => handleChange('childCnt', e.target.value)} className={`border p-3 rounded text-lg w-28 ${errors['childCnt'] ? 'border-red-500' : ''}`}> 
                    <option value="">선택</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}명</option>)}
                  </select>
                  {errors['childCnt'] && <span className="text-xs text-red-500 ml-2">필수 항목입니다.</span>}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="font-semibold">재산</label>
            <input
              type="number"
              min="0"
              placeholder="재산(만원 단위)"
              value={form.property}
              onChange={e => handleChange('property', e.target.value)}
              className="border p-3 rounded text-lg"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">기타 특이사항</label>
            <input type="text" placeholder="기타 특이사항" value={form.etc} onChange={e => handleChange('etc', e.target.value)} className="border p-3 rounded text-lg" />
          </div>
          <div className="border rounded p-3 bg-gray-50 mb-2">
            <div className="font-semibold mb-3 text-lg text-pink-600 flex items-center gap-2">
              가족 정보 <span className="text-pink-500">*</span>
              <span className="text-xs text-gray-400">(최대 5명)</span>
            </div>
            <div className="flex flex-col gap-2">
              {family.map((f, i) => (
                <div key={i} className="flex flex-wrap md:flex-nowrap items-center gap-2 bg-white rounded shadow px-2 py-2 border border-pink-100 relative">
                  <input value={f.name || ''} onChange={e => handleFamilyChange(i, 'name', e.target.value)} placeholder="이름" className={`border p-2 rounded w-20 text-center ${errors[`family_name_${i}`] ? 'border-red-500' : 'border-gray-200'}`} />
                  <select value={f.relation || ''} onChange={e => handleFamilyChange(i, 'relation', e.target.value)} className={`border p-2 rounded w-24 text-center ${errors[`family_relation_${i}`] ? 'border-red-500' : 'border-gray-200'}`}>
                    <option value="">관계</option>
                    {relationOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <input value={f.job || ''} onChange={e => handleFamilyChange(i, 'job', e.target.value)} placeholder="직업" className={`border p-2 rounded w-24 text-center ${errors[`family_job_${i}`] ? 'border-red-500' : 'border-gray-200'}`} />
                  <select value={f.age || ''} onChange={e => handleFamilyChange(i, 'age', e.target.value)} className={`border p-2 rounded w-24 text-center ${errors[`family_age_${i}`] ? 'border-red-500' : 'border-gray-200'}`}>
                    <option value="">출생년도</option>
                    {familyBirthYears.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <select value={f.religion || ''} onChange={e => handleFamilyChange(i, 'religion', e.target.value)} className={`border p-2 rounded w-24 text-center ${errors[`family_religion_${i}`] ? 'border-red-500' : 'border-gray-200'}`}>
                    <option value="">종교</option>
                    {religionList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {family.length > 1 && (
                    <button type="button" onClick={() => removeFamily(i)} className="ml-2 text-red-400 hover:text-red-600 text-xl font-bold">×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addFamily} className="mt-2 px-3 py-1 bg-pink-100 text-pink-600 rounded shadow hover:bg-pink-200 transition disabled:opacity-50" disabled={family.length >= 5}>가족 추가</button>
            </div>
          </div>
          <button type="submit" className="mt-4 bg-pink-500 text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-pink-600 transition">등록하기</button>
          {message && <div className="mt-4 text-center text-green-600 font-bold">{message}</div>}
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;