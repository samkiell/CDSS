'use client';
import { Calendar, Sparkles, FileText, ClipboardList, Clock } from 'lucide-react';
import { useState } from 'react';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('All');

  const notifications = [
    {
      id: 1,
      type: 'Appointments',
      title: 'Appointment Confirmed',
      description: 'Your physiotherapist appointment is scheduled for 3:00pm tomorrow',
      status: 'Unread',
      timeAgo: '10 mins ago',
      icon: Calendar,
      color: 'green',
    },
    {
      id: 2,
      type: 'Assessments',
      title: 'AI Review Completed',
      description: 'Your physiotherapist appointment is scheduled for 3:00pm tomorrow',
      status: 'Read',
      timeAgo: '10 mins ago',
      icon: Sparkles,
      color: 'pink',
    },
    {
      id: 3,
      type: 'Treatments',
      title: 'Tests Results',
      description: 'Your physiotherapist appointment is scheduled for 3:00pm tomorrow',
      status: 'Unread',
      timeAgo: '10 mins ago',
      icon: FileText,
      color: 'yellow',
    },
    {
      id: 4,
      type: 'Assessments',
      title: 'Assessments Pending',
      description: 'Your physiotherapist appointment is scheduled for 3:00pm tomorrow',
      status: 'Unread',
      timeAgo: '10 mins ago',
      icon: ClipboardList,
      color: 'blue',
    },
  ];

  const tabs = ['All', 'Assessments', 'Appointments', 'Treatments'];

  const filteredNotifications =
    activeTab === 'All'
      ? notifications
      : notifications.filter((notif) => notif.type === activeTab);

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-500 text-white',
      pink: 'bg-pink-500 text-white',
      yellow: 'bg-yellow-400 text-white',
      blue: 'bg-blue-400 text-white',
    };
    return colors[color] || 'bg-gray-500 text-white';
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-100">
          Notifications
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Stay updated on your assessments, appointments, and treatment progress
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-6 overflow-x-auto sm:gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer pb-2.5 text-sm font-medium whitespace-nowrap transition-all sm:text-base ${
                activeTab === tab
                  ? 'border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`flex cursor-pointer items-start justify-between gap-3 rounded-lg p-4 transition-transform hover:scale-[1.01] sm:gap-4 sm:p-5 ${getColorClasses(notification.color)}`}
            >
              {/* Left side - Icon and content */}
              <div className="flex flex-1 items-start gap-3 sm:gap-4">
                {/* Icon */}
                <div className="shrink-0">
                  <Icon size={20} className="sm:h-6 sm:w-6" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold sm:text-base">
                    {notification.title}
                  </h3>
                  <p className="mt-1 text-xs opacity-90 sm:text-sm">
                    {notification.description}
                  </p>
                </div>
              </div>

              {/* Right side - Status and time */}
              <div className="flex shrink-0 flex-col items-end gap-1 sm:gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                  <span className="text-xs font-medium sm:text-sm">
                    {notification.status}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} className="sm:h-3.5 sm:w-3.5" />
                  <span className="text-xs opacity-90">{notification.timeAgo}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
