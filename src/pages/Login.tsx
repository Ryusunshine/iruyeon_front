import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../hooks/useAuthGuard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useAuthGuard({ inverse: true });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:8082/api/v0/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      let resData;
      try {
        resData = await res.json();
      } catch {
        const text = await res.text();
        console.error('서버에서 JSON이 아닌 응답:', text);
        setError('서버 오류: JSON이 아닌 응답');
        return;
      }

      if (!res.ok) {
        if (res.status === 401 || resData?.message?.includes('password')) {
          setError('비밀번호가 일치하지 않습니다.');
        } else {
          setError(resData?.message || '로그인 실패');
        }
        return;
      }

      const data = resData.data;
      if (!data?.token) {
        setError('로그인 토큰이 없습니다.');
        return;
      }

    } catch (err) {
      console.error('로그인 에러:', err);
      setError('아이디/비밀번호가 일치하지 않습니다.');
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = 'http://localhost:8082/oauth2/authorization/kakao';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-blue-50 to-pink-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        {message && message !== 'success' && (
          <div className="text-green-600 mb-2 text-center">{message}</div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          로그인
        </button>

        <button
          type="button"
          onClick={handleKakaoLogin}
          className="w-full bg-yellow-400 text-black py-2 rounded mt-3 hover:bg-yellow-500 transition"
        >
          카카오로 로그인
        </button>

        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="w-full bg-gray-200 text-gray-700 py-2 rounded mt-3 hover:bg-gray-300 transition"
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Login;

