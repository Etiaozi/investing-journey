import { investors } from "@/data/investors";
import InvestorCard from "@/components/InvestorCard";

export default function Home() {
  return (
    <div>
      {/* Hero Section - Apple-style large headline */}
      <section className="text-center pt-16 pb-20 md:pt-24 md:pb-28">
        <h1 className="text-[40px] md:text-[56px] lg:text-[64px] font-bold text-[#1d1d1f] leading-[1.05] tracking-[-0.015em] mb-5">
          投资智慧
        </h1>
        <p className="text-[17px] md:text-[21px] text-[#6e6e73] max-w-[680px] mx-auto leading-relaxed px-6">
          探索沃伦·巴菲特、查理·芒格等顶级投资大佬的思想精华，<br className="hidden md:block" />
          学习价值投资的真谛
        </p>
      </section>

      {/* Portfolio CTA Section */}
      <section className="bg-[#f5f5f7] rounded-[24px] mx-4 md:mx-0 mb-16 md:mb-20 overflow-hidden">
        <div className="max-w-[980px] mx-auto py-14 md:py-20 px-8 text-center">
          <div className="text-[40px] md:text-[52px] mb-6">📈</div>
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#1d1d1f] leading-[1.1] tracking-[-0.015em] mb-4">
            自选奔富
          </h2>
          <p className="text-[17px] text-[#6e6e73] max-w-[560px] mx-auto mb-8 leading-relaxed">
            管理你的股票自选组合，实时查看行情、深度分析和AI研报，让投资决策更明智
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <a
              href="/portfolio"
              className="inline-flex items-center justify-center text-[15px] font-medium text-white bg-[#0071e3] hover:bg-[#0077ed] rounded-full px-7 py-3 transition-all duration-200 min-w-[160px]"
            >
              开始使用
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center text-[15px] font-medium text-[#0071e3] bg-transparent border border-[#0071e3] hover:bg-[#0071e3] hover:text-white rounded-full px-7 py-3 transition-all duration-200 min-w-[160px]"
            >
              登录 / 注册
            </a>
          </div>
        </div>
      </section>

      {/* Investment Masters Grid */}
      <section className="pb-20 md:pb-28">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#1d1d1f] leading-[1.1] tracking-[-0.015em] mb-3">
            投资大佬
          </h2>
          <p className="text-[17px] text-[#6e6e73]">
            从大师的思想中汲取投资智慧
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 md:gap-6 px-4 md:px-0">
          {investors.map((investor) => (
            <InvestorCard key={investor.id} investor={investor} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#d2d2d7] py-8 text-center">
        <p className="text-[12px] text-[#86868b]">
          投资智慧 · 内容仅供参考，不构成投资建议 · 投资有风险，入市需谨慎
        </p>
      </footer>
    </div>
  );
}
