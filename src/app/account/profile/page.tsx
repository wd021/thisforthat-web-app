import { FC } from "react";
import { Navbar } from "@/components";
import { AccountProfilePage } from "@/components/account";

const AccountProfile: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <AccountProfilePage />
    </div>
  );
};

export default AccountProfile;
