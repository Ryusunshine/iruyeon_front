import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OauthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    console.log('[OauthSuccess] 쿼리파라미터:', { id, token, role, status });
    if (!token || !id || !role || !status) {
      alert('로그인 정보가 올바르지 않습니다. (쿼리파라미터 누락)');
    }
    if (token) localStorage.setItem('token', token);
    if (id) localStorage.setItem('id', id);
    if (role) localStorage.setItem('role', role);
    if (status) localStorage.setItem('status', status);
    // 저장 직후 실제 localStorage 값 확인
    console.log('[OauthSuccess] localStorage:', {
      token: localStorage.getItem('token'),
      id: localStorage.getItem('id'),
      role: localStorage.getItem('role'),
      status: localStorage.getItem('status'),
    });

    if (token) {
      setTimeout(() => navigate('/'), 2000);
      return;
    } else {
      alert('로그인 정보가 잘못되었습니다.');
      navigate('/login');
    }
  }, [navigate, searchParams]);


  return (
    <div className="min-h-screen flex items-center justify-center">
      로그인 처리 중입니다...
    </div>
  );
};

export default OauthSuccess;
