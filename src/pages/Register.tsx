import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { AuthBrandPanel, AuthMobileBrand } from "@/components/marketing/AuthBrandPanel";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    document.title = "注册 · 入行 RuHang";
    if (session) nav("/dashboard", { replace: true });
  }, [session, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error("注册失败", { description: error.message });
    } else {
      toast.success("欢迎加入入行 🎉", { description: "正在为你打开控制台..." });
      nav("/dashboard");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <AuthBrandPanel subtitle="开个账号，挑一条赛道，几分钟之内就能拿到你的第一封 Offer Letter。" />

      <div className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 halo-gold opacity-20 pointer-events-none lg:hidden" />
        <div className="relative w-full max-w-sm">
          <AuthMobileBrand />
          <div className="eyebrow">注册 · 永久免费</div>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight">
            开启你的金融职业旅程
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            注册即可免费体验完整 IB IPO 模拟，不需要信用卡。
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">称呼</Label>
              <Input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-background/50"
                placeholder="例如：李同学"
              />
            </div>
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
              <Label htmlFor="password" className="text-xs">密码</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-background/50"
                placeholder="至少 6 位"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full bg-gradient-gold text-primary-foreground hover:opacity-95"
            >
              {loading ? "创建账号中..." : "创建账号"}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            已有账号？{" "}
            <Link to="/login" className="text-primary hover:underline">
              直接登录
            </Link>
          </div>

          <p className="mt-6 text-center text-[10px] leading-relaxed text-muted-foreground">
            创建账号即代表你同意《用户协议》与《隐私政策》。
            <br />
            模拟内容仅供学习交流，不构成投资建议。
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
