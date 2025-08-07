import React, { useState } from 'react';
import { CommonButton, CommonInput, SquaresAnim } from '../../components/index';
import en from '../../i18/en.json';
import he from '../../i18/he.json';
import LoginBG from '../../assets/LoginBG.png';
import { toast } from 'react-toastify';

function ContactSales({ language }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    requirements: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Please tell us about your requirements';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Handle form submission here
      console.log('Form submitted:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        requirements: ''
      });
      setErrors({});

      toast.success('Thank you! We will contact you within 24 hours.');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = language === 'he' ? he : en;

  return (
    <div className="relative h-screen flex flex-col items-center justify-center bg-customBlack px-4 py-8">
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <SquaresAnim speed={0.5} squareSize={50} direction='down' isDarkMode={true} />
        {/* Left-bottom focused bubble/gradient */}
        <div className="
          absolute inset-0
          bg-[radial-gradient(ellipse_at_left_bottom,_var(--tw-gradient-stops))]
          from-[#232136]/80 via-[#232136]/60 to-[#232136]/0
          pointer-events-none"
        />
      </div>
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

        <div className="flex-1 rounded-2xl shadow-2xl border border-customBorderColor backdrop-blur-md md:py-[64px] md:px-[80px] p-8 bg-cover bg-center"
          style={{
            backgroundImage: `url(${LoginBG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <h2 className="md:text-48 text-30 font-extrabold text-center text-white font-testtiemposfine">
            Contact Sales
          </h2>
          <p className="text-17 mt-3 mb-8 text-center text-white">
            Tell us about your business needs and we'll get back to you within 24 hours.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <CommonInput
                label="First Name"
                labelFontSize="text-16"
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                error={errors.firstName}
                textColor="text-white"
                labelColor="text-white"
                inputBg="bg-gray-100/10"
              />
              <CommonInput
                label="Last Name"
                labelFontSize="text-16"
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                error={errors.lastName}
                textColor="text-white"
                labelColor="text-white"
                inputBg="bg-gray-100/10"
              />
            </div>

            <CommonInput
              label="Email"
              labelFontSize="text-16"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              error={errors.email}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-gray-100/10"
            />

            <CommonInput
              label="Phone"
              labelFontSize="text-16"
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              error={errors.phone}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-gray-100/10"
            />

            <CommonInput
              label="Business Requirements"
              labelFontSize="text-16"
              as="textarea"
              id="requirements"
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder="Tell us about your business requirements, current challenges, and what you're looking to achieve..."
              error={errors.requirements}
              textColor="text-white"
              labelColor="text-white"
              inputBg="bg-gray-100/10"
              rows={4}
            />

            <CommonButton
              text={isSubmitting ? "Sending..." : "Send Message"}
              type="submit"
              className="w-full !text-white rounded-lg py-3 text-xl shadow-lg"
              disabled={isSubmitting}
            />
          </form>
        </div>


      </div>
    </div>
  );
}

export default ContactSales; 