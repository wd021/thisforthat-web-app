import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Activity as ActivityIcon, CaretDown } from "@/icons";

interface Offer {
  id: string;
  user: string;
  nftName: string;
  offerAmount: number;
  timestamp: string;
}

interface ActivityFeedProps {
  offers: Offer[];
}

const Activity: React.FC<ActivityFeedProps> = ({ offers }) => {
  return (
    <div className="relative w-full h-full">
      <h2 className="absolute bg-[#f9f9f9] w-full h-[45px] border-b border-[#f3f3f3] flex items-center justify-between font-semibold cursor-pointer px-4">
        <div className="flex items-center">
          <ActivityIcon className="w-5 h-5" />
          <div className="ml-2">Latest Activity</div>
        </div>
        <CaretDown className="w-6 h-6" />
      </h2>
      <ul className="absolute overflow-y-auto hide-scrollbar top-[45px] bottom-0 w-full flex flex-col">
        {offers.map((offer) => (
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
                <span className="font-semibold">fredwilson</span> made an offer
                for <span className="font-semibold">{offer.nftName}</span>
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center text-sm text-gray-500 mr-1 ml-4">
              5m
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Activity;
