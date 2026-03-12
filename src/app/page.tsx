import { investors } from "@/data/investors";
import InvestorCard from "@/components/InvestorCard";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-[#1d1d1f]">投资智慧</h1>
        <p className="text-xl text-[#6e6e73] max-w-2xl mx-auto">
          探索沃伦·巴菲特、查理·芒格等顶级投资大佬的思想精华，学习价值投资的真谛
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-semibold text-[#1d1d1f] mb-8">投资大佬</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {investors.map((investor) => (
            <InvestorCard key={investor.id} investor={investor} />
          ))}
        </div>
      </section>
    </div>
  );
}
