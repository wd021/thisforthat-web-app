import { FC } from "react";
import { Navbar } from "@/components";
import { AccountDMPage } from "@/components/account";

const AccountFollowers: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <AccountDMPage />
    </div>
  );
};

export default AccountFollowers;
