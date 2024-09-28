import { Navbar } from "@/components";
import HomeComponent from "@/components/home";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <HomeComponent />
    </div>
  );
}
