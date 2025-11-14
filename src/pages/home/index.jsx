import { AdminAnalyticsMonthlyPerformance, AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, CustomerTable } from "../../components";
import { useDispatch, useSelector } from 'react-redux'
import { getCustomersStatusCount, getTenCustomers } from '../../redux/services/customerService'
import { useEffect, useState } from "react";

const Home = () => {
    const dispatch = useDispatch();
    const [tenCustomers, setTenCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasApiCalled, setHasApiCalled] = useState(false);
  
  useEffect(() => {
    
    // Call status count API and console the data - ensure it runs only once
    const fetchStatusCounts = async () => {
      // Prevent multiple API calls
      if (hasApiCalled) return;
      
      try {
        setLoading(true);
        setHasApiCalled(true);
        
        const tenCustomers = await getTenCustomers();
        setTenCustomers(tenCustomers.data.customers);
      } catch (error) {
        console.error('Error fetching status counts:', error);
        // Reset flag on error to allow retry
        setHasApiCalled(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatusCounts();
  }, []); // Remove dispatch dependency to prevent re-runs
  
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
            customers={tenCustomers} 
            loading={loading} 
            showFilter={false}
            showText={true}
            showCount={false}
        />
      </div>
    </div>
  );
};

export default Home; 