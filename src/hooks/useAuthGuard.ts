import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleUnauthorized } from '../utils/auth';

export function useAuthGuard({ inverse = false }: { inverse?: boolean } = {}) {
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!inverse) {
      // 일반 페이지: 토큰 없으면 로그인으로
      if (!token) {
        navigate('/login');
        return;
      }
      
      // 토큰이 있으면 유효성 검증을 위해 간단한 API 호출
      const validateToken = async () => {
        try {
          // 기존 API 엔드포인트를 사용하여 토큰 유효성 검증
          const res = await fetch('http://localhost:8082/api/v0/client', {
            method: 'GET',
            headers: {
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          });
          
          if (res.status === 401) {
            handleUnauthorized();
            return;
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          // 네트워크 오류 등으로 인한 실패는 무시하고 계속 진행
        }
      };
      
      validateToken();
    } else {
      // 로그인 페이지: 토큰 있으면 메인으로
      if (token) navigate('/');
    }
  }, [navigate, inverse]);
} 