import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AdminUserTable } from '../../../components'
import { fetchUsers } from '../../../redux/actions/userActions'

function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

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
