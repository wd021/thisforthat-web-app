import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Options } from "@/components";
import { Pin, Verified } from "@/icons";

interface GridItem {
  id: string;
  imageUrl: string;
  title: string;
}

interface PinterestGridProps {
  items: GridItem[];
}

const Grid: FC<PinterestGridProps> = ({ items }) => {
  const router = useRouter();

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <Link
          href="/nft/1/1/1"
          key={item.id}
          className="relative cursor-pointer"
        >
          <div className="absolute top-0 right-0">
            <Options onOptionSelect={() => {}} />
          </div>
          <Verified isVerified={true} className="absolute bottom-3 right-2" />
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
                <div className="mr-0.5 mt-0.5">Cryptopunk #1948</div>
              </div>
              <div className="font-bold text-sm flex gap-x-1.5 mt-2">
                <div className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 cursor-pointer">
                  🤝 5
                </div>
                <div className="bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200 cursor-pointer">
                  👀 30
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Grid;
