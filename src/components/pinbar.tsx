import React from "react";
import Link from "next/link";
import { Pin } from "@/icons";
import { usePinnedImages } from "@/providers/pinbar";

const PinBar: React.FC = () => {
  const { pinnedIds, unpinImage } = usePinnedImages();

  console.log("pinnedIds", pinnedIds);

  return (
    <>
      {pinnedIds.map((image) => (
        <Link
          href="/nft/1/1/1"
          key={image}
          className="bg-gray-100 w-12 h-12 rounded-full relative mr-2 flex-shrink-0 cursor-pointer"
        >
          <img src="/temp/nft.png" className="rounded-full w-full h-full" />
          <button
            onClick={(e) => {
              e.preventDefault();
              unpinImage(image);
            }}
            className="absolute top-[-5px] right-[-5px] bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >
            x
          </button>
        </Link>
      ))}
      <div className="bg-gray-100 w-12 h-12 rounded-full shrink-0 border-dashed	border-gray-300 border-2 flex items-center justify-center cursor-pointer">
        <Pin className="h-5 w-5 text-gray-300" />
      </div>
    </>
  );
};

export default PinBar;
