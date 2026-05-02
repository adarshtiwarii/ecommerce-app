import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiShield, FiLogOut } from 'react-icons/fi';

const Profile = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="bg-fk-light min-h-screen flex items-center justify-center">
        <div className="bg-white rounded shadow p-8 text-center">
          <p className="text-gray-600 mb-4">You are not logged in.</p>
          <button onClick={() => navigate('/login')} className="bg-fk-blue text-white px-6 py-2 rounded">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-fk-light min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="bg-fk-blue p-6 text-white">
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-blue-100 mt-1">Manage your account details</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 border-b pb-3">
              <FiUser className="text-gray-400" size={20} />
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-medium">{user.name || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b pb-3">
              <FiMail className="text-gray-400" size={20} />
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-b pb-3">
              <FiShield className="text-gray-400" size={20} />
              <div>
                <p className="text-xs text-gray-500">Account Type</p>
                <p className="font-medium capitalize">{user.role || 'Customer'}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              <FiLogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;