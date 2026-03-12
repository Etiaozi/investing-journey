import { notFound } from "next/navigation";
import Link from "next/link";
import { investors } from "@/data/investors";

interface ShareholderLettersPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShareholderLettersPage({ params }: ShareholderLettersPageProps) {
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
        <h1 className="text-3xl font-bold text-[#1d1d1f]">{investor.name} - 致股东信</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investor.shareholderLetters.map((letter) => (
          <Link
            key={letter.id}
            href={`/investors/${investor.id}/shareholder-letters/${letter.id}`}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#d2d2d7] p-8 block"
          >
            <div className="text-5xl font-bold text-[#0071e3] mb-4">{letter.year}</div>
            <h2 className="text-xl font-semibold text-[#1d1d1f] mb-2">{letter.titleZh}</h2>
            <p className="text-sm text-[#6e6e73] mb-4">{letter.titleEn}</p>
            <div className="text-sm text-[#6e6e73]">{letter.date}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
