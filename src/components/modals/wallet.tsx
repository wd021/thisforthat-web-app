"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-modal";

import { Close } from "@/icons";
import { supabase } from "@/utils/supabaseClient";

interface Props {
  closeModal: () => void;
}

const Wallet: React.FC<Props> = ({ closeModal }) => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          <div>this modal is for signing and verifying</div>
        </div>
      </Modal>
    </div>
  );
};

export default Wallet;
