import { NextRequest, NextResponse } from "next/server";

// 调用妙想数据工具获取股票行情
async function fetchQuotes(codes: string[]): Promise<Record<string, any>> {
  if (codes.length === 0) return {};

  // 构建查询文本：把所有股票名拼一起
  const query = codes.join(" ") + " 最新价 涨跌幅 今开 最高 最低 成交量 成交额 市盈率 总市值 所属行业 所属概念";

  try {
    const { execSync } = await import("child_process");
    const projectRoot = process.env.VERCEL
      ? "/tmp"
      : "/Users/etiaozi/.openclaw/workspace/investing-journey";
    const scriptPath = "/Users/etiaozi/.openclaw/workspace/skills/mx-data/mx_data.py";

    // 只在本地运行，Vercel上返回模拟数据
    if (process.env.VERCEL) {
      return generateMockData(codes);
    }

    const result = execSync(
      `cd /Users/etiaozi/.openclaw/workspace/skills/mx-data && python3 ./mx_data.py "${query}" 2>&1`,
      { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }
    );

    // 尝试从输出中解析
    const output = result.toString();
    return parseOutput(output, codes);
  } catch (e) {
    console.error("行情查询失败:", e);
    return generateMockData(codes);
  }
}

function parseOutput(output: string, codes: string[]): Record<string, any> {
  const result: Record<string, any> = {};

  // 从输出中提取每个股的数据
  for (const code of codes) {
    // 尝试匹配 "代码 | 名称 | 最新价 | 涨跌幅..."
    const pattern = new RegExp(`${code}\\s+\\|[^|]+\\|\\s*([\\d.]+)\\s*\\|\\s*([+-]?[\\d.]+%)`);
    const match = output.match(pattern);
    if (match) {
      result[code] = {
        price: parseFloat(match[1]),
        changePercent: parseFloat(match[2].replace("%", "")),
      };
    }
  }

  // 补充默认值
  for (const code of codes) {
    if (!result[code]) {
      result[code] = { price: 0, changePercent: 0 };
    }
  }

  return result;
}

function generateMockData(codes: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  const names: Record<string, string> = {
    "688710": "益诺思", "600875": "东方电气", "600850": "电科数字",
    "300394": "天孚通信", "603259": "药明康德", "603011": "合锻智能",
    "603938": "三孚股份", "300115": "长盈精密", "002436": "兴森科技",
    "002156": "通富微电", "002600": "领益智造", "688257": "慧谷新材",
  };
  const basePrices: Record<string, number> = {
    "688710": 67.79, "600875": 38.28, "600850": 22.25,
    "300394": 362.49, "603259": 102.03, "603011": 20.54,
    "603938": 28.15, "300115": 38.77, "002436": 32.87,
    "002156": 57.23, "002600": 17.03, "688257": 45.60,
  };
  for (const code of codes) {
    const base = basePrices[code] || 50;
    const pct = (Math.random() - 0.5) * 6;
    result[code] = {
      price: Math.round(base * (1 + pct / 100) * 100) / 100,
      changePercent: Math.round(pct * 100) / 100,
      high: Math.round(base * 1.03 * 100) / 100,
      low: Math.round(base * 0.97 * 100) / 100,
      volume: (Math.random() * 500 + 50).toFixed(0) + "万",
      turnover: (Math.random() * 5 + 0.5).toFixed(2) + "亿",
      pe: (Math.random() * 40 + 10).toFixed(1),
      marketCap: "---",
      industry: "---",
      concepts: "---",
    };
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const body = JSON.parse(text);
    const codes: string[] = body.codes || [];

    if (codes.length === 0) {
      return NextResponse.json({ quotes: {} });
    }

    const quotes = await fetchQuotes(codes);
    return NextResponse.json({ quotes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, quotes: {} }, { status: 500 });
  }
}
