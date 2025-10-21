const API_BASE = 'http://localhost:8081/api/v0';

async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401) {
    localStorage.removeItem('token');
    throw new Error('인증이 만료되어 로그아웃되었습니다.');
  }
  return res;
}

export { fetchWithAuth };

export async function getUsers() {
  const res = await fetchWithAuth(`${API_BASE}/users`);
  if (!res.ok) throw new Error('회원 목록 불러오기 실패');
  return res.json();
}

export async function getUser(id: string) {
  const res = await fetchWithAuth(`${API_BASE}/users/${id}`);
  if (!res.ok) throw new Error('회원 불러오기 실패');
  return res.json();
}

export async function createUser(data: any) {
  const res = await fetchWithAuth(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('회원 생성 실패');
  return res.json();
}

export async function updateUser(id: string, data: any) {
  const res = await fetchWithAuth(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('회원 수정 실패');
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetchWithAuth(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('회원 삭제 실패');
  return res.json();
}

export async function approveUser(id: string) {
  const res = await fetchWithAuth(`${API_BASE}/users/${id}/approve`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('회원 승인 실패');
  return res.json();
} 