import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonInput, CommonButton, CommonCustomOutlineButton } from '../index';
import { GoShieldLock } from "react-icons/go";
import { FiPlus } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';
import { getValidationTranslations, getUserCardTranslations } from '../../utils/translations';

function LabelWithAsterisk({ htmlFor, children }) {
    return (
        <label htmlFor={htmlFor} className="block text-xl font-medium mb-2">
            {children} <span className="text-customRed">*</span>
        </label>
    );
}

function AddNewCreditCard() {
    const navigate = useNavigate();
    const { language } = useLanguage();
    const v = getValidationTranslations(language);
    const t = getUserCardTranslations(language);
    
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expireDate: '',
        cvc: '',
        streetAddress: '',
        city: '',
        postCode: ''
    });

    const [errors, setErrors] = useState({});

    // Card number validation
    const validateCardNumber = (cardNumber) => {
        if (!cardNumber) {
            return v.cardNumberRequired;
        }
        // Remove spaces and check if it's 13-19 digits
        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (!/^\d{13,19}$/.test(cleanNumber)) {
            return v.cardNumberInvalid;
        }
        return "";
    };

    // Card name validation
    const validateCardName = (cardName) => {
        if (!cardName) {
            return v.cardNameRequired;
        }
        if (!/^[a-zA-Z\s]+$/.test(cardName)) {
            return v.cardNameLettersOnly;
        }
        if (cardName.length < 2) {
            return v.cardNameMinLength;
        }
        if (cardName.length > 50) {
            return v.cardNameTooLong;
        }
        return "";
    };

    // Expire date validation
    const validateExpireDate = (expireDate) => {
        if (!expireDate) {
            return v.expireDateRequired;
        }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expireDate)) {
            return v.expireDateFormat;
        }
        
        // Check if date is not expired
        const [month, year] = expireDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        if (parseInt(year) < currentYear || 
            (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
            return v.expireDateExpired;
        }
        return "";
    };

    // CVC validation
    const validateCVC = (cvc) => {
        if (!cvc) {
            return v.cvcRequired;
        }
        if (!/^\d{3,4}$/.test(cvc)) {
            return v.cvcInvalid;
        }
        return "";
    };

    // Street address validation
    const validateStreetAddress = (streetAddress) => {
        if (!streetAddress) {
            return v.streetAddressRequired;
        }
        if (streetAddress.length < 5) {
            return v.streetAddressMinLength;
        }
        if (streetAddress.length > 100) {
            return v.streetAddressTooLong;
        }
        return "";
    };

    // City validation
    const validateCity = (city) => {
        if (!city) {
            return v.cityRequired;
        }
        if (!/^[a-zA-Z\s]+$/.test(city)) {
            return v.cityLettersOnly;
        }
        if (city.length < 2) {
            return v.cityMinLength;
        }
        if (city.length > 50) {
            return v.cityTooLong;
        }
        return "";
    };

    // Post code validation
    const validatePostCode = (postCode) => {
        if (!postCode) {
            return v.postCodeRequired;
        }
        if (!/^[a-zA-Z0-9\s-]+$/.test(postCode)) {
            return v.postCodeInvalid;
        }
        if (postCode.length < 3) {
            return v.postCodeMinLength;
        }
        if (postCode.length > 10) {
            return v.postCodeTooLong;
        }
        return "";
    };

    const validate = () => {
        const newErrors = {};
        
        const cardNumberError = validateCardNumber(formData.cardNumber);
        if (cardNumberError) newErrors.cardNumber = cardNumberError;
        
        const cardNameError = validateCardName(formData.cardName);
        if (cardNameError) newErrors.cardName = cardNameError;
        
        const expireDateError = validateExpireDate(formData.expireDate);
        if (expireDateError) newErrors.expireDate = expireDateError;
        
        const cvcError = validateCVC(formData.cvc);
        if (cvcError) newErrors.cvc = cvcError;
        
        const streetAddressError = validateStreetAddress(formData.streetAddress);
        if (streetAddressError) newErrors.streetAddress = streetAddressError;
        
        const cityError = validateCity(formData.city);
        if (cityError) newErrors.city = cityError;
        
        const postCodeError = validatePostCode(formData.postCode);
        if (postCodeError) newErrors.postCode = postCodeError;
        
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        
        // Real-time validation
        if (name === 'cardNumber') {
            const cardNumberError = validateCardNumber(value);
            setErrors(prev => ({ ...prev, cardNumber: cardNumberError }));
        } else if (name === 'cardName') {
            const cardNameError = validateCardName(value);
            setErrors(prev => ({ ...prev, cardName: cardNameError }));
        } else if (name === 'expireDate') {
            const expireDateError = validateExpireDate(value);
            setErrors(prev => ({ ...prev, expireDate: expireDateError }));
        } else if (name === 'cvc') {
            const cvcError = validateCVC(value);
            setErrors(prev => ({ ...prev, cvc: cvcError }));
        } else if (name === 'streetAddress') {
            const streetAddressError = validateStreetAddress(value);
            setErrors(prev => ({ ...prev, streetAddress: streetAddressError }));
        } else if (name === 'city') {
            const cityError = validateCity(value);
            setErrors(prev => ({ ...prev, city: cityError }));
        } else if (name === 'postCode') {
            const postCodeError = validatePostCode(value);
            setErrors(prev => ({ ...prev, postCode: postCodeError }));
        } else if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const handleFocus = (e) => {
        const { name, value } = e.target;
        
        if (name === 'cardNumber' && !value) {
            setErrors(prev => ({ ...prev, cardNumber: v.cardNumberRequired }));
        } else if (name === 'cardName' && !value) {
            setErrors(prev => ({ ...prev, cardName: v.cardNameRequired }));
        } else if (name === 'expireDate' && !value) {
            setErrors(prev => ({ ...prev, expireDate: v.expireDateRequired }));
        } else if (name === 'cvc' && !value) {
            setErrors(prev => ({ ...prev, cvc: v.cvcRequired }));
        } else if (name === 'streetAddress' && !value) {
            setErrors(prev => ({ ...prev, streetAddress: v.streetAddressRequired }));
        } else if (name === 'city' && !value) {
            setErrors(prev => ({ ...prev, city: v.cityRequired }));
        } else if (name === 'postCode' && !value) {
            setErrors(prev => ({ ...prev, postCode: v.postCodeRequired }));
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        
        if (name === 'cardNumber') {
            const cardNumberError = validateCardNumber(value);
            setErrors(prev => ({ ...prev, cardNumber: cardNumberError }));
        } else if (name === 'cardName') {
            const cardNameError = validateCardName(value);
            setErrors(prev => ({ ...prev, cardName: cardNameError }));
        } else if (name === 'expireDate') {
            const expireDateError = validateExpireDate(value);
            setErrors(prev => ({ ...prev, expireDate: expireDateError }));
        } else if (name === 'cvc') {
            const cvcError = validateCVC(value);
            setErrors(prev => ({ ...prev, cvc: cvcError }));
        } else if (name === 'streetAddress') {
            const streetAddressError = validateStreetAddress(value);
            setErrors(prev => ({ ...prev, streetAddress: streetAddressError }));
        } else if (name === 'city') {
            const cityError = validateCity(value);
            setErrors(prev => ({ ...prev, city: cityError }));
        } else if (name === 'postCode') {
            const postCodeError = validatePostCode(value);
            setErrors(prev => ({ ...prev, postCode: postCodeError }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            console.log('New card added:', formData);
            navigate(-1);
        }
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <h2 className="text-3xl font-bold mb-8">{t.addNewCreditCard}</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div>
                        <LabelWithAsterisk htmlFor="cardNumber">{t.cardNumber}</LabelWithAsterisk>
                        <CommonInput
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            error={errors.cardNumber}
                            placeholder={t.cardNumberPlaceholder}
                        />
                    </div>
                    <div>
                        <LabelWithAsterisk htmlFor="cardName">{t.nameOnCard}</LabelWithAsterisk>
                        <CommonInput
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            error={errors.cardName}
                            placeholder={t.cardHolderNamePlaceholder}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <LabelWithAsterisk htmlFor="expireDate">{t.expireDate}</LabelWithAsterisk>
                            <CommonInput
                                id="expireDate"
                                name="expireDate"
                                value={formData.expireDate}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                error={errors.expireDate}
                                placeholder={t.expireDatePlaceholder}
                            />
                        </div>
                        <div>
                            <LabelWithAsterisk htmlFor="cvc">{t.cvc}</LabelWithAsterisk>
                            <CommonInput
                                id="cvc"
                                name="cvc"
                                value={formData.cvc}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                error={errors.cvc}
                                placeholder={t.cvcPlaceholder}
                            />
                        </div>
                    </div>
                    <div>
                        <LabelWithAsterisk htmlFor="streetAddress">{t.streetAddress}</LabelWithAsterisk>
                        <CommonInput
                            id="streetAddress"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            error={errors.streetAddress}
                            placeholder={t.streetAddressPlaceholder}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <LabelWithAsterisk htmlFor="city">{t.city}</LabelWithAsterisk>
                            <CommonInput
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                error={errors.city}
                                placeholder={t.cityNamePlaceholder}
                            />
                        </div>
                        <div>
                            <LabelWithAsterisk htmlFor="postCode">{t.postCode}</LabelWithAsterisk>
                            <CommonInput
                                id="postCode"
                                name="postCode"
                                value={formData.postCode}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                error={errors.postCode}
                                placeholder={t.postCodePlaceholder}
                            />
                        </div>
                    </div>
                </div>

                <div className="dark:bg-[#1F252F] bg-blue-50 p-4 rounded-lg flex items-start mt-8 border-2 dark:border-gray-800 border-gray-200 gap-4">
                    <GoShieldLock className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold">{t.secureAndEncrypted}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t.secureDescription}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                    <CommonButton
                        text={t.addCard}
                        type="submit"
                        icon={<FiPlus />}
                        className="flex-1 !text-white rounded-lg py-3 text-lg"
                    />
                    <CommonCustomOutlineButton
                        text={t.cancel}
                        onClick={handleCancel}
                        className="flex-1 rounded-lg py-3 text-lg"
                        borderColor='border dark:border-gray-800 border-gray-200'
                    />
                </div>
            </form>
        </div>
    );
}

export default AddNewCreditCard;