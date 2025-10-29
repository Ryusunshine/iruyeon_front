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
import OauthSuccess from './pages/OauthSuccess'; 
import Pending from './pages/Pending';
import MemberDetail from './pages/MemberDetail';
import ClientList from './pages/ClientList';
import ClientDetail from './pages/ClientDetail';
import PendingMember from './pages/PendingMember';
import MyClientList from './pages/MyClientList';
import ClientProfileForm from './pages/ClientProfileForm';


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
        <Route path="/pending" element={<Pending />} /> 
        <Route path="/member/detail/:id" element={<MemberDetail />} />
        <Route path="/admin/member/pending" element={<PendingMember />} />
        <Route path="/myclient" element={<MyClientList />} />
        <Route path="/client/edit/:id" element={<ClientProfileForm />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
