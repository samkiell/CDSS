'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  User,
  X,
} from 'lucide-react';
import {
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Lightbox,
  StatusModal,
} from '@/components/ui';
import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import { cn } from '@/lib/cn';
import {
  getMessages,
  sendMessage,
  markAsRead,
  clearMessages,
  getConversations,
} from '@/lib/actions/messages';

import { usePresencePing } from '@/hooks/usePresencePing';

export default function MessagingClient({ currentUser, initialConversations = [] }) {
  // Active presence ping when in this component
  usePresencePing(true);

  const [activeTab, setActiveTab] = useState(null);
  const [presence, setPresence] = useState(null);
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const msgCountRef = useRef(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedImage, setExpandedImage] = useState(null);

  // Derive active conversation details from the updated list to reflect real-time status
  const activeConversation =
    conversations.find((c) => c.id === activeTab?.id) || activeTab;

  const emojis = ['😊', '👍', '🙏', '🏥', '💊', '👋', '❤️', '📍', '✅', '❌', '🤔', '💪'];

  const filteredConversations = useMemo(() => {
    return conversations.filter((c) =>
      c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Sync state with props
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Auto-scroll to bottom of messages (Smart Scroll)
  useEffect(() => {
    if (messages.length > 0) {
      const isInitialLoad = msgCountRef.current === 0;
      const isNewMsgFromMe = messages[messages.length - 1]?.senderId === currentUser.id;

      // Check if user is near bottom
      const container = scrollContainerRef.current;
      const isNearBottom = container
        ? container.scrollHeight - container.scrollTop - container.clientHeight < 150
        : true;

      if (isInitialLoad || isNewMsgFromMe || isNearBottom) {
        // Use a small timeout to ensure DOM has updated
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollIntoView({
              behavior: isInitialLoad ? 'auto' : 'smooth',
            });
          }
        }, 100);
      }
      msgCountRef.current = messages.length;
    }
  }, [messages, currentUser.id]);

  // Reset message count when switching conversations
  useEffect(() => {
    msgCountRef.current = 0;
  }, [activeTab]);

  // Fetch messages when tab changes
  useEffect(() => {
    if (activeTab) {
      const fetchMessages = async () => {
        setIsLoadingMessages(true);
        try {
          const msgs = await getMessages(activeTab.otherUser.id);
          setMessages(msgs);
          await markAsRead(activeTab.otherUser.id);

          // Reset unread count locally
          setConversations((prev) =>
            prev.map((c) => (c.id === activeTab.id ? { ...c, unreadCount: 0 } : c))
          );
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        } finally {
          setIsLoadingMessages(false);
        }
      };

      fetchMessages();

      // Poll for new messages and status updates
      const interval = setInterval(async () => {
        try {
          // 1. Fetch messages
          const msgs = await getMessages(activeTab.otherUser.id);
          setMessages((prev) => {
            if (msgs.length !== prev.length) return msgs;
            return prev;
          });

          // 2. Fetch updated conversations (Status logic)
          const updatedConvs = await getConversations();
          setConversations(updatedConvs);
        } catch (error) {
          console.error('Polling failed:', error);
        }
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeTab]);

  // Fetch real-time presence
  useEffect(() => {
    if (!activeTab?.otherUser?.id) {
      setPresence(null);
      return;
    }

    const fetchPresence = async () => {
      try {
        const res = await fetch(`/api/presence/${activeTab.otherUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setPresence(data);
        }
      } catch (error) {
        console.error('Failed to fetch presence:', error);
      }
    };

    fetchPresence();
    const interval = setInterval(fetchPresence, 30000); // 30s refresh

    return () => clearInterval(interval);
  }, [activeTab?.otherUser?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeTab) return;

    const content = message;
    setMessage('');
    setShowEmojiPicker(false);

    try {
      const sentMsg = await sendMessage(activeTab.otherUser.id, content);
      setMessages((prev) => [...prev, sentMsg]);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeTab.id
            ? { ...c, lastMessage: content, lastMessageTime: 'Just now' }
            : c
        )
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeTab) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // For now, we simulate the upload success on client side or use a generic endpoint if available
      // In a real app, you'd call a server action that uploads to Cloudinary
      // Let's assume we have a simple /api/upload for now or we just mock the result
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        // Send a message with the image URL
        const sentMsg = await sendMessage(activeTab.otherUser.id, `IMAGE:${data.url}`);
        setMessages((prev) => [...prev, sentMsg]);

        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeTab.id
              ? { ...c, lastMessage: 'Sent an image', lastMessageTime: 'Just now' }
              : c
          )
        );
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    // Remove "Dr " or "Dr. " prefix for initials if present
    const cleanName = name.replace(/^Dr\.?\s+/i, '');
    const parts = cleanName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });

  const handleClearHistory = () => {
    if (!activeTab) return;

    setStatusModal({
      isOpen: true,
      type: 'warning',
      title: 'Clear History',
      message:
        'Are you sure you want to clear this conversation history? This action cannot be undone.',
      confirmText: 'Clear Conversation',
      onConfirm: async () => {
        try {
          const result = await clearMessages(activeTab.otherUser.id);
          if (result.success) {
            setMessages([]);
            // Update last message in conversation list
            setConversations((prev) =>
              prev.map((c) =>
                c.id === activeTab.id
                  ? { ...c, lastMessage: 'No messages yet', lastMessageTime: '' }
                  : c
              )
            );
            setStatusModal((prev) => ({ ...prev, isOpen: false }));
          }
        } catch (error) {
          console.error('Failed to clear history:', error);
          // Optionally show error modal here
        }
      },
    });
  };

  return (
    <div className="bg-card border-border/50 h-[calc(100vh-8rem)] min-h-[500px] overflow-hidden rounded-3xl border shadow-2xl md:h-[calc(100vh-12rem)] md:rounded-[2.5rem]">
      {!activeTab ? (
        /* Conversation List - Full Width */
        <div className="flex h-full flex-col">
          <div className="border-border/50 bg-card border-b p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight uppercase">Secure Inbox</h2>
              <div className="bg-primary/10 rounded-xl p-2">
                <MessageSquare className="text-primary h-5 w-5" />
              </div>
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted/30 placeholder:text-muted-foreground/50 focus:ring-primary/20 h-10 w-full rounded-xl pr-4 pl-10 text-xs font-semibold focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="mx-auto max-w-4xl space-y-4 p-8">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveTab(conv)}
                    className="group hover:bg-muted/50 border-border/20 bg-card flex w-full items-center gap-4 rounded-[2rem] border p-4 transition-all hover:scale-[1.01] hover:shadow-lg"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 rounded-xl shadow-md ring-2 ring-white dark:ring-gray-800">
                        <AvatarImage src={conv.otherUser.avatar} />
                        <AvatarFallback className="bg-primary/20 text-primary text-lg font-bold">
                          {getInitials(conv.otherUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.otherUser.online && (
                        <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-sm font-bold tracking-tight uppercase">
                            {conv.otherUser.name}
                          </h4>
                          {conv.otherUser.role && (
                            <Badge
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[8px] font-bold uppercase',
                                conv.otherUser.role === 'ADMIN' ||
                                  conv.otherUser.role === 'SUPER_ADMIN'
                                  ? 'bg-purple-500/10 text-purple-500'
                                  : conv.otherUser.role === 'CLINICIAN'
                                    ? 'bg-indigo-500/10 text-indigo-500'
                                    : 'bg-emerald-500/10 text-emerald-500'
                              )}
                            >
                              {conv.otherUser.role === 'SUPER_ADMIN'
                                ? 'ADMIN'
                                : conv.otherUser.role}
                            </Badge>
                          )}
                        </div>
                        <span className="text-muted-foreground shrink-0 text-[9px] font-semibold tracking-widest whitespace-nowrap uppercase opacity-60">
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
                        <span className="bg-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-lg">
                          {conv.unreadCount}
                        </span>
                      )}
                      <ChevronLeft className="h-5 w-5 rotate-180 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-30" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                  <div className="bg-muted/50 mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem]">
                    <User className="text-muted-foreground h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tighter uppercase">
                    No Messages
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-relaxed font-medium">
                    {currentUser.role === 'CLINICIAN'
                      ? 'You have not been assigned to a patient yet. Once a patient is assigned to your care, they will appear here.'
                      : 'You have not been assigned to a therapist yet. Please wait while we process your clinical assessment.'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ) : (
        /* Chat View - Full Width */
        <div className="flex h-full flex-col overflow-hidden">
          {/* Header - Static Top Bar */}
          <header className="border-border/50 bg-card/95 z-20 flex flex-shrink-0 items-center justify-between border-b p-4 backdrop-blur-sm md:p-6">
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
                  <AvatarFallback className="bg-primary/20 text-primary font-bold">
                    {getInitials(activeTab.otherUser.name)}
                  </AvatarFallback>
                </Avatar>
                {presence?.status === 'ONLINE' && (
                  <div className="ring-card absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-emerald-500 ring-2" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight uppercase">
                  {activeConversation.otherUser.name}
                </h3>
                {presence?.status === 'ONLINE' ? (
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                    <span className="relative flex h-2 w-2 rounded-full bg-current">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75"></span>
                    </span>
                    Online
                  </p>
                ) : (
                  <p className="text-muted-foreground text-[10px] font-medium opacity-60">
                    {presence?.lastSeenText || 'Offline'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted/50 rounded-xl"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-2xl p-2 shadow-2xl"
                >
                  <DropdownMenuItem
                    className="flex cursor-pointer gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-colors hover:bg-red-50 hover:text-red-500"
                    onClick={() => setActiveTab(null)}
                  >
                    Close Chat
                  </DropdownMenuItem>

                  {currentUser.role === 'CLINICIAN' && (
                    <DropdownMenuItem
                      className="flex cursor-pointer gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-colors"
                      onClick={() => {
                        if (activeTab.otherUser.sessionId) {
                          window.location.href = `/clinician/cases/${activeTab.otherUser.sessionId}`;
                        } else {
                          alert('No case file found for this patient.');
                        }
                      }}
                    >
                      View Case File
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    className="text-muted-foreground hover:text-foreground flex cursor-pointer gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-colors"
                    onClick={handleClearHistory}
                  >
                    Clear History
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex cursor-pointer gap-2 rounded-xl py-3 text-xs font-bold tracking-widest text-amber-500 uppercase transition-colors hover:bg-amber-50">
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Messages */}
          <ScrollArea ref={scrollContainerRef} className="bg-muted/5 flex-1 p-8">
            <div className="mx-auto max-w-4xl space-y-8">
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold tracking-widest uppercase opacity-40"
                >
                  Secure Communication Established
                </Badge>
              </div>

              {isLoadingMessages ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <Circle className="mb-4 h-8 w-8 animate-ping" />
                  <p className="text-sm font-bold uppercase">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                  <MessageSquare className="mb-4 h-16 w-16" />
                  <p className="text-base font-bold uppercase">No message history</p>
                  <p className="text-sm">Start your clinical inquiry below.</p>
                </div>
              ) : (
                messages.map((m, index) => {
                  const isLastMessage = index === messages.length - 1;
                  const isFromMe = m.senderId === currentUser.id;

                  return (
                    <div
                      key={m._id}
                      className={cn(
                        'flex w-full items-end gap-3',
                        isFromMe ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {!isFromMe && (
                        <Avatar className="h-8 w-8 shrink-0 rounded-xl shadow-sm">
                          <AvatarImage src={activeTab.otherUser.avatar} />
                          <AvatarFallback className="text-[10px] font-bold">
                            {getInitials(activeTab.otherUser.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          'group flex max-w-[80%] flex-col',
                          isFromMe ? 'items-end' : 'items-start'
                        )}
                      >
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-3 shadow-sm transition-all duration-300',
                            isFromMe
                              ? 'bg-primary hover:shadow-primary/10 rounded-tr-none text-white hover:shadow-md'
                              : 'dark:bg-muted border-border/50 rounded-tl-none border bg-white hover:shadow-md'
                          )}
                        >
                          {m.content.startsWith('IMAGE:') ? (
                            <img
                              src={m.content.replace('IMAGE:', '')}
                              alt="Attachment"
                              className="max-h-48 cursor-pointer rounded-xl object-cover transition-opacity hover:opacity-90"
                              onClick={() =>
                                setExpandedImage(m.content.replace('IMAGE:', ''))
                              }
                            />
                          ) : (
                            <p className="font-sans text-sm leading-snug">{m.content}</p>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 px-1">
                          <span className="text-muted-foreground text-[9px] font-medium opacity-50">
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isFromMe && (
                            <div className="flex items-center gap-1">
                              {m.isRead ? (
                                <>
                                  <CheckCheck className="h-4 w-4 text-cyan-500" />
                                  {isLastMessage && (
                                    <span className="text-[8px] font-bold tracking-widest text-cyan-500 uppercase">
                                      Seen
                                    </span>
                                  )}
                                </>
                              ) : (
                                <Check className="text-muted-foreground h-4 w-4 opacity-50" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {isFromMe && (
                        <Avatar className="h-8 w-8 shrink-0 rounded-xl shadow-sm">
                          <AvatarImage src={currentUser.avatar} />
                          <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                            {getInitials(currentUser.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <footer className="bg-card border-border/50 border-t p-3 md:p-6">
            <form
              onSubmit={handleSendMessage}
              className="relative mx-auto flex max-w-4xl items-center gap-3"
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'hover:bg-muted/50 h-12 w-12 shrink-0 rounded-xl',
                  isUploading && 'animate-pulse opacity-50'
                )}
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="text-muted-foreground h-5 w-5" />
              </Button>

              <div className="group relative flex-1">
                <div className="from-primary/20 absolute -inset-1 rounded-xl bg-gradient-to-r to-indigo-500/20 opacity-0 blur transition duration-500 group-focus-within:opacity-100"></div>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type message..."
                  className="bg-muted/30 focus:ring-primary/20 relative h-12 w-full rounded-xl border-none pr-12 pl-4 font-sans text-sm transition-all focus:ring-2 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'hover:text-primary absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-lg transition-all',
                    showEmojiPicker && 'text-primary bg-primary/10'
                  )}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-5 w-5" />
                </Button>

                {showEmojiPicker && (
                  <div className="bg-card border-border/50 animate-in fade-in slide-in-from-bottom-2 absolute right-0 bottom-full mb-4 grid grid-cols-4 gap-2 rounded-2xl border p-4 shadow-2xl">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="hover:bg-muted flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-all active:scale-95"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={!message.trim()}
                className="bg-primary shadow-primary/30 h-12 w-12 shrink-0 rounded-xl text-white shadow-xl transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </footer>
        </div>
      )}
      {expandedImage && (
        <Lightbox
          src={expandedImage}
          alt="Chat Attachment"
          onClose={() => setExpandedImage(null)}
        />
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
        onConfirm={statusModal.onConfirm}
        confirmText={statusModal.confirmText}
      />
    </div>
  );
}
