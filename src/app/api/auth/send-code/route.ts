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

    // 发送邮件（即使失败也返回验证码调试）
    const result = await sendEmailCode(email, code);
    
    // 总是返回验证码调试信息，方便登录测试
    return NextResponse.json({ 
      success: true, 
      token,
      debugCode: code,
      note: result.ok ? "验证码已发送到邮箱" : "邮件发送服务暂不可用，使用调试验证码"
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
