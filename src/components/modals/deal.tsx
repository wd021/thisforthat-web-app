"use client";

import { Close } from "@/icons";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";

interface Props {
  itemId: string;
  closeModal: () => void;
}

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

const Deal: React.FC<Props> = ({ itemId, closeModal }) => {
  const [isMobile, setIsMobile] = useState(false);

  const customStyles = {
    content: {
      // Common styles
      overflow: "visible",
      background: "#fff",
      color: "#000",
      // Conditional styles based on `isMobile`
      top: isMobile ? "0" : "50%",
      left: isMobile ? "0" : "50%",
      right: isMobile ? "0" : "auto",
      bottom: isMobile ? "0" : "auto",
      width: isMobile ? "100%" : "90%",
      maxWidth: isMobile ? "100%" : "550px",
      height: isMobile ? "100%" : "auto",
      margin: isMobile ? "0" : "auto",
      borderRadius: isMobile ? "0" : "15px",
      transform: isMobile ? "none" : "translate(-50%, -50%)",
      border: "none",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 100,
    },
  };

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 640);
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dealModalOpen, setDealModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [interestModalOpen, setInterestModalOpen] = React.useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState<
    "offers" | "looking" | "transactions"
  >("offers");

  // Mock data - replace with actual data fetching logic
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
    <div>
      <Modal
        id="react-modal"
        ariaHideApp={false}
        isOpen={true}
        onRequestClose={closeModal}
        style={customStyles}
      >
        {/* Offer details */}
        <div className="mt-2 p-6 border-b border-gray-200">
          <Link href="/nft/1/1/1">
            <Close />
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
      </Modal>
    </div>
  );
};

export default Deal;
