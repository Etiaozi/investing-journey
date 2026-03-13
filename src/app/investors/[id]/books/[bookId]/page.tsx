import { notFound } from "next/navigation";
import Link from "next/link";
import { investors } from "@/data/investors";

interface BookDetailPageProps {
  params: Promise<{ id: string; bookId: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id, bookId } = await params;
  const investor = investors.find((i) => i.id === id);

  if (!investor) {
    notFound();
  }

  const book = investor.books.find((b) => b.id === bookId);

  if (!book) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/investors/${investor.id}/books`} className="text-[#0071e3] hover:underline">
          ← 返回列表
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-[#d2d2d7] p-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {book.cover && (
            <img
              src={book.cover}
              alt={book.title}
              className="w-64 h-80 object-cover rounded-xl shadow-lg"
            />
          )}
          <div className="flex-1">
            <div className="text-sm text-[#6e6e73] mb-2">{book.publicationYear}</div>
            <h1 className="text-4xl font-bold text-[#1d1d1f] mb-2">{book.title}</h1>
            <p className="text-xl text-[#6e6e73] mb-4">{book.titleEn}</p>
            <p className="text-lg text-[#1d1d1f] mb-4">作者：{book.author} / {book.authorEn}</p>
            {book.link && (
              <a
                href={book.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0071e3] text-white px-6 py-3 rounded-full hover:bg-[#0077ed] transition-colors"
              >
                📚 查看原著
              </a>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">内容简介</h2>
            <div className="text-lg text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {book.description}
            </div>
          </section>

          {book.descriptionEn && (
            <>
              <hr className="border-[#d2d2d7]" />
              <section>
                <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">Description</h2>
                <div className="text-lg text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
                  {book.descriptionEn}
                </div>
              </section>
            </>
          )}

          <hr className="border-[#d2d2d7]" />

          <section>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">核心观点</h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-[#1d1d1f]">
              {book.coreViews.map((view, index) => (
                <li key={index}>{view}</li>
              ))}
            </ul>
          </section>

          <hr className="border-[#d2d2d7]" />

          <section>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">投资建议</h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-[#1d1d1f]">
              {book.investmentAdvice.map((advice, index) => (
                <li key={index}>{advice}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
