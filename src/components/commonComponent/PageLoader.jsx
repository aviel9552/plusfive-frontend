import React, { useState, useEffect } from 'react';
import CommonLoader from './CommonLoader';

function PageLoader({ children, minLoadTime = 1000 }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isFadingIn, setIsFadingIn] = useState(true);

    useEffect(() => {
        // Start with fade in animation
        setTimeout(() => {
            setIsFadingIn(false);
        }, 200); // 200ms fade in duration
        
        // Set minimum loading time to prevent flash
        const timer = setTimeout(() => {
            // Start fade out animation
            setIsFadingOut(true);
            
            // After fade out animation completes, hide loader
            setTimeout(() => {
                setIsLoading(false);
                setIsFadingOut(false);
            }, 500); // 500ms fade out duration
        }, minLoadTime);

        // Also wait for DOM content to be fully loaded
        const handleLoad = () => {
            // Additional delay to ensure smooth transition
            setTimeout(() => {
                // Start fade out animation
                setIsFadingOut(true);
                
                // After fade out animation completes, hide loader
                setTimeout(() => {
                    setIsLoading(false);
                    setIsFadingOut(false);
                }, 500); // 500ms fade out duration
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
            <div className={`fixed inset-0 bg-white dark:bg-customBlack flex items-center justify-center z-50 transition-opacity ease-out ${
                isFadingIn ? 'opacity-0 duration-200' : isFadingOut ? 'opacity-0 duration-500' : 'opacity-100 duration-200'
            }`}>
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
