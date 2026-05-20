import { NextRequest, NextResponse } from "next/server";

const SEC_ID_PREFIXES: Record<string, string> = {
  "6": "1.", "68": "1.", "30": "0.", "00": "0.", "002": "0.", "003": "0.", "4": "0.", "8": "0.",
};

function secId(code: string): string {
  for (const [pre, id] of Object.entries(SEC_ID_PREFIXES)) {
    if (code.startsWith(pre)) return id + code;
  }
  return "0." + code;
}

async function fetchNameEASTMoney(code: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://push2.eastmoney.com/api/qt/stock/get?secid=${secId(code)}&fields=f57,f58`,
      { signal: AbortSignal.timeout(5000) }
    );
    const data = await res.json();
    if (data?.data?.f58 && data.data.f58 !== "上证指数") return data.data.f58;
  } catch {}
  return null;
}

// ---------- 妙想搜索（获取实时研报观点） ----------

const MX_API_URL = "https://mkapi2.dfcfs.com/finskillshub/api/claw/news-search";

interface MXReport {
  title: string;
  content: string;
  date: string;
  sourceName?: string;
  insName?: string;
  rating?: string;   // 评级
  summary?: string;
}

async function fetchMXReports(stockName: string, stockCode: string): Promise<MXReport[]> {
  const apiKey = process.env.MX_APIKEY;
  if (!apiKey) return [];

  try {
    // 发起两个搜索请求：研报 + 近期新闻
    const [reportRes, newsRes] = await Promise.allSettled([
      fetch(MX_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify({ query: `${stockName} ${stockCode} 最新研报 2026`, size: 6 }),
        signal: AbortSignal.timeout(8000),
      }),
      fetch(MX_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: apiKey },
        body: JSON.stringify({ query: `${stockName} ${stockCode} 基本面 业绩 2026`, size: 6 }),
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    const results: MXReport[] = [];

    for (const settled of [reportRes, newsRes]) {
      if (settled.status !== "fulfilled" || !settled.value.ok) continue;
      const json = await settled.value.json();
      const items =
        json?.data?.data?.llmSearchResponse?.data;
      if (Array.isArray(items)) {
        for (const item of items) {
          results.push({
            title: item.title || "",
            content: item.content || "",
            date: item.date || item.publishTime || "",
            sourceName: item.sourceName || "",
            insName: item.insName || "",
            rating: item.rating || "",
            summary: item.summary || "",
          });
        }
      }
    }

    return results;
  } catch {
    return [];
  }
}

// ---------- 从研报数据提取关键指标 ----------

function extractKeyMetrics(reports: MXReport[]): {
  eps?: string;
  revenue?: string;
  profit?: string;
  targetPrice?: string;
  ratings: string[];
  keyPoints: string[];
} {
  const ratings: string[] = [];
  const keyPoints: string[] = [];
  let eps: string | undefined;
  let revenue: string | undefined;
  let profit: string | undefined;
  let targetPrice: string | undefined;

  for (const report of reports) {
    if (report.rating) ratings.push(report.rating);
    const content = report.content || "";

    // 提取营收、利润、EPS、目标价等关键数据
    const revMatch = content.match(/(?:营收|收入|营业收入)\s*(?:为|达到|实现)?\s*(\d+[\.\d]*)亿/);
    if (revMatch && !revenue) revenue = revMatch[1] + "亿";

    const profitMatch = content.match(/(?:归母净利润|净利润)\s*(?:为|达到|实现)?\s*(\d+[\.\d]*)亿/);
    if (profitMatch && !profit) profit = profitMatch[1] + "亿";

    const epsMatch = content.match(/(?:EPS|每股收益)\s*(?:为|约|达到)?\s*([\d\.]+)元/);
    if (epsMatch && !eps) eps = epsMatch[1] + "元";

    const targetMatch = content.match(/(?:目标价|目标价格)\s*(?:为|看|看到)?\s*(\d+[\.\d]*)元/);
    if (targetMatch && !targetPrice) targetPrice = targetMatch[1] + "元";

    // 提取关键观点（前150字摘要）
    const clean = content
      .replace(/\s+/g, " ")
      .replace(/(?:通富微电|公司)\(\d+\)/, "")
      .trim();
    const sentences = clean.split(/[。；！？\n]/).filter(Boolean);
    const meaningful = sentences.filter(
      (s) =>
        !s.includes("评级") &&
        !s.includes("维持") &&
        !s.includes("事件") &&
        s.length > 15 &&
        s.length < 120 &&
        (s.includes("营收") || s.includes("净利") || s.includes("目标") || s.includes("估值") || s.includes("增长") || s.includes("看好"))
    );
    for (const s of meaningful.slice(0, 4)) {
      const trimmed = s.trim().replace(/^[，、．\s]+/, "");
      if (trimmed.length > 10 && !keyPoints.includes(trimmed)) {
        keyPoints.push(trimmed);
      }
    }
  }

  return { eps, revenue, profit, targetPrice, ratings: [...new Set(ratings)], keyPoints: keyPoints.slice(0, 5) };
}

// ---------- 从研报中提取行业和概念 ----------

// 公司名称→行业映射（硬编码知名公司确保准确）
const KNOWN_INDUSTRIES: Record<string, string> = {
  "贵州茅台": "白酒/消费", "五粮液": "白酒/消费", "泸州老窖": "白酒/消费",
  "宁德时代": "新能源/动力电池", "比亚迪": "新能源/汽车",
  "美的集团": "家电/消费电子", "格力电器": "家电/消费电子",
  "招商银行": "银行/金融", "工商银行": "银行/金融", "建设银行": "银行/金融",
  "中国平安": "保险/金融", "中国人寿": "保险/金融",
  "恒瑞医药": "医药生物", "药明康德": "医药生物/CRO", "百济神州": "医药生物",
  "中芯国际": "半导体/晶圆代工", "北方华创": "半导体/设备", "中微公司": "半导体/设备",
  "海光信息": "半导体/芯片设计", "寒武纪": "半导体/AI芯片", "澜起科技": "半导体/芯片设计",
  "金山办公": "科技/软件", "科大讯飞": "人工智能",
  "东方财富": "金融/互联网券商", "同花顺": "金融/互联网券商",
  "中国移动": "通信运营商", "中国电信": "通信运营商",
  "通富微电": "半导体封测", "长电科技": "半导体封测",
  "长江电力": "电力/水电", "华能国际": "电力/火电",
  "隆基绿能": "新能源/光伏", "阳光电源": "新能源/光伏逆变器",
  "天孚通信": "光模块/光通信", "中际旭创": "光模块/光通信",
  "东方电气": "电力设备/能源装备", "上海电气": "电力设备/能源装备",
  "合锻智能": "高端装备/智能分选", "汇川技术": "工业自动化/工控",
  "领益智造": "消费电子/精密制造", "立讯精密": "消费电子/精密制造",
  "海康威视": "安防/AI视觉", "大华股份": "安防/AI视觉",
  "兴森科技": "PCB/IC载板", "深南电路": "PCB/IC载板",
  "长盈精密": "消费电子/精密制造",
  "三孚股份": "精细化工/硅材料", "万华化学": "化工/新材料",
  "益诺思": "医药/CRO", "慧谷新材": "功能性新材料",
  "电科数字": "信创/数字政务",
};

function extractIndustryConcepts(reports: MXReport[], name: string): { industry: string; concepts: string[] } {
  // 优先从公司名精确匹配
  if (KNOWN_INDUSTRIES[name]) {
    return { industry: KNOWN_INDUSTRIES[name], concepts: [] };
  }

  // 从研报标题提取（标题通常包含核心关键词）
  const titles = reports.map((r) => r.title || "").join(" ");

  // 行业关键字（优先匹配标题，其次是名称）
  const titleIndustryKeywords: [string, string][] = [
    ["封测", "半导体封测"],
    ["封装", "半导体封测"],
    ["先进封装", "半导体先进封装"],
    ["Chiplet", "半导体先进封装"],
    ["晶圆代工", "半导体/晶圆代工"],
    ["半导体设备", "半导体/设备"],
    ["半导体材料", "半导体/材料"],
    ["半导体", "半导体"],
    ["芯片", "半导体"],
    ["光模块", "光模块/光通信"],
    ["光通信", "光模块/光通信"],
    ["CPO", "光模块/光通信"],
    ["光纤", "光模块/光通信"],
    ["新能源", "新能源"],
    ["光伏", "新能源/光伏"],
    ["光伏逆变器", "新能源/光伏逆变器"],
    ["锂电池", "新能源/锂电池"],
    ["动力电池", "新能源/动力电池"],
    ["储能", "储能"],
    ["白酒", "白酒/消费"],
    ["食品饮料", "食品饮料/消费"],
    ["医药", "医药生物"],
    ["创新药", "医药生物/创新药"],
    ["CRO", "医药生物/CRO"],
    ["汽车", "汽车"],
    ["新能源车", "新能源/汽车"],
    ["电力", "电力设备"],
    ["核电", "电力设备/核电"],
    ["天然气", "能源/天然气"],
    ["电气", "电力设备"],
    ["氢能", "氢能源"],
    ["消费电子", "消费电子"],
    ["通信", "通信"],
    ["信创", "信创/数字政务"],
    ["AI", "人工智能"],
    ["人工智能", "人工智能"],
    ["大模型", "人工智能"],
    ["机器人", "高端装备/机器人"],
    ["工业母机", "高端装备/工业母机"],
    ["军工", "国防军工"],
    ["PCB", "PCB/IC载板"],
    ["IC载板", "PCB/IC载板"],
    ["材料", "新材料"],
    ["化工", "化工/新材料"],
  ];

  let industry = "A股上市公司";
  // 先匹配研报标题（更精确）
  for (const [kw, ind] of titleIndustryKeywords) {
    if (titles.includes(kw)) {
      industry = ind;
      break;
    }
  }

  // 标题没匹配到，用股票名称
  if (industry === "A股上市公司") {
    for (const [kw, ind] of titleIndustryKeywords) {
      if (name.includes(kw)) {
        industry = ind;
        break;
      }
    }
  }

  // 概念标签：只从标题提取，避免正文噪声
  const conceptTitleKeywords: [string, string][] = [
    ["先进封装", "先进封装"],
    ["Chiplet", "Chiplet/先进封装"],
    ["国产替代", "国产替代"],
    ["AI算力", "AI算力"],
    ["人工智能", "人工智能"],
    ["机器人", "机器人"],
    ["5G", "5G/6G"],
    ["信创", "信创"],
    ["数字经济", "数字经济"],
    ["央国企改革", "央国企改革"],
    ["国企改革", "央国企改革"],
    ["一带一路", "一带一路"],
    ["专精特新", "专精特新"],
    ["核能", "核能核电"],
    ["核聚变", "核聚变"],
    ["储能", "储能"],
    ["抽水蓄能", "抽水蓄能"],
    ["氢能", "氢能源"],
    ["光伏", "光伏"],
    ["特斯拉", "新能源车/特斯拉"],
    ["华为", "华为产业链"],
    ["苹果", "苹果产业链"],
    ["数据中心", "数据中心"],
    ["液冷", "液冷/散热"],
    ["铜缆", "高速铜缆互联"],
    ["物联网", "物联网"],
    ["英伟达", "英伟达产业链"],
    ["AMD", "AMD产业链"],
    ["GPU", "GPU/AI算力"],
    ["CPU", "CPU/处理器"],
  ];

  const found = new Set<string>();
  for (const [kw, concept] of conceptTitleKeywords) {
    if (titles.includes(kw) || name.includes(kw)) {
      found.add(concept);
    }
  }

  // 根据行业补充常见概念
  if (industry.includes("半导体")) found.add("国产替代");
  if (industry.includes("医药")) found.add("大健康");
  if (industry.includes("电力") || industry.includes("能源")) found.add("央国企改革");

  return { industry, concepts: [...found] };
}

// ---------- 生成分析文本 ----------

function generateAnalysis(
  name: string,
  code: string,
  industry: string,
  concepts: string[],
  reports: MXReport[],
  metrics: ReturnType<typeof extractKeyMetrics>
): { analysis: string; reason: string } {
  const cStr = concepts.slice(0, 5).join(" · ");
  const ratingStr = metrics.ratings.length > 0 ? metrics.ratings.slice(0, 3).join(" / ") : "";
  const hasReports = reports.length > 0;

  let analysis = `**${name}（${code}）**`;

  // 财务概况（有研报时）
  if (hasReports) {
    const parts: string[] = [];
    if (metrics.revenue) parts.push(`营收${metrics.revenue}`);
    if (metrics.profit) parts.push(`净利${metrics.profit}`);
    if (metrics.eps) parts.push(`EPS ${metrics.eps}`);
    if (metrics.targetPrice) parts.push(`目标价${metrics.targetPrice}`);
    if (parts.length > 0) {
      analysis += ` · ${parts.join(" · ")}`;
    }
  }

  analysis += `\n\n📁 **行业**：${industry}`;

  // 概念标签
  if (concepts.length > 0) {
    analysis += `\n🏷️ **概念**：${cStr}`;
  }

  // 机构观点
  if (ratingStr) {
    analysis += `\n🏢 **机构评级**：${ratingStr}`;
  }

  if (hasReports && reports.length > 0) {
    // 最新研报题目
    const latestReport = reports[0];
    if (latestReport.title) {
      analysis += `\n\n🔍 **最新研报**：${latestReport.title}`;
      if (latestReport.insName) {
        analysis += `（${latestReport.insName}）`;
      }
    }
  }

  // AI 关键分析
  analysis += `\n\n📊 **AI分析**：`;

  if (hasReports && metrics.keyPoints.length > 0) {
    // 从研报中提取关键观点
    for (const point of metrics.keyPoints.slice(0, 3)) {
      analysis += `\n• ${point}。`;
    }
  }

  // 补充机构数量
  if (hasReports) {
    const uniqueOrgs = [...new Set(reports.map((r) => r.insName).filter(Boolean))];
    if (uniqueOrgs.length > 0) {
      analysis += `\n• 近期待${uniqueOrgs.length}家机构发布研报关注该标的，市场关注度较高。`;
    }
  }

  // 风险提示
  analysis += `\n\n⚠️ **风险提示**：以上分析基于公开研报数据由AI自动生成，不构成投资建议。投资有风险，请结合自身情况判断。`;

  // 关注原因
  const reason = `${industry} · ${cStr}`;

  return { analysis, reason };
}

// ---------- 兜底分析（没有研报时） ----------

function smartIndustry(code: string, name: string): string {
  const n = name;
  if (n.includes("医药") || n.includes("生物") || n.includes("药业") || n.includes("医疗") || n.includes("CRO") || (n.includes("药") && !n.includes("银行"))) return "医药生物";
  if (n.includes("半导体") || n.includes("芯片") || n.includes("集成") || n.includes("微电") || n.includes("中芯")) return "半导体";
  if (n.includes("证券") || n.includes("银行") || n.includes("保险") || n.includes("信托") || n.includes("金控")) return "金融";
  if (n.includes("数据") || n.includes("软件") || n.includes("信息") || n.includes("科技") || n.includes("数字") || (n.includes("电子") && !n.includes("药"))) return "科技成长";
  if (n.includes("光伏") || n.includes("新能源") || n.includes("锂") || n.includes("电池") || n.includes("特斯拉")) return "新能源";
  if (n.includes("通信") || n.includes("光模块") || n.includes("光纤")) return "光通信";
  if (n.includes("航天") || n.includes("航空") || n.includes("军工") || n.includes("电科") || n.includes("中航")) return "国防军工";
  if (n.includes("汽车") || n.includes("车") || n.includes("比亚迪")) return "汽车";
  if (n.includes("材料") || n.includes("化学") || n.includes("硅") || n.includes("新材") || n.includes("纤维")) return "新材料";
  if (n.includes("装备") || n.includes("机械") || n.includes("制造") || n.includes("数控") || n.includes("设备")) return "高端装备";
  if (n.includes("电力") || n.includes("电气") || n.includes("核电") || n.includes("能源") || n.includes("风电")) return "电力设备";
  if (n.includes("精密") || n.includes("领益") || n.includes("结构件")) return "消费电子/精密制造";
  if (n.includes("PCB") || n.includes("载板") || n.includes("电路板")) return "PCB/半导体载板";
  if (n.includes("封测") || n.includes("封装")) return "半导体封测";
  if (code.startsWith("688") || code.startsWith("30")) return "科技成长";
  if (code.startsWith("60") || code.startsWith("000")) return "主板蓝筹";
  return "A股上市公司";
}

function smartConcepts(code: string, name: string, exchange: string): string[] {
  const concepts: string[] = [exchange];
  const n = name;
  if (n.includes("药") || n.includes("医药") || n.includes("生物") || n.includes("CRO")) concepts.push("医药生物", "大健康");
  if (n.includes("半导体") || n.includes("芯片") || n.includes("微电")) concepts.push("半导体", "国产替代");
  if (n.includes("数据") || n.includes("软件") || n.includes("信息") || n.includes("数字")) concepts.push("信创", "数字经济", "国产软件");
  if (n.includes("光伏") || n.includes("新能源") || n.includes("锂")) concepts.push("新能源", "光伏");
  if (n.includes("通信") || n.includes("光模块") || n.includes("光纤")) concepts.push("光模块", "5G/6G", "AI算力");
  if (n.includes("军工") || n.includes("航天") || n.includes("电科")) concepts.push("军工", "央企改革");
  if (n.includes("汽车") || n.includes("比亚迪") || n.includes("新能源车")) concepts.push("新能源车", "汽车零部件");
  if (n.includes("材料") || n.includes("新材") || n.includes("化学") || n.includes("硅")) concepts.push("新材料", "精细化工");
  if (n.includes("装备") || n.includes("机械") || n.includes("数控")) concepts.push("高端制造", "工业母机");
  if (n.includes("电力") || n.includes("电气") || n.includes("核电")) concepts.push("核能核电", "电力设备", "央国企改革");
  if (n.includes("消费电子") || n.includes("精密") || n.includes("领益")) concepts.push("消费电子", "苹果产业链");
  if (n.includes("PCB") || n.includes("载板") || n.includes("兴森")) concepts.push("PCB", "IC载板", "国产替代");
  if (n.includes("封测") || n.includes("通富") || n.includes("微电")) concepts.push("半导体封测", "先进封装");

  if (code.startsWith("688")) concepts.push("科创板", "科技创新");
  if (code.startsWith("30")) concepts.push("创业板", "高成长");
  if (code.startsWith("60")) concepts.push("沪市主板");
  if (code.startsWith("00") || code.startsWith("002")) concepts.push("深市主板");

  return [...new Set(concepts)];
}

function fallbackAnalysis(name: string, code: string, industry: string, concepts: string[]): string {
  const cList = concepts.slice(0, 4).join("、");
  const isTech = code.startsWith("688") || code.startsWith("30");

  let text = `**${name}（${code}）** 所属行业：${industry}。概念标签：${cList}。\n\n📊 **AI分析**：`;

  if (name.includes("药") || name.includes("CRO") || name.includes("医药") || name.includes("生物")) {
    text += "医药行业高壁垒、长赛道，关注创新管线进展和集采影响。估值受政策和市场情绪双重影响，需结合PE和研发投入综合判断。";
  } else if (name.includes("半导体") || name.includes("芯片") || name.includes("微电")) {
    text += "半导体是国家战略性产业，国产替代长期逻辑不变。短期受全球半导体周期和地缘政治影响，波动较大。关注订单能见度和产能利用率指标。";
  } else if (name.includes("数据") || name.includes("软件") || name.includes("信息") || name.includes("数字") || isTech) {
    text += "科技成长型标的，具备较高的弹性但波动也大。建议关注营收增速、毛利率趋势和研发投入转化效率。估值中枢参考PS和PEG指标。";
  } else if (name.includes("电力") || name.includes("电气") || name.includes("核电") || name.includes("能源")) {
    text += "能源类标的，政策驱动性强。关注装机量、订单增速和盈利改善趋势。央企标的建议关注改革进程和分红稳定性，适合中长期持有。";
  } else {
    text += "建议从行业景气度、公司基本面（营收、利润、现金流）和估值三个维度综合评估。设置合理的止损位，控制单只仓位。";
  }

  text += "\n\n⚠️ **风险提示**：以上分析由AI自动生成，不构成投资建议。投资有风险，请结合自身情况判断。";
  return text;
}

// ---------- Main ----------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let code: string = (body.code || "").trim().toUpperCase();
    if (!code) return NextResponse.json({ found: false, error: "请提供股票代码" });
    code = code.replace(/\.(SH|SZ|BJ|SHH|SZS|SH)$/, "");

    const exchange = detectExchange(code);

    // 1. 获取股票名称
    let name = await fetchNameEASTMoney(code);

    if (!name) {
      const knownNames: Record<string, string> = {
        "600519": "贵州茅台", "000858": "五粮液", "000333": "美的集团", "600036": "招商银行",
        "300750": "宁德时代", "002415": "海康威视", "601012": "隆基绿能", "688981": "中芯国际",
        "601318": "中国平安", "600900": "长江电力", "002594": "比亚迪", "688256": "寒武纪",
        "000651": "格力电器", "601398": "工商银行", "601857": "中国石油", "300059": "东方财富",
        "600887": "伊利股份", "600585": "海螺水泥", "600309": "万华化学", "601166": "兴业银行",
        "688710": "益诺思", "600875": "东方电气", "600850": "电科数字", "300394": "天孚通信",
        "603259": "药明康德", "603011": "合锻智能", "603938": "三孚股份", "300115": "长盈精密",
        "002436": "兴森科技", "002156": "通富微电", "002600": "领益智造", "301683": "慧谷新材",
        "601858": "中国科传", "600941": "中国移动", "601728": "中国电信",
        "688041": "海光信息", "688072": "拓荆科技", "688012": "中微公司", "688008": "澜起科技",
        "688111": "金山办公", "688169": "石头科技", "688223": "晶科能源", "688303": "大全能源",
        "688382": "益方生物", "688536": "思瑞浦", "688561": "奇安信", "688599": "天合光能",
        "688660": "电气风电", "688686": "奥普特", "688690": "纳微科技",
        "300124": "汇川技术", "300274": "阳光电源", "300308": "中际旭创",
        "300502": "新易盛", "300782": "卓胜微", "300896": "爱美客", "300957": "贝泰妮",
        "300979": "华利集团", "002920": "德赛西威", "002916": "深南电路", "002841": "视源股份",
        "002812": "恩捷股份", "002709": "天赐材料", "002475": "立讯精密", "002460": "赣锋锂业",
        "002371": "北方华创", "002230": "科大讯飞",
      };
      name = knownNames[code];
    }

    if (!name) {
      return NextResponse.json({ found: false, code, error: `未找到代码 ${code}，请检查是否正确` });
    }

    // 2. 获取妙想研报数据
    const reports = await fetchMXReports(name, code);

    // 3. 生成分析
    let industry: string;
    let concepts: string[];
    let analysis: string;
    let reason: string;

    if (reports.length > 0) {
      // 有真实研报数据 → 基于研报生成分析
      const extracted = extractIndustryConcepts(reports, name);
      industry = extracted.industry;
      concepts = extracted.concepts;
      const metrics = extractKeyMetrics(reports);
      const result = generateAnalysis(name, code, industry, concepts, reports, metrics);
      analysis = result.analysis;
      reason = result.reason;
    } else {
      // 没有研报 → 兜底规则分析
      industry = smartIndustry(code, name);
      concepts = smartConcepts(code, name, exchange);
      analysis = fallbackAnalysis(name, code, industry, concepts);
      reason = `${industry} · ${concepts.slice(0, 3).join(" · ")}`;
    }

    return NextResponse.json({ found: true, code, name, exchange, industry, concepts, analysis, reason, hasReports: reports.length > 0 });
  } catch (e: any) {
    return NextResponse.json({ found: false, error: e.message }, { status: 500 });
  }
}

function detectExchange(code: string): string {
  if (code.startsWith("60")) return "上交所主板";
  if (code.startsWith("68")) return "科创板";
  if (code.startsWith("30")) return "创业板";
  if (code.startsWith("00")) return "深交所主板";
  if (code.startsWith("002") || code.startsWith("003")) return "深交所中小板";
  if (code.startsWith("4") || code.startsWith("8")) return "北交所";
  return "A股";
}
