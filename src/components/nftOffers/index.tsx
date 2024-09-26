// if you have an offer / interest, it should pop to the top of the list -> can delete
// the top should have a toggle of (offers) / (interest) / (deals)

"use client";

import React, { FC, useState } from "react";
import Link from "next/link";
import { Options, VerifiedBadge } from "@/components";
import { Back, Pin } from "@/icons";

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

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
}

interface OfferDetails {
  id: string;
  offeror: string;
  offerorAvatar: string;
  amount: string;
  timestamp: Date;
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

const NFTOffersComponent: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dealModalOpen, setDealModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [interestModalOpen, setInterestModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filteredActivities = activities.filter((item) => {
    if (activeTab === "offers") return item.type === "offers";
    if (activeTab === "looking") return item.type === "looking";
    if (activeTab === "transactions") return item.type === "transactions";
    return true;
  });

  const [chatInput, setChatInput] = useState("");

  // Mock data - replace with actual data fetching logic
  const nftDetails = {
    image: "/temp/nft.png",
    owner: "Fred Wilson",
    ownerImage: "/temp/profile.webp",
    chain: "Ethereum",
    collection: "CryptoPunks",
    tokenId: "1",
    floorPrice: "5 ETH",
    lastSalePrice: "6 ETH",
    isVerified: true,
    verifiedDate: "2024-09-25",
    openseaLink: "https://opensea.io/collection/cryptopunks",
  };

  const offerDetails: OfferDetails = {
    id: "123",
    offeror: "Alice",
    offerorAvatar: "/temp/alice-avatar.png",
    amount: "2.5 ETH",
    timestamp: new Date("2023-09-25T10:30:00"),
  };

  const chatMessages: ChatMessage[] = [
    {
      id: "1",
      sender: "Alice",
      message: "Hi, I'm interested in this NFT. Is the price negotiable?",
      timestamp: new Date("2023-09-25T10:35:00"),
    },
    {
      id: "2",
      sender: "Fred Wilson",
      message:
        "Hello Alice! I'm open to negotiations. What did you have in mind?",
      timestamp: new Date("2023-09-25T10:40:00"),
    },
    // Add more mock messages as needed
  ];

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      // In a real application, you would send this message to your backend
      console.log("Sending message:", chatInput);
      setChatInput("");
    }
  };

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
            {/* Right side - Offer details, chat, and actions */}
            <div className="w-[500px] h-[680px] bg-white flex flex-col">
              {/* Offer details */}
              <div className="mt-2 p-6 border-b border-gray-200">
                <Link href="/nft/1/1/1">
                  <Back />
                </Link>
                <h2 className="text-2xl font-bold mb-4">Offer Details</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={offerDetails.offerorAvatar}
                      alt={offerDetails.offeror}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-semibold">{offerDetails.offeror}</p>
                      <p className="text-sm text-gray-500">
                        Offer made {offerDetails.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-xl font-bold">{offerDetails.amount}</div>
                </div>
              </div>

              {/* Chat feed */}
              <div className="flex-1 overflow-y-auto p-6">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.sender === nftDetails.owner ? "text-right" : ""
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.sender === nftDetails.owner
                          ? "bg-blue-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <p className="font-semibold">{message.sender}</p>
                      <p>{message.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {/* <Send className="w-5 h-5" /> */}Send
                  </button>
                </div>
              </div>

              {/* Action items */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg mr-2 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                    Accept Deal
                  </button>
                  <button className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg mx-2 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                    Make Counter Offer
                  </button>
                  <button className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg ml-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
                    Remove Deal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTOffersComponent;

// add [see current deal]
