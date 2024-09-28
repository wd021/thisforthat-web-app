import { FC } from "react";
import { Navbar } from "@/components";
import { AccountFollowersPage } from "@/components/account";

const AccountFollowers: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <AccountFollowersPage />
    </div>
  );
};

export default AccountFollowers;
