'use client';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: 1,
      text: 'Hello David, how are you feeling today? Your X-ray results just got in today should I send it to you?',
      sender: 'doctor',
      time: '10:18',
      isRead: true,
    },
    {
      id: 2,
      text: "Yes sir, I'm good. Please send the result, thank you",
      sender: 'patient',
      time: '11:20',
      isRead: true,
    },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => router.back()}
          className="cursor-pointer text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft size={20} className="sm:h-6 sm:w-6" />
        </button>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-300 sm:h-10 sm:w-10 dark:bg-gray-600">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dr Ajayi"
              alt="Dr Ajayi"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base dark:text-gray-100">
              Dr Ajayi
            </h2>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
        <div className="mb-4 text-center sm:mb-6">
          <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            9th July 2025
          </span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'doctor' && (
                <div className="mr-1.5 h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gray-300 sm:mr-2 sm:h-8 sm:w-8 dark:bg-gray-600">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dr Ajayi"
                    alt="Dr Ajayi"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div
                className={`max-w-70 rounded-lg px-3 py-2.5 sm:max-w-md sm:rounded-xl sm:px-4 sm:py-3 ${
                  msg.sender === 'patient'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <p className="text-xs sm:text-sm">{msg.text}</p>
                <div className="mt-1 flex items-center justify-end gap-1">
                  <span
                    className={`text-xs ${
                      msg.sender === 'patient'
                        ? 'text-cyan-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                  {msg.sender === 'patient' && msg.isRead && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-cyan-100"
                    >
                      <path
                        d="M13.5 4L6 11.5L2.5 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M11.5 4L4 11.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {msg.sender === 'patient' && (
                <div className="ml-1.5 h-6 w-6 shrink-0 overflow-hidden rounded-full bg-gray-300 sm:ml-2 sm:h-8 sm:w-8 dark:bg-gray-600">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=David"
                    alt="You"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <Paperclip size={18} className="sm:h-5 sm:w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="type here..."
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-800 placeholder-gray-500 focus:border-cyan-500 focus:outline-none sm:rounded-full sm:px-4 sm:py-2.5 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
          />
          <button
            onClick={handleSendMessage}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-white hover:bg-cyan-600 sm:h-10 sm:w-10"
          >
            <Send size={16} className="sm:h-4.5 sm:w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
