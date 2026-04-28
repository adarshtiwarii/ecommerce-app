// src/components/user/Profile.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaEnvelope, FaUserTag } from 'react-icons/fa';

const Profile = () => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('userEmail');
  const userName = localStorage.getItem('userName');
  const role = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black flex items-center justify-center px-4 py-6 sm:py-12">
      <div className="glass-card w-full max-w-md sm:max-w-lg md:max-w-2xl p-5 sm:p-8 md:p-10 rounded-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-forest-surface/80 border-2 border-neon-green flex items-center justify-center">
              <FaUserCircle className="text-5xl sm:text-6xl text-neon-green" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-light text-white mt-3 sm:mt-4">My Profile</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Manage your account details</p>
        </div>

        {/* User details */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-forest-surface/40 rounded-xl p-3 sm:p-4 border border-neon-green/20 hover:border-neon-green/40 transition-all">
            <div className="flex items-center gap-3">
              <FaUserTag className="text-neon-green text-lg sm:text-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm">Full Name</p>
                <p className="text-white text-base sm:text-lg font-medium truncate">{userName || 'Not set'}</p>
              </div>
            </div>
          </div>
          <div className="bg-forest-surface/40 rounded-xl p-3 sm:p-4 border border-neon-green/20 hover:border-neon-green/40 transition-all">
            <div className="flex items-center gap-3">
              <FaEnvelope className="text-neon-green text-lg sm:text-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm">Email Address</p>
                <p className="text-white text-base sm:text-lg font-medium truncate">{userEmail || 'Not set'}</p>
              </div>
            </div>
          </div>
          <div className="bg-forest-surface/40 rounded-xl p-3 sm:p-4 border border-neon-green/20 hover:border-neon-green/40 transition-all">
            <div className="flex items-center gap-3">
              <FaUserTag className="text-neon-green text-lg sm:text-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-xs sm:text-sm">Role</p>
                <p className="text-neon-green text-base sm:text-lg font-semibold uppercase truncate">{role || 'CUSTOMER'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logout button - smaller, centered */}
        <div className="mt-6 sm:mt-8 flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 font-semibold py-2 px-6 rounded-xl border border-red-500/30 transition-all duration-200 hover:scale-[1.02] text-sm sm:text-base"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;