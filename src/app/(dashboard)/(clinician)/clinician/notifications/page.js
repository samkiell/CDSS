import { Bell, MessageSquare, ClipboardPlus, Info, CheckCircle2 } from 'lucide-react';

const notifications = [
  {
    id: 1,
    title: 'New Patient Assessment',
    description: 'David Adeleke has completed a new lower back pain assessment.',
    time: '5m ago',
    type: 'assessment',
    isRead: false,
  },
  {
    id: 2,
    title: 'New Message',
    description: 'You have a new message from Dr. Ajayi regarding Case #1204.',
    time: '1h ago',
    type: 'message',
    isRead: false,
  },
  {
    id: 3,
    title: 'Case Update',
    description: 'The MRI results for Sarah Johnson have been uploaded.',
    time: '3h ago',
    type: 'update',
    isRead: true,
  },
  {
    id: 4,
    title: 'System Maintenance',
    description: 'The CDSS platform will be undergoing maintenance tonight at 11 PM.',
    time: '5h ago',
    type: 'system',
    isRead: true,
  },
  {
    id: 5,
    title: 'Treatment Plan Approved',
    description: 'Michael Chen has approved the proposed physical therapy plan.',
    time: 'Yesterday',
    type: 'assessment',
    isRead: true,
  },
];

const getIcon = (type) => {
  switch (type) {
    case 'assessment': return <ClipboardPlus className="h-5 w-5 text-blue-500" />;
    case 'message': return <MessageSquare className="h-5 w-5 text-green-500" />;
    case 'update': return <CheckCircle2 className="h-5 w-5 text-purple-500" />;
    case 'system': return <Info className="h-5 w-5 text-amber-500" />;
    default: return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

export default function ClinicianNotificationsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Stay updated with your patients and system activities.</p>
        </div>
        <button className="text-sm font-medium text-cyan-600 hover:text-cyan-700 dark:text-cyan-400">
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`relative flex items-start gap-4 rounded-xl border p-5 transition hover:shadow-md ${
              notification.isRead 
                ? 'border-gray-100 bg-white/50 dark:border-gray-700 dark:bg-gray-800/50' 
                : 'border-cyan-100 bg-cyan-50/30 dark:border-cyan-900/30 dark:bg-cyan-900/10'
            }`}
          >
            {!notification.isRead && (
              <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-cyan-500" />
            )}
            
            <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              notification.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-cyan-100 dark:bg-cyan-900/30'
            }`}>
              {getIcon(notification.type)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${notification.isRead ? 'text-gray-800 dark:text-gray-200' : 'text-gray-900 dark:text-gray-100'}`}>
                  {notification.title}
                </h3>
                <span className="text-xs text-gray-400 dark:text-gray-500">{notification.time}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {notification.description}
              </p>
              {!notification.isRead && (
                <div className="mt-3 flex gap-4">
                  <button className="text-xs font-semibold text-cyan-600 transition hover:text-cyan-700 dark:text-cyan-400">
                    View Details
                  </button>
                  <button className="text-xs font-semibold text-gray-400 transition hover:text-gray-500 dark:text-gray-500">
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
