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
        /* Conversation List - Full Width */
        <div className="flex h-full flex-col">
          <div className="border-border/50 bg-card border-b p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tighter uppercase italic">
                Secure Inbox
              </h2>
              <div className="bg-primary/10 rounded-xl p-3">
                <MessageSquare className="text-primary h-6 w-6" />
              </div>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="bg-muted/30 placeholder:text-muted-foreground/50 focus:ring-primary/20 h-14 w-full rounded-2xl pr-4 pl-12 text-sm font-bold focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="mx-auto max-w-4xl space-y-4 p-8">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveTab(conv)}
                  className="group hover:bg-muted/50 border-border/20 bg-card flex w-full items-center gap-6 rounded-[2rem] border p-6 transition-all hover:scale-[1.01] hover:shadow-lg"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-16 w-16 rounded-[1.5rem] shadow-md ring-4 ring-white dark:ring-gray-800">
                      <AvatarImage src={conv.otherUser.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {conv.otherUser.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {conv.otherUser.online && (
                      <div className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-gray-900" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-lg font-black tracking-tight uppercase italic">
                        {conv.otherUser.name}
                      </h4>
                      <span className="text-muted-foreground text-[10px] font-black tracking-widest uppercase opacity-60">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Check size={14} className="shrink-0 text-cyan-500" />
                      <p className="text-muted-foreground truncate text-sm font-medium">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-3">
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary shadow-primary/20 rounded-full px-3 py-1 text-[10px] font-black text-white shadow-lg">
                        {conv.unreadCount} NEWS
                      </span>
                    )}
                    <ChevronLeft className="h-5 w-5 rotate-180 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-30" />
                  </div>
                </button>
              ))}
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
