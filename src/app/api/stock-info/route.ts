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
    const res = await fetch(`https://push2.eastmoney.com/api/qt/stock/get?secid=${secId(code)}&fields=f57,f58`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (data?.data?.f58 && data.data.f58 !== "上证指数") return data.data.f58;
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
  reason?: string;
  found: boolean;
}

// 行业智能判断（基于代码和名称）
function smartIndustry(code: string, name: string): string {
  const n = name;
  // 行业关键词匹配
  if (n.includes("医药") || n.includes("生物") || n.includes("药业") || n.includes("医疗") || n.includes("CRO") || n.includes("药") && !n.includes("银行")) return "医药生物";
  if (n.includes("半导体") || n.includes("芯片") || n.includes("集成") || n.includes("微电") || n.includes("中芯")) return "半导体";
  if (n.includes("证券") || n.includes("银行") || n.includes("保险") || n.includes("信托") || n.includes("金控")) return "金融";
  if (n.includes("数据") || n.includes("软件") || n.includes("信息") || n.includes("科技") || n.includes("数字") || n.includes("电子") && !n.includes("药")) return "科技成长";
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

// 概念标签生成
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

  // 按代码自动补充
  if (code.startsWith("688")) concepts.push("科创板", "科技创新");
  if (code.startsWith("30")) concepts.push("创业板", "高成长");
  if (code.startsWith("60")) concepts.push("沪市主板");
  if (code.startsWith("00") || code.startsWith("002")) concepts.push("深市主板");

  return [...new Set(concepts)];
}

// AI分析生成（基于行业和代码特征）
function smartAnalysis(code: string, name: string, industry: string, concepts: string[]): string {
  const cList = concepts.slice(0, 4).join("、");
  const isTech = code.startsWith("688") || code.startsWith("30");
  const isCyc = code.startsWith("60") || code.startsWith("000");

  let analysis = `**${name}（${code}）** 所属行业：${industry}。概念标签：${cList}。`;

  if (name.includes("药") || name.includes("CRO") || name.includes("医药") || name.includes("生物")) {
    analysis += "医药行业高壁垒、长赛道，关注创新管线进展和集采影响。估值受政策和市场情绪双重影响，需结合PE和研发投入综合判断。";
  } else if (name.includes("半导体") || name.includes("芯片") || name.includes("微电") || code === "688981") {
    analysis += "半导体是国家战略性产业，国产替代长期逻辑不变。短期受全球半导体周期和地缘政治影响，波动较大。关注订单能见度和产能利用率指标。";
  } else if (name.includes("数据") || name.includes("软件") || name.includes("信息") || name.includes("数字") || isTech) {
    analysis += "科技成长型标的，具备较高的弹性但波动也大。建议关注营收增速、毛利率趋势和研发投入转化效率。估值中枢参考PS和PEG指标。";
  } else if (name.includes("电力") || name.includes("电气") || name.includes("核电") || name.includes("能源")) {
    analysis += "能源类标的，政策驱动性强。关注装机量、订单增速和盈利改善趋势。央企标的建议关注改革进程和分红稳定性。适合中长期持有。";
  } else if (isCyc) {
    analysis += "主板蓝筹标的，盈利稳定性较好。建议关注PE历史分位、ROE水平、股息率等价值指标。适合在估值低位分批介入。";
  } else {
    analysis += "建议从行业景气度、公司基本面（营收、利润、现金流）和估值三个维度综合评估。设置合理的止损位，控制单只仓位。";
  }

  analysis += `当前市值和估值需结合最新财报分析，建议定期跟踪季报表现。此分析由AI自动生成，不构成投资建议。`;
  return analysis;
}

// 生成关注原因
function smartReason(code: string, name: string, industry: string, concepts: string[]): string {
  const cStr = concepts.slice(0, 3).join(" · ");
  return `${industry} · ${cStr} · AI自动分析生成`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let code: string = (body.code || "").trim().toUpperCase();
    if (!code) return NextResponse.json({ found: false, error: "请提供股票代码" });
    code = code.replace(/\.(SH|SZ|BJ|SHH|SZS|SH)$/, "");

    const exchange = detectExchange(code);

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

    const industry = smartIndustry(code, name);
    const concepts = smartConcepts(code, name, exchange);
    const analysis = smartAnalysis(code, name, industry, concepts);
    const reason = smartReason(code, name, industry, concepts);

    return NextResponse.json({ found: true, code, name, exchange, industry, concepts, analysis, reason });
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
