"use client";

import { FC, useState } from "react";
import { AccountSidebar } from "@/components/shared";

interface NFT {
  id: string;
  name: string;
  image: string;
  collection: string;
  forSwap: boolean;
  verified: boolean;
}

const AccountNFTSPage: FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([
    {
      id: "1",
      name: "Cool Cat #123",
      image: "/path-to-image1.jpg",
      collection: "Cool Cats",
      forSwap: true,
      verified: true,
    },
    {
      id: "2",
      name: "Bored Ape #456",
      image: "/path-to-image2.jpg",
      collection: "BAYC",
      forSwap: false,
      verified: true,
    },
    {
      id: "3",
      name: "Doodle #789",
      image: "/path-to-image3.jpg",
      collection: "Doodles",
      forSwap: true,
      verified: false,
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const toggleNFTSwapStatus = (id: string) => {
    setNfts(
      nfts.map((nft) =>
        nft.id === id ? { ...nft, forSwap: !nft.forSwap } : nft
      )
    );
  };

  const renderNFTGrid = (forSwap: boolean) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {nfts
        .filter((nft) => nft.forSwap === forSwap)
        .map((nft) => (
          <div key={nft.id} className="bg-white rounded-lg shadow p-4">
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <h3 className="font-bold">{nft.name}</h3>
            <p className="text-sm text-gray-600">{nft.collection}</p>
            <div className="flex justify-between items-center mt-2">
              <span
                className={`text-sm ${
                  nft.verified ? "text-green-500" : "text-red-500"
                }`}
              >
                {nft.verified ? "Verified" : "Unverified"}
              </span>
              <button
                onClick={() => toggleNFTSwapStatus(nft.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                ⇄
              </button>
            </div>
          </div>
        ))}
    </div>
  );
  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <AccountSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My NFTs</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add NFTs
            </button>
            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <span className="mr-2">✓</span>
              Verify NFTs
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">NFTs for Swap</h2>
          {renderNFTGrid(true)}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">NFTs Not for Swap</h2>
          {renderNFTGrid(false)}
        </div>
      </div>
    </div>
  );
};

export default AccountNFTSPage;
