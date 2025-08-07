import React from 'react';
import { useSelector } from 'react-redux';
import PublicRoutes from './publicRoutes';

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    // If user is not authenticated, render all public routes (login, register, etc.)
    return <PublicRoutes />;
  }

  // If user is authenticated, render the protected content
  return children;
}

export default ProtectedRoute; 