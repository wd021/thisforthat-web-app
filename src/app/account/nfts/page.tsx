import { FC } from "react";
import { ActivityFeed, Navbar } from "@/components";
import { AccountNFTSPage } from "@/components/account";

const AccountNFTs: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <AccountNFTSPage />
      <ActivityFeed />
    </div>
  );
};

export default AccountNFTs;
