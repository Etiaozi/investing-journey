import { NextRequest, NextResponse } from "next/server";
import { generateCode, sendEmailCode, isValidEmail } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: false, error: "请输入邮箱" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "邮箱格式不正确" }, { status: 400 });
    }

    // 生成验证码
    const { code, token } = generateCode(email);

    // 发送邮件
    const result = await sendEmailCode(email, code);
    if (!result.ok) {
      // 邮件发送失败时，返回 debugCode 供本地调试
      return NextResponse.json({ 
        success: false, 
        error: result.error || "邮件发送失败",
        debugCode: process.env.NODE_ENV === "development" ? code : undefined,
        note: "域名DNS传播中（可能需要几小时），请稍后再试"
      }, { status: 200 });
    }

    return NextResponse.json({ 
      success: true, 
      token,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
