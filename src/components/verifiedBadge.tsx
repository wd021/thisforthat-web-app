"use client";

import React from "react";
import { Tooltip } from "react-tooltip";
import { Verified } from "@/icons";

interface VerifiedProps {
  isVerified: boolean;
  verifiedDate: string;
  className?: string;
}

const VerifiedBadge: React.FC<VerifiedProps> = ({
  isVerified,
  verifiedDate,
  className,
}) => (
  <div className={className}>
    {isVerified && (
      <>
        <Verified
          className="w-full h-full"
          data-tooltip-id={`verified-tooltip-${verifiedDate}`}
        />
        <Tooltip
          id={`verified-tooltip-${verifiedDate}`}
          place="bottom"
          content="ownership verified 12 days ago"
        />
      </>
    )}
  </div>
);

export default VerifiedBadge;
