"use client";

import { FC } from "react";
import Grid from "./grid";
import { Filter } from "@/components";
import tempGridData from "@/temp/homeGrid.json";
import { PinBar } from "@/components";

import ActivityFeed from "./activityFeed";

const HomeComponent: FC = () => {
  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <div className="w-full relative bg-[#f9f9f9] flex">
        <div className="overflow-y-auto hide-scrollbar">
          <div className="flex items-center px-6 pt-4 gap-x-3 w-full">
            <PinBar />
            <div className="ml-auto">
              <Filter onFilterChange={() => {}} />
            </div>
          </div>
          <Grid items={tempGridData.gridItems} />
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
};

export default HomeComponent;
