import { FC } from "react";

import Grid from "./grid";
import Activity from "./activity";

import tempGridData from "@/temp/homeGrid.json";
import tempActivityData from "@/temp/activityFeed.json";

const Main: FC = () => {
  return (
    <div className="absolute top-[75px] bottom-0 w-full flex">
      <div
        id="leftPanel"
        className="w-full bg-gray-100 p-4 md:flex hidden overflow-y-auto hide-scrollbar"
      >
        <Grid items={tempGridData.gridItems} />
      </div>
      <div
        id="rightPanel"
        className="w-[450px] bg-gray-200 p-4 md:flex hidden shrink-0 overflow-y-auto hide-scrollbar"
      >
        <Activity offers={tempActivityData.feed} />
      </div>
    </div>
  );
};

export default Main;
