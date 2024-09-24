import { Navbar } from "@/components";
import { Main } from "@/components/home";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Navbar />
      <Main />
    </div>
  );
}
