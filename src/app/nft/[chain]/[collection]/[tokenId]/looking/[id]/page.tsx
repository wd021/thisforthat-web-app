import { FC } from "react";
import { ActivityFeed, Navbar } from "@/components";
// import NFTComponent from "@/components/nft";

interface NFTPageProps {
  params: {
    tokenId: string;
    id: string;
  };
}

const NFTInterestPage: FC<NFTPageProps> = ({ params }) => {
  console.log(params);

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      {/* <NFTComponent /> */}
      <ActivityFeed />
    </div>
  );
};

export default NFTInterestPage;