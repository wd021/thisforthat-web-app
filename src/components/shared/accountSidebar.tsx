import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const AccountSidebar: FC = () => {
  const pathname = usePathname();

  const tabs = [
    { name: "Activity", href: "/account/activity" },
    { name: "My NFTs", href: "/account/nfts" },
    { name: "DMs", href: "/account/messages" },
    { name: "Followers", href: "/account/followers" },
    { name: "Edit Profile", href: "/account/profile" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="w-64 bg-gray-100 p-4 flex flex-col">
      {tabs.map((tab) => (
        <Link
          key={tab.name}
          className={`p-2 text-lg ${
            isActive(tab.href) ? "underline font-bold" : ""
          }`}
          href={tab.href}
        >
          {tab.name}
        </Link>
      ))}
      <Link
        href="/user/1"
        className="mt-4 w-full bg-blue-500 text-white p-2 rounded text-center"
      >
        View My Public Profile
      </Link>
      <button className="mt-4 w-full bg-red-500 text-white p-2 rounded">
        Sign Out
      </button>
    </div>
  );
};

export default AccountSidebar;
