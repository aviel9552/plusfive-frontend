import React, { useState, useMemo, useEffect } from 'react';
import { CommonAdminTable } from '../../index';
import { format } from 'date-fns';
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminUserTranslations } from '../../../utils/translations';

const getUnique = (arr, key) => {
  const values = arr.map(item => item?.[key]).filter(Boolean);
  const uniqueValues = Array.from(new Set(values));
  return uniqueValues;
};

function AdminUserTable({ users, loading, error }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = getAdminUserTranslations(language);

  // Ensure users is always an array
  const safeUsers = Array.isArray(users) ? users : [];

  const [data, setData] = useState([]);

  // Update data when users prop changes
  useEffect(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    setData(safeUsers);
  }, [users]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [sort, setSort] = useState({ key: '', direction: 'asc' });
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Date range state for custom picker
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });
  const [showPicker, setShowPicker] = useState(false);

  // Action handlers
  const handleEdit = (userData) => {
    navigate(`/admin/user-management/edit/${userData.id}`);
  };

  const handleView = (userData) => {
    navigate(`/admin/user-management/view/${userData.id}`);
  };

  const handleDelete = (userData) => {
    // Implement delete functionality
    console.log('Delete user:', userData);
  };

  const handleAddUser = () => {
    navigate('/admin/user-management/create');
  };

  // Custom action renderer
  const renderCustomActions = (row) => (
    <div className="flex items-center justify-center space-x-2">
      <button
        onClick={() => handleView(row)}
        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
        title={t.viewDetails}
      >
        <FiEye className="w-4 h-4" />
      </button>
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

  // Filtered & searched data
  const filteredData = useMemo(() => {
    // Filter out undefined or null rows first
    let d = data.filter(row => row && typeof row === 'object');

    if (search) {
      d = d.filter(row =>
        `${row?.firstName || ''} ${row?.lastName || ''}`.toLowerCase().includes(search.toLowerCase()) ||
        row?.email?.toLowerCase().includes(search.toLowerCase()) ||
        row?.phoneNumber?.toLowerCase().includes(search.toLowerCase()) ||
        row?.businessName?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filterStatus) {
      d = d.filter(row => {
        // Handle Active/Inactive based on isActive field
        if (filterStatus === 'active' && row?.isActive === true) return true;
        if (filterStatus === 'inactive' && row?.isActive === false) return true;

        // Handle subscriptionStatus values (with status_ prefix)
        if (filterStatus.startsWith('status_')) {
          const status = filterStatus.replace('status_', '');
          return row?.subscriptionStatus === status;
        }

        return false;
      });
    }
    if (filterRole) d = d.filter(row => row?.role === filterRole);
    if (filterPlan) d = d.filter(row => row?.subscriptionPlan === filterPlan);
    // Date range filter
    if (dateRange.startDate) {
      const startDateStr = format(dateRange.startDate, 'yyyy-MM-dd');
      d = d.filter(row => {
        if (!row?.createdAt) return false;
        const rowDate = new Date(row.createdAt);
        const rowDateStr = format(rowDate, 'yyyy-MM-dd');
        return rowDateStr >= startDateStr;
      });
    }
    if (dateRange.endDate) {
      const endDateStr = format(dateRange.endDate, 'yyyy-MM-dd');
      d = d.filter(row => {
        if (!row?.createdAt) return false;
        const rowDate = new Date(row.createdAt);
        const rowDateStr = format(rowDate, 'yyyy-MM-dd');
        return rowDateStr <= endDateStr;
      });
    }
    if (sort.key) {
      d = d.sort((a, b) => {
        let aVal = a?.[sort.key];
        let bVal = b?.[sort.key];

        // Handle name sorting
        if (sort.key === 'name') {
          aVal = `${a?.firstName || ''} ${a?.lastName || ''}`;
          bVal = `${b?.firstName || ''} ${b?.lastName || ''}`;
        }

        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return d;
  }, [data, search, filterStatus, filterRole, filterPlan, dateRange, sort]);

  // Pagination
  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Checkbox logic
  const isSelected = (row) => selected.some(s => s.id === row.id);
  const onSelect = (row) => {
    setSelected(sel =>
      isSelected(row) ? sel.filter(s => s.id !== row.id) : [...sel, row]
    );
  };
  const onSelectAll = () => {
    if (pagedData.every(isSelected)) {
      setSelected(sel => sel.filter(row => !pagedData.some(p => p.id === row.id)));
    } else {
      setSelected(sel => [...sel, ...pagedData.filter(row => !isSelected(row))]);
    }
  };

  // Sorting
  const handleSort = (key, direction) => setSort({ key, direction });

  // Pagination change
  const handlePageChange = (p) => setPage(p);
  const handlePageSizeChange = (size) => { setPageSize(size); setPage(1); };

  // Filter options with better labels
  const statusOptions = [
    { value: '', label: 'Clear Filter' },
    // Add Active/Inactive based on isActive field
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    // Get unique subscriptionStatus values (excluding 'active' to avoid duplicates)
    ...getUnique(data, 'subscriptionStatus')
      .filter(status => status !== 'active') // Remove 'active' to avoid duplicate
      .map(status => ({
        value: `status_${status}`,
        label: status.charAt(0).toUpperCase() + status.slice(1)
      }))
  ];
  const roleOptions = [
    { value: '', label: 'Clear Filter' },
    ...getUnique(data, 'role').map(role => ({ value: role, label: role.charAt(0).toUpperCase() + role.slice(1) }))
  ];
  const planOptions = [
    { value: '', label: 'Clear Filter' },
    ...getUnique(data, 'subscriptionPlan').map(plan => ({ value: plan, label: plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'No Plan' }))
  ];

  // Columns with translations
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input type="checkbox" aria-label={t.selectAll} />
      ),
      render: (row, idx, { isSelected, onSelect }) => (
        <input
          type="checkbox"
          checked={isSelected(row)}
          onChange={() => onSelect(row)}
          aria-label={`${t.selectRow} ${row.firstName} ${row.lastName}`}
        />
      ),
      className: 'w-8',
    },
    {
      key: 'name',
      label: t.name,
      sortable: true,
      render: (row) => `${row?.firstName || ''} ${row?.lastName || ''}`
    },
    {
      key: 'email',
      label: t.email,
      sortable: true,
      render: (row) => row?.email || 'N/A'
    },
    {
      key: 'phoneNumber',
      label: t.phone,
      sortable: false,
      render: (row) => row?.phoneNumber || 'N/A'
    },
    {
      key: 'role',
      label: t.role,
      sortable: true,
      render: (row) => {
        // Safety check for undefined row
        if (!row) {
          return <span className="px-3 pt-[10px] pb-[6px] rounded-full text-xs border dark:border-[#292929] border-gray-300 dark:text-white text-black">N/A</span>;
        }

        const role = row.role || 'user';
        return (
          <span className="px-3 pt-[10px] pb-[6px] rounded-full text-xs border dark:border-[#292929] border-gray-300 dark:text-white text-black">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'subscriptionStatus',
      label: t.status,
      sortable: true,
      render: (row) => {
        const isActive = row?.isActive;
        const subscriptionStatus = row?.subscriptionStatus;

        // Determine the display status and styling
        let displayStatus, statusClass;

        if (isActive === true) {
          displayStatus = 'Active';
          statusClass = 'bg-[#D0E2FF] text-[#2537A5]';
        } else if (isActive === false) {
          displayStatus = 'Inactive';
          statusClass = 'bg-[#FEE2E2] text-[#991B1B]';
        } else if (subscriptionStatus === 'suspended') {
          displayStatus = 'Suspended';
          statusClass = 'bg-red-200 text-red-600';
        } else if (subscriptionStatus === 'pending') {
          displayStatus = 'Pending';
          statusClass = 'bg-yellow-100 text-yellow-600';
        } else {
          displayStatus = 'Active';
          statusClass = 'bg-[#D0E2FF] text-[#2537A5]';
        }

        return (
          <span className={`px-3 pt-[10px] pb-[6px] rounded-full text-xs ${statusClass}`}>
            {displayStatus}
          </span>
        );
      }
    },
    {
      key: 'businessType',
      label: t.businessType,
      sortable: true,
      render: (row) => (
        <span className="font-bold">{row?.businessType || 'N/A'}</span>
      )
    },
    {
      key: 'businessName',
      label: t.businessName,
      sortable: true,
      render: (row) => row?.businessName || 'N/A'
    },
    {
      key: 'createdAt',
      label: t.joiningDate,
      sortable: true,
      render: (row) => {
        if (!row?.createdAt) return 'N/A';
        const date = new Date(row.createdAt);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    },
    {
      key: 'subscriptionPlan',
      label: t.plan,
      sortable: true,
      render: (row) => {
        const plan = row?.subscriptionPlan || 'Free';
        let color = 'bg-gray-200 text-gray-700';
        if (plan === 'premium') color = 'bg-[#F3E8FF] text-[#FF2380]';
        if (plan === 'standard') color = 'bg-[#D0E2FF] text-[#2537A5]';
        if (plan === 'basic') color = 'bg-[#3F588B] text-white';
        return <span className={`px-3 pt-[10px] pb-[6px] rounded-full text-xs ${color}`}>
          {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </span>;
      }
    },
    {
      key: 'subscriptionExpirationDate',
      label: t.expireDate,
      sortable: true,
      render: (row) => {
        if (!row?.subscriptionExpirationDate) return 'N/A';
        const date = new Date(row.subscriptionExpirationDate);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    },
  ];

  // Checkbox column update for select all
  const columnsWithCheckbox = [
    {
      ...columns[0],
      label: (
        <input
          type="checkbox"
          aria-label={t.selectAll}
          checked={pagedData.length > 0 && pagedData.every(isSelected)}
          onChange={onSelectAll}
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={isSelected(row)}
          onChange={() => onSelect(row)}
          aria-label={`${t.selectRow} ${row.name}`}
        />
      ),
    },
    ...columns.slice(1)
  ];

  // Date range display
  const dateLabel = (dateRange.startDate && dateRange.endDate)
    ? `${format(dateRange.startDate, 'dd MMM yy')} - ${format(dateRange.endDate, 'dd MMM yy')}`
    : t.joiningDate;

  // Loading state - only show if no data and loading is true
  if (loading && (!data || data.length === 0)) {
    return (
      <div className="p-4 md:p-6 dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl text-white">
        <div className="flex items-center justify-center h-64">
          <div className="loader"></div>
          <span className="ml-3 text-gray-300">{t.loadingUsers}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6 dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl text-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400 text-center">
            <p className="text-lg font-semibold mb-2">{t.errorLoadingUsers}</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 dark:bg-customBrown bg-white border border-gray-200 dark:border-customBorderColor rounded-2xl text-white">
      {/* Date Picker Popup */}

      {/* Table */}
      <CommonAdminTable
        columns={columnsWithCheckbox}
        data={pagedData}
        total={filteredData.length}
        searchValue={search}
        onSearchChange={val => { setSearch(val); setPage(1); }}
        roleValue={filterRole}
        roleOptions={roleOptions}
        onRoleChange={val => { setFilterRole(val); setPage(1); }}
        statusValue={filterStatus}
        statusOptions={statusOptions}
        onStatusChange={val => { setFilterStatus(val); setPage(1); }}
        planValue={filterPlan}
        planOptions={planOptions}
        onPlanChange={val => { setFilterPlan(val); setPage(1); }}
        dateRange={dateRange}
        onDateRangeChange={range => {
          setDateRange({ startDate: range.startDate, endDate: range.endDate });
          setPage(1);
        }}
        className=""
        currentPage={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSort={handleSort}
        renderActions={renderCustomActions}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onAddUser={handleAddUser}
      />
    </div>
  );
}

export default AdminUserTable;
