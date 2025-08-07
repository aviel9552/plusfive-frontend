import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import en from '../../i18/en.json';
import he from '../../i18/he.json';

function FAQ({ language }) {
  const lang = language === 'he' ? he : en;
  const faqs = lang.faq.questions;
  const heading = lang.faq.heading;
  const subheading = lang.faq.subheading;

  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="w-full flex flex-col items-center justify-center bg-transparent md:py-[64px] py-8 md:px-[24px] px-8">

      <div className='flex flex-col items-center justify-center gap-[64px]'>

        {/* FAQ Heading */}
        <div className="flex flex-col items-center justify-center gap-[16px]">
          <h2 className="text-3xl md:text-48 font-extrabold text-customLightTextColor dark:text-white text-center font-testtiemposfine">{heading}</h2>
          {/*
            <p className="text-customBoldTextColor dark:text-gray-300 text-center max-w-xl text-20">
              {subheading}
            </p>
          */}
        </div>

        {/* FAQ Accordions */}
        <div className="lg:w-[56rem] w-full flex flex-col gap-[16px]">
          {faqs.map((item, idx) => (
            <div 
              key={idx} 
              className="rounded-lg overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FCFBF8 0%, #F3F4F6 100%)'
              }}
            >
              <button
                className="w-full flex items-center justify-between px-[24px] py-[16px] text-left font-semibold text-gray-900 dark:text-white focus:outline-none"
                onClick={() => setOpen(open === idx ? null : idx)}
                aria-expanded={open === idx}
              >
                <span className="text-18 font-semibold text-[#111827]">{item.q}</span>
                {open === idx ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
              </button>
              <div
                className={`px-6 pb-4 text-16 text-customBoldTextColor transition-all duration-300 ${open === idx ? 'block' : 'hidden'}`}
              >
                {item.a}
              </div>
            </div>
          ))}
        </div>

      </div>

    </section>
  );
}

export default FAQ;