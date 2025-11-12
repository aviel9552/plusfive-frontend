import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RouteLoader } from '../components';

// 🧩 Lazy imports — each page will become its own chunk
const Home = lazy(() => import('../pages/home'));
const CustomerManagement = lazy(() => import('../pages/customerManagement'));
const Analytics = lazy(() => import('../pages/analytics'));
const SubscriptionAndBilling = lazy(() => import('../pages/subscriptionAndBilling'));
const AccountSettings = lazy(() => import('../pages/accountSettings'));
const SupportAndHelp = lazy(() => import('../pages/supportAndHelp'));
const UpdatePaymentPage = lazy(() => import('../pages/updatePayment'));
const AddCard = lazy(() => import('../pages/addCard'));
const Notifications = lazy(() => import('../pages/notifications'));
const SimplePayment = lazy(() => import('../pages/simplePayment/SimplePayment'));
const PaymentSuccess = lazy(() => import('../pages/simplePayment/PaymentSuccess'));
const PaymentCancel = lazy(() => import('../pages/simplePayment/PaymentCancel'));
const AdminQRManagement = lazy(() => import('../pages/admin/qrManagement'));
const ViewCustomer = lazy(() => import('../pages/customerManagement/viewCustomer'));

function UserRoutes() {
  return (
    <RouteLoader loadTime={800}>
      {/* Suspense loader while chunks load */}
      <Suspense fallback={<div className="flex justify-center items-center h-screen text-lg">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/qr-management" element={<AdminQRManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/customers/view/:customerId" element={<ViewCustomer />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/subscription-and-billing" element={<SubscriptionAndBilling />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/support-and-help" element={<SupportAndHelp />} />
          <Route path="/update-payment" element={<UpdatePaymentPage />} />
          <Route path="/add-card" element={<AddCard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/simple-payment" element={<SimplePayment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
        </Routes>
      </Suspense>
    </RouteLoader>
  );
}

export default UserRoutes;
