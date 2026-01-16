import React, { useState, useMemo, useEffect } from 'react';
import { CommonTable, CommonLoader, CommonButton, CommonNormalDropDown } from '../../index';
import { format } from 'date-fns';
import { FiEdit, FiTrash2, FiPlus, FiSearch } from "react-icons/fi";
import { useDispatch } from 'react-redux';
import { deleteCategory, deleteMultipleCategories, fetchCategories } from '../../../redux/actions/categoryActions';
import { toast } from 'react-toastify';
import CommonConfirmModel from '../../commonComponent/CommonConfirmModel';
import CreateAndEditCategory from './CreateAndEditCategory';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminCategoryTranslations } from '../../../utils/translations';

function ListCategory({ categories, loading, error }) {
    const dispatch = useDispatch();
    const { language } = useLanguage();
    const t = getAdminCategoryTranslations(language);

    const safeCategories = Array.isArray(categories) ? categories : [];

    const [data, setData] = useState([]);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [sort, setSort] = useState({ key: '', direction: 'asc' });
    const [selectedItems, setSelectedItems] = useState([]); // Array of category IDs
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [categoryId, setCategoryId] = useState(null);
    const [categoryData, setCategoryData] = useState(null);

    useEffect(() => {
        setData(safeCategories);
    }, [categories]);

    const handleEdit = (category) => {
        if (!category || !category.id) {
            toast.error(t.invalidCategoryData);
            return;
        }
        setCategoryId(category.id);
        setCategoryData(category);
        setShowModal(true);
    };

    const handleAddCategory = () => {
        setCategoryId(null);
        setCategoryData(null);
        setShowModal(true);
    };

    const handleModalSuccess = () => {
        dispatch(fetchCategories());
    };

    const handleModalClose = () => {
        setShowModal(false);
        setCategoryId(null);
        setCategoryData(null);
    };

    const handleDelete = (categoryData) => {
        setCategoryToDelete(categoryData);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const result = await dispatch(deleteCategory(categoryToDelete.id));
            if (result.success) {
                toast.success(t.categoryDeletedSuccessfully);
                dispatch(fetchCategories());
            } else {
                toast.error(result.error || t.failedToDeleteCategory);
            }
        } catch (error) {
            toast.error(error.message || t.failedToDeleteCategory);
        } finally {
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
        }
    };

    // Handle individual item selection
    const handleSelectItem = (categoryId) => {
        setSelectedItems(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    // Handle select all - works with all filtered/sorted data
    const handleSelectAll = () => {
        const allSelected = selectedItems.length === sortedData.length && sortedData.length > 0;
        if (allSelected) {
            setSelectedItems([]);
        } else {
            const allIds = sortedData.map(category => category.id);
            setSelectedItems(allIds);
        }
    };

    // Clear selection when data changes
    useEffect(() => {
        // Remove selected items that no longer exist in the data
        const existingIds = new Set(data.map(cat => cat.id));
        setSelectedItems(prev => prev.filter(id => existingIds.has(id)));
    }, [data]);

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) {
            toast.warning(t.pleaseSelectCategoriesToDelete);
            return;
        }
        setShowBulkDeleteConfirm(true);
    };

    const confirmBulkDelete = async () => {
        if (selectedItems.length === 0) return;

        try {
            const result = await dispatch(deleteMultipleCategories(selectedItems));
            if (result.success) {
                toast.success(`${selectedItems.length} ${t.categoriesDeletedSuccessfully}`);
                setSelectedItems([]);
                dispatch(fetchCategories());
            } else {
                toast.error(result.error || t.failedToDeleteCategories);
            }
        } catch (error) {
            toast.error(error.message || t.failedToDeleteCategories);
        } finally {
            setShowBulkDeleteConfirm(false);
        }
    };


    const renderCustomActions = (row) => (
        <div className={`flex items-center justify-${language === 'he' ? 'end' : 'start'} space-x-2`}>
            <button
                onClick={() => handleEdit(row)}
                className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                title={t.edit}
            >
                <FiEdit className="w-4 h-4" />
            </button>
            <button
                onClick={() => handleDelete(row)}
                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                title={t.delete}
            >
                <FiTrash2 className="w-4 h-4" />
            </button>
        </div>
    );

    const filteredData = useMemo(() => {
        let d = data.filter(row => row && typeof row === 'object');

        if (search) {
            d = d.filter(row =>
                row?.title?.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (filterStatus) {
            d = d.filter(row => row?.status === filterStatus);
        }

        return d;
    }, [data, search, filterStatus]);

    const sortedData = useMemo(() => {
        if (!sort.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            let aVal = a?.[sort.key];
            let bVal = b?.[sort.key];

            // Handle date sorting
            if (sort.key === 'createdAt') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }

            if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sort]);

    // Paginate the sorted data
    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return sortedData.slice(start, end);
    }, [sortedData, page, pageSize]);

    const columns = [
        { key: 'title', label: t.title, sortable: true },
        { key: 'status', label: t.status, sortable: true },
        {
            key: 'createdAt',
            label: t.createdAt,
            sortable: true,
            render: (row) => row?.createdAt ? format(new Date(row.createdAt), 'MMM dd, yyyy') : '-'
        }
    ];

    const statusFilterOptions = [
        { value: '', label: t.allStatus },
        { value: 'active', label: t.active },
        { value: 'inactive', label: t.inactive }
    ];

    const handleSort = (key, direction) => {
        setSort({ key, direction });
    };

    const handleFilterChange = (value) => {
        setFilterStatus(value);
    };

    if (loading) {
        return <CommonLoader />;
    }

    if (error) {
        return (
            <div className="p-4 text-red-600 dark:text-red-400">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t.categoryManagement}</h2>
                <CommonButton
                    onClick={handleAddCategory}
                    text={t.addCategory}
                    icon={<FiPlus className="w-5 h-5" />}
                    iconPosition="left"
                //   className="bg-blue-600 hover:bg-blue-700"
                />
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder={t.searchCategories}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#232323] border-2 border-gray-200 dark:border-customBorderColor rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all duration-200"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        <FiSearch className="w-5 h-5" />
                    </span>
                </div>
                <div className="relative min-w-[180px]">
                    <CommonNormalDropDown
                        options={statusFilterOptions}
                        value={filterStatus}
                        onChange={handleFilterChange}
                        placeholder={t.allStatus}
                        className="min-w-[180px]"
                        bgColor="bg-gray-50 dark:bg-[#232323]"
                        textColor="text-gray-700 dark:text-white"
                        fontSize="text-sm"
                        inputWidth="w-full"
                        inputBorderRadius="rounded-xl"
                        padding="px-4 py-2.5"
                    />
                </div>
            </div>


            <div className='mt-7 p-2 border border-gray-200 dark:border-customBorderColor rounded-2xl dark:bg-customBrown dark:hover:bg-customBlack shadow-md hover:shadow-sm'>

                <CommonTable
                    columns={columns}
                    data={paginatedData}
                    total={sortedData.length}
                    selectedItems={selectedItems}
                    onSelectItem={handleSelectItem}
                    onSelectAll={handleSelectAll}
                    onDeleteSelected={handleBulkDelete}
                    getRowId={(row) => row.id}
                    searchValue={search}
                    onSearchChange={setSearch}
                    filterValue={filterStatus || t.allStatus}
                    filterOptions={statusFilterOptions}
                    onFilterChange={handleFilterChange}
                    loading={loading}
                    renderActions={(row) => renderCustomActions(row)}
                    onSort={handleSort}
                    currentPage={page}
                    onPageChange={setPage}
                    pageSize={pageSize}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                    showPagination={true}
                    showCount={true}
                    noDataComponent={t.noCategoriesFound}
                />

            </div>

            <CommonConfirmModel
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setCategoryToDelete(null);
                }}
                onConfirm={confirmDelete}
                title={t.deleteCategory}
                message={`${t.areYouSureToDeleteCategory} "${categoryToDelete?.title}"?`}
                confirmText={t.delete}
                cancelText={t.cancel}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />

            <CommonConfirmModel
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={confirmBulkDelete}
                title={t.deleteCategories}
                message={`${t.areYouSureToDeleteCategories} ${selectedItems.length} ${t.selectedCategory}?`}
                confirmText={t.delete}
                cancelText={t.cancel}
                confirmButtonClass="bg-red-600 hover:bg-red-700"
            />

            <CreateAndEditCategory
                isOpen={showModal}
                onClose={handleModalClose}
                categoryId={categoryId}
                categoryData={categoryData}
                onSuccess={handleModalSuccess}
            />
        </div>
    );
}

export default ListCategory;
