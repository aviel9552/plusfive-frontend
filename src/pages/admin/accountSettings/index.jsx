import React from 'react'
import { AdminPersonalInformation, AdminChangePassword, AdminDeleteAccount } from '../../../components'

function AccountSettings() {
  return (
    <div>
      <AdminPersonalInformation />
      <AdminChangePassword />
      <AdminDeleteAccount />
    </div>
  )
}

export default AccountSettings
