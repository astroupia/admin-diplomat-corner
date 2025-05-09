"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import {
  Archive,
  MoreHorizontal,
  RefreshCw,
  Search,
  Star,
  Trash2,
  ChevronLeft,
  Mail,
  MailOpen,
  Filter,
  X,
  AlertCircle,
  Inbox,
  Send,
  FileText,
  Trash,
  ArchiveIcon,
  Phone,
  AtSign,
  Reply,
  Forward,
  Menu,
} from "lucide-react";
import type { IMessage } from "@/lib/models/message.model";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "../../../hooks/use-media-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Add the MongoDB document properties to the message interface
interface MessageDocument extends Omit<IMessage, "createdAt"> {
  _id: string;
  read?: boolean; // Added for tracking read status
  createdAt: string; // Override createdAt to be string since it comes from API
  starred?: boolean; // Added for UI state
  archived?: boolean; // Added for archive status
  deleted?: boolean; // Added for delete status
}

type FolderType = "inbox" | "starred" | "archive" | "trash";

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageDocument[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageDocument[]>(
    []
  );
  const [selectedMessage, setSelectedMessage] =
    useState<MessageDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState<FolderType>("inbox");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  const messageListRef = useRef<HTMLDivElement>(null);
  const [actionLoading, setActionLoading] = useState<{
    star?: string;
    archive?: string;
    delete?: string;
  }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch messages");
      }

      setMessages(data.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = useCallback(() => {
    let filtered = [...messages];

    // Filter by folder
    switch (currentFolder) {
      case "starred":
        filtered = filtered.filter((msg) => msg.starred);
        break;
      case "archive":
        filtered = filtered.filter((msg) => msg.archived);
        break;
      case "trash":
        filtered = filtered.filter((msg) => msg.deleted);
        break;
      default:
        break;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.subject.toLowerCase().includes(query) ||
          msg.message.toLowerCase().includes(query) ||
          msg.firstName.toLowerCase().includes(query) ||
          msg.lastName.toLowerCase().includes(query) ||
          msg.email.toLowerCase().includes(query)
      );
    }

    setFilteredMessages(filtered);
  }, [messages, searchQuery, currentFolder]);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [filterMessages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  const handleStarMessage = async (messageId: string, starred: boolean) => {
    try {
      setActionLoading((prev) => ({ ...prev, star: messageId }));
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "star",
          starred,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to star message");
      }

      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, starred } : msg))
      );
      toast.success(starred ? "Message starred" : "Message unstarred");
    } catch (err) {
      console.error("Error starring message:", err);
      toast.error("Failed to update message");
    } finally {
      setActionLoading((prev) => ({ ...prev, star: undefined }));
    }
  };

  const handleArchiveMessage = async (messageId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, archive: messageId }));
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "archive",
          archived: true,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to archive message");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, archived: true } : msg
        )
      );
      toast.success("Message archived");
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error("Error archiving message:", err);
      toast.error("Failed to archive message");
    } finally {
      setActionLoading((prev) => ({ ...prev, archive: undefined }));
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setActionLoading((prev) => ({ ...prev, delete: messageId }));
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to delete message");
      }

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
      toast.success("Message deleted");
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message");
    } finally {
      setActionLoading((prev) => ({ ...prev, delete: undefined }));
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "read",
          read: true,
        }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to mark message as read");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "?";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const getRandomColor = (seed: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
    ];
    const index = seed
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const formatDate = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, "h:mm a");
    }
    if (isYesterday(messageDate)) {
      return "Yesterday";
    }
    if (isThisWeek(messageDate)) {
      return format(messageDate, "EEEE");
    }
    return format(messageDate, "MMM d");
  };

  const confirmDelete = (messageId: string) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="main-content main-content-expanded space-y-4 flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-r border-gray-200 h-full overflow-hidden"
            >
              <div className="p-4">
                <Button
                  className="w-full justify-start gap-2"
                  variant={currentFolder === "inbox" ? "secondary" : "ghost"}
                  onClick={() => setCurrentFolder("inbox")}
                >
                  <Inbox size={18} />
                  <span>Inbox</span>
                  <Badge className="ml-auto">
                    {messages.filter((m) => !m.archived && !m.deleted).length}
                  </Badge>
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant={currentFolder === "starred" ? "secondary" : "ghost"}
                  onClick={() => setCurrentFolder("starred")}
                >
                  <Star size={18} />
                  <span>Starred</span>
                  <Badge className="ml-auto">
                    {messages.filter((m) => m.starred).length}
                  </Badge>
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant={currentFolder === "archive" ? "secondary" : "ghost"}
                  onClick={() => setCurrentFolder("archive")}
                >
                  <ArchiveIcon size={18} />
                  <span>Archive</span>
                  <Badge className="ml-auto">
                    {messages.filter((m) => m.archived).length}
                  </Badge>
                </Button>
                <Button
                  className="w-full justify-start gap-2"
                  variant={currentFolder === "trash" ? "secondary" : "ghost"}
                  onClick={() => setCurrentFolder("trash")}
                >
                  <Trash size={18} />
                  <span>Trash</span>
                  <Badge className="ml-auto">
                    {messages.filter((m) => m.deleted).length}
                  </Badge>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Message List */}
          <AnimatePresence initial={false}>
            {listOpen && (
              <motion.div
                initial={{ width: isMobile ? "100%" : 0, opacity: 0 }}
                animate={{
                  width: isMobile ? "100%" : isTablet ? "40%" : "350px",
                  opacity: 1,
                }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white border-r border-gray-200 h-full overflow-hidden flex flex-col"
              >
                {/* Toolbar */}
                <div className="p-3 border-b border-gray-200 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:flex"
                  >
                    <Menu size={18} />
                  </Button>

                  <div className="relative flex-1">
                    <Search
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <Input
                      placeholder="Search messages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 h-full"
                        onClick={() => setSearchQuery("")}
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleRefresh}
                          disabled={refreshing}
                        >
                          <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refresh</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Message List */}
                <ScrollArea className="flex-1" ref={messageListRef}>
                  {loading ? (
                    <div className="p-4 space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                              <div className="h-3 bg-gray-200 rounded w-full"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="p-6 text-center">
                      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Failed to load messages
                      </h3>
                      <p className="text-gray-500 mb-4">{error}</p>
                      <Button onClick={handleRefresh}>Try Again</Button>
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="p-6 text-center">
                      <Mail className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No messages found
                      </h3>
                      <p className="text-gray-500">
                        {searchQuery
                          ? "Try adjusting your search terms"
                          : "Your inbox is empty"}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {filteredMessages.map((message) => (
                        <div
                          key={message._id}
                          className={cn(
                            "p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors",
                            selectedMessage?._id === message._id &&
                              "bg-gray-100",
                            !message.read && "bg-blue-50"
                          )}
                          onClick={() => {
                            setSelectedMessage(message);
                            if (!message.read) {
                              handleMarkAsRead(message._id);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0",
                                getRandomColor(message.firstName)
                              )}
                            >
                              {getInitials(message.firstName, message.lastName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-medium truncate">
                                  {message.firstName} {message.lastName}
                                </h3>
                                <span className="text-xs text-gray-500 shrink-0 ml-2">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-700 truncate mb-1">
                                {message.subject}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {message.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Detail View */}
          <div className="flex-1 h-full overflow-hidden bg-white flex flex-col">
            {selectedMessage ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center gap-2">
                  {isMobile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBackToList}
                      className="mr-1"
                    >
                      <ChevronLeft size={18} />
                    </Button>
                  )}
                  <h2 className="font-semibold text-lg flex-1 truncate">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleStarMessage(
                                selectedMessage._id,
                                !selectedMessage.starred
                              )
                            }
                            disabled={!!actionLoading.star}
                          >
                            {actionLoading.star === selectedMessage._id ? (
                              <RefreshCw size={18} className="animate-spin" />
                            ) : (
                              <Star
                                size={18}
                                className={
                                  selectedMessage.starred
                                    ? "fill-yellow-400 text-yellow-400"
                                    : ""
                                }
                              />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{selectedMessage.starred ? "Unstar" : "Star"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleArchiveMessage(selectedMessage._id)
                            }
                            disabled={!!actionLoading.archive}
                          >
                            {actionLoading.archive === selectedMessage._id ? (
                              <RefreshCw size={18} className="animate-spin" />
                            ) : (
                              <Archive size={18} />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Archive</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(selectedMessage._id)}
                            disabled={!!actionLoading.delete}
                          >
                            {actionLoading.delete === selectedMessage._id ? (
                              <RefreshCw size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0",
                          getRandomColor(selectedMessage.firstName)
                        )}
                      >
                        {getInitials(
                          selectedMessage.firstName,
                          selectedMessage.lastName
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {selectedMessage.firstName}{" "}
                            {selectedMessage.lastName}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {selectedMessage.createdAt
                              ? format(
                                  new Date(selectedMessage.createdAt),
                                  "MMMM d, yyyy 'at' h:mm a"
                                )
                              : ""}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-500 mb-4">
                          {selectedMessage.email && (
                            <div className="flex items-center gap-1">
                              <AtSign size={14} />
                              <span>{selectedMessage.email}</span>
                            </div>
                          )}

                          {selectedMessage.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={14} />
                              <span>{selectedMessage.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg mb-6">
                          <div className="prose max-w-none">
                            <p className="whitespace-pre-wrap">
                              {selectedMessage.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button className="gap-2">
                            <Reply size={16} />
                            <span>Reply</span>
                          </Button>

                          <Button variant="outline" className="gap-2">
                            <Forward size={16} />
                            <span>Forward</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6">
                  <MailOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No message selected
                  </h3>
                  <p className="text-gray-500">
                    Select a message to view its contents
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                messageToDelete && handleDeleteMessage(messageToDelete)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
