import { MonthlyPerformance, RevenueImpactCustomerStatus, Referrals, Users } from "../../components";

const Home = () => {
  return (
    <div className="space-y-4">
      <MonthlyPerformance />
      <RevenueImpactCustomerStatus />
      <Referrals />
      {/* <Users /> */}
    </div>
  );
};

export default Home; 