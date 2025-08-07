import React from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

function AdminDeleteAccount() {
  const handleDelete = () => {
    // Handle account deletion logic here
    console.log('Account deletion initiated');
  };

  return (
    <div className="dark:bg-customBrown bg-white dark:text-white border border-gray-200 dark:border-customBorderColor p-8 rounded-2xl mx-auto mt-8 dark:hover:bg-customBlack shadow-md hover:shadow-sm">
      <h2 className="text-2xl font-bold text-customRed mb-4">Delete Account</h2>
      <p className="text-black dark:text-gray-400 mb-6 text-lg">
        Deleting your account will permanently remove all your data and cannot be recovered. This action is irreversible.
      </p>
      <button
        onClick={handleDelete}
        className="bg-customRed text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center pt-3"
      >
        <FaRegTrashAlt className="mr-2 mb-1" />
        Delete Account
      </button>
    </div>
  );
}

export default AdminDeleteAccount;
