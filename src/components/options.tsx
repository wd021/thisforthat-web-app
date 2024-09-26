"use client";

import { FC, useState, useRef, useEffect } from "react";
import { Options as OptionsIcon } from "@/icons";

interface OptionsProps {
  onOptionSelect: (option: string) => void;
}

const Options: FC<OptionsProps> = ({ onOptionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    onOptionSelect(option);
    setIsOpen(false);
  };

  const options = [
    { label: "Copy Link" },
    { label: "Download" },
    { label: "View On OpenSea" },
  ];

  return (
    <div className="relative mr-3 mt-2" ref={dropdownRef}>
      <button type="button" onClick={toggleDropdown} aria-label="More options">
        <OptionsIcon className="text-white" />
      </button>

      {isOpen && (
        <div className="absolute mt-[-4px] right-[-4px] w-[180px] bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {options.map((option) => (
              <button
                key={option.label}
                className="flex items-center justify-end w-full px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  handleOptionClick(option.label);
                }}
                role="menuitem"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Options;
