import { FC } from "react";
import { ActivityFeed, Navbar } from "@/components";
import ProfileComponent from "@/components/profile";

const UserPage: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <ProfileComponent />
      <ActivityFeed />
    </div>
  );
};

export default UserPage;
