import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiShield, FiLogOut } from 'react-icons/fi';

const Profile = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return <div className="text-center py-10">Not logged in</div>;

  return (
    <div className="bg-white rounded shadow p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 border-b pb-3"><FiUser className="text-gray-400"/><div><p className="text-xs text-gray-500">Full Name</p><p className="font-medium">{user.name}</p></div></div>
      <div className="flex items-center gap-3 border-b pb-3 mt-3"><FiMail className="text-gray-400"/><div><p className="text-xs text-gray-500">Email</p><p className="font-medium">{user.email}</p></div></div>
      <div className="flex items-center gap-3 pb-3 mt-3"><FiShield className="text-gray-400"/><div><p className="text-xs text-gray-500">Role</p><p className="font-medium capitalize">{user.role}</p></div></div>
      <button onClick={handleLogout} className="mt-4 flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded">Logout <FiLogOut/></button>
    </div>
  );
};

export default Profile;