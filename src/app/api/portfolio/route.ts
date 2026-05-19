import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Use /tmp for Vercel serverless (read-only filesystem elsewhere)
const DATA_DIR = path.join(process.env.VERCEL ? "/tmp" : process.cwd(), "data");
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
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({ stocks: [] }, null, 2));
    }
  } catch (e: any) {
    console.error("ensureDataDir error:", e.message);
    throw e;
  }
}

function readStocks(): Stock[] {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const data = JSON.parse(raw);
      return data.stocks || [];
    }
    return [];
  } catch (e: any) {
    console.error("readStocks error:", e.message);
    return [];
  }
}

function writeStocks(stocks: Stock[]) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ stocks }, null, 2));
}

// GET: 获取所有自选股
export async function GET() {
  try {
    const stocks = readStocks();
    return NextResponse.json({ stocks });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stocks: [] }, { status: 200 });
  }
}

// POST: 添加自选股
export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    console.log("POST received:", text);
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "JSON解析失败: " + text.substring(0, 100) }, { status: 400 });
    }
    const { code, name, reason } = body;

    if (!code || !name) {
      return NextResponse.json({ error: "股票代码和名称不能为空" }, { status: 400 });
    }

    let stocks: Stock[] = [];
    try {
      stocks = readStocks();
    } catch (e: any) {
      console.error("readStocks error:", e.message);
      // If data dir is not writable, use in-memory
    }

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
    
    try {
      writeStocks(stocks);
    } catch (e: any) {
      console.error("writeStocks error:", e.message);
      return NextResponse.json({ error: "数据写入失败: " + e.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, stock: newStock });
  } catch (e: any) {
    return NextResponse.json({ error: "服务器错误: " + e.message }, { status: 500 });
  }
}

// DELETE: 删除自选股
export async function DELETE(request: NextRequest) {
  try {
    const text = await request.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "JSON解析失败" }, { status: 400 });
    }
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
  } catch (e: any) {
    return NextResponse.json({ error: "服务器错误: " + e.message }, { status: 500 });
  }
}
