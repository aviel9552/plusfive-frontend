import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext'
import { getReferralPageTranslations } from '../../utils/translations'
import CommonButton from '../../components/commonComponent/CommonButton'

function ReferralPage() {
  const { referralCode } = useParams()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const t = getReferralPageTranslations(language)
  
  const [loading, setLoading] = useState(false)

  const handleGetStarted = () => {
    navigate(`/register?ref=${referralCode}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-6 text-white text-lg">{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              {t.welcomeMessage}
            </h1>
            <p className="text-xl text-gray-300">
              {t.youveBeenInvited}
            </p>
          </div>

          {/* Referral Card */}
          <div className="bg-customBrown border border-gray-800 rounded-2xl shadow-2xl p-8">
            

            {/* CTA Button */}
            <div className="text-center">
              <CommonButton 
                text={t.getStarted}
                onClick={handleGetStarted}
                className="px-12 py-4 text-xl font-semibold rounded-xl"
              />
              <p className="text-sm text-gray-500 mt-4">
                {t.termsAndConditions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReferralPage
