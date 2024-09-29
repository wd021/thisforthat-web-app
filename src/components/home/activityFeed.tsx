import React, { useState } from "react";

// Custom collapsible icon component
const CollapsibleIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform duration-300 ${
      collapsed ? "rotate-180" : ""
    }`}
  >
    <polyline points={collapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
  </svg>
);

const activityData: Activity[] = [
  {
    id: 1,
    offerFrom: "Alice",
    offerTo: "Bob",
    offerNft: "CryptoPunk #3456",
    forNft: "Bored Ape #7890",
    status: "Negotiating",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: 2,
    offerFrom: "Charlie",
    offerTo: "David",
    offerNft: "Azuki #1234",
    forNft: "Doodle #5678",
    status: "Agreed",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: 3,
    offerFrom: "Eve",
    offerTo: "Frank",
    offerNft: "Cool Cat #9012",
    forNft: "Moonbird #3456",
    status: "Negotiating",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 4,
    offerFrom: "Grace",
    offerTo: "Henry",
    offerNft: "World of Women #7890",
    forNft: "VeeFriends #1234",
    status: "Declined",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: 5,
    offerFrom: "Ivy",
    offerTo: "Jack",
    offerNft: "Pudgy Penguin #5678",
    forNft: "CloneX #9012",
    status: "Agreed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
];

interface Activity {
  id: number;
  offerFrom: string;
  offerTo: string;
  offerNft: string;
  forNft: string;
  status: "Negotiating" | "Agreed" | "Declined";
  timestamp: Date;
}

const ActivityItem = ({ activity }: { activity: Activity }) => {
  const statusColor: { [key in Activity["status"]]: string } = {
    Negotiating: "text-yellow-600 bg-yellow-100",
    Agreed: "text-green-600 bg-green-100",
    Declined: "text-red-600 bg-red-100",
  };

  return (
    <div className="flex items-start space-x-3 mb-4 p-3 bg-white rounded-lg shadow-sm">
      <img
        src="/temp/profile.webp"
        alt={activity.offerFrom}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-semibold">{activity.offerFrom}</span> offered{" "}
          <span className="font-semibold">{activity.offerNft}</span> to{" "}
          <span className="font-semibold">{activity.offerTo}</span> for{" "}
          <span className="font-semibold">{activity.forNft}</span>
        </p>
        <div className="flex items-center mt-1">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              statusColor[activity.status]
            }`}
          >
            {activity.status}
          </span>
          <span className="text-xs text-gray-500 ml-2">2m</span>
        </div>
      </div>
      <img src="/temp/nft.png" alt="NFT" className="w-16 h-16 rounded-md" />
    </div>
  );
};

const ActivityFeed: React.FC = () => {
  const [feedCollapsed, setFeedCollapsed] = useState(false);
  const toggleFeed = () => setFeedCollapsed(!feedCollapsed);

  return (
    <div
      className={`border-l border-gray-200 hidden md:flex flex-col ${
        feedCollapsed ? "w-12" : "w-[350px]"
      } bg-gray-100 transition-all duration-300 ease-in-out shrink-0`}
    >
      <div className="flex-grow overflow-hidden">
        {!feedCollapsed && (
          <div className="p-4">
            <div className="text-xl font-bold mb-4 text-center">
              🤝 Latest Offers
            </div>
            {activityData.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
      <button
        onClick={toggleFeed}
        className={`
        flex items-center justify-center p-2 w-full
        text-gray-500 hover:text-gray-700 focus:outline-none
        transition-all duration-300 ease-in-out
        ${
          feedCollapsed
            ? "bg-gray-200 hover:bg-gray-300"
            : "bg-gray-100 hover:bg-gray-200"
        }
      `}
      >
        <CollapsibleIcon collapsed={feedCollapsed} />
      </button>
    </div>
  );
};

export default ActivityFeed;
