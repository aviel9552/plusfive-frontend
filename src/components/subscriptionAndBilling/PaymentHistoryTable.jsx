import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import paymentHistoryData from '../../jsonData/PaymentHistoryData.json';
import { LuCheck } from 'react-icons/lu';
import { IoMdDownload } from 'react-icons/io';
import HistoryTable from '../commonComponent/HistoryTable';
import CommonOutlineButton from '../commonComponent/CommonOutlineButton';

const PaymentHistoryTable = () => {
    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(7);

    const filterOptions = ['All', 'Paid', 'Decline', 'Pending'];

    const filteredData = useMemo(() => {
        let data = paymentHistoryData;
        
        if (filterValue !== 'All') {
            data = data.filter(item => item.status === filterValue);
        }

        if (searchValue) {
            data = data.filter(item => 
                item.invoiceId.toLowerCase().includes(searchValue.toLowerCase())
            );
        }
        return data;
    }, [searchValue, filterValue]);

    const paginatedAndMappedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const paginated = filteredData.slice(start, end);

        const getStatusClassName = (status) => {
            switch (status) {
                case 'Paid': return 'text-[#5965F9]';
                case 'Decline': return 'text-red-500';
                case 'Pending': return 'text-yellow-500';
                default: return 'text-gray-500';
            }
        };

        const getStatusBarClassName = (status) => {
            switch (status) {
                case 'Paid': return 'bg-gradient-to-r from-[#DF64CC] to-[#FE5D39]';
                case 'Decline': return 'bg-red-500';
                case 'Pending': return 'bg-yellow-500';
                default: return 'bg-gray-500';
            }
        };

        return paginated.map(item => ({
            icon: <LuCheck className="text-white" size={20} />,
            title: item.invoiceId,
            subtitle: item.date,
            value: `$${item.amount}`,
            statusInfo: {
                text: item.status,
                className: getStatusClassName(item.status),
            },
            action: (
                <CommonOutlineButton
                onClick={() => console.log(`Downloading ${item.invoiceId}`)}
                className="!text-sm !py-1.5 !px-4 w-auto rounded-lg"
                text="Download"
                icon={<IoMdDownload />}
            />
            )
        }));
    }, [filteredData, currentPage, pageSize]);
    
    return (
        <div className="bg-white dark:bg-customBrown p-4 sm:p-6 rounded-2xl border border-gray-200 dark:border-customBorderColor dark:hover:bg-customBlack shadow-md hover:shadow-sm">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Payment History</h2>
            
            <HistoryTable 
                data={paginatedAndMappedData}
                total={filteredData.length}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                }}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                filterValue={filterValue}
                filterOptions={filterOptions}
                onFilterChange={setFilterValue}
            />
        </div>
    );
};

export default PaymentHistoryTable; 