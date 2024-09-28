import React, { useState, useEffect, useRef } from "react";
import Modal from "react-modal";
import { Close } from "@/icons";
import Link from "next/link";
import { Checkmark } from "@/icons";

interface Props {
  itemId: string;
  closeModal: () => void;
}

interface DealParty {
  id: string;
  name: string;
  avatar: string;
}

interface DealAsset {
  type: "NFT" | "Token";
  name: string;
  image?: string;
  amount?: string;
}

interface DealInteraction {
  id: string;
  type: "message" | "offer" | "counterOffer" | "rejection";
  sender: string;
  content: string;
  timestamp: Date;
  offer?: {
    giving: DealAsset[];
    receiving: DealAsset[];
  };
}

interface DealStatus {
  stage:
    | "negotiation"
    | "accepted"
    | "deposit"
    | "confirmation"
    | "execution"
    | "completed";
  party1Completed?: boolean;
  party2Completed?: boolean;
}

interface DealStage {
  key: "accepted" | "deposit" | "confirmation" | "execution" | "completed";
  label: string;
  description: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: "message" | "offer" | "counterOffer" | "rejection" | "acceptance";
  offer?: {
    giving: DealAsset[];
    receiving: DealAsset[];
  };
}

const Deal: React.FC<Props> = ({ itemId, closeModal }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [dealStatus, setDealStatus] = useState<DealStatus>({
    stage: "negotiation",
  });
  const [interactions, setInteractions] = useState<DealInteraction[]>([]);
  const [showDealDetails, setShowDealDetails] = useState(false);

  const [showAcceptanceOverlay, setShowAcceptanceOverlay] = useState(false);
  const [currentStage, setCurrentStage] =
    useState<DealStage["key"]>("accepted");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isMessageInputVisible, setIsMessageInputVisible] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat when new messages are added
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isMessageInputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMessageInputVisible]);

  useEffect(() => {
    // Initialize with the initial offer
    setMessages([
      {
        id: "1",
        sender: "Alice",
        content: "Initial offer",
        timestamp: new Date(),
        type: "offer",
        offer: {
          giving: [{ type: "Token", name: "ETH", amount: "2.5" }],
          receiving: [
            {
              type: "NFT",
              name: "CryptoPunk #1234",
              image: "/temp/cryptopunk.png",
            },
          ],
        },
      },
    ]);
  }, []);

  // Mock data
  const offeror: DealParty = {
    id: "1",
    name: "Alice",
    avatar: "/temp/alice-avatar.png",
  };

  const recipient: DealParty = {
    id: "2",
    name: "Bob",
    avatar: "/temp/bob-avatar.png",
  };

  const initialOffer: DealInteraction = {
    id: "1",
    type: "offer",
    sender: offeror.id,
    content: "Initial offer",
    timestamp: new Date(),
    offer: {
      giving: [{ type: "Token", name: "ETH", amount: "2.5" }],
      receiving: [
        {
          type: "NFT",
          name: "CryptoPunk #1234",
          image: "/temp/cryptopunk.png",
        },
      ],
    },
  };

  const dealStages: DealStage[] = [
    {
      key: "accepted",
      label: "Deal Accepted",
      description: "Both parties have agreed to the terms of the deal.",
    },
    {
      key: "deposit",
      label: "Deposit Assets",
      description: "Deposit your assets to the smart contract.",
    },
    {
      key: "confirmation",
      label: "Confirm Deposits",
      description:
        "Verify that both parties have deposited the correct assets.",
    },
    {
      key: "execution",
      label: "Execute Trade",
      description: "The smart contract is executing the asset swap.",
    },
    {
      key: "completed",
      label: "Trade Completed",
      description: "The trade has been successfully completed.",
    },
  ];

  useEffect(() => {
    setInteractions([initialOffer]);

    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const customStyles = {
    content: {
      overflow: "visible",
      background: "#fff",
      color: "#000",
      top: isMobile ? "0" : "50%",
      left: isMobile ? "0" : "50%",
      right: isMobile ? "0" : "auto",
      bottom: isMobile ? "0" : "auto",
      width: isMobile ? "100%" : "90%",
      maxWidth: isMobile ? "100%" : "550px",
      height: isMobile ? "100%" : "90%",
      margin: isMobile ? "0" : "auto",
      borderRadius: isMobile ? "0" : "15px",
      transform: isMobile ? "none" : "translate(-50%, -50%)",
      border: "none",
      padding: 0,
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 100,
    },
  };

  const renderInteraction = (interaction: DealInteraction) => {
    switch (interaction.type) {
      case "message":
        return (
          <div className="bg-gray-100 p-3 rounded-lg mb-2">
            <p>{interaction.content}</p>
          </div>
        );
      case "offer":
      case "counterOffer":
        return (
          <div className="bg-blue-100 p-3 rounded-lg mb-2">
            <p className="font-bold">
              {interaction.type === "offer" ? "Offer" : "Counter Offer"}
            </p>
            <p>{interaction.content}</p>
            <button
              onClick={() => setShowDealDetails(true)}
              className="text-blue-500 underline mt-2"
            >
              View Details
            </button>
          </div>
        );
      case "rejection":
        return (
          <div className="bg-red-100 p-3 rounded-lg mb-2">
            <p className="font-bold">Offer Rejected</p>
            <p>{interaction.content}</p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderDealDetails = () => {
    if (!showDealDetails) return null;

    const latestOffer = interactions
      .filter((i) => i.type === "offer" || i.type === "counterOffer")
      .pop();
    if (!latestOffer?.offer) return null;

    return (
      <div className="absolute inset-0 bg-white z-10 p-6 overflow-y-auto rounded-[15px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Deal Details</h3>
          <button
            onClick={() => setShowDealDetails(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Close className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-semibold mb-2">Giving:</h4>
            {latestOffer.offer.giving.map((asset, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                {asset.image && (
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                <p>
                  {asset.amount} {asset.name}
                </p>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-2">Receiving:</h4>
            {latestOffer.offer.receiving.map((asset, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                {asset.image && (
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                <p>
                  {asset.amount} {asset.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDealProgress = () => {
    if (dealStatus.stage === "negotiation") return null;

    const steps = [
      { key: "accepted", label: "Deal Accepted" },
      { key: "deposit", label: "Deposit Assets" },
      { key: "confirmation", label: "Confirm Deposits" },
      { key: "execution", label: "Execute Trade" },
      { key: "completed", label: "Trade Completed" },
    ];

    return (
      <div className="mt-4 border-t pt-4">
        <h3 className="text-lg font-bold mb-2">Deal Progress</h3>
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
                  dealStatus.stage === step.key
                    ? "bg-blue-500 text-white"
                    : index < steps.findIndex((s) => s.key === dealStatus.stage)
                    ? "bg-green-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                {index < steps.findIndex((s) => s.key === dealStatus.stage)
                  ? "✓"
                  : index + 1}
              </div>
              <span>{step.label}</span>
              {step.key === "deposit" && (
                <div className="ml-auto">
                  <span
                    className={
                      dealStatus.party1Completed
                        ? "text-green-500"
                        : "text-gray-500"
                    }
                  >
                    You
                  </span>
                  <span className="mx-1">|</span>
                  <span
                    className={
                      dealStatus.party2Completed
                        ? "text-green-500"
                        : "text-gray-500"
                    }
                  >
                    Counterparty
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAcceptanceOverlay = () => {
    if (!showAcceptanceOverlay) return null;

    return (
      <div className="absolute inset-0 bg-white z-20 flex flex-col">
        <div className="border-b p-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold">Deal Acceptance Process</h3>
          <button
            onClick={() => setShowAcceptanceOverlay(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Close className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {/* Progress header */}
          <div className="flex justify-between p-4 bg-gray-100">
            {dealStages.map((stage, index) => (
              <button
                key={stage.key}
                onClick={() => setCurrentStage(stage.key)}
                className={`flex flex-col items-center space-y-2 ${
                  currentStage === stage.key ? "text-blue-600" : "text-gray-500"
                }`}
                disabled={
                  index > dealStages.findIndex((s) => s.key === currentStage)
                }
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= dealStages.findIndex((s) => s.key === currentStage)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {index <
                  dealStages.findIndex((s) => s.key === currentStage) ? (
                    <Checkmark className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-center">{stage.label}</span>
              </button>
            ))}
          </div>

          {/* Stage details */}
          <div className="p-6">
            <h4 className="text-xl font-semibold mb-4">
              {dealStages.find((s) => s.key === currentStage)?.label}
            </h4>
            <p className="mb-6">
              {dealStages.find((s) => s.key === currentStage)?.description}
            </p>

            {/* Render stage-specific content */}
            {currentStage === "deposit" && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p className="font-bold">Action Required:</p>
                <p>
                  Please deposit your assets to the smart contract address:
                  0x1234...5678
                </p>
                {/* Add deposit form or integration with wallet here */}
              </div>
            )}

            {currentStage === "confirmation" && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                <p className="font-bold">Verification:</p>
                <p>
                  Please verify that the following assets have been deposited:
                </p>
                {/* Add list of deposited assets here */}
              </div>
            )}

            {currentStage === "execution" && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-bold">In Progress:</p>
                <p>
                  The smart contract is currently executing the asset swap. This
                  process is automatic and may take a few minutes.
                </p>
                {/* Add progress indicator or transaction hash here */}
              </div>
            )}

            {currentStage === "completed" && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p className="font-bold">Success:</p>
                <p>
                  The trade has been successfully completed. You should now see
                  the new assets in your wallet.
                </p>
                {/* Add transaction details or link to block explorer here */}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => {
                  const currentIndex = dealStages.findIndex(
                    (s) => s.key === currentStage
                  );
                  if (currentIndex > 0) {
                    setCurrentStage(dealStages[currentIndex - 1].key);
                  }
                }}
                disabled={currentStage === "accepted"}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const currentIndex = dealStages.findIndex(
                    (s) => s.key === currentStage
                  );
                  if (currentIndex < dealStages.length - 1) {
                    setCurrentStage(dealStages[currentIndex + 1].key);
                  } else {
                    setShowAcceptanceOverlay(false);
                    // Handle deal completion here
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {currentStage === "completed" ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAcceptDeal = () => {
    setShowAcceptanceOverlay(true);
    setCurrentStage("accepted");
    // In a real app, you'd send this acceptance to the server
  };

  const renderChatInterface = () => (
    <div className="flex-grow overflow-y-auto p-4">
      {messages.map((message) => (
        <div key={message.id} className="flex flex-col">
          {renderChatBubble(message)}
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );

  const renderActionItems = () => {
    if (dealStatus.stage !== "negotiation") return null;

    if (isMessageInputVisible) {
      return (
        <div className="border-t p-4 flex items-center bg-gray-100">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white rounded-r-lg px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
            {/* <Send className="w-5 h-5" /> */}
          </button>
          <button
            onClick={() => setIsMessageInputVisible(false)}
            className="ml-2 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      );
    }

    return (
      <div className="border-t p-4 flex justify-between bg-gray-100">
        <button
          onClick={handleAcceptDeal}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Accept Deal
        </button>
        <button
          onClick={handleCounterOffer}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          Counter Offer
        </button>
        <button
          onClick={() => setIsMessageInputVisible(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send Message
        </button>
        <button
          onClick={handleRemoveDeal}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Remove Deal
        </button>
      </div>
    );
  };

  const handleCounterOffer = () => {
    // Placeholder: In a real app, you'd open a form to create a counter offer
    const counterOffer: ChatMessage = {
      id: String(messages.length + 1),
      sender: "You",
      content: "I'd like to make a counter offer.",
      timestamp: new Date(),
      type: "counterOffer",
      offer: {
        giving: [{ type: "Token", name: "ETH", amount: "2.0" }],
        receiving: [
          {
            type: "NFT",
            name: "CryptoPunk #1234",
            image: "/temp/cryptopunk.png",
          },
        ],
      },
    };
    setMessages([...messages, counterOffer]);
  };

  const renderChatBubble = (message: ChatMessage) => {
    const isCurrentUser = message.sender === "You"; // Replace with actual current user check
    const bubbleClass = isCurrentUser
      ? "bg-blue-500 text-white self-end"
      : "bg-gray-200 text-gray-800 self-start";

    return (
      <div className={`max-w-[70%] rounded-lg p-3 mb-2 ${bubbleClass}`}>
        <div className="font-bold mb-1">{message.sender}</div>
        <div>{message.content}</div>
        {message.type === "offer" || message.type === "counterOffer" ? (
          <button
            onClick={() => setShowDealDetails(true)}
            className="text-sm underline mt-2"
          >
            View Offer Details
          </button>
        ) : null}
        <div className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    );
  };

  const handleSendMessage = () => {
    // In a real app, you'd open a message input or add the message to the interactions
    console.log("Send message");
  };

  const handleRemoveDeal = () => {
    // Placeholder: In a real app, you'd send a request to remove the deal
    const removeDealMessage: ChatMessage = {
      id: String(messages.length + 1),
      sender: "You",
      content: "I've decided to remove this deal.",
      timestamp: new Date(),
      type: "rejection",
    };
    setMessages([...messages, removeDealMessage]);
    // You might want to close the modal or update the deal status here
  };
  return (
    <Modal
      isOpen={true}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Deal Modal"
    >
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="border-b p-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              src={offeror.avatar}
              alt={offeror.name}
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <p className="font-semibold">{offeror.name}</p>
              <p className="text-sm text-gray-500">
                Offer made {initialOffer.timestamp.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-sm font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {dealStatus.stage.charAt(0).toUpperCase() +
              dealStatus.stage.slice(1)}
          </div>
          <Link href={`/nft/1/1/1`} onClick={closeModal}>
            <Close className="w-6 h-6" />
          </Link>
        </div>

        {/* Chat interface */}
        {renderChatInterface()}

        {/* Action items or Message input */}
        {renderActionItems()}

        {/* Render deal details overlay */}
        {renderDealDetails()}

        {/* Render acceptance process overlay */}
        {renderAcceptanceOverlay()}
      </div>
    </Modal>
  );
};

export default Deal;
