import { notFound } from "next/navigation";
import Link from "next/link";
import { investors } from "@/data/investors";

interface ArticlePageProps {
  params: Promise<{ id: string; articleId: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id, articleId } = await params;
  const investor = investors.find((i) => i.id === id);
  const article = investor?.articles.find((a) => a.id === articleId);

  if (!investor || !article) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Link
        href={`/investors/${investor.id}`}
        className="text-[#0071e3] hover:underline inline-flex items-center gap-2 mb-4"
      >
        ← 返回 {investor.name}
      </Link>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-[#1d1d1f]">{article.title}</h1>
        <div className="flex gap-4 text-sm text-[#6e6e73]">
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.source}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-[#d2d2d7] p-8">
        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">文章内容</h2>
        <p className="text-[#1d1d1f] leading-relaxed">{article.content}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-[#d2d2d7] p-8">
        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">💡 核心观点</h2>
        <ul className="space-y-3">
          {article.coreViews.map((view, index) => (
            <li key={index} className="flex gap-3">
              <span className="text-[#0071e3] font-bold mt-1">•</span>
              <span className="text-[#1d1d1f]">{view}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-[#d2d2d7] p-8">
        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">📈 投资建议</h2>
        <ul className="space-y-3">
          {article.investmentAdvice.map((advice, index) => (
            <li key={index} className="flex gap-3">
              <span className="text-[#0071e3] font-bold mt-1">•</span>
              <span className="text-[#1d1d1f]">{advice}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
