// src/components/common/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useApp();
  const roleAliases = {
    CUSTOMER: ['CUSTOMER', 'USER'],
    USER: ['USER', 'CUSTOMER'],
  };

  // Redirect guests to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users who do not match the required role.
  const effectiveRoles = roleAliases[user.role] || [user.role];
  if (allowedRoles.length > 0 && !allowedRoles.some(role => effectiveRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

