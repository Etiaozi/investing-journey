import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#d2d2d7]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold text-[#1d1d1f]">
          投资智慧
        </Link>
        <div className="flex gap-8 items-center">
          <Link href="/" className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
            首页
          </Link>
          <Link href="/about" className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
            关于
          </Link>
          <Link href="/portfolio" className="text-[#1d1d1f] hover:text-[#0071e3] transition-colors">
            自选奔富
          </Link>
          <Link
            href="/login"
            className="text-sm px-4 py-1.5 rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors"
          >
            登录
          </Link>
        </div>
      </div>
    </nav>
  );
}
