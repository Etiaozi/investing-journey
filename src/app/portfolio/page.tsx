"use client";

import { useState, useEffect, useCallback, Fragment } from "react";

interface Holding { code: string; name: string; shares: number; costPrice: number; reason?: string; addedAt: string; }
interface Quote { price: number; changePercent: number; high?: number; low?: number; open?: number; volume?: string; turnover?: string; turnoverRate?: string; pe?: string; marketCap?: string; }
interface KLine { date: string; open: number; close: number; high: number; low: number; volume: number; volumeYuan: number; }
interface AnalysisData { industry: string; concepts: string; analysis: string; }

const c = { rise: "#e74c3c", fall: "#27ae60", flat: "#333", border: "#e0e0e0", text: "#1a1a1a", sub: "#888" };
const LS_KEY = "investing_holdings_v1";

function loadLocalHoldings(): Record<string, {shares:number;costPrice:number}> {
  try{ const r=localStorage.getItem(LS_KEY); return r?JSON.parse(r):{}; }catch{ return {}; }
}
function saveLocalHoldings(h: Record<string,{shares:number;costPrice:number}>) {
  try{ localStorage.setItem(LS_KEY, JSON.stringify(h)); }catch{}
}
function mergeHoldings(list: Holding[], local: Record<string,{shares:number;costPrice:number}>): Holding[] {
  return list.map(h => {
    const l = local[h.code.toUpperCase()];
    if (l && (l.shares !== h.shares || l.costPrice !== h.costPrice)) return {...h, shares: l.shares, costPrice: l.costPrice};
    return h;
  });
}

const analysisData: Record<string, AnalysisData> = {
  "688710": { industry: "CRO/生物医药", concepts: "CAR-T细胞疗法 · CRO · 创新药 · 央国企改革 · 沪股通", analysis: "国药集团旗下CRO企业。2026Q1净利润同比+121%，毛利率回升至30.76%，营收拐点确认。机构持股66%，筹码集中度高。中线看2026全年扭亏预期，若Q2延续增长趋势目标70-75元。风险：2027年9月有4852万股解禁。" },
  "600875": { industry: "能源装备", concepts: "核能核电 · 氢能源 · 抽水蓄能 · 储能 · 风能 · 央国企改革 · 一带一路", analysis: "全球最大发电设备供应商，央企控股51.37%。2026Q1净利+37.4%，V型反转确认。但年内从14.6涨到40元（+173%），PE 32倍偏高。H股01072 PE仅26.6倍更具性价比。核电+抽水蓄能政策红利期，中长期逻辑清晰。短期建议等30-33元区间分批建仓。" },
  "600850": { industry: "信创/数字政务", concepts: "信创 · 央企改革 · 数字政府 · 军工", analysis: "电科数字（原华东电脑），中国电科旗下数字城市龙头。今日放量拉升属超跌反弹（今年跌31%）。PE 50倍估值偏贵。支撑位20.8压力位22.32。若放量突破22.5可看25，否则等回踩21。央企改革预期是中期催化剂。" },
  "300394": { industry: "光模块/光通信", concepts: "光模块 · 5G · 数据中心 · 云计算", analysis: "光模块龙头，近两年涨幅巨大。PE 128倍估值透支严重。今日高位回调，主力净流出14亿。短线建议观望等回踩335-340区间。中长期AI算力需求是光模块长期驱动力，但高位追入风险大。" },
  "603259": { industry: "CRO/CDMO", concepts: "CRO · 创新药 · 沪股通 · MSCI · 沪深300", analysis: "CRO绝对龙头，2026Q1净利+26.7%。PE仅15倍是CRO板块最便宜的标的。ROE 27%盈利能力行业顶级，毛利率50%。全球一体化CRDMO平台护城河深，稳健标的适合长期配置，目标120+。" },
  "603011": { industry: "高端装备/智能分选", concepts: "高端制造 · 工业母机 · 核电装备 · 军工 · 人工智能", analysis: "合锻智能（创立于1951年），主营液压机/机械压力机+智能色选机。总市值100亿，PE亏损。国家级单项冠军，产品应用于飞机、航天、核电、高铁等领域。参与聚变堆核心部件研发。风险：机压机市场内卷加剧利润空间被压缩。" },
  "603938": { industry: "精细化工/硅材料", concepts: "精细化工 · 新材料 · 半导体材料 · 专精特新 · 光伏", analysis: "三孚股份是唐山硅业龙头，专精特新小巨人。主营三氯氢硅、光纤四氯化硅、硅烷偶联剂、氢氧化钾，应用于光伏、光纤、半导体。总市值187亿，PE 203倍。氢氧化钾产能释放顺利。风险：三氯氢硅下游需求疲软。" },
  "300115": { industry: "消费电子/新能源车", concepts: "消费电子 · 苹果产业链 · 新能源车 · 机器人 · 液冷", analysis: "长盈精密是精密制造规模化企业，三大板块：手机零组件、新能源车零组件、工业机器人。总市值522亿，PE 95倍。风险：具身智能研发投入大、经营现金流由正转负。亮点：液冷快接头+高速铜缆是AI基建新增长点。" },
  "002436": { industry: "PCB/IC载板", concepts: "PCB · 半导体载板 · 电子元器件 · 国产替代", analysis: "兴森科技主营PCB和IC载板，FCBGA载板国产化代表。总市值556亿，PE 385倍（极贵）。IC载板处早期投入阶段，利润被研发费用压制。若FCBGA载板放量业绩弹性大，但目前估值透支严重。" },
  "002156": { industry: "半导体封测", concepts: "半导体 · 封装测试 · 芯片 · 先进封装 · 国产替代", analysis: "通富微电是半导体封测龙头，与AMD深度合作。总市值877亿，PE 61倍。受益AI芯片需求增长和先进封装（Chiplet）趋势。国内封测三强之一，国产替代逻辑清晰。当前估值中性合理，逢回调可关注。" },
  "002600": { industry: "精密功能件", concepts: "精密功能件 · 消费电子 · 新能源车 · 机器人 · 散热", analysis: "领益智造是全球精密功能件龙头，苹果核心供应商。总市值1221亿，PE 58倍。产品覆盖散热模组、功能件、结构件，已向新能源车和机器人延伸。估值不算贵，股息率约1.5%。" },
  "301683": { industry: "功能性新材料", concepts: "功能性新材料 · 专精特新", analysis: "慧谷新材是功能性新材料企业，专精特新小巨人。总市值92亿，PE 44倍。主营锂电功能性材料。市值较小波动较大。" },
};

export default function PortfolioPage() {
  const [data, setData] = useState<{ watchlist: Holding[] }>({ watchlist: [] });
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [klines, setKlines] = useState<Record<string, KLine[]>>({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" as "success" | "error" });
  const [selCode, setSelCode] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [sharesInput, setSharesInput] = useState("");
  const [costPriceInput, setCostPriceInput] = useState("");

  const [editing, setEditing] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editShares, setEditShares] = useState("");
  const [editCost, setEditCost] = useState("");
  const [editReason, setEditReason] = useState("");

  const fetchAll = useCallback(async (fetchKline: boolean = false) => {
    try {
      const r = await fetch("/api/portfolio-github");
      const d = await r.json();
      if (d.watchlist) {
        const local = loadLocalHoldings();
        const merged = mergeHoldings(d.watchlist, local);
        setData({ watchlist: merged });
        const codes = merged.map((s: Holding) => s.code);
        if (codes.length > 0) {
          try {
            const qr = await fetch("/api/quotes", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ codes, kline: fetchKline }),
            });
            const qd = await qr.json();
            if (qd.quotes) setQuotes(qd.quotes);
            if (qd.klines) setKlines((prev: Record<string, KLine[]>) => ({ ...prev, ...qd.klines }));
          } catch { /* ignore */ }
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // 自动刷新（不含K线，避免频繁拉取）
  useEffect(() => {
    const timer = setInterval(() => {
      if (data.watchlist.length > 0) {
        const codes = data.watchlist.map(s => s.code);
        fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codes }) })
          .then(r => r.json()).then(d => { if (d.quotes) setQuotes(d.quotes); }).catch(() => {});
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [data.watchlist]);

  const toast = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" as any }), 3000);
  };

  const addByCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = codeInput.trim().toUpperCase();
    if (!code) { toast("请输入股票代码", "error"); return; }
    setAdding(true);
    try {
      const infoRes = await fetch("/api/stock-info", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const info = await infoRes.json();
      if (!info.found) { toast(`未找到代码 ${code}`, "error"); setAdding(false); return; }
      const stockName = info.name || `个股${code}`;
      const reason = info.reason || (info.industry ? `${info.industry} · ${(info.concepts || []).slice(0, 3).join(" ")}` : "");
      const addRes = await fetch("/api/portfolio-github", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, name: stockName, shares: parseFloat(sharesInput) || 0, costPrice: parseFloat(costPriceInput) || 0, reason }) });
      const addData = await addRes.json();
      if (!addRes.ok) { toast(addData.error, "error"); setAdding(false); return; }
      // 同步持仓到localStorage
      const localHold = loadLocalHoldings();
      localHold[code] = { shares: parseFloat(sharesInput) || 0, costPrice: parseFloat(costPriceInput) || 0 };
      saveLocalHoldings(localHold);
      toast(`✅ 已添加 ${stockName}（${code}）`, "success");
      setCodeInput(""); setSharesInput(""); setCostPriceInput("");
      fetchAll();
    } catch { toast("添加失败", "error"); }
    finally { setAdding(false); }
  };

  const remove = async (c: string, n: string) => {
    if (!confirm(`移除 ${n}？`)) return;
    try {
      const r = await fetch("/api/portfolio-github", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c }) });
      if (!r.ok) { const d = await r.json(); toast(d.error, "error"); return; }
      const local = loadLocalHoldings();
      delete local[c.toUpperCase()];
      saveLocalHoldings(local);
      toast(`已移除 ${n}`, "success"); fetchAll();
    } catch { toast("网络错误", "error"); }
  };

  const startEdit = (item: Holding) => {
    setEditing(item.code); setEditCode(item.code); setEditName(item.name);
    setEditShares(item.shares.toString()); setEditCost(item.costPrice.toString()); setEditReason(item.reason || "");
  };

  const saveEdit = async () => {
    const shares = parseFloat(editShares) || 0;
    const costPrice = parseFloat(editCost) || 0;
    try {
      const r = await fetch("/api/portfolio-github", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: editCode, name: editName, shares, costPrice, reason: editReason }) });
      const d = await r.json();
      if (!r.ok) { toast(d.error, "error"); return; }
      // 立即同步到localStorage（Vercel冷启动丢失保护）
      const local = loadLocalHoldings();
      local[editCode.toUpperCase()] = { shares, costPrice };
      saveLocalHoldings(local);
      toast(`✅ 已更新 ${editName}`, "success");
      setEditing(null); fetchAll();
    } catch { toast("网络错误", "error"); }
  };

  const cancelEdit = () => setEditing(null);

  const handleRowClick = (code: string) => {
    if (selCode === code) { setSelCode(null); return; }
    setSelCode(code);
    // 展开时拉K线
    if (!klines[code]) {
      fetch("/api/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ codes: [code], kline: true }) })
        .then(r => r.json()).then(d => { if (d.klines) setKlines((prev: Record<string, KLine[]>) => ({ ...prev, ...d.klines })); }).catch(() => {});
    }
  };

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
          <button onClick={() => fetchAll()} style={{ padding: "4px 12px", fontSize: 12, border: `1px solid ${c.border}`, borderRadius: 4, background: "#fff", cursor: "pointer", color: c.text }}>🔄 刷新行情</button>
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

      <form onSubmit={addByCode} style={{ background: "linear-gradient(135deg, #f8f9ff, #fff)", border: `1px solid ${c.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <div style={{ fontSize: 12, color: c.sub, marginRight: 4, whiteSpace: "nowrap" }}>🔍 添加自选：</div>
        <input placeholder="输入代码（如 000333）" value={codeInput} onChange={e => setCodeInput(e.target.value)} style={{ width: 140, ...inpBase }} disabled={adding} />
        <input placeholder="持仓(股)" value={sharesInput} onChange={e => setSharesInput(e.target.value)} type="number" step="any" style={{ width: 90, ...inpBase }} />
        <input placeholder="成本价" value={costPriceInput} onChange={e => setCostPriceInput(e.target.value)} type="number" step="0.01" style={{ width: 90, ...inpBase }} />
        <button type="submit" disabled={adding} style={{ padding: "6px 24px", background: "#667eea", color: "#fff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: adding ? "wait" : "pointer", opacity: adding ? 0.7 : 1 }}>{adding ? "查询中..." : "添  加"}</button>
        <span style={{ fontSize: 11, color: "#aaa", marginLeft: 4 }}>自动查名称/分析，支持持仓</span>
      </form>

      {editing && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }} onClick={cancelEdit}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 380, maxWidth: "90vw", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: c.text }}>编辑 {editCode}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input placeholder="名称" value={editName} onChange={e => setEditName(e.target.value)} style={{ ...inpBase, padding: "8px 10px" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="持仓(股)" value={editShares} onChange={e => setEditShares(e.target.value)} type="number" step="any" style={{ flex: 1, ...inpBase, padding: "8px 10px" }} />
                <input placeholder="成本价" value={editCost} onChange={e => setEditCost(e.target.value)} type="number" step="0.01" style={{ flex: 1, ...inpBase, padding: "8px 10px" }} />
              </div>
              <textarea placeholder="关注原因" value={editReason} onChange={e => setEditReason(e.target.value)} rows={2} style={{ ...inpBase, padding: "8px 10px", resize: "vertical", fontFamily: "inherit" }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button onClick={cancelEdit} style={{ padding: "8px 20px", border: `1px solid ${c.border}`, borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13 }}>取消</button>
                <button onClick={saveEdit} style={{ padding: "8px 20px", background: c.rise, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: c.sub }}>加载中...</div>
      ) : data.watchlist.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: c.sub }}><p style={{ fontSize: 16, marginBottom: 8 }}>还没有任何自选股</p><p style={{ fontSize: 13 }}>在输入框输入股票代码，点击"添加"即可</p></div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fff" }}>
            <thead>
              <tr style={{ background: "#f0f0f0", borderBottom: `2px solid ${c.border}` }}>
                {["代码", "名称", "持仓", "成本价", "投入", "最新价🔄", "涨跌幅", "盈亏", "收益率", "关注原因", "操作"].map(h => (
                  <th key={h} style={{ padding: "10px 6px", textAlign: "center", fontSize: 12, fontWeight: 600, color: "#555", whiteSpace: "nowrap", borderBottom: `2px solid ${c.border}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.watchlist.map((item) => {
                const isOpen = selCode === item.code;
                const q = quotes[item.code];
                const analysis = analysisData[item.code];
                const klineData = klines[item.code];
                const hasPos = item.shares > 0;
                const curPrice = q?.price || (item.costPrice > 0 ? item.costPrice : 0);
                const curPct = q?.changePercent ?? 0;
                const pl = hasPos ? (curPrice - item.costPrice) * item.shares : 0;
                const plRate = item.costPrice > 0 ? (curPrice - item.costPrice) / item.costPrice * 100 : 0;

                return (
                  <Fragment key={item.code}>
                    <tr onClick={() => handleRowClick(item.code)}
                      style={{ borderBottom: isOpen ? "none" : `1px solid ${c.border}`, background: hasPos ? "#fff" : "#fafafa", cursor: "pointer" }}>
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 12, color: c.sub, textAlign: "center" }}>{item.code}</td>
                      <td style={{ ...td, fontWeight: 700, color: "#0071e3", textAlign: "center" }}>{item.name} <span style={{ fontSize: 10, color: "#aaa" }}>▾</span></td>
                      <td style={{ ...td, textAlign: "center" }}>{hasPos ? <b>{item.shares}</b> : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "center" }}>{item.costPrice > 0 ? `¥${fmt(item.costPrice)}` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "center" }}>{hasPos ? `¥${(item.shares * item.costPrice).toLocaleString()}` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "center", color: priceColor(curPct), fontWeight: 700 }}>{curPrice > 0 ? `¥${fmt(curPrice)}` : <span style={{ color: "#bbb" }}>-</span>}{!q && <span style={{ fontSize: 10, color: "#bbb" }}> 模拟</span>}</td>
                      <td style={{ ...td, textAlign: "center", color: priceColor(curPct), fontWeight: 600 }}>{curPrice > 0 ? `${curPct > 0 ? "+" : ""}${curPct.toFixed(2)}%` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "center", color: pl > 0 ? c.rise : pl < 0 ? c.fall : c.flat, fontWeight: 700 }}>{hasPos ? `${pl > 0 ? "+" : ""}¥${pl.toFixed(2)}` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, textAlign: "center", color: plRate > 0 ? c.rise : plRate < 0 ? c.fall : c.flat }}>{hasPos ? `${plRate > 0 ? "+" : ""}${plRate.toFixed(2)}%` : <span style={{ color: "#bbb" }}>-</span>}</td>
                      <td style={{ ...td, color: c.sub, fontSize: 12, minWidth: 160, maxWidth: 260, lineHeight: 1.5, whiteSpace: "normal", wordBreak: "break-word" }}>{item.reason || "-"}</td>
                      <td style={{ ...td, textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button onClick={e => { e.stopPropagation(); startEdit(item); }} style={btn}>编辑</button>
                          <button onClick={e => { e.stopPropagation(); remove(item.code, item.name); }} style={{ ...btn, color: "#e74c3c" }}>删除</button>
                        </div>
                      </td>
                    </tr>
                    {isOpen && analysis && (
                      <tr>
                        <td colSpan={11} style={{ padding: 0, borderBottom: `1px solid ${c.border}` }}>
                          <StockDetail name={item.name} code={item.code} quote={q} analysis={analysis} klines={klineData} />
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
        <p>💡 点击股票名称展开分析+10日走势图 · 持仓数据本地持久化，刷新不丢失</p>
        <p>本页面由 虾大力 🦐 驱动 · 使用腾讯行情+妙想数据分析</p>
      </div>
    </div>
  );
}

function StockDetail({ name, code, quote, analysis, klines }: {
  name: string; code: string; quote?: Quote; analysis: AnalysisData; klines?: KLine[];
}) {
  const pct = quote?.changePercent ?? 0;
  const barColor = pct > 0 ? c.rise : pct < 0 ? c.fall : "#999";

  return (
    <div style={{ padding: "16px 24px", background: "#fafafa", borderTop: `2px solid ${barColor}` }}>
      {/* 基本行情 */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginBottom: 12, fontSize: 13 }}>
        <div>
          <span style={{ color: c.sub, fontSize: 11 }}>最新价</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: barColor }}>
            ¥{quote?.price?.toFixed(2) || "---"}
            <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 8 }}>{pct > 0 ? "+" : ""}{pct.toFixed(2)}%</span>
          </div>
        </div>
        <MiniStat label="今开" value={quote?.open ? `¥${quote.open.toFixed(2)}` : "---"} />
        <MiniStat label="最高" value={quote?.high ? `¥${quote.high.toFixed(2)}` : "---"} />
        <MiniStat label="最低" value={quote?.low ? `¥${quote.low.toFixed(2)}` : "---"} />
        <MiniStat label="成交量" value={quote?.volume || "---"} />
        <MiniStat label="成交额" value={quote?.turnover || "---"} />
        <MiniStat label="换手率" value={quote?.turnoverRate || "---"} />
      </div>

      {/* 10日走势图 */}
      {klines && klines.length >= 2 && (
        <KLineChart data={klines} color={barColor} />
      )}

      {/* 行业/概念 */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ color: c.sub, fontSize: 11, marginRight: 8 }}>行业</span>
        <span style={{ fontSize: 13 }}>{analysis.industry}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
          {analysis.concepts.split(" · ").map((t, i) => (
            <span key={i} style={{ padding: "2px 8px", background: "#e8f0fe", borderRadius: 10, fontSize: 11, color: "#1a73e8" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* AI分析 */}
      <div style={{ fontSize: 13, lineHeight: 1.7 }}>
        <span style={{ fontWeight: 600, color: c.text }}>📊 AI分析：</span>
        <span style={{ color: "#555" }}>{analysis.analysis}</span>
      </div>
    </div>
  );
}

function KLineChart({ data, color }: { data: KLine[]; color: string }) {
  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices) * 0.995;
  const maxPrice = Math.max(...prices) * 1.005;
  const range = maxPrice - minPrice || 1;
  const N = data.length;
  // 每根K线占宽60px（含间距），总宽度 N*60
  const cellW = 60;
  const kLineW = 42;      // K线实体宽度
  const volW = 26;        // 成交量柱宽度
  const chartH = 54;
  const volH = 26;

  const volumes = data.map(d => d.volume);
  const maxVol = Math.max(...volumes) || 1;

  // 格式化成交量:
  const fmtVol = (v: number) => v >= 10000 ? (v / 10000).toFixed(1) + '万' : v.toFixed(0);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ color: c.sub, fontSize: 11 }}>近10日走势（K线+成交量）</span>
        <span style={{ color: c.sub, fontSize: 10 }}>
          {data[0].date.slice(5)} ~ {data[data.length - 1].date.slice(5)}
        </span>
      </div>

      <div style={{ position: "relative" }}>
        {/* K线 + 成交量合并SVG */}
        <svg viewBox={`0 0 ${N * cellW} ${chartH + volH + 2}`}
          style={{ width: "100%", height: chartH + volH + 2, background: "#f5f5f5", borderRadius: 4 }}>
          
          {/* 价格网格线 */}
          {[0, 25, 50, 75, 100].map(pct => (
            <line key={'g'+pct} x1="0" y1={chartH * (1 - pct / 100)} x2={N * cellW} y2={chartH * (1 - pct / 100)}
              stroke="#e0e0e0" strokeWidth="0.5" />
          ))}
          {/* 成交量区分隔线 */}
          <line x1="0" y1={chartH + 1} x2={N * cellW} y2={chartH + 1} stroke="#d0d0d0" strokeWidth="0.5" />
          
          {/* K线 */}
          {data.map((k, i) => {
            const cx = i * cellW + cellW / 2;
            const isUp = k.close >= k.open;
            const clr = isUp ? c.rise : c.fall;
            const yHigh = chartH * (1 - (k.high - minPrice) / range);
            const yLow = chartH * (1 - (k.low - minPrice) / range);
            const yOpen = chartH * (1 - (k.open - minPrice) / range);
            const yClose = chartH * (1 - (k.close - minPrice) / range);
            return (
              <g key={k.date}>
                {/* 影线 */}
                <line x1={cx} y1={yHigh} x2={cx} y2={yLow}
                  stroke={clr} strokeWidth="0.8" />
                {/* 实体 */}
                <rect x={cx - kLineW / 2} y={Math.min(yOpen, yClose)} width={kLineW}
                  height={Math.max(Math.abs(yClose - yOpen), 1)}
                  fill={clr} rx="0.5" />
              </g>
            );
          })}

          {/* 成交量柱（窄） */}
          {data.map((k, i) => {
            const cx = i * cellW + cellW / 2;
            const barH2 = (k.volume / maxVol) * (volH - 4);
            const isUp = i > 0 ? k.close >= data[i - 1].close : k.close >= k.open;
            return (
              <rect key={'v'+k.date} x={cx - volW / 2} y={chartH + 2 + (volH - 4 - barH2)}
                width={volW} height={barH2}
                fill={isUp ? c.rise : c.fall} opacity="0.5" rx="1" />
            );
          })}
        </svg>

        {/* 日期 + 成交量数值标签，放在图表下方 */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: c.sub, marginTop: 1 }}>
          {data.map((k, i) => (
            <div key={k.date} style={{ textAlign: "center", width: cellW / (N * cellW / Math.min(N*cellW, window.innerWidth-48)) + 'px', overflow: 'hidden' }}>
              <div style={{ fontSize: 8 }}>{k.date.slice(5).replace("-", "/")}</div>
              <div style={{ fontSize: 7, color: k.close >= (i > 0 ? data[i-1].close : k.open) ? c.rise : c.fall }}>{fmtVol(k.volume)}</div>
            </div>
          ))}
        </div>
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
const td: React.CSSProperties = { padding: "10px 6px", fontSize: 13, whiteSpace: "nowrap" };
const btn: React.CSSProperties = { padding: "3px 10px", fontSize: 12, border: "1px solid #ddd", borderRadius: 3, background: "#fff", cursor: "pointer", color: "#555" };
