import React from "react";

interface GridItem {
  id: string;
  imageUrl: string;
  title: string;
}

interface PinterestGridProps {
  items: GridItem[];
}

const Grid: React.FC<PinterestGridProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="break-inside-avoid mb-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/temp/nft.png"
              alt={item.title}
              className="w-full h-auto object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h3>
              <h3 className="text-lg font-semibold text-gray-800">
                5 offers made
              </h3>
              <h3 className="text-lg font-semibold text-gray-800">
                15 people want
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Grid;
