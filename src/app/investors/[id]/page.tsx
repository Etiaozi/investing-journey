import { notFound } from "next/navigation";
import Link from "next/link";
import { investors } from "@/data/investors";

interface InvestorPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvestorPage({ params }: InvestorPageProps) {
  const { id } = await params;
  const investor = investors.find((i) => i.id === id);

  if (!investor) {
    notFound();
  }

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-6">
        <img
          src={investor.avatar}
          alt={investor.name}
          className="w-24 h-24 rounded-full object-cover border-2 border-[#d2d2d7]"
        />
        <div>
          <h1 className="text-4xl font-bold text-[#1d1d1f]">{investor.name}</h1>
          <p className="text-lg text-[#6e6e73]">{investor.nameEn}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-[#d2d2d7] p-8">
        <p className="text-lg text-[#1d1d1f] mb-6">{investor.bio}</p>
        <div className="flex flex-wrap gap-2">
          {investor.tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 bg-[#f5f5f7] text-[#6e6e73] rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <section>
        <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8">文章列表</h2>
        <div className="space-y-4">
          {investor.articles.map((article) => (
            <Link
              key={article.id}
              href={`/investors/${investor.id}/articles/${article.id}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#d2d2d7] p-6 block"
            >
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">{article.title}</h3>
              <div className="flex gap-4 text-sm text-[#6e6e73]">
                <span>{article.date}</span>
                <span>·</span>
                <span>{article.source}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
