// if you have an offer / interest, it should pop to the top of the list -> can delete
// the top should have a toggle of (offers) / (interest) / (deals)

"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import { Options, VerifiedBadge } from "@/components";
import { Pin } from "@/icons";

interface ActivityItem {
  id: string;
  type: "offers" | "looking" | "transactions";
  user: string;
  amount?: string;
  timestamp: Date;
}

interface InfoItemProps {
  label: string;
  value: string;
  link?: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, link }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500">{label}</span>
    {link ? (
      <Link href={link} className="text-blue-500 hover:underline">
        {value}
      </Link>
    ) : (
      <span className="font-semibold">{value}</span>
    )}
  </div>
);

interface ActionButtonProps {
  emoji: string;
  text: string;
  count: number;
  onClick: () => void;
  className: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  emoji,
  text,
  count,
  onClick,
  className,
}) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 text-white rounded-lg transition-colors text-sm flex items-center justify-center px-3 ${className}`}
  >
    <span>{emoji}</span>
    <span className="ml-2">{text}</span>
    <span className="ml-auto font-bold">{count}</span>
  </button>
);

const NFTComponent: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dealModalOpen, setDealModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [interestModalOpen, setInterestModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = useState<
    "offers" | "looking" | "transactions"
  >("offers");

  // Mock data - replace with actual data fetching logic
  const image = "/temp/nft.png";
  const owner = "fredwilson";
  const ownerImage = "/temp/profile.webp";
  const chain = "Ethereum";
  const collection = "CryptoPunks";
  const tokenId = "1";
  const floorPrice = "5 ETH";
  const lastSalePrice = "6 ETH";
  const isVerified = true;
  const verifiedDate = "2024-09-25";
  const openseaLink = "https://opensea.io/collection/cryptopunks";

  const activities: ActivityItem[] = [
    {
      id: "1",
      type: "offers",
      user: "Alice",
      // userAvatar: "/temp/profile.webp",
      amount: "2.5 ETH",
      timestamp: new Date("2023-09-25T10:30:00"),
    },
    {
      id: "2",
      type: "looking",
      user: "Bob",
      // userAvatar: "/temp/profile.webp",
      timestamp: new Date("2023-09-25T09:45:00"),
    },
    {
      id: "3",
      type: "transactions",
      user: "Charlie",
      // userAvatar: "/temp/profile.webp",
      amount: "3 ETH",
      timestamp: new Date("2023-09-24T14:20:00"),
    },
    // ... (add more mock data for each type)
  ];
  const filteredActivities = activities.filter((item) => {
    if (activeTab === "offers") return item.type === "offers";
    if (activeTab === "looking") return item.type === "looking";
    if (activeTab === "transactions") return item.type === "transactions";
    return true;
  });

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <div className="w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar">
        <div className="flex items-center px-6 pt-4 gap-x-3 w-full">
          <div className="bg-gray-100 w-12 h-12 rounded-full shrink-0 border-dashed	border-gray-300 border-2 flex items-center justify-center cursor-pointer">
            <Pin className="h-5 w-5 text-gray-300" />
          </div>
        </div>
        <div className="flex justify-center mt-6 gap-x-8">
          <div className="relative w-[400px]">
            <div
              className="cursor-pointer absolute top-3.5 left-3.5 rounded-full w-8 h-8 flex items-center justify-center bg-gray-200 opacity-25"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <Pin className="text-gray-600" />
            </div>
            <img
              src={image}
              alt="NFT"
              className="w-full h-[400px] w-[400px] object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2">
              <Options onOptionSelect={() => {}} />
            </div>
            <div className="px-2 py-4 mb-4">
              <Link
                href="/user/1"
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center">
                  <img
                    src={ownerImage}
                    alt={owner}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-xl font-bold ml-2">{owner}</div>
                  {/* <button className="bg-gray-100 px-2 py-1 rounded-full text-xs ml-3 border border-gray-200">
                Follow
              </button> */}
                </div>
                <VerifiedBadge
                  isVerified={isVerified}
                  verifiedDate={verifiedDate}
                  className=""
                />
              </Link>

              <div className="grid grid-cols-3 gap-4">
                <InfoItem label="Chain" value={chain} link={openseaLink} />
                <InfoItem
                  label="Collection"
                  value={collection}
                  link={openseaLink}
                />
                <InfoItem label="Token ID" value={tokenId} link={openseaLink} />
                <InfoItem label="Floor Price" value={floorPrice} />
                <InfoItem label="Last Sale" value={lastSalePrice} />
              </div>
            </div>
            <div className="flex space-x-4">
              <ActionButton
                emoji="🤝"
                text="Make Offer"
                count={4}
                onClick={() => setDealModalOpen(true)}
                className="bg-gray-800"
              />
              <ActionButton
                emoji="👀"
                text="Looking"
                count={10}
                onClick={() => setInterestModalOpen(true)}
                className="bg-gray-800"
              />
            </div>
          </div>
          <div>
            <div className="w-[550px] bg-white rounded-lg shadow-lg overflow-y-auto hide-scrollbar max-h-[660px]">
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 py-4 px-4 text-base font-medium ${
                    activeTab === "offers"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("offers")}
                >
                  🤝 Offers
                </button>
                <button
                  className={`flex-1 py-4 px-4 text-base font-medium ${
                    activeTab === "looking"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("looking")}
                >
                  👀 Looking
                </button>
              </div>
              <div className="overflow-y-auto hide-scrollbar h-[650px]">
                {filteredActivities.map((item) => (
                  <Link
                    key={item.id}
                    href={`/nft/1/1/1/deal/1`}
                    className="block hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                  >
                    <div className="p-4 flex items-center space-x-4 border-b border-gray-100">
                      <img
                        src="/temp/profile.webp"
                        alt={item.user}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-grow">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">
                            {item.user}
                          </span>
                        </div>
                        <p className="text-gray-600">
                          {item.type === "offers" && "🤝 Made an offer"}
                          {item.type === "looking" && "👀 Expressed interest"}
                          {item.type === "transactions" &&
                            "💰 Completed transaction"}
                          {item.amount && ` - ${item.amount}`}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {/* Replace with actual time calculation */}
                        {Math.floor(
                          (new Date().getTime() - item.timestamp.getTime()) /
                            60000
                        )}
                        m
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTComponent;
