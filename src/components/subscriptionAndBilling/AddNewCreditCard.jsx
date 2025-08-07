import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonInput, CommonButton, CommonCustomOutlineButton } from '../index';
import { GoShieldLock } from "react-icons/go";
import { FiPlus } from 'react-icons/fi';

function LabelWithAsterisk({ htmlFor, children }) {
    return (
        <label htmlFor={htmlFor} className="block text-xl font-medium mb-2">
            {children} <span className="text-customRed">*</span>
        </label>
    );
}

function AddNewCreditCard() {
    const navigate = useNavigate();
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

    const validate = () => {
        const newErrors = {};
        if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
        if (!formData.cardName) newErrors.cardName = 'Name on card is required';
        if (!formData.expireDate) {
            newErrors.expireDate = 'Expire date is required';
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expireDate)) {
            newErrors.expireDate = 'Date must be in MM/YY format';
        }
        if (!formData.cvc) {
            newErrors.cvc = 'CVC is required';
        } else if (!/^\d{3,4}$/.test(formData.cvc)) {
            newErrors.cvc = 'Invalid CVC';
        }
        if (!formData.streetAddress) newErrors.streetAddress = 'Street address is required';
        if (!formData.city) newErrors.city = 'City is required';
        if (!formData.postCode) newErrors.postCode = 'Post code is required';
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
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
            <h2 className="text-3xl font-bold mb-8">Add New Credit Card</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div>
                        <LabelWithAsterisk htmlFor="cardNumber">Card Number</LabelWithAsterisk>
                        <CommonInput
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            error={errors.cardNumber}
                            placeholder="Card Number"
                        />
                    </div>
                    <div>
                        <LabelWithAsterisk htmlFor="cardName">Name on Card</LabelWithAsterisk>
                        <CommonInput
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            error={errors.cardName}
                            placeholder="Card Holder name"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <LabelWithAsterisk htmlFor="expireDate">Expire Date</LabelWithAsterisk>
                            <CommonInput
                                id="expireDate"
                                name="expireDate"
                                value={formData.expireDate}
                                onChange={handleChange}
                                error={errors.expireDate}
                                placeholder="mm/yy"
                            />
                        </div>
                        <div>
                            <LabelWithAsterisk htmlFor="cvc">CVC</LabelWithAsterisk>
                            <CommonInput
                                id="cvc"
                                name="cvc"
                                value={formData.cvc}
                                onChange={handleChange}
                                error={errors.cvc}
                                placeholder="cvc"
                            />
                        </div>
                    </div>
                    <div>
                        <LabelWithAsterisk htmlFor="streetAddress">Street Address</LabelWithAsterisk>
                        <CommonInput
                            id="streetAddress"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleChange}
                            error={errors.streetAddress}
                            placeholder="Street address"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <LabelWithAsterisk htmlFor="city">City</LabelWithAsterisk>
                            <CommonInput
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={errors.city}
                                placeholder="City name"
                            />
                        </div>
                        <div>
                            <LabelWithAsterisk htmlFor="postCode">Post Code</LabelWithAsterisk>
                            <CommonInput
                                id="postCode"
                                name="postCode"
                                value={formData.postCode}
                                onChange={handleChange}
                                error={errors.postCode}
                                placeholder="Post code"
                            />
                        </div>
                    </div>
                </div>

                <div className="dark:bg-[#1F252F] bg-blue-50 p-4 rounded-lg flex items-start mt-8 border-2 dark:border-gray-800 border-gray-200">
                    <GoShieldLock className="w-6 h-6 text-blue-500 mr-4 mt-1 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold">Secure & Encrypted</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">All payment information is encrypted and securely stored with protection.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-8">
                    <CommonButton
                        text="Add Card"
                        type="submit"
                        icon={<FiPlus />}
                        className="flex-1 !text-white rounded-lg py-3 text-lg"
                    />
                    <CommonCustomOutlineButton
                        text="Cancel"
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