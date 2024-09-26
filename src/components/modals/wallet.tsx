"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-modal";

import { Close } from "@/icons";

interface Props {
  closeModal: () => void;
}

interface NFT {
  id: number;
  name: string;
  image: string;
  verified: boolean;
}

type VerificationStatus = "pending" | "verified" | "failed";

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

  const [step, setStep] = useState<number>(0);
  const [action, setAction] = useState<"add" | "verify" | null>(null);
  const [walletInput, setWalletInput] = useState<string>("");
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNfts, setSelectedNfts] = useState<number[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<
    Record<number, VerificationStatus>
  >({});

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchNFTs = async (walletInput: string): Promise<void> => {
    // Mock API call to fetch NFTs
    // Replace with actual API call in production
    const mockNFTs: NFT[] = [
      {
        id: 1,
        name: "Cool Cat #1",
        image: "https://via.placeholder.com/150",
        verified: false,
      },
      {
        id: 2,
        name: "Bored Ape #42",
        image: "https://via.placeholder.com/150",
        verified: true,
      },
      {
        id: 3,
        name: "Crypto Punk #1337",
        image: "https://via.placeholder.com/150",
        verified: false,
      },
    ];
    setNfts(mockNFTs);
  };

  const handleActionSelect = (selectedAction: "add" | "verify"): void => {
    setAction(selectedAction);
    setStep(1);
  };

  const handleNFTSelect = (nftId: number): void => {
    setSelectedNfts((prev) =>
      prev.includes(nftId)
        ? prev.filter((id) => id !== nftId)
        : [...prev, nftId]
    );
  };

  const handleSelectAll = (): void => {
    setSelectedNfts(nfts.map((nft) => nft.id));
  };

  const handleImport = (): void => {
    // Mock import function
    console.log("Importing NFTs:", selectedNfts);
    closeModal();
  };

  const handleVerify = async (): Promise<void> => {
    // Mock verification process
    setStep(2);
    for (const nftId of selectedNfts) {
      setVerificationStatus((prev) => ({ ...prev, [nftId]: "pending" }));
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate blockchain transaction
      setVerificationStatus((prev) => ({ ...prev, [nftId]: "verified" }));
    }
  };

  const renderStepContent = (): JSX.Element | null => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Choose an action</h2>
            <button
              onClick={() => handleActionSelect("add")}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
            >
              Add my NFTs
            </button>
            <button
              onClick={() => handleActionSelect("verify")}
              className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
            >
              Verify my NFTs
            </button>
          </div>
        );
      case 1:
        return action === "add" ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Add your NFTs</h2>
            <input
              type="text"
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="Enter wallet address or ENS"
              className="w-full p-2 border rounded"
            />
            <button
              onClick={() => fetchNFTs(walletInput)}
              className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
            >
              Fetch NFTs
            </button>
            {nfts.length > 0 && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {nfts.map((nft) => (
                    <div
                      key={nft.id}
                      onClick={() => handleNFTSelect(nft.id)}
                      className={`border p-2 rounded cursor-pointer ${
                        selectedNfts.includes(nft.id) ? "border-blue-500" : ""
                      }`}
                    >
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-auto"
                      />
                      <p className="mt-2 text-sm">{nft.name}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={handleSelectAll}
                    className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleImport}
                    className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                  >
                    Import Selected
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Verify your NFTs</h2>
            <div className="grid grid-cols-3 gap-4">
              {nfts
                .filter((nft) => !nft.verified)
                .map((nft) => (
                  <div
                    key={nft.id}
                    onClick={() => handleNFTSelect(nft.id)}
                    className={`border p-2 rounded cursor-pointer ${
                      selectedNfts.includes(nft.id) ? "border-green-500" : ""
                    }`}
                  >
                    <img
                      src={nft.image}
                      alt={nft.name}
                      className="w-full h-auto"
                    />
                    <p className="mt-2 text-sm">{nft.name}</p>
                  </div>
                ))}
            </div>
            <button
              onClick={handleVerify}
              className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
            >
              Verify Selected NFTs
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Verifying NFTs</h2>
            {selectedNfts.map((nftId) => {
              const nft = nfts.find((nft) => nft.id === nftId);
              if (!nft) return null;
              return (
                <div key={nftId} className="flex items-center justify-between">
                  <span>{nft.name}</span>
                  {verificationStatus[nftId] === "pending" ? (
                    <span className="text-yellow-500">Pending...</span>
                  ) : verificationStatus[nftId] === "verified" ? (
                    <span className="text-green-500">Verified</span>
                  ) : (
                    <span className="text-red-500">Failed</span>
                  )}
                </div>
              );
            })}
            {Object.values(verificationStatus).every(
              (status) => status === "verified"
            ) && (
              <button
                onClick={() => closeModal()}
                className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
              >
                Done
              </button>
            )}
          </div>
        );
      default:
        return null;
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
          {renderStepContent()}
        </div>
      </Modal>
    </div>
  );
};

export default Wallet;
