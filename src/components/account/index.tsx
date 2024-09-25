"use client";

import React, { useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from "next/link";
import { usePathname } from "next/navigation";

const AccountPage: React.FC = () => {
  const pathname = usePathname();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeNFTSection, setActiveNFTSection] = useState<
    "for-sale" | "not-for-sale"
  >("for-sale");

  const tabs = [
    { name: "Deals", href: "/account/deals" },
    { name: "Interests", href: "/account/interested" },
    { name: "Profile", href: "/account/profile" },
    { name: "My NFTs", href: "/account/nfts" },
    // { name: "Followers", href: "/account/followers" },
  ];

  const isActive = (path: string) => pathname === path;

  const renderContent = () => {
    switch (pathname) {
      case "/account/deals":
        return <div>My Deals Content</div>;
      case "/account/interested":
        return <div>My Interested Content</div>;
      case "/account/nfts":
        return (
          <div>
            <div className="mb-4">
              <button
                className={`mr-2 px-3 py-1 rounded ${
                  activeNFTSection === "for-sale"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                // onClick={() => setActiveNFTSection("for-sale")}
              >
                For Sale
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  activeNFTSection === "not-for-sale"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
                // onClick={() => setActiveNFTSection("not-for-sale")}
              >
                Not For Sale
              </button>
            </div>
            {activeNFTSection === "for-sale" ? (
              <div>NFTs For Sale Content</div>
            ) : (
              <div>NFTs Not For Sale Content</div>
            )}
          </div>
        );
      case "/account/profile":
        return <div>Edit Profile Content</div>;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      {/* Left sidebar */}
      <div className="w-64 bg-gray-100 p-4">
        <div className="ml-2 mb-2 font-bold">Account</div>
        <nav>
          <ul>
            {tabs.map((tab) => (
              <li key={tab.name} className="mb-2">
                <div
                  // href={tab.href}
                  className={`block p-2 rounded ${
                    isActive(tab.href)
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {tab.name}
                </div>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
          // onClick={() => console.log("Sign out")}
        >
          View My Profile
        </button>
        <button
          className="mt-4 w-full bg-red-500 text-white p-2 rounded"
          // onClick={() => console.log("Sign out")}
        >
          Sign Out
        </button>
      </div>

      {/* Right content area */}
      <div className="flex-1 p-8">{renderContent()}</div>
    </div>
  );
};

export default AccountPage;
