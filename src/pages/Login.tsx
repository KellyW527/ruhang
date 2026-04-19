import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { AuthBrandPanel, AuthMobileBrand } from "@/components/marketing/AuthBrandPanel";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    document.title = "登录 · 入行 RuHang";
    if (session) nav("/dashboard", { replace: true });
  }, [session, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("登录失败", { description: error.message });
    } else {
      toast.success("欢迎回来 👋");
      nav("/dashboard");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <AuthBrandPanel subtitle="登录继续你的项目，AI 上级和你的任务都还在原位等你。" />

      <div className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 halo-gold opacity-20 pointer-events-none lg:hidden" />
        <div className="relative w-full max-w-sm">
          <AuthMobileBrand />
          <div className="eyebrow">登录</div>
          <h1 className="mt-2 font-display text-3xl font-semibold">欢迎回来</h1>
          <p className="mt-2 text-sm text-muted-foreground">用注册时的邮箱和密码登录。</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs">邮箱</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-background/50"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs">密码</Label>
                <Link to="/reset-password" className="text-[11px] text-primary hover:underline">
                  忘记密码？
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-background/50"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full bg-gradient-gold text-primary-foreground hover:opacity-95"
            >
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>

          <div className="mt-8 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="hairline-gold flex-1" />
            <span>新来这里？</span>
            <span className="hairline-gold flex-1" />
          </div>
          <Link
            to="/register"
            className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-border py-2.5 text-sm text-foreground transition hover:border-primary/40 hover:bg-white/5"
          >
            创建账号 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
