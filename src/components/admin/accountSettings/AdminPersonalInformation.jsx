import React, { useState, useEffect } from 'react'
import { CommonButton, CommonInput } from '../../index';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../../redux/actions/authActions';
import { toast } from 'react-toastify';

function AdminPersonalInformation() {
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
    const user = useSelector(state => state.auth?.user);
    const dispatch = useDispatch();

    // Populate form with user data when component mounts or user changes
    useEffect(() => {
        if (user) {
            // Only update form if user data is different from current form data
            const newFormData = {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phoneNumber || '',
                businessName: user.businessName || '',
                businessType: user.businessType || '',
                address: user.address || '',
            };

            // Check if form data is different from user data
            const isFormDataDifferent = JSON.stringify(newFormData) !== JSON.stringify(formData);

            if (isFormDataDifferent) {
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
        }
    }, [user]);

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email address is invalid';
        }
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        }
        // else if (!/^\d{10,}$/.test(formData.phone)) {
        //     newErrors.phone = 'Phone number must be at least 10 digits.';
        // }
        if (!formData.businessName) newErrors.businessName = 'Business name is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.address) newErrors.address = 'Address is required';
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        if (name === 'email') {
            if (!value) {
                setErrors(prev => ({ ...prev, email: 'Email is required' }));
            } else if (!/\S+@\S+\.\S+/.test(value)) {
                setErrors(prev => ({ ...prev, email: 'Email address is invalid' }));
            } else {
                setErrors(prev => ({ ...prev, email: null }));
            }
        } else if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            // Update user data via API
            dispatch(updateUserProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phone,
                businessName: formData.businessName,
                businessType: formData.businessType,
                address: formData.address,
            })).then((result) => {
                if (result && result.success === false) {
                    toast.error(result.error || 'Failed to update personal information');
                    // Keep form data unchanged on error
                } else {
                    toast.success('Personal information updated successfully!');
                }
            }).catch((error) => {
                toast.error('Failed to update personal information');
                console.error('Error updating user data:', error);
            });
        }
    };

    return (
        <div className="dark:bg-customBrown bg-white dark:text-white border border-gray-200 dark:border-customBorderColor p-8 rounded-2xl mx-auto dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <h2 className="text-3xl font-bold mb-8">Personal Information</h2>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CommonInput
                        label="First name"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        error={errors.firstName}
                        placeholder="first name"
                    />
                    <CommonInput
                        label="Last name"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        error={errors.lastName}
                        placeholder="last name"
                    />
                </div>

                <div className="mt-6">
                    <CommonInput
                        label="Email"
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="email"
                    />
                </div>

                <div className="mt-6">
                    <CommonInput
                        label="Phone"
                        // type="number"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        error={errors.phone}
                        placeholder="phone"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <CommonInput
                        label="Business Name"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        error={errors.businessName}
                        placeholder="business name"
                    />
                    <CommonInput
                        label="Business Type"
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        error={errors.businessType}
                        placeholder="business type"
                    />
                </div>

                <div className="mt-6">
                    <CommonInput
                        label="Address"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        error={errors.address}
                        placeholder="address"
                    />
                </div>

                <div className="mt-8">

                    <CommonButton
                        text="Save Change"
                        className=" !text-white rounded-lg px-8 py-2"
                        type="submit"
                    />
                </div>
            </form>
        </div>
    )
}

export default AdminPersonalInformation
