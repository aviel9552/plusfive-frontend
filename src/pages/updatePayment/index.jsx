import React from 'react'
import { UpdatePayment } from '../../components'

function UpdatePaymentPage() {
  const slug = window.location.pathname.split('/')[1];
  return (
    <div>
      <UpdatePayment slug={slug} />
    </div>
  )
}

export default UpdatePaymentPage
