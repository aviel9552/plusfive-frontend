import React, { useState } from 'react';
import { FiInfo, FiCheckCircle, FiX } from 'react-icons/fi';
import { CommonButton } from '../index';

const initialNotifications = [
    {
        id: 1,
        type: 'info',
        title: 'Payment Reminder',
        message: 'Monthly bill of $29 will be charged tomorrow',
        timestamp: '04-06-2025, 14:20'
    },
    {
        id: 2,
        type: 'success',
        title: 'New Booking',
        message: 'New customer booked a facial treatment',
        timestamp: '04-06-2025, 14:20'
    },
    {
        id: 3,
        type: 'error',
        title: 'Payment Decline',
        message: 'Your last payment for a facial treatment is decline.',
        timestamp: '04-06-2025, 14:20'
    }
];

const iconMap = {
    info: <FiInfo />,
    success: <FiCheckCircle />,
    error: <FiInfo />
};

const iconColorMap = {
    info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    success: 'text-green-400 bg-green-500/10 border-green-500/20',
    error: 'text-red-400 bg-red-500/10 border-red-500/20'
};

function NotificationItem({ notification, onDismiss }) {
    const { type, title, message, timestamp } = notification;
    const icon = iconMap[type];
    const colorClasses = iconColorMap[type];

    return (
        <div className="dark:bg-[#121212] bg-gray-50 p-4 rounded-xl flex items-start gap-4 border border-gray-200 dark:border-customBorderColor">
            <div className={`p-2 rounded-full border ${colorClasses}`}>
                {React.cloneElement(icon, { className: "w-5 h-5" })}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-xl">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{message}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{timestamp}</p>
            </div>
            <div className="flex items-center gap-4">
                <button className="text-sm dark:text-white text-black border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Mark as Read</button>
                <button onClick={() => onDismiss(notification.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500 transition-colors">
                    <FiX className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

function RecentNotifications() {
    const [notifications, setNotifications] = useState(initialNotifications);

    const handleDismiss = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const handleMarkAllAsRead = () => {
        setNotifications([]);
    };

    return (
        <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor mt-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Recent Notifications</h2>
                <CommonButton
                    text="Mark All as Read"
                    onClick={handleMarkAllAsRead}
                    className="!text-white py-2 px-4 rounded-lg text-xl"
                />
            </div>
            <div className="space-y-4">
                {notifications.map(notification => (
                    <NotificationItem key={notification.id} notification={notification} onDismiss={handleDismiss} />
                ))}
            </div>
        </div>
    );
}

export default RecentNotifications;