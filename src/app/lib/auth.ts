import { NextResponse } from "next/server";
import crypto from "crypto";

// ---------- 配置 ----------
const SECRET = process.env.AUTH_SECRET || (() => {
  if (typeof window === "undefined") {
    // 开发环境自动生成一个固定secret
    return crypto.createHash("sha256").update("investing-journey-local-dev-secret-2026").digest("hex").slice(0, 32);
  }
  return "dev-secret";
})();

const VERIFY_CODE_TTL = 5 * 60 * 1000;  // 5分钟
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;  // 7天

// ---------- 验证码生成与验证 ----------

interface VerifyCodePayload {
  type: "verify_code";
  email: string;
  code: string;
  exp: number;  // 过期时间戳
}

export function generateCode(email: string): { code: string; token: string } {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const exp = Date.now() + VERIFY_CODE_TTL;
  const payload = `${email}|${code}|${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 12);
  const token = Buffer.from(`${payload}|${sig}`).toString("base64url");
  return { code, token };
}

export function verifyCode(email: string, inputCode: string, token: string): { ok: boolean; reason?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const parts = decoded.split("|");
    if (parts.length !== 4) return { ok: false, reason: "无效的验证码令牌" };
    const [pEmail, pCode, pExp, pSig] = parts;

    // 验证邮箱匹配
    if (pEmail !== email) return { ok: false, reason: "邮箱不匹配" };

    // 验证签名
    const payload = `${pEmail}|${pCode}|${pExp}`;
    const expectedSig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex").slice(0, 12);
    if (pSig !== expectedSig) return { ok: false, reason: "验证码已失效" };

    // 验证过期
    if (Date.now() > parseInt(pExp)) return { ok: false, reason: "验证码已过期，请重新获取" };

    // 验证验证码
    if (pCode !== inputCode) return { ok: false, reason: "验证码错误" };

    return { ok: true };
  } catch {
    return { ok: false, reason: "验证码格式错误" };
  }
}

// ---------- Session Token ----------

interface SessionPayload {
  type: "session";
  email: string;
  name?: string;
  exp: number;
}

export function createSession(email: string, name?: string): string {
  const payload = { type: "session", email, name, exp: Date.now() + SESSION_TTL };
  const json = JSON.stringify(payload);
  const sig = crypto.createHmac("sha256", SECRET).update(json).digest("hex").slice(0, 16);
  return Buffer.from(json + "|" + sig).toString("base64url");
}

export function verifySession(token: string): { ok: boolean; email?: string; name?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const sepIdx = decoded.lastIndexOf("|");
    if (sepIdx === -1) return { ok: false };
    const json = decoded.slice(0, sepIdx);
    const sig = decoded.slice(sepIdx + 1);
    const expectedSig = crypto.createHmac("sha256", SECRET).update(json).digest("hex").slice(0, 16);
    if (sig !== expectedSig) return { ok: false };
    const payload: SessionPayload = JSON.parse(json);
    if (payload.type !== "session" || Date.now() > payload.exp) return { ok: false };
    return { ok: true, email: payload.email, name: payload.name };
  } catch {
    return { ok: false };
  }
}

// ---------- Cookie 辅助函数 ----------

export function setSessionCookie(token: string): { name: string; value: string; options: any } {
  return {
    name: "session",
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,  // 7天(秒)
    },
  };
}

export function clearSessionCookie() {
  return {
    name: "session",
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 0,
    },
  };
}

// ---------- 从请求中获取session ----------

export function getSessionFromRequest(request: Request): { ok: boolean; email?: string; name?: string } {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );
  const token = cookies["session"];
  if (!token) return { ok: false };
  return verifySession(token);
}

// ---------- 邮箱验证 ----------

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendEmailCode(email: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    // 开发环境：不真的发邮件，直接返回成功（打印到控制台）
    console.log(`[DEV] 验证码到 ${email}: ${code}`);
    return { ok: true };
  }

  try {
    const fromDomain = process.env.RESEND_DOMAIN || "valuepath.cn";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `投资智慧 <noreply@${fromDomain}>`,
        to: email,
        subject: "登录验证码 - 投资智慧",
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #333;">登录验证码</h2>
            <p style="color: #666; font-size: 14px;">请输入以下验证码完成登录：</p>
            <div style="background: #f0f4ff; border-radius: 8px; padding: 20px; text-align: center; margin: 16px 0;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1a73e8;">${code}</span>
            </div>
            <p style="color: #999; font-size: 12px;">验证码5分钟内有效，请勿泄露给他人。</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="color: #bbb; font-size: 11px;">投资智慧 · valuepath.cn</p>
          </div>
        `,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: "邮件发送失败: " + err };
    }

    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
