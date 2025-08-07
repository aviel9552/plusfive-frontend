import React from "react";
import Slider from "react-slick";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import CommonButton from "../commonComponent/CommonButton";
import { useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import en from '../../i18/en.json';
import he from '../../i18/he.json';
import TestDecor from '../../assets/test.svg';

const resolveImage = (img) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  const fileName = img.split('/').pop();
  if (fileName === 'test.svg') return TestDecor;
  return img;
};

const RealResults = ({ language }) => {
  const navigate = useNavigate();
  const lang = language === 'he' ? he : en;
  const testimonials = lang.realResults.testimonials;
  const heading = lang.realResults.heading;
  const heading2 = lang.realResults.heading2;
  const subheading = lang.realResults.subheading;
  const buttonText = lang.realResults.buttonText;

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false, // Hide default arrows
    // centerMode: false, // Only one card in center
  };

  // Slider ref for custom arrows
  const sliderRef = React.useRef();

  return (
    <div id="success-stories" className="flex flex-col items-center justify-center md:py-[64px] py-8 md:px-[80px] px-8 md:gap-[64px] gap-[32px] ">
      <div className="flex flex-col items-center justify-center gap-[16px]">
        <h2 className="text-3xl md:text-48 font-extrabold text-customLightTextColor dark:text-white text-center tracking-tight max-w-[575px] font-testtiemposfine">
          {heading}<br />
          {heading2}
        </h2>
        <p className="text-20 text-customBoldTextColor dark:text-gray-300 text-center font-medium max-w-[456px]">
          {subheading}
        </p>
      </div>
      <div className="w-full">
        <Slider ref={sliderRef} {...settings}>
          {testimonials.map((t, i) => (
            <div key={i} className="flex justify-center items-center w-full md:px-4 py-5">
              <div className="w-full max-w-7xl mx-auto md:px-4">
                <div
                  className="w-full bg-gray-50 dark:bg-neutral-800 rounded-[32px] flex flex-col md:flex-row items-stretch transition-all border border-gray-100 dark:border-neutral-700"
                  style={{ minHeight: 340 }}
                >
                  {/* Left: Image */}
                  <div className="flex-shrink-0 flex items-center justify-center mb-6 md:mb-0">
                    <img
                      src={resolveImage(t.image)}
                      alt={t.author}
                      className="w-full object-cover mt-[29px] ml-[26px]"
                    // style={{ minWidth: 180, minHeight: 240 }}
                    />
                  </div>
                  {/* Right: Content */}
                  <div className="flex flex-col justify-center flex-1 md:pt-[92px] md:pb-[73px] md:px-[32px]">
                    <div className="flex flex-col gap-[16px]">
                      <p
                        className="font-semibold mb-2 text-20 w-fit"
                        style={{
                          background: 'linear-gradient(259deg, #FE5D39 3.28%, #FF2380 49.86%, #DF64CC 100.32%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {t.storyType}
                      </p>
                      <p className="text-30 text-customLightTextColor dark:text-white mb-6 max-w-2xl md:max-w-3xl text-left">
                        {t.text}
                      </p>
                    </div>

                    <div className="flex md:flex-row flex-col sm:items-center sm:justify-between bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 sm:rounded-full rounded-lg md:py-[20px] md:pl-[32px] md:pr-[24px] px-6 py-4 shadow-sm w-full">
                      <div className="flex flex-col gap-[4px]">
                        <p className="font-bold text-customLightTextColor dark:text-white text-18">{t.author}</p>
                        <p className="text-16 text-customBoldTextColor dark:text-gray-300">{t.authorTitle}</p>
                      </div>
                      <CommonButton
                        text={buttonText}
                        onClick={() => navigate('/login')}
                        icon={<FaArrowRight />}
                        iconPosition="right"
                        gap="gap-[10px]"
                        className="ml-2 px-6 pt-3 pb-2 text-16 font-bold rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
        {/* Custom Arrows below the card */}
        <div className="flex justify-center items-center mt-[20px] gap-[20.17px]">
          <button
            className="w-[40px] h-[40px] flex items-center justify-center bg-[#c2c2c2] dark:bg-neutral-800 hover:bg-black shadow rounded-full"
            onClick={() => sliderRef.current.slickPrev()}
            aria-label="Previous"
            type="button"
          >
            <FaArrowLeft className="text-2xl text-white dark:text-white" />
          </button>
          <button
            className="w-[40px] h-[40px] flex items-center justify-center bg-[#c2c2c2] dark:bg-neutral-800 hover:bg-black shadow rounded-full"
            onClick={() => sliderRef.current.slickNext()}
            aria-label="Next"
            type="button"
          >
            <FaArrowRight className="text-2xl text-white dark:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RealResults;
