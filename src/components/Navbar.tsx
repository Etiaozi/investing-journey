import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#d2d2d7]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold text-[#1d1d1f]">
          投资智慧
        </Link>
        <div className="flex gap-8">
          <Link href="/" className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
            首页
          </Link>
          <Link href="/about" className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
            关于
          </Link>
        </div>
      </div>
    </nav>
  );
}
