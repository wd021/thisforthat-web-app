"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountSidebar } from "@/components/shared";
import { Options, VerifiedBadge } from "@/components";
import { Pin } from "@/icons";

interface Deal {
  id: string;
  nftName: string;
  status: "negotiating" | "pending" | "completed" | "cancelled";
  offerItems: string;
  requestItems: string;
}

interface InterestedNFT {
  id: string;
  title: string;
}

type ActivityType = "deals" | "interested";

const AccountActivityPage: FC = () => {
  const [activeTab, setActiveTab] = useState<ActivityType>("deals");
  const router = useRouter();

  // Mock data - replace with actual data fetching in production
  const deals: Deal[] = [
    {
      id: "1",
      nftName: "Cool Cat #123",
      status: "negotiating",
      offerItems: "1 ETH + Doodle #456",
      requestItems: "Bored Ape #789",
    },
    {
      id: "2",
      nftName: "Azuki #101",
      status: "pending",
      offerItems: "10 ETH",
      requestItems: "CryptoPunk #1234",
    },
  ];

  const interestedNFTs: InterestedNFT[] = [
    { id: "1", title: "Doodle #789" },
    { id: "2", title: "Azuki #101" },
  ];

  const getStatusColor = (status: Deal["status"]) => {
    switch (status) {
      case "negotiating":
        return "bg-yellow-500";
      case "pending":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDealModalOpen = (id: string) => {
    console.log("Open deal modal for", id);
  };

  const pinImage = (id: string) => {
    console.log("Pin image", id);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "deals":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {deals.map((deal) => (
              <Link
                href={`/deals/${deal.id}`}
                key={deal.id}
                className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <img
                  src="/temp/nft.png"
                  alt={deal.nftName}
                  className="w-full h-auto object-cover rounded-lg mb-2"
                />
                <h3 className="font-bold">{deal.nftName}</h3>
                <div className="flex items-center mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-white text-sm ${getStatusColor(
                      deal.status
                    )}`}
                  >
                    {deal.status}
                  </span>
                </div>
                <p className="mt-2">Offer: {deal.offerItems}</p>
                <p>Request: {deal.requestItems}</p>
              </Link>
            ))}
          </div>
        );
      case "interested":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {interestedNFTs.map((item) => (
              <Link
                href="/nft/1/1/1"
                key={item.id}
                className="relative cursor-pointer"
              >
                <div
                  className="absolute top-2 left-2 rounded-full w-7 h-7 flex items-center justify-center bg-gray-200 opacity-25"
                  onClick={(e) => {
                    console.log("handlePin");
                    e.preventDefault();
                    pinImage(item.id.toString());
                  }}
                >
                  <Pin className="text-gray-600" />
                </div>
                <div className="absolute top-1 right-1">
                  <Options onOptionSelect={() => {}} />
                </div>
                <VerifiedBadge
                  isVerified={true}
                  verifiedDate="1"
                  className="absolute bottom-3 right-2"
                />
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src="/temp/nft.png"
                    alt={item.title}
                    className="w-full h-auto object-cover"
                  />
                  <div className="p-3">
                    <div
                      className="flex items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/user/fredwilson");
                      }}
                    >
                      <img
                        src="/temp/profile.webp"
                        alt="profile"
                        className="w-5 h-5 rounded-full"
                      />
                      <div className="ml-2 text-base font-semibold">
                        fredwilson
                      </div>
                    </div>
                    <div className="flex items-center mt-1">
                      <div className="my-1 text-sm">Cryptopunk #1948</div>
                    </div>
                    <div className="font-semibold text-sm flex gap-x-1.5 mt-2">
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          handleDealModalOpen(item.id);
                        }}
                        className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 cursor-pointer"
                      >
                        🤝 5
                      </div>
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 cursor-pointer"
                      >
                        👀 30
                      </div>
                    </div>
                  </div>
                </div>
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
            {(["deals", "interested"] as const).map((tab) => (
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
