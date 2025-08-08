import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminHome from '../pages/admin/home';
import UserManagement from '../pages/admin/userManagement';
import AdminQRManagement from '../pages/admin/qrManagement';
import AdminReferralManagement from '../pages/admin/ReferralManagement';
import Analytics from '../pages/admin/analytics';
import AccountSettings from '../pages/accountSettings';
import AdminQRManagementListing from '../pages/admin/qrManagementListing';
import EditUserModel from '../components/admin/customerManagement/EditUserModel';
import CreateUserModel from '../components/admin/customerManagement/CreateUserModel';
import MyQRCodes from '../pages/admin/myQRCodes';

function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminHome />} />
      <Route path="/dashboard" element={<AdminHome />} />
      <Route path="/user-management" element={<UserManagement />} />
      <Route path="/user-management/create" element={<CreateUserModel />} />
      <Route path="/user-management/edit/:userId" element={<EditUserModel />} />
      <Route path="/qr-management" element={<AdminQRManagement />} />
      <Route path="/qr-management/listing" element={<AdminQRManagementListing />} />
      <Route path="/qr-management/my-codes" element={<MyQRCodes />} />
      <Route path="/referral-management" element={<AdminReferralManagement />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/account-settings" element={<AccountSettings />} />
      {/* Add more admin routes here in the future */}
    </Routes>
  );
}

export default AdminRoutes;
