import React, { createContext, useContext, useState, ReactNode } from 'react';

// 타입 정의
export type User = {
  id: string;
  name: string;
  phone: string;
  password: string;
  role: string;
  status: string;
  token?: string;
};

export type FamilyMember = {
  name: string;
  relation: string;
  job: string;
};

export type Profile = {
  id: string;
  userId: string;
  name: string;
  age: number;
  job: string;
  region: string;
  photoUrl?: string;
  family?: FamilyMember[];
  // ... 기타 프로필 필드
};

export type Match = {
  id: string;
  fromProfileId: string;
  toProfileId: string;
  status: '진행중' | '거절됨' | '매칭됨';
};

interface UserContextType {
  users: User[];
  profiles: Profile[];
  matches: Match[];
  signup: (user: Omit<User, 'id' | 'approved' | 'isAdmin'>) => void;
  login: (phone: string, password: string) => boolean;
  approveUser: (userId: string) => void;
  addProfile: (profile: Omit<Profile, 'id'>) => void;
  updateProfile: (profileId: string, data: Partial<Profile>) => void;
  deleteProfile: (profileId: string) => void;
  requestMatch: (fromProfileId: string, toProfileId: string) => void;
  logout: () => void;
  updateUser: (userId: string, phone: string, password: string) => void;
  deleteUser: (userId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('UserContext 사용 오류');
  return ctx;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  // 임시 회원/프로필/매칭 데이터
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: '관리자', phone: '000-0000-0000', password: 'admin', role: 'admin', status: 'approved' },
  ]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  // 회원가입
  const signup = (user: Omit<User, 'id' | 'approved' | 'isAdmin'>) => {
    setUsers(prev => [
      ...prev,
      { ...user, id: (prev.length + 1).toString(), approved: false },
    ]);
  };

  // 로그인
  const login = (phone: string, password: string) => {
    const user = users.find(u => u.phone === phone && u.password === password);
    return !!user;
  };

  // 로그아웃
  const logout = () => {};

  // 관리자 승인
  const approveUser = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, approved: true } : u));
  };

  // 프로필 등록
  const addProfile = (profile: Omit<Profile, 'id'>) => {
    setProfiles(prev => [
      ...prev,
      { ...profile, id: (prev.length + 1).toString() },
    ]);
  };

  // 프로필 수정
  const updateProfile = (profileId: string, data: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, ...data } : p));
  };

  // 프로필 삭제
  const deleteProfile = (profileId: string) => {
    setProfiles(prev => prev.filter(p => p.id !== profileId));
  };

  // 매칭 요청
  const requestMatch = (fromProfileId: string, toProfileId: string) => {
    setMatches(prev => [
      ...prev,
      { id: (prev.length + 1).toString(), fromProfileId, toProfileId, status: '진행중' },
    ]);
  };

  // 회원 정보 수정
  const updateUser = (userId: string, phone: string, password: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, phone, password } : u));
  };

  // 회원 삭제
  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <UserContext.Provider value={{ users, profiles, matches, signup, login, approveUser, addProfile, updateProfile, deleteProfile, requestMatch, logout, updateUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
}; 