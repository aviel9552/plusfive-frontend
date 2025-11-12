import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import { RouteLoader } from '../components';

// 🧩 Lazy-loaded pages — har page alag chunk banayega
const Login = lazy(() => import('../pages/auth/login'));
const Register = lazy(() => import('../pages/auth/register'));
const ThankYou = lazy(() => import('../pages/auth/thankYou'));
const EmailVerify = lazy(() => import('../pages/auth/emailVerify'));
const ForgotPassword = lazy(() => import('../pages/auth/forgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/resetPassword'));
const LandingPage = lazy(() => import('../pages/landingpage'));
const NotFound = lazy(() => import('../pages/404'));
const ContactSales = lazy(() => import('../pages/contactSales'));
const ReferralPage = lazy(() => import('../pages/referral'));
const ReviewPage = lazy(() => import('../pages/reviews'));
const QRScanHandler = lazy(() => import('../pages/qrScan'));
const SubscriptionSuccess = lazy(() => import('../pages/subscription/Success'));
const BillingPage = lazy(() => import('../pages/billing'));
const UpdatePayment = lazy(() => import('../pages/subscription/UpdatePayment'));
const DirectMessageSend = lazy(() => import('../pages/qrScan/DirectMessageSend'));

// 🧠 Route guard
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

// 🌍 Routes component
function PublicRoutes() {
  const { language } = useLanguage();

  return (
    <RouteLoader loadTime={2000}>
      <Suspense fallback={<div className="flex justify-center items-center h-screen text-lg">Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage language={language} />} />
          <Route path="contact-sales" element={<ContactSales language={language} />} />
          <Route
            path="login"
            element={
              <PublicRouteGuard>
                <Login />
              </PublicRouteGuard>
            }
          />
          <Route
            path="register"
            element={
              <PublicRouteGuard>
                <Register />
              </PublicRouteGuard>
            }
          />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </RouteLoader>
  );
}

export default PublicRoutes;
