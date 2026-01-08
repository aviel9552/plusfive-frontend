import { AdminAnalyticsMonthlyPerformance, AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, CustomerTable } from "../../components";
import { useDispatch, useSelector } from 'react-redux'
import { getMyCustomersAction } from '../../redux/actions/customerActions'
import { useEffect } from "react";

const Home = () => {
    const dispatch = useDispatch();
    
    // Get customers from Redux state
    const { customers, loading } = useSelector(state => state.customer);
    
    // Extract customers array from the nested structure
    const customersList = customers?.customers || customers || [];
  
  // Fetch customers on component mount
  useEffect(() => {
    dispatch(getMyCustomersAction());
  }, [dispatch]);
  
  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-[24px]">
        {/* <AdminMonthlyPerformance /> */}
        <AdminAnalyticsMonthlyPerformance />
        <AdminRevenueImpactCustomerStatus />
      </div>
      {/* <AdminReferrals /> */}
      {/* <ReferralsTable /> */}
      <div className='border border-gray-200 dark:border-customBorderColor rounded-2xl dark:bg-customBrown dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
        <CustomerTable 
            customers={customersList} 
            loading={loading} 
            showFilter={true}
            showText={false}
            showCount={true}
        />
      </div>
    </div>
  );
};

export default Home; 