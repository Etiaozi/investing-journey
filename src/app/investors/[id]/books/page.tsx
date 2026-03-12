import { notFound } from "next/navigation";
import Link from "next/link";
import { investors } from "@/data/investors";

interface BooksPageProps {
  params: Promise<{ id: string }>;
}

export default async function BooksPage({ params }: BooksPageProps) {
  const { id } = await params;
  const investor = investors.find((i) => i.id === id);

  if (!investor) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/investors/${investor.id}`} className="text-[#0071e3] hover:underline">
          ← 返回
        </Link>
        <h1 className="text-3xl font-bold text-[#1d1d1f]">{investor.name} - 书籍与回忆录</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {investor.books.map((book) => (
          <Link
            key={book.id}
            href={`/investors/${investor.id}/books/${book.id}`}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#d2d2d7] p-8 block"
          >
            {book.cover && (
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-56 object-cover rounded-xl mb-6"
              />
            )}
            <div className="text-sm text-[#6e6e73] mb-2">{book.publicationYear}</div>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">{book.title}</h2>
            <p className="text-lg text-[#6e6e73] mb-2">{book.titleEn}</p>
            <p className="text-sm text-[#6e6e73]">作者：{book.author} / {book.authorEn}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
