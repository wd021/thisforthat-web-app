"use client";

import { FC, useState, useEffect } from "react";
import { AccountSidebar } from "@/components/shared";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  participant: string;
  lastMessage: string;
  unreadCount: number;
}

const AccountDMPage: FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      participant: "Alice",
      lastMessage: "Hey, how are you?",
      unreadCount: 2,
    },
    {
      id: "2",
      participant: "Bob",
      lastMessage: "Did you see that new NFT drop?",
      unreadCount: 0,
    },
    {
      id: "3",
      participant: "Charlie",
      lastMessage: "Let's catch up soon!",
      unreadCount: 1,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (selectedConversation) {
      // Fetch messages for the selected conversation
      // This is a mock implementation. Replace with actual API call.
      const mockMessages: Message[] = [
        {
          id: "1",
          sender: "Alice",
          content: "Hey, how are you?",
          timestamp: new Date(2023, 8, 1, 14, 30),
        },
        {
          id: "2",
          sender: "You",
          content: "I'm good, thanks! How about you?",
          timestamp: new Date(2023, 8, 1, 14, 35),
        },
        {
          id: "3",
          sender: "Alice",
          content: "Doing well! Did you see the new NFT I minted?",
          timestamp: new Date(2023, 8, 1, 14, 40),
        },
      ];
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: "You",
        content: newMessage.trim(),
        timestamp: new Date(),
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");

      // Update the conversation list
      setConversations(
        conversations.map((conv) =>
          conv.id === selectedConversation
            ? { ...conv, lastMessage: newMessage.trim() }
            : conv
        )
      );

      // Here you would typically send the message to your backend
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <AccountSidebar />
      <div className="flex-1 flex">
        {/* Conversation List */}
        <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-3 mb-2 rounded-lg cursor-pointer ${
                selectedConversation === conversation.id
                  ? "bg-blue-100"
                  : "bg-white"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  {conversation.participant}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 truncate">
                {conversation.lastMessage}
              </p>
            </div>
          ))}
        </div>

        {/* Chat Interface */}
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="bg-white p-4 border-b">
                <h2 className="text-xl font-bold">
                  {
                    conversations.find((c) => c.id === selectedConversation)
                      ?.participant
                  }
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "You" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender === "You"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs text-right mt-1 opacity-75">
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <p className="text-xl text-gray-500">
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDMPage;
