"use client";

import { FC, useState } from "react";
import { AccountSidebar } from "@/components/shared";

interface Wallet {
  address: string;
  isVerified: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface UserProfile {
  username: string;
  bio: string;
  profilePicture: string;
  isProfilePictureNFT: boolean;
  wallets: Wallet[];
  socialLinks: SocialLink[];
}

const AccountProfilePage: FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    username: "CryptoUser123",
    bio: "NFT enthusiast and blockchain developer",
    profilePicture: "/path-to-default-image.jpg",
    isProfilePictureNFT: false,
    wallets: [
      { address: "0x1234...5678", isVerified: true },
      { address: "0xabcd...efgh", isVerified: false },
    ],
    socialLinks: [
      { platform: "Twitter", url: "https://twitter.com/cryptouser123" },
      { platform: "Instagram", url: "https://instagram.com/cryptouser123" },
    ],
  });

  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
  const [newWallet, setNewWallet] = useState("");
  const [newSocialPlatform, setNewSocialPlatform] = useState("");
  const [newSocialUrl, setNewSocialUrl] = useState("");

  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here you would typically upload the file to your server and get a URL back
      // For this example, we'll just use a fake URL
      setProfile({
        ...profile,
        profilePicture: URL.createObjectURL(file),
        isProfilePictureNFT: false,
      });
    }
  };

  const handleNFTSelection = (nftImageUrl: string) => {
    setProfile({
      ...profile,
      profilePicture: nftImageUrl,
      isProfilePictureNFT: true,
    });
    setIsNFTModalOpen(false);
    // Here you would typically verify the NFT ownership
  };

  const handleWalletAdd = () => {
    if (newWallet) {
      setProfile({
        ...profile,
        wallets: [
          ...profile.wallets,
          { address: newWallet, isVerified: false },
        ],
      });
      setNewWallet("");
    }
  };

  const handleWalletVerify = (address: string) => {
    // Here you would typically initiate the wallet verification process
    setProfile({
      ...profile,
      wallets: profile.wallets.map((wallet) =>
        wallet.address === address ? { ...wallet, isVerified: true } : wallet
      ),
    });
  };

  const handleSocialLinkAdd = () => {
    if (newSocialPlatform && newSocialUrl) {
      setProfile({
        ...profile,
        socialLinks: [
          ...profile.socialLinks,
          { platform: newSocialPlatform, url: newSocialUrl },
        ],
      });
      setNewSocialPlatform("");
      setNewSocialUrl("");
    }
  };

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <AccountSidebar />
      <div className="flex-1 p-8 bg-gray-100 overflow-y-auto hide-scrollbar">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
          <div className="flex items-center space-x-4">
            <img
              src={profile.profilePicture}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="mb-2"
              />
              <button
                onClick={() => setIsNFTModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Select NFT
              </button>
              {profile.isProfilePictureNFT && (
                <button
                  onClick={() => {
                    /* Implement NFT verification logic */
                  }}
                  className="ml-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Verify NFT
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallets</h2>
          <div className="space-y-4">
            {profile.wallets.map((wallet, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{wallet.address}</span>
                {wallet.isVerified ? (
                  <span className="text-green-500">Verified</span>
                ) : (
                  <button
                    onClick={() => handleWalletVerify(wallet.address)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Verify
                  </button>
                )}
              </div>
            ))}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newWallet}
                onChange={(e) => setNewWallet(e.target.value)}
                placeholder="Enter wallet address"
                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button
                onClick={handleWalletAdd}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Social Links</h2>
          <div className="space-y-4">
            {profile.socialLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between">
                <span>{link.platform}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {link.url}
                </a>
              </div>
            ))}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSocialPlatform}
                onChange={(e) => setNewSocialPlatform(e.target.value)}
                placeholder="Platform (e.g., Twitter)"
                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <input
                type="text"
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                placeholder="URL"
                className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <button
                onClick={handleSocialLinkAdd}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* NFT Selection Modal */}
        {isNFTModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">
                Select NFT as Profile Picture
              </h3>
              {/* Implement NFT selection logic here */}
              <button
                onClick={() => setIsNFTModalOpen(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountProfilePage;
