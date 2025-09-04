import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { CommonInput, CommonButton, CommonNormalDropDown } from '../../index';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { updateUser } from '../../../redux/actions/userActions';
import { getUserById } from '../../../redux/services/userServices';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminUserTranslations, getValidationTranslations } from '../../../utils/translations';

function EditUserModel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const { language } = useLanguage();
  const t = getAdminUserTranslations(language);
  const v = getValidationTranslations(language);

  // Get user data from navigation state or use fallback
  const userDataProp = {
    id: userId,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessType: '',
    role: '',
    accountStatus: '',
    subscriptionPlan: '',
    address: '',
    whatsappNumber: ''
  };

  // State for API fetched user data
  const [apiUserData, setApiUserData] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    businessName: '',
    businessType: '',
    role: '',
    accountStatus: '',
    subscriptionPlan: '',
    address: '',
    whatsappNumber: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Dropdown options
  const roleOptions = [
    { value: 'user', label: 'User', code: 'user' },
    { value: 'admin', label: 'Admin', code: 'admin' },
    { value: 'manager', label: 'Manager', code: 'manager' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', code: 'active' },
    { value: 'suspended', label: 'Suspended', code: 'suspended' },
    { value: 'inactive', label: 'Inactive', code: 'inactive' }
  ];

  const planOptions = [
    { value: 'free', label: 'Free', code: 'free' },
    { value: 'basic', label: 'Basic', code: 'basic' },
    { value: 'standard', label: 'Standard', code: 'standard' },
    { value: 'premium', label: 'Premium', code: 'premium' }
  ];

  // Email validation function (same as register page)
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

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        try {
          setApiLoading(true);
          setApiError(null);
          
          const response = await getUserById(userId);
          
          if (response.success && response.data) {
            setApiUserData(response.data);
          } else {
            setApiError(response.message || 'Failed to fetch user data');
          }
        } catch (error) {
          setApiError(error.message || 'Failed to fetch user data');
        } finally {
          setApiLoading(false);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  // Update form data when API data changes
  useEffect(() => {
    if (apiUserData && typeof apiUserData === 'object') {
      const safeGetValue = (obj, key) => {
        if (!obj || typeof obj !== 'object') return '';

        const value = obj[key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return String(value);
        if (typeof value === 'object') {
          // If it's an object, try to get a meaningful string representation
          if (value.name) return value.name;
          if (value.label) return value.label;
          if (value.value) return value.value;
          return '';
        }
        return String(value);
      };

      const newFormData = {
        firstName: safeGetValue(apiUserData, 'firstName'),
        lastName: safeGetValue(apiUserData, 'lastName'),
        email: safeGetValue(apiUserData, 'email'),
        phoneNumber: safeGetValue(apiUserData, 'phoneNumber'),
        businessName: safeGetValue(apiUserData, 'businessName'),
        businessType: safeGetValue(apiUserData, 'businessType'),
        role: safeGetValue(apiUserData, 'role'),
        accountStatus: safeGetValue(apiUserData, 'accountStatus'),
        subscriptionPlan: safeGetValue(apiUserData, 'subscriptionPlan'),
        address: safeGetValue(apiUserData, 'address'),
        whatsappNumber: safeGetValue(apiUserData, 'whatsappNumber')
      };

      setFormData(newFormData);
    }
  }, [apiUserData]);

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

    // Role validation
    if (!formData.role) {
      newErrors.role = v.roleRequired;
    }

    // Account Status validation
    if (!formData.accountStatus) {
      newErrors.accountStatus = v.statusRequired;
    }

    // Address validation
    if (!formData.address) {
      newErrors.address = v.addressRequired;
    } else if (formData.address.length < 10) {
      newErrors.address = v.addressMinLength;
    } else if (formData.address.length > 200) {
      newErrors.address = v.addressTooLong;
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

  // Dropdown change handler (same as register page)
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);

      try {
        // Use Redux action instead of direct API call
        const result = await dispatch(updateUser(userDataProp.id, formData));

        if (result.success) {
          // Show API response message in toast
          if (result.data && result.data.message) {
            toast.success(result.data.message);
          } else {
            toast.success(t.userUpdatedSuccess);
          }
          navigate('/admin/user-management');
        } else {
          console.error('Update failed:', result.error);
          toast.error(result.error || t.failedToUpdateUser);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error(t.unexpectedErrorUpdate);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    navigate('/admin/user-management');
  };

  return (
    <div className="min-h-screen ">
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

        {/* Loading State */}
        {apiLoading && (
          <div className="bg-white dark:bg-customBlack rounded-xl shadow-lg border border-gray-200 dark:border-customBorderColor p-8 mb-6">
            <div className="flex items-center justify-center">
              <div className="loader"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading user data...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {apiError && (
          <div className="bg-white dark:bg-customBlack rounded-xl shadow-lg border border-gray-200 dark:border-customBorderColor p-8 mb-6">
            <div className="text-red-500 text-center">
              <p className="text-lg font-semibold mb-2">Error Loading User Data</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{apiError}</p>
            </div>
          </div>
        )}

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
                  labelFontSize="text-14"
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
                  labelFontSize="text-14"
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
                  labelFontSize="text-14"
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
                  labelFontSize="text-14"
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
                  labelFontSize="text-14"
                />
                <CommonInput
                  label={t.businessType}
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  placeholder={t.enterBusinessType}
                  error={errors.businessType}
                  labelFontSize="text-14"
                />
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
                  labelFontSize="text-14"
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
                  labelFontSize="text-14"
                />
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                {t.accountSettings}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-14 font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  <label className="block text-14 font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t.status}
                  </label>
                  <CommonNormalDropDown
                    options={statusOptions}
                    value={formData.accountStatus}
                    onChange={(value) => handleDropDownChange('accountStatus', value)}
                    placeholder={t.selectStatus}
                    className="w-full"
                    showIcon={false}
                    inputWidth="w-full"
                    anchor="right"
                  />
                  {errors.accountStatus && <p className="text-red-500 text-sm mt-1">{errors.accountStatus}</p>}
                </div>
                <div>
                  <label className="block text-14 font-medium text-gray-700 dark:text-gray-300 mb-2">
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <CommonButton
                text={t.cancel}
                onClick={handleBack}
                className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-[8px]"
              />
              <CommonButton
                text={isLoading ? t.updating : t.updateUser}
                type="submit"
                onClick={handleSubmit}
                className="px-8 py-3 rounded-[8px]"
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditUserModel;