"use client";

import { useState, useEffect, useCallback } from "react";

interface Holding {
  code: string;
  name: string;
  shares: number;
  costPrice: number;
  reason?: string;
  addedAt: string;
}

interface StockDetail {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  high: number;
  low: number;
  volume: string;
  turnover: string;
  pe: string;
  marketCap: string;
  industry: string;
  concepts: string;
  analysis: string;
  weeklyTrend: number[];
}

// 简单颜色方案 - 东方财富红涨绿跌
const c = {
  rise: "#e74c3c",
  fall: "#27ae60",
  flat: "#333",
  border: "#e0e0e0",
  text: "#1a1a1a",
  sub: "#888",
};

const mockDetails: Record<string, StockDetail> = {
  "688710": {
    code: "688710", name: "益诺思", price: 67.79, changePercent: 2.98,
    high: 69.70, low: 66.01, volume: "102.1万", turnover: "6994万",
    pe: "亏损", marketCap: "62亿", industry: "CRO/生物医药",
    concepts: "CAR-T细胞疗法 · CRO · 创新药 · 央国企改革 · 沪股通",
    analysis: "国药集团旗下CRO企业，2026Q1净利润同比+121%，毛利率回升至30.76%，营收拐点确认。机构持股66%，筹码集中。短线连续4日上涨+6.8%，关注70元压力位。中线看2026全年扭亏预期，目标70-75元。",
    weeklyTrend: [63.5, 63.8, 63.2, 64.7, 65.8, 67.8, 68.5],
  },
  "600875": {
    code: "600875", name: "东方电气", price: 38.28, changePercent: -4.23,
    high: 39.94, low: 38.15, volume: "3785万", turnover: "14.6亿",
    pe: "32", marketCap: "1323亿", industry: "能源装备",
    concepts: "核能核电 · 氢能源 · 抽水蓄能 · 储能 · 风能 · 央国企改革",
    analysis: "全球最大发电设备供应商，央企控股51.37%。2026Q1净利润同比+37%，毛利率持续改善。但年内已涨173%，短期回调压力较大，今日主力净流出3.3亿。建议等30-33元区间再考虑。",
    weeklyTrend: [39.5, 39.8, 39.0, 38.5, 38.8, 38.3, 37.5],
  },
  "600850": {
    code: "600850", name: "电科数字", price: 22.25, changePercent: 8.75,
    high: 22.50, low: 20.80, volume: "--", turnover: "--",
    pe: "50", marketCap: "--", industry: "信创/数字政务",
    concepts: "信创 · 央企改革 · 数字政府",
    analysis: "今日放量拉升+8.75%，信创+央企改革概念驱动。但今年以来跌幅-31%，今日大涨属超跌反弹。主力净流入3958万（超大单6224万），短线看能否站稳22.32压力位。",
    weeklyTrend: [20.1, 20.3, 20.5, 21.0, 21.5, 22.3, 20.8],
  },
  "300394": {
    code: "300394", name: "天孚通信", price: 362.49, changePercent: -5.83,
    high: 380.0, low: 358.0, volume: "--", turnover: "--",
    pe: "128", marketCap: "--", industry: "光模块/光通信",
    concepts: "光模块 · 5G · 数据中心",
    analysis: "光模块龙头，近两年涨幅巨大。今日-5.83%高位回调，主力净流出14亿。PE128倍估值透支严重，短线建议观望，等回踩330-340区间再看。",
    weeklyTrend: [380, 378, 375, 370, 365, 362, 358],
  },
  "603259": {
    code: "603259", name: "药明康德", price: 102.03, changePercent: 0,
    high: 103.5, low: 101.0, volume: "--", turnover: "--",
    pe: "15", marketCap: "3044亿", industry: "CRO/CDMO",
    concepts: "CRO · 创新药 · 沪股通 · MSCI",
    analysis: "CRO绝对龙头，2026Q1净利同比+26.7%，营收455亿。PE仅15倍，是CRO板块最便宜的标的。ROE 27%盈利能力行业顶级，毛利率50%。稳健标的，适合长期配置。",
    weeklyTrend: [100, 101, 101.5, 102, 102.5, 102, 103],
  },
};

export default function PortfolioPage() {
  const [data, setData] = useState<{ watchlist: Holding[] }>({ watchlist: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" as "success" | "error" });

  const [selCode, setSelCode] = useState<string | null>(null); // 选中展开的股票

  // 表单
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [reason, setReason] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try { const r = await fetch("/api/portfolio"); const d = await r.json(); if (d.watchlist) setData(d); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toast = (text: string, type: "success" | "error") => {
    setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" as any }), 3000);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) { toast("请填写代码和名称", "error"); return; }
    const p = { code: code.trim().toUpperCase(), name: name.trim(), shares: parseFloat(shares) || 0, costPrice: parseFloat(costPrice) || 0, reason: reason.trim() };
    try {
      const r = await fetch("/api/portfolio", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
      const d = await r.json();
      if (!r.ok) { toast(d.error, "error"); return; }
      toast(`${editing ? "✅ 已更新" : "✅ 已添加"} ${name}`, "success");
      reset(); fetchData();
    } catch { toast("网络错误", "error"); }
  };

  const remove = async (c: string, n: string) => {
    if (!confirm(`移除 ${n}？`)) return;
    try {
      const r = await fetch("/api/portfolio", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c }) });
      if (!r.ok) { const d = await r.json(); toast(d.error, "error"); return; }
      toast(`已移除 ${n}`, "success"); fetchData();
    } catch { toast("网络错误", "error"); }
  };

  const edit = (item: Holding) => {
    setEditing(item.code); setCode(item.code); setName(item.name);
    setShares(item.shares.toString()); setCostPrice(item.costPrice.toString()); setReason(item.reason || "");
  };

  const reset = () => { setEditing(null); setCode(""); setName(""); setShares(""); setCostPrice(""); setReason(""); };

  const totalInvested = data.watchlist.reduce((s, h) => s + h.shares * h.costPrice, 0);
  const withPos = data.watchlist.filter(h => h.shares > 0).length;

  const priceColor = (pct: number) => pct > 0 ? c.rise : pct < 0 ? c.fall : c.flat;
  const fmt = (n: number) => n.toFixed(2);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px 40px" }}>
      {/* 头部 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: c.text }}>自选奔富 🚀</h1>
        <span style={{ fontSize: 13, color: c.sub }}>{data.watchlist.length} 只关注 · {withPos} 只有持仓</span>
      </div>

      {/* 持仓汇总 */}
      {withPos > 0 && (
        <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: 12, padding: "16px 20px", marginBottom: 16, color: "#fff", display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div><div style={{ fontSize: 12, opacity: .8 }}>持仓只数</div><div style={{ fontSize: 22, fontWeight: 700 }}>{withPos}</div></div>
          <div><div style={{ fontSize: 12, opacity: .8 }}>总投入</div><div style={{ fontSize: 22, fontWeight: 700 }}>¥{totalInvested.toLocaleString()}</div></div>
        </div>
      )}

      {/* 消息 */}
      {msg.text && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 12, background: msg.type === "success" ? "#d4edda" : "#f8d7da", color: msg.type === "success" ? "#155724" : "#721c24", fontSize: 14 }}>{msg.text}</div>
      )}

      {/* 添加表单 */}
      <form onSubmit={submit} style={{ background: "#fff", border: `1px solid ${c.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <input placeholder="代码" value={code} onChange={e => setCode(e.target.value)} style={inp(90)} />
        <input placeholder="名称" value={name} onChange={e => setName(e.target.value)} style={inp(100)} />
        <input placeholder="持仓(股)" value={shares} onChange={e => setShares(e.target.value)} type="number" step="any" style={inp(100)} />
        <input placeholder="成本价" value={costPrice} onChange={e => setCostPrice(e.target.value)} type="number" step="0.01" style={inp(100)} />
        <input placeholder="关注原因(可选)" value={reason} onChange={e => setReason(e.target.value)} style={{ flex: 1, minWidth: 120, ...inpBase }} />
        <button type="submit" style={{ padding: "6px 20px", background: c.rise, color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{editing ? "更新" : "添加"}</button>
        {editing && <button type="button" onClick={reset} style={{ padding: "6px 12px", background: c.sub, color: "#fff", border: "none", borderRadius: 4, fontSize: 13, cursor: "pointer" }}>取消</button>}
      </form>

      {/* 表格 */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: c.sub }}>加载中...</div>
      ) : data.watchlist.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: c.sub }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>还没有任何股票</p>
          <p style={{ fontSize: 13 }}>在上方输入代码和名称开始跟踪</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fff" }}>
            <thead>
              <tr style={{ background: "#f0f0f0", borderBottom: `2px solid ${c.border}` }}>
                {["代码", "名称", "持仓(股)", "成本价", "投入金额", "最新价", "涨跌幅", "盈亏", "盈亏率", "关注原因", "操作"].map(h => (
                  <th key={h} style={{ padding: "10px 8px", textAlign: h === "操作" ? "center" : h.match(/持仓|成本|投入|最新|涨跌|盈亏/) ? "right" : "left", fontSize: 12, fontWeight: 600, color: "#555", whiteSpace: "nowrap", borderBottom: `2px solid ${c.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.watchlist.map((item) => {
                const isOpen = selCode === item.code;
                const detail = mockDetails[item.code];
                const hasPos = item.shares > 0;
                const mockPct = detail ? detail.changePercent : (Math.random() - 0.5) * 8;
                const mockPrice = detail ? detail.price : (item.costPrice > 0 ? item.costPrice * (1 + mockPct / 100) : 0);
                const pl = hasPos ? (mockPrice - item.costPrice) * item.shares : 0;
                const plRate = item.costPrice > 0 ? (mockPrice - item.costPrice) / item.costPrice * 100 : 0;

                return (
                  <React.Fragment key={item.code}>
                    <tr
                      onClick={() => setSelCode(isOpen ? null : item.code)}
                      style={{
                        borderBottom: isOpen ? "none" : `1px solid ${c.border}`,
                        background: hasPos ? "#fff" : "#fafafa",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f5f5f5"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = hasPos ? "#fff" : "#fafafa"}
                    >
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 12, color: c.sub }}>{item.code}</td>
                      <td style={{ ...td, fontWeight: 700, color: "#0071e3" }}>{item.name} <span style={{ fontSize: 10, color: "#aaa" }}>▶</span></td>
                      <td style={{ ...td, textAlign: "right" }}>{hasPos ? <b>{item.shares}</b> : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "right" }}>{item.costPrice > 0 ? `¥${fmt(item.costPrice)}` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "right" }}>{hasPos ? `¥${(item.shares * item.costPrice).toLocaleString()}` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "right", color: priceColor(mockPct), fontWeight: 700 }}>{mockPrice > 0 ? `¥${fmt(mockPrice)}` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "right", color: priceColor(mockPct), fontWeight: 700 }}>{mockPrice > 0 ? `${mockPct > 0 ? "+" : ""}${mockPct.toFixed(2)}%` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "right", color: pl > 0 ? c.rise : pl < 0 ? c.fall : c.flat, fontWeight: 700 }}>
                        {hasPos ? `${pl > 0 ? "+" : ""}¥${pl.toFixed(2)}` : <span style={{ color: "#bbb" }}>-</span>}
                      </td>
                      <td style={{ ...td, textAlign: "right", color: plRate > 0 ? c.rise : plRate < 0 ? c.fall : c.flat }}>
                        {hasPos ? `${plRate > 0 ? "+" : ""}${plRate.toFixed(2)}%` : <span style={{ color: "#bbb" }}>-</span>}
                      </td>
                      <td style={{ ...td, color: c.sub, fontSize: 12, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.reason || "-"}</td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <button onClick={e => { e.stopPropagation(); edit(item); }} style={btn}>编辑</button>
                        <button onClick={e => { e.stopPropagation(); remove(item.code, item.name); }} style={{ ...btn, color: "#e74c3c" }}>删除</button>
                      </td>
                    </tr>
                    {/* 详情展开行 */}
                    {isOpen && (
                      <tr>
                        <td colSpan={11} style={{ padding: 0, borderBottom: `1px solid ${c.border}` }}>
                          <StockDetailPanel detail={detail} code={item.code} name={item.name} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: 12, color: c.sub, textAlign: "center", lineHeight: 1.8 }}>
        <p>💡 点击股票名称展开详情和走势分析</p>
        <p>输入持仓股数和成本价即可跟踪模拟持仓盈亏</p>
      </div>
    </div>
  );
}

function StockDetailPanel({ detail, code, name }: { detail?: StockDetail; code: string; name: string }) {
  if (!detail) {
    return (
      <div style={{ padding: "16px 24px", background: "#fafafa", fontSize: 13, color: c.sub }}>
        <p style={{ fontWeight: 600, color: c.text, marginBottom: 8 }}>{name} ({code}) 详情</p>
        <p>暂无详细数据，后续接入真实行情后将显示走势图和分析。</p>
      </div>
    );
  }

  const isUp = detail.changePercent > 0;
  const barColor = isUp ? c.rise : c.fall;

  return (
    <div style={{ padding: "16px 24px", background: "#fafafa", borderTop: `2px solid ${barColor}` }}>
      {/* 第一行：基本信息 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 12, fontSize: 13 }}>
        <div>
          <span style={{ color: c.sub, fontSize: 11 }}>最新价</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: barColor }}>¥{detail.price}
            <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 8 }}>
              {isUp ? "+" : ""}{detail.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        <MiniStat label="今开" value={`¥${detail.high}`} />
        <MiniStat label="最高" value={`¥${detail.high}`} />
        <MiniStat label="最低" value={`¥${detail.low}`} />
        <MiniStat label="成交量" value={detail.volume} />
        <MiniStat label="成交额" value={detail.turnover} />
        <MiniStat label="市盈率" value={detail.pe} />
        <MiniStat label="总市值" value={detail.marketCap} />
      </div>

      {/* 行业/概念 */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ color: c.sub, fontSize: 11, marginRight: 8 }}>行业</span>
        <span style={{ fontSize: 13 }}>{detail.industry}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
          {detail.concepts.split(" · ").map((t, i) => (
            <span key={i} style={{ padding: "2px 8px", background: "#e8f0fe", borderRadius: 10, fontSize: 11, color: "#1a73e8" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* 迷你走势条 */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ color: c.sub, fontSize: 11, marginRight: 8 }}>近7日走势</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 40, marginTop: 4 }}>
          {detail.weeklyTrend.map((v, i) => {
            const min = Math.min(...detail.weeklyTrend);
            const max = Math.max(...detail.weeklyTrend);
            const range = max - min || 1;
            const barHeight = ((v - min) / range) * 32 + 4;
            const isLatest = i === detail.weeklyTrend.length - 1;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{
                  width: 20, height: barHeight, borderRadius: "3px 3px 0 0",
                  background: isLatest ? barColor : (v >= detail.weeklyTrend[0] ? c.rise : c.fall),
                  opacity: isLatest ? 1 : 0.5,
                }} />
                <span style={{ fontSize: 9, color: c.sub }}>D{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI分析 */}
      <div style={{ fontSize: 13, lineHeight: 1.7 }}>
        <span style={{ fontWeight: 600, color: c.text }}>📊 分析：</span>
        <span style={{ color: "#555" }}>{detail.analysis}</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: c.sub, fontSize: 11 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{value}</div>
    </div>
  );
}

// Need React import for Fragment used inside map
import React from "react";

const inpBase: React.CSSProperties = {
  padding: "6px 10px", border: `1px solid ${c.border}`, borderRadius: 4, fontSize: 13, outline: "none",
};
const inp = (w: number): React.CSSProperties => ({ width: w, ...inpBase });
const td: React.CSSProperties = { padding: "10px 8px", fontSize: 13, whiteSpace: "nowrap" };
const btn: React.CSSProperties = {
  padding: "3px 10px", fontSize: 12, border: "1px solid #ddd", borderRadius: 3, background: "#fff", cursor: "pointer", color: "#555",
};
