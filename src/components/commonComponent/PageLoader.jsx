import React, { useState, useEffect } from 'react';
import CommonLoader from './CommonLoader';

function PageLoader({ children, minLoadTime = 1000 }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Set minimum loading time to prevent flash
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, minLoadTime);

        // Also wait for DOM content to be fully loaded
        const handleLoad = () => {
            // Additional delay to ensure smooth transition
            setTimeout(() => {
                setIsLoading(false);
            }, 2000);
        };

        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
        }

        return () => {
            clearTimeout(timer);
            window.removeEventListener('load', handleLoad);
        };
    }, [minLoadTime]);

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-customBlack flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-4">
                    <CommonLoader />
                    {/* <p className="text-gray-600 dark:text-gray-300 text-sm animate-pulse">
                        Loading...
                    </p> */}
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default PageLoader;
