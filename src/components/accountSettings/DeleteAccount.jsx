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
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
            {t.deleteAccount}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            מחיקת החשבון היא פעולה בלתי הפיכה. כל הנתונים יימחקו לצמיתות.{" "}
            <a href="#" className="text-[#ff257c] hover:underline">למד עוד</a>
          </p>
        </div>

        {/* Delete Account Card */}
        <div className="bg-white dark:bg-[#181818] border border-gray-200 dark:border-commonBorder rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-500 mb-4">
            מחיקת חשבון
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm">
            {t.deleteAccountWarning}
          </p>
          <button
            onClick={handleDeleteClick}
            className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FaRegTrashAlt className="text-sm" />
            {t.deleteAccount}
          </button>
        </div>
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
