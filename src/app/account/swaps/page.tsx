import { FC } from "react";
import { ActivityFeed, Navbar } from "@/components";
import { AccountSwapPage } from "@/components/account";

const AccountActivity: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <AccountSwapPage />
      <ActivityFeed />
    </div>
  );
};

export default AccountActivity;
