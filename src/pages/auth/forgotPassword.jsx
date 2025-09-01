import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CommonInput, CommonButton, SquaresAnim } from '../../components/index';
import { toast } from 'react-toastify';
import LoginBG from '../../assets/LoginBG.png';
import { forgotPassword } from '../../redux/services/authService';
import { useLanguage } from '../../context/LanguageContext';
import { getAuthTranslations } from '../../utils/translations';

function ForgotPassword() {
      const { language } = useLanguage();
  const isRTL = language === 'he';
    const t = getAuthTranslations(language);
    
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError(v.pleaseEnterEmailAddress);
            return;
        }

        if (!email.includes('@')) {
            setError(v.pleaseEnterValidEmail);
            return;
        }

        // Force state update
        setIsLoading(true);
        setError('');

        // Add a small delay to ensure state updates
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            // Call the actual API
            await forgotPassword(email);

            toast.success(t.passwordResetLinkSent);
            setEmail('');
        } catch (error) {
            toast.error(error.message || t.failedToSendResetLink);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center dark:bg-customBlack bg-white px-4 py-8">
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <SquaresAnim speed={0.5} squareSize={50} direction='down' />
                {/* Left-bottom focused bubble/gradient */}
                <div className="
          absolute inset-0
          bg-[radial-gradient(ellipse_at_left_bottom,_var(--tw-gradient-stops))]
          from-pink-200/60 via-white/60 to-purple-200/80
          dark:from-[#232136]/80 dark:via-[#232136]/60 dark:to-[#232136]/0
          pointer-events-none"
                />
            </div>

            <div
                className="w-full max-w-md rounded-3xl shadow-2xl border border-gray-200/20 dark:border-customBorderColor/50 backdrop-blur-xl p-8 bg-cover bg-center bg-white/10 dark:bg-black/20"
                style={{
                    backgroundImage: `url(${LoginBG})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4 text-blue-500">🔐</div>
                    <h2 className="text-28 font-black text-center text-white mb-2">
                        {t.forgotPasswordTitle}
                    </h2>
                    <p className="text-16 text-center text-white/90 font-medium">
                        {t.forgotPasswordSubtitle}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <CommonInput
                        label={t.emailAddress}
                        labelFontSize="text-16"
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.enterEmailAddress}
                        error={error}
                        textColor="text-white"
                        labelColor="text-white"
                        inputBg="bg-white/10 backdrop-blur-sm"
                    />

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full rounded-xl py-4 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${isLoading
                            ? 'bg-gray-500 cursor-not-allowed opacity-70'
                            : 'bg-gradient-to-r from-pink-500 to-red-500 '
                            } text-white`}
                    >
                        {isLoading === true ? (
                            t.sendingResetLink
                        ) : (
                            t.sendResetLink
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className={`text-white/70 text-14 mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t.rememberPassword}{' '}
                        <Link
                            to="/login"
                            className="font-bold text-[#675DFF] hover:text-[#8B7FFF] hover:underline transition-all duration-200"
                        >
                            {t.backToLogin}
                        </Link>
                    </p>

                    <p className={`text-white/50 text-12 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t.dontHaveAccountSignUp}{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-[#675DFF] hover:text-[#8B7FFF] hover:underline transition-all duration-200"
                        >
                            {t.signUpHere}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ForgotPassword;