import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthBrandPanel, AuthMobileBrand } from "@/components/marketing/AuthBrandPanel";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "重置密码 · 入行 RuHang";
    if (window.location.hash.includes("type=recovery")) {
      setRecoveryMode(true);
    }
  }, []);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      setSent(true);
      toast.success("重置链接已发送，请查收邮箱");
    }
  };

  const updatePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("密码已更新，请重新登录");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <AuthBrandPanel subtitle="忘记密码不要紧——通过注册邮箱就能找回，整个过程不到一分钟。" />

      <div className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 halo-gold opacity-20 pointer-events-none lg:hidden" />
        <div className="relative w-full max-w-sm">
          <AuthMobileBrand />

          {recoveryMode ? (
            <>
              <div className="eyebrow">设置新密码</div>
              <h1 className="mt-2 font-display text-3xl font-semibold">设置新密码</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                请设置一个新密码，下次直接用新密码登录。
              </p>
              <form onSubmit={updatePwd} className="mt-8 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">新密码</Label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-11 bg-background/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-gradient-gold text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "更新中..." : "更新密码"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="eyebrow">重置密码</div>
              <h1 className="mt-2 font-display text-3xl font-semibold">忘记密码？</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                输入注册邮箱，我们会发送一封重置链接。
              </p>

              {sent ? (
                <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <div className="text-2xl">📬</div>
                  <div className="mt-3 font-display text-base font-medium">链接已发送</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    请查看 <span className="text-foreground">{email}</span>，按邮件指引完成重置。
                  </div>
                </div>
              ) : (
                <form onSubmit={requestReset} className="mt-8 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">邮箱</Label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-background/50"
                      placeholder="you@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-gradient-gold text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "发送中..." : "发送重置链接"}
                  </button>
                </form>
              )}
            </>
          )}

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              ← 返回登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
