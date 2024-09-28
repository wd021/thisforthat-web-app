import { FC } from "react";
import { Navbar } from "@/components";
import { AccountNFTSPage } from "@/components/account";

const AccountNFTs: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <AccountNFTSPage />
    </div>
  );
};

export default AccountNFTs;
