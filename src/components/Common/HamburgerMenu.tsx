import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HamburgerMenu = ({ currentUser, onLogout }: { currentUser: any, onLogout: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="p-2" onClick={() => setOpen(!open)}>
        <span className="block w-6 h-0.5 bg-black mb-1"></span>
        <span className="block w-6 h-0.5 bg-black mb-1"></span>
        <span className="block w-6 h-0.5 bg-black"></span>
      </button>
      {open && (
        <div className="fixed top-0 left-0 w-56 h-full bg-white shadow z-50 flex flex-col p-6">
          <Link to="/client" onClick={() => setOpen(false)} className="mb-4">프로필</Link>
          <Link to="/matches" onClick={() => setOpen(false)} className="mb-4">매칭내역</Link>
          {currentUser?.isAdmin && <Link to="/admin/member" onClick={() => setOpen(false)} className="mb-4">관리자</Link>}
          {!currentUser && (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="mb-4">로그인</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="mb-4">회원가입</Link>
            </>
          )}
        </div>
      )}
    </>
  );
};
export default HamburgerMenu; 