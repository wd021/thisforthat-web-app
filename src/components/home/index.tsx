"use client";

import { FC } from "react";
import Grid from "./grid";
import { Filter } from "@/components";
import tempGridData from "@/temp/homeGrid.json";
import { Pin } from "@/icons";

const HomeComponent: FC = () => {
  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <div className="w-full relative bg-[#f9f9f9] flex flex-col overflow-y-auto hide-scrollbar">
        <div className="flex items-center px-4 pt-4 gap-x-3 w-full">
          <Filter onFilterChange={() => {}} />
          <div className="bg-gray-100 w-12 h-12 rounded-full shrink-0 border-dashed	border-gray-300 border-2 flex items-center justify-center cursor-pointer">
            <Pin className="h-5 w-5 text-gray-300" />
          </div>
        </div>
        <Grid items={tempGridData.gridItems} />
      </div>
    </div>
  );
};

export default HomeComponent;
