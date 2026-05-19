import { NextRequest, NextResponse } from "next/server";

// 股票代码前缀 → 交易所
const exchanges: Record<string, string> = {
  "6": "上交所", "9": "上交所", "0": "深交所", "3": "深交所", "4": "北交所", "8": "北交所",
};

function detectExchange(code: string): string {
  const prefix = code[0];
  if (code.startsWith("60") || code.startsWith("68")) return "上交所/科创板";
  if (code.startsWith("30")) return "深交所/创业板";
  if (code.startsWith("00")) return "深交所/主板";
  if (code.startsWith("4") || code.startsWith("8")) return "北交所";
  return "A股";
}

// 基于后缀或代码特征猜测行业
function guessIndustry(code: string): string {
  const c = code;
  if (c.startsWith("688") || c.startsWith("30")) return "科技/成长";
  if (c.startsWith("60") || c.startsWith("000")) return "主板蓝筹";
  if (c.startsWith("002") || c.startsWith("00")) return "中小板";
  if (c.startsWith("8") || c.startsWith("4")) return "专精特新";
  return "A股上市公司";
}

interface StockInfoResponse {
  name?: string;
  exchange?: string;
  industry?: string;
  concepts?: string[];
  analysis?: string;
  found: boolean;
}

// 已确定名称的常用股票（覆盖我们关注的 + 常见A股）
const knownStocks: Record<string, { name: string; industry: string; concepts: string[]; analysis: string }> = {
  "688710": { name: "益诺思", industry: "CRO/生物医药", concepts: ["CAR-T细胞疗法", "CRO", "创新药", "央国企改革"], analysis: "国药集团旗下CRO企业，2026Q1净利润同比+121%，机构持股66%。" },
  "600875": { name: "东方电气", industry: "能源装备", concepts: ["核能核电", "氢能源", "抽水蓄能", "央国企改革"], analysis: "全球最大发电设备供应商，央企控股51.37%，2026Q1净利+37.4%。" },
  "600850": { name: "电科数字", industry: "信创/数字政务", concepts: ["信创", "央企改革", "数字政府"], analysis: "中国电科旗下数字城市龙头。超跌反弹+8.75%，央企改革预期是中期催化剂。" },
  "300394": { name: "天孚通信", industry: "光模块/光通信", concepts: ["光模块", "5G", "数据中心", "云计算"], analysis: "光模块龙头，AI算力需求驱动行业景气。PE 128倍估值偏高，建议等回调。" },
  "603259": { name: "药明康德", industry: "CRO/CDMO", concepts: ["CRO", "创新药", "MSCI", "沪深300"], analysis: "CRO绝对龙头，PE仅15倍。ROE 27%盈利能力行业顶级，适合长期配置。" },
  "603011": { name: "合锻智能", industry: "高端装备/智能分选", concepts: ["高端制造", "工业母机", "核电装备"], analysis: "创立于1951年，国家级单项冠军。主营液压机/机械压力机+智能色选机。" },
  "603938": { name: "三孚股份", industry: "精细化工/硅材料", concepts: ["精细化工", "新材料", "半导体材料", "专精特新"], analysis: "唐山硅业龙头，专精特新小巨人。主营三氯氢硅、硅烷偶联剂等。" },
  "300115": { name: "长盈精密", industry: "消费电子/新能源车", concepts: ["消费电子", "苹果产业链", "新能源车", "机器人"], analysis: "精密制造企业，手机零组件+新能源车零组件+机器人。液冷快接头是新增长点。" },
  "002436": { name: "兴森科技", industry: "PCB/IC载板", concepts: ["PCB", "半导体载板", "电子元器件", "国产替代"], analysis: "主营PCB和IC载板，FCBGA载板国产化代表。等待盈利拐点确认。" },
  "002156": { name: "通富微电", industry: "半导体封测", concepts: ["半导体", "封装测试", "先进封装", "国产替代"], analysis: "半导体封测龙头，与AMD深度合作。受益AI芯片需求增长和Chiplet趋势。" },
  "002600": { name: "领益智造", industry: "精密功能件", concepts: ["精密功能件", "消费电子", "新能源车", "散热"], analysis: "全球精密功能件龙头，苹果核心供应商。已向新能源车和机器人延伸。" },
  "301683": { name: "慧谷新材", industry: "功能性新材料", concepts: ["功能性新材料", "专精特新"], analysis: "功能性新材料企业，总市值92亿。主营锂电功能性材料。" },
  // 知名股票补充
  "600519": { name: "贵州茅台", industry: "白酒", concepts: ["白酒", "消费龙头", "MSCI", "沪深300"], analysis: "A股股王，白酒行业绝对龙头。毛利率超90%，品牌护城河极深。PE约30倍。" },
  "000858": { name: "五粮液", industry: "白酒", concepts: ["白酒", "消费龙头", "深证100"], analysis: "浓香型白酒龙头，品牌力仅次于茅台。PE约20倍，分红率高。" },
  "600036": { name: "招商银行", industry: "银行", concepts: ["银行", "零售银行", "沪深300", "MSCI"], analysis: "零售银行标杆，不良率低，拨备覆盖率超400%。PE约6倍，股息率约5%。" },
  "000333": { name: "美的集团", industry: "家电", concepts: ["家电", "智能制造", "MSCI", "沪深300"], analysis: "白电龙头，产品覆盖空调/冰箱/洗衣机。全球化布局，PE约12倍。" },
  "300750": { name: "宁德时代", industry: "新能源电池", concepts: ["锂电池", "新能源车", "储能", "MSCI"], analysis: "全球动力电池龙头，市占率超35%。储能业务快速增长。关注产能利用率变化。" },
  "000651": { name: "格力电器", industry: "家电", concepts: ["家电", "空调", "高股息", "沪深300"], analysis: "空调行业龙头，分红慷慨，股息率约5%。渠道改革效果待验证。" },
  "002415": { name: "海康威视", industry: "安防/AI", concepts: ["安防", "AI", "物联网", "MSCI"], analysis: "全球安防龙头，AI+视频物联转型中。PE约25倍，关注创新业务增速。" },
  "601012": { name: "隆基绿能", industry: "光伏", concepts: ["光伏", "新能源", "单晶硅", "沪深300"], analysis: "全球单晶硅片龙头，BC电池技术领先。光伏行业周期底部，关注产能出清。" },
  "688981": { name: "中芯国际", industry: "半导体制造", concepts: ["半导体", "芯片制造", "国产替代", "科创板"], analysis: "大陆晶圆代工龙头，先进制程突破中。国产替代核心标的，政策支持力度大。" },
  "601318": { name: "中国平安", industry: "保险/金融", concepts: ["保险", "金融", "综合金融", "沪深300"], analysis: "综合金融集团，寿险+财险+银行+科技。PE约8倍，股息率约5%。" },
  "600900": { name: "长江电力", industry: "电力/公用事业", concepts: ["水电", "公用事业", "高股息", "沪深300"], analysis: "水电龙头，三峡+葛洲坝等水电站。稳定分红，股息率约3.5%。防御性标的。" },
  "002594": { name: "比亚迪", industry: "新能源车", concepts: ["新能源车", "动力电池", "整车", "深证100"], analysis: "新能源车龙头，垂直整合产业链。高端品牌腾势/仰望持续突破。关注海外市场表现。" },
  "688256": { name: "寒武纪", industry: "AI芯片", concepts: ["AI芯片", "人工智能", "算力", "科创板"], analysis: "国产AI芯片龙头，思元系列AI加速卡。受益国产算力需求爆发。估值极高，适合风险偏好高者。" },
};

// AI分析生成器（根据代码特征）
function generateAnalysis(code: string, name: string, industry: string, concepts: string[]): string {
  const exchange = detectExchange(code);
  const isHighTech = code.startsWith("688") || code.startsWith("30") || code.startsWith("8");
  const isMainland = code.startsWith("60") || code.startsWith("00");

  let analysis = `${name}（${code}）是一家${industry}领域的${exchange}上市公司。`;

  if (concepts.length > 0) {
    analysis += `涉及${concepts.slice(0, 3).join("、")}等概念。`;
  }

  if (isHighTech) {
    analysis += "关注研发投入和核心技术突破，估值弹性大但波动也大。注意控制仓位。";
  } else if (isMainland) {
    analysis += "属于主板蓝筹范畴，关注行业龙头地位和分红能力。建议结合估值水平和行业周期判断介入时机。";
  }

  analysis += "建议持续跟踪财报数据和行业动态，理性投资。";

  return analysis;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let code = (body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ found: false, error: "请提供股票代码" });
    }

    // 去掉.SH/.SZ后缀
    code = code.replace(/\.(SH|SZ|BJ)$/, "");

    // 先检查已知股票
    const known = knownStocks[code];
    if (known) {
      return NextResponse.json({
        found: true,
        code,
        name: known.name,
        exchange: detectExchange(code),
        industry: known.industry,
        concepts: known.concepts,
        analysis: known.analysis,
      });
    }

    // 未知代码，基于前缀生成
    const exchange = detectExchange(code);
    const industry = guessIndustry(code);

    // 尝试用数字来构造一个合理的名称
    const codeNum = parseInt(code.replace(/[^0-9]/g, "").slice(-4));
    // 热门前缀推断
    const prefixes: Record<string, string> = {
      "600": "沪市主板", "601": "沪市主板", "603": "沪市主板", "605": "沪市主板",
      "688": "科创板", "000": "深市主板", "001": "深市主板", "002": "中小板",
      "003": "中小板", "300": "创业板", "301": "创业板", "4": "北交所", "8": "北交所",
    };

    const prefix = Object.keys(prefixes).find(p => code.startsWith(p));
    const board = prefix ? prefixes[prefix] : "A股";

    const concepts = [board, "上市公司"];
    if (code.startsWith("688")) concepts.push("科技创新");
    if (code.startsWith("30")) concepts.push("成长创新");

    const analysis = generateAnalysis(code, `个股${code}`, industry, concepts);

    return NextResponse.json({
      found: true,
      code,
      exchange,
      industry,
      concepts,
      analysis,
      // name 未知，但可以提示
      note: `代码${code}（${board}）添加成功，名称未知。请在名称框中输入正确名称。`,
    });
  } catch (e: any) {
    return NextResponse.json({ found: false, error: e.message }, { status: 500 });
  }
}
