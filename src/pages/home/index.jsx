import { getTenCustomers } from '../../redux/services/customerService'
import { useEffect, useState, Suspense, lazy } from "react";
import CommonLoader from '../../components/commonComponent/CommonLoader';

// 🧩 Lazy-loaded Components - Har component alag chunk banayega
const AdminMonthlyPerformance = lazy(() => import('../../components/admin/home/AdminMonthlyPerformance'));
const AdminRevenueImpactCustomerStatus = lazy(() => import('../../components/admin/home/AdminRevenueImpactCustomerStatus'));
const CustomerTable = lazy(() => import('../../components/customerManagement/CustomerTable'));

const Home = () => {
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
  }, []); // Empty dependency array - run only once on mount
  
  return (
    <div className="space-y-7">
      {/* Lazy-loaded components with Suspense - All components load as separate chunks */}
      <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]"><CommonLoader /></div>}>
        <div className="flex flex-col gap-[24px]">
          <AdminMonthlyPerformance />
          <AdminRevenueImpactCustomerStatus />
        </div>
      </Suspense>
      {/* <AdminReferrals /> */}
      {/* <ReferralsTable /> */}
      <Suspense fallback={<div className="flex justify-center items-center min-h-[400px]"><CommonLoader /></div>}>
        <div className='border border-gray-200 dark:border-customBorderColor rounded-2xl dark:bg-customBrown dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
          <CustomerTable 
              customers={tenCustomers} 
              loading={loading} 
              showFilter={false}
              showText={true}
              showCount={false}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default Home; 