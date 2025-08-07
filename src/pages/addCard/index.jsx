import React from 'react'
import { AddNewCreditCard, BillingInformation } from '../../components'

function AddCard() {
  return (
    <div>
      <AddNewCreditCard />
      {/* Billing Information Section */}
      <BillingInformation />
    </div>
  )
}

export default AddCard
