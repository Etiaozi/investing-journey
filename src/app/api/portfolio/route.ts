import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.env.VERCEL ? "/tmp" : process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "portfolio.json");

interface Holding {
  code: string;
  name: string;
  shares: number;       // 持仓股数
  costPrice: number;    // 成本价
  reason?: string;
  addedAt: string;
}

export interface PortfolioData {
  watchlist: Holding[];
  refreshPrice: boolean; // 是否自动刷新行情
}

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ watchlist: [], refreshPrice: false }, null, 2));
    }
  } catch { /* noop */ }
}

function readData(): PortfolioData {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch { /* noop */ }
  return { watchlist: [], refreshPrice: false };
}

function writeData(data: PortfolioData) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, watchlist: [] }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    const body = JSON.parse(text);
    const { code, name, shares, costPrice, reason } = body;

    if (!code || !name) return NextResponse.json({ error: "股票代码和名称不能为空" }, { status: 400 });

    const data = readData();

    if (data.watchlist.find((s) => s.code === code.toUpperCase())) {
      return NextResponse.json({ error: `${name} 已在列表中` }, { status: 409 });
    }

    const newItem: Holding = {
      code: code.toUpperCase(),
      name,
      shares: shares || 0,
      costPrice: costPrice || 0,
      reason: reason || undefined,
      addedAt: new Date().toISOString(),
    };

    data.watchlist.push(newItem);
    writeData(data);

    return NextResponse.json({ success: true, item: newItem });
  } catch (e: any) {
    return NextResponse.json({ error: "服务器错误: " + e.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const text = await request.text();
    const body = JSON.parse(text);
    const { code, shares, costPrice, reason, name } = body;

    if (!code) return NextResponse.json({ error: "请提供股票代码" }, { status: 400 });

    const data = readData();
    const idx = data.watchlist.findIndex((s) => s.code === code.toUpperCase());
    if (idx === -1) return NextResponse.json({ error: "未找到该股票" }, { status: 404 });

    if (shares !== undefined) data.watchlist[idx].shares = shares;
    if (costPrice !== undefined) data.watchlist[idx].costPrice = costPrice;
    if (reason !== undefined) data.watchlist[idx].reason = reason;
    if (name !== undefined) data.watchlist[idx].name = name;

    writeData(data);
    return NextResponse.json({ success: true, item: data.watchlist[idx] });
  } catch (e: any) {
    return NextResponse.json({ error: "服务器错误: " + e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const text = await request.text();
    const body = JSON.parse(text);
    const { code } = body;

    if (!code) return NextResponse.json({ error: "请提供股票代码" }, { status: 400 });

    const data = readData();
    const initial = data.watchlist.length;
    data.watchlist = data.watchlist.filter((s) => s.code !== code.toUpperCase());
    if (data.watchlist.length === initial) return NextResponse.json({ error: "未找到该股票" }, { status: 404 });

    writeData(data);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: "服务器错误: " + e.message }, { status: 500 });
  }
}
