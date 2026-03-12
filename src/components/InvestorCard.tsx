import Link from "next/link";
import { Investor } from "@/data/investors";

interface InvestorCardProps {
  investor: Investor;
}

export default function InvestorCard({ investor }: InvestorCardProps) {
  return (
    <Link
      href={`/investors/${investor.id}`}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#d2d2d7] p-6 block"
    >
      <div className="flex items-center gap-4 mb-4">
        <img
          src={investor.avatar}
          alt={investor.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-[#d2d2d7]"
        />
        <div>
          <h3 className="text-xl font-semibold text-[#1d1d1f]">{investor.name}</h3>
          <p className="text-sm text-[#6e6e73]">{investor.nameEn}</p>
        </div>
      </div>
      <p className="text-[#1d1d1f] mb-4">{investor.bio}</p>
      <div className="flex flex-wrap gap-2">
        {investor.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-[#f5f5f7] text-[#6e6e73] rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
