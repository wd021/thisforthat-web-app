import { FC } from "react";
import { Navbar } from "@/components";
import ProfileComponent from "@/components/profile";

const UserPage: FC = () => {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <ProfileComponent />
    </div>
  );
};

export default UserPage;
