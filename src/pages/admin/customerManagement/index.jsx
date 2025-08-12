import React, { useEffect } from 'react'
import { CustomerAdminTable, ManageAndTrackCustomers } from '../../../components'
import { useDispatch, useSelector } from 'react-redux'
import { getMyCustomersAction } from '../../../redux/actions/customerActions'

function AdminCustomerManagement() {
  const dispatch = useDispatch();
  
  // Get customers from Redux state
  const { customers, loading } = useSelector(state => state.customer);
  
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
        <CustomerAdminTable customers={customers} loading={loading} />
      </div>
    </div>
  )
}

export default AdminCustomerManagement
