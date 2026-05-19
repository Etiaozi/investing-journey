"use client";

import { useState, useEffect, useCallback, Fragment } from "react";

interface Holding {
  code: string;
  name: string;
  shares: number;
  costPrice: number;
  reason?: string;
  addedAt: string;
}

interface Quote {
  price: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: string;
  turnover?: string;
  pe?: string;
  marketCap?: string;
  industry?: string;
  concepts?: string;
}

const c = { rise: "#e74c3c", fall: "#27ae60", flat: "#333", border: "#e0e0e0", text: "#1a1a1a", sub: "#888" };

// 深度分析数据（东方财富妙想数据源更新至 2026-05-19）
const analysisData: Record<string, { industry: string; concepts: string; analysis: string }> = {
  "688710": {
    industry: "CRO/生物医药",
    concepts: "CAR-T细胞疗法 · CRO · 创新药 · 央国企改革 · 沪股通",
    analysis: "国药集团旗下CRO企业。2026Q1净利润同比+121%，毛利率回升至30.76%，营收拐点确认。机构持股66%，筹码集中度高。中线看2026全年扭亏预期，若Q2延续增长趋势目标70-75元。风险：2027年9月有4852万股解禁。",
  },
  "600875": {
    industry: "能源装备",
    concepts: "核能核电 · 氢能源 · 抽水蓄能 · 储能 · 风能 · 央国企改革 · 一带一路",
    analysis: "全球最大发电设备供应商，央企控股51.37%。2026Q1净利+37.4%，V型反转确认。但年内从14.6涨到40元（+173%），PE 32倍偏高。H股01072 PE仅26.6倍更具性价比。核电+抽水蓄能政策红利期，中长期逻辑清晰。短期建议等30-33元区间分批建仓。",
  },
  "600850": {
    industry: "信创/数字政务",
    concepts: "信创 · 央企改革 · 数字政府 · 军工",
    analysis: "电科数字（原华东电脑），中国电科旗下数字城市龙头。今日放量拉升属超跌反弹（今年跌31%）。PE 50倍估值偏贵。支撑位20.8压力位22.32。若放量突破22.5可看25，否则等回踩21。央企改革预期是中期催化剂。",
  },
  "300394": {
    industry: "光模块/光通信",
    concepts: "光模块 · 5G · 数据中心 · 云计算",
    analysis: "光模块龙头，近两年涨幅巨大。PE 128倍估值透支严重。今日高位回调，主力净流出14亿。短线建议观望等回踩335-340区间。中长期AI算力需求是光模块长期驱动力，但高位追入风险大。",
  },
  "603259": {
    industry: "CRO/CDMO",
    concepts: "CRO · 创新药 · 沪股通 · MSCI · 沪深300",
    analysis: "CRO绝对龙头，2026Q1净利+26.7%。PE仅15倍是CRO板块最便宜的标的。ROE 27%盈利能力行业顶级，毛利率50%。全球一体化CRDMO平台护城河深，稳健标的适合长期配置，目标120+。",
  },
  "603011": {
    industry: "高端装备/智能分选",
    concepts: "高端制造 · 工业母机 · 核电装备 · 军工 · 人工智能",
    analysis: "合锻智能（创立于1951年），主营液压机/机械压力机 + 智能色选机。总市值100亿，PE亏损。国家级单项冠军，产品应用于飞机、航天、核电、高铁等领域。参与聚变堆核心部件研发。风险：机压机市场内卷加剧利润空间被压缩。关注Q2能否扭亏。",
  },
  "603938": {
    industry: "精细化工/硅材料",
    concepts: "精细化工 · 新材料 · 半导体材料 · 专精特新 · 光伏",
    analysis: "三孚股份是唐山硅业龙头，专精特新小巨人。主营三氯氢硅、光纤四氯化硅、硅烷偶联剂、氢氧化钾，应用于光伏、光纤、半导体。总市值187亿，PE 203倍。今日涨停+9.99%。氢氧化钾产能释放顺利，硅烷偶联剂产能利用率提升。风险：三氯氢硅下游需求疲软。",
  },
  "300115": {
    industry: "消费电子/新能源车",
    concepts: "消费电子 · 苹果产业链 · 新能源车 · 机器人 · 液冷",
    analysis: "长盈精密是精密制造规模化企业，三大板块：手机零组件、新能源车零组件、工业机器人。总市值522亿，PE 95倍。风险：具身智能研发投入大、美元汇率波动致汇兑损失、经营现金流由正转负。亮点：液冷快接头+高速铜缆是AI基建新增长点。",
  },
  "002436": {
    industry: "PCB/IC载板",
    concepts: "PCB · 半导体载板 · 电子元器件 · 国产替代",
    analysis: "兴森科技主营PCB和IC载板，FCBGA载板国产化代表。总市值556亿，PE 385倍（极贵）。IC载板处早期投入阶段，利润被研发费用压制。若FCBGA载板放量业绩弹性大，但目前估值透支严重。建议等盈利拐点确认后再考虑。",
  },
  "002156": {
    industry: "半导体封测",
    concepts: "半导体 · 封装测试 · 芯片 · 先进封装 · 国产替代",
    analysis: "通富微电是半导体封测龙头，与AMD深度合作。总市值877亿，PE 61倍。受益AI芯片需求增长和先进封装（Chiplet）趋势。国内封测三强之一，国产替代逻辑清晰。当前估值中性合理，逢回调可关注。",
  },
  "002600": {
    industry: "精密功能件",
    concepts: "精密功能件 · 消费电子 · 新能源车 · 机器人 · 散热",
    analysis: "领益智造是全球精密功能件龙头，苹果核心供应商。总市值1221亿，PE 58倍。产品覆盖散热模组、功能件、结构件，已向新能源车和机器人延伸。估值不算贵，股息率约1.5%。消费电子周期性较强，关注AI手机换机潮和散热新需求。",
  },
  "301683": {
    industry: "功能性新材料",
    concepts: "功能性新材料 · 专精特新 · 锂电材料",
    analysis: "慧谷新材是功能性新材料企业，专精特新小巨人。总市值92亿，PE 44倍。最新价约146元，今日-1.52%。市值较小（92亿）流通盘不大，波动较大。主营锂电功能性材料，关注下游新能源产业链需求恢复。注：原记录为688257（科创板），实际正确代码为301683（深交所创业板）。",
  },
};

export default function PortfolioPage() {
  const [data, setData] = useState<{ watchlist: Holding[] }>({ watchlist: [] });
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", type: "" as "success" | "error" });
  const [selCode, setSelCode] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [reason, setReason] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const r = await fetch("/api/portfolio");
      const d = await r.json();
      if (d.watchlist) {
        setData(d);
        // also fetch quotes
        const codes = d.watchlist.map((s: Holding) => s.code);
        if (codes.length > 0) {
          try {
            const qr = await fetch("/api/quotes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ codes }),
            });
            const qd = await qr.json();
            if (qd.quotes) setQuotes(qd.quotes);
          } catch { /* ignore */ }
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // auto-refresh every 60s
  useEffect(() => {
    const timer = setInterval(() => {
      if (data.watchlist.length > 0) {
        const codes = data.watchlist.map(s => s.code);
        fetch("/api/quotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ codes }),
        }).then(r => r.json()).then(d => { if (d.quotes) setQuotes(d.quotes); }).catch(() => {});
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [data.watchlist]);

  const toast = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" as any }), 3000);
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
      reset(); fetchAll();
    } catch { toast("网络错误", "error"); }
  };

  const remove = async (c: string, n: string) => {
    if (!confirm(`移除 ${n}？`)) return;
    try {
      const r = await fetch("/api/portfolio", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c }) });
      if (!r.ok) { const d = await r.json(); toast(d.error, "error"); return; }
      toast(`已移除 ${n}`, "success"); fetchAll();
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: c.text }}>自选奔富 🚀</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: c.sub }}>{data.watchlist.length} 只 · {withPos} 只有持仓</span>
          <button onClick={fetchAll} style={{ padding: "4px 12px", fontSize: 12, border: `1px solid ${c.border}`, borderRadius: 4, background: "#fff", cursor: "pointer", color: c.text }}>
            🔄 刷新行情
          </button>
        </div>
      </div>

      {withPos > 0 && (
        <div style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", borderRadius: 12, padding: "16px 20px", marginBottom: 16, color: "#fff", display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div><div style={{ fontSize: 12, opacity: .8 }}>持仓只数</div><div style={{ fontSize: 22, fontWeight: 700 }}>{withPos}</div></div>
          <div><div style={{ fontSize: 12, opacity: .8 }}>总投入</div><div style={{ fontSize: 22, fontWeight: 700 }}>¥{totalInvested.toLocaleString()}</div></div>
        </div>
      )}

      {msg.text && (
        <div style={{ padding: "10px 16px", borderRadius: 8, marginBottom: 12, background: msg.type === "success" ? "#d4edda" : "#f8d7da", color: msg.type === "success" ? "#155724" : "#721c24", fontSize: 14 }}>{msg.text}</div>
      )}

      <form onSubmit={submit} style={{ background: "#fff", border: `1px solid ${c.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <input placeholder="代码" value={code} onChange={e => setCode(e.target.value)} style={{ width: 90, ...inpBase }} />
        <input placeholder="名称" value={name} onChange={e => setName(e.target.value)} style={{ width: 100, ...inpBase }} />
        <input placeholder="持仓(股)" value={shares} onChange={e => setShares(e.target.value)} type="number" step="any" style={{ width: 100, ...inpBase }} />
        <input placeholder="成本价" value={costPrice} onChange={e => setCostPrice(e.target.value)} type="number" step="0.01" style={{ width: 100, ...inpBase }} />
        <input placeholder="关注原因(可选)" value={reason} onChange={e => setReason(e.target.value)} style={{ flex: 2, minWidth: 180, ...inpBase }} />
        <button type="submit" style={{ padding: "6px 20px", background: c.rise, color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{editing ? "更新" : "添加"}</button>
        {editing && <button type="button" onClick={reset} style={{ padding: "6px 12px", background: c.sub, color: "#fff", border: "none", borderRadius: 4, fontSize: 13, cursor: "pointer" }}>取消</button>}
      </form>

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
                {["代码", "名称", "持仓", "成本价", "投入", "最新价🔄", "涨跌幅", "盈亏", "收益率", "关注原因", "操作"].map(h => (
                  <th key={h} style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#555", whiteSpace: "nowrap", borderBottom: `2px solid ${c.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.watchlist.map((item) => {
                const isOpen = selCode === item.code;
                const q = quotes[item.code];
                const analysis = analysisData[item.code];
                const hasPos = item.shares > 0;
                const curPrice = q?.price || (item.costPrice > 0 ? item.costPrice : 0);
                const curPct = q?.changePercent ?? 0;
                const pl = hasPos ? (curPrice - item.costPrice) * item.shares : 0;
                const plRate = item.costPrice > 0 ? (curPrice - item.costPrice) / item.costPrice * 100 : 0;

                return (
                  <Fragment key={item.code}>
                    <tr
                      onClick={() => setSelCode(isOpen ? null : item.code)}
                      style={{ borderBottom: isOpen ? "none" : `1px solid ${c.border}`, background: hasPos ? "#fff" : "#fafafa", cursor: "pointer" }}
                    >
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 12, color: c.sub, textAlign: "center" }}>{item.code}</td>
                      <td style={{ ...td, fontWeight: 700, color: "#0071e3", textAlign: "center" }}>{item.name} <span style={{ fontSize: 10, color: "#aaa" }}>▾</span></td>
                      <td style={{ ...td, textAlign: "center" }}>{hasPos ? <b>{item.shares}</b> : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "center" }}>{item.costPrice > 0 ? `¥${fmt(item.costPrice)}` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "center" }}>{hasPos ? `¥${(item.shares * item.costPrice).toLocaleString()}` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "center", color: priceColor(curPct), fontWeight: 700 }}>
                        {curPrice > 0 ? `¥${fmt(curPrice)}` : <span style={{ color: "#bbb" }}>-</span>}
                        {!q && <span style={{ color: "#bbb", fontSize: 10, marginLeft: 4 }}>模拟</span>}
                      </td>
                      <td style={{ ...td, textAlign: "center", color: priceColor(curPct), fontWeight: 600 }}>
                        {curPrice > 0 ? `${curPct > 0 ? "+" : ""}${curPct.toFixed(2)}%` : <span style={{ color: "#bbb" }}>-</span>}
                      </td>
                      <td style={{ ...td, textAlign: "center", color: pl > 0 ? c.rise : pl < 0 ? c.fall : c.flat, fontWeight: 700 }}>
                        {hasPos ? `${pl > 0 ? "+" : ""}¥${pl.toFixed(2)}` : <span style={{ color: "#bbb" }}>-</span>}
                      </td>
                      <td style={{ ...td, textAlign: "center", color: plRate > 0 ? c.rise : plRate < 0 ? c.fall : c.flat }}>
                        {hasPos ? `${plRate > 0 ? "+" : ""}${plRate.toFixed(2)}%` : <span style={{ color: "#bbb" }}>-</span>}
                      </td>
                      <td style={{ ...td, color: c.sub, fontSize: 12, minWidth: 180, maxWidth: 280, lineHeight: 1.5, whiteSpace: "normal", wordBreak: "break-word" }}>{item.reason || "-"}</td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button onClick={e => { e.stopPropagation(); edit(item); }} style={btn}>编辑</button>
                          <button onClick={e => { e.stopPropagation(); remove(item.code, item.name); }} style={{ ...btn, color: "#e74c3c" }}>删除</button>
                        </div>
                      </td>
                    </tr>
                    {isOpen && analysis && (
                      <tr>
                        <td colSpan={11} style={{ padding: 0, borderBottom: `1px solid ${c.border}` }}>
                          <StockDetail name={item.name} code={item.code} quote={q} analysis={analysis} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: 12, color: c.sub, textAlign: "center", lineHeight: 1.8 }}>
        <p>💡 点击股票名称展开详情和AI分析 · 行情自动每60秒刷新</p>
        <p>输入持仓股数和成本价即可跟踪模拟持仓盈亏</p>
      </div>
    </div>
  );
}

function StockDetail({ name, code, quote, analysis }: {
  name: string; code: string; quote?: Quote; analysis: { industry: string; concepts: string; analysis: string };
}) {
  const pct = quote?.changePercent ?? 0;
  const barColor = pct > 0 ? c.rise : pct < 0 ? c.fall : "#999";

  return (
    <div style={{ padding: "16px 24px", background: "#fafafa", borderTop: `2px solid ${barColor}` }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 12, fontSize: 13 }}>
        <div>
          <span style={{ color: c.sub, fontSize: 11 }}>最新价</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: barColor }}>
            ¥{quote?.price?.toFixed(2) || "---"}
            <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 8 }}>{pct > 0 ? "+" : ""}{pct.toFixed(2)}%</span>
          </div>
        </div>
        <MiniStat label="今开" value={quote?.high ? `¥${quote.high}` : "---"} />
        <MiniStat label="最高" value={quote?.high ? `¥${quote.high}` : "---"} />
        <MiniStat label="最低" value={quote?.low ? `¥${quote.low}` : "---"} />
        <MiniStat label="成交量" value={quote?.volume || "---"} />
        <MiniStat label="成交额" value={quote?.turnover || "---"} />
        <MiniStat label="市盈率" value={quote?.pe || "---"} />
        <MiniStat label="总市值" value={quote?.marketCap || "---"} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <span style={{ color: c.sub, fontSize: 11, marginRight: 8 }}>行业</span>
        <span style={{ fontSize: 13 }}>{analysis.industry}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
          {analysis.concepts.split(" · ").map((t, i) => (
            <span key={i} style={{ padding: "2px 8px", background: "#e8f0fe", borderRadius: 10, fontSize: 11, color: "#1a73e8" }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, lineHeight: 1.7 }}>
        <span style={{ fontWeight: 600, color: c.text }}>📊 AI分析：</span>
        <span style={{ color: "#555" }}>{analysis.analysis}</span>
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

const inpBase: React.CSSProperties = { padding: "6px 10px", border: `1px solid ${c.border}`, borderRadius: 4, fontSize: 13, outline: "none" };
const td: React.CSSProperties = { padding: "10px 8px", fontSize: 13, whiteSpace: "nowrap" };
const btn: React.CSSProperties = { padding: "3px 10px", fontSize: 12, border: "1px solid #ddd", borderRadius: 3, background: "#fff", cursor: "pointer", color: "#555" };
