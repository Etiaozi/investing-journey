import { NextRequest, NextResponse } from "next/server";

// 东方财富API：secid=1.XXX 上交所 | secid=0.XXX 深交所/创业板/北交所
// 返回 f57=代码, f58=名称
async function fetchNameEASTMoney(code: string): Promise<string | null> {
  const secId = (code.startsWith("6") || code.startsWith("68")) ? `1.${code}` : `0.${code}`;
  try {
    const res = await fetch(
      `https://push2.eastmoney.com/api/qt/stock/get?secid=${secId}&fields=f57,f58`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    if (data?.data?.f58 && data.data.f58 !== "上证指数") {
      return data.data.f58;
    }
  } catch {}
  return null;
}

interface StockInfo {
  code: string;
  name?: string;
  exchange?: string;
  industry?: string;
  concepts?: string[];
  analysis?: string;
  found: boolean;
}

function detectExchange(code: string): string {
  if (code.startsWith("60")) return "上交所/主板";
  if (code.startsWith("68")) return "科创板";
  if (code.startsWith("30")) return "深交所/创业板";
  if (code.startsWith("00")) return "深交所/主板";
  if (code.startsWith("002") || code.startsWith("003")) return "深交所/中小板";
  if (code.startsWith("4") || code.startsWith("8")) return "北交所";
  return "A股";
}

function guessIndustry(code: string, name: string): string {
  if (code.startsWith("688") || code.startsWith("30")) return "科技成长";
  if (code.startsWith("60") || code.startsWith("000")) return "主板蓝筹";
  if (code.startsWith("002") || code.startsWith("003")) return "中小企业";
  if (code.startsWith("8") || code.startsWith("4")) return "专精特新";
  return "A股上市公司";
}

function generateAnalysis(code: string, name: string, exchange: string): string {
  const isTech = code.startsWith("688") || code.startsWith("30") || code.startsWith("8");
  const isBlueChip = code.startsWith("60") || code.startsWith("000");

  let analysis = `${name}（${code}）为${exchange}上市公司。`;

  if (isTech) {
    analysis += "成长型标的，估值弹性较大，波动也相对较高。建议关注行业景气度和财报表现，控制仓位。";
  } else if (isBlueChip) {
    analysis += "蓝筹标的，关注行业龙头地位、盈利能力和分红记录。适合中线持有，估值低位时考虑介入。";
  } else {
    analysis += "建议结合基本面、行业趋势和估值水平综合判断。投资有风险，入市需谨慎。";
  }

  return analysis;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let code: string = (body.code || "").trim().toUpperCase();

    if (!code) return NextResponse.json({ found: false, error: "请提供股票代码" });
    code = code.replace(/\.(SH|SZ|BJ|SHH|SZS)$/, "");

    const exchange = detectExchange(code);

    // 1. 先从东方财富查名称
    let name = await fetchNameEASTMoney(code);

    // 2. 如果没查到，从本地已知股票库查找
    if (!name) {
      // 内置知名股票映射（备份）
      const knownNames: Record<string, string> = {
        "600519": "贵州茅台", "000858": "五粮液", "000333": "美的集团",
        "600036": "招商银行", "300750": "宁德时代", "002415": "海康威视",
        "601012": "隆基绿能", "688981": "中芯国际", "601318": "中国平安",
        "600900": "长江电力", "002594": "比亚迪", "688256": "寒武纪",
        "000651": "格力电器", "601398": "工商银行",
        "601857": "中国石油", "601988": "中国银行", "300059": "东方财富",
        "600887": "伊利股份", "600585": "海螺水泥", "600309": "万华化学",
        "601166": "兴业银行", "600000": "浦发银行", "600028": "中国石化",
        "688710": "益诺思", "600875": "东方电气", "600850": "电科数字",
        "300394": "天孚通信", "603259": "药明康德", "603011": "合锻智能",
        "603938": "三孚股份", "300115": "长盈精密", "002436": "兴森科技",
        "002156": "通富微电", "002600": "领益智造", "301683": "慧谷新材",
      };
      name = knownNames[code] || null;
    }

    if (!name) {
      return NextResponse.json({
        found: false,
        code,
        error: `未找到代码 ${code} 对应的股票名称。请检查代码是否正确（如600519.SH、300750.SZ）。`,
      });
    }

    // 3. 生成行业和分析
    const industry = guessIndustry(code, name);
    const concepts: string[] = [exchange, "关注标的"];
    if (code.startsWith("688")) concepts.push("科创板", "科技创新");
    if (code.startsWith("30")) concepts.push("创业板", "成长创新");
    if (code.startsWith("60")) concepts.push("沪市主板");

    const analysis = generateAnalysis(code, name, exchange);

    // 构建关注原因（自动填充）
    const reason = `${industry} · ${concepts.slice(0, 3).join(" ")}`;

    return NextResponse.json({
      found: true,
      code,
      name,
      exchange,
      industry,
      concepts,
      analysis,
      reason,
    });
  } catch (e: any) {
    return NextResponse.json({ found: false, error: e.message }, { status: 500 });
  }
}
