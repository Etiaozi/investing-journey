import Link from "next/link";
import { Investor } from "@/data/investors";

interface InvestorCardProps {
  investor: Investor;
}

export default function InvestorCard({ investor }: InvestorCardProps) {
  const hasArticles = investor.articles.length > 0;
  const hasBooks = investor.books.length > 0;

  return (
    <Link
      href={`/investors/${investor.id}`}
      className="group bg-white rounded-[18px] hover:shadow-lg transition-all duration-300 ease-out border border-[#e8e8ed] hover:border-[#d2d2d7] p-7 md:p-8 block"
    >
      <div className="flex items-center gap-5 mb-5">
        <div className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-full overflow-hidden flex-shrink-0 border-2 border-[#e8e8ed] shadow-sm">
          <img
            src={investor.avatar}
            alt={investor.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-[17px] md:text-[19px] font-semibold text-[#1d1d1f] leading-tight group-hover:text-[#0071e3] transition-colors duration-200">
            {investor.name}
          </h3>
          <p className="text-[13px] text-[#6e6e73] mt-0.5">{investor.nameEn}</p>
        </div>
      </div>

      <p className="text-[14px] text-[#1d1d1f] leading-relaxed mb-5 line-clamp-2">
        {investor.bio}
      </p>

      <div className="flex flex-wrap gap-2">
        {investor.tags.map((tag) => (
          <span
            key={tag}
            className="text-[12px] text-[#6e6e73] bg-[#f5f5f7] rounded-full px-3 py-1.5"
          >
            {tag}
          </span>
        ))}
        {hasArticles && (
          <span className="text-[12px] text-[#0071e3] bg-[#e8f0fe] rounded-full px-3 py-1.5">
            {investor.articles.length} 篇文章
          </span>
        )}
        {hasBooks && (
          <span className="text-[12px] text-[#e67e22] bg-[#fef3e0] rounded-full px-3 py-1.5">
            {investor.books.length} 本著作
          </span>
        )}
      </div>
    </Link>
  );
}
