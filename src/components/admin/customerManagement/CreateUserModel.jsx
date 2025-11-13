import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CommonInput, CommonButton, CommonNormalDropDown } from '../../index';
import { FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { createUser } from '../../../redux/actions/userActions';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminUserTranslations, getValidationTranslations } from '../../../utils/translations';

function CreateUserModel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getAdminUserTranslations(language);
  const v = getValidationTranslations(language);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessType: '',
    role: '',
    subscriptionPlan: '',
    address: '',
    whatsappNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordRequirements, setPasswordRequirements] = useState({
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
    hasMinLength: false
  });
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dropdown options
  const roleOptions = [
    { value: 'user', label: 'User', code: 'user' },
    { value: 'admin', label: 'Admin', code: 'admin' },
    { value: 'manager', label: 'Manager', code: 'manager' }
  ];

  const planOptions = [
    { value: 'free', label: 'Free', code: 'free' },
    { value: 'basic', label: 'Basic', code: 'basic' },
    { value: 'standard', label: 'Standard', code: 'standard' },
    { value: 'premium', label: 'Premium', code: 'premium' }
  ];

  const businessTypeOptions = [
    { value: 'salon', label: 'Salon', code: 'salon' },
    { value: 'spa', label: 'Spa', code: 'spa' },
    { value: 'barbershop', label: 'Barbershop', code: 'barbershop' },
    { value: 'nail-salon', label: 'Nail Salon', code: 'nail-salon' },
    { value: 'massage-therapy', label: 'Massage Therapy', code: 'massage-therapy' },
    { value: 'beauty-clinic', label: 'Beauty Clinic', code: 'beauty-clinic' },
    { value: 'fitness-center', label: 'Fitness Center', code: 'fitness-center' },
    { value: 'wellness-center', label: 'Wellness Center', code: 'wellness-center' },
    { value: 'technology', label: 'Technology', code: 'technology' },
    { value: 'other', label: 'Other', code: 'other' }
  ];

  // Email validation function
  const validateEmail = (email) => {
    if (!email) {
      return v.emailRequired;
    }
    if (email.length > 50) {
      return v.emailTooLong;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return v.validEmailAddress;
    }
    return "";
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password) {
      return v.passwordRequired;
    }
    if (password.length < 8) {
      return v.passwordMinLength;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return v.passwordLowercase;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return v.passwordUppercase;
    }
    if (!/(?=.*\d)/.test(password)) {
      return v.passwordNumber;
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return v.passwordSpecialChar;
    }
    return "";
  };

  const validate = () => {
    const newErrors = {};
    
    // First Name validation (only letters and spaces)
    if (!formData.firstName) {
      newErrors.firstName = v.firstNameRequired;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
      newErrors.firstName = v.firstNameLettersOnly;
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = v.firstNameMinLength;
    } else if (formData.firstName.length > 50) {
      newErrors.firstName = v.firstNameTooLong;
    }
    
    // Last Name validation (only letters and spaces)
    if (!formData.lastName) {
      newErrors.lastName = v.lastNameRequired;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
      newErrors.lastName = v.lastNameLettersOnly;
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = v.lastNameMinLength;
    } else if (formData.lastName.length > 50) {
      newErrors.lastName = v.lastNameTooLong;
    }
    
    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }
    
    // Phone validation (exactly 10 digits)
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = v.phoneRequired;
    } else if (!/^[0-9]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = v.phoneNumbersOnly;
    } else if (formData.phoneNumber.length !== 10) {
      newErrors.phoneNumber = v.phoneExactDigits;
    }
    
    // WhatsApp Number validation (exactly 10 digits)
    if (!formData.whatsappNumber) {
      newErrors.whatsappNumber = v.whatsappRequired;
    } else if (!/^[0-9]+$/.test(formData.whatsappNumber)) {
      newErrors.whatsappNumber = v.whatsappNumbersOnly;
    } else if (formData.whatsappNumber.length !== 10) {
      newErrors.whatsappNumber = v.whatsappExactDigits;
    }
    
    // Business Name validation (only letters and spaces)
    if (!formData.businessName) {
      newErrors.businessName = v.businessNameRequired;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.businessName)) {
      newErrors.businessName = v.businessNameLettersOnly;
    } else if (formData.businessName.length < 2) {
      newErrors.businessName = v.businessNameMinLength;
    } else if (formData.businessName.length > 100) {
      newErrors.businessName = v.businessNameTooLong;
    }
    
    // Business Type validation
    if (!formData.businessType) {
      newErrors.businessType = v.businessTypeRequired;
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = v.roleRequired;
    }
    
    // Subscription Plan validation
    if (!formData.subscriptionPlan) {
      newErrors.subscriptionPlan = v.planRequired;
    }
    
    // Address validation
    if (!formData.address) {
      newErrors.address = v.addressRequired;
    } else if (formData.address.length < 10) {
      newErrors.address = v.addressMinLength;
    } else if (formData.address.length > 200) {
      newErrors.address = v.addressTooLong;
    }
    
    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }
    
    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = v.confirmPasswordRequired;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = v.passwordsDoNotMatch;
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Real-time validation for email
    if (name === 'email') {
      const emailError = validateEmail(value);
      setErrors(prev => ({ ...prev, email: emailError }));
    }
    
    // Real-time validation for password
    else if (name === 'password') {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passwordError }));
      
      // Update password requirements for display
      const passwordRequirements = {
        hasLowerCase: /[a-z]/.test(value),
        hasUpperCase: /[A-Z]/.test(value),
        hasNumbers: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*]/.test(value),
        hasMinLength: value.length >= 8
      };
      setPasswordRequirements(passwordRequirements);
      
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
    else if (name === 'confirmPassword') {
      if (!value) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      } else if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
    
    // Real-time validation for first name
    else if (name === 'firstName') {
      if (!value) {
        setErrors(prev => ({ ...prev, firstName: "" }));
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        setErrors(prev => ({ ...prev, firstName: v.firstNameLettersOnly }));
      } else if (value.length < 2) {
        setErrors(prev => ({ ...prev, firstName: v.firstNameMinLength }));
      } else if (value.length > 50) {
        setErrors(prev => ({ ...prev, firstName: v.firstNameTooLong }));
      } else {
        setErrors(prev => ({ ...prev, firstName: "" }));
      }
    }
    
    // Real-time validation for last name
    else if (name === 'lastName') {
      if (!value) {
        setErrors(prev => ({ ...prev, lastName: "" }));
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        setErrors(prev => ({ ...prev, lastName: v.lastNameLettersOnly }));
      } else if (value.length < 2) {
        setErrors(prev => ({ ...prev, lastName: v.lastNameMinLength }));
      } else if (value.length > 50) {
        setErrors(prev => ({ ...prev, lastName: v.lastNameTooLong }));
      } else {
        setErrors(prev => ({ ...prev, lastName: "" }));
      }
    }
    
    // Real-time validation for phone
    else if (name === 'phoneNumber') {
      if (!value) {
        setErrors(prev => ({ ...prev, phoneNumber: "" }));
      } else if (!/^[0-9]+$/.test(value)) {
        setErrors(prev => ({ ...prev, phoneNumber: v.phoneNumbersOnly }));
      } else if (value.length !== 10) {
        setErrors(prev => ({ ...prev, phoneNumber: v.phoneExactDigits }));
      } else {
        setErrors(prev => ({ ...prev, phoneNumber: "" }));
      }
    }
    
    // Real-time validation for WhatsApp number
    else if (name === 'whatsappNumber') {
      if (!value) {
        setErrors(prev => ({ ...prev, whatsappNumber: "" }));
      } else if (!/^[0-9]+$/.test(value)) {
        setErrors(prev => ({ ...prev, whatsappNumber: v.whatsappNumbersOnly }));
      } else if (value.length !== 10) {
        setErrors(prev => ({ ...prev, whatsappNumber: v.whatsappExactDigits }));
      } else {
        setErrors(prev => ({ ...prev, whatsappNumber: "" }));
      }
    }
    
    // Real-time validation for business name
    else if (name === 'businessName') {
      if (!value) {
        setErrors(prev => ({ ...prev, businessName: "" }));
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        setErrors(prev => ({ ...prev, businessName: v.businessNameLettersOnly }));
      } else if (value.length < 2) {
        setErrors(prev => ({ ...prev, businessName: v.businessNameMinLength }));
      } else if (value.length > 100) {
        setErrors(prev => ({ ...prev, businessName: v.businessNameTooLong }));
      } else {
        setErrors(prev => ({ ...prev, businessName: "" }));
      }
    }
    
    // Real-time validation for address
    else if (name === 'address') {
      if (!value) {
        setErrors(prev => ({ ...prev, address: "" }));
      } else if (value.length < 10) {
        setErrors(prev => ({ ...prev, address: v.addressMinLength }));
      } else if (value.length > 200) {
        setErrors(prev => ({ ...prev, address: v.addressTooLong }));
      } else {
        setErrors(prev => ({ ...prev, address: "" }));
      }
    }
    
    // Clear other field errors
    else if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Dropdown change handler
  const handleDropDownChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    // Show validation error immediately when user focuses on field
    if (name === 'firstName') {
      if (!formData.firstName) {
        setErrors(prev => ({ ...prev, firstName: v.firstNameRequired }));
      } else if (!/^[a-zA-Z\s]+$/.test(formData.firstName)) {
        setErrors(prev => ({ ...prev, firstName: v.firstNameLettersOnly }));
      }
    } else if (name === 'lastName') {
      if (!formData.lastName) {
        setErrors(prev => ({ ...prev, lastName: v.lastNameRequired }));
      } else if (!/^[a-zA-Z\s]+$/.test(formData.lastName)) {
        setErrors(prev => ({ ...prev, lastName: v.lastNameLettersOnly }));
      }
    } else if (name === 'email') {
      if (!formData.email) {
        setErrors(prev => ({ ...prev, email: v.emailRequired }));
      } else {
        const emailError = validateEmail(formData.email);
        if (emailError) {
          setErrors(prev => ({ ...prev, email: emailError }));
        }
      }
    } else if (name === 'phoneNumber') {
      if (!formData.phoneNumber) {
        setErrors(prev => ({ ...prev, phoneNumber: v.phoneRequired }));
      } else if (!/^[0-9]+$/.test(formData.phoneNumber)) {
        setErrors(prev => ({ ...prev, phoneNumber: v.phoneNumbersOnly }));
      } else if (formData.phoneNumber.length !== 10) {
        setErrors(prev => ({ ...prev, phoneNumber: v.phoneExactDigits }));
      }
    } else if (name === 'whatsappNumber') {
      if (!formData.whatsappNumber) {
        setErrors(prev => ({ ...prev, whatsappNumber: v.whatsappRequired }));
      } else if (!/^[0-9]+$/.test(formData.whatsappNumber)) {
        setErrors(prev => ({ ...prev, whatsappNumber: v.whatsappNumbersOnly }));
      } else if (formData.whatsappNumber.length !== 10) {
        setErrors(prev => ({ ...prev, whatsappNumber: v.whatsappExactDigits }));
      }
    } else if (name === 'businessName') {
      if (!formData.businessName) {
        setErrors(prev => ({ ...prev, businessName: v.businessNameRequired }));
      } else if (!/^[a-zA-Z\s]+$/.test(formData.businessName)) {
        setErrors(prev => ({ ...prev, businessName: v.businessNameLettersOnly }));
      }
    } else if (name === 'address') {
      if (!formData.address) {
        setErrors(prev => ({ ...prev, address: v.addressRequired }));
      }
    } else if (name === 'password') {
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
        setErrors(prev => ({ ...prev, confirmPassword: v.confirmPasswordRequired }));
      } else if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Validate on blur
    if (name === 'firstName') {
      if (!value) {
        setErrors(prev => ({ ...prev, firstName: v.firstNameRequired }));
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        setErrors(prev => ({ ...prev, firstName: v.firstNameLettersOnly }));
      }
    } else if (name === 'lastName') {
      if (!value) {
        setErrors(prev => ({ ...prev, lastName: v.lastNameRequired }));
      } else if (!/^[a-zA-Z\s]+$/.test(value)) {
        setErrors(prev => ({ ...prev, lastName: v.lastNameLettersOnly }));
      }
    } else if (name === 'email') {
      const emailError = validateEmail(value);
      setErrors(prev => ({ ...prev, email: emailError }));
    } else if (name === 'phoneNumber') {
      if (value && !/^[0-9]+$/.test(value)) {
        setErrors(prev => ({ ...prev, phoneNumber: v.phoneNumbersOnly }));
      } else if (value && value.length !== 10) {
        setErrors(prev => ({ ...prev, phoneNumber: v.phoneExactDigits }));
      }
    } else if (name === 'whatsappNumber') {
      if (value && !/^[0-9]+$/.test(value)) {
        setErrors(prev => ({ ...prev, whatsappNumber: v.whatsappNumbersOnly }));
      } else if (value && value.length !== 10) {
        setErrors(prev => ({ ...prev, whatsappNumber: v.whatsappExactDigits }));
      }
    } else if (name === 'businessName') {
      if (value && !/^[a-zA-Z\s]+$/.test(value)) {
        setErrors(prev => ({ ...prev, businessName: v.businessNameLettersOnly }));
      }
    } else if (name === 'address') {
      if (value && value.length < 10) {
        setErrors(prev => ({ ...prev, address: v.addressMinLength }));
      }
    } else if (name === 'password') {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passwordError }));
    } else if (name === 'confirmPassword') {
      if (value && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: v.passwordsDoNotMatch }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      
      try {
        // Use Redux action to create user
        const result = await dispatch(createUser(formData));
        
        if (result.success) {
          // Show API response message in toast
          if (result.data && result.data.message) {
            toast.success(result.data.message);
          } else {
            toast.success(t.userCreatedSuccess);
          }
          navigate('/admin/user-management');
        } else {
          console.error('Creation failed:', result.error);
          toast.error(result.error || t.failedToCreateUser);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t.unexpectedError);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    navigate('/admin/user-management');
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>{t.backToUserManagement}</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-customBlack rounded-xl shadow-lg border border-gray-200 dark:border-customBorderColor">
          <form onSubmit={handleSubmit} className="p-8 space-y-8" autoComplete="off">
            {/* Personal Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                {t.personalInformation}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CommonInput
                  label={t.firstName}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  showErrorOnFocus={true}
                  placeholder={t.enterFirstName}
                  error={errors.firstName}
                />
                <CommonInput
                  label={t.lastName}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  showErrorOnFocus={true}
                  placeholder={t.enterLastName}
                  error={errors.lastName}
                />
                <CommonInput
                  label={t.email}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  showErrorOnFocus={true}
                  placeholder={t.enterEmail}
                  error={errors.email}
                />
                <CommonInput
                  label={t.phoneNumber}
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  showErrorOnFocus={true}
                  placeholder={t.enterPhoneNumber}
                  error={errors.phoneNumber}
                />
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                {t.businessInformation}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CommonInput
                  label={t.businessName}
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  showErrorOnFocus={true}
                  placeholder={t.enterBusinessName}
                  error={errors.businessName}
                />
                <div>
                  <label className="block text-xl font-medium text-black dark:text-white mb-2">
                    {t.businessType}
                  </label>
                  <CommonNormalDropDown
                    options={businessTypeOptions}
                    value={formData.businessType}
                    onChange={(value) => handleDropDownChange('businessType', value)}
                    placeholder={t.selectBusinessType}
                    className="w-full"
                    showIcon={false}
                    inputWidth="w-full"
                    anchor="right"
                  />
                  {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
                </div>
                <CommonInput
                  label={t.address}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  showErrorOnFocus={true}
                  placeholder={t.enterAddress}
                  error={errors.address}
                />
                <CommonInput
                  label={t.whatsappNumber}
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  showErrorOnFocus={true}
                  placeholder={t.enterWhatsappNumber}
                  error={errors.whatsappNumber}
                />
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                {t.accountSettings}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xl font-medium text-black dark:text-white mb-2">
                    {t.role}
                  </label>
                  <CommonNormalDropDown
                    options={roleOptions}
                    value={formData.role}
                    onChange={(value) => handleDropDownChange('role', value)}
                    placeholder={t.selectRole}
                    className="w-full"
                    showIcon={false}
                    inputWidth="w-full"
                    anchor="right"
                  />
                  {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
                </div>
                <div>
                  <label className="block text-xl font-medium text-black dark:text-white mb-2">
                    {t.subscriptionPlan}
                  </label>
                  <CommonNormalDropDown
                    options={planOptions}
                    value={formData.subscriptionPlan}
                    onChange={(value) => handleDropDownChange('subscriptionPlan', value)}
                    placeholder={t.selectPlan}
                    className="w-full"
                    showIcon={false}
                    inputWidth="w-full"
                    anchor="right"
                  />
                  {errors.subscriptionPlan && <p className="text-red-500 text-sm mt-1">{errors.subscriptionPlan}</p>}
                </div>
              </div>
            </div>

            {/* Password Information */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                {t.passwordInformation}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div>
                    <label className="block text-xl font-medium text-black dark:text-white mb-2">
                      {t.password}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={t.enterPassword}
                        className={`w-full border rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-customBody dark:bg-customBrown focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                          errors.password
                            ? 'border-customRed pr-12'
                            : 'border-gray-200 dark:border-customBorderColor pr-12'
                        }`}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                        ) : (
                          <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="text-customRed text-lg mt-1">{errors.password}</p>}
                  </div>
                  
                  {/* Password Requirements Display */}
                  {formData.password && (
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">{t.passwordRequirements}</p>
                      <div className="space-y-1">
                        <div className={`flex items-center text-xs ${passwordRequirements.hasMinLength ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          <span className="mr-2">{passwordRequirements.hasMinLength ? '✅' : '❌'}</span>
                          {t.atLeast8Characters}
                        </div>
                        <div className={`flex items-center text-xs ${passwordRequirements.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          <span className="mr-2">{passwordRequirements.hasLowerCase ? '✅' : '❌'}</span>
                          {t.lowercaseLetter}
                        </div>
                        <div className={`flex items-center text-xs ${passwordRequirements.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          <span className="mr-2">{passwordRequirements.hasUpperCase ? '✅' : '❌'}</span>
                          {t.uppercaseLetter}
                        </div>
                        <div className={`flex items-center text-xs ${passwordRequirements.hasNumbers ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          <span className="mr-2">{passwordRequirements.hasNumbers ? '✅' : '❌'}</span>
                          {t.number}
                        </div>
                        <div className={`flex items-center text-xs ${passwordRequirements.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          <span className="mr-2">{passwordRequirements.hasSpecialChar ? '✅' : '❌'}</span>
                          {t.specialCharacter}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xl font-medium text-black dark:text-white mb-2">
                    {t.confirmPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                      placeholder={t.confirmPasswordPlaceholder}
                      className={`w-full border rounded-lg px-4 py-3 text-gray-900 dark:text-white bg-customBody dark:bg-customBrown focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                        errors.confirmPassword
                          ? 'border-customRed pr-12'
                          : 'border-gray-200 dark:border-customBorderColor pr-12'
                      }`}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-customRed text-lg mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <CommonButton
                text={t.cancel}
                onClick={handleBack}
                className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              />
              <CommonButton
                text={isLoading ? t.creating : t.createUser}
                type="submit"
                onClick={handleSubmit}
                className="px-8 py-3 rounded-lg"
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateUserModel; 