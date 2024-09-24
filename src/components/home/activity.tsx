import React from "react";
import { formatDistanceToNow } from "date-fns";

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
    <div className="">
      <h2 className="text-2xl font-bold mb-4">Latest Activity</h2>
      <ul className="space-y-4">
        {offers.map((offer) => (
          <li
            key={offer.id}
            className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors duration-200"
          >
            <div className="flex-shrink-0">
              <span className="text-xl text-gray-400" aria-hidden="true">
                👤
              </span>
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium text-gray-900">
                {offer.user} made an offer for{" "}
                <span className="font-semibold">{offer.nftName}</span>
              </p>
            </div>
            <div className="flex-shrink-0 flex items-center text-sm text-gray-500">
              <span className="mr-1" aria-hidden="true">
                🕒
              </span>
              {formatDistanceToNow(new Date(offer.timestamp), {
                addSuffix: true,
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Activity;
