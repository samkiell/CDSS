import { Check, Search } from 'lucide-react';
import { Input } from '@/components/ui';

const patientConversations = [
  {
    id: 1,
    name: 'David Adeleke',
    lastMessage: 'The pain in my lower back has reduced, thank you.',
    unreadCount: 2,
    timeAgo: '10m ago',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    lastMessage: 'When is our next session scheduled?',
    unreadCount: 0,
    timeAgo: '2h ago',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: 3,
    name: 'Michael Chen',
    lastMessage: 'I uploaded the scan reports you requested.',
    unreadCount: 5,
    timeAgo: 'Yesterday',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  },
  {
    id: 4,
    name: 'Aisha Bello',
    lastMessage: 'Is it normal to feel stiff after the exercise?',
    unreadCount: 0,
    timeAgo: '2d ago',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha',
  },
  {
    id: 5,
    name: 'Robert Wilson',
    lastMessage: 'Thank you for the prescription.',
    unreadCount: 0,
    timeAgo: '3d ago',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
  },
];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search patients..." className="pl-10" />
        </div>
      </div>

      {/* Messages List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {patientConversations.map((conversation, index) => (
          <div
            key={conversation.id}
            className={`flex cursor-pointer items-center justify-between p-5 transition hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
              index !== patientConversations.length - 1
                ? 'border-b border-gray-100 dark:border-gray-700'
                : ''
            }`}
          >
            {/* Left side - Avatar and text */}
            <div className="flex flex-1 items-center gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-200 dark:border-gray-700 dark:bg-gray-600">
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Text content */}
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {conversation.timeAgo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1 truncate text-sm text-gray-600 dark:text-gray-400">
                    {conversation.unreadCount === 0 && (
                      <Check size={14} className="text-cyan-500" />
                    )}
                    <span
                      className={
                        conversation.unreadCount > 0
                          ? 'font-medium text-gray-900 dark:text-gray-200'
                          : ''
                      }
                    >
                      {conversation.lastMessage}
                    </span>
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
