import React from 'react'
import { LandingHeader, SquaresAnim, CommonButton, CommonGradientText } from '../index'
import { GoArrowRight } from 'react-icons/go';
import { TbInfinity, TbFlower, TbLeaf } from 'react-icons/tb';
import { AiFillStar } from 'react-icons/ai';
import { HiSquares2X2 } from 'react-icons/hi2';
import { GiDiamondTrophy, GiStoneBlock } from 'react-icons/gi';
import { FaRocket, FaFlask } from 'react-icons/fa';
import en from '../../i18/en.json';
import he from '../../i18/he.json';
import Magnolia from "../../assets/Magnolia.svg";
import Kintsugi from "../../assets/Kintsugi.svg";
import StackEdLab from "../../assets/StackEdLab.svg";
import Warpspeed from "../../assets/Warpspeed.svg";
import Sisyphus from "../../assets/Sisyphus.svg";
import OdeaoLabs from "../../assets/OdeaoLabs.svg";

function HeroComponent({ language }) {
  // Language-based text selection
  const t = language === 'he' ? he.hero : en.hero;
  const brandName = (language === 'he' ? he.header : en.header)?.brandName || 'PlusFive';
  const heading1 = t.heading1;
  const heading2 = t.heading2;
  const heading3 = t.heading3;
  const heading4 = t.heading4;
  const subheading = t.subheading;
  const buttonText = t.button;
  const trialInfo = t.trialInfo;
  const logos = t.logos || [
    "Magnolia", "Kintsugi", "StackEd Lab", "Kintsugi", "Warpspeed", "Sisyphus", "Magnolia", "OdeaoLabs", "Magnolia"
  ];

  const trustedLogos = [
    { img: Magnolia, label: logos[0] },    // Magnolia
    { img: Kintsugi, label: logos[1] },    // Kintsugi
    { img: StackEdLab, label: logos[2] },  // StackEd Lab
    { img: Kintsugi, label: logos[3] },    // Kintsugi
    { img: Warpspeed, label: logos[4] },   // Warpspeed
    { img: Sisyphus, label: logos[5] },    // Sisyphus
    { img: Magnolia, label: logos[6] },    // Magnolia
    { img: OdeaoLabs, label: logos[7] },   // OdeaoLabs
    { img: Magnolia, label: logos[8] },    // Magnolia
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-white dark:bg-customBlack md:rounded-b-[7rem] rounded-b-3xl">
      {/* Animated grid background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <SquaresAnim speed={0.5} squareSize={50} direction='down' />
        {/* Left-bottom focused bubble/gradient */}
        <div className="
          absolute inset-0
          bg-[radial-gradient(ellipse_at_left_bottom,_var(--tw-gradient-stops))]
          from-pink-200/60 via-white/60 to-purple-200/80
          dark:from-[#232136]/80 dark:via-[#232136]/60 dark:to-[#232136]/0
          pointer-events-none
        " />
      </div>

      {/* Header (z-10 for above bg) */}
      <div className="relative z-20 w-full">
        <LandingHeader language={language} />
      </div>

      {/* Hero content */}
      <main className="relative z-10 flex flex-col items-center justify-center flex-1 w-full pt-40 pb-16 px-4">
        {/* Main heading */}
        {/*
          <h1 className="text-4xl md:text-48 font-extrabold text-center text-gray-900 dark:text-white mb-6 leading-tight">
            {heading1} 
            <CommonGradientText className="text-4xl md:text-48 font-bold leading-tight">
            &nbsp;{heading2}&nbsp;
            </CommonGradientText> 
            {heading3}<br className="hidden md:block" /> {heading4}
          </h1>
          */}
        
          <h1 className="md:block flex flex-wrap justify-center text-4xl md:text-48 lg:text-72 font-extrabold text-center text-gray-900 dark:text-white mb-6 leading-tight">
            {heading1} 
            <span className="text-4xl md:text-48 lg:text-72 font-bold leading-tight">
            &nbsp;{heading2}&nbsp;
            </span> 
            {heading3}<br className="hidden md:block" /> {heading4}
          </h1>
        {/* Subheading */}
        <p className="text-lg md:text-16 text-center text-black dark:text-white max-w-2xl mb-8">
          {subheading}
        </p>
        {/* Get Started button */}
        <div className="mb-2">
          <CommonButton
            text={buttonText}
            className=" !text-white rounded-lg px-4 py-2 text-16"
            icon={<GoArrowRight />}
            iconPosition="right"
          />
        </div>
        {/* Trial info */}
        <div className="mb-12">
          <span className="text-gray-500 dark:text-gray-400 text-14">{trialInfo}</span>
        </div>
        {/* Trusted logos row */}
        <div className="w-full max-w-5xl flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-90">
          {trustedLogos.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <img src={item.img} alt={item.label} className="h-8 md:h-10" />
              <span className="font-semibold text-black dark:text-white xl:text-3xl md:text-2xl text-lg">{item.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default HeroComponent
