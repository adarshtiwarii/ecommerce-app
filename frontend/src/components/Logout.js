import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('savedEmail');
    localStorage.removeItem('savedPassword');
    setTimeout(() => navigate('/login', { replace: true }), 500);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest-deep to-black flex items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-8 text-center rounded-2xl">
        <FaSignOutAlt className="text-6xl neon-text mx-auto mb-4" />
        <h2 className="text-2xl font-light text-white mb-2">Logging Out...</h2>
        <p className="text-gray-400">Please wait while we securely log you out.</p>
      </div>
    </div>
  );
};

export default Logout;