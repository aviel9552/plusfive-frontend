import React, { useEffect, useRef } from 'react'
import { HiArrowRight } from 'react-icons/hi'
import UserIcon from '../../assets/User.svg';
import DollarIcon from '../../assets/Doller.svg';
import FileCheckIcon from '../../assets/FileCheck.svg';
import VerifyIcon from '../../assets/VerifyIcon.svg';
import TrophyIcon from '../../assets/TrophyIcon.svg';
import FileIcon from '../../assets/FileIcon.svg';
import HarSalmon from '../../assets/logos/HarSalm.avif';
import EyebrowBar from '../../assets/logos/EyebrowBar.avif';
import Medspa from '../../assets/logos/Medspa.avif';
import WaxingSalon from '../../assets/logos/WaxingSalon.avif';
import Barbers from '../../assets/logos/Barbers.avif';
import NailSalon from '../../assets/logos/NailSalon.avif';
import MassageSalon from '../../assets/logos/MassageSalon.avif';
import Spa from '../../assets/logos/Spa.avif';
import Fitness from '../../assets/logos/Fitness.avif';
import PersonalTrainer from '../../assets/logos/PersonalTrainer.avif';
import Salon from '../../assets/logos/Salon.avif';
import PhysicalTherapy from '../../assets/logos/PhysicalTherapy.avif';
import Tattoo from '../../assets/logos/Tattoo.avif';
import Tanning from '../../assets/logos/Tanning.avif';
import en from '../../i18/en.json';
import he from '../../i18/he.json';

// Data arrays for both sections
const topRowData = [
  { image: HarSalmon, name: "Hair Salon", alt: "HarSalmon" },
  { image: EyebrowBar, name: "Eyebrow Bar", alt: "EyebrowBar" },
  { image: Medspa, name: "Medspa", alt: "Medspa" },
  { image: WaxingSalon, name: "Waxing Salon", alt: "WaxingSalon" },
  { image: Barbers, name: "Barbers", alt: "Barbers" },
  { image: NailSalon, name: "Nail Salon", alt: "NailSalon" },
];

const bottomRowData = [
  { image: MassageSalon, name: "Massage Salon", alt: "MassageSalon" },
  { image: Spa, name: "Spa", alt: "Spa" },
  { image: Fitness, name: "Fitness", alt: "Fitness" },
  { image: PersonalTrainer, name: "Personal Trainer", alt: "PersonalTrainer" },
  { image: Salon, name: "Salon", alt: "Salon" },
  { image: PhysicalTherapy, name: "Physical Therapy", alt: "PhysicalTherapy" },
  { image: Tattoo, name: "Tattoo", alt: "Tattoo" },
  { image: Tanning, name: "Tanning", alt: "Tanning" },
];

const statIcons = [
  <img src={UserIcon} alt="User Icon" className="w-[64px] h-[64px]" />,
  <img src={DollarIcon} alt="Dollar Icon" className="w-[64px] h-[64px]" />,
  <img src={FileCheckIcon} alt="File Check Icon" className="w-[64px] h-[64px]" />,
];

const bottomIcons = [
  <img src={VerifyIcon} alt="Verify Icon" className="w-[24px] h-[24px] mr-2" />,
  <img src={TrophyIcon} alt="Trophy Icon" className="w-[24px] h-[24px] mr-2" />,
  <img src={FileIcon} alt="File Icon" className="w-[24px] h-[24px] mr-2" />,
];

function Trusted({ language }) {
  const t = language === 'he' ? he.trusted : en.trusted;
  const logosLeftRef = useRef(null);
  const logosRightRef = useRef(null);

  useEffect(() => {
    // Handle left to right section
    if (logosLeftRef.current) {
      const logosContainer = logosLeftRef.current.parentNode;
      const existingCopies = logosContainer.querySelectorAll('.logos-slide-left');

      // Keep only the first one (original)
      for (let i = 1; i < existingCopies.length; i++) {
        existingCopies[i].remove();
      }

      // Add only one copy
      const copy = logosLeftRef.current.cloneNode(true);
      logosContainer.appendChild(copy);
    }

    // Handle right to left section
    if (logosRightRef.current) {
      const logosContainer = logosRightRef.current.parentNode;
      const existingCopies = logosContainer.querySelectorAll('.logos-slide-right');

      // Keep only the first one (original)
      for (let i = 1; i < existingCopies.length; i++) {
        existingCopies[i].remove();
      }

      // Add only one copy
      const copy = logosRightRef.current.cloneNode(true);
      logosContainer.appendChild(copy);
    }
  }, []);

  return (
    <div>
      <section className="w-full bg-transparent flex flex-col items-center justify-center md:py-[64px] py-8 md:px-[80px] px-8">
        <div className='flex flex-col items-center justify-center gap-[64px]'>

          <div className='flex flex-col items-center justify-center gap-[16px]'>
            {/* Heading */}
            <h2 className="text-4xl md:text-48 font-extrabold text-customLightTextColor dark:text-white text-center tracking-tight font-testtiemposfine">{t.heading}</h2>
            <p className="text-lg md:text-20 text-customBoldTextColor dark:text-gray-300 text-center font-medium  max-w-[556px]">
              {t.subheading}
            </p>
          </div>


        </div>
      </section>
      <section className="w-full bg-transparent flex flex-col items-center justify-center md:pb-[64px] py-8 ">

        {/* Left to Right Section */}
        <div className="logos w-full bg-white flex items-center justify-center">
          <div className="logos-slide-left" ref={logosLeftRef}>
            {topRowData.map((item, index) => (
              <div key={index} className="image-container">
                <img src={item.image} alt={item.alt} className='cursor-pointer' />
                <div className="overlay">
                  <div className="overlay-content">
                    <span className="text-21 font-semibold">{item.name}</span>
                    <div className="icon">
                      <HiArrowRight />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right to Left Section */}
        <div className="logos w-full bg-gray-50 flex items-center justify-center">
          <div className="logos-slide-right" ref={logosRightRef}>
            {bottomRowData.map((item, index) => (
              <div key={index} className="image-container">
                <img src={item.image} alt={item.alt} className='cursor-pointer' />
                <div className="overlay">
                  <div className="overlay-content">
                    <span className="text-21 font-semibold">{item.name}</span>
                    <div className="icon">
                      <HiArrowRight />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Trusted
