import React from 'react';
import PropTypes from 'prop-types';
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa';

const PAGE_SIZES = [7, 10, 20, 30, 50];

function getPagination(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 2) {
    return [1, 2, '...', total];
  }
  if (current >= total - 2) {
    return [1, '...', total - 2, total - 1, total];
  }
//   return [1, '...', current - 1, current, current + 1, '...', total];
  return [1, '...', current, '...', total];
}

const CommonPagination = ({
  currentPage = 1,
  pageSize = PAGE_SIZES[0],
  total,
  onPageChange,
  onPageSizeChange,
  className = '',
  showPageSizeSelector = true,
  showPageInfo = true
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginationNumbers = getPagination(currentPage, totalPages);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = React.useState(false);

  return (
    <div className={`flex flex-col md:flex-row justify-between items-center gap-4 px-2 py-2 ${className}`}>
      {showPageSizeSelector && (
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-4">
          <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <span className="hidden sm:inline ">Rows per page</span>
            <div className="relative min-w-[10px]">
              <button
                type="button"
                className="w-full flex items-center justify-between bg-gray-50 dark:bg-[#232323] text-gray-700 dark:text-white px-4 py-2.5 rounded-xl text-sm border-2 border-gray-200 dark:border-customBorderColor hover:border-pink-500 dark:hover:border-pink-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200"
                onClick={() => setShowPageSizeDropdown(o => !o)}
              >
                <span>{pageSize}</span>
                <svg className={`ml-2 transform transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showPageSizeDropdown && (
                <div className="absolute right-0 bottom-full mb-2 w-full bg-white dark:bg-[#232323] border-2 border-gray-200 dark:border-customBorderColor rounded-xl shadow-lg z-20 animate-fadeIn overflow-hidden">
                  {PAGE_SIZES.map(size => (
                    <button
                      key={size}
                      className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-[#2C2C2C] transition-colors duration-150 ${pageSize === size ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' : 'text-gray-700 dark:text-white'}`}
                      onClick={() => {
                        onPageSizeChange?.(size);
                        setTimeout(() => setShowPageSizeDropdown(false), 100);
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </label>
          {showPageInfo && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} of {total}
            </span>
          )}
        </div>
      )}
      
      <nav className="flex items-center gap-2" aria-label="Table navigation">
        <button
          type="button"
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-1.5 border rounded-full border-gray-200 dark:border-customBorderColor text-gray-500 dark:text-gray-400 hover:border-pink-500 hover:text-pink-500 disabled:opacity-50 transition-all duration-200"
          aria-label="Previous page"
        >
          <FaAngleLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1">
          {paginationNumbers.map((num, i) =>
            num === '...' ? (
              <span key={i} className="px-2 py-1 text-gray-400">...</span>
            ) : (
              <button
                key={i}
                type="button"
                className={`w-8 h-8 flex items-center justify-center rounded-full border ${
                  currentPage === num
                    ? 'bg-customRed text-white border-customRed font-bold '
                    : 'border-gray-200 dark:border-customBorderColor text-gray-700 dark:text-gray-300 hover:border-customRed hover:text-customRed font-bold'
                } transition-all duration-200 text-sm`}
                onClick={() => onPageChange?.(Number(num))}
                aria-label={`Go to page ${num}`}
                aria-current={currentPage === num ? 'page' : undefined}
              >
                {num}
              </button>
            )
          )}
        </div>
        
        <button
          type="button"
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-full border border-gray-200 dark:border-customBorderColor text-gray-500 dark:text-gray-400 hover:border-pink-500 hover:text-pink-500 disabled:opacity-50 transition-all duration-200"
          aria-label="Next page"
        >
          <FaAngleRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

CommonPagination.propTypes = {
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  total: PropTypes.number.isRequired,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  className: PropTypes.string,
  showPageSizeSelector: PropTypes.bool,
  showPageInfo: PropTypes.bool
};

export default CommonPagination;
