/**
 * 401 오류 발생 시 세션을 클리어하고 로그인 페이지로 리다이렉트하는 공통 함수
 */
export const handleUnauthorized = () => {
  // localStorage에서 모든 인증 관련 데이터 제거
  localStorage.removeItem('token');
  localStorage.removeItem('id');
  localStorage.removeItem('role');
  localStorage.removeItem('status');
  localStorage.removeItem('userId');
  
  // 로그인 페이지로 리다이렉트
  window.location.replace('/login');
};

/**
 * fetch 응답을 확인하고 401 오류 시 자동으로 세션 클리어 및 리다이렉트
 */
export const checkAuthResponse = (response: Response): Response => {
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('인증이 만료되어 로그아웃되었습니다.');
  }
  return response;
};

