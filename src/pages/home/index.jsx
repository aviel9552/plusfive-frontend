import { MonthlyPerformance, RevenueImpactCustomerStatus, Referrals, Users, AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, AdminReferrals } from "../../components";

const Home = () => {
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-[24px]">
        <AdminMonthlyPerformance />
        <AdminRevenueImpactCustomerStatus />
      </div>
      <AdminReferrals />
    </div>
  );
};

export default Home; 