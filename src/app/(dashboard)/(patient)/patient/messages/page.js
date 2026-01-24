import { Check } from 'lucide-react';
const conversations = [
  {
    id: 1,
    name: 'Dr Ajayi',
    lastMessage: 'How are you today David?',
    unreadCount: 12,
    timeAgo: 'Yesterday',
  },
  {
    id: 2,
    name: 'Dr Isaac',
    lastMessage: 'How are you today David?',
    unreadCount: 10,
    timeAgo: '2d ago',
  },
  {
    id: 3,
    name: 'Dr Bull',
    lastMessage: 'How are you today David?',
    unreadCount: 21,
    timeAgo: '2d ago',
  },
  {
    id: 4,
    name: 'Dr Olufemi',
    lastMessage: 'How are you today David?',
    unreadCount: 0,
    timeAgo: '2d ago',
  },
  {
    id: 5,
    name: 'Dr Dayo',
    lastMessage: 'How are you today David?',
    unreadCount: 0,
    timeAgo: '2d ago',
  },
];
export default function Page() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-gray-200">Messages</h1>
      </div>

      {/* Messages List */}
      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm dark:bg-gray-800">
        {conversations.map((conversation, index) => (
          <div
            key={conversation.id}
            className={`flex cursor-pointer items-center justify-between p-6 transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
              index !== conversations.length - 1
                ? 'border-b border-gray-100 dark:border-gray-700'
                : ''
            }`}
          >
            {/* Left side - Avatar and text */}
            <div className="flex flex-1 items-center gap-4">
              {/* Avatar */}
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.name}`}
                  alt={conversation.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Text content */}
              <div className="flex-1">
                <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {conversation.name}
                </h3>
                <p className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Check size={16} className="text-cyan-500" />
                  {conversation.lastMessage}
                </p>
              </div>
            </div>

            {/* Right side - Unread count and time */}
            <div className="flex flex-col items-end gap-2">
              {conversation.unreadCount > 0 && (
                <span className="rounded-full bg-cyan-500 px-2.5 py-1 text-xs font-semibold text-white">
                  {conversation.unreadCount}
                </span>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {conversation.timeAgo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
