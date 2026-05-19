import { NextRequest, NextResponse } from "next/server";

// 腾讯行情API: qt.gtimg.cn/q=sh688710,sz300394
// 返回: v_sh688710="1~益诺思~688710~65.47~65.83~67.15~1497589~...";
// 字段索引: 1=市场, 2=名称, 3=代码, 4=最新价, 5=昨收, 6=今开
//           7=成交量(手), 8=..., 9=..., 10=...
// 涨跌幅 = (最新价 - 昨收) / 昨收 * 100

async function fetchRealQuotes(codes: string[]): Promise<Record<string, any>> {
  if (codes.length === 0) return {};

  // 构建请求: sh=上交所60/68, sz=深交所00/30/00
  const marketPrefix: Record<string, string> = {
    "6": "sh", "68": "sh", "60": "sh",
    "0": "sz", "3": "sz", "00": "sz", "30": "sz", "002": "sz", "003": "sz",
    "4": "sz", "8": "sz",
  };
  const qs = codes.map(c => {
    const prefix = c.startsWith("6") ? "sh" : "sz";
    return `${prefix}${c}`;
  }).join(",");

  try {
    const res = await fetch(`http://qt.gtimg.cn/q=${qs}`, {
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();

    const result: Record<string, any> = {};
    const lines = text.split("\n").filter(l => l.trim());

    for (const line of lines) {
      // 提取引号内的内容
      const match = line.match(/"(.+)"/);
      if (!match) continue;

      const parts = match[1].split("~");
      if (parts.length < 10) continue;

      const code = parts[2]?.trim();
      if (!code || !codes.includes(code)) continue;

      const name = parts[1];
      const price = parseFloat(parts[3]) || 0;
      const prevClose = parseFloat(parts[4]) || price;
      const open = parseFloat(parts[5]) || 0;
      const volumeHand = parseFloat(parts[6]) || 0; // 手
      const changePct = prevClose > 0 ? ((price - prevClose) / prevClose * 100) : 0;
      const high = parseFloat(parts[33]) || 0;
      const low = parseFloat(parts[34]) || 0;
      const turnoverYuan = parseFloat(parts[37]) || 0; // 成交额(元)

      // 成交量转中文（手→万手/亿手）
      const vol = volumeHand >= 10000
        ? (volumeHand / 10000).toFixed(1) + "万手"
        : volumeHand.toFixed(0) + "手";
      const turn = turnoverYuan >= 100000000
        ? (turnoverYuan / 100000000).toFixed(2) + "亿"
        : turnoverYuan >= 10000
          ? (turnoverYuan / 10000).toFixed(0) + "万"
          : turnoverYuan.toFixed(0);

      result[code] = {
        price: Math.round(price * 100) / 100,
        changePercent: Math.round(changePct * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        open: Math.round(open * 100) / 100,
        volume: vol,
        turnover: turn,
        // 腾讯行情不提供PE和市值，从其他数据源补充或留空
        pe: "---",
        marketCap: "---",
        name,
      };
    }

    return result;
  } catch (e) {
    console.error("腾讯行情查询失败:", e);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const codes: string[] = body.codes || [];

    if (codes.length === 0) {
      return NextResponse.json({ quotes: {} });
    }

    const quotes = await fetchRealQuotes(codes);
    return NextResponse.json({ quotes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, quotes: {} }, { status: 500 });
  }
}
