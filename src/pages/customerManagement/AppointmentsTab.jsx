import React from 'react';
import { formatDate, formatTime, formatDateTime, formatDateRange } from '../../utils/dateFormatter';

const AppointmentsTab = ({ customer, t }) => {
    return (
        <div className="space-y-4 md:space-y-6">
            {/* Appointment Statistics */}
            <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">{t.appointmentSummary}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                    <div className="text-center">
                        <p className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {customer.totalAppointmentCount || 0}
                        </p>
                        <p className="text-xs md:text-sm text-black dark:text-white">{t.totalAppointments}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
                            {customer.appointments?.length || 0}
                        </p>
                        <p className="text-xs md:text-sm text-black dark:text-white">{t.detailedRecords}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
                            ₪{customer.totalSpent || 0}
                        </p>
                        <p className="text-xs md:text-sm text-black dark:text-white">{t.totalSpent}</p>
                    </div>
                </div>
            </div>

            {/* Last Appointment Details */}
            {customer.lastAppointmentDetails && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 md:p-6 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400">📅</span>
                        {t.lastAppointment}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-black dark:text-white">{t.dateTime}</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formatDateTime(customer.lastAppointmentDetails.startDate)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-black dark:text-white">{t.services}</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {customer.lastAppointmentDetails.selectedServices || 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* All Appointments */}
            <div className="bg-gray-50 dark:bg-black p-4 md:p-6 rounded-lg">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-6">
                    {t.allAppointments} ({customer.appointments?.length || 0})
                </h2>
                {customer.appointments && customer.appointments.length > 0 ? (
                    <div className="space-y-4">
                        {customer.appointments.map((appointment, index) => (
                            <div key={appointment.id || index} className="bg-white dark:bg-customBrown p-4 md:p-6 rounded-lg border dark:border-customBorderColor">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                    <div className="flex items-center gap-3 justify-between">
                                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                                            <span className="text-blue-600 dark:text-blue-400 font-semibold">#{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {formatDate(appointment.startDate)}
                                            </p>
                                            <p className="text-sm text-black dark:text-white">
                                                {formatDateRange(appointment.startDate, appointment.endDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="md:text-right md:block flex items-center gap-2 justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {t.duration}: {appointment.duration || 'N/A'}
                                            </p>
                                            {appointment.createdAt && (
                                                <>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                                        {formatDate(appointment.createdAt)}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                                        {formatTime(appointment.createdAt)}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                        {appointment.source && (
                                            <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded">
                                                {appointment.source}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <p className="text-sm text-black dark:text-white font-medium">{t.services}:</p>
                                        <p className="text-sm text-gray-900 dark:text-white break-words">
                                            {appointment.selectedServices || customer.selectedServices || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-black dark:text-white font-medium">{t.appointmentId}:</p>
                                        <p className="font-mono text-xs text-black dark:text-white break-all">
                                            {appointment.id}
                                        </p>
                                    </div>
                                </div>

                                {appointment.notes && (
                                    <div className="mt-4 bg-gray-50 dark:bg-customBlack p-3 rounded">
                                        <p className="text-sm text-black dark:text-white font-medium">{t.notes}:</p>
                                        <p className="text-sm text-black dark:text-white mt-1">{appointment.notes}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📅</div>
                        <p className="text-black dark:text-white text-lg">{t.noAppointmentsFound}</p>
                        <p className="text-black dark:text-white text-sm mt-2">{t.noAppointmentRecords}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentsTab;

