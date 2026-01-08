import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CommonLoader from './CommonLoader';

function RouteLoader({ children, loadTime = 100 }) {
    const [isLoading, setIsLoading] = useState(false);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [isFadingIn, setIsFadingIn] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Show loader on route change with fade in
        setIsLoading(true);
        setIsFadingOut(false);
        setIsFadingIn(true);
        
        // After fade in completes, remove fade in state
        setTimeout(() => {
            setIsFadingIn(false);
        }, 200); // 200ms fade in duration
        
        const timer = setTimeout(() => {
            // Start fade out animation
            setIsFadingOut(true);
            
            // After fade out animation completes, hide loader
            setTimeout(() => {
                setIsLoading(false);
                setIsFadingOut(false);
            }, 500); // 500ms fade out duration
            
        }, loadTime);

        return () => clearTimeout(timer);
    }, [location.pathname, loadTime]); // Trigger on route change

    if (isLoading) {
        return (
            <div className={`fixed inset-0 bg-white dark:bg-customBlack flex items-center justify-center z-50 transition-opacity ease-out ${
                isFadingIn ? 'opacity-0 duration-200' : isFadingOut ? 'opacity-0 duration-500' : 'opacity-100 duration-200'
            }`}>
                <div className="flex flex-col items-center gap-4">
                    <CommonLoader />
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

export default RouteLoader;
