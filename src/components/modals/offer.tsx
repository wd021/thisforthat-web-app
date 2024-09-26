"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-modal";

interface Props {
  itemId: string;
  closeModal: () => void;
}

const Offer: React.FC<Props> = ({ itemId, closeModal }) => {
  const [selectedNFTs, setSelectedNFTs] = useState<string[]>([]);
  const [offerDetails, setOfferDetails] = useState("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would handle the submission logic
    console.log(`Submitted deal for item ${itemId}:`, {
      selectedNFTs,
      offerDetails,
    });
    closeModal();
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
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Make a Deal</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Select NFTs to offer:
              </label>
              {/* Replace this with your actual NFT selection component */}
              <select
                multiple
                value={selectedNFTs}
                onChange={(e) =>
                  setSelectedNFTs(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="nft1">NFT 1</option>
                <option value="nft2">NFT 2</option>
                <option value="nft3">NFT 3</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                htmlFor="offerDetails"
                className="block text-sm font-medium text-gray-700"
              >
                Offer Details:
              </label>
              <textarea
                id="offerDetails"
                value={offerDetails}
                onChange={(e) => setOfferDetails(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows={4}
                placeholder="Describe your offer..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => closeModal()}
                className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Submit Offer
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Offer;
