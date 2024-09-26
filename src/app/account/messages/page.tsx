import { FC } from "react";
import { ActivityFeed, Navbar } from "@/components";
import { AccountDMPage } from "@/components/account";

const AccountFollowers: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <AccountDMPage />
      <ActivityFeed />
    </div>
  );
};

export default AccountFollowers;
