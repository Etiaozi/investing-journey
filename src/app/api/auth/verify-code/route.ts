import { NextRequest, NextResponse } from "next/server";
import { verifyCode, createSession, setSessionCookie } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email: string = (body.email || "").trim().toLowerCase();
    const code: string = (body.code || "").trim();
    const token: string = (body.token || "").trim();

    if (!email || !code || !token) {
      return NextResponse.json({ success: false, error: "请提供邮箱、验证码和令牌" }, { status: 400 });
    }

    const result = verifyCode(email, code, token);
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
    }

    // 创建 session
    const sessionToken = createSession(email);

    // 设置 cookie
    const cookie = setSessionCookie(sessionToken);

    const response = NextResponse.json({
      success: true,
      email,
    });

    response.cookies.set(cookie.name, cookie.value, cookie.options);

    return response;
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
