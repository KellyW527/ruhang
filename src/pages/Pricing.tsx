import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Check, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const faqs = [
  { q: "入行的模拟内容来自真实项目吗？", a: "所有任务素材均由具有 5 年以上 IB / PE / 卖方研究经验的从业者参与设计，案例脱敏自真实交易，但不构成任何投资建议。" },
  { q: "我可以反复练习同一个模拟吗？", a: "Pro 会员可以无限次重置进度，反复打磨同一案例的不同写法。免费用户每个模拟可以完成一次。" },
  { q: "AI 上级真的会和我对话吗？", a: "会。任务派发与官方反馈是脚本化的，确保学习目标可控；自由提问场景下 AI 上级会基于角色设定动态回复。" },
  { q: "完成模拟后会有反馈和评分吗？", a: "每个任务都会给出 5 维评分、详细解析、对照标准答案，并支持自我评估，全部沉淀进你的能力档案。" },
  { q: "是否支持发票与企业团购？", a: "支持。请通过商务邮箱 contact@ruhang.cn 联系我们获取团购方案。" },
];

const Pricing = () => {
  const { user, profile, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState<"wechat" | "alipay">("wechat");
  const [paying, setPaying] = useState(false);

  const isPro = profile?.plan === "pro";

  const handlePro = () => {
    if (!user) {
      toast.info("请先登录后再升级 Pro");
      nav("/login");
      return;
    }
    if (isPro) {
      toast.success("你已经是 Pro 会员啦 🎉");
      return;
    }
    setPayOpen(true);
  };

  const confirmPay = async () => {
    if (!user) return;
    setPaying(true);
    // Simulated payment latency
    await new Promise((r) => setTimeout(r, 1400));
    const { error } = await supabase
      .from("profiles")
      .update({ plan: "pro" })
      .eq("id", user.id);
    setPaying(false);
    if (error) {
      toast.error("升级失败，请稍后重试");
      return;
    }
    await refreshProfile();
    setPayOpen(false);
    toast.success("🎉 已成功升级 Pro，所有模拟已解锁");
    setTimeout(() => nav("/dashboard"), 600);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative pt-32 pb-12">
        <div className="absolute inset-0 halo-gold opacity-50 pointer-events-none" />
        <div className="container relative mx-auto px-6 text-center">
          <h1 className="font-display text-5xl font-bold">简单的定价</h1>
          <p className="mt-4 text-muted-foreground">先免费体验，再决定是否升级。</p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto grid max-w-4xl gap-6 px-6 md:grid-cols-2">
          {[
            {
              name: "免费版",
              price: "¥0",
              suffix: "/ 首个模拟",
              desc: "适合先体验产品的同学",
              features: ["解锁第 1 个完整模拟（IB IPO）", "完整任务流程与反馈", "标准答案 + 评分维度", "基础能力档案"],
              cta: "免费开始",
              link: "/register" as const,
              highlight: false,
            },
            {
              name: "专业版",
              price: "¥36",
              suffix: "/ 月",
              desc: "适合认真求职的同学",
              features: [
                "全部 3 大赛道（IB / PE / ER）",
                "无限次重置与练习",
                "AI 上级深度互动",
                "1 对 1 能力诊断报告",
                "面试常考题精讲",
                "校园大使社群",
              ],
              cta: "订阅专业版",
              highlight: true,
            },
          ].map((p) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={cn(
                "relative rounded-2xl p-8",
                p.highlight ? "glass-strong border-primary/40 shadow-glow-gold" : "glass",
              )}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-gold px-3 py-1 text-[10px] font-medium text-primary-foreground shadow-glow-gold">
                  <Sparkles className="mr-1 inline h-3 w-3" /> 最受欢迎
                </span>
              )}
              <div className="text-sm text-primary">{p.name}</div>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-5xl font-bold">{p.price}</span>
                <span className="mb-2 text-sm text-muted-foreground">{p.suffix}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              {p.highlight ? (
                <button onClick={handlePro} className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg bg-gradient-gold text-sm font-medium text-primary-foreground transition hover:opacity-95">
                  {isPro ? "你已是 Pro 会员 ✓" : p.cta}
                </button>
              ) : (
                <Link to={p.link} className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-lg border border-white/10 text-sm text-foreground transition hover:border-primary/40 hover:bg-white/5">
                  {p.cta}
                </Link>
              )}
              {p.highlight && (
                <div className="mt-6 flex items-center justify-center gap-3 border-t border-white/5 pt-5 text-[10px] text-muted-foreground">
                  <span>支持</span>
                  <span className="rounded bg-emerald-500/15 px-2 py-1 text-emerald-300">微信支付</span>
                  <span className="rounded bg-sky-500/15 px-2 py-1 text-sky-300">支付宝</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="glass-strong max-w-md border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">升级到专业版</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              这是一个模拟支付流程，不会产生任何真实扣费。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="rounded-lg border border-white/10 bg-background/50 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">订阅金额</span>
                <span className="font-display text-2xl font-semibold text-primary">
                  ¥36 <span className="text-xs text-muted-foreground">/ 月</span>
                </span>
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> 解锁全部 3 大赛道模拟</li>
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> 无限次重置进度</li>
                <li className="flex items-start gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-primary" /> 1 对 1 能力诊断报告</li>
              </ul>
            </div>

            <div>
              <div className="mb-2 text-xs text-muted-foreground">选择支付方式</div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: "wechat", label: "微信支付", color: "emerald" },
                  { key: "alipay", label: "支付宝", color: "sky" },
                ] as const).map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    className={cn(
                      "rounded-lg border p-3 text-left text-xs transition",
                      method === m.key
                        ? "border-primary/50 bg-primary/10"
                        : "border-white/10 bg-background/40 hover:bg-white/5",
                    )}
                  >
                    <div className="font-medium text-foreground">{m.label}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">扫码完成支付</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
              <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg bg-white text-[10px] uppercase tracking-widest text-slate-400">
                {method === "wechat" ? "WeChat QR" : "Alipay QR"}
              </div>
              <div className="mt-3 text-[11px] text-muted-foreground">
                请使用 {method === "wechat" ? "微信" : "支付宝"} 扫码完成支付
              </div>
            </div>

            <button
              onClick={confirmPay}
              disabled={paying}
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-gradient-gold text-sm font-medium text-primary-foreground transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 支付确认中…</>
              ) : (
                <><ShieldCheck className="mr-2 h-4 w-4" /> 我已完成支付（模拟）</>
              )}
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              ⓘ 这是产品演示版本，不会真实扣费
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <section className="pb-24">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center font-display text-3xl font-bold">常见问题</h2>
          <Accordion type="single" collapsible className="glass rounded-2xl px-6">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-white/5">
                <AccordionTrigger className="text-left text-sm hover:text-primary hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
