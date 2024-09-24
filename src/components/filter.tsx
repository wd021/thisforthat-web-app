"use client";

import { Filter } from "@/icons";
import Checkmark from "@/icons/checkmark";
import React, { useState } from "react";

type FilterOption = "latest" | "mostOffers" | "mostWanted";

interface BubbleFilterProps {
  onFilterChange: (filter: FilterOption) => void;
}

const BubbleFilter: React.FC<BubbleFilterProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("latest");

  const filters: { value: FilterOption; label: string }[] = [
    { value: "latest", label: "Latest" },
    { value: "mostOffers", label: "Most Offers" },
    { value: "mostWanted", label: "Most Wanted" },
  ];

  const handleFilterClick = (filter: FilterOption) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-10">
      <div>
        <button
          type="button"
          className="flex justify-center items-center w-12 h-12 rounded-full border border-gray-200 bg-white text-gray-700 p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Filter options"
        >
          <Filter />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`${
                  selectedFilter === filter.value
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700"
                } block w-full text-left px-4 py-2 hover:bg-gray-100 hover:text-gray-900 flex justify-between items-center`}
                role="menuitem"
                onClick={() => handleFilterClick(filter.value)}
              >
                {filter.label}
                {selectedFilter === filter.value && (
                  <Checkmark className="w-5 h-5" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BubbleFilter;
