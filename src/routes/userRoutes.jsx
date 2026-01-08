// src/routes/userRoutes.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RouteLoader } from '../components';
import Home from '../pages/home';
import QRManagement from '../pages/qrManagement';
import ReferralManagement from '../pages/ReferralManagement';
import CustomerManagement from '../pages/customerManagement';
import Analytics from '../pages/analytics';
import SubscriptionAndBilling from '../pages/subscriptionAndBilling';
import AccountSettings from '../pages/accountSettings';
import SupportAndHelp from '../pages/supportAndHelp';
import UpdatePaymentPage from '../pages/updatePayment';
import AddCard from '../pages/addCard';
import Notifications from '../pages/notifications';
import SimplePayment from '../pages/simplePayment/SimplePayment';
import PaymentSuccess from '../pages/simplePayment/PaymentSuccess';
import PaymentCancel from '../pages/simplePayment/PaymentCancel';
import AdminQRManagement from '../pages/admin/qrManagement';
import AdminQRManagementListing from '../pages/admin/qrManagementListing';
import MyQRCodes from '../pages/admin/myQRCodes';
import AdminReferralManagement from '../pages/admin/ReferralManagement';
import CreateCustomer from '../pages/customerManagement/createCustomer';
import EditCustomer from '../pages/customerManagement/editCustomer';
import ViewCustomer from '../pages/customerManagement/viewCustomer';
import CalendarPage from '../pages/calendar/CalendarPage.jsx';
import CalendarClientsPage from '../pages/calendarClients';
import CalendarStaffPage from '../pages/calendarStaff';
import ServicesPage from '../pages/services';
import CatalogPage from '../pages/catalog';
import SuppliersPage from '../pages/suppliers';
import FinancialManagement from '../pages/financialManagement';

function UserRoutes() {
  return (
    <RouteLoader loadTime={800}>
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

        {/* שני ראוטים לקלנדר – אחד עם /app ואחד בלי */}
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/app/calendar" element={<CalendarPage />} />
        <Route path="/calendar-clients" element={<CalendarClientsPage />} />
        <Route path="/app/calendar-clients" element={<CalendarClientsPage />} />
        <Route path="/calendar-staff" element={<CalendarStaffPage />} />
        <Route path="/app/calendar-staff" element={<CalendarStaffPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/app/services" element={<ServicesPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/app/catalog" element={<CatalogPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/app/suppliers" element={<SuppliersPage />} />
        <Route path="/financial-management" element={<FinancialManagement />} />
        <Route path="/app/financial-management" element={<FinancialManagement />} />
      </Routes>
    </RouteLoader>
  );
}

export default UserRoutes;

