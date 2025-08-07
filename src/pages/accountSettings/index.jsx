import React from 'react'
import { PersonalInformation, ChangePassword, DeleteAccount } from '../../components'

function AccountSettings() {
  return (
    <div>
      <PersonalInformation />
      <ChangePassword />
      <DeleteAccount />
    </div>
  )
}

export default AccountSettings
