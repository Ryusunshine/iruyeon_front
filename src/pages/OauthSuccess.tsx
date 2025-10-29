import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';

const OauthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const id = searchParams.get('id');
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    if (!token || !id || !role || !status) {
      alert('로그인 정보가 올바르지 않습니다. (쿼리파라미터 누락)');
    }
    if (token) localStorage.setItem('token', token);
    if (id) localStorage.setItem('id', id);
    if (role) localStorage.setItem('role', role);
    if (status) localStorage.setItem('status', status);

    console.log('[OauthSuccess] localStorage:', {
      token: localStorage.getItem('token'),
      id: localStorage.getItem('id'),
      role: localStorage.getItem('role'),
      status: localStorage.getItem('status'),
    });

    if (token) {
      if (status === 'PENDING') {
        navigate('/pending');
      } else if (role === 'ROLE_ANONYMOUS' && status === 'INACTIVE') {
        navigate(`/member/detail/${id}`);
      } else if (role === 'ROLE_MEMBER' && status === 'ACTIVE') {
        navigate('/client');
      } else {
        setError('권한이 없습니다.');
        navigate('/login');
        return;
      }

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
