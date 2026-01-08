import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCustomerByIdAction, updateCustomerAction } from '../../redux/actions/customerActions';
import { toast } from 'react-toastify';
import CommonButton from '../../components/commonComponent/CommonButton';
import CommonInput from '../../components/commonComponent/CommonInput';
import CommonNormalDropDown from '../../components/commonComponent/CommonNormalDropDown';

function EditCustomer() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { customerId } = useParams();

    const { selectedCustomer, loading } = useSelector(state => state.customer);

    const [form, setForm] = useState({
        email: '',
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
    const [submitting, setSubmitting] = useState(false);

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

    // Fetch customer data when component mounts
    useEffect(() => {
        if (customerId) {
            dispatch(getCustomerByIdAction(customerId));
        }
    }, [dispatch, customerId]);

    // Update form when customer data is loaded
    useEffect(() => {
        if (selectedCustomer) {
            setForm({
                email: selectedCustomer.customer?.email || '',
                firstName: selectedCustomer.customer?.firstName || '',
                lastName: selectedCustomer.customer?.lastName || '',
                phoneNumber: selectedCustomer.customer?.phoneNumber || '',
                businessName: selectedCustomer.customer?.businessName || '',
                businessType: selectedCustomer.customer?.businessType || '',
                address: selectedCustomer.customer?.address || '',
                whatsappNumber: selectedCustomer.customer?.whatsappNumber || '',
                directChatMessage: selectedCustomer.customer?.directChatMessage || '',
                notes: selectedCustomer.notes || '',
                rating: selectedCustomer.rating || 0,
                lastPayment: selectedCustomer.lastPayment || 0,
                totalPaid: selectedCustomer.totalPaid || 0,
                status: selectedCustomer.status || 'active'
            });
        }
    }, [selectedCustomer]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        
        // Real-time validation for email
        if (name === 'email') {
            if (!value) {
                setErrors(prev => ({ ...prev, email: 'Email is required' }));
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
            } else {
                setErrors(prev => ({ ...prev, email: '' }));
            }
        }

        // Real-time validation for phone number
        if (name === 'phoneNumber') {
            if (!value) {
                setErrors(prev => ({ ...prev, phoneNumber: 'Phone number is required' }));
            } else if (!/^\d{10,}$/.test(value.replace(/\D/g, ''))) {
                setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid phone number (minimum 10 digits)' }));
            } else {
                setErrors(prev => ({ ...prev, phoneNumber: '' }));
            }
        }

        // Real-time validation for whatsapp number
        if (name === 'whatsappNumber') {
            if (!value) {
                setErrors(prev => ({ ...prev, whatsappNumber: 'WhatsApp number is required' }));
            } else if (!/^\d{10,}$/.test(value.replace(/\D/g, ''))) {
                setErrors(prev => ({ ...prev, whatsappNumber: 'Please enter a valid WhatsApp number (minimum 10 digits)' }));
            } else {
                setErrors(prev => ({ ...prev, whatsappNumber: '' }));
            }
        }

        // Real-time validation for first name
        if (name === 'firstName') {
            if (!value) {
                setErrors(prev => ({ ...prev, firstName: 'First name is required' }));
            } else if (value.length < 2) {
                setErrors(prev => ({ ...prev, firstName: 'First name must be at least 2 characters' }));
            } else if (value.length > 50) {
                setErrors(prev => ({ ...prev, firstName: 'First name cannot exceed 50 characters' }));
            } else {
                setErrors(prev => ({ ...prev, firstName: '' }));
            }
        }

        // Real-time validation for last name
        if (name === 'lastName') {
            if (!value) {
                setErrors(prev => ({ ...prev, lastName: 'Last name is required' }));
            } else if (value.length < 2) {
                setErrors(prev => ({ ...prev, lastName: 'Last name must be at least 2 characters' }));
            } else if (value.length > 50) {
                setErrors(prev => ({ ...prev, lastName: 'Last name cannot exceed 50 characters' }));
            } else {
                setErrors(prev => ({ ...prev, lastName: '' }));
            }
        }

        // Real-time validation for business name
        if (name === 'businessName') {
            if (!value) {
                setErrors(prev => ({ ...prev, businessName: 'Business name is required' }));
            } else if (value.length < 2) {
                setErrors(prev => ({ ...prev, businessName: 'Business name must be at least 2 characters' }));
            } else if (value.length > 100) {
                setErrors(prev => ({ ...prev, businessName: 'Business name cannot exceed 100 characters' }));
            } else {
                setErrors(prev => ({ ...prev, businessName: '' }));
            }
        }

        // Real-time validation for address
        if (name === 'address') {
            if (!value) {
                setErrors(prev => ({ ...prev, address: 'Address required' }));
            } else if (value && value.length > 200) {
                setErrors(prev => ({ ...prev, address: 'Address cannot exceed 200 characters' }));
            } else {
                setErrors(prev => ({ ...prev, address: '' }));
            }
        }

        // Real-time validation for direct chat message
        if (name === 'directChatMessage') {
            if (!value) {
                setErrors(prev => ({ ...prev, directChatMessage: 'Direct chat message is required' }));
            } else if (value.length > 500) {
                setErrors(prev => ({ ...prev, directChatMessage: 'Direct chat message cannot exceed 500 characters' }));
            } else {
                setErrors(prev => ({ ...prev, directChatMessage: '' }));
            }
        }

        // Real-time validation for notes
        if (name === 'notes') {
            if (!value) {
                setErrors(prev => ({ ...prev, notes: 'Notes are required' }));
            } else if (value.length > 1000) {
                setErrors(prev => ({ ...prev, notes: 'Notes cannot exceed 1000 characters' }));
            } else {
                setErrors(prev => ({ ...prev, notes: '' }));
            }
        }

        // Real-time validation for rating
        if (name === 'rating') {
            if (value) {
                const numValue = parseFloat(value);
                if (numValue < 0 || numValue > 5) {
                    setErrors(prev => ({ ...prev, rating: 'Rating must be between 0 and 5' }));
                } else if (isNaN(numValue)) {
                    setErrors(prev => ({ ...prev, rating: 'Please enter a valid number' }));
                } else {
                    setErrors(prev => ({ ...prev, rating: '' }));
                }
            } else {
                setErrors(prev => ({ ...prev, rating: '' }));
            }
        }

        // Real-time validation for payments
        if (name === 'lastPayment') {
            if (value) {
                const numValue = parseFloat(value);
                if (numValue < 0) {
                    setErrors(prev => ({ ...prev, lastPayment: 'Last payment cannot be negative' }));
                } else if (isNaN(numValue)) {
                    setErrors(prev => ({ ...prev, lastPayment: 'Please enter a valid number' }));
                } else {
                    setErrors(prev => ({ ...prev, lastPayment: '' }));
                }
            } else {
                setErrors(prev => ({ ...prev, lastPayment: '' }));
            }
        }

        if (name === 'totalPaid') {
            if (value) {
                const numValue = parseFloat(value);
                if (numValue < 0) {
                    setErrors(prev => ({ ...prev, totalPaid: 'Total paid cannot be negative' }));
                } else if (isNaN(numValue)) {
                    setErrors(prev => ({ ...prev, totalPaid: 'Please enter a valid number' }));
                } else {
                    setErrors(prev => ({ ...prev, totalPaid: '' }));
                }
            } else {
                setErrors(prev => ({ ...prev, totalPaid: '' }));
            }
        }

        // Clear error when user starts typing for other fields
        if (errors[name] && !['email', 'phoneNumber', 'whatsappNumber', 'firstName', 'lastName', 'businessName', 'address', 'directChatMessage', 'notes', 'rating', 'lastPayment', 'totalPaid'].includes(name)) {
            setErrors(prev => ({ ...prev, [name]: '' }));
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

        if (!form.email) newErrors.email = 'Email is required';
        if (!form.firstName) newErrors.firstName = 'First name is required';
        if (!form.lastName) newErrors.lastName = 'Last name is required';
        if (!form.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!form.whatsappNumber) newErrors.whatsappNumber = 'WhatsApp number is required';
        if (!form.businessName) newErrors.businessName = 'Business name is required';
        if (!form.businessType) newErrors.businessType = 'Business type is required';
        if (!form.address) newErrors.address = 'Address is required';
        if (!form.directChatMessage) newErrors.directChatMessage = 'Direct chat message is required';
        if (!form.notes) newErrors.notes = 'Notes are required';

        // Email validation
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (form.phoneNumber && !/^\d{10,}$/.test(form.phoneNumber.replace(/\D/g, ''))) {
            newErrors.phoneNumber = 'Please enter a valid phone number (minimum 10 digits)';
        }

        // WhatsApp number validation
        if (form.whatsappNumber && !/^\d{10,}$/.test(form.whatsappNumber.replace(/\D/g, ''))) {
            newErrors.whatsappNumber = 'Please enter a valid WhatsApp number (minimum 10 digits)';
        }

        // Address validation
        if (form.address && form.address.length > 200) {
            newErrors.address = 'Address cannot exceed 200 characters';
        }

        // Direct chat message validation
        if (form.directChatMessage && form.directChatMessage.length > 500) {
            newErrors.directChatMessage = 'Direct chat message cannot exceed 500 characters';
        }

        // Notes validation
        if (form.notes && form.notes.length > 1000) {
            newErrors.notes = 'Notes cannot exceed 1000 characters';
        }

        // Rating validation
        if (form.rating < 0 || form.rating > 5) {
            newErrors.rating = 'Rating must be between 0 and 5';
        }

        // Payment validation
        if (form.lastPayment < 0) {
            newErrors.lastPayment = 'Last payment cannot be negative';
        }
        if (form.totalPaid < 0) {
            newErrors.totalPaid = 'Total paid cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const result = await dispatch(updateCustomerAction(customerId, form));
            
            if (result.success) {
                toast.success('Customer updated successfully!');
                navigate('/app/customers');
            } else {
                toast.error(result.error || 'Failed to update customer');
            }
        } catch (error) {
            toast.error('An error occurred while updating customer');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-customBrown flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading customer data...</p>
                </div>
            </div>
        );
    }

    if (!selectedCustomer) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-customBrown flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300">Customer not found</p>
                    <CommonButton
                        text="Back to Customers"
                        onClick={() => navigate('/app/customers')}
                        className="mt-4 px-6 pt-2.5 pb-2 rounded-lg text-18"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="w-full">
                <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl p-8 shadow-lg">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Customer</h1>
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
                                    error={errors.email}
                                    placeholder="Enter email address"
                                    required
                                />
                                <CommonInput
                                    id="phoneNumber"
                                    label="Phone Number"
                                    name="phoneNumber"
                                    value={form.phoneNumber}
                                    onChange={handleChange}
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
                                    error={errors.whatsappNumber}
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
                                    error={errors.businessName}
                                    placeholder="Enter business name"
                                    required
                                />
                                
                                {/* Business Type Dropdown with Manual Label */}
                                <div>
                                    <label className="block text-20 font-medium text-black dark:text-white mb-2">
                                        Business Type 
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
                                    error={errors.address}
                                    placeholder="Enter business address"
                                />
                                <CommonInput
                                    id="directChatMessage"
                                    label="Direct Chat Message"
                                    name="directChatMessage"
                                    value={form.directChatMessage}
                                    onChange={handleChange}
                                    error={errors.directChatMessage}
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
                                    error={errors.rating}
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
                                    error={errors.lastPayment}
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
                                    error={errors.totalPaid}
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
                                    error={errors.notes}
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
                                text={submitting ? 'Updating...' : 'Update Customer'}
                                type="submit"
                                disabled={submitting}
                                className="px-6 pt-2.5 pb-2 rounded-lg text-18"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditCustomer;
