import React, { useState, useEffect } from 'react';
import { CommonInput, CommonButton, SquaresAnim, CommonNormalDropDown } from '../../components/index';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginBG from '../../assets/LoginBG.png';
import FB from '../../assets/fb.svg';
import Google from '../../assets/google.svg';
import { emailService } from '../../services/emailService';
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
  const [showEmailVerificationBanner, setShowEmailVerificationBanner] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });

    // Real-time validation for email
    if (name === 'email') {
      if (!value) {
        setError(prev => ({ ...prev, email: "" }));
      } else {
        const emailError = validateEmail(value);
        setError(prev => ({ ...prev, email: emailError }));
      }
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
        setError(prev => ({ ...prev, confirmPassword: "" }));
      } else if (form.password !== value) {
        setError(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
      } else {
        setError(prev => ({ ...prev, confirmPassword: "" }));
      }
    }

    // Real-time validation for other fields
    if (name === 'firstName') {
      if (!value.trim()) {
        setError(prev => ({ ...prev, firstName: "" }));
      } else if (!/^[a-zA-Z]+$/.test(value.trim())) {
        setError(prev => ({ ...prev, firstName: v.firstNameLettersOnly }));
      } else if (value.trim().length < 2) {
        setError(prev => ({ ...prev, firstName: v.firstNameMinLength }));
      } else if (value.trim().length > 50) {
        setError(prev => ({ ...prev, firstName: v.firstNameTooLong }));
      } else {
        setError(prev => ({ ...prev, firstName: "" }));
      }
    }

    if (name === 'lastName') {
      if (!value.trim()) {
        setError(prev => ({ ...prev, lastName: "" }));
      } else if (!/^[a-zA-Z]+$/.test(value.trim())) {
        setError(prev => ({ ...prev, lastName: v.lastNameLettersOnly }));
      } else if (value.trim().length < 2) {
        setError(prev => ({ ...prev, lastName: v.lastNameMinLength }));
      } else if (value.trim().length > 50) {
        setError(prev => ({ ...prev, lastName: v.lastNameTooLong }));
      } else {
        setError(prev => ({ ...prev, lastName: "" }));
      }
    }

    if (name === 'phoneNumber') {
      if (!value.trim()) {
        setError(prev => ({ ...prev, phoneNumber: "" }));
      } else if (!/^[0-9]+$/.test(value.replace(/\s/g, ''))) {
        setError(prev => ({ ...prev, phoneNumber: v.phoneNumbersOnly }));
      } else if (value.replace(/\s/g, '').length !== 10) {
        setError(prev => ({ ...prev, phoneNumber: v.phoneExactDigits }));
      } else {
        setError(prev => ({ ...prev, phoneNumber: "" }));
      }
    }

    if (name === 'businessName') {
      if (!value.trim()) {
        setError(prev => ({ ...prev, businessName: "" }));
      } else if (value.trim().length < 2) {
        setError(prev => ({ ...prev, businessName: v.businessNameMinLength }));
      } else if (value.trim().length > 100) {
        setError(prev => ({ ...prev, businessName: v.businessNameTooLong }));
      } else {
        setError(prev => ({ ...prev, businessName: "" }));
      }
    }
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    // Show validation error immediately when user focuses on field
    if (name === 'email') {
      if (!form.email) {
        setError(prev => ({ ...prev, email: t.emailRequired }));
      } else {
        const emailError = validateEmail(form.email);
        if (emailError) {
          setError(prev => ({ ...prev, email: emailError }));
        }
      }
    } else if (name === 'confirmPassword') {
      if (!form.confirmPassword) {
        setError(prev => ({ ...prev, confirmPassword: v.pleaseConfirmPassword }));
      } else if (form.password !== form.confirmPassword) {
        setError(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
      }
    } else if (name === 'firstName') {
      if (!form.firstName.trim()) {
        setError(prev => ({ ...prev, firstName: v.firstNameRequired }));
      }
    } else if (name === 'lastName') {
      if (!form.lastName.trim()) {
        setError(prev => ({ ...prev, lastName: v.lastNameRequired }));
      }
    } else if (name === 'phoneNumber') {
      if (!form.phoneNumber.trim()) {
        setError(prev => ({ ...prev, phoneNumber: v.phoneRequired }));
      }
    } else if (name === 'businessName') {
      if (!form.businessName.trim()) {
        setError(prev => ({ ...prev, businessName: v.businessNameRequired }));
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
    } else if (name === 'confirmPassword') {
      if (value && form.password !== value) {
        setError(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
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
    setError(prev => ({ ...prev, businessType: undefined }));
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
    const validationErrors = validate();
    setError(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

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
      const registeredUser = await registerUser(userData);

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
        }
      }

      // Auto-login user after successful registration
      // Check if backend returned token (new flow)
      if (registeredUser.data?.token && registeredUser.data?.user) {
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
      if (error.message?.includes('No response received from server') || error.message?.includes('network')) {
        errorMessage = '❌ בעיה עם השרת: אין תגובה מהשרת. אנא בדוק שהשרת פועל על http://localhost:3000';
      }
      console.error('❌ שגיאה בהרשמה:', error);
      toast.error(errorMessage);
      // Don't clear errors on failed registration
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-customBrown rounded-2xl shadow-2xl border border-gray-200 dark:border-customBorderColor backdrop-blur-md p-8"
        style={{
          backgroundImage: `url(${LoginBG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <h2 className="text-24 font-extrabold text-center text-white">
          {t.signUp}
        </h2>
        <p className="text-14 mb-6 text-center text-white">
          {t.welcomeBack}
        </p>

        {/* Email Verification Banner */}
        {showEmailVerificationBanner && (
          <div className={`mb-6 p-5 bg-gradient-to-r from-green-50/90 to-blue-50/90 border-l-4 border-green-500 text-green-800 rounded-xl shadow-lg backdrop-blur-sm ${isRTL ? 'border-l-0 border-r-4' : ''}`}>
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`text-green-600 text-xl ${isRTL ? 'ml-3' : 'mr-3'}`}>✅</span>
                <span className="text-sm font-semibold">{t.registrationSuccessful}! {t.emailVerificationBanner}</span>
              </div>
              <button
                onClick={() => setShowEmailVerificationBanner(false)}
                className="text-green-600 hover:text-green-800 text-xl font-bold ml-2 p-1.5 rounded-full hover:bg-green-100/50 transition-all duration-200"
              >
                ×
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-green-700">
                📧 Check your email inbox for verification link<br />
                🔗 Click the verification link to activate your account<br />
                🚀 Then login to access your dashboard
              </p>
            </div>
            <button
              onClick={handleSendVerificationEmail}
              className={`mt-4 w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] ${isResendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isResendingEmail}
            >
              {isResendingEmail ? t.sending : t.sendVerifyEmailLink}
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommonInput
              label={t.firstName}
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              showErrorOnFocus={true}
              placeholder={t.enterFirstName}
              error={error.firstName}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-white/10 backdrop-blur-sm"
              labelFontSize="text-16"
              required={true}
            />
            <CommonInput
              label={t.lastName}
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              showErrorOnFocus={true}
              placeholder={t.enterLastName}
              error={error.lastName}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-white/10 backdrop-blur-sm"
              labelFontSize="text-16"
              required={true}
            />
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommonInput
              label={t.email}
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              showErrorOnFocus={true}
              placeholder={t.enterEmail}
              error={error.email}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-white/10 backdrop-blur-sm"
              labelFontSize="text-16"
              required={true}
            />
            <CommonInput
              label={t.phoneNumber}
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              showErrorOnFocus={true}
              placeholder={t.enterPhoneNumber}
              error={error.phoneNumber}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-white/10 backdrop-blur-sm"
              labelFontSize="text-16"
              required={true}
            />
          </div>

          {/* Row 3: Password & Confirm Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommonInput
              label={t.password}
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              showErrorOnFocus={true}
              placeholder={t.enterPassword}
              error={error.password}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-white/10 backdrop-blur-sm"
              labelFontSize="text-16"
              showPasswordToggle={true}
              showPasswordValidation={true}
              required={true}
            />
            <CommonInput
              label={t.confirmNewPassword}
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              showErrorOnFocus={true}
              placeholder={t.enterConfirmPassword}
              error={error.confirmPassword}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-white/10 backdrop-blur-sm"
              labelFontSize="text-16"
              showPasswordToggle={true}
              required={true}
            />
          </div>

          {/* Row 4: Business Name & Business Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CommonInput
              label={t.businessName}
              id="businessName"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              showErrorOnFocus={true}
              placeholder={t.enterBusinessName}
              error={error.businessName}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-white/10 backdrop-blur-sm"
              labelFontSize="text-16"
              required={true}
            />
            <div>
              <label className="block text-16 font-medium mb-2 text-white">
                {t.businessType}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <CommonNormalDropDown
                options={businessTypes}
                value={form.businessType}
                onChange={handleDropDownChange}
                bgColor="bg-white/10 backdrop-blur-sm"
                textColor="text-white"
                fontSize="text-16"
                showIcon={false}
                borderRadius="rounded-xl"
                width="w-full"
                inputWidth="w-full"
                inputBorderRadius="rounded-lg"
                padding="px-5 py-3"
                placeholder="Select business type"
              />
              {error.businessType && <p className="text-customRed text-lg mt-1">{error.businessType}</p>}
            </div>
          </div>

          {/* Sign Up Button */}
          <CommonButton
            text={isLoading ? t.signingUp : t.signUp}
            type="submit"

            className="w-auto px-20 !text-white rounded-lg py-3 text-16 shadow-lg"
            disabled={isLoading}
          />
        </form>
        {/*
          <div className="space-y-3 mt-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#ffffff29] hover:bg-[#232136]/90 transition-colors duration-200 text-white font-semibold text-16 shadow"
            >
              <img src={Google} alt="Google" className="w-6 h-6" />
              <span>SignUp with Google</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-[#ffffff29] hover:bg-[#232136]/90 transition-colors duration-200 text-white font-semibold text-16 shadow"
            >
              <img src={FB} alt="Facebook" className="w-6 h-6" />
              <span>SignUp with Facebook</span>
            </button>
          </div>
        */}
        <p className={`mt-8 text-[#7A828A] text-14 ${isRTL ? 'text-left' : 'text-right'}`}>
          {t.alreadyHaveAccount}{' '}
          <Link to="/login" className="font-bold text-[#675DFF] hover:text-[#8B7FFF] hover:underline transition-all duration-200">{t.loginLink}</Link>
        </p>
      </div>

    </div>
  );
}

export default Register;
