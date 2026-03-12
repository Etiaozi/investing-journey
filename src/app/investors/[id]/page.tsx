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

      {investor.books.length > 0 && (
        <section>
          <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8">书籍与回忆录</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investor.books.map((book) => (
              <Link
                key={book.id}
                href={`/investors/${investor.id}/books/${book.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#d2d2d7] p-6 block"
              >
                {book.cover && (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <div className="text-sm text-[#6e6e73] mb-1">{book.publicationYear}</div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">{book.title}</h3>
                <p className="text-sm text-[#6e6e73]">作者：{book.author}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href={`/investors/${investor.id}/books`}
              className="text-[#0071e3] hover:underline"
            >
              查看全部 →
            </Link>
          </div>
        </section>
      )}

      {investor.shareholderLetters.length > 0 && (
        <section>
          <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8">致股东信</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investor.shareholderLetters.map((letter) => (
              <Link
                key={letter.id}
                href={`/investors/${investor.id}/shareholder-letters/${letter.id}`}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#d2d2d7] p-6 block"
              >
                <div className="text-4xl font-bold text-[#0071e3] mb-2">{letter.year}</div>
                <h3 className="text-lg font-semibold text-[#1d1d1f] mb-2">{letter.titleZh}</h3>
                <div className="text-sm text-[#6e6e73]">{letter.date}</div>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href={`/investors/${investor.id}/shareholder-letters`}
              className="text-[#0071e3] hover:underline"
            >
              查看全部 →
            </Link>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8">文章列表</h2>
        <div className="space-y-4">
          {investor.articles.map((article) => (
            <Link
              key={article.id}
              href={`/investors/${investor.id}/articles/${article.id}`}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#d2d2d7] p-6 block"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-[#0071e3] text-white rounded text-xs">
                  {article.type === "interview" ? "采访" : 
                   article.type === "news" ? "新闻" : 
                   article.type === "event" ? "事件" : 
                   article.type === "speech" ? "演讲" : 
                   article.type === "book-excerpt" ? "书籍摘录" : "其他"}
                </span>
              </div>
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
