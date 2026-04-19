import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--background))] px-5 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.16),transparent_24%),radial-gradient(circle_at_78%_12%,rgba(84,131,255,0.14),transparent_26%),linear-gradient(180deg,#081322_0%,#0a1628_50%,#0b1930_100%)]" />

      <div className="relative w-full max-w-5xl rounded-[36px] border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_rgba(5,12,23,0.5)] backdrop-blur-xl lg:grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden border-r border-white/10 p-10 lg:block">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>

          <div className="mt-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Welcome Back
            </div>
            <h1 className="mt-6 font-display text-4xl leading-tight text-white">
              回到你的模拟岗位，
              <span className="block text-gradient-gold">继续把这条线做完。</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              登录后你会直接回到 Dashboard、任务进度、反馈记录和已解锁勋章，不会从头再来。
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white lg:hidden">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>

            <div className="mt-6 lg:mt-0">
              <div className="text-xs uppercase tracking-[0.24em] text-primary">账户登录</div>
              <h2 className="mt-3 font-display text-3xl text-white">登录</h2>
              <p className="mt-2 text-sm text-slate-300">欢迎回到入行 RuHang，继续你的金融岗位模拟。</p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-200">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-200">密码</label>
                  <Link to="/reset-password" className="text-xs text-primary hover:text-[hsl(var(--primary-glow))]">
                    忘记密码？
                  </Link>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="请输入密码"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "登录中…" : "登录并进入 Dashboard"}
              </button>
            </form>

            <div className="mt-6 text-sm text-slate-400">
              还没有账号？
              <Link to="/register" className="ml-1 text-primary hover:text-[hsl(var(--primary-glow))]">
                立即注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
