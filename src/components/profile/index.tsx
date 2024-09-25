"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { Pin, Verified } from "@/icons";

type NFTCategory = "my-deals" | "my-interests" | "not-for-sale" | "for-sale";

interface NFT {
  id: string;
  imageUrl: string;
  title: string;
}

const ProfileComponent: FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<NFTCategory>("not-for-sale");

  const categories: { [key in NFTCategory]: string } = {
    "my-deals": "Negotiations",
    "my-interests": "Things I Want",
    "for-sale": "My NFTs (For Sale)",
    "not-for-sale": "My NFTs (Not for Sale)",
  };

  const nfts: { [key in NFTCategory]: NFT[] } = {
    "my-deals": [
      { id: "5", imageUrl: "/temp/nft.png", title: "NFT 5" },
      { id: "6", imageUrl: "/temp/nft.png", title: "NFT 6" },
    ],
    "my-interests": [
      { id: "5", imageUrl: "/temp/nft.png", title: "NFT 5" },
      { id: "6", imageUrl: "/temp/nft.png", title: "NFT 6" },
    ],
    "not-for-sale": [
      { id: "1", imageUrl: "/temp/nft.png", title: "NFT 1" },
      { id: "2", imageUrl: "/temp/nft.png", title: "NFT 2" },
    ],
    "for-sale": [
      { id: "3", imageUrl: "/temp/nft.png", title: "NFT 3" },
      { id: "4", imageUrl: "/temp/nft.png", title: "NFT 4" },
    ],
  };

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex justify-center mt-[20px] gap-x-4">
      <div className="overflow-y-auto hide-scrollbar">
        {/* Profile Header */}
        <div className="py-8 flex justify-center">
          <div className="flex flex-col items-center">
            <div className="relative w-[150px] h-[150px]">
              <img
                src="/temp/profile.webp"
                alt="Profile"
                className="w-full h-full rounded-full mx-auto"
              />
              <div className="absolute bottom-[-6px] right-[-6px]">
                <Verified className="w-12 h-12" />
              </div>
            </div>
            <div className="flex items-center text-sm bg-gray-100 border border-gray-200 px-3 py-1 rounded-full mt-4 cursor-pointer">
              <div className="ml-1">follow</div>
            </div>
            <div className="flex items-center mt-4">
              <div className="text-3xl font-bold">fredwilson</div>
            </div>
            <p className="text-gray-600 mt-2">
              Digital art enthusiast and NFT collector
            </p>
            <div className="flex items-center justify-center mt-2">
              {/* Simple Ethereum icon */}
              <svg
                className="w-5 h-5 text-gray-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-sm text-gray-600">0x1234...5678</span>
            </div>
            <div className="flex justify-center mt-4 space-x-4">
              {/* Simple social media icons */}
              <svg
                className="w-6 h-6 text-blue-400 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <svg
                className="w-6 h-6 text-pink-500 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
              </svg>
              <svg
                className="w-6 h-6 text-blue-700 cursor-pointer"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
          </div>
        </div>

        {/* NFT Category Tabs */}
        <div className="flex p-1 space-x-1 bg-blue-900/20 rounded-xl">
          {Object.entries(categories).map(([key, value]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as NFTCategory)}
              className={`w-full py-2.5 text-sm font-medium leading-5 text-blue-700 rounded-lg
              focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60
              ${
                selectedCategory === key
                  ? "bg-white shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {/* NFT Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nfts[selectedCategory].map((nft) => (
            <div
              key={nft.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <Image
                src={nft.imageUrl}
                alt={nft.title}
                width={300}
                height={300}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{nft.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
