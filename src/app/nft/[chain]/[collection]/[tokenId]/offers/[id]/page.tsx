import { FC } from "react";
import { ActivityFeed, Navbar } from "@/components";
import NFTOffersComponent from "@/components/nftOffers";

interface NFTPageProps {
  params: {
    tokenId: string;
  };
}

const NFTPage: FC<NFTPageProps> = ({ params }) => {
  console.log(params);

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <NFTOffersComponent />
      <ActivityFeed />
    </div>
  );
};

export default NFTPage;
