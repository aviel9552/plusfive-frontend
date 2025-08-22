import React from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import { getAccountSettingTranslations } from '../../utils/translations';

function DeleteAccount() {
  const { language } = useLanguage();
  const t = getAccountSettingTranslations(language);

  const handleDelete = () => {
    // Handle account deletion logic here
    console.log('Account deletion initiated');
  };

  return (
    <div className="dark:bg-customBrown bg-white dark:text-white border border-gray-200 dark:border-customBorderColor p-8 rounded-2xl mx-auto mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <h2 className="text-24 font-ttcommons font-bold text-customRed mb-4">{t.deleteAccount}</h2>
      <p className="text-black dark:text-white mb-6 text-14">
        {t.deleteAccountWarning}
      </p>
      <button
        onClick={handleDelete}
        className="bg-customRed text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center text-16"
      >
      <p className="flex items-center justify-center gap-[6px]">

        <FaRegTrashAlt className="" />
        {t.deleteAccount}
      </p>
      </button>
    </div>
  );
}

export default DeleteAccount;
