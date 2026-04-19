import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Award } from "lucide-react";

/**
 * Brand panel — left side of auth pages on desktop, hidden on mobile.
 * Pure visual / marketing copy — kept in sync with Landing tone.
 */
export function AuthBrandPanel({ subtitle }: { subtitle?: string }) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-hero p-12 lg:flex">
      <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <Link to="/" className="relative flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold font-display text-base font-bold text-primary-foreground shadow-glow-gold">
          入
        </div>
        <span className="font-display text-xl font-semibold tracking-wide">入行 RuHang</span>
      </Link>

      <div className="relative">
        <div className="eyebrow">沉浸式金融训练</div>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">
          在<span className="text-gradient-gold">真实工作流</span>里，
          <br />
          成为下一个分析师
        </h2>
        {subtitle && (
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{subtitle}</p>
        )}

        <div className="mt-10 space-y-4">
          {[
            { icon: Sparkles, t: "AI 上级派活、催进度", d: "和真实公司一样的工作节奏" },
            { icon: ShieldCheck, t: "标准答案 + 5 维评分", d: "每次任务都有专业反馈" },
            { icon: Award, t: "可沉淀的能力档案", d: "每条模拟都生成你的雷达图" },
          ].map((f) => (
            <div key={f.t} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{f.t}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{f.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between text-[11px] text-muted-foreground">
        <span>© {new Date().getFullYear()} 入行 RuHang</span>
        <span>3165784931@qq.com</span>
      </div>
    </div>
  );
}

export function AuthMobileBrand() {
  return (
    <Link to="/" className="mb-8 inline-flex items-center gap-2 lg:hidden">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-gold font-display text-sm font-bold text-primary-foreground">
        入
      </div>
      <span className="font-display text-lg font-semibold">入行</span>
    </Link>
  );
}
