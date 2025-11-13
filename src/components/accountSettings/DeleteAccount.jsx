import React, { useState } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import { getAccountSettingTranslations } from '../../utils/translations';
import CommonConfirmModel from '../commonComponent/CommonConfirmModel';
import { softDeleteUser } from '../../redux/services/authService';
import { logoutUser } from '../../redux/actions/authActions';

function DeleteAccount() {
  const { language } = useLanguage();
  const t = getAccountSettingTranslations(language);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      // Call the soft delete API
      const response = await softDeleteUser();
      
      // Show success message
      toast.success(response.message || 'Account deleted successfully');
      
      // Wait a bit for toast to show, then logout and redirect
      setTimeout(() => {
        // If successful, logout the user
        dispatch(logoutUser());
        
        // Redirect to home/login page
        navigate('/');
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting account:', error);
      // Show error toast
      toast.error(error.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      <div className="dark:bg-customBrown bg-white dark:text-white border border-gray-200 dark:border-customBorderColor p-8 rounded-2xl mx-auto mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
        <h2 className="text-24 font-ttcommons font-bold text-customRed mb-4">{t.deleteAccount}</h2>
        <p className="text-black dark:text-white mb-6 text-14">
          {t.deleteAccountWarning}
        </p>
        <button
          onClick={handleDeleteClick}
          className="bg-customRed text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center text-16"
        >
          <p className="flex items-center justify-center gap-[6px]">
            <FaRegTrashAlt className="" />
            {t.deleteAccount}
          </p>
        </button>
      </div>

      <CommonConfirmModel
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Account"}
        cancelText="Cancel"
      />
    </>
  );
}

export default DeleteAccount;
