"use client";

import React, { FC, useState } from "react";
import { AccountSidebar } from "@/components/shared";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface NFT {
  id: string;
  name: string;
  image: string;
  collection: string;
  forSwap: boolean;
  verified: boolean;
}

interface SortableItemProps {
  id: string;
  nft: NFT;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, nft }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-100 rounded-lg p-4 mb-4 cursor-move"
    >
      <img
        src={nft.image}
        alt={nft.name}
        className="w-full h-40 object-cover rounded-lg mb-2"
      />
      <h3 className="font-bold">{nft.name}</h3>
      <p className="text-sm text-gray-600">{nft.collection}</p>
      <span
        className={`text-sm ${
          nft.verified ? "text-green-500" : "text-red-500"
        }`}
      >
        {nft.verified ? "Verified" : "Unverified"}
      </span>
    </div>
  );
};

interface NFT {
  id: string;
  name: string;
  image: string;
  collection: string;
  forSwap: boolean;
  verified: boolean;
}

const AccountNFTSPage: FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([
    {
      id: "1",
      name: "Cool Cat #123",
      image: "/temp/nft.png",
      collection: "Cool Cats",
      forSwap: true,
      verified: true,
    },
    {
      id: "2",
      name: "Bored Ape #456",
      image: "/temp/nft.png",
      collection: "BAYC",
      forSwap: false,
      verified: true,
    },
    {
      id: "3",
      name: "Doodle #789",
      image: "/temp/nft.png",
      collection: "Doodles",
      forSwap: true,
      verified: false,
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setNfts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        if (newIndex === -1) {
          // The item was dropped into an empty list
          const updatedItems = [...items];
          const [movedItem] = updatedItems.splice(oldIndex, 1);
          movedItem.forSwap = over.id === "forSwap";
          updatedItems.push(movedItem);
          return updatedItems;
        } else {
          // The item was dropped onto another item
          const updatedItems = arrayMove(items, oldIndex, newIndex);
          const sourceItem = items[oldIndex];
          const targetItem = items[newIndex];

          if (sourceItem.forSwap !== targetItem.forSwap) {
            updatedItems[newIndex] = {
              ...updatedItems[newIndex],
              forSwap: !sourceItem.forSwap,
            };
          }

          return updatedItems;
        }
      });
    }
  };

  const DroppableArea: FC<{ id: string; children: React.ReactNode }> = ({
    id,
    children,
  }) => {
    const { setNodeRef } = useDroppable({ id });
    return <div ref={setNodeRef}>{children}</div>;
  };

  const renderNFTList = (forSwap: boolean) => {
    const filteredNfts = nfts.filter((nft) => nft.forSwap === forSwap);
    const droppableId = forSwap ? "forSwap" : "notForSwap";

    return (
      <DroppableArea id={droppableId}>
        <div className="bg-white rounded-lg shadow p-4 h-full min-h-[200px]">
          <h2 className="text-xl font-semibold mb-4">
            {forSwap ? "NFTs for Swap" : "NFTs Not for Swap"}
          </h2>
          <SortableContext
            items={filteredNfts.map((nft) => nft.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredNfts.map((nft) => (
              <SortableItem key={nft.id} id={nft.id} nft={nft} />
            ))}
          </SortableContext>
          {filteredNfts.length === 0 && (
            <div className="text-gray-500 text-center py-4">Drag NFTs here</div>
          )}
        </div>
      </DroppableArea>
    );
  };

  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <AccountSidebar />
      <div className="flex-1 p-8 bg-gray-100 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My NFTs</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Add NFTs
            </button>
            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
            >
              <span className="mr-2">✓</span>
              Verify NFTs
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {renderNFTList(true)}
            {renderNFTList(false)}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default AccountNFTSPage;
