import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "portfolio.json");

interface Stock {
  code: string;
  name: string;
  addedAt: string;
  reason?: string;
  price?: number;
  changePercent?: number;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ stocks: [] }, null, 2));
  }
}

function readStocks(): Stock[] {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const data = JSON.parse(raw);
    return data.stocks || [];
  } catch {
    return [];
  }
}

function writeStocks(stocks: Stock[]) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ stocks }, null, 2));
}

// GET: 获取所有自选股
export async function GET() {
  const stocks = readStocks();
  return NextResponse.json({ stocks });
}

// POST: 添加自选股
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, reason } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "股票代码和名称不能为空" }, { status: 400 });
    }

    const stocks = readStocks();

    // 检查是否已存在
    if (stocks.find((s) => s.code === code.toUpperCase())) {
      return NextResponse.json({ error: `${name} 已在自选列表中` }, { status: 409 });
    }

    const newStock: Stock = {
      code: code.toUpperCase(),
      name,
      reason: reason || undefined,
      addedAt: new Date().toISOString(),
    };

    stocks.push(newStock);
    writeStocks(stocks);

    return NextResponse.json({ success: true, stock: newStock });
  } catch {
    return NextResponse.json({ error: "请求解析失败" }, { status: 400 });
  }
}

// DELETE: 删除自选股
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "请提供股票代码" }, { status: 400 });
    }

    let stocks = readStocks();
    const initialLength = stocks.length;
    stocks = stocks.filter((s) => s.code !== code.toUpperCase());

    if (stocks.length === initialLength) {
      return NextResponse.json({ error: "未找到该股票" }, { status: 404 });
    }

    writeStocks(stocks);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "请求解析失败" }, { status: 400 });
  }
}
