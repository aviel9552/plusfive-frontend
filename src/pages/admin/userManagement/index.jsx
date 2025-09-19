import React, { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AdminUserTable } from '../../../components'
import { fetchUsers } from '../../../redux/actions/userActions'

function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.user);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple API calls using useRef
    if (hasFetchedRef.current) return;
    
    hasFetchedRef.current = true;
    dispatch(fetchUsers());
  }, []); // Remove dispatch dependency to prevent re-runs

  return (
    <div>
      <AdminUserTable 
        users={users} 
        loading={loading} 
        error={error}
      />
    </div>
  )
}

export default UserManagement
