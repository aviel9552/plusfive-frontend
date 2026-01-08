import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addCustomerAction } from '../../../redux/actions/customerActions';
import { toast } from 'react-toastify';
import CommonButton from '../../../components/commonComponent/CommonButton';
import CommonInput from '../../../components/commonComponent/CommonInput';
import CommonNormalDropDown from '../../../components/commonComponent/CommonNormalDropDown';

function CreateAdminCustomer() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        businessName: '',
        businessType: '',
        address: '',
        whatsappNumber: '',
        directChatMessage: '',
        notes: '',
        rating: 0,
        lastPayment: 0,
        totalPaid: 0,
        status: 'active'
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Email validation function
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        if (email.length > 50) return 'Email cannot exceed 50 characters';
        return "";
    };

    const businessTypes = [
        { value: 'Retail', label: 'Retail' },
        { value: 'Technology', label: 'Technology' },
        { value: 'Healthcare', label: 'Healthcare' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Education', label: 'Education' },
        { value: 'Manufacturing', label: 'Manufacturing' },
        { value: 'Services', label: 'Services' },
        { value: 'Food & Beverage', label: 'Food & Beverage' },
        { value: 'Real Estate', label: 'Real Estate' },
        { value: 'Other', label: 'Other' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        // Real-time validation for email
        if (name === 'email') {
            if (!value) {
                setErrors(prev => ({ ...prev, email: "" }));
            } else {
                const emailError = validateEmail(value);
                setErrors(prev => ({ ...prev, email: emailError }));
            }
        }

        // Real-time validation for phone number
        if (name === 'phoneNumber') {
            if (!value.trim()) {
                setErrors(prev => ({ ...prev, phoneNumber: "" }));
            } else if (!/^[0-9]+$/.test(value.replace(/\s/g, ''))) {
                setErrors(prev => ({ ...prev, phoneNumber: 'Phone number should contain only digits' }));
            } else if (value.replace(/\s/g, '').length !== 10) {
                setErrors(prev => ({ ...prev, phoneNumber: 'Phone number must be exactly 10 digits' }));
            } else {
                setErrors(prev => ({ ...prev, phoneNumber: "" }));
            }
        }

        // Real-time validation for first name
        if (name === 'firstName') {
            if (!value.trim()) {
                setErrors(prev => ({ ...prev, firstName: "" }));
            } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                setErrors(prev => ({ ...prev, firstName: 'First name should contain only letters' }));
            } else if (value.trim().length < 2) {
                setErrors(prev => ({ ...prev, firstName: 'First name must be at least 2 characters' }));
            } else if (value.trim().length > 50) {
                setErrors(prev => ({ ...prev, firstName: 'First name cannot exceed 50 characters' }));
            } else {
                setErrors(prev => ({ ...prev, firstName: "" }));
            }
        }

        // Real-time validation for last name
        if (name === 'lastName') {
            if (!value.trim()) {
                setErrors(prev => ({ ...prev, lastName: "" }));
            } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                setErrors(prev => ({ ...prev, lastName: 'Last name should contain only letters' }));
            } else if (value.trim().length < 2) {
                setErrors(prev => ({ ...prev, lastName: 'Last name must be at least 2 characters' }));
            } else if (value.trim().length > 50) {
                setErrors(prev => ({ ...prev, lastName: 'Last name cannot exceed 50 characters' }));
            } else {
                setErrors(prev => ({ ...prev, lastName: "" }));
            }
        }

        // Real-time validation for business name
        if (name === 'businessName') {
            if (!value.trim()) {
                setErrors(prev => ({ ...prev, businessName: "" }));
            } else if (!/^[a-zA-Z\s]+$/.test(value.trim())) {
                setErrors(prev => ({ ...prev, businessName: 'Business name should contain only letters' }));
            } else if (value.trim().length < 2) {
                setErrors(prev => ({ ...prev, businessName: 'Business name must be at least 2 characters' }));
            } else if (value.trim().length > 100) {
                setErrors(prev => ({ ...prev, businessName: 'Business name cannot exceed 100 characters' }));
            } else {
                setErrors(prev => ({ ...prev, businessName: "" }));
            }
        }

        // Real-time validation for password
        if (name === 'password') {
            if (!value) {
                setErrors(prev => ({ ...prev, password: "" }));
            } else if (value.length < 8) {
                setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters' }));
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                setErrors(prev => ({ ...prev, password: 'Password must contain uppercase, lowercase and number' }));
            } else {
                setErrors(prev => ({ ...prev, password: "" }));
            }
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFocus = (e) => {
        const { name } = e.target;
        // Show validation error immediately when user focuses on field
        if (name === 'email') {
            if (!form.email) {
                setErrors(prev => ({ ...prev, email: 'Email is required' }));
            } else {
                const emailError = validateEmail(form.email);
                if (emailError) {
                    setErrors(prev => ({ ...prev, email: emailError }));
                }
            }
        } else if (name === 'firstName') {
            if (!form.firstName.trim()) {
                setErrors(prev => ({ ...prev, firstName: 'First name is required' }));
            }
        } else if (name === 'lastName') {
            if (!form.lastName.trim()) {
                setErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
            }
        } else if (name === 'phoneNumber') {
            if (!form.phoneNumber.trim()) {
                setErrors(prev => ({ ...prev, phoneNumber: 'Phone number is required' }));
            }
        } else if (name === 'businessName') {
            if (!form.businessName.trim()) {
                setErrors(prev => ({ ...prev, businessName: 'Business name is required' }));
            }
        } else if (name === 'password') {
            if (!form.password) {
                setErrors(prev => ({ ...prev, password: 'Password is required' }));
            }
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        // Validate on blur
        if (name === 'email') {
            const emailError = validateEmail(value);
            setErrors(prev => ({ ...prev, email: emailError }));
        }
    };

    const handleDropDownChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // First Name validation
        if (!form.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(form.firstName.trim())) {
            newErrors.firstName = 'First name should contain only letters';
        } else if (form.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        } else if (form.firstName.trim().length > 50) {
            newErrors.firstName = 'First name cannot exceed 50 characters';
        }

        // Last Name validation
        if (!form.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(form.lastName.trim())) {
            newErrors.lastName = 'Last name should contain only letters';
        } else if (form.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
        } else if (form.lastName.trim().length > 50) {
            newErrors.lastName = 'Last name cannot exceed 50 characters';
        }

        // Email validation
        const emailError = validateEmail(form.email);
        if (emailError) {
            newErrors.email = emailError;
        }

        // Password validation
        if (!form.password) {
            newErrors.password = 'Password is required';
        } else if (form.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase and number';
        }

        // Phone validation
        if (!form.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[0-9]+$/.test(form.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = 'Phone number should contain only digits';
        } else if (form.phoneNumber.replace(/\s/g, '').length !== 10) {
            newErrors.phoneNumber = 'Phone number must be exactly 10 digits';
        }

        // Business Name validation
        if (!form.businessName.trim()) {
            newErrors.businessName = 'Business name is required';
        } else if (!/^[a-zA-Z\s]+$/.test(form.businessName.trim())) {
            newErrors.businessName = 'Business name should contain only letters';
        } else if (form.businessName.trim().length < 2) {
            newErrors.businessName = 'Business name must be at least 2 characters';
        } else if (form.businessName.trim().length > 100) {
            newErrors.businessName = 'Business name cannot exceed 100 characters';
        }

        // Business Type validation
        if (!form.businessType) {
            newErrors.businessType = 'Business type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Call the Redux action to add customer
            const result = await dispatch(addCustomerAction(form));

            if (result.success) {
                toast.success('Customer created successfully!');
                navigate('/app/customers');
            } else {
                toast.error(result.error || 'Failed to create customer');
            }
        } catch (error) {
            console.error('Customer creation error:', error);
            toast.error('An error occurred while creating customer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="w-full">
                <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl p-8 shadow-lg">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Customer</h1>
                        <CommonButton
                            text="Back to Customers"
                            onClick={() => navigate('/app/customers')}
                            className="px-6 pt-2.5 pb-2 rounded-lg text-18"
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="bg-gray-50 dark:bg-customBlack p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <CommonInput
                                    id="firstName"
                                    label="First Name"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    error={errors.firstName}
                                    placeholder="Enter first name"
                                    required
                                />
                                <CommonInput
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    error={errors.lastName}
                                    placeholder="Enter last name"
                                    required
                                />
                                <CommonInput
                                    id="email"
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    error={errors.email}
                                    placeholder="Enter email address"
                                    required
                                />
                                <CommonInput
                                    id="password"
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    error={errors.password}
                                    placeholder="Enter password"
                                    required
                                    showPasswordValidation={true}
                                    showPasswordToggle={true}
                                />
                                <CommonInput
                                    id="phoneNumber"
                                    label="Phone Number"
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    error={errors.phoneNumber}
                                    placeholder="Enter phone number"
                                    required
                                />
                                <CommonInput
                                    id="whatsappNumber"
                                    label="WhatsApp Number"
                                    name="whatsappNumber"
                                    value={form.whatsappNumber}
                                    onChange={handleChange}
                                    placeholder="Enter WhatsApp number"
                                />
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="bg-gray-50 dark:bg-customBlack p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Business Information</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <CommonInput
                                    id="businessName"
                                    label="Business Name"
                                    name="businessName"
                                    value={form.businessName}
                                    onChange={handleChange}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                    error={errors.businessName}
                                    placeholder="Enter business name"
                                    required
                                />

                                {/* Business Type Dropdown with Manual Label */}
                                <div>
                                    <label className="block text-20 font-medium text-black dark:text-white mb-2">
                                        Business Type <span className="text-red-500">*</span>
                                    </label>
                                    <CommonNormalDropDown
                                        value={form.businessType}
                                        options={businessTypes}
                                        onChange={(value) => handleDropDownChange('businessType', value)}
                                        error={errors.businessType}
                                        placeholder="Select business type"
                                        required
                                    />
                                    {errors.businessType && (
                                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.businessType}</p>
                                    )}
                                </div>

                                <CommonInput
                                    id="address"
                                    label="Address"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    placeholder="Enter business address"
                                />
                                <CommonInput
                                    id="directChatMessage"
                                    label="Direct Chat Message"
                                    name="directChatMessage"
                                    value={form.directChatMessage}
                                    onChange={handleChange}
                                    placeholder="Enter direct chat message"
                                />
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="bg-gray-50 dark:bg-customBlack p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Additional Details</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <CommonInput
                                    id="rating"
                                    label="Rating"
                                    name="rating"
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={form.rating}
                                    onChange={handleChange}
                                    placeholder="Enter rating (0-5)"
                                />
                                <CommonInput
                                    id="lastPayment"
                                    label="Last Payment"
                                    name="lastPayment"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.lastPayment}
                                    onChange={handleChange}
                                    placeholder="Enter last payment amount"
                                />
                                <CommonInput
                                    id="totalPaid"
                                    label="Total Paid"
                                    name="totalPaid"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.totalPaid}
                                    onChange={handleChange}
                                    placeholder="Enter total paid amount"
                                />

                                {/* Status Dropdown with Manual Label */}
                                <div>
                                    <label className="block text-20 font-medium text-black dark:text-white mb-2">
                                        Status
                                    </label>
                                    <CommonNormalDropDown
                                        value={form.status}
                                        options={statusOptions}
                                        onChange={(value) => handleDropDownChange('status', value)}
                                        placeholder="Select status"
                                    />
                                </div>
                            </div>
                            <div className="mt-6">
                                <CommonInput
                                    id="notes"
                                    label="Notes"
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    as="textarea"
                                    rows={4}
                                    placeholder="Enter any additional notes about the customer..."
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4">
                            <CommonButton
                                text="Cancel"
                                onClick={() => navigate('/app/customers')}
                                className="px-6 pt-2.5 pb-2 rounded-lg text-18"
                            />
                            <CommonButton
                                text={loading ? 'Creating...' : 'Create Customer'}
                                type="submit"
                                disabled={loading}
                                className="px-6 pt-2.5 pb-2 rounded-lg text-18"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateAdminCustomer;
