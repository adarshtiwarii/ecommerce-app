// src/components/common/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useApp();

  // Redirect guests to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users who do not match the required role.
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

