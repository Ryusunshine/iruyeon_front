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

export async function getProfiles() {
  const res = await fetchWithAuth(`${API_BASE}/profiles`);
  if (!res.ok) throw new Error('프로필 목록 불러오기 실패');
  return res.json();
}

export async function getProfile(id: string) {
  const res = await fetchWithAuth(`${API_BASE}/profiles/${id}`);
  if (!res.ok) throw new Error('프로필 불러오기 실패');
  return res.json();
}

export async function createProfile(data: any) {
  const res = await fetchWithAuth(`${API_BASE}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('프로필 생성 실패');
  return res.json();
}

export async function updateProfile(id: string, data: any) {
  const res = await fetchWithAuth(`${API_BASE}/profiles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('프로필 수정 실패');
  return res.json();
}

export async function deleteProfile(id: string) {
  const res = await fetchWithAuth(`${API_BASE}/profiles/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('프로필 삭제 실패');
  return res.json();
}

export { fetchWithAuth }; 