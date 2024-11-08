"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addToWaitlist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await supabase
        .from("waitlist")
        .upsert({
          email,
        })
        .select();

      if (data) {
        setSuccess(true);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-50">
      <div className="w-full max-w-md px-6 py-12 text-center">
        <Image
          src="/logo.png"
          alt="This for That"
          width={240}
          height={240}
          className="mx-auto"
        />

        <h1 className="text-3xl font-bold mb-3">
          NFTS were made to be swapped
        </h1>

        <p className="text-gray-600 mb-8 mt-8">
          Coming soon on Ethereum, Base, Optimism & more.
        </p>

        {!success ? (
          <form onSubmit={addToWaitlist} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Enter your email"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Join Waitlist"}
            </button>
          </form>
        ) : (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <p className="text-gray-800 font-medium">
              Thanks! We'll notify you when we launch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
