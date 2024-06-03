import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col space-y-4 p-4">
      <Link href="/map" className="flex p-2 border-t-2 hover:bg-gray-200">
        Map
      </Link>
      <Link href="/scroll" className="flex p-2 border-t-2 hover:bg-gray-200">
        Scorll Test
      </Link>
    </div>
  );
}
