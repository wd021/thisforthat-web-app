"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { AccountSidebar } from "@/components/shared";

// You might want to move these interfaces to a separate types file
interface Deal {
  id: string;
  nftName: string;
  price: string;
  buyer: string;
  seller: string;
  status: "pending" | "completed" | "cancelled";
}

interface InterestedNFT {
  id: string;
  name: string;
  collection: string;
  image: string;
}

interface Transaction {
  id: string;
  nftName: string;
  price: string;
  type: "buy" | "sell";
  date: string;
}

type ActivityType = "deals" | "interested" | "transactions";

const AccountActivityPage: FC = () => {
  const [activeTab, setActiveTab] = useState<ActivityType>("deals");

  // Mock data - replace with actual data fetching in production
  const deals: Deal[] = [
    {
      id: "1",
      nftName: "Cool Cat #123",
      price: "1.5 ETH",
      buyer: "0x123...",
      seller: "0x456...",
      status: "pending",
    },
    {
      id: "2",
      nftName: "Bored Ape #456",
      price: "100 ETH",
      buyer: "0x789...",
      seller: "0xabc...",
      status: "completed",
    },
  ];

  const interestedNFTs: InterestedNFT[] = [
    {
      id: "1",
      name: "Doodle #789",
      collection: "Doodles",
      image: "/path-to-image1.jpg",
    },
    {
      id: "2",
      name: "Azuki #101",
      collection: "Azuki",
      image: "/path-to-image2.jpg",
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "1",
      nftName: "Moonbird #202",
      price: "10 ETH",
      type: "buy",
      date: "2023-09-15",
    },
    {
      id: "2",
      nftName: "CryptoPunk #303",
      price: "75 ETH",
      type: "sell",
      date: "2023-09-10",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "deals":
        return (
          <div className="space-y-4">
            {deals.map((deal) => (
              <Link
                href={`/deals/${deal.id}`}
                key={deal.id}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold">{deal.nftName}</h3>
                <p>Price: {deal.price}</p>
                <p>Status: {deal.status}</p>
              </Link>
            ))}
          </div>
        );
      case "interested":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {interestedNFTs.map((nft) => (
              <Link
                href={`/nfts/${nft.id}`}
                key={nft.id}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold">{nft.name}</h3>
                <p>{nft.collection}</p>
              </Link>
            ))}
          </div>
        );
      case "transactions":
        return (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <Link
                href={`/transactions/${tx.id}`}
                key={tx.id}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold">{tx.nftName}</h3>
                <p>Price: {tx.price}</p>
                <p>Type: {tx.type === "buy" ? "Bought" : "Sold"}</p>
                <p>Date: {tx.date}</p>
              </Link>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <AccountSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <div className="mb-6">
          <div className="flex space-x-4 mb-6">
            {(["deals", "interested", "transactions"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AccountActivityPage;
