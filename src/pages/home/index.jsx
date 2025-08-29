import { MonthlyPerformance, RevenueImpactCustomerStatus, Referrals, Users, AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, AdminReferrals, ReferralsTable } from "../../components";

const Home = () => {
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-[24px]">
        <AdminMonthlyPerformance />
        <AdminRevenueImpactCustomerStatus />
      </div>
      {/* <AdminReferrals /> */}
      <ReferralsTable />
    </div>
  );
};

export default Home; 