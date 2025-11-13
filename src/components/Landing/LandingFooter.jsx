import { MdOutlineAdd } from "react-icons/md";
import FaceBooIcon from "../../assets/FaceBooIcon.svg";
import LinkDinIcon from "../../assets/LinkDinIcon.svg";
import IGIcon from "../../assets/IGIcon.svg";
import XIcon from "../../assets/XIcon.svg";
import en from "../../i18/en.json";
import he from "../../i18/he.json";

const LandingFooter = ({ language }) => {
    const t = language === "he" ? he.footer : en.footer;

    const handleNavClick = (label, href) => {
        if (href === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.location.hash = '';
        } else if (href.startsWith('/#')) {
            const id = href.replace('/#', '');
            const el = document.getElementById(id);

            if (el) {
                const headerHeight = 80;
                const elementPosition = el.offsetTop - headerHeight;

                window.scrollTo({
                    top: elementPosition,
                    behavior: 'smooth'
                });

                window.location.hash = href.replace('/', '');
            } else {
                console.warn(`Section with id "${id}" not found`);
            }
        }
    };
    return (
        <footer className="bg-[#0b0b0b] text-white pb-4 px-8 md:px-[24px] md:py-[64px]">
            <div className=" md:px-[56px]">

                <div className=" mx-auto flex flex-col md:flex-row justify-evenly gap-[32px]">
                    {/* Left: Logo & Description */}
                    <div className="flex-1 flex flex-col gap-[24px]">
                        <div className="flex items-center gap-[8px] cursor-pointer">
                            <span className={`text-lg md:text-32 font-testtiemposfine text-white transition-opacity duration-300 cursor-pointer`} onClick={() => window.location.href = '/'}>
                                {t.brandName || 'PlusFive'}
                            </span>
                        </div>
                        <div>
                            <p className="text-[#FFFFFFB8] text-16">
                                {t.description}
                            </p>
                        </div>
                        <div className="flex gap-[16px]">
                            <a href="#" aria-label="Facebook">
                                <img src={FaceBooIcon} alt="Facebook" className="hover:opacity-80 transition md:w-[24px] w-[24px] md:h-[24px] h-[24px]" />
                            </a>
                            <a href="#" aria-label="LinkedIn">
                                <img src={LinkDinIcon} alt="LinkedIn" className="hover:opacity-80 transition md:w-[24px] w-[24px] md:h-[24px] h-[24px]" />
                            </a>
                            <a href="https://www.instagram.com/plusfive.io/" aria-label="Instagram">
                                <img src={IGIcon} alt="Instagram" className="hover:opacity-80 transition md:w-[24px] w-[24px] md:h-[24px] h-[24px]" />
                            </a>
                            <a href="#" aria-label="X">
                                <img src={XIcon} alt="X" className="hover:opacity-80 transition md:w-[24px] w-[24px] md:h-[24px] h-[24px]" />
                            </a>
                        </div>
                    </div>

                    {/* Center: Product Links */}
                    <div className="flex-1 flex flex-col gap-[16px]">
                        <h4 className="font-semibold text-18px">{t.product}</h4>
                        <ul className="flex flex-col gap-[8px] text-[#FFFFFFB8] text-16">
                            {t.productLinks.map((item, idx) => {
                                const href = item === 'Features' ? '/#features' : 
                                           item === 'Pricing' ? '/#pricing' : 
                                           item === 'How It Works' ? '/#howitworks' : 
                                           item === 'Success Stories' ? '/#success-stories' : '#';
                                
                                return (
                                    <li key={idx}>
                                        <a 
                                            href={href}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleNavClick(item, href);
                                            }}
                                            className="hover:text-white transition-colors duration-300 cursor-pointer"
                                        >
                                            {item}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Right: Support Links */}
                    <div className="flex-1 flex flex-col gap-[16px]">
                        <h4 className="font-semibold mb-3 text-18px">{t.support}</h4>
                        <ul className=" flex flex-col gap-[8px] text-[#FFFFFFB8] text-16">
                            {t.supportLinks.map((item, idx) => {
                                const href = item.label === 'FAQ' ? '/#faq' : item.href;
                                
                                return (
                                    <li key={idx}>
                                        <a 
                                            href={href}
                                            onClick={(e) => {
                                                if (item.label === 'FAQ') {
                                                    e.preventDefault();
                                                    handleNavClick(item.label, href);
                                                }
                                            }}
                                            className="hover:text-white transition-colors duration-300 cursor-pointer"
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-[#1F2937] mt-[48px] mb-[33px]"></div>

                {/* Bottom: Copyright & Policies */}
                <div className=" mx-auto flex flex-col md:flex-row justify-between items-center text-16 text-[#FFFFFFB8] gap-2">
                    <div>{t.copyright}</div>
                    <div className="flex gap-[24px]">
                        {t.policies.map((item, idx) => (
                            <a 
                                key={idx} 
                                href="#" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = '/login';
                                }}
                                className="text-14 text-[#FFFFFFB8] hover:text-white transition-colors duration-300 cursor-pointer"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default LandingFooter;
