// src/components/common/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useApp();

  // ✅ Login nahi hai — login page pe bhejo
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Role check — agar allowedRoles diye hain aur user ka role match nahi karta
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

