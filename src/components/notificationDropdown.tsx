"use client";

import React, { useState, useEffect, useRef } from "react";
import { Notifications } from "@/icons";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Mock fetching notifications
    // In a real app, you'd fetch this from your API
    const mockNotifications = [
      {
        id: 1,
        type: "offer",
        user: "Alice",
        content: "made an offer on your NFT",
        time: "2m ago",
      },
      {
        id: 2,
        type: "interest",
        user: "Bob",
        content: "expressed interest in your NFT",
        time: "5m ago",
      },
      {
        id: 3,
        type: "sale",
        user: "Charlie",
        content: "purchased an NFT you were watching",
        time: "10m ago",
      },
      {
        id: 4,
        type: "message",
        user: "David",
        content: "sent you a message",
        time: "1h ago",
      },
      {
        id: 5,
        type: "follow",
        user: "Eve",
        content: "started following you",
        time: "2h ago",
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "offer":
        return "💰";
      case "interest":
        return "👀";
      case "sale":
        return "🎉";
      case "message":
        return "💬";
      case "follow":
        return "👤";
      default:
        return "🔔";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="h-full w-[45px] h-full rounded-md bg-gray-100 flex items-center justify-center"
      >
        <Notifications className="w-[22px] h-[22px]" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-[-55px] w-80 bg-white rounded-md shadow-lg overflow-hidden z-10">
          <div className="py-2">
            <div className="px-4 py-2 bg-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                X
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-800">
                          <span className="font-semibold">
                            {notification.user}
                          </span>{" "}
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No new notifications
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-100 text-center">
                <button className="text-sm text-blue-500 hover:text-blue-600">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
