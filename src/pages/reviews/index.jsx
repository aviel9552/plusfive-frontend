import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CommonButton } from '../../components';
import CommonInput from '../../components/commonComponent/CommonInput';
import reviewService from '../../redux/services/reviewServices';
import { toast } from 'react-toastify';

const ReviewPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        rating: 5,
        reviewText: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [urlParams, setUrlParams] = useState({
        customerId: null,
        userId: null
    });

    // Extract URL parameters on component mount
    useEffect(() => {
        const customerId = searchParams.get('customerId');
        const userId = searchParams.get('userId');
        
        setUrlParams({
            customerId,
            userId
        });

        // If required parameters are missing, show warning
        if (!customerId || !userId) {
            toast.warning('Missing required parameters. Please use the correct review link.');
        }
    }, [searchParams]);

    // Validation functions
    const validateReviewText = (text) => {
        if (!text.trim()) return 'Review text is required';
        if (text.trim().length < 10) return 'Review must be at least 10 characters';
        if (text.trim().length > 1000) return 'Review cannot exceed 1000 characters';
        return '';
    };

    const validateRating = (rating) => {
        if (!rating || rating < 1) return 'Please provide a rating';
        if (rating > 5) return 'Rating cannot exceed 5 stars';
        return '';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Real-time validation for review text
        if (name === 'reviewText') {
            if (!value.trim()) {
                setErrors(prev => ({ ...prev, reviewText: '' }));
            } else {
                const textError = validateReviewText(value);
                setErrors(prev => ({ ...prev, reviewText: textError }));
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
        if (name === 'reviewText') {
            if (!formData.reviewText.trim()) {
                setErrors(prev => ({ ...prev, reviewText: 'Review text is required' }));
            }
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        // Validate on blur
        if (name === 'reviewText') {
            const textError = validateReviewText(value);
            setErrors(prev => ({ ...prev, reviewText: textError }));
        }
    };

    const handleRatingChange = (rating) => {
        setFormData(prev => ({
            ...prev,
            rating: rating
        }));

        // Real-time validation for rating
        const ratingError = validateRating(rating);
        setErrors(prev => ({ ...prev, rating: ratingError }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Rating validation
        const ratingError = validateRating(formData.rating);
        if (ratingError) {
            newErrors.rating = ratingError;
        }

        // Review text validation
        const textError = validateReviewText(formData.reviewText);
        if (textError) {
            newErrors.reviewText = textError;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Check if required URL parameters are available
        if (!urlParams.customerId || !urlParams.userId) {
            toast.error('Missing required parameters. Cannot submit review.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare review data for API
            const reviewData = {
                customerId: urlParams.customerId,
                userId: urlParams.userId,
                rating: formData.rating,
                message: formData.reviewText.trim()
            };

            console.log('Submitting review data:', reviewData);

            // Call API service
            const result = await reviewService.addReview(reviewData);

            if (result.success) {
                toast.success('Review submitted successfully!');
                setIsSubmitted(true);
            } else {
                toast.error(result.error || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('An error occurred while submitting your review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({ rating, onRatingChange, readonly = false }) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => !readonly && onRatingChange(star)}
                        className={`text-2xl transition-colors duration-200 ${star <= rating
                            ? 'text-yellow-400 hover:text-yellow-500'
                            : 'text-gray-300 hover:text-gray-400'
                            } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                        disabled={readonly}
                    >
                        ★
                    </button>
                ))}
            </div>
        );
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center bg-gray-100 dark:bg-customBlack">
                <div className="bg-white dark:bg-customBrown border border-gray-200 dark:border-customBorderColor rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Thank You! 🙏
                    </h2>
                    <p className="text-gray-600 dark:text-white mb-6">
                        Your review has been successfully submitted. Your feedback is very important to us.
                    </p>
                    <CommonButton
                        text="Back to Home"
                        onClick={() => navigate('/')}
                        className="px-6 pt-2.5 pb-2 rounded-lg text-18"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gray-100 dark:bg-customBlack flex items-center justify-center">
            <div className="w-full max-w-4xl">
                <div className="bg-white dark:bg-customBrown border-gray-200 dark:border-2 dark:border-customBorderColor rounded-2xl p-8 shadow-lg">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Review</h1>

                        <CommonButton
                            text="Back to Home"
                            onClick={() => navigate('/')}
                            className="px-6 pt-2.5 pb-2 rounded-lg text-18"
                        />
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Rating Section */}
                        <div className="bg-gray-50 dark:bg-black p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Rating</h2>
                            <div className="flex space-x-4">
                            {/*
                                <label className="text-lg font-medium text-gray-700 dark:text-white">
                                    Rating <span className="text-red-500">*</span>
                                </label>
                            */}
                                <StarRating
                                    rating={formData.rating}
                                    onRatingChange={handleRatingChange}
                                />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    ({formData.rating}/5 stars)
                                </span>
                            </div>
                            {errors.rating && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.rating}</p>
                            )}
                        </div>

                        {/* Review Text Section */}
                        <div className="bg-gray-50 dark:bg-black p-6 rounded-lg">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Review Details</h2>
                            <CommonInput
                                 id="reviewText"
                                 label="Detailed Review"
                                 name="reviewText"
                                 value={formData.reviewText}
                                 onChange={handleInputChange}
                                 onFocus={handleFocus}
                                 onBlur={handleBlur}
                                 error={errors.reviewText}
                                 placeholder="Share your detailed experience..."
                                 as="textarea"
                                 rows={6}
                                 labelFontSize="text-lg"
                             />
                             <div className="flex justify-between items-center mt-1">
                                 <p className="text-sm text-gray-500 dark:text-gray-400">
                                     Minimum 10 characters required ({formData.reviewText.length}/1000)
                                 </p>
                                 {formData.reviewText.length > 0 && (
                                     <p className={`text-sm ${formData.reviewText.length > 950 ? 'text-orange-500' : 'text-gray-400'}`}>
                                         {formData.reviewText.length}/1000
                                     </p>
                                 )}
                             </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center gap-4 pt-4">
                            <CommonButton
                                text="Cancel"
                                onClick={() => navigate('/')}
                                className="px-6 pt-2.5 pb-2 rounded-lg text-18"
                            />
                                                         <CommonButton
                                 type="submit"
                                 disabled={isSubmitting || Object.keys(errors).some(key => errors[key]) || formData.reviewText.length < 10}
                                 text={isSubmitting ? 'Submitting...' : 'Submit Review'}
                                 className="px-6 pt-2.5 pb-2 rounded-lg text-18"
                             />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewPage;
