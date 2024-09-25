// TODO: add filtering by activity type + searching for user or collection

"use client";

import React, { useState } from "react";
import { Activity as ActivityIcon } from "@/icons";

import tempActivityData from "@/temp/activityFeed.json";

const ActivityFeed = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed z-10 bottom-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white shadow-xl text-white rounded-full p-3 shadow-xl transition-all duration-300 ${
          isOpen ? "rotate-45" : ""
        } w-16 h-16`}
      >
        <ActivityIcon />
      </button>
      <div
        className={`fixed right-2 bg-white rounded-lg shadow-xl transition-all duration-300 overflow-hidden ${
          isOpen
            ? "bottom-[90px] h-[calc(100vh-105px)] opacity-100"
            : "bottom-[90px] h-0 opacity-0"
        }`}
        style={{ width: "350px" }}
      >
        <div className="absolute bg-gray-800 text-white w-full h-[45px] border-b border-[#f3f3f3] flex items-center justify-center font-semibold cursor-pointer px-4">
          <div className="ml-2">Latest Activity</div>
        </div>
        <ul className="absolute overflow-y-auto hide-scrollbar top-[45px] bottom-0 w-full flex flex-col">
          {tempActivityData.feed.map((offer) => (
            <li
              key={offer.id}
              className="flex items-center p-3 hover:bg-gray-100 rounded-md transition-colors duration-200 cursor-pointer"
            >
              <div className="flex-shrink-0">
                <img
                  src="/temp/profile.webp"
                  alt="avatar"
                  className="w-6 h-6 rounded-full mr-2"
                />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium text-gray-900">
                  <span className="font-semibold">fredwilson</span> made an
                  offer for{" "}
                  <span className="font-semibold">{offer.nftName}</span>
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center text-sm text-gray-500 mr-1 ml-4">
                5m
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ActivityFeed;
