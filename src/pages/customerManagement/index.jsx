import React, { useEffect } from 'react'
import { CustomerTable, ManageAndTrackCustomers } from '../../components'
import { useDispatch, useSelector } from 'react-redux'
import { getMyCustomersAction } from '../../redux/actions/customerActions'
import { getCustomersStatusCount } from '../../redux/services/customerService'
import { CUSTOMER_STATUS, STATUS } from '../../config/constants'

function customerManagement() {
  const dispatch = useDispatch();
  const [statusCounts, setStatusCounts] = React.useState({
    [CUSTOMER_STATUS.ACTIVE]: 0,
    [CUSTOMER_STATUS.AT_RISK]: 0,
    [CUSTOMER_STATUS.LOST]: 0,
    [CUSTOMER_STATUS.RECOVERED]: 0,
    [CUSTOMER_STATUS.NEW]: 0,
    lead: 0
  });
  const [statusLoading, setStatusLoading] = React.useState(true);
  
  // Get customers from Redux state
  const { customers, loading } = useSelector(state => state.customer);
  
  // Extract customers array from the nested structure
  const customersList = customers?.customers || customers || [];
  
  
  // Fetch customers on component mount
  useEffect(() => {
    dispatch(getMyCustomersAction());
    
    // Call status count API and console the data
    const fetchStatusCounts = async () => {
      try {
        setStatusLoading(true);
        const statusData = await getCustomersStatusCount();
        setStatusCounts(statusData.data.statusCounts);
      } catch (error) {
        console.error('Error fetching status counts:', error);
      } finally {
        setStatusLoading(false);
      }
    };
    
    fetchStatusCounts();
  }, [dispatch]);
  
  return (
    <div>
      <div className='border border-gray-200 dark:border-customBorderColor rounded-2xl p-[24px] dark:bg-customBrown bg-white dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
        <ManageAndTrackCustomers statusCounts={statusCounts} loading={statusLoading} />
      </div>
      <div className='mt-7 border border-gray-200 dark:border-customBorderColor rounded-2xl dark:bg-customBrown dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
        <CustomerTable customers={customersList} loading={loading} />
      </div>
    </div>
  )
}

export default customerManagement
