import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FloatingInput from '../../components/commonComponent/FloatingInput';
import { toast } from 'react-toastify';
import grassBg from '../../assets/grass.png';
import darkLogo from '../../assets/DarkLogo.png';
import { forgotPassword } from '../../redux/services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthTranslations, getValidationTranslations } from '../../utils/translations';

function ForgotPassword() {
    const { language } = useLanguage();
    const isRTL = language === 'he';
    const t = getAuthTranslations(language);
    const v = getValidationTranslations(language);
    
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [savedEmails, setSavedEmails] = useState([]);

  // Load saved emails from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedEmails');
      if (saved) {
        const emails = JSON.parse(saved);
        setSavedEmails(emails);
      }
    } catch (e) {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    // Close any toast that might appear during flow
    toast.dismiss();
  }, []);

  // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
        if (!email) return v.emailRequired;
        if (!emailRegex.test(email)) return v.validEmailAddress;
        if (email.length > 50) return v.emailTooLong;
    return '';
    };

    const handleChange = (e) => {
    const { name, value } = e.target;
        setEmail(value);
    };

    const handleFocus = (e) => {
    // No real-time validation on focus
    };

    const handleBlur = (e) => {
    // No real-time validation on blur
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    setHasAttemptedSubmit(true);

        const emailError = validateEmail(email);
        
        if (emailError) {
            setError(emailError);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await forgotPassword(email);
            toast.success(t.passwordResetLinkSent);
            setEmail('');
      setHasAttemptedSubmit(false);
        } catch (error) {
            toast.error(error.message || t.failedToSendResetLink);
      setError(error.message || t.failedToSendResetLink);
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-full h-screen flex">
        {/* Left Panel - Forgot Password Form (35%) */}
        <div className="w-full lg:w-[35%] flex flex-col p-8 lg:p-12 bg-white dark:bg-gray-800 relative">
          {/* Logo - Top Left */}
          <div className="absolute top-8 left-8 lg:left-12">
            <img src={darkLogo} alt="Logo" className="h-8 w-auto" />
          </div>
          
          <div className="w-full max-w-md mx-auto flex-1 flex items-center justify-center">
            <div className="w-full">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                        {t.forgotPasswordTitle}
                    </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8 font-sans">
                        {t.forgotPasswordSubtitle}
                    </p>

            <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
              <div>
                <FloatingInput
                        label={t.emailAddress}
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={t.enterEmailAddress}
                  error={hasAttemptedSubmit ? error : ''}
                  suggestions={savedEmails.map(email => ({
                    email,
                    name: email.split('@')[0],
                    avatar: email.charAt(0).toUpperCase()
                  }))}
                  onSuggestionSelect={(suggestion) => {
                    const selectedEmail = suggestion.email || suggestion;
                    setEmail(selectedEmail);
                    setError('');
                  }}
                  autoComplete="email"
                />
              </div>

                    <button
                        type="submit"
                className="w-full h-[48px] rounded-full text-md font-semibold flex items-center justify-center bg-black text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
              >
                {isLoading ? t.sendingResetLink : t.sendResetLink.toUpperCase()}
                    </button>
                </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                  OR
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {t.rememberPassword}{' '}
                        <Link
                            to="/login"
                  className="font-semibold text-gray-900 dark:text-white hover:underline transition-all duration-200"
                        >
                            {t.backToLogin}
                        </Link>
                    </p>
            </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Image Section (65%) */}
        <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden">
          {/* Static Image - Only first image */}
          <img
            src={grassBg}
            alt="Background"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>
            </div>
        </div>
    );
}

export default ForgotPassword;
