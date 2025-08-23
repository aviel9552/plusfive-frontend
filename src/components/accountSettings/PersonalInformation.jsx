import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CommonButton, CommonInput, CommonNormalDropDown } from '../index';
import { updateUserProfile } from '../../redux/actions/authActions';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import { getAccountSettingTranslations, getValidationTranslations } from '../../utils/translations';

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
                phone: user.phoneNumber || '',
                businessName: user.businessName || '',
                businessType: user.businessType || '',
                address: user.address || '',
            });
        }
    }, [user]);

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
        if (!formData.phone) {
            newErrors.phone = v.phoneRequired;
        } else if (!/^[0-9]+$/.test(formData.phone)) {
            newErrors.phone = v.phoneNumbersOnly;
        } else if (formData.phone.length !== 10) {
            newErrors.phone = v.phoneExactDigits;
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
        } else if (name === 'phone') {
            if (value && !/^[0-9]+$/.test(value)) {
                setErrors(prev => ({ ...prev, phone: v.phoneNumbersOnly }));
            } else if (value && value.length !== 10) {
                setErrors(prev => ({ ...prev, phone: v.phoneExactDigits }));
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
                // Map form data to API format
                const apiData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phoneNumber: formData.phone,
                    businessName: formData.businessName,
                    businessType: formData.businessType,
                    address: formData.address,
                };

                const result = await dispatch(updateUserProfile(apiData));
                if (result.success) {
                    toast.success(t.profileUpdatedSuccess);
                    // Clear all errors on successful update
                    setErrors({});
                } else {
                    toast.error(result.error || t.failedToUpdateProfile);
                }
            } catch (error) {
                console.error('Profile update error:', error);
                // Show specific error message
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
        <div className="dark:bg-customBrown bg-white dark:text-white border border-gray-200 dark:border-customBorderColor p-8 rounded-2xl mx-auto dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <h2 className="text-24 font-ttcommons font-bold mb-8">{t.personalInformation}</h2>
            <form onSubmit={handleSubmit} autoComplete="off">
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
                    />
                    <div>
                        <label className="block text-16 font-medium mb-2 text-gray-900 dark:text-white">{t.businessType}</label>
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
                        />
                        {errors.businessType && <p className="text-customRed text-lg mt-1">{errors.businessType}</p>}
                    </div>
                </div>

                <div className="mt-6">
                    <CommonInput
                        label={t.address}
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        showErrorOnFocus={true}
                        error={errors.address}
                        placeholder={t.enterAddress}
                        labelFontSize="text-14"
                    />
                </div>

                <div className="mt-8">
                    <CommonButton
                        text={isLoading ? t.saving : t.saveChanges}
                        className="!text-white rounded-lg px-8 py-2"
                        type="submit"
                        disabled={isLoading}
                    />
                </div>
            </form>
        </div>
    )
}

export default PersonalInformation
