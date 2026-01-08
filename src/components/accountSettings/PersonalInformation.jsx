import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FiEdit } from 'react-icons/fi';
import { CommonButton, CommonInput, CommonNormalDropDown } from '../index';
import { updateUserProfile } from '../../redux/actions/authActions';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import { getAccountSettingTranslations, getValidationTranslations } from '../../utils/translations';
import { formatPhoneForDisplay, formatPhoneForBackend } from '../../utils/phoneHelpers';
import AddressAutocomplete from './AddressAutocomplete';

function PersonalInformation() {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);
    
    const { language } = useLanguage();
    const t = getAccountSettingTranslations(language);
    const v = getValidationTranslations(language);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        businessName: '',
        businessType: '',
        address: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Base business types dropdown options
    const baseBusinessTypes = [
        { value: '', label: t.selectBusinessType },
        { value: 'salon', label: t.salon },
        { value: 'barbershop', label: t.barbershop },
        { value: 'nails-salon', label: t.nailsSalon },
        { value: 'spa', label: t.spa },
        { value: 'medspa', label: t.medspa },
        { value: 'massage', label: t.massage },
        { value: 'tattoo-piercing', label: t.tattooPiercing },
        { value: 'tanning-studio', label: t.tanningStudio },
        { value: 'technology', label: t.technology },
    ];

    // Dynamic business types that include user's business type if not in base list
    const businessTypes = useMemo(() => {
        if (!user?.businessType) return baseBusinessTypes;

        // Check if user's business type already exists in base list
        const exists = baseBusinessTypes.some(type =>
            type.value.toLowerCase() === user.businessType.toLowerCase()
        );

        if (!exists) {
            // Add user's business type to the list
            return [
                ...baseBusinessTypes,
                {
                    value: user.businessType,
                    label: user.businessType // Use the actual value as label
                }
            ];
        } else {
            // If exists, update the existing option to match user's case
            return baseBusinessTypes.map(type => {
                if (type.value.toLowerCase() === user.businessType.toLowerCase()) {
                    return {
                        ...type,
                        value: user.businessType, // Use user's exact case
                        label: type.label // Keep the translated label
                    };
                }
                return type;
            });
        }
    }, [user?.businessType]);

    // Populate form with user data from Redux
    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : '',
                businessName: user.businessName || '',
                businessType: user.businessType || '',
                address: user.address || '',
            });
        }
    }, [user]);

    // Email validation function (same as CreateUserModel)
    const validateEmail = (email) => {
        if (!email) {
            return v.emailRequired;
        }
        if (email.length > 50) {
            return v.emailTooLong;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            return v.validEmailAddress;
        }
        return "";
    };

    const validate = () => {
        const newErrors = {};

        // First Name validation (only letters, no spaces)
        if (!formData.firstName) {
            newErrors.firstName = v.firstNameRequired;
        } else if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
            newErrors.firstName = v.firstNameLettersOnly;
        } else if (formData.firstName.length < 2) {
            newErrors.firstName = v.firstNameMinLength;
        } else if (formData.firstName.length > 50) {
            newErrors.firstName = v.firstNameTooLong;
        }

        // Last Name validation (only letters, no spaces)
        if (!formData.lastName) {
            newErrors.lastName = v.lastNameRequired;
        } else if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
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
        if (!formData.phone) {
            newErrors.phone = v.phoneRequired;
        } else if (!/^[0-9]+$/.test(formData.phone)) {
            newErrors.phone = v.phoneNumbersOnly;
        } else if (formData.phone.length !== 10) {
            newErrors.phone = v.phoneExactDigits;
        }

        // Business Name validation (flexible - any characters)
        if (!formData.businessName) {
            newErrors.businessName = v.businessNameRequired;
        } else if (formData.businessName.length < 2) {
            newErrors.businessName = v.businessNameMinLength;
        } else if (formData.businessName.length > 100) {
            newErrors.businessName = v.businessNameTooLong;
        }

        // Business Type validation
        if (!formData.businessType) {
            newErrors.businessType = v.businessTypeRequired;
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
            } else if (!/^[a-zA-Z]+$/.test(value)) {
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
            } else if (!/^[a-zA-Z]+$/.test(value)) {
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
        else if (name === 'phone') {
            if (!value) {
                setErrors(prev => ({ ...prev, phone: "" }));
            } else if (!/^[0-9]+$/.test(value)) {
                setErrors(prev => ({ ...prev, phone: v.phoneNumbersOnly }));
            } else if (value.length !== 10) {
                setErrors(prev => ({ ...prev, phone: v.phoneExactDigits }));
            } else {
                setErrors(prev => ({ ...prev, phone: "" }));
            }
        }

        // Real-time validation for business name
        else if (name === 'businessName') {
            if (!value) {
                setErrors(prev => ({ ...prev, businessName: "" }));
            } else if (value.length < 2) {
                setErrors(prev => ({ ...prev, businessName: v.businessNameMinLength }));
            } else if (value.length > 100) {
                setErrors(prev => ({ ...prev, businessName: v.businessNameTooLong }));
            } else {
                setErrors(prev => ({ ...prev, businessName: "" }));
            }
        }

        // Real-time validation for address - only show error if too long, not if too short (let user type)
        else if (name === 'address') {
            if (!value) {
                setErrors(prev => ({ ...prev, address: "" }));
            } else if (value.length > 200) {
                setErrors(prev => ({ ...prev, address: v.addressTooLong }));
            } else {
                // Clear error while typing (min length validation only on blur/submit)
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
    const handleDropDownChange = (value) => {
        setFormData({ ...formData, businessType: value });
        setErrors(prev => ({ ...prev, businessType: undefined }));
    };

    const handleFocus = (e) => {
        const { name } = e.target;
        // Show validation error immediately when user focuses on field
        if (name === 'firstName') {
            if (!formData.firstName) {
                setErrors(prev => ({ ...prev, firstName: v.firstNameRequired }));
            } else if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
                setErrors(prev => ({ ...prev, firstName: v.firstNameLettersOnly }));
            }
        } else if (name === 'lastName') {
            if (!formData.lastName) {
                setErrors(prev => ({ ...prev, lastName: v.lastNameRequired }));
            } else if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
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
        } else if (name === 'phone') {
            if (!formData.phone) {
                setErrors(prev => ({ ...prev, phone: v.phoneRequired }));
            } else if (!/^[0-9]+$/.test(formData.phone)) {
                setErrors(prev => ({ ...prev, phone: v.phoneNumbersOnly }));
            } else if (formData.phone.length !== 10) {
                setErrors(prev => ({ ...prev, phone: v.phoneExactDigits }));
            }
        } else if (name === 'businessName') {
            if (!formData.businessName) {
                setErrors(prev => ({ ...prev, businessName: v.businessNameRequired }));
            }
        } else if (name === 'address') {
            // Don't show error on focus - let user type freely
            // Validation will happen on blur or submit
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        // Validate on blur
        if (name === 'firstName') {
            if (!value) {
                setErrors(prev => ({ ...prev, firstName: v.firstNameRequired }));
            } else if (!/^[a-zA-Z]+$/.test(value)) {
                setErrors(prev => ({ ...prev, firstName: v.firstNameLettersOnly }));
            }
        } else if (name === 'lastName') {
            if (!value) {
                setErrors(prev => ({ ...prev, lastName: v.lastNameRequired }));
            } else if (!/^[a-zA-Z]+$/.test(value)) {
                setErrors(prev => ({ ...prev, lastName: v.lastNameLettersOnly }));
            }
        } else if (name === 'email') {
            const emailError = validateEmail(value);
            setErrors(prev => ({ ...prev, email: emailError }));
        } else if (name === 'phone') {
            if (value && !/^[0-9]+$/.test(value)) {
                setErrors(prev => ({ ...prev, phone: v.phoneNumbersOnly }));
            } else if (value && value.length !== 10) {
                setErrors(prev => ({ ...prev, phone: v.phoneExactDigits }));
            }
        } else if (name === 'businessName') {
            // No character restriction for business name - flexible validation
        } else if (name === 'address') {
            if (value && value.length < 10) {
                setErrors(prev => ({ ...prev, address: v.addressMinLength }));
            }
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form data to user data
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phoneNumber ? formatPhoneForDisplay(user.phoneNumber) : '',
                businessName: user.businessName || '',
                businessType: user.businessType || '',
                address: user.address || '',
            });
        }
        setErrors({});
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setIsLoading(true);
            try {
                const apiData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phoneNumber: formatPhoneForBackend(formData.phone),
                    businessName: formData.businessName,
                    businessType: formData.businessType,
                    address: formData.address,
                };

                const result = await dispatch(updateUserProfile(apiData));
                if (result.success) {
                    toast.success(t.profileUpdatedSuccess);
                    setErrors({});
                    setIsEditing(false);
                } else {
                    toast.error(result.error || t.failedToUpdateProfile);
                }
            } catch (error) {
                console.error('Profile update error:', error);
                if (error.message.includes('permission') || error.message.includes('access')) {
                    toast.error(t.permissionDenied);
                } else if (error.message.includes('session') || error.message.includes('login')) {
                    toast.error(t.sessionExpired);
                } else {
                    toast.error(error.message || t.failedToUpdateProfile);
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
                    {t.personalInformation}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    עדכן את פרטי העסק שלך, העדפות מס ושפה, ונהל קישורים חיצוניים.{" "}
                    <a href="#" className="text-[#ff257c] hover:underline">למד עוד</a>
                </p>
            </div>

            {/* Business Info Card */}
            <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-2xl p-6 mb-6 relative">
                <div className="absolute top-6 left-6">
                    <button
                        onClick={isEditing ? handleCancelEdit : handleEditClick}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-2"
                    >
                        <FiEdit className="text-base" />
                        {isEditing ? 'ביטול' : 'עריכה'}
                    </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 pr-20">
                    פרטי עסק
                </h3>

                {!isEditing ? (
                    // View Mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שם העסק</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formData.businessName || '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מטבע</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                ILS
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שפת ברירת מחדל של הצוות</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                🇮🇱 עברית
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">מדינה</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                ישראל
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">חישוב מס</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                מחירים כוללים מס
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">שפת ברירת מחדל של הלקוח</div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                🇮🇱 עברית
                            </div>
                        </div>
                    </div>
                ) : (
                    // Edit Mode
                    <form onSubmit={handleFormSubmit} autoComplete="off">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CommonInput
                        label={t.firstName}
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        showErrorOnFocus={true}
                        error={errors.firstName}
                        placeholder={t.enterFirstName}
                        labelFontSize="text-14"
                        required={true}
                    />
                    <CommonInput
                        label={t.lastName}
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        showErrorOnFocus={true}
                        error={errors.lastName}
                        placeholder={t.enterLastName}
                        labelFontSize="text-14"
                        required={true}
                    />
                </div>

                <div className="mt-6">
                    <CommonInput
                        label={t.email}
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        showErrorOnFocus={true}
                        error={errors.email}
                        placeholder={t.enterEmail}
                        labelFontSize="text-14"
                        required={true}
                    />
                </div>

                <div className="mt-6">
                    <CommonInput
                        label={t.phone}
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        showErrorOnFocus={true}
                        error={errors.phone}
                        placeholder={t.enterPhone}
                        labelFontSize="text-14"
                        required={true}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <CommonInput
                        label={t.businessName}
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        showErrorOnFocus={true}
                        error={errors.businessName}
                        placeholder={t.enterBusinessName}
                        labelFontSize="text-14"
                        required={true}
                    />
                    <div>
                        <label className="block text-16 font-medium mb-2 text-gray-900 dark:text-white">
                            {t.businessType}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <CommonNormalDropDown
                            options={businessTypes}
                            value={formData.businessType}
                            onChange={handleDropDownChange}
                            bgColor="bg-gray-50 dark:bg-customBrown backdrop-blur-sm"
                            textColor="text-gray-900 dark:text-white"
                            fontSize="text-16"
                            showIcon={false}
                            borderRadius="rounded-xl"
                            width="w-full"
                            inputWidth="w-full"
                            inputBorderRadius="rounded-lg"
                            padding="px-5 py-3"
                        />
                        {errors.businessType && <p className="text-customRed text-lg mt-1">{errors.businessType}</p>}
                    </div>
                </div>

                <div className="mt-6">
                    <AddressAutocomplete
                        label={t.address}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onPlaceSelect={(place) => {
                            if (place && place.formatted_address) {
                                setFormData({
                                    ...formData,
                                    address: place.formatted_address
                                });
                                // Clear address error when valid place is selected
                                if (errors.address) {
                                    setErrors(prev => ({ ...prev, address: '' }));
                                }
                            }
                        }}
                        error={errors.address}
                        placeholder={t.enterAddress}
                        required={true}
                    />
                </div>

                <div className="mt-8">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? t.saving : t.saveChanges}
                    </button>
                </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default PersonalInformation
