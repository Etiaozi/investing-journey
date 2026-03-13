import Link from "next/link";
import { Investor } from "@/data/investors";

interface InvestorCardProps {
  investor: Investor;
}

export default function InvestorCard({ investor }: InvestorCardProps) {
  return (
    <Link
      href={`/investors/${investor.id}`}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#d2d2d7] p-8 block"
    >
      <div className="flex flex-col items-center text-center mb-6">
        <img
          src={investor.avatar}
          alt={investor.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-[#d2d2d7] mb-4 shadow-lg"
        />
        <h3 className="text-2xl font-bold text-[#1d1d1f] mb-1">{investor.name}</h3>
        <p className="text-base text-[#6e6e73]">{investor.nameEn}</p>
      </div>
      <p className="text-[#1d1d1f] mb-6 text-center leading-relaxed">{investor.bio}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {investor.tags.map((tag) => (
          <span
            key={tag}
            className="px-4 py-2 bg-[#f5f5f7] text-[#6e6e73] rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
