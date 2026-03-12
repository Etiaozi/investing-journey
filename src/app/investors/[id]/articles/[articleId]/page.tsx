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
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-[#0071e3] text-white rounded-full text-sm">
            {article.type === "interview" ? "采访" : 
             article.type === "news" ? "新闻" : 
             article.type === "event" ? "事件" : 
             article.type === "speech" ? "演讲" : 
             article.type === "book-excerpt" ? "书籍摘录" : "其他"}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-[#1d1d1f]">{article.title}</h1>
        {article.titleEn && <p className="text-xl text-[#6e6e73]">{article.titleEn}</p>}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-[#f5f5f7] text-[#6e6e73] rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-4 text-sm text-[#6e6e73]">
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.source}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-[#d2d2d7] p-8 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">中文内容</h2>
          <div className="text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
            {article.content}
          </div>
        </section>

        {article.contentEn && (
          <>
            <hr className="border-[#d2d2d7]" />
            <section>
              <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">English Content</h2>
              <div className="text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                {article.contentEn}
              </div>
            </section>
          </>
        )}
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
