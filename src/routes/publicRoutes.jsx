import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import { RouteLoader } from '../components';
import Login from '../pages/auth/login';
import Register from '../pages/auth/register';
import ThankYou from '../pages/auth/thankYou';
import EmailVerify from '../pages/auth/emailVerify';
import ForgotPassword from '../pages/auth/forgotPassword';
import ResetPassword from '../pages/auth/resetPassword';
import LandingPage from '../pages/landingpage';
import NotFound from '../pages/404';
import ContactSales from '../pages/contactSales';
import ReferralPage from '../pages/referral';
import ReviewPage from '../pages/reviews';
import QRScanHandler from '../pages/qrScan';
import SubscriptionSuccess from '../pages/subscription/Success';
import BillingPage from '../pages/billing';
import UpdatePayment from '../pages/subscription/UpdatePayment';
import DirectMessageSend from '../pages/qrScan/DirectMessageSend';

function PublicRouteGuard({ children }) {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);
  const location = useLocation();

  if (isAuthenticated) {
    if (user && user.role === 'admin') {
      return <Navigate to="/admin" state={{ from: location }} replace />;
    }
    return <Navigate to="/app" state={{ from: location }} replace />;
  }
  return children;
}

function PublicRoutes() {
  const { language } = useLanguage();
  return (
    <RouteLoader loadTime={2000}>
      {/* Demo ke liye language show kar rahe hain */}
      {/* <div>Current language: {language}</div> */}
      <Routes>
        <Route path="/" element={<LandingPage language={language} />} />
        <Route path="contact-sales" element={<ContactSales language={language} />} />
        <Route path="login" element={
          <PublicRouteGuard>
            <Login />
          </PublicRouteGuard>
        } />
        <Route path="register" element={
          <PublicRouteGuard>
            <Register />
          </PublicRouteGuard>
        } />
        <Route path="thank-you" element={<ThankYou />} />
        <Route path="verify-email/:token" element={<EmailVerify />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="ref/:referralCode" element={<ReferralPage />} />
        <Route path="reviews" element={<ReviewPage />} />
        <Route path="qr/redirect/:qrId" element={<QRScanHandler />} />
        <Route path="qr/:qrId" element={<DirectMessageSend />} />
        <Route path="scan/:qrId" element={<QRScanHandler />} />
        <Route path="qr-scan/:qrId" element={<QRScanHandler />} />
        <Route path="scan-qr/:qrId" element={<QRScanHandler />} />
        <Route path="subscription/success" element={<SubscriptionSuccess />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="update-payment" element={<UpdatePayment />} />
        {/* Add more public routes here in the future */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RouteLoader>
  );
}

export default PublicRoutes;
