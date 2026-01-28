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
  User,
  MessageSquare,
  ChevronLeft,
  Circle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  ScrollArea,
  Badge,
} from '@/components/ui';
import { cn } from '@/lib/cn';

export default function MessagingClient({ currentUser, initialConversations = [] }) {
  const [activeTab, setActiveTab] = useState(initialConversations[0] || null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

    // In a real app, we would call an API/Server Action here
    // const result = await sendMessageAction(newMessage);
  };

  return (
    <div className="bg-card border-border/50 flex h-[calc(100vh-12rem)] min-h-150 overflow-hidden rounded-[2.5rem] border shadow-2xl">
      {/* Sidebar: User List */}
      <aside
        className={cn(
          'border-border/50 bg-muted/10 flex-col border-r transition-all duration-300',
          isSidebarOpen ? 'flex w-80' : 'hidden w-0 md:flex md:w-20'
        )}
      >
        <div className="border-border/50 bg-card border-b p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2
              className={cn(
                'text-xl font-black tracking-tighter uppercase italic',
                !isSidebarOpen && 'hidden'
              )}
            >
              Messages
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </div>
          {isSidebarOpen && (
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-muted/30 placeholder:text-muted-foreground/50 h-10 w-full rounded-xl pr-4 pl-10 text-xs font-bold focus:outline-none"
              />
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 p-4">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveTab(conv)}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-[1.5rem] p-4 transition-all',
                  activeTab?.id === conv.id
                    ? 'bg-primary shadow-primary/20 text-white shadow-lg'
                    : 'hover:bg-muted/50 text-foreground'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 rounded-2xl ring-2 ring-white/10">
                    <AvatarImage src={conv.otherUser.avatar} />
                    <AvatarFallback
                      className={cn(
                        'bg-primary/10 font-bold',
                        activeTab?.id === conv.id
                          ? 'bg-white/20 text-white'
                          : 'text-primary'
                      )}
                    >
                      {conv.otherUser.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {conv.otherUser.online && (
                    <div className="group-hover:ring-muted absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white transition-all" />
                  )}
                </div>
                {isSidebarOpen && (
                  <div className="min-w-0 flex-1 text-left">
                    <div className="mb-1 flex items-start justify-between">
                      <span className="truncate text-sm font-black tracking-tight uppercase italic">
                        {conv.otherUser.name}
                      </span>
                      <span
                        className={cn(
                          'text-[8px] font-black tracking-widest uppercase opacity-60',
                          activeTab?.id === conv.id
                            ? 'text-white'
                            : 'text-muted-foreground'
                        )}
                      >
                        {conv.lastMessageTime}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'truncate text-[10px] font-medium opacity-70',
                        activeTab?.id === conv.id
                          ? 'text-white/80'
                          : 'text-muted-foreground'
                      )}
                    >
                      {conv.lastMessage}
                    </p>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main: Chat View */}
      <main className="bg-card flex flex-1 flex-col">
        {activeTab ? (
          <>
            {/* Header */}
            <header className="border-border/50 bg-card z-10 flex items-center justify-between border-b p-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl md:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <Avatar className="ring-primary/10 h-12 w-12 rounded-2xl ring-2">
                    <AvatarImage src={activeTab.otherUser.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {activeTab.otherUser.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ring-card absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-emerald-500 ring-2" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tighter uppercase italic">
                    {activeTab.otherUser.name}
                  </h3>
                  <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-emerald-500 uppercase">
                    <Circle className="h-1.5 w-1.5 fill-current" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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
              <div className="mx-auto max-w-4xl space-y-6">
                {messages.map((m) => (
                  <div
                    key={m._id}
                    className={cn(
                      'group flex max-w-[80%] flex-col',
                      m.senderId === currentUser.id ? 'ml-auto items-end' : 'items-start'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-[1.5rem] p-5 shadow-sm transition-all duration-300',
                        m.senderId === currentUser.id
                          ? 'bg-primary hover:shadow-primary/10 rounded-tr-none text-white hover:shadow-lg'
                          : 'dark:bg-muted border-border/50 rounded-tl-none border bg-white hover:shadow-lg'
                      )}
                    >
                      <p className="font-sans text-sm leading-relaxed">{m.content}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 px-1">
                      <span className="text-muted-foreground text-[8px] font-black tracking-widest uppercase opacity-40">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {m.senderId === currentUser.id &&
                        (m.isRead ? (
                          <CheckCheck className="text-primary h-3 w-3 opacity-60" />
                        ) : (
                          <Check className="text-muted-foreground h-3 w-3 opacity-40" />
                        ))}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <footer className="bg-card border-border/50 border-t p-6">
              <form
                onSubmit={handleSendMessage}
                className="relative mx-auto flex max-w-4xl items-center gap-4"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-muted/50 h-14 w-14 shrink-0 rounded-2xl"
                >
                  <Paperclip className="text-muted-foreground h-5 w-5" />
                </Button>
                <div className="group relative flex-1">
                  <div className="from-primary/10 absolute -inset-1 rounded-2xl bg-gradient-to-r to-indigo-500/10 opacity-0 blur transition duration-500 group-focus-within:opacity-100"></div>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type clinical inquiry here..."
                    className="bg-muted/30 focus:ring-primary/20 relative h-14 w-full rounded-2xl border-none px-6 font-sans text-sm transition-all focus:ring-2 focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary absolute top-1/2 right-2 h-10 w-10 -translate-y-1/2 rounded-xl"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-primary shadow-primary/20 h-14 w-14 shrink-0 rounded-2xl text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 opacity-40">
            <div className="bg-muted/50 flex h-24 w-24 items-center justify-center rounded-[2rem]">
              <MessageSquare className="h-10 w-10" />
            </div>
            <div className="text-center">
              <h4 className="text-2xl font-black tracking-tighter uppercase italic">
                Select Conversation
              </h4>
              <p className="text-sm font-medium">
                Connect with your assigned clinician or patient.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
