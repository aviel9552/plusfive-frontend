import React, { useEffect } from 'react'
import { CustomerTable, ManageAndTrackCustomers } from '../../components'
import { useDispatch, useSelector } from 'react-redux'
import { getMyCustomersAction } from '../../redux/actions/customerActions'
import { getCustomersStatusCount } from '../../redux/services/customerService'

function customerManagement() {
  const dispatch = useDispatch();
  const [statusCounts, setStatusCounts] = React.useState({
    active: 0,
    at_risk: 0,
    lost: 0,
    recovered: 0,
    new: 0
  });
  
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
        const statusData = await getCustomersStatusCount();
        // console.log('Customer Status Counts:', statusData.data.statusCounts);
        setStatusCounts(statusData.data.statusCounts);
      } catch (error) {
        console.error('Error fetching status counts:', error);
      }
    };
    
    fetchStatusCounts();
  }, [dispatch]);
  
  return (
    <div>
      <div className='border border-gray-200 dark:border-customBorderColor rounded-2xl p-[24px] dark:bg-customBrown bg-white dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
        <ManageAndTrackCustomers statusCounts={statusCounts} />
      </div>
      <div className='mt-7 border border-gray-200 dark:border-customBorderColor rounded-2xl dark:bg-customBrown dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
        <CustomerTable customers={customersList} loading={loading} />
      </div>
    </div>
  )
}

export default customerManagement
