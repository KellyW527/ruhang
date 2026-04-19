import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("重置邮件已发送");
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--background))] px-5 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.16),transparent_24%),radial-gradient(circle_at_78%_14%,rgba(84,131,255,0.14),transparent_26%),linear-gradient(180deg,#081322_0%,#0a1628_50%,#0b1930_100%)]" />

      <div className="relative w-full max-w-xl rounded-[36px] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_80px_rgba(5,12,23,0.5)] backdrop-blur-xl sm:p-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          返回登录
        </Link>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-[0.24em] text-primary">账户安全</div>
          <h1 className="mt-3 font-display text-3xl text-white">重置密码</h1>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            输入你的注册邮箱，我们会发送一封重置链接邮件。
          </p>
        </div>

        {sent ? (
          <div className="mt-8 rounded-[28px] border border-primary/20 bg-primary/10 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <MailCheck className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-2xl text-white">邮件已发送</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              请前往收件箱查看重置链接。如果几分钟后还没收到，可以回到这里重新发送。
            </p>
            <Link
              to="/login"
              className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-100"
            >
              返回登录
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="mt-8 space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-gold py-3 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "发送中…" : "发送重置邮件"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
