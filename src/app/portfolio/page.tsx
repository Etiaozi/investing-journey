"use client";

import { useState, useEffect, useCallback } from "react";

interface Stock {
  code: string;
  name: string;
  addedAt: string;
  reason?: string;
  price?: number;
  changePercent?: number;
}

export default function PortfolioPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchStocks = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      if (data.stocks) setStocks(data.stocks);
    } catch (e) {
      console.error("获取自选股失败", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setError("请填写股票代码和名称");
      return;
    }

    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          reason: reason.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "添加失败");
        return;
      }
      setSuccess(`✅ ${name} 已添加到自选奔富`);
      setCode("");
      setName("");
      setReason("");
      fetchStocks();
    } catch {
      setError("网络错误，请重试");
    }
  };

  const removeStock = async (stockCode: string) => {
    if (!confirm("确认移除此股票？")) return;

    try {
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: stockCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "删除失败");
        return;
      }
      setSuccess(`已移除 ${stockCode}`);
      fetchStocks();
    } catch {
      setError("网络错误，请重试");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getChangeColor = (pct?: number) => {
    if (!pct) return "";
    return pct > 0 ? "text-green-600" : pct < 0 ? "text-red-600" : "";
  };

  return (
    <div className="space-y-8">
      <section className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-[#1d1d1f]">自选奔富 🚀</h1>
        <p className="text-lg text-[#6e6e73] max-w-2xl mx-auto">
          管理你的长期跟踪股票池，精研个股，静待花开
        </p>
      </section>

      {/* 添加表单 */}
      <section className="bg-white rounded-2xl shadow-lg border border-[#d2d2d7] p-6">
        <h2 className="text-xl font-semibold text-[#1d1d1f] mb-4">添加跟踪股票</h2>
        <form onSubmit={addStock} className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="股票代码（如 688710）"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[#0071e3] text-sm"
          />
          <input
            type="text"
            placeholder="股票名称（如 益诺思）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[#0071e3] text-sm"
          />
          <input
            type="text"
            placeholder="关注原因（可选）"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[#0071e3] text-sm"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0071e3] text-white rounded-xl hover:bg-[#0077ed] transition-colors font-medium whitespace-nowrap"
          >
            添加
          </button>
        </form>
        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
        {success && <p className="mt-3 text-green-600 text-sm">{success}</p>}
      </section>

      {/* 股票列表 */}
      <section>
        <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-4">
          我的跟踪列表 {stocks.length > 0 && <span className="text-[#6e6e73] text-lg">（{stocks.length} 只）</span>}
        </h2>

        {loading ? (
          <div className="text-center py-12 text-[#6e6e73]">加载中...</div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6e6e73] text-lg mb-2">还没有添加任何自选股</p>
            <p className="text-[#6e6e73] text-sm">在上方输入股票代码和名称开始你的投资之旅</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stocks.map((stock) => (
              <div
                key={stock.code}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-[#d2d2d7] p-5 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-lg font-semibold text-[#1d1d1f]">{stock.name}</span>
                    <span className="text-sm text-[#6e6e73] bg-[#f5f5f7] px-2 py-0.5 rounded">
                      {stock.code}
                    </span>
                    {stock.price && (
                      <span className="text-sm font-medium text-[#1d1d1f]">
                        ¥{stock.price.toFixed(2)}
                      </span>
                    )}
                    {stock.changePercent !== undefined && (
                      <span className={`text-sm font-medium ${getChangeColor(stock.changePercent)}`}>
                        {stock.changePercent > 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#6e6e73]">
                    <span>添加于 {formatDate(stock.addedAt)}</span>
                    {stock.reason && <span>📌 {stock.reason}</span>}
                  </div>
                </div>
                <button
                  onClick={() => removeStock(stock.code)}
                  className="ml-4 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 使用说明 */}
      <section className="text-center text-sm text-[#6e6e73] border-t border-[#d2d2d7] pt-6">
        <p>数据保存在本地，仅你可见。添加你长期关注的股票，随时跟踪分析。</p>
      </section>
    </div>
  );
}
