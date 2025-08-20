import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminHome from '../pages/admin/home';
import UserManagement from '../pages/admin/userManagement';
import AdminQRManagement from '../pages/admin/qrManagement';
import AdminReferralManagement from '../pages/admin/ReferralManagement';
import Analytics from '../pages/admin/analytics';
import AccountSettings from '../pages/accountSettings';
import AdminQRManagementListing from '../pages/admin/qrManagementListing';
import EditUserModel from '../components/admin/userManagement/EditUserModel';
import CreateUserModel from '../components/admin/userManagement/CreateUserModel';
import ViewUser from '../components/admin/userManagement/viewUser';
import MyQRCodes from '../pages/admin/myQRCodes';
import AdminCustomerManagement from '../pages/admin/customerManagement';
import CreateAdminCustomer from '../pages/admin/customerManagement/createAdminCustomer';
import SubscriptionAndBilling from '../pages/subscriptionAndBilling';
import UpdatePaymentPage from '../pages/updatePayment';
import AddCard from '../pages/addCard';
import SupportAndHelp from '../pages/supportAndHelp';

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      <Route path="/dashboard" element={<AdminHome />} />
      {/* <Route path="/customer-management" element={<AdminCustomerManagement />} /> */}
      {/* <Route path="/customer-management/create" element={<CreateAdminCustomer />} /> */}
      {/* <Route path="/customer-management/edit/:customerId" element={<EditUserModel />} /> */}
      {/* <Route path="/customer-management/edit" element={<EditUserModel />} /> */}
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/user-management/create" element={<CreateUserModel />} />
      <Route path="/user-management/view/:userId" element={<ViewUser />} />
      <Route path="/user-management/edit/:userId" element={<EditUserModel />} />
      <Route path="/qr-management" element={<AdminQRManagement />} />
      <Route path="/qr-management/listing" element={<AdminQRManagementListing />} />
      <Route path="/qr-management/my-codes" element={<MyQRCodes />} />
      <Route path="/referral-management" element={<AdminReferralManagement />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/account-settings" element={<AccountSettings />} />
      <Route path="/subscription-and-billing" element={<SubscriptionAndBilling />} />
      <Route path="/update-payment" element={<UpdatePaymentPage />} />
      <Route path="/add-card" element={<AddCard />} />
      <Route path="/support-and-help" element={<SupportAndHelp />} />
      {/* Add more admin routes here in the future */}
    </Routes>
  );
}

export default AdminRoutes;
