import React, { useEffect } from 'react'
import { CustomerTable, ManageAndTrackCustomers } from '../../components'
import { useDispatch, useSelector } from 'react-redux'
import { getMyCustomersAction } from '../../redux/actions/customerActions'

function customerManagement() {
  const dispatch = useDispatch();
  
  // Get customers from Redux state
  const { customers, loading } = useSelector(state => state.customer);
  
  // Extract customers array from the nested structure
  const customersList = customers?.customers || customers || [];
  console.log(customersList, 'customersList');
  // Fetch customers on component mount
  useEffect(() => {
    dispatch(getMyCustomersAction());
  }, [dispatch]);
  
  return (
    <div>
      <div className='border border-gray-200 dark:border-customBorderColor rounded-2xl p-6 dark:bg-customBrown bg-white dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
        <ManageAndTrackCustomers />
      </div>
      <div className='mt-7 border border-gray-200 dark:border-customBorderColor rounded-2xl dark:bg-customBrown dark:hover:bg-customBlack shadow-md hover:shadow-sm'>
        <CustomerTable customers={customersList} loading={loading} />
      </div>
    </div>
  )
}

export default customerManagement
