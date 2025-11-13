import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SquaresAnim } from '../../components/index';
import LoginBG from '../../assets/LoginBG.png';
import { verifyEmail } from '../../redux/services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthTranslations } from '../../utils/translations';

function EmailVerify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getAuthTranslations(language);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    const verifyEmailToken = async () => {
      // Prevent multiple API calls
      if (hasCalledAPI.current) return;
      hasCalledAPI.current = true;

      if (!token) {
        setVerificationStatus('error');
        setIsVerifying(false);
        return;
      }

      try {
        // Call the actual API only once
        await verifyEmail(token);
        
        setVerificationStatus('success');
        toast.success(t.emailVerifiedSuccessToast);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        
      } catch (error) {
        setVerificationStatus('error');
        toast.error(error.message || t.emailVerificationFailed);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmailToken();
  }, [token, navigate, t]);

  const getStatusContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return {
          title: t.verifyingEmail,
          message: t.verifyingEmailMessage,
          icon: '⏳',
          color: 'text-blue-600'
        };
      case 'success':
        return {
          title: t.emailVerifiedSuccess,
          message: t.emailVerifiedMessage,
          icon: '✅',
          color: 'text-green-600'
        };
      case 'error':
        return {
          title: t.verificationFailed,
          message: t.verificationFailedMessage,
          icon: '❌',
          color: 'text-red-600'
        };
      default:
        return {
          title: t.verifyingEmail,
          message: t.pleaseWait,
          icon: '⏳',
          color: 'text-blue-600'
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center dark:bg-customBlack bg-white px-4 py-8">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <SquaresAnim speed={0.5} squareSize={50} direction='down' />
        {/* Left-bottom focused bubble/gradient */}
        <div className="
          absolute inset-0
          bg-[radial-gradient(ellipse_at_left_bottom,_var(--tw-gradient-stops))]
          from-pink-200/60 via-white/60 to-purple-200/80
          dark:from-[#232136]/80 dark:via-[#232136]/60 dark:to-[#232136]/0
          pointer-events-none"
        />
      </div>
      
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl border border-gray-200/20 dark:border-customBorderColor/50 backdrop-blur-xl p-8 bg-cover bg-center bg-white/10 dark:bg-black/20"
        style={{
          backgroundImage: `url(${LoginBG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="text-center">
          <div className={`text-6xl mb-4 ${statusContent.color}`}>
            {statusContent.icon}
          </div>
          
          <h2 className="text-24 font-black text-center text-white mb-4">
            {statusContent.title}
          </h2>
          
          <p className="text-16 mb-6 text-center text-white/90 font-medium">
            {statusContent.message}
          </p>

          {isVerifying && (
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="text-green-400 text-sm font-medium">
                {t.redirectingToLogin}
              </p>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="space-y-4">
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm font-medium">
                  {t.contactSupportMessage}
                </p>
              </div>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {t.goToLogin}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailVerify;