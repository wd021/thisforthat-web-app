"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";

import { Close, Google } from "@/icons";
import { supabase } from "@/utils/supabaseClient";

interface Props {
  closeModal: () => void;
}

const Login: React.FC<Props> = ({ closeModal }) => {
  const [isMobile, setIsMobile] = useState(false);

  const customStyles = {
    content: {
      // Common styles
      overflow: "visible",
      background: "#fff",
      color: "#000",
      // Conditional styles based on `isMobile`
      top: isMobile ? "0" : "50%",
      left: isMobile ? "0" : "50%",
      right: isMobile ? "0" : "auto",
      bottom: isMobile ? "0" : "auto",
      width: isMobile ? "100%" : "90%",
      maxWidth: isMobile ? "100%" : "550px",
      height: isMobile ? "100%" : "auto",
      margin: isMobile ? "0" : "auto",
      borderRadius: isMobile ? "0" : "15px",
      transform: isMobile ? "none" : "translate(-50%, -50%)",
      border: "none",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 100,
    },
  };

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 640);
    }

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URL,
      },
    });
    if (error) {
      console.error("Login failed:", error.message);
    }
  };

  return (
    <div>
      <Modal
        id="react-modal"
        ariaHideApp={false}
        isOpen={true}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="absolute top-0 right-0 w-[75px] h-[75px] flex items-center justify-center cursor-pointer"
            onClick={closeModal}
          >
            <Close width="32" height="32" />
          </div>
          <Image src="/logo.png" alt="VoiceJam Logo" width={250} height={250} />
          <div className="text-3xl font-bold mb-2">JOIN TFT</div>
          <div className="text-xl mb-2">A space to swap NFTs for NFTs</div>
          <div className="my-6 flex flex-col items-center gap-y-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-[325px] text-2xl bg-black text-white font-bold px-4 py-3 rounded-lg transition duration-300 ease-in-out transform lg:hover:-translate-y-1 lg:hover:scale-110 cursor-pointer flex items-center justify-center"
            >
              <Google className="mr-2 w-10 h-10" />
              Login with Google
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Login;
