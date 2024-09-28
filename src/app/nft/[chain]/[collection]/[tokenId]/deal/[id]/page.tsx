"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components";
import NFTComponent from "@/components/nft";
import { Deal } from "@/components/modals";

interface NFTPageProps {
  params: {
    tokenId: string;
  };
}

const NFTPage: FC<NFTPageProps> = ({ params }) => {
  const router = useRouter();
  console.log(params);

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <NFTComponent />
      <Deal
        itemId={""}
        closeModal={() => {
          router.push("/nft/1/1/1");
        }}
      />
    </div>
  );
};

export default NFTPage;
