"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";

interface PinnedImagesContextType {
  pinnedIds: string[];
  pinImage: (id: string) => void;
  unpinImage: (id: string) => void;
}

const PinnedImagesContext = createContext<PinnedImagesContextType | undefined>(
  undefined
);

export const usePinnedImages = () => {
  const context = useContext(PinnedImagesContext);
  if (!context) {
    throw new Error(
      "usePinnedImages must be used within a PinnedImagesProvider"
    );
  }
  return context;
};

export const PinBarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    const savedPinnedIds = localStorage.getItem("pinnedImageIds");
    if (savedPinnedIds) {
      setPinnedIds(JSON.parse(savedPinnedIds));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pinnedImageIds", JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  const pinImage = (id: string) => {
    console.log("pin image", id);
    setPinnedIds((prev) => [...prev, id]);
  };

  const unpinImage = (id: string) => {
    setPinnedIds((prev) => prev.filter((pinnedId) => pinnedId !== id));
  };

  console.log("why no pinImage", pinnedIds);

  return (
    <PinnedImagesContext.Provider value={{ pinnedIds, pinImage, unpinImage }}>
      {children}
    </PinnedImagesContext.Provider>
  );
};
