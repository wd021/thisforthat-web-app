"use client";

import { FC } from "react";

import Grid from "./grid";
import Activity from "./activity";

import { Filter } from "@/components";

import tempGridData from "@/temp/homeGrid.json";
import tempActivityData from "@/temp/activityFeed.json";

const Main: FC = () => {
  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <div className="w-full relative bg-[#f9f9f9] md:flex flex-col hidden overflow-y-auto hide-scrollbar">
        <div className="flex items-center px-4 py-2 gap-x-2 w-full">
          <Filter onFilterChange={() => {}} />
        </div>
        <Grid items={tempGridData.gridItems} />
      </div>
      <div className="border-l border-[#e5e5e5] w-[375px] bg-white md:flex hidden shrink-0">
        <Activity offers={tempActivityData.feed} />
      </div>
    </div>
  );
};

export default Main;
