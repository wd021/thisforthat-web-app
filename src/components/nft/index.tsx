"use client";

import { FC } from "react";

const NFTComponent: FC = () => {
  return (
    <div className="absolute top-[75px] bottom-0 w-full flex justify-center mt-[20px] gap-x-4">
      <div>
        <img src="/temp/nft.png" className="w-[500px] h-[500px]" />
        <div>fred wilson</div>
        <div>info</div>
      </div>
      <div className="w-[550px] bg-white">hey</div>
    </div>
  );
};

export default NFTComponent;
