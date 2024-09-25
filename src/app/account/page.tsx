import { FC } from "react";
import { ActivityFeed, Navbar } from "@/components";
import AccountComponent from "@/components/account";

const Account: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <AccountComponent />
      <ActivityFeed />
    </div>
  );
};

export default Account;
