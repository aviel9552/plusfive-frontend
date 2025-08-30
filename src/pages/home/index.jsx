import { AdminMonthlyPerformance, AdminRevenueImpactCustomerStatus, CustomerTable } from "../../components";
import { useDispatch, useSelector } from 'react-redux'
import { getCustomersStatusCount, getTenCustomers } from '../../redux/services/customerService'
import { useEffect, useState } from "react";

const Home = () => {
    const dispatch = useDispatch();
    const [tenCustomers, setTenCustomers] = useState([]);
  
  useEffect(() => {
    
    // Call status count API and console the data
    const fetchStatusCounts = async () => {
      try {
        const tenCustomers = await getTenCustomers();
        // console.log('Customer Status Counts:', tenCustomers.data.customers);
        setTenCustomers(tenCustomers.data.customers);
      } catch (error) {
        console.error('Error fetching status counts:', error);
      }
    };
    
    fetchStatusCounts();
  }, [dispatch]);
  
  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-[24px]">
        <AdminMonthlyPerformance />
        <AdminRevenueImpactCustomerStatus />
      </div>
      {/* <AdminReferrals /> */}
      {/* <ReferralsTable /> */}
      <div className='border border-gray-200 dark:border-customBorderColor rounded-2xl dark:bg-customBrown dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
        <CustomerTable 
            customers={tenCustomers} 
            loading={false} 
            showFilter={false}
            showText={true}
            showCount={false}
        />
      </div>
    </div>
  );
};

export default Home; 