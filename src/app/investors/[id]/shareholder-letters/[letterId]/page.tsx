import { notFound } from "next/navigation";
import Link from "next/link";
import { investors } from "@/data/investors";

interface ShareholderLetterDetailPageProps {
  params: Promise<{ id: string; letterId: string }>;
}

export default async function ShareholderLetterDetailPage({ params }: ShareholderLetterDetailPageProps) {
  const { id, letterId } = await params;
  const investor = investors.find((i) => i.id === id);

  if (!investor) {
    notFound();
  }

  const letter = investor.shareholderLetters.find((l) => l.id === letterId);

  if (!letter) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/investors/${investor.id}/shareholder-letters`} className="text-[#0071e3] hover:underline">
          ← 返回列表
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-[#d2d2d7] p-8">
        <div className="text-6xl font-bold text-[#0071e3] mb-4">{letter.year}</div>
        <h1 className="text-4xl font-bold text-[#1d1d1f] mb-2">{letter.titleZh}</h1>
        <p className="text-xl text-[#6e6e73] mb-6">{letter.titleEn}</p>
        <div className="text-sm text-[#6e6e73] mb-8">
          <span>{letter.date}</span> · <span>{letter.source}</span>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">中文内容</h2>
            <div className="text-lg text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {letter.contentZh}
            </div>
          </section>

          <hr className="border-[#d2d2d7]" />

          <section>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">English Content</h2>
            <div className="text-lg text-[#1d1d1f] leading-relaxed whitespace-pre-wrap">
              {letter.contentEn}
            </div>
          </section>

          <hr className="border-[#d2d2d7]" />

          <section>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">核心观点</h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-[#1d1d1f]">
              {letter.coreViews.map((view, index) => (
                <li key={index}>{view}</li>
              ))}
            </ul>
          </section>

          <hr className="border-[#d2d2d7]" />

          <section>
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">投资建议</h2>
            <ul className="list-disc list-inside space-y-2 text-lg text-[#1d1d1f]">
              {letter.investmentAdvice.map((advice, index) => (
                <li key={index}>{advice}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
