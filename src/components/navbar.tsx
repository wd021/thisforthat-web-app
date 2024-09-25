"use client";

import { FC, useState } from "react";
import Link from "next/link";

import {
  Add as AddModal,
  Wallet as WalletModal,
  Login as LoginModal,
} from "@/components/modals";
import { Add, Wallet, User } from "@/icons";

const Navbar: FC = () => {
  const [modal, setModal] = useState<boolean | "login" | "wallet" | "add">(
    false
  );

  const isLoggedIn = true;

  return (
    <>
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
              className="w-full px-4 h-[44px] pl-10 pr-4 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        {isLoggedIn && (
          <div className="flex gap-x-2 h-[44px] relative mr-2">
            <button
              className="h-full w-[45px] h-full rounded-md bg-gray-100 flex items-center justify-center"
              onClick={() => setModal("add")}
            >
              <Add className="w-[22px] h-[22px] text-black" />
            </button>
            <button
              className="h-full w-[45px] h-full rounded-md bg-gray-100 flex items-center justify-center"
              onClick={() => setModal("wallet")}
            >
              <Wallet className="w-[22px] h-[22px] text-black" />
            </button>
            <Link
              href="/account"
              className="h-full w-[45px] h-full rounded-md bg-gray-100 flex items-center justify-center"
            >
              <User className="w-[22px] h-[22px] text-black" />
            </Link>
          </div>
        )}
        {!isLoggedIn && (
          <button
            className="bg-gray-800 text-white rounded-md px-4 py-2 cursor-pointer font-semibold mr-1 h-[44px]"
            onClick={() => setModal("login")}
          >
            LOGIN
          </button>
        )}
      </nav>
      {modal === "add" && <AddModal closeModal={() => setModal(false)} />}
      {modal === "wallet" && <WalletModal closeModal={() => setModal(false)} />}
      {modal === "login" && <LoginModal closeModal={() => setModal(false)} />}
    </>
  );
};

export default Navbar;
