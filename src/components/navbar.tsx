"use client";

import { FC } from "react";
import Link from "next/link";

const Navbar: FC = () => {
  return (
    <nav className="z-[10] top-0 fixed w-full bg-white flex justify-between items-center px-2 h-[75px] border-b border-gray-200">
      <Link href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" className="w-[70px] h-[70px] p-2" alt="Logo" />
      </Link>
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 pl-10 pr-4 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
      <button className="bg-gray-800 text-white rounded-md px-4 py-2 cursor-pointer font-semibold mr-1">
        SIGN UP
      </button>
    </nav>
  );
};

export default Navbar;
