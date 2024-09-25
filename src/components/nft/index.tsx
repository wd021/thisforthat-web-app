import React, { FC } from "react";
import Link from "next/link";
import { Verified } from "@/icons";

interface ActivityItem {
  id: string;
  type: "offer" | "interest";
  user: string;
  amount?: string;
  timestamp: Date;
}

const NFTComponent: FC = () => {
  // Mock data - replace with actual data fetching logic
  const owner = "Fred Wilson";
  const collection = "CryptoPunks";
  const openseaLink = "https://opensea.io/collection/cryptopunks";
  const activityFeed: ActivityItem[] = [
    {
      id: "1",
      type: "offer",
      user: "Alice",
      amount: "5 ETH",
      timestamp: new Date("2024-09-25T10:00:00"),
    },
    {
      id: "2",
      type: "interest",
      user: "Charlie",
      timestamp: new Date("2024-09-25T09:30:00"),
    },
    {
      id: "3",
      type: "offer",
      user: "Bob",
      amount: "4.5 ETH",
      timestamp: new Date("2024-09-24T15:45:00"),
    },
    {
      id: "4",
      type: "interest",
      user: "David",
      timestamp: new Date("2024-09-24T12:20:00"),
    },
  ];

  // Sort activity feed by timestamp, most recent first
  const sortedActivityFeed = [...activityFeed].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="flex justify-center mt-20 gap-x-8">
      <div className="w-[500px]">
        <img
          src="/temp/nft.png"
          alt="NFT"
          className="w-full h-[500px] object-cover mb-4 shadow-xl rounded-lg"
        />
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <div className="flex items-center gap-x-2 mb-2">
            <img
              src="/temp/profile.webp"
              alt="Owner"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-bold">{owner}</span>
            <div>follow</div>
          </div>
          <div className="flex">
            <div>
              Chain:{" "}
              <Link
                href={openseaLink}
                className="text-blue-500 hover:underline"
              >
                Ethereum
              </Link>
              ,
            </div>
            <div>
              Collection:{" "}
              <Link
                href={openseaLink}
                className="text-blue-500 hover:underline"
              >
                {collection}
              </Link>
            </div>
            <div>
              Token ID:{" "}
              <Link
                href={openseaLink}
                className="text-blue-500 hover:underline"
              >
                1423
              </Link>
            </div>
          </div>
          <div className="flex">
            <div>Collection Floor</div>
            <div>Last Sale</div>
          </div>
          <Verified />
        </div>
        <div className="flex gap-x-4 justify-between gap-x-4 h-[50px] mt-6">
          <button className="bg-gray-300 w-full">Make an offer</button>
          <button className="bg-gray-300 w-full">I&apos;m interested</button>
        </div>
      </div>
      <div className="w-[550px] bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
        <div className="space-y-2">
          {sortedActivityFeed.map((item) => (
            <Link
              key={item.id}
              href={`/${item.type}/${item.id}`}
              className="block p-3 hover:bg-gray-100 rounded border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <span>
                  {item.user}
                  {item.type === "offer"
                    ? ` offered ${item.amount}`
                    : " showed interest"}
                </span>
                <span className="text-sm text-gray-500">
                  {item.timestamp.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTComponent;
