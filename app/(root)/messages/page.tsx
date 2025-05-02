"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { IMessage } from "@/lib/models/message.model";
import { format } from "date-fns";

// Add the MongoDB document properties to the message interface
interface MessageDocument extends IMessage {
  _id: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageDocument[]>([]);
  const [selectedMessage, setSelectedMessage] =
    useState<MessageDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
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
    }

    fetchMessages();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-diplomat-green"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && messages.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          No messages found.
        </div>
      )}

      {!loading && !error && messages.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card className="h-[calc(100dvh-10rem)] overflow-hidden">
              <div className="border-b p-4">
                <h2 className="font-semibold">Inbox</h2>
                <p className="text-sm text-muted-foreground">
                  {messages.length} messages
                </p>
              </div>
              <div className="overflow-y-auto overscroll-contain h-[calc(100%-4rem)]">
                {messages.map((message) => (
                  <div
                    key={message._id?.toString()}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?._id === message._id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">
                        {message.firstName} {message.lastName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {message.createdAt
                          ? format(new Date(message.createdAt), "MMM d, yyyy")
                          : ""}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Message View */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="h-[calc(100dvh-10rem)] overflow-hidden">
                <div className="border-b p-4">
                  <h2 className="text-xl font-semibold">
                    {selectedMessage.subject}
                  </h2>
                </div>
                <div className="p-6 overflow-y-auto overscroll-contain h-[calc(100%-4rem)]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-medium text-lg">
                        {selectedMessage.firstName} {selectedMessage.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedMessage.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedMessage.phone}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedMessage.createdAt
                        ? format(
                            new Date(selectedMessage.createdAt),
                            "MMMM d, yyyy 'at' h:mm a"
                          )
                        : ""}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm">
                      <p className="whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-[calc(100dvh-10rem)] flex items-center justify-center">
                <p className="text-gray-500">
                  Select a message to view details
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
