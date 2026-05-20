"use client";
import { useState, useEffect } from "react";

const c = { primary: "#1a73e8", text: "#1a1a1a", sub: "#888", border: "#e0e0e0", bg: "#f0f4ff", success: "#27ae60", error: "#e74c3c" };

export default function LoginPage() {
  const [step, setStep] = useState<"input" | "verify" | "done">("input");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [msg, setMsg] = useState({ text: "", type: "" as "" | "success" | "error" });
  const [checkedAuth, setCheckedAuth] = useState(false);

  const toast = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 4000);
  };

  // 检查是否已登录
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) setStep("done");
      })
      .catch(() => {})
      .finally(() => setCheckedAuth(true));
  }, []);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendCode = async () => {
    const e = email.trim().toLowerCase();
    if (!e || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      toast("请输入有效的邮箱地址", "error");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e }),
      });
      const d = await r.json();
      if (!d.success) {
        toast(d.error, "error");
      } else {
        setVerifyToken(d.token);
        setStep("verify");
        setCountdown(60);
        // 如果有调试验证码（开发环境），直接填入
        if (d.debugCode) {
          setCode(d.debugCode);
          toast(`🔑 开发模式验证码: ${d.debugCode}（已自动填入）`, "success");
        } else {
          toast("验证码已发送到邮箱，请查收", "success");
        }
      }
    } catch {
      toast("网络错误，请重试", "error");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!code || code.length !== 6) {
      toast("请输入6位验证码", "error");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim(), token: verifyToken }),
      });
      const d = await r.json();
      if (!d.success) {
        toast(d.error, "error");
      } else {
        setStep("done");
        toast("登录成功！", "success");
      }
    } catch {
      toast("网络错误，请重试", "error");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setStep("input");
    setEmail("");
    setCode("");
    setVerifyToken("");
    toast("已退出登录", "success");
  };

  if (!checkedAuth) {
    return (
      <div style={{ maxWidth: 380, margin: "60px auto", padding: "0 16px", textAlign: "center" }}>
        <p style={{ color: c.sub }}>加载中...</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div style={{ maxWidth: 380, margin: "60px auto", padding: "0 16px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: c.text, marginBottom: 8 }}>已登录</h2>
        <p style={{ color: c.sub, fontSize: 14, marginBottom: 24 }}>{email}</p>
        <button
          onClick={() => (window.location.href = "/portfolio")}
          style={{
            padding: "10px 24px", background: c.primary, color: "#fff", border: "none",
            borderRadius: 6, fontSize: 14, cursor: "pointer", marginRight: 12,
          }}
        >
          前往自选奔富
        </button>
        <button
          onClick={logout}
          style={{
            padding: "10px 24px", background: "transparent", color: c.sub, border: `1px solid ${c.border}`,
            borderRadius: 6, fontSize: 14, cursor: "pointer",
          }}
        >
          退出登录
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 380, margin: "60px auto", padding: "0 16px" }}>
      {/* Logo/标题 */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🦐</div>
        <h1 style={{ fontSize: 20, color: c.text, margin: 0 }}>投资智慧</h1>
        <p style={{ fontSize: 13, color: c.sub, marginTop: 4 }}>登录后管理自选奔富</p>
      </div>

      {/* 消息提示 */}
      {msg.text && (
        <div style={{
          padding: "8px 12px", borderRadius: 6, fontSize: 13,
          background: msg.type === "success" ? "#e6f7ed" : "#fdecea",
          color: msg.type === "success" ? c.success : c.error,
          marginBottom: 16, textAlign: "center",
        }}>
          {msg.text}
        </div>
      )}

      {step === "input" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: c.text, fontWeight: 600, display: "block", marginBottom: 6 }}>
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${c.border}`,
                borderRadius: 6, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={sendCode}
            disabled={loading}
            style={{
              width: "100%", padding: "10px", background: c.primary, color: "#fff",
              border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "发送中..." : "获取验证码"}
          </button>
        </div>
      )}

      {step === "verify" && (
        <div>
          <p style={{ fontSize: 13, color: c.sub, marginBottom: 16 }}>
            验证码已发送至 <strong style={{ color: c.text }}>{email}</strong>
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, color: c.text, fontWeight: 600, display: "block", marginBottom: 6 }}>
              验证码
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="输入6位验证码"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && verify()}
              style={{
                width: "100%", padding: "10px 12px", fontSize: 20, textAlign: "center",
                letterSpacing: 8, border: `1px solid ${c.border}`,
                borderRadius: 6, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <button
            onClick={verify}
            disabled={loading || code.length !== 6}
            style={{
              width: "100%", padding: "10px", background: c.primary, color: "#fff",
              border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer",
              opacity: loading || code.length !== 6 ? 0.6 : 1,
            }}
          >
            {loading ? "验证中..." : "登录"}
          </button>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            {countdown > 0 ? (
              <span style={{ fontSize: 12, color: c.sub }}>{countdown}s 后可重新发送</span>
            ) : (
              <button
                onClick={sendCode}
                disabled={loading}
                style={{
                  background: "none", border: "none", color: c.primary, fontSize: 13,
                  cursor: "pointer", textDecoration: "underline",
                }}
              >
                重新发送验证码
              </button>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: 8 }}>
            <button
              onClick={() => { setStep("input"); setCode(""); }}
              style={{
                background: "none", border: "none", color: c.sub, fontSize: 12,
                cursor: "pointer", textDecoration: "underline",
              }}
            >
              更换邮箱
            </button>
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 32 }}>
        登录即表示同意服务条款和隐私政策
      </p>
    </div>
  );
}
