import React from 'react';
import RatingStars from '../../components/customerManagement/RatingStars';
import { formatDate, formatTime } from '../../utils/dateFormatter';

const ReviewsTab = ({ customer, t }) => {
    const receivedReviews = customer.reviews?.filter(review => review.status !== 'sent') || [];
    
    // Calculate statistics for received reviews only
    const ratingsOnly = receivedReviews.filter(review => review.rating > 0);
    const averageRating = ratingsOnly.length > 0 
        ? ratingsOnly.reduce((sum, review) => sum + review.rating, 0) / ratingsOnly.length 
        : 0;
    const maxRating = ratingsOnly.length > 0 
        ? Math.max(...ratingsOnly.map(review => review.rating)) 
        : 0;
    const minRating = ratingsOnly.length > 0 
        ? Math.min(...ratingsOnly.map(review => review.rating)) 
        : 0;

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Review Statistics */}
            {receivedReviews.length > 0 && (
                <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">{t.reviewStatistics}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {averageRating.toFixed(1)}
                            </p>
                            <p className="text-xs md:text-sm text-black dark:text-white">{t.averageRating}</p>
                            <div className="flex justify-center mt-1 md:mt-2">
                                <RatingStars rating={averageRating} />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                                {receivedReviews.length}
                            </p>
                            <p className="text-xs md:text-sm text-black dark:text-white">{t.totalReviews}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {maxRating}
                            </p>
                            <p className="text-xs md:text-sm text-black dark:text-white">{t.highestRating}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400">
                                {minRating}
                            </p>
                            <p className="text-xs md:text-sm text-black dark:text-white">{t.lowestRating}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Individual Reviews */}
            <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
                    {t.allReviews} ({receivedReviews.length})
                </h2>
                {receivedReviews.length > 0 ? (
                    <div className="space-y-4">
                        {receivedReviews.map((review, index) => (
                            <div key={review.id || index} className="bg-white dark:bg-customBrown p-4 md:p-6 rounded-lg border dark:border-customBorderColor">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                    <div className="flex items-center gap-3 justify-between">
                                        <div className="flex items-center gap-2">
                                            <RatingStars rating={review.rating} />
                                            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                                {review.rating}/5
                                            </span>
                                        </div>
                                        <span className={`px-3 p-1 text-xs font-semibold rounded-full ${review.status === 'received'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                            {review.status || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="md:text-right md:block flex items-center gap-2 justify-between">
                                        <p className="text-sm text-black dark:text-white">
                                            {formatDate(review.updatedAt)}
                                        </p>
                                        <p className="text-xs text-black dark:text-white">
                                            {formatTime(review.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                                {review.message && (
                                    <div className="bg-gray-50 dark:bg-customBlack p-4 rounded-lg">
                                        <p className="text-black dark:text-white leading-relaxed">
                                            {review.message}
                                        </p>
                                    </div>
                                )}
                                <div className="mt-4 grid md:grid-cols-3 grid-cols-1 gap-2 text-xs text-black dark:text-white">
                                    <div>
                                        <span className="font-medium">{t.reviewId}:</span>
                                        <br />
                                        <span className="font-mono break-all text-xs">{review.id}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">{t.customerId}:</span>
                                        <br />
                                        <span className="font-mono break-all text-xs">{review.customerId}</span>
                                    </div>
                                    {review.userId && (
                                        <div>
                                            <span className="font-medium">{t.userId}:</span>
                                            <br />
                                            <span className="font-mono break-all text-xs">{review.userId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">⭐</div>
                        <p className="text-black dark:text-white text-lg">{t.noReviewsYet}</p>
                        <p className="text-black dark:text-white text-sm mt-2">{t.customerHasntLeftReviews}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsTab;

