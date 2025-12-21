import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CommonInput, CommonButton, } from '../../components/index';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import LoginBG from '../../assets/LoginBG.png';
import FB from '../../assets/fb.svg';
import Google from '../../assets/google.svg';
import { loginUser, setSubscriptionCache } from '../../redux/actions/authActions';
import { resendVerificationEmail } from '../../redux/services/authService';
import { getCurrentSubscription } from '../../services/stripeService';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthTranslations, getValidationTranslations } from '../../utils/translations';
import { useEffect } from 'react';

function Login() {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const t = getAuthTranslations(language);
  const v = getValidationTranslations(language);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState({});
  const dispatch = useDispatch();
  const navigate = useNavigate();
    useEffect(() => {
    // Close any toast that might appear during login flow
    toast.dismiss();
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerificationBanner, setShowEmailVerificationBanner] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });

    // Real-time validation for email
    if (name === 'email' && value) {
      const emailError = validateEmail(value);
      setError(prev => ({ ...prev, email: emailError }));
    } else if (name === 'email' && !value) {
      setError(prev => ({ ...prev, email: "" }));
    }

    // Real-time validation for password
    if (name === 'password') {
      const passwordError = validatePassword(value);
      setError(prev => ({ ...prev, password: passwordError }));

      // Update password requirements
      setPasswordRequirements({
        minLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    // Show validation error immediately when user focuses on field
    if (name === 'email') {
      if (!form.email) {
        setError(prev => ({ ...prev, email: v.emailRequired }));
      } else {
        const emailError = validateEmail(form.email);
        if (emailError) {
          setError(prev => ({ ...prev, email: emailError }));
        }
      }
    } else if (name === 'password') {
      if (!form.password) {
        setError(prev => ({ ...prev, password: v.passwordRequired }));
      } else {
        const passwordError = validatePassword(form.password);
        if (passwordError) {
          setError(prev => ({ ...prev, password: passwordError }));
        }
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate on blur
    if (name === 'email') {
      const emailError = validateEmail(value);
      setError(prev => ({ ...prev, email: emailError }));
    } else if (name === 'password') {
      const passwordError = validatePassword(value);
      setError(prev => ({ ...prev, password: passwordError }));
    }
  };

  // Email validation function
  const validateEmail = (email) => {
    // Improved regex to ensure domain extension has 2-6 characters
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    if (!email) return v.emailRequired;
    if (!emailRegex.test(email)) return v.validEmailAddress;
    if (email.length > 50) return v.emailTooLong;
    return "";
  };


  // Password validation function
  const validatePassword = (password) => {
    if (!password) {
      return v.passwordRequired;
    }
    if (password.length < 8) {
      return " ";
      // return v.passwordMinLength;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return " ";
      // return v.passwordLowercase;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return " ";
      // return v.passwordUppercase;
    }
    if (!/(?=.*\d)/.test(password)) {
      return " ";
      // return v.passwordNumber;
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return " ";
      // return v.passwordSpecialChar;
    }
    return "";
  };

  const handleSendVerificationEmail = async () => {
    if (!form.email) {
      toast.error(v.pleaseEnterEmailAddress);
      return;
    }

    setIsResendingEmail(true);
    try {
      await resendVerificationEmail(form.email);
      toast.success(t.verificationEmailSent);
      setShowEmailVerificationBanner(false);
    } catch (error) {
      toast.error(error.message || t.failedToSendVerificationEmail);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newError = {};

    // Use proper validation functions
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);

    if (emailError) newError.email = emailError;
    if (passwordError) newError.password = passwordError;

    if (Object.keys(newError).length > 0) {
      setError(newError);
      return;
    }
    setIsLoading(true);
    try {
      await dispatch(loginUser(form.email, form.password));
      // Clear all errors on successful login
      setError({});
      // Get user data from localStorage after login
      const userData = JSON.parse(localStorage.getItem('userData'));
      
      // Navigate based on user role
      if (userData && userData.role === 'admin') {
        navigate('/admin');
        return;
      }
      
      // For regular users, check subscription status
      let hasActiveSubscription = false;
      
      // FIRST: Check localStorage cache (fast check)
      try {
        const cachedSub = localStorage.getItem('hasActiveSubscription');
        const cachedExpiry = localStorage.getItem('subscriptionExpiry');
        
        if (cachedSub === 'true' && cachedExpiry) {
          const expiryDate = new Date(cachedExpiry);
          const now = new Date();
          if (expiryDate > now) {
            hasActiveSubscription = true;
          } else {
            // Expired, clear cache via action
            dispatch(setSubscriptionCache(false, null));
          }
        }
      } catch (e) {
        // Ignore cache errors
      }
      
      // SECOND: If cache not found, call Stripe API
      if (!hasActiveSubscription) {
        try {
          const stripeSubscriptionData = await getCurrentSubscription();
          
          // Check if user has active subscription from Stripe
          const subscriptions = stripeSubscriptionData?.data?.stripe?.subscriptions || [];
          const activeSubscription = subscriptions.find(
            (sub) => sub.status === 'active' && !sub.cancel_at_period_end
          );
          
          if (activeSubscription) {
            // Check if subscription period has ended
            const currentPeriodEnd = activeSubscription.current_period_end;
            if (currentPeriodEnd) {
              const expirationDate = new Date(currentPeriodEnd * 1000);
              const currentDate = new Date();
              hasActiveSubscription = expirationDate.getTime() > currentDate.getTime();
              
              // Store in localStorage via Redux action (centralized in authReducer)
              if (hasActiveSubscription) {
                dispatch(setSubscriptionCache(true, expirationDate.toISOString()));
              }
            } else {
              // No expiration date, consider it active
              hasActiveSubscription = true;
              const farFuture = new Date();
              farFuture.setFullYear(farFuture.getFullYear() + 10);
              // Store in localStorage via Redux action (centralized in authReducer)
              dispatch(setSubscriptionCache(true, farFuture.toISOString()));
            }
          }
        } catch (stripeError) {
          // If Stripe API fails, fallback to local user data
          // Error is silent - will check local data below
        }
      }
      
      // THIRD: Fallback to local user data if Stripe didn't return active subscription
      if (!hasActiveSubscription) {
        const subscriptionStatus = userData?.subscriptionStatus?.toLowerCase();
        const expirationDate = userData?.subscriptionExpirationDate;
        hasActiveSubscription = subscriptionStatus === 'active' && 
          (!expirationDate || new Date(expirationDate) > new Date());
      }
      
      // If user has active subscription, redirect to app
      // Otherwise, redirect to subscription page
      if (hasActiveSubscription) {
        navigate('/app');
      } else {
        navigate('/subscription');
      }
    } catch (error) {
      // Check if error is related to email verification
      const errorMessage = error.message?.toLowerCase() || '';
      if (errorMessage.includes('verify') ||
        errorMessage.includes('verification') ||
        errorMessage.includes('email') && errorMessage.includes('confirm') ||
        errorMessage.includes('unverified')) {
        setShowEmailVerificationBanner(true);
      }
      toast.error(error.message || t.loginFailed);
      // Don't clear errors on failed login
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center dark:bg-customBlack bg-white px-4 py-8">
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl border border-gray-200/20 dark:border-customBorderColor/50 backdrop-blur-xl p-8 bg-cover bg-center bg-white/10 dark:bg-black/20"
        style={{
          backgroundImage: `url(${LoginBG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <h2 className="text-28 font-black text-center text-white mb-2">
          {t.login}
        </h2>
        <p className="text-16 mb-8 text-center text-white/90 font-medium">
          {t.welcomeBack}
        </p>
        {/* Email Verification Banner */}
        {showEmailVerificationBanner && (
          <div className={`mb-6 p-5 bg-gradient-to-r from-orange-50/90 to-red-50/90 border-l-4 border-orange-500 text-orange-800 rounded-xl shadow-lg backdrop-blur-sm ${isRTL ? 'border-l-0 border-r-4' : ''}`}>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`text-orange-600 text-xl ${isRTL ? 'ml-3' : 'mr-3'}`}>⚠️</span>
                <span className="text-sm font-semibold">{t.emailVerificationBanner}</span>
              </div>
              <button
                onClick={() => setShowEmailVerificationBanner(false)}
                className="text-orange-600 hover:text-orange-800 text-xl font-bold p-1.5 rounded-full hover:bg-orange-100/50 transition-all duration-200"
              >
                ×
              </button>
            </div>
            <button
              onClick={handleSendVerificationEmail}
              className={`mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] ${isResendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isResendingEmail}
            >
              {isResendingEmail ? t.sending : t.sendVerifyEmailLink}
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <CommonInput
            label={t.email}
            labelFontSize="text-16"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={t.enterEmail}
            error={error.email}
            textColor="text-white"
            labelColor="text-white"
            inputBg="bg-white/10 backdrop-blur-sm"
            showErrorOnFocus={true}
            required={true}
          />
          <CommonInput
            label={t.password}
            labelFontSize="text-16"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={t.enterPassword}
            error={error.password}
            textColor="text-white"
            labelColor="text-white"
            inputBg="bg-white/10 backdrop-blur-sm"
            showErrorOnFocus={true}
            showPasswordToggle={true}
            showPasswordValidation={true}
            required={true}
          />

          <div className={`flex items-center justify-between ${isRTL ? 'text-left' : 'text-right'}`}>
            <Link to="/forgot-password" className="text-[#675DFF] hover:text-[#8B7FFF] hover:underline transition-all duration-200 font-semibold text-14">{t.forgotPassword}</Link>
          </div>
          <CommonButton
            text={isLoading ? t.loggingIn : t.login}
            type="submit"
            className="w-full !text-white rounded-xl py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            disabled={isLoading}
          >
            {isLoading ? t.loggingIn : t.login}
          </CommonButton>
        </form>
        {/*
          <div className="space-y-3 mt-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#ffffff29] hover:bg-[#232136]/90 transition-colors duration-200 text-white font-semibold text-16 shadow"
            >
              <img src={Google} alt="Google" className="w-6 h-6" />
              <span class="text-16">Signin with Google</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#ffffff29] hover:bg-[#232136]/90 transition-colors duration-200 text-white font-semibold text-16 shadow"
            >
              <img src={FB} alt="Facebook" className="w-6 h-6" />
              <span class="text-16">Signin with Facebook</span>
            </button>
          </div>
        */}
        <p className={`mt-8 text-[#7A828A] text-14 ${isRTL ? 'text-left' : 'text-right'}`}>
          {t.dontHaveAccount}{' '}
          <Link to="/register" className="font-bold text-[#675DFF] hover:text-[#8B7FFF] hover:underline transition-all duration-200">{t.register}</Link>
        </p>
      </div>
      {/* Test credentials box */}
      {/* <div className={`mt-8 w-full max-w-md bg-white/80 dark:bg-customGray/50 border border-gray-200/50 dark:border-customBorderColor/50 rounded-2xl p-5 text-sm text-gray-700 dark:text-gray-200 shadow-lg backdrop-blur-sm ${isRTL ? 'text-right' : 'text-left'}`}>
        <div><b>{t.testAdmin}</b> <span className="font-mono">admin@plusfive.com / Admin123#</span></div>
        <div><b>{t.testUser}</b> <span className="font-mono">user@plusfive.com / User123#</span></div>
        <div className="mt-2 text-xs text-gray-500">
          <b>{t.passwordRequirements}</b> {t.passwordRequirementsDesc}
        </div>
      </div> */}
    </div>
  );
}

export default Login;
