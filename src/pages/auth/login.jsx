import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CommonButton } from '../../components/index';
import FloatingInput from '../../components/commonComponent/FloatingInput';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import grassBg from '../../assets/grass.png';
import gradient2Bg from '../../assets/gradient2.png';
import gradient6Bg from '../../assets/gradient6.png';
import gradient7Bg from '../../assets/gradient 7.png';
import darkLogo from '../../assets/DarkLogo.png';
import { loginUser, setSubscriptionCache } from '../../redux/actions/authActions';
import { resendVerificationEmail } from '../../redux/services/authService';
import { getCurrentSubscription } from '../../services/stripeService';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthTranslations, getValidationTranslations } from '../../utils/translations';

function Login() {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const t = getAuthTranslations(language);
  const v = getValidationTranslations(language);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerificationBanner, setShowEmailVerificationBanner] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [savedEmails, setSavedEmails] = useState([]);
  const [savedCredentials, setSavedCredentials] = useState({}); // { email: password }
  const [currentBgImage, setCurrentBgImage] = useState(grassBg);
  const [nextBgImage, setNextBgImage] = useState(gradient2Bg);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showDarkOverlay, setShowDarkOverlay] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 0 = grassBg, 1 = gradient2Bg, 2 = gradient6Bg, 3 = gradient7Bg (fourth)
  const [progress, setProgress] = useState(0);
  
  const images = [grassBg, gradient2Bg, gradient6Bg, gradient7Bg]; // Fourth image uses gradient 7.png
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // Load saved emails and credentials from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedEmails');
      if (saved) {
        const emails = JSON.parse(saved);
        setSavedEmails(emails);
      }
      
      const savedCreds = localStorage.getItem('savedCredentials');
      if (savedCreds) {
        const creds = JSON.parse(savedCreds);
        setSavedCredentials(creds);
      }
    } catch (e) {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    // Close any toast that might appear during login flow
    toast.dismiss();
  }, []);

  // Background image rotation every 6 seconds with fade transition
  useEffect(() => {
    // Progress bar animation - fills from 0 to 100% over 6 seconds
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0; // Reset when reaching 100%
        }
        return prev + (100 / (6 * 60)); // Increment per frame (assuming 60fps, 6 seconds = 360 frames)
      });
    }, 16.67); // ~60fps

    // Start transition effect at 5.5 seconds for the first image
    const transitionTimeout = setTimeout(() => {
      setIsTransitioning(true);
      setShowDarkOverlay(true);
    }, 5500);

    const interval = setInterval(() => {
      // Start transition effect at 5.5 seconds
      setTimeout(() => {
        setIsTransitioning(true);
        setShowDarkOverlay(true);
        
        // Switch images at 6.3 seconds (0.8s after transition starts)
        setTimeout(() => {
          setCurrentImageIndex(prev => {
            const nextIdx = (prev + 1) % 4;
            console.log('Switching to image index:', nextIdx, 'Image:', images[nextIdx]);
            return nextIdx;
          });
          
          // Reset progress
          setProgress(0);
          
          // End transition immediately after image switch
          setIsTransitioning(false);
          setShowDarkOverlay(false);
        }, 800); // 0.8 seconds after transition starts (5.5 + 0.8 = 6.3)
      }, 5500); // Start transition at 5.5 seconds
    }, 6000);

    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
      clearTimeout(transitionTimeout);
    };
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    if (!email) return v.emailRequired;
    if (!emailRegex.test(email)) return v.validEmailAddress;
    if (email.length > 50) return v.emailTooLong;
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return v.passwordRequired;
    }
    if (password.length < 8) {
      return ' ';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return ' ';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return ' ';
    }
    if (!/(?=.*\d)/.test(password)) {
      return ' ';
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return ' ';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });

    // Only show errors if user has attempted to submit
    if (hasAttemptedSubmit) {
      if (name === 'email') {
        const emailError = validateEmail(value);
        setError((prev) => ({ ...prev, email: emailError }));
      }

      if (name === 'password') {
        const passwordError = validatePassword(value);
        setError((prev) => ({ ...prev, password: passwordError }));

        setPasswordRequirements({
          minLength: value.length >= 8,
          hasUpperCase: /[A-Z]/.test(value),
          hasLowerCase: /[a-z]/.test(value),
          hasNumber: /\d/.test(value),
          hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        });
      }
    } else {
      // Clear errors when user starts typing (before first submit attempt)
      if (name === 'email' || name === 'password') {
        setError((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleFocus = (e) => {
    // Don't show errors on focus, only after submit attempt
  };

  const handleBlur = (e) => {
    // Only validate on blur if user has attempted to submit
    if (hasAttemptedSubmit) {
      const { name, value } = e.target;
      if (name === 'email') {
        const emailError = validateEmail(value);
        setError((prev) => ({ ...prev, email: emailError }));
      } else if (name === 'password') {
        const passwordError = validatePassword(value);
        setError((prev) => ({ ...prev, password: passwordError }));
      }
    }
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
    
    // Mark that user has attempted to submit
    setHasAttemptedSubmit(true);
    
    let newError = {};

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
      // 1) לוגין רגיל
      await dispatch(loginUser(form.email, form.password));

      // ננקה שגיאות אם הלוגין הצליח
      setError({});

      // נמשוך את ה-userData מלוקאל-סטורג'
      const userData = JSON.parse(localStorage.getItem('userData'));

      // אם זה אדמין – שולחים אותו לפאנל אדמין
      if (userData && userData.role === 'admin') {
        navigate('/admin');
        return;
      }

      // 🟢 DEV MODE: כשאנחנו מריצים npm run dev – לא רוצים Paywall, נכנסים ישר לאפליקציה
      if (import.meta.env.MODE === 'development') {
        console.log('DEV MODE → bypass subscription, navigating to /app');
        navigate('/app');
        return;
      }

      // 🟡 מפה והלאה – לוגיקת מנוי רגילה (רק לפרודקשן)
      let hasActiveSubscription = false;

      // FIRST: cache בלוקאל סטורג'
      try {
        const cachedSub = localStorage.getItem('hasActiveSubscription');
        const cachedExpiry = localStorage.getItem('subscriptionExpiry');

        if (cachedSub === 'true' && cachedExpiry) {
          const expiryDate = new Date(cachedExpiry);
          const now = new Date();
          if (expiryDate > now) {
            hasActiveSubscription = true;
          } else {
            dispatch(setSubscriptionCache(false, null));
          }
        }
      } catch (e) {
        // מתעלמים משגיאות cache
      }

      // SECOND: Stripe API אם אין cache
      if (!hasActiveSubscription) {
        try {
          const stripeSubscriptionData = await getCurrentSubscription();

          const subscriptions = stripeSubscriptionData?.data?.stripe?.subscriptions || [];
          const activeSubscription = subscriptions.find(
            (sub) => sub.status === 'active' && !sub.cancel_at_period_end
          );

          if (activeSubscription) {
            const currentPeriodEnd = activeSubscription.current_period_end;
            if (currentPeriodEnd) {
              const expirationDate = new Date(currentPeriodEnd * 1000);
              const currentDate = new Date();
              hasActiveSubscription = expirationDate.getTime() > currentDate.getTime();

              if (hasActiveSubscription) {
                dispatch(setSubscriptionCache(true, expirationDate.toISOString()));
              }
            } else {
              hasActiveSubscription = true;
              const farFuture = new Date();
              farFuture.setFullYear(farFuture.getFullYear() + 10);
              dispatch(setSubscriptionCache(true, farFuture.toISOString()));
            }
          }
        } catch (stripeError) {
          // אם סטרייפ נופל – נמשיך לפולבק
        }
      }

      // THIRD: fallback לפי userData מהשרת
      if (!hasActiveSubscription) {
        const subscriptionStatus = userData?.subscriptionStatus?.toLowerCase();
        const expirationDate = userData?.subscriptionExpirationDate;
        hasActiveSubscription =
          subscriptionStatus === 'active' &&
          (!expirationDate || new Date(expirationDate) > new Date());
      }

      // במקרה פרודקשן – פה מחליטים לפי מנוי
      if (hasActiveSubscription) {
        // Save email and password to localStorage for future suggestions
        try {
          const saved = localStorage.getItem('savedEmails');
          const emails = saved ? JSON.parse(saved) : [];
          if (!emails.includes(form.email)) {
            emails.unshift(form.email);
            // Keep only last 5 emails
            const limitedEmails = emails.slice(0, 5);
            localStorage.setItem('savedEmails', JSON.stringify(limitedEmails));
            setSavedEmails(limitedEmails);
          }
          
          // Save credentials (email: password)
          const savedCreds = localStorage.getItem('savedCredentials');
          const creds = savedCreds ? JSON.parse(savedCreds) : {};
          creds[form.email] = form.password;
          localStorage.setItem('savedCredentials', JSON.stringify(creds));
          setSavedCredentials(creds);
        } catch (e) {
          // Ignore errors
        }
        navigate('/app');
      } else {
        navigate('/subscription');
      }
    } catch (error) {
      toast.error(error.message || t.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-full h-screen flex">
        {/* Left Panel - Login Form (35%) */}
        <div className="w-full lg:w-[35%] flex flex-col p-8 lg:p-12 bg-white dark:bg-gray-800 relative">
          {/* Logo - Top Left */}
          <div className="absolute top-8 left-8 lg:left-12">
            <img src={darkLogo} alt="Logo" className="h-8 w-auto" />
          </div>
          
          <div className="w-full max-w-md mx-auto flex-1 flex items-center justify-center">
            <div className="w-full">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
              {t.login}
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8 font-sans">
              {language === 'he' 
                ? 'סוכן Ai שמזהה לקוחות בסיכון לפני שהם עוזבים והופך דפוסי נטישה חוזרים להכנסה חוזרת'
                : 'AI agent that identifies at-risk customers before they leave and turns recurring churn patterns into recurring revenue'}
            </p>

            {showEmailVerificationBanner && (
              <div
                className={`mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-l-4 border-orange-500 dark:border-orange-400 text-orange-800 dark:text-orange-200 rounded-lg shadow-sm ${
                  isRTL ? 'border-l-0 border-r-4' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-between ${
                    isRTL ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex items-center ${
                      isRTL ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <span
                      className={`text-orange-600 dark:text-orange-400 text-lg ${
                        isRTL ? 'ml-2' : 'mr-2'
                      }`}
                    >
                      ⚠️
                    </span>
                    <span className="text-sm font-semibold">
                      {t.emailVerificationBanner}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowEmailVerificationBanner(false)}
                    className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200 text-xl font-bold p-1 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200"
                  >
                    ×
                  </button>
                </div>
                <button
                  onClick={handleSendVerificationEmail}
                  className={`mt-3 w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg ${
                    isResendingEmail ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isResendingEmail}
                >
                  {isResendingEmail ? t.sending : t.sendVerifyEmailLink}
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
              <div>
                <FloatingInput
                  label={t.email}
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={t.enterEmail}
                  error={hasAttemptedSubmit ? error.email : ''}
                  suggestions={savedEmails.map(email => ({
                    email,
                    name: email.split('@')[0],
                    avatar: email.charAt(0).toUpperCase()
                  }))}
                  onSuggestionSelect={(suggestion) => {
                    const selectedEmail = suggestion.email || suggestion;
                    setForm({ ...form, email: selectedEmail });
                    setError({ ...error, email: '' });
                    
                    // Auto-fill password if saved for this email
                    if (savedCredentials[selectedEmail]) {
                      setForm(prev => ({ ...prev, password: savedCredentials[selectedEmail] }));
                    }
                  }}
                  autoComplete="email"
                />
              </div>
              
              <div>
                <FloatingInput
                  label={t.password}
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder={t.enterPassword}
                  error={hasAttemptedSubmit ? error.password : ''}
                  showPasswordToggle={true}
                  autoComplete="current-password"
                  suggestions={
                    form.email && savedCredentials[form.email]
                      ? [{
                          email: form.email,
                          name: language === 'he' ? 'השתמש בסיסמה שמורה' : 'Use saved password',
                          password: savedCredentials[form.email],
                          avatar: '🔑'
                        }]
                      : []
                  }
                  onSuggestionSelect={(suggestion) => {
                    if (suggestion.password) {
                      setForm(prev => ({ ...prev, password: suggestion.password }));
                      setError(prev => ({ ...prev, password: '' }));
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setKeepLoggedIn(!keepLoggedIn);
                    }}
                    className="flex-shrink-0 focus:outline-none"
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                        keepLoggedIn
                          ? 'border-[rgba(255,37,124,1)]'
                          : 'border-gray-300 dark:border-gray-500'
                      }`}
                    >
                      {keepLoggedIn && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: 'rgba(255,37,124,1)' }}
                        />
                      )}
                    </span>
                  </button>
                  <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-sm text-gray-600 dark:text-gray-400`}>
                    {language === 'he' ? 'שמור אותי מחובר' : 'Keep me logged in'}
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:underline transition-all duration-200"
                >
                  {language === 'he' ? 'שכחתי את הסיסמה' : 'Forgot my password'}
                </Link>
              </div>
              
              <button
                type="submit"
                className="w-full h-[48px] rounded-full text-md font-semibold flex items-center justify-center bg-black text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? t.loggingIn : t.login.toUpperCase()}
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
                {language === 'he' ? 'אין לך חשבון?' : "Don't have an account?"}{' '}
                <Link
                  to="/register"
                  className="font-semibold text-gray-900 dark:text-white hover:underline transition-all duration-200"
                >
                  {language === 'he' ? 'הירשם עכשיו' : 'Sign up now'}
                </Link>
              </p>
            </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Image Section (65%) */}
        <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden">
          {/* Current Image */}
          <img
            key={`current-${currentImageIndex}`}
            src={images[currentImageIndex]}
            alt="Background"
            className={`absolute inset-0 w-full h-full object-cover ${
              currentImageIndex === 1 ? 'object-bottom' : 
              currentImageIndex === 2 ? 'object-bottom' : 
              currentImageIndex === 3 ? 'object-bottom' : 'object-top'
            }`}
            style={{
              opacity: isTransitioning ? 0 : 1,
              zIndex: 1,
              filter: showDarkOverlay && isTransitioning ? 'brightness(0.3)' : 'brightness(1)',
              transition: isTransitioning 
                ? 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
                : 'filter 0s'
            }}
          />
          
          {/* Dark Overlay for transition effect */}
          <div
            className="absolute inset-0 bg-black z-10"
            style={{
              opacity: showDarkOverlay && isTransitioning ? 0.8 : 0,
              transition: showDarkOverlay && isTransitioning
                ? 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
                : 'opacity 0s',
              pointerEvents: 'none'
            }}
          />
          
          {/* Next Image (for smooth transition) */}
          <img
            key={`next-${(currentImageIndex + 1) % 4}`}
            src={images[(currentImageIndex + 1) % 4]}
            alt="Background"
            className={`absolute inset-0 w-full h-full object-cover ${
              (currentImageIndex + 1) % 4 === 1 ? 'object-bottom' : 
              (currentImageIndex + 1) % 4 === 2 ? 'object-bottom' : 
              (currentImageIndex + 1) % 4 === 3 ? 'object-bottom' : 'object-top'
            }`}
            style={{
              opacity: isTransitioning ? 1 : 0,
              zIndex: 2,
              filter: showDarkOverlay && isTransitioning ? 'brightness(0.3)' : 'brightness(1)',
              transition: isTransitioning 
                ? 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.8s cubic-bezier(0.4, 0, 0.2, 1)' 
                : 'opacity 0s',
              pointerEvents: isTransitioning ? 'auto' : 'none'
            }}
          />

          {/* Navigation Dots - Bottom Left */}
          <div className="absolute bottom-6 left-6 z-20 flex items-center" style={{ gap: '8px' }}>
            {/* Dot 1 - gradient7Bg (fourth image, leftmost) */}
            <div className="relative flex-shrink-0" style={{ width: currentImageIndex === 3 ? '30.24px' : '8px', height: '8px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              {/* Gray ellipse background - always full size */}
              <div 
                className="absolute"
                style={{
                  width: currentImageIndex === 3 ? '30.24px' : '8px',
                  height: '8px',
                  borderRadius: currentImageIndex === 3 ? '4px' : '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  left: 0,
                  top: 0
                }}
              />
              {/* White progress slider */}
              {currentImageIndex === 3 && progress > 0 && (
                <div 
                  className="absolute bg-white"
                  style={{
                    width: '30.24px',
                    height: '8px',
                    borderRadius: '4px',
                    clipPath: `inset(0 ${100 - progress}% 0 0)`,
                    transition: 'clip-path 0.1s linear',
                    left: 0,
                    top: 0
                  }}
                />
              )}
            </div>
            
            {/* Dot 2 - gradient6Bg (third image) */}
            <div className="relative flex-shrink-0" style={{ width: currentImageIndex === 2 ? '30.24px' : '8px', height: '8px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              {/* Gray ellipse background - always full size */}
              <div 
                className="absolute"
                style={{
                  width: currentImageIndex === 2 ? '30.24px' : '8px',
                  height: '8px',
                  borderRadius: currentImageIndex === 2 ? '4px' : '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  left: 0,
                  top: 0
                }}
              />
              {/* White progress slider */}
              {currentImageIndex === 2 && progress > 0 && (
                <div 
                  className="absolute bg-white"
                  style={{
                    width: '30.24px',
                    height: '8px',
                    borderRadius: '4px',
                    clipPath: `inset(0 ${100 - progress}% 0 0)`,
                    transition: 'clip-path 0.1s linear',
                    left: 0,
                    top: 0
                  }}
                />
              )}
            </div>
            
            {/* Dot 3 - gradient2Bg (second image) */}
            <div className="relative flex-shrink-0" style={{ width: currentImageIndex === 1 ? '30.24px' : '8px', height: '8px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              {/* Gray ellipse background - always full size */}
              <div 
                className="absolute"
                style={{
                  width: currentImageIndex === 1 ? '30.24px' : '8px',
                  height: '8px',
                  borderRadius: currentImageIndex === 1 ? '4px' : '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  left: 0,
                  top: 0
                }}
              />
              {/* White progress slider */}
              {currentImageIndex === 1 && progress > 0 && (
                <div 
                  className="absolute bg-white"
                  style={{
                    width: '30.24px',
                    height: '8px',
                    borderRadius: '4px',
                    clipPath: `inset(0 ${100 - progress}% 0 0)`,
                    transition: 'clip-path 0.1s linear',
                    left: 0,
                    top: 0
                  }}
                />
              )}
            </div>
            
            {/* Dot 4 - grassBg (first image, rightmost) */}
            <div className="relative flex-shrink-0" style={{ width: currentImageIndex === 0 ? '30.24px' : '8px', height: '8px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              {/* Gray ellipse background - always full size */}
              <div 
                className="absolute"
                style={{
                  width: currentImageIndex === 0 ? '30.24px' : '8px',
                  height: '8px',
                  borderRadius: currentImageIndex === 0 ? '4px' : '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  left: 0,
                  top: 0
                }}
              />
              {/* White progress slider */}
              {currentImageIndex === 0 && progress > 0 && (
                <div 
                  className="absolute bg-white"
                  style={{
                    width: '30.24px',
                    height: '8px',
                    borderRadius: '4px',
                    clipPath: `inset(0 ${100 - progress}% 0 0)`,
                    transition: 'clip-path 0.1s linear',
                    left: 0,
                    top: 0
                  }}
                />
              )}
            </div>
          </div>

          {/* Text Overlay */}
          <div className="relative z-10 flex flex-col justify-end p-12 h-full">
            <div className="text-white drop-shadow-lg">
              <div className="space-y-4">
                {currentImageIndex === 1 ? (
                  // Image 2 - gradient2Bg
                  <>
                    <h3 className="text-3xl lg:text-4xl font-serif font-bold leading-tight">
                      {language === 'he' ? (
                        <>
                          זה לא קורה ביום אחד,
                        </>
                      ) : (
                        <>
                          It doesn't happen in one day,
                        </>
                      )}
                    </h3>
                    <p className="text-lg font-sans text-white drop-shadow-md max-w-lg">
                      {language === 'he' 
                        ? 'זה קורה כשאף אחד לא שם לב.'
                        : 'it happens when no one is paying attention.'}
                    </p>
                    <p className="text-lg font-sans text-white drop-shadow-md max-w-lg">
                      {language === 'he' 
                        ? 'הנטישה מתחילה בסימנים קטנים: פחות תורים, יותר דחיות, יותר שקט.'
                        : 'Churn starts with small signs: fewer appointments, more cancellations, more silence.'}
                    </p>
                  </>
                ) : currentImageIndex === 2 ? (
                  // Image 3 - gradient6Bg (third)
                  <>
                    <h3 className="text-3xl lg:text-4xl font-serif font-bold leading-tight">
                      {language === 'he' ? (
                        <>
                          עד עכשיו, שימור לקוחות היה בעיקר תחושת בטן.
                        </>
                      ) : (
                        <>
                          Until now, customer retention was mostly gut feeling.
                        </>
                      )}
                    </h3>
                    <p className="text-lg font-sans text-white drop-shadow-md max-w-lg">
                      {language === 'he' 
                        ? 'Plusfive הוא סוכן AI שמנתח את התנהגות הלקוחות שלך, מזהה בזמן אמת מי נכנס לסיכון ופועל כדי לעצור את הנטישה.'
                        : 'Plusfive is an AI agent that analyzes your customers\' behavior, identifies in real-time who is at risk, and acts to stop churn.'}
                    </p>
                    <p className="text-lg font-sans text-white drop-shadow-md max-w-lg">
                      {language === 'he' 
                        ? 'בלי ניחושים, בלי מעקב ידני, ובלי לאבד הכנסות בשקט.'
                        : 'No guessing, no manual tracking, and no losing revenue quietly.'}
                    </p>
                  </>
                ) : currentImageIndex === 3 ? (
                  // Image 4 - gradient7Bg (fourth)
                  <>
                    <h3 className="text-3xl lg:text-4xl font-serif font-bold leading-tight">
                      {language === 'he' ? (
                        <>
                          תן ל-Plusfive לזהות, לפעול, ולשמור על ההכנסה שלך.
                        </>
                      ) : (
                        <>
                          Let Plusfive identify, act, and preserve your revenue.
                        </>
                      )}
                    </h3>
                    <p className="text-lg font-sans text-white drop-shadow-md max-w-lg">
                      {language === 'he' 
                        ? 'הירשם עכשיו וגלה איך זה עובד.'
                        : 'Sign up now and discover how it works.'}
                    </p>
                  </>
                ) : (
                  // Image 1 - grassBg (first)
                  <>
                    <h3 className="text-3xl lg:text-4xl font-serif font-bold leading-tight">
                      {language === 'he' ? (
                        <>
                          אחד מכל שלושה לקוחות פשוט ייעלם השנה,
                        </>
                      ) : (
                        <>
                          One in three customers will simply disappear this year,
                        </>
                      )}
                    </h3>
                    <p className="text-lg font-sans text-white drop-shadow-md max-w-lg">
                      {language === 'he' 
                        ? 'בלי הודעה. בלי תלונה. הם פשוט ייעלמו.'
                        : 'No message. No complaint. They\'ll just disappear.'}
                    </p>
                    <p className="text-lg font-sans text-white drop-shadow-md max-w-lg">
                      {language === 'he' 
                        ? 'ומה אם היית מזהה אותו רגע לפני שהוא נוטש?'
                        : 'What if you could identify them just before they churn?'}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
