import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CommonButton, CommonInput, SquaresAnim } from '../../components/index';
import { toast } from 'react-toastify';
import LoginBG from '../../assets/LoginBG.png';
import { resetPassword } from '../../redux/services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthTranslations, getValidationTranslations } from '../../utils/translations';

function ResetPassword() {
  const { token } = useParams();
  const { language } = useLanguage();
  const isRTL = language === 'he';
  const t = getAuthTranslations(language);
  const v = getValidationTranslations(language);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation for password
    if (name === 'password') {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passwordError }));
      
      // Also validate confirm password if it exists
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          setErrors(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
        } else {
          setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
      }
    }

    // Real-time validation for confirm password
    if (name === 'confirmPassword') {
      if (!value) {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      } else if (formData.password !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    // Show validation error immediately when user focuses on field
    if (name === 'password') {
      if (!formData.password) {
        setErrors(prev => ({ ...prev, password: v.passwordRequired }));
      } else {
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          setErrors(prev => ({ ...prev, password: passwordError }));
        }
      }
    } else if (name === 'confirmPassword') {
      if (!formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: v.pleaseConfirmPassword }));
      } else if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate on blur
    if (name === 'password') {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passwordError }));
    } else if (name === 'confirmPassword') {
      if (value && formData.password !== value) {
        setErrors(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = v.pleaseConfirmPassword;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = v.passwordsDoNotMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the actual API
      await resetPassword(token, formData.password);
      
      toast.success(t.passwordResetSuccess);
      // Clear all errors on successful reset
      setErrors({});
      navigate('/login');
    } catch (error) {
      toast.error(error.message || t.failedToResetPassword);
      // Don't clear errors on failed reset
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
      
      <div
        className="w-full max-w-md rounded-3xl shadow-2xl border border-gray-200/20 dark:border-customBorderColor/50 backdrop-blur-xl p-8 bg-cover bg-center bg-white/10 dark:bg-black/20"
        style={{
          backgroundImage: `url(${LoginBG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 text-green-500">🔒</div>
          <h2 className="text-28 font-black text-center text-white mb-2">
            {t.resetPassword}
          </h2>
          <p className="text-16 text-center text-white/90 font-medium">
            {t.createNewPassword}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          <CommonInput
            label={t.newPassword}
            labelFontSize="text-16"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            showErrorOnFocus={true}
            placeholder={t.enterNewPassword}
            error={errors.password}
            textColor="text-white"
            labelColor="text-white"
            inputBg="bg-white/10 backdrop-blur-sm"
            showPasswordToggle={true}
            showPasswordValidation={true}
            required={true}
          />

          <CommonInput
            label={t.confirmNewPassword}
            labelFontSize="text-16"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            showErrorOnFocus={true}
            placeholder={t.confirmNewPasswordPlaceholder}
            error={errors.confirmPassword}
            textColor="text-white"
            labelColor="text-white"
            inputBg="bg-white/10 backdrop-blur-sm"
            showPasswordToggle={true}
            required={true}
          />

          <CommonButton
            text={isLoading ? t.resetting : t.resetPassword}
            type="submit"
            className="w-full !text-white rounded-xl py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            disabled={isLoading}
          />
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/70 text-14">
            {t.rememberPassword}{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-bold text-[#675DFF] hover:text-[#8B7FFF] hover:underline transition-all duration-200"
            >
              {t.backToLogin}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;