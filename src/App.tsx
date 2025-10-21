import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfileDetail from './pages/ProfileDetail';
import ProfileForm from './pages/ProfileForm';
import ProfileMatches from './pages/ProfileMatches';
import MatchingRoom from './pages/MatchingRoom';
import Admin from './pages/Admin';
import OauthSuccess from './pages/OauthSuccess'; // ✅ 새로 만든 파일
import Pending from './pages/Pending'; // 승인 대기 페이지 추가
import MemberDetail from './pages/MemberDetail'; // 추가 정보 입력 페이지 추가
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import PendingMember from './pages/PendingMember';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/client" element={<ClientList />} />
        <Route path="/client/detail/:id" element={<ClientDetail />} />
        <Route path="/client/new" element={<ProfileForm />} />
        <Route path="/profiles/:id" element={<ProfileDetail />} />
        <Route path="/matches" element={<ProfileMatches />} />
        <Route path="/matching/:id" element={<MatchingRoom />} />
        <Route path="/admin/member" element={<Admin />} />
        <Route path="/oauth/success" element={<OauthSuccess />} />
        <Route path="/pending" element={<Pending />} /> {/* 승인 대기 페이지 */}
        <Route path="/member/detail" element={<MemberDetail />} /> {/* 추가 정보 입력 페이지 */}
        <Route path="/admin/member/pending" element={<PendingMember />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
