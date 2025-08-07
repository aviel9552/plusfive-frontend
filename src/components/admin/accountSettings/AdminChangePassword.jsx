import React, { useState } from 'react';
import { CommonButton, CommonInput } from '../../index';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

function AdminChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  // Password visibility state
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      console.log('Password changed successfully:', formData);
      // Handle password change logic here
    }
  };

  // Helper to render password input with eye icon
  const renderPasswordInput = ({
    label, id, name, value, onChange, error, placeholder, show, setShow
  }) => (
    <div className="relative">
      <CommonInput
        label={label}
        type={show ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        error={error}
        placeholder={placeholder}
        autoComplete="off"
      />
      <button
        type="button"
        className="absolute right-5 top-[3.3rem] text-gray-400 hover:text-pink-500 focus:outline-none"
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <BsEyeSlash className='text-xl' /> : <BsEye className='text-xl' />}
      </button>
    </div>
  );

  return (
    <div className="dark:bg-customBrown bg-white dark:text-white border border-gray-200 dark:border-customBorderColor p-8 rounded-2xl mx-auto mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <h2 className="text-3xl font-bold mb-8">Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mt-6">
          {renderPasswordInput({
            label: 'Current Password',
            id: 'currentPassword',
            name: 'currentPassword',
            value: formData.currentPassword,
            onChange: handleChange,
            error: errors.currentPassword,
            placeholder: 'current password',
            show: showPassword.current,
            setShow: (fn) => setShowPassword(p => ({ ...p, current: typeof fn === 'function' ? fn(p.current) : fn })),
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {renderPasswordInput({
            label: 'New Password',
            id: 'newPassword',
            name: 'newPassword',
            value: formData.newPassword,
            onChange: handleChange,
            error: errors.newPassword,
            placeholder: 'new password',
            show: showPassword.new,
            setShow: (fn) => setShowPassword(p => ({ ...p, new: typeof fn === 'function' ? fn(p.new) : fn })),
          })}
          {renderPasswordInput({
            label: 'Confirm Password',
            id: 'confirmPassword',
            name: 'confirmPassword',
            value: formData.confirmPassword,
            onChange: handleChange,
            error: errors.confirmPassword,
            placeholder: 'confirm password',
            show: showPassword.confirm,
            setShow: (fn) => setShowPassword(p => ({ ...p, confirm: typeof fn === 'function' ? fn(p.confirm) : fn })),
          })}
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
  );
}

export default AdminChangePassword;
