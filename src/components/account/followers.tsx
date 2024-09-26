"use client";

import { FC, useState } from "react";
import { AccountSidebar } from "@/components/shared";

interface User {
  id: string;
  username: string;
  avatar: string;
  isFollowing?: boolean;
}

const AccountFollowersPage: FC = () => {
  const [activeTab, setActiveTab] = useState<"following" | "followers">(
    "following"
  );
  const [following, setFollowing] = useState<User[]>([
    {
      id: "1",
      username: "cryptoEnthusiast",
      avatar: "/avatars/user1.jpg",
      isFollowing: true,
    },
    {
      id: "2",
      username: "nftCollector",
      avatar: "/avatars/user2.jpg",
      isFollowing: true,
    },
    {
      id: "3",
      username: "blockchainDev",
      avatar: "/avatars/user3.jpg",
      isFollowing: true,
    },
  ]);
  const [followers, setFollowers] = useState<User[]>([
    {
      id: "4",
      username: "artLover",
      avatar: "/avatars/user4.jpg",
      isFollowing: false,
    },
    {
      id: "5",
      username: "techGuru",
      avatar: "/avatars/user5.jpg",
      isFollowing: true,
    },
    {
      id: "6",
      username: "investorPro",
      avatar: "/avatars/user6.jpg",
      isFollowing: false,
    },
  ]);

  const toggleFollow = (userId: string, isFollower: boolean) => {
    if (isFollower) {
      setFollowers(
        followers.map((user) =>
          user.id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    } else {
      setFollowing(
        following.map((user) =>
          user.id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );
    }
    // Here you would also make an API call to update the follow status on the server
  };

  const renderUserList = (users: User[], isFollowerList: boolean) => (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
        >
          <div className="flex items-center">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-12 h-12 rounded-full mr-4"
            />
            <span className="font-medium">{user.username}</span>
          </div>
          <button
            onClick={() => toggleFollow(user.id, isFollowerList)}
            className={`px-4 py-2 rounded ${
              user.isFollowing
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {user.isFollowing ? "Unfollow" : "Follow"}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <AccountSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("following")}
            className={`px-4 py-2 font-medium rounded-tl-lg rounded-bl-lg ${
              activeTab === "following"
                ? "bg-white text-blue-500"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Following ({following.length})
          </button>
          <button
            onClick={() => setActiveTab("followers")}
            className={`px-4 py-2 font-medium rounded-tr-lg rounded-br-lg ${
              activeTab === "followers"
                ? "bg-white text-blue-500"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Followers ({followers.length})
          </button>
        </div>

        {activeTab === "following"
          ? renderUserList(following, false)
          : renderUserList(followers, true)}
      </div>
    </div>
  );
};

export default AccountFollowersPage;
