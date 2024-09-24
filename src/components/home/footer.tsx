// Footer is shown only on mobile to toggle btw feed & acivity
import { FC } from "react";

const Footer: FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-300 md:hidden">
      <div className="flex">
        <button className="flex-1 py-2 text-center">Left</button>
        <button className="flex-1 py-2 text-center">Right</button>
      </div>
    </div>
  );
};

export default Footer;
