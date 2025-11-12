import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { RouteLoader } from '../components';

// 🧩 Lazy imports — har page apna chunk banayega
const AdminHome = lazy(() => import('../pages/admin/home'));
const UserManagement = lazy(() => import('../pages/admin/userManagement'));
const AdminQRManagement = lazy(() => import('../pages/admin/qrManagement'));
const Analytics = lazy(() => import('../pages/admin/analytics'));
const AccountSettings = lazy(() => import('../pages/accountSettings'));
const EditUserModel = lazy(() => import('../components/admin/userManagement/EditUserModel'));
const CreateUserModel = lazy(() => import('../components/admin/userManagement/CreateUserModel'));
const ViewUser = lazy(() => import('../components/admin/userManagement/viewUser'));
const SubscriptionAndBilling = lazy(() => import('../pages/subscriptionAndBilling'));
const UpdatePaymentPage = lazy(() => import('../pages/updatePayment'));
const AddCard = lazy(() => import('../pages/addCard'));
const SupportAndHelp = lazy(() => import('../pages/supportAndHelp'));

function AdminRoutes() {
  return (
    <RouteLoader loadTime={800}>
      {/* Suspense = loader jab tak chunk load hota hai */}
      <Suspense fallback={<div className="flex justify-center items-center h-screen text-lg">Loading...</div>}>
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/dashboard" element={<AdminHome />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/user-management/create" element={<CreateUserModel />} />
          <Route path="/user-management/view/:userId" element={<ViewUser />} />
          <Route path="/user-management/edit/:userId" element={<EditUserModel />} />
          <Route path="/qr-management" element={<AdminQRManagement />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/account-settings" element={<AccountSettings />} />
          <Route path="/subscription-and-billing" element={<SubscriptionAndBilling />} />
          <Route path="/update-payment" element={<UpdatePaymentPage />} />
          <Route path="/add-card" element={<AddCard />} />
          <Route path="/support-and-help" element={<SupportAndHelp />} />
        </Routes>
      </Suspense>
    </RouteLoader>
  );
}

export default AdminRoutes;
