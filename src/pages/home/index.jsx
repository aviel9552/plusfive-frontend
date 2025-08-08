import { MonthlyPerformance, RevenueImpactCustomerStatus, Referrals, Users, AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, AdminReferrals } from "../../components";

const Home = () => {
  return (
    <div className="space-y-4">
      {/* <MonthlyPerformance />
      <RevenueImpactCustomerStatus />
      <Referrals /> */}
      <AdminMonthlyPerformance />
      <AdminRevenueImpactCustomerStatus />
      <AdminReferrals />
      {/* <Users /> */}
    </div>
  );
};

export default Home; 