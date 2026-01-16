import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import FloatingInput from '../../components/commonComponent/FloatingInput';
import { CommonNormalDropDown } from '../../components/index';
import grassBg from '../../assets/grass.png';
import darkLogo from '../../assets/DarkLogo.png';
import { registerUser, resendVerificationEmail, createReferral } from '../../redux/services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthTranslations, getValidationTranslations } from '../../utils/translations';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/actions/authActions';
import { formatPhoneForBackend } from '../../utils/phoneHelpers';

const businessTypes = [
  { value: '', label: 'Select business type' },
  { value: 'salon', label: 'Salon' },
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'nails-salon', label: 'Nails Salon' },
  { value: 'spa', label: 'Spa' },
  { value: 'medspa', label: 'Medspa' },
  { value: 'massage', label: 'Massage' },
  { value: 'tattoo-piercing', label: 'Tattoo & Piercing' },
  { value: 'tanning-studio', label: 'Tanning Studio' },
];

function Register() {
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const t = getAuthTranslations(language);
  const v = getValidationTranslations(language);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Check for ref parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setForm(prev => ({ ...prev, referralCode: refCode }));
    }
  }, [location]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
    referralCode: '',
  });
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showEmailVerificationBanner, setShowEmailVerificationBanner] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [savedEmails, setSavedEmails] = useState([]);
  const [currentStep, setCurrentStep] = useState(1); // 1-4

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });

    // Only show errors if user has attempted to submit
    if (hasAttemptedSubmit) {
      // Real-time validation for email
      if (name === 'email') {
        const emailError = validateEmail(value);
        setError(prev => ({ ...prev, email: emailError }));
      }

      // Real-time validation for password
      if (name === 'password') {
        const passwordError = validatePassword(value);
        setError(prev => ({ ...prev, password: passwordError }));

        // Also validate confirm password if it exists
        if (form.confirmPassword) {
          if (value !== form.confirmPassword) {
            setError(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
          } else {
            setError(prev => ({ ...prev, confirmPassword: '' }));
          }
        }
      }

      // Real-time validation for confirm password
      if (name === 'confirmPassword') {
        if (!value) {
          setError(prev => ({ ...prev, confirmPassword: v.pleaseConfirmPassword }));
        } else if (form.password !== value) {
          setError(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
        } else {
          setError(prev => ({ ...prev, confirmPassword: '' }));
        }
      }

      // Real-time validation for other fields
      if (name === 'firstName') {
        if (!value.trim()) {
          setError(prev => ({ ...prev, firstName: v.firstNameRequired }));
        } else if (!/^[a-zA-Z]+$/.test(value.trim())) {
          setError(prev => ({ ...prev, firstName: v.firstNameLettersOnly }));
        } else if (value.trim().length < 2) {
          setError(prev => ({ ...prev, firstName: v.firstNameMinLength }));
        } else if (value.trim().length > 50) {
          setError(prev => ({ ...prev, firstName: v.firstNameTooLong }));
        } else {
          setError(prev => ({ ...prev, firstName: '' }));
        }
      }

      if (name === 'lastName') {
        if (!value.trim()) {
          setError(prev => ({ ...prev, lastName: v.lastNameRequired }));
        } else if (!/^[a-zA-Z]+$/.test(value.trim())) {
          setError(prev => ({ ...prev, lastName: v.lastNameLettersOnly }));
        } else if (value.trim().length < 2) {
          setError(prev => ({ ...prev, lastName: v.lastNameMinLength }));
        } else if (value.trim().length > 50) {
          setError(prev => ({ ...prev, lastName: v.lastNameTooLong }));
        } else {
          setError(prev => ({ ...prev, lastName: '' }));
        }
      }

      if (name === 'phoneNumber') {
        if (!value.trim()) {
          setError(prev => ({ ...prev, phoneNumber: v.phoneRequired }));
        } else if (!/^[0-9]+$/.test(value.replace(/\s/g, ''))) {
          setError(prev => ({ ...prev, phoneNumber: v.phoneNumbersOnly }));
        } else if (value.replace(/\s/g, '').length !== 10) {
          setError(prev => ({ ...prev, phoneNumber: v.phoneExactDigits }));
        } else {
          setError(prev => ({ ...prev, phoneNumber: '' }));
        }
      }

      if (name === 'businessName') {
        if (!value.trim()) {
          setError(prev => ({ ...prev, businessName: v.businessNameRequired }));
        } else if (value.trim().length < 2) {
          setError(prev => ({ ...prev, businessName: v.businessNameMinLength }));
        } else if (value.trim().length > 100) {
          setError(prev => ({ ...prev, businessName: v.businessNameTooLong }));
        } else {
          setError(prev => ({ ...prev, businessName: '' }));
        }
      }
    } else {
      // Clear errors when user starts typing (before first submit attempt)
      if (name === 'email' || name === 'password' || name === 'confirmPassword' || 
          name === 'firstName' || name === 'lastName' || name === 'phoneNumber' || 
          name === 'businessName') {
        setError(prev => ({ ...prev, [name]: '' }));
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
        setError(prev => ({ ...prev, email: emailError }));
      } else if (name === 'password') {
        const passwordError = validatePassword(value);
        setError(prev => ({ ...prev, password: passwordError }));
      } else if (name === 'confirmPassword') {
        if (value && form.password !== value) {
          setError(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
        }
      } else if (name === 'firstName') {
        if (!value.trim()) {
          setError(prev => ({ ...prev, firstName: v.firstNameRequired }));
        } else if (!/^[a-zA-Z]+$/.test(value.trim())) {
          setError(prev => ({ ...prev, firstName: v.firstNameLettersOnly }));
        } else if (value.trim().length < 2) {
          setError(prev => ({ ...prev, firstName: v.firstNameMinLength }));
        } else if (value.trim().length > 50) {
          setError(prev => ({ ...prev, firstName: v.firstNameTooLong }));
        }
      } else if (name === 'lastName') {
        if (!value.trim()) {
          setError(prev => ({ ...prev, lastName: v.lastNameRequired }));
        } else if (!/^[a-zA-Z]+$/.test(value.trim())) {
          setError(prev => ({ ...prev, lastName: v.lastNameLettersOnly }));
        } else if (value.trim().length < 2) {
          setError(prev => ({ ...prev, lastName: v.lastNameMinLength }));
        } else if (value.trim().length > 50) {
          setError(prev => ({ ...prev, lastName: v.lastNameTooLong }));
        }
      } else if (name === 'phoneNumber') {
        if (!value.trim()) {
          setError(prev => ({ ...prev, phoneNumber: v.phoneRequired }));
        } else if (!/^[0-9]+$/.test(value.replace(/\s/g, ''))) {
          setError(prev => ({ ...prev, phoneNumber: v.phoneNumbersOnly }));
        } else if (value.replace(/\s/g, '').length !== 10) {
          setError(prev => ({ ...prev, phoneNumber: v.phoneExactDigits }));
        }
      } else if (name === 'businessName') {
        if (!value.trim()) {
          setError(prev => ({ ...prev, businessName: v.businessNameRequired }));
        } else if (value.trim().length < 2) {
          setError(prev => ({ ...prev, businessName: v.businessNameMinLength }));
        } else if (value.trim().length > 100) {
          setError(prev => ({ ...prev, businessName: v.businessNameTooLong }));
        }
      }
    }
  };

  // Email validation function
  const validateEmail = (email) => {
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
    // Don't show detailed errors, just return empty string if password doesn't meet requirements
    // The password requirements are handled by the UI component
    if (password.length < 8) {
      return "";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "";
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return "";
    }
    return "";
  };

  const validate = () => {
    const newError = {};

    // First Name validation
    if (!form.firstName.trim()) {
      newError.firstName = v.firstNameRequired;
    } else if (!/^[a-zA-Z]+$/.test(form.firstName.trim())) {
      newError.firstName = v.firstNameLettersOnly;
    } else if (form.firstName.trim().length < 2) {
      newError.firstName = v.firstNameMinLength;
    } else if (form.firstName.trim().length > 50) {
      newError.firstName = v.firstNameTooLong;
    }

    // Last Name validation
    if (!form.lastName.trim()) {
      newError.lastName = v.lastNameRequired;
    } else if (!/^[a-zA-Z]+$/.test(form.lastName.trim())) {
      newError.lastName = v.lastNameLettersOnly;
    } else if (form.lastName.trim().length < 2) {
      newError.lastName = v.lastNameMinLength;
    } else if (form.lastName.trim().length > 50) {
      newError.lastName = v.lastNameTooLong;
    }

    // Email validation
    const emailError = validateEmail(form.email);
    if (emailError) {
      newError.email = emailError;
    }

    // Phone validation
    if (!form.phoneNumber.trim()) {
      newError.phoneNumber = v.phoneRequired;
    } else if (!/^[0-9]+$/.test(form.phoneNumber.replace(/\s/g, ''))) {
      newError.phoneNumber = v.phoneNumbersOnly;
    } else if (form.phoneNumber.replace(/\s/g, '').length !== 10) {
      newError.phoneNumber = v.phoneExactDigits;
    }

    // Password validation
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      newError.password = passwordError;
    }

    // Confirm Password validation
    if (!form.confirmPassword) {
      newError.confirmPassword = v.pleaseConfirmPassword;
    } else if (form.password !== form.confirmPassword) {
      newError.confirmPassword = v.passwordsDoNotMatch;
    }

    // Business Name validation
    if (!form.businessName.trim()) {
      newError.businessName = v.businessNameRequired;
    } else if (form.businessName.trim().length < 2) {
      newError.businessName = v.businessNameMinLength;
    } else if (form.businessName.trim().length > 100) {
      newError.businessName = v.businessNameTooLong;
    }

    // Business Type validation
    if (!form.businessType) {
      newError.businessType = v.businessTypeRequired;
    }

    return newError;
  };

  const handleDropDownChange = (value) => {
    setForm({ ...form, businessType: value });
    if (hasAttemptedSubmit) {
      setError(prev => ({ ...prev, businessType: value ? '' : v.businessTypeRequired }));
    }
  };

  // Validate current step
  const validateStep = (step) => {
    const newError = {};
    
    if (step === 1) {
      // First Name & Last Name
      if (!form.firstName.trim()) {
        newError.firstName = v.firstNameRequired;
      } else if (!/^[a-zA-Z]+$/.test(form.firstName.trim())) {
        newError.firstName = v.firstNameLettersOnly;
      } else if (form.firstName.trim().length < 2) {
        newError.firstName = v.firstNameMinLength;
      } else if (form.firstName.trim().length > 50) {
        newError.firstName = v.firstNameTooLong;
      }
      
      if (!form.lastName.trim()) {
        newError.lastName = v.lastNameRequired;
      } else if (!/^[a-zA-Z]+$/.test(form.lastName.trim())) {
        newError.lastName = v.lastNameLettersOnly;
      } else if (form.lastName.trim().length < 2) {
        newError.lastName = v.lastNameMinLength;
      } else if (form.lastName.trim().length > 50) {
        newError.lastName = v.lastNameTooLong;
      }
    } else if (step === 2) {
      // Email & Phone
      const emailError = validateEmail(form.email);
      if (emailError) {
        newError.email = emailError;
      }
      
      if (!form.phoneNumber.trim()) {
        newError.phoneNumber = v.phoneRequired;
      } else if (!/^[0-9]+$/.test(form.phoneNumber.replace(/\s/g, ''))) {
        newError.phoneNumber = v.phoneNumbersOnly;
      } else if (form.phoneNumber.replace(/\s/g, '').length !== 10) {
        newError.phoneNumber = v.phoneExactDigits;
      }
    } else if (step === 3) {
      // Business Name & Business Type
      if (!form.businessName.trim()) {
        newError.businessName = v.businessNameRequired;
      } else if (form.businessName.trim().length < 2) {
        newError.businessName = v.businessNameMinLength;
      } else if (form.businessName.trim().length > 100) {
        newError.businessName = v.businessNameTooLong;
      }
      
      if (!form.businessType) {
        newError.businessType = v.businessTypeRequired;
      }
    } else if (step === 4) {
      // Password & Confirm Password
      if (!form.password) {
        newError.password = v.passwordRequired;
      } else if (form.password.length < 8) {
        newError.password = v.passwordMinLength || "Password must be at least 8 characters";
      } else if (!/(?=.*[a-z])/.test(form.password)) {
        newError.password = v.passwordLowercase || "Password must contain a lowercase letter";
      } else if (!/(?=.*[A-Z])/.test(form.password)) {
        newError.password = v.passwordUppercase || "Password must contain an uppercase letter";
      } else if (!/(?=.*\d)/.test(form.password)) {
        newError.password = v.passwordNumber || "Password must contain a number";
      } else if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(form.password)) {
        newError.password = v.passwordSpecialChar || "Password must contain a special character";
      }
      
      if (!form.confirmPassword) {
        newError.confirmPassword = v.pleaseConfirmPassword;
      } else if (form.password !== form.confirmPassword) {
        newError.confirmPassword = v.passwordsDoNotMatch;
      }
    }
    
    return newError;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    setError(stepErrors);
    
    if (Object.keys(stepErrors).length === 0) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      setHasAttemptedSubmit(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
    
    // If not on last step, validate current step and move forward
    if (currentStep < 4) {
      handleNext();
      return;
    }
    
    // On last step, validate everything
    setHasAttemptedSubmit(true);
    
    console.log('🔍 Starting validation for step:', currentStep);
    console.log('📋 Form data:', {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      businessName: form.businessName,
      businessType: form.businessType,
      password: form.password ? '***' : '',
      confirmPassword: form.confirmPassword ? '***' : '',
    });
    
    // Validate all steps
    const allErrors = validate();
    
    console.log('🔍 All errors from validate():', allErrors);
    
    // Filter out empty string errors (from password validation that returns " ")
    const filteredErrors = {};
    Object.keys(allErrors).forEach(key => {
      if (allErrors[key] && allErrors[key].trim() !== '' && allErrors[key] !== ' ') {
        filteredErrors[key] = allErrors[key];
      }
    });
    
    console.log('🔍 Filtered errors:', filteredErrors);
    console.log('🔍 Number of errors:', Object.keys(filteredErrors).length);
    
    setError(filteredErrors);

    if (Object.keys(filteredErrors).length > 0) {
      console.log('❌ Validation errors found, stopping submission:', filteredErrors);
      // If there are errors, go back to first step with error
      const firstErrorStep = Object.keys(filteredErrors).find(key => {
        if (['firstName', 'lastName'].includes(key)) return 1;
        if (['email', 'phoneNumber'].includes(key)) return 2;
        if (['businessName', 'businessType'].includes(key)) return 3;
        if (['password', 'confirmPassword'].includes(key)) return 4;
        return null;
      });
      
      if (firstErrorStep) {
        console.log('📍 Moving to step with first error:', firstErrorStep);
        if (['firstName', 'lastName'].includes(firstErrorStep)) setCurrentStep(1);
        else if (['email', 'phoneNumber'].includes(firstErrorStep)) setCurrentStep(2);
        else if (['businessName', 'businessType'].includes(firstErrorStep)) setCurrentStep(3);
      }
      return;
    }
    
    console.log('✅ All validations passed, proceeding to submit form...');

    setIsLoading(true);
    try {
      // Prepare user data with actual form values
      const userData = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        businessName: form.businessName,
        businessType: form.businessType,
        phoneNumber: formatPhoneForBackend(form.phoneNumber),
        referralCode: form.referralCode
      };

      // Call register API
      console.log('📤 Sending registration request with data:', {
        ...userData,
        password: '***',
      });
      
      const registeredUser = await registerUser(userData);
      
      console.log('✅ Registration response received:', {
        hasData: !!registeredUser.data,
        hasToken: !!registeredUser.data?.token,
        hasUser: !!registeredUser.data?.user,
        user: registeredUser.data?.user,
        token: registeredUser.data?.token ? '***' : null,
      });

      // Check if referral code exists and create referral
      const urlParams = new URLSearchParams(location.search);
      const refCode = urlParams.get('ref');

      if (refCode && registeredUser.data?.user?.id) {
        try {
          const referralResponse = await createReferral({
            referrerCode: refCode,
            referredUserId: registeredUser.data.user.id
          });
        } catch (referralError) {
          // Don't fail registration if referral fails
          console.warn('⚠️ Referral creation failed:', referralError);
        }
      }

      // Auto-login user after successful registration
      // Check if backend returned token (new flow)
      console.log('🔍 Checking registration response structure:', {
        'registeredUser.data': registeredUser.data,
        'registeredUser.data.token': registeredUser.data?.token,
        'registeredUser.data.user': registeredUser.data?.user,
      });
      
      if (registeredUser.data?.token && registeredUser.data?.user) {
        console.log('✅ Token and user found, proceeding with auto-login...');
        // Dispatch login action with token and user data
        dispatch({
          type: 'LOGIN_SUCCESS',
          accessToken: registeredUser.data.token,
          user: registeredUser.data.user
        });
        
        // Store token and user data in localStorage
        localStorage.setItem('token', registeredUser.data.token);
        localStorage.setItem('userData', JSON.stringify(registeredUser.data.user));
        localStorage.setItem('userRole', registeredUser.data.user.role);
        
        // Clear subscription cache since new user doesn't have subscription
        localStorage.removeItem('hasActiveSubscription');
        localStorage.removeItem('subscriptionExpiry');
        
        // Success message
        toast.success(t.registrationSuccessful);
        setError({});
        
        // Redirect to subscription page immediately (new user won't have subscription)
        // Use replace: true to prevent back button access to /app routes
        navigate('/app', { replace: true });
      } else {
        // Fallback: If token not available, show success and redirect to login
        toast.success(t.registrationSuccessful);
        setShowEmailVerificationBanner(true);
        setError({});
        // Note: This should not happen if backend is updated correctly
      }
    } catch (error) {
      // Show more detailed error message
      let errorMessage = error.message || t.registrationFailed;
      if (
        error.message?.includes('No response received from server') || 
        error.message?.includes('network') ||
        error.message?.includes('Network Error') ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ERR_NETWORK' ||
        !error.response
      ) {
        errorMessage = language === 'he' 
          ? '❌ בעיה עם השרת: אין תגובה מהשרת. אנא בדוק שהשרת פועל על http://localhost:3000'
          : '❌ Server problem: No response from server. Please check that the server is running on http://localhost:3000';
      }
      console.error('❌ שגיאה בהרשמה:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        response: error.response,
        stack: error.stack
      });
      toast.error(errorMessage);
      // Don't clear errors on failed registration
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-full h-screen flex">
        {/* Left Panel - Register Form (35%) */}
        <div className="w-full lg:w-[35%] flex flex-col p-8 lg:p-12 bg-white dark:bg-gray-800 overflow-y-auto relative">
          {/* Logo - Top Left */}
          <div className="absolute top-8 left-8 lg:left-12 z-10">
            <img src={darkLogo} alt="Logo" className="h-8 w-auto" />
          </div>
          
          <div className="w-full max-w-md mx-auto flex-1 flex items-center justify-center">
            <div className="w-full">
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                {t.signUp}
              </h2>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-8 font-sans">
              {t.welcomeBack}
            </p>

            {/* Email Verification Banner */}
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

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        currentStep >= step
                          ? 'bg-black text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 transition-all ${
                          currentStep > step
                            ? 'bg-black dark:bg-white'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              {/* Step 1: First Name & Last Name */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label={t.firstName}
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder={t.enterFirstName}
                      error={hasAttemptedSubmit ? error.firstName : ''}
                      required={true}
                    />
                    <FloatingInput
                      label={t.lastName}
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder={t.enterLastName}
                      error={hasAttemptedSubmit ? error.lastName : ''}
                      required={true}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Email & Phone */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      }}
                      autoComplete="email"
                      required={true}
                    />
                    <FloatingInput
                      label={t.phoneNumber}
                      id="phoneNumber"
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder={t.enterPhoneNumber}
                      error={hasAttemptedSubmit ? error.phoneNumber : ''}
                      required={true}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Business Name & Business Type */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingInput
                      label={t.businessName}
                      id="businessName"
                      name="businessName"
                      value={form.businessName}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder={t.enterBusinessName}
                      error={hasAttemptedSubmit ? error.businessName : ''}
                      required={true}
                    />
                    <div className="relative" style={{ minHeight: '56px' }}>
                      <div className="absolute top-0 left-0 text-xs text-gray-900 dark:text-white">
                        {t.businessType}
                        <span className="text-red-500 ml-1">*</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 border-b border-black dark:border-white" style={{ height: '1px' }} />
                      <div className="absolute bottom-2 left-0 right-0">
                        <CommonNormalDropDown
                          options={businessTypes}
                          value={form.businessType}
                          onChange={handleDropDownChange}
                          bgColor="bg-transparent"
                          textColor="text-gray-900 dark:text-white"
                          fontSize="text-base"
                          showIcon={false}
                          borderRadius="rounded-none"
                          width="w-full"
                          inputWidth="w-full"
                          inputBorderRadius="rounded-none"
                          padding="px-0 py-0"
                          placeholder="Select business type"
                        />
                      </div>
                      {hasAttemptedSubmit && error.businessType && (
                        <div className="mt-1 text-sm text-red-500 flex items-center gap-1">
                          <span>{error.businessType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Password & Confirm Password */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      required={true}
                    />
                    <FloatingInput
                      label={t.confirmNewPassword}
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder={t.enterConfirmPassword}
                      error={hasAttemptedSubmit ? error.confirmPassword : ''}
                      showPasswordToggle={true}
                      required={true}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 mt-8">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="flex-1 h-[48px] rounded-full text-md font-semibold flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:opacity-90 transition"
                  >
                    {language === 'he' ? 'הקודם' : 'Previous'}
                  </button>
                )}
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`${currentStep > 1 ? 'flex-1' : 'w-full'} h-[48px] rounded-full text-md font-semibold flex items-center justify-center bg-black text-white hover:opacity-90 transition`}
                  >
                    {language === 'he' ? 'הבא' : 'Next'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className={`${currentStep > 1 ? 'flex-1' : 'w-full'} h-[48px] rounded-full text-md font-semibold flex items-center justify-center bg-black text-white hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isLoading}
                  >
                    {isLoading ? t.signingUp : t.signUp.toUpperCase()}
                  </button>
                )}
              </div>
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
                {t.alreadyHaveAccount}{' '}
                <Link
                  to="/login"
                  className="font-semibold text-gray-900 dark:text-white hover:underline transition-all duration-200"
                >
                  {t.loginLink}
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

export default Register;
