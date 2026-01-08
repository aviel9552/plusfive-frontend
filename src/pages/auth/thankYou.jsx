import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CommonButton, SquaresAnim } from '../../components/index';
import { toast } from 'react-toastify';
import LoginBG from '../../assets/LoginBG.png';
import { FaEnvelope, FaUser, FaKey } from 'react-icons/fa';
import { emailService } from '../../services/emailService';

function ThankYou() {
  const location = useLocation();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const userData = location.state?.userData;

  // useEffect to show email sent toast after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.success('Email sent successfully! 🎉', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
  
  // If no user data, redirect to register
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">No Registration Data Found</h1>
          <p className="text-gray-600 mb-4">Please complete registration first.</p>
          <Link to="/register" className="text-blue-500 hover:underline">
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const sendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const result = await emailService.sendWelcomeEmail(userData);
      if (result.success) {
        toast.success('Login credentials sent to your email!');
      } else {
        toast.error('Failed to send email. Please try again.');
      }
    } catch (error) {
      toast.error('Error sending email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center dark:bg-customBlack bg-white px-4 py-8">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <SquaresAnim speed={0.5} squareSize={50} direction='down' />
        <div className="
          absolute inset-0
          bg-[radial-gradient(ellipse_at_left_bottom,_var(--tw-gradient-stops))]
          from-pink-200/60 via-white/60 to-purple-200/80
          dark:from-[#232136]/80 dark:via-[#232136]/60 dark:to-[#232136]/0
          pointer-events-none"
        />
      </div>
      
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-customBrown rounded-2xl shadow-2xl border border-gray-200 dark:border-customBorderColor backdrop-blur-md p-8"
        style={{
          backgroundImage: `url(${LoginBG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-36 font-extrabold text-white mb-4 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
            Welcome to PlusFive, {userData.firstName}! 🎉
          </h1>
          <p className="text-18 text-white/90 mb-6 leading-relaxed">
            Your account has been successfully created. Here are your login credentials:
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-orange-500 mx-auto rounded-full"></div>
        </div>

        {/* Login Credentials Card */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
          <h3 className="text-22 font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
              <FaUser className="text-white text-sm" />
            </div>
            Your Account Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10 hover:border-pink-500/50 transition-all duration-300 group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center mr-4">
                  <FaEnvelope className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Email</p>
                  <p className="text-white font-semibold text-lg">{userData.email}</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(userData.email, 'Email')}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Copy
              </button>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10 hover:border-pink-500/50 transition-all duration-300 group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                  <FaKey className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Password</p>
                  <p className="text-white font-semibold text-lg">••••••••</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(userData.password, 'Password')}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Copy
              </button>
            </div>

            {/* Business Name */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10 hover:border-pink-500/50 transition-all duration-300 group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                  <FaUser className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Business Name</p>
                  <p className="text-white font-semibold text-lg">{userData.businessName}</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(userData.businessName, 'Business Name')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Copy
              </button>
            </div>

            {/* Business Type */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/10 hover:border-pink-500/50 transition-all duration-300 group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mr-4">
                  <FaUser className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium">Business Type</p>
                  <p className="text-white font-semibold text-lg capitalize">{userData.businessType}</p>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(userData.businessType, 'Business Type')}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <Link to="/login" >
          <CommonButton
            text="Go to Login"
            className="w-auto !text-white rounded-lg py-3 text-xl shadow-lg px-20"
          />
        </Link>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-white/80 text-16 leading-relaxed">
              We've sent a welcome email with your login credentials. 
              Please check your inbox and spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThankYou; 