import { NextRequest, NextResponse } from "next/server";

interface KLine {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;   // 手
  volumeYuan: number; // 成交额（元）
}

async function fetchKLines(code: string): Promise<KLine[]> {
  const prefix = code.startsWith("6") ? "sh" : "sz";
  try {
    const res = await fetch(
      `http://web.ifzq.gtimg.cn/appstock/app/fqkline/get?param=${prefix}${code},day,,,10,qfq`,
      { signal: AbortSignal.timeout(8000) }
    );
    const text = await res.text();
    const data = JSON.parse(text);
    const klines = data?.data?.[`${prefix}${code}`]?.qfqday || [];
    // qfqday格式: ["2026-05-19","开盘","前收盘","最高","最低","成交量"]
    const result: KLine[] = [];
    for (const k of klines) {
      if (k.length >= 6) {
        result.push({
          date: k[0],
          open: parseFloat(k[1]) || 0,
          close: parseFloat(k[2]) || 0,
          high: parseFloat(k[3]) || 0,
          low: parseFloat(k[4]) || 0,
          volume: parseFloat(k[5]) || 0,
          volumeYuan: k.length > 6 ? (parseFloat(k[6]) || 0) : 0,
        });
      }
    }
    return result;
  } catch (e) {
    console.error(`K线获取失败 ${code}:`, e);
    return [];
  }
}

// 实时行情API（已有的腾讯接口）
async function fetchRealQuotes(codes: string[]): Promise<Record<string, any>> {
  if (codes.length === 0) return {};
  const qs = codes.map(c => `${c.startsWith("6") ? "sh" : "sz"}${c}`).join(",");
  try {
    const res = await fetch(`http://qt.gtimg.cn/q=${qs}`, { signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    const result: Record<string, any> = {};
    for (const line of text.split("\n").filter(l => l.trim())) {
      const match = line.match(/"(.+)"/);
      if (!match) continue;
      const parts = match[1].split("~");
      if (parts.length < 10) continue;
      const code = parts[2]?.trim();
      if (!code || !codes.includes(code)) continue;
      const price = parseFloat(parts[3]) || 0;
      const prevClose = parseFloat(parts[4]) || price;
      const changePct = prevClose > 0 ? ((price - prevClose) / prevClose * 100) : 0;
      const volumeHand = parseFloat(parts[6]) || 0;
      const high = parseFloat(parts[33]) || 0;
      const low = parseFloat(parts[34]) || 0;
      const turnoverYuan = parseFloat(parts[37]) || 0;
      const turnoverRate = parseFloat(parts[38]) || 0;
      result[code] = {
        price: Math.round(price * 100) / 100,
        changePercent: Math.round(changePct * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        open: parseFloat(parts[5]) || 0,
        volume: volumeHand >= 10000 ? (volumeHand / 10000).toFixed(1) + "万手" : volumeHand.toFixed(0) + "手",
        turnover: turnoverYuan >= 100000000 ? (turnoverYuan / 100000000).toFixed(2) + "亿" : turnoverYuan >= 10000 ? (turnoverYuan / 10000).toFixed(0) + "万" : turnoverYuan.toFixed(0),
        turnoverRate: turnoverRate.toFixed(2) + "%",
        pe: parseFloat(parts[39]) ? parseFloat(parts[39]).toFixed(2) : "---",
        marketCap: "---",
        name: parts[1],
      };
    }
    return result;
  } catch (e) {
    console.error("行情查询失败:", e);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const codes: string[] = body.codes || [];
    const withKline: boolean = body.kline === true;

    if (codes.length === 0) return NextResponse.json({ quotes: {} });

    const quotes = await fetchRealQuotes(codes);

    // 如果需要K线数据
    let klines: Record<string, KLine[]> = {};
    if (withKline) {
      for (const code of codes) {
        klines[code] = await fetchKLines(code);
      }
    }

    return NextResponse.json({ quotes, klines: withKline ? klines : undefined });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, quotes: {} }, { status: 500 });
  }
}
