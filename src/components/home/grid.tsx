import { FC, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePinnedImages } from "@/providers/pinbar";
import { Options, VerifiedBadge } from "@/components";
import { Offer } from "@/components/modals";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Pin, Verified } from "@/icons";

interface GridItem {
  id: number;
  imageUrl: string;
  title: string;
}

interface PinterestGridProps {
  items: GridItem[];
}

const Grid: FC<PinterestGridProps> = ({ items }) => {
  const router = useRouter();
  const { pinImage } = usePinnedImages();
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const handleDealModalOpen = (itemId: number) => {
    setSelectedItemId(itemId);
    setDealModalOpen(true);
  };

  return (
    <>
      <div className="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {items.map((item) => (
          <Link
            href="/nft/1/1/1"
            key={item.id}
            className="relative cursor-pointer"
          >
            <div
              className="absolute top-2 left-2 rounded-full w-7 h-7 flex items-center justify-center bg-gray-200 opacity-25"
              onClick={(e) => {
                console.log("handlePin");
                e.preventDefault();
                pinImage(item.id.toString());
              }}
            >
              <Pin className="text-gray-600" />
            </div>
            <div className="absolute top-1 right-1">
              <Options onOptionSelect={() => {}} />
            </div>
            <VerifiedBadge
              isVerified={true}
              verifiedDate="1"
              className="absolute bottom-3 right-2"
            />
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/temp/nft.png"
                alt={item.title}
                className="w-full h-auto object-cover"
              />
              <div className="p-3">
                <div
                  className="flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/user/fredwilson");
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/temp/profile.webp"
                    alt="profile"
                    className="w-5 h-5 rounded-full"
                  />
                  <div className="ml-2 text-base font-semibold">fredwilson</div>
                </div>
                <div className="flex items-center mt-1">
                  <div className="my-1 text-sm">Cryptopunk #1948</div>
                </div>
                <div className="font-semibold text-sm flex gap-x-1.5 mt-2">
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      handleDealModalOpen(item.id);
                    }}
                    className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 cursor-pointer"
                  >
                    🤝 5
                  </div>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 cursor-pointer"
                  >
                    👀 30
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {selectedItemId && (
        <>
          {dealModalOpen && (
            <Offer
              closeModal={() => setDealModalOpen(false)}
              itemId={selectedItemId.toString()}
            />
          )}
        </>
      )}
    </>
  );
};

export default Grid;
