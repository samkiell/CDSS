'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Phone,
  Video,
  Check,
  CheckCheck,
  MessageSquare,
  ChevronLeft,
  Circle,
} from 'lucide-react';
import {
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  ScrollArea,
  Badge,
} from '@/components/ui';
import { cn } from '@/lib/cn';

export default function MessagingClient({ currentUser, initialConversations = [] }) {
  const [activeTab, setActiveTab] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeTab) return;

    const newMessage = {
      _id: Date.now().toString(),
      content: message,
      senderId: currentUser.id,
      receiverId: activeTab.otherUser.id,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="bg-card border-border/50 h-[calc(100vh-12rem)] min-h-[600px] overflow-hidden rounded-[2.5rem] border shadow-2xl">
      {!activeTab ? (
        /* List View (Full Width) */
        <div className="flex h-full flex-col bg-[#0f172a] text-white">
          <div className="flex items-center justify-between p-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              Messages
            </h2>
            <div className="relative w-72">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                className="h-12 w-full rounded-xl border border-gray-800 bg-[#1e293b] pr-4 pl-12 text-sm font-medium placeholder:text-gray-500 focus:border-cyan-500/50 focus:outline-none"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="mx-auto max-w-5xl px-8 pb-8">
              <div className="overflow-hidden rounded-[2rem] border border-gray-800 bg-[#1e293b]/50">
                {conversations.map((conv, index) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveTab(conv)}
                    className={cn(
                      'flex w-full items-center gap-6 p-6 text-left transition-all hover:bg-[#1e293b]',
                      index !== conversations.length - 1 && 'border-b border-gray-800'
                    )}
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-14 w-14 rounded-full">
                        <AvatarImage src={conv.otherUser.avatar} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {conv.otherUser.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-lg font-black tracking-tight uppercase italic">
                          {conv.otherUser.name}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-gray-400">
                          {conv.unreadCount === 0 && (
                            <Check size={14} className="text-cyan-500" />
                          )}
                          <p className="truncate font-medium">{conv.lastMessage}</p>
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-black text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      ) : (
        /* Chat View - Full Width */
        <div className="flex h-full flex-col">
          {/* Header */}
          <header className="border-border/50 bg-card z-10 flex items-center justify-between border-b p-6">
            <div className="flex items-center gap-5">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted/50 h-12 w-12 rounded-xl"
                onClick={() => setActiveTab(null)}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <div className="relative">
                <Avatar className="ring-primary/10 h-14 w-14 rounded-2xl ring-2">
                  <AvatarImage src={activeTab.otherUser.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {activeTab.otherUser.name[0]}
                  </AvatarFallback>
                </Avatar>
                {activeTab.otherUser.online && (
                  <div className="ring-card absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-emerald-500 ring-2" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tighter uppercase italic">
                  {activeTab.otherUser.name}
                </h3>
                <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
                  <Circle className="h-1.5 w-1.5 fill-current" />
                  Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 sm:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/50 rounded-xl"
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/50 rounded-xl"
                >
                  <Video className="h-5 w-5" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-muted/50 rounded-xl"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Messages */}
          <ScrollArea className="bg-muted/5 flex-1 p-8">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40"
                >
                  Secure Communication Established
                </Badge>
              </div>

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <MessageSquare className="mb-4 h-16 w-16" />
                  <p className="text-lg font-black uppercase italic">
                    No message history
                  </p>
                  <p className="text-sm">Start your clinical inquiry below.</p>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m._id}
                    className={cn(
                      'group flex max-w-[85%] flex-col',
                      m.senderId === currentUser.id ? 'ml-auto items-end' : 'items-start'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-[2rem] p-6 shadow-sm transition-all duration-300',
                        m.senderId === currentUser.id
                          ? 'bg-primary hover:shadow-primary/10 rounded-tr-none text-white hover:shadow-lg'
                          : 'dark:bg-muted border-border/50 rounded-tl-none border bg-white hover:shadow-lg'
                      )}
                    >
                      <p className="font-sans text-[15px] leading-relaxed">{m.content}</p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 px-2">
                      <span className="text-muted-foreground text-[9px] font-black tracking-widest uppercase opacity-40">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {m.senderId === currentUser.id &&
                        (m.isRead ? (
                          <CheckCheck className="text-primary h-3.5 w-3.5 opacity-60" />
                        ) : (
                          <Check className="text-muted-foreground h-3.5 w-3.5 opacity-40" />
                        ))}
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <footer className="bg-card border-border/50 border-t p-8">
            <form
              onSubmit={handleSendMessage}
              className="relative mx-auto flex max-w-4xl items-center gap-5"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-muted/50 h-16 w-16 shrink-0 rounded-[1.5rem]"
              >
                <Paperclip className="text-muted-foreground h-6 w-6" />
              </Button>

              <div className="group relative flex-1">
                <div className="from-primary/20 absolute -inset-1 rounded-[1.5rem] bg-gradient-to-r to-indigo-500/20 opacity-0 blur transition duration-500 group-focus-within:opacity-100"></div>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type clinical inquiry here..."
                  className="bg-muted/30 focus:ring-primary/20 relative h-16 w-full rounded-[1.5rem] border-none px-8 font-sans text-sm transition-all focus:ring-2 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary absolute top-1/2 right-3 h-12 w-12 -translate-y-1/2 rounded-xl"
                >
                  <Smile className="h-6 w-6" />
                </Button>
              </div>

              <Button
                type="submit"
                disabled={!message.trim()}
                className="bg-primary shadow-primary/30 h-16 w-16 shrink-0 rounded-[1.5rem] text-white shadow-2xl transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-6 w-6" />
              </Button>
            </form>
          </footer>
        </div>
      )}
    </div>
  );
}
