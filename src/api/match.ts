import { handleUnauthorized } from '../utils/auth';

const API_BASE = 'http://localhost:8081/api/v0';

async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('인증이 만료되어 로그아웃되었습니다.');
  }
  return res;
}

export async function getMatches() {
  const res = await fetchWithAuth(`${API_BASE}/matches`);
  if (!res.ok) throw new Error('매칭 목록 불러오기 실패');
  return res.json();
}

export async function getMatch(id: string) {
  const res = await fetchWithAuth(`${API_BASE}/matches/${id}`);
  if (!res.ok) throw new Error('매칭 불러오기 실패');
  return res.json();
}

export async function createMatch(data: any) {
  const res = await fetchWithAuth(`${API_BASE}/matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('매칭 생성 실패');
  return res.json();
}

export async function updateMatch(id: string, data: any) {
  const res = await fetchWithAuth(`${API_BASE}/matches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('매칭 수정 실패');
  return res.json();
}

export async function deleteMatch(id: string) {
  const res = await fetchWithAuth(`${API_BASE}/matches/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('매칭 삭제 실패');
  return res.json();
}

export { fetchWithAuth }; 