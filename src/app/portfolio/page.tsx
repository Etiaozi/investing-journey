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

interface PortfolioData {
  watchlist: Holding[];
  refreshPrice: boolean;
}

// 简单颜色方案
const colors = {
  rise: "#e74c3c",   // 东方财富红涨绿跌
  fall: "#27ae60",
  flat: "#333",
  bg: "#f8f9fa",
  card: "#fff",
  border: "#e0e0e0",
  text: "#1a1a1a",
  sub: "#888",
};

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioData>({ watchlist: [], refreshPrice: false });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" as "success" | "error" });

  // 表单状态
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [reason, setReason] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio");
      const d = await res.json();
      if (d.watchlist) setData(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" as any }), 3000);
  };

  const addOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) { showMsg("请填写股票代码和名称", "error"); return; }

    const payload = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      shares: parseFloat(shares) || 0,
      costPrice: parseFloat(costPrice) || 0,
      reason: reason.trim(),
    };

    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/portfolio` : `/api/portfolio`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) { showMsg(result.error, "error"); return; }
      showMsg(editing ? `✅ ${name} 已更新` : `✅ ${name} 已添加`, "success");
      resetForm();
      fetchData();
    } catch { showMsg("网络错误", "error"); }
  };

  const removeStock = async (stockCode: string, stockName: string) => {
    if (!confirm(`确认移除 ${stockName}？`)) return;
    try {
      const res = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: stockCode }),
      });
      if (!res.ok) { const d = await res.json(); showMsg(d.error, "error"); return; }
      showMsg(`已移除 ${stockName}`, "success");
      fetchData();
    } catch { showMsg("网络错误", "error"); }
  };

  const editStock = (item: Holding) => {
    setEditing(item.code);
    setCode(item.code);
    setName(item.name);
    setShares(item.shares.toString());
    setCostPrice(item.costPrice.toString());
    setReason(item.reason || "");
  };

  const resetForm = () => {
    setEditing(null);
    setCode("");
    setName("");
    setShares("");
    setCostPrice("");
    setReason("");
  };

  // 计算持仓汇总
  const totalInvested = data.watchlist.reduce((s, h) => s + h.shares * h.costPrice, 0);
  const totalStocks = data.watchlist.length;
  const withPosition = data.watchlist.filter((h) => h.shares > 0).length;

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px 40px" }}>
      {/* 头部 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text }}>自选奔富 🚀</h1>
        <span style={{ fontSize: 13, color: colors.sub }}>
          {totalStocks} 只关注 · {withPosition} 只有持仓
        </span>
      </div>

      {/* 持仓汇总 */}
      {withPosition > 0 && (
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 12, padding: "16px 20px", marginBottom: 16,
          color: "#fff", display: "flex", gap: 32, flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>持仓只数</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{withPosition}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>总投入</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>¥{totalInvested.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* 消息提示 */}
      {message.text && (
        <div style={{
          padding: "10px 16px", borderRadius: 8, marginBottom: 12,
          background: message.type === "success" ? "#d4edda" : "#f8d7da",
          color: message.type === "success" ? "#155724" : "#721c24",
          fontSize: 14,
        }}>{message.text}</div>
      )}

      {/* 添加/编辑表单 — 东方财富风格横条 */}
      <form onSubmit={addOrUpdate} style={{
        background: colors.card, border: `1px solid ${colors.border}`,
        borderRadius: 8, padding: "12px 16px", marginBottom: 16,
        display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center",
      }}>
        <input
          placeholder="代码" value={code} onChange={e => setCode(e.target.value)}
          style={{ width: 90, padding: "6px 10px", border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13, outline: "none" }}
        />
        <input
          placeholder="名称" value={name} onChange={e => setName(e.target.value)}
          style={{ width: 100, padding: "6px 10px", border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13, outline: "none" }}
        />
        <input
          placeholder="持仓股数" value={shares} onChange={e => setShares(e.target.value)} type="number" step="any"
          style={{ width: 100, padding: "6px 10px", border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13, outline: "none" }}
        />
        <input
          placeholder="成本价" value={costPrice} onChange={e => setCostPrice(e.target.value)} type="number" step="0.01"
          style={{ width: 100, padding: "6px 10px", border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13, outline: "none" }}
        />
        <input
          placeholder="关注原因(可选)" value={reason} onChange={e => setReason(e.target.value)}
          style={{ flex: 1, minWidth: 120, padding: "6px 10px", border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13, outline: "none" }}
        />
        <button type="submit" style={{
          padding: "6px 20px", background: "#e74c3c", color: "#fff", border: "none",
          borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
        }}>
          {editing ? "更新" : "添加"}
        </button>
        {editing && (
          <button type="button" onClick={resetForm} style={{
            padding: "6px 12px", background: colors.sub, color: "#fff", border: "none",
            borderRadius: 4, fontSize: 13, cursor: "pointer",
          }}>
            取消
          </button>
        )}
      </form>

      {/* 表格 — 东方财富风格 */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: colors.sub }}>加载中...</div>
      ) : data.watchlist.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: colors.sub }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>还没有任何股票</p>
          <p style={{ fontSize: 13 }}>在上方输入代码和名称开始跟踪</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: colors.card }}>
            <thead>
              <tr style={{ background: "#f0f0f0", borderBottom: `2px solid ${colors.border}` }}>
                <th style={thStyle}>代码</th>
                <th style={thStyle}>名称</th>
                <th style={{ ...thStyle, textAlign: "right" }}>持仓(股)</th>
                <th style={{ ...thStyle, textAlign: "right" }}>成本价</th>
                <th style={{ ...thStyle, textAlign: "right" }}>投入金额</th>
                <th style={{ ...thStyle, textAlign: "right" }}>最新价</th>
                <th style={{ ...thStyle, textAlign: "right" }}>涨跌幅</th>
                <th style={{ ...thStyle, textAlign: "right" }}>盈亏</th>
                <th style={{ ...thStyle, textAlign: "right" }}>盈亏率</th>
                <th style={thStyle}>关注原因</th>
                <th style={{ ...thStyle, textAlign: "center", width: 100 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {data.watchlist.map((item) => {
                // 如果是持仓股，最新价用成本价 ± 随机模拟（TODO: 接入真实行情）
                const hasPosition = item.shares > 0;
                // 模拟行情数据（后续接入真实API）
                const mockChangePct = (Math.random() - 0.5) * 8;
                const mockPrice = item.costPrice > 0
                  ? item.costPrice * (1 + mockChangePct / 100)
                  : 0;
                const mockChange = mockPrice - item.costPrice;
                const mockChangeRate = item.costPrice > 0 ? mockChange / item.costPrice * 100 : 0;
                const profitLoss = hasPosition ? mockChange * item.shares : 0;

                const isUp = mockChangePct > 0;
                const isFlat = Math.abs(mockChangePct) < 0.01;
                const priceColor = hasPosition ? (isUp ? colors.rise : isFlat ? colors.flat : colors.fall) : colors.flat;

                return (
                  <tr key={item.code} style={{ borderBottom: `1px solid ${colors.border}`, background: hasPosition ? "#fff" : "#fafafa" }}>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: "monospace", fontSize: 12, color: colors.sub }}>{item.code}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: colors.text }}>{item.name}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {hasPosition ? <span style={{ fontWeight: 600, color: colors.text }}>{item.shares}</span> : <span style={{ color: "#bbb" }}>-</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {item.costPrice > 0 ? `¥${fmt(item.costPrice)}` : <span style={{ color: "#bbb" }}>-</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      {hasPosition ? `¥${(item.shares * item.costPrice).toLocaleString()}` : <span style={{ color: "#bbb" }}>-</span>}
                    </td>
                    {/* 最新价 — 模拟 */}
                    <td style={{ ...tdStyle, textAlign: "right", color: priceColor, fontWeight: 600 }}>
                      {item.costPrice > 0 ? `¥${fmt(mockPrice)}` : <span style={{ color: "#bbb" }}>-</span>}
                    </td>
                    {/* 涨跌幅 */}
                    <td style={{ ...tdStyle, textAlign: "right", color: priceColor, fontWeight: 600 }}>
                      {item.costPrice > 0 ? `${isUp ? "+" : ""}${mockChangePct.toFixed(2)}%` : <span style={{ color: "#bbb" }}>-</span>}
                    </td>
                    {/* 盈亏 */}
                    <td style={{ ...tdStyle, textAlign: "right", color: profitLoss > 0 ? colors.rise : profitLoss < 0 ? colors.fall : colors.flat, fontWeight: 600 }}>
                      {hasPosition ? `${profitLoss > 0 ? "+" : ""}¥${profitLoss.toFixed(2)}` : <span style={{ color: "#bbb" }}>-</span>}
                    </td>
                    {/* 盈亏率 */}
                    <td style={{ ...tdStyle, textAlign: "right", color: mockChangeRate > 0 ? colors.rise : mockChangeRate < 0 ? colors.fall : colors.flat }}>
                      {hasPosition ? `${mockChangeRate > 0 ? "+" : ""}${mockChangeRate.toFixed(2)}%` : <span style={{ color: "#bbb" }}>-</span>}
                    </td>
                    <td style={{ ...tdStyle, color: colors.sub, fontSize: 12, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.reason || "-"}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                        <button onClick={() => editStock(item)} style={btnStyle}>编辑</button>
                        <button onClick={() => removeStock(item.code, item.name)} style={{ ...btnStyle, color: "#e74c3c" }}>删除</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 底部说明 */}
      <div style={{ marginTop: 20, fontSize: 12, color: colors.sub, textAlign: "center", lineHeight: 1.8 }}>
        <p>💡 最新价、涨跌幅、盈亏为模拟数据，后续将接入真实行情API</p>
        <p>输入持仓股数和成本价即可跟踪你的模拟持仓</p>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 8px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 600,
  color: "#555",
  whiteSpace: "nowrap",
  borderBottom: `2px solid #e0e0e0`,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 8px",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const btnStyle: React.CSSProperties = {
  padding: "3px 10px",
  fontSize: 12,
  border: "1px solid #ddd",
  borderRadius: 3,
  background: "#fff",
  cursor: "pointer",
  color: "#555",
};
