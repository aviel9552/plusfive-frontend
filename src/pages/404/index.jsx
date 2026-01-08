import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();

  // Handle Go to Home button click: redirect based on authentication and role
  const handleGoHome = () => {
    if (isAuthenticated) {
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-customBody dark:bg-customBlack px-4 py-8">
      <div className="text-center">
        <h1 className="text-7xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 mb-4 drop-shadow-lg">404</h1>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Sorry, the page you are looking for does not exist or has been moved.</p>
        <button
          onClick={handleGoHome}
          className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-semibold text-lg shadow hover:from-indigo-500 hover:to-pink-500 transition-all duration-200"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export default NotFound;
