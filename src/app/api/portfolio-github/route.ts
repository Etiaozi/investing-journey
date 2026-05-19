import { NextRequest, NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GH_TOKEN;
const OWNER = "Etiaozi";
const REPO = "investing-journey";
const FILE_PATH = "data/portfolio.json";
const BRANCH = "master";

interface Holding { code: string; name: string; shares: number; costPrice: number; reason?: string; addedAt: string; }
interface Group { id: string; name: string; stocks: Holding[]; }
interface PortfolioData { groups: Group[]; activeGroup?: string; refreshPrice?: boolean; }

function makeId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** 默认分组："核心持仓"含当前所有12只股票 + "备选观察"为空 */
function getDefaults(): PortfolioData {
  const core: Holding[] = [
    { code: '688710', name: '益诺思', shares: 0, costPrice: 0, reason: 'CRO央企，2026Q1业绩拐点+121%，机构持股66%', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '600875', name: '东方电气', shares: 0, costPrice: 0, reason: '全球最大发电设备供应商，核电+抽水蓄能政策红利期', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '600850', name: '电科数字', shares: 0, costPrice: 0, reason: '信创+央企改革，电科旗下数字城市龙头', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '300394', name: '天孚通信', shares: 0, costPrice: 0, reason: '光模块龙头，等回调企稳后再关注', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '603259', name: '药明康德', shares: 0, costPrice: 0, reason: 'CRO绝对龙头，PE仅15倍，性价比高', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '603011', name: '合锻智能', shares: 0, costPrice: 0, reason: '高端装备/智能分选，国家级单项冠军', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '603938', name: '三孚股份', shares: 0, costPrice: 0, reason: '专精特新硅业龙头，今日涨停', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '300115', name: '长盈精密', shares: 0, costPrice: 0, reason: '精密制造龙头，液冷快接头新增长点', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '002436', name: '兴森科技', shares: 0, costPrice: 0, reason: 'PCB/IC载板国产替代', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '002156', name: '通富微电', shares: 0, costPrice: 0, reason: '半导体封测龙头，与AMD深度合作', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '002600', name: '领益智造', shares: 0, costPrice: 0, reason: '全球精密功能件龙头，苹果核心供应商', addedAt: '2026-05-19T00:00:00.000Z' },
    { code: '301683', name: '慧谷新材', shares: 0, costPrice: 0, reason: '功能性新材料，市值92亿，PE44倍', addedAt: '2026-05-19T00:00:00.000Z' },
  ];
  return {
    groups: [{ id: "core", name: "核心持仓", stocks: core }, { id: "watch", name: "备选观察", stocks: [] }],
    activeGroup: "core",
    refreshPrice: false,
  };
}

/** 将旧格式 {watchlist: Holding[], ...} 迁移到新格式 {groups: Group[], ...} */
function migrateIfNeeded(raw: any): PortfolioData {
  if (raw.groups && Array.isArray(raw.groups)) return raw as PortfolioData;
  // 旧格式迁移
  const old = raw as { watchlist?: Holding[] };
  return {
    groups: [{ id: "core", name: "核心持仓", stocks: old.watchlist || [] }],
    activeGroup: "core",
  };
}

async function readFile(): Promise<PortfolioData> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
    if (GITHUB_TOKEN) headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`, {
      headers, signal: AbortSignal.timeout(10000),
    });
    const meta = await res.json();
    const content = Buffer.from(meta.content, "base64").toString("utf-8");
    return migrateIfNeeded(JSON.parse(content));
  } catch { return getDefaults(); }
}

async function writeFile(data: PortfolioData, sha: string): Promise<boolean> {
  if (!GITHUB_TOKEN) return false;
  try {
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "Content-Type": "application/json", Accept: "application/vnd.github.v3+json" },
      body: JSON.stringify({ message: "update portfolio data", content, sha, branch: BRANCH }),
      signal: AbortSignal.timeout(15000),
    });
    return res.ok;
  } catch { return false; }
}

async function readWithSha(): Promise<{ data: PortfolioData; sha?: string; ok: boolean }> {
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github.v3+json" };
    if (GITHUB_TOKEN) headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`, {
      headers, signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { data: getDefaults(), ok: false };
    const meta = await res.json();
    const content = Buffer.from(meta.content, "base64").toString("utf-8");
    return { data: migrateIfNeeded(JSON.parse(content)), sha: meta.sha, ok: true };
  } catch { return { data: getDefaults(), ok: false }; }
}

/** 获取某个Group内的所有股票（展开所有group的当前tab用） */
function getGroupStocks(data: PortfolioData, groupId?: string): Holding[] {
  const g = data.groups.find(g => g.id === (groupId || data.activeGroup));
  return g ? g.stocks : [];
}

// ----- API Handlers -----

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupOnly = searchParams.get("group");
  const data = await readFile();
  if (groupOnly) {
    // 只返回某个分组的数据
    const stocks = getGroupStocks(data, groupOnly);
    return NextResponse.json({ groups: data.groups, activeGroup: groupOnly, watchlist: stocks });
  }
  // 兼容旧前端：直接请求返回全部groups + 当前activeGroup的stocks
  return NextResponse.json({ ...data, watchlist: getGroupStocks(data) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 分组操作
    if (body._action === "addGroup") {
      const { data, sha, ok } = await readWithSha();
      if (!ok || !sha) return NextResponse.json({ error: "无法读取数据" }, { status: 500 });
      const name = body.name?.trim() || "新分组";
      const id = makeId();
      data.groups.push({ id, name, stocks: [] });
      await writeFile(data, sha);
      return NextResponse.json({ success: true, group: { id, name, stocks: [] } });
    }

    if (body._action === "renameGroup") {
      const { data, sha, ok } = await readWithSha();
      if (!ok || !sha) return NextResponse.json({ error: "无法读取数据" }, { status: 500 });
      const g = data.groups.find(g => g.id === body.id);
      if (!g) return NextResponse.json({ error: "分组不存在" }, { status: 404 });
      g.name = body.name?.trim() || g.name;
      await writeFile(data, sha);
      return NextResponse.json({ success: true, group: g });
    }

    if (body._action === "deleteGroup") {
      const { data, sha, ok } = await readWithSha();
      if (!ok || !sha) return NextResponse.json({ error: "无法读取数据" }, { status: 500 });
      if (data.groups.length <= 1) return NextResponse.json({ error: "至少保留一个分组" }, { status: 400 });
      const idx = data.groups.findIndex(g => g.id === body.id);
      if (idx === -1) return NextResponse.json({ error: "分组不存在" }, { status: 404 });
      data.groups.splice(idx, 1);
      if (data.activeGroup === body.id) data.activeGroup = data.groups[0].id;
      await writeFile(data, sha);
      return NextResponse.json({ success: true, activeGroup: data.activeGroup });
    }

    if (body._action === "switchGroup") {
      const { data, sha, ok } = await readWithSha();
      if (!ok || !sha) return NextResponse.json({ error: "无法读取数据" }, { status: 500 });
      if (!data.groups.find(g => g.id === body.id)) return NextResponse.json({ error: "分组不存在" }, { status: 404 });
      data.activeGroup = body.id;
      await writeFile(data, sha);
      return NextResponse.json({ success: true, activeGroup: body.id, watchlist: getGroupStocks(data, body.id) });
    }

    // 添加股票到当前/指定分组
    const { code, name, shares, costPrice, reason, groupId } = body;
    if (!code || !name) return NextResponse.json({ error: "代码和名称不能为空" }, { status: 400 });
    if (!GITHUB_TOKEN) return NextResponse.json({ error: "GH_TOKEN未配置" }, { status: 500 });

    const { data, sha, ok } = await readWithSha();
    if (!ok || !sha) return NextResponse.json({ error: "无法读取数据" }, { status: 500 });

    const targetGroupId = groupId || data.activeGroup;
    const g = data.groups.find(g => g.id === targetGroupId);
    if (!g) return NextResponse.json({ error: "分组不存在" }, { status: 404 });

    if (g.stocks.find(s => s.code === code.toUpperCase())) {
      return NextResponse.json({ error: `${name} 已在该分组中` }, { status: 409 });
    }
    const newItem: Holding = { code: code.toUpperCase(), name, shares: shares || 0, costPrice: costPrice || 0, reason: reason || undefined, addedAt: new Date().toISOString() };
    g.stocks.push(newItem);
    await writeFile(data, sha);
    return NextResponse.json({ success: true, item: newItem });
  } catch (e: any) { return NextResponse.json({ error: "错误: " + e.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, shares, costPrice, reason, name, groupId } = body;
    if (!code) return NextResponse.json({ error: "请提供股票代码" }, { status: 400 });
    if (!GITHUB_TOKEN) return NextResponse.json({ error: "GH_TOKEN未配置" }, { status: 500 });

    const { data, sha, ok } = await readWithSha();
    if (!ok || !sha) return NextResponse.json({ error: "无法读取数据" }, { status: 500 });

    const g = data.groups.find(g => g.id === (groupId || data.activeGroup));
    if (!g) return NextResponse.json({ error: "分组不存在" }, { status: 404 });

    const idx = g.stocks.findIndex(s => s.code === code.toUpperCase());
    if (idx === -1) return NextResponse.json({ error: "未找到该股票" }, { status: 404 });
    if (shares !== undefined) g.stocks[idx].shares = shares;
    if (costPrice !== undefined) g.stocks[idx].costPrice = costPrice;
    if (reason !== undefined) g.stocks[idx].reason = reason;
    if (name !== undefined) g.stocks[idx].name = name;
    await writeFile(data, sha);
    return NextResponse.json({ success: true, item: g.stocks[idx] });
  } catch (e: any) { return NextResponse.json({ error: "错误: " + e.message }, { status: 500 }); }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, groupId } = body;
    if (!code) return NextResponse.json({ error: "请提供股票代码" }, { status: 400 });
    if (!GITHUB_TOKEN) return NextResponse.json({ error: "GH_TOKEN未配置" }, { status: 500 });

    const { data, sha, ok } = await readWithSha();
    if (!ok || !sha) return NextResponse.json({ error: "无法读取数据" }, { status: 500 });

    const g = data.groups.find(g => g.id === (groupId || data.activeGroup));
    if (!g) return NextResponse.json({ error: "分组不存在" }, { status: 404 });

    const initial = g.stocks.length;
    g.stocks = g.stocks.filter(s => s.code !== code.toUpperCase());
    if (g.stocks.length === initial) return NextResponse.json({ error: "未找到该股票" }, { status: 404 });
    await writeFile(data, sha);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: "错误: " + e.message }, { status: 500 }); }
}
