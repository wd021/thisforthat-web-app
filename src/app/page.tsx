"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/utils/supabaseClient";

export default function Home() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const addToWaitlist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data } = await supabase
      .from("waitlist")
      .upsert({
        email,
      })
      .select();

    if (data) {
      setSuccess(true);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Image src="/logo.png" alt="This for That" width={200} height={200} />
      <div className="text-2xl w-[360px] text-center">
        A Space Where We Swap NFTs for NFTs
      </div>
      {!success && (
        <>
          <div className="mt-8 mb-4 text-lg">
            Launching in the coming weeks...
          </div>
          <form
            onSubmit={addToWaitlist}
            className="w-full px-4 max-w-[400px] space-y-4"
          >
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 bg-gray-200 rounded-md w-full p-4"
              placeholder="you@example.com"
            />
            <button
              type="submit"
              className="w-full p-4 border border-transparent rounded-md shadow-sm bg-blue-800 text-white text-lg"
            >
              Notify Me
            </button>
          </form>
        </>
      )}
      {success && (
        <div className="mt-12 text-gray-800 font-semibold px-10 text-center">
          Done, we&apos;ll notify you when the app is live. It&apos;s coming
          soon!
        </div>
      )}
    </div>
  );
}
