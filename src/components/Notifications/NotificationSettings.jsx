import React, { useState } from 'react';

const ToggleSwitch = ({ isEnabled, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors duration-300 focus:outline-none ${isEnabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
        >
            <span
                className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
};

const NotificationRow = ({ label, isEnabled, onToggle }) => (
    <div className="flex justify-between items-center py-3">
        <span className="text-xl">{label}</span>
        <ToggleSwitch isEnabled={isEnabled} onToggle={onToggle} />
    </div>
);

function NotificationSettings() {
    const [settings, setSettings] = useState({
        email: true,
        push: true,
        sms: false,
        booking: true,
        payment: true,
        review: true,
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const notificationItems = [
        { key: 'email', label: 'Email Notifications' },
        { key: 'push', label: 'Push Notifications' },
        { key: 'sms', label: 'SMS Notifications' },
        { key: 'booking', label: 'Booking Alerts' },
        { key: 'payment', label: 'Payment Alerts' },
        { key: 'review', label: 'Review Alerts' },
    ];

    return (
        <div className="dark:bg-customBrown bg-white p-8 rounded-2xl text-black dark:text-white border border-gray-200 dark:border-customBorderColor">
            <h2 className="text-3xl font-bold mb-8">Notification Settings</h2>
            <div>
                {notificationItems.map(item => (
                    <NotificationRow
                        key={item.key}
                        label={item.label}
                        isEnabled={settings[item.key]}
                        onToggle={() => handleToggle(item.key)}
                    />
                ))}
            </div>
        </div>
    );
}

export default NotificationSettings;
