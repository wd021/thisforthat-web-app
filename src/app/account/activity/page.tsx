import { FC } from "react";
import { Navbar } from "@/components";
import { AccountActivityPage } from "@/components/account";

const AccountActivity: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <AccountActivityPage />
    </div>
  );
};

export default AccountActivity;
