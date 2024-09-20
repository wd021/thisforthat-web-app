import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <Image src="/logo.png" alt="This for That" width={200} height={200} />
      <div className="text-2xl w-[360px] text-center">
        A Space Where We Swap NFTs for NFTs
      </div>
    </div>
  );
}
