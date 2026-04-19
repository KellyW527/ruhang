import { ArrowRight, BriefcaseBusiness, ChartColumnIncreasing, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const tracks = [
  {
    title: "卖方投行",
    subtitle: "IPO 项目 · 财务尽调 · 招股书撰写",
    description: "像真正进组一样推进项目材料、拆招股书结构、承接领导反馈与客户 deadline。",
    accent: "from-amber-300/40 via-amber-300/10 to-transparent",
  },
  {
    title: "PE / VC 投资",
    subtitle: "商业模式拆解 · 投资备忘录 · 投委会准备",
    description: "围绕公司质地、增长逻辑和交易结构，完成一套更像机构内部的投资判断流程。",
    accent: "from-sky-300/35 via-sky-300/10 to-transparent",
  },
  {
    title: "二级行研",
    subtitle: "赛道研究 · 盈利预测 · 深度报告输出",
    description: "从框架、估值、可比公司到观点表达，把研究工作真正做成一条完整链路。",
    accent: "from-emerald-300/30 via-emerald-300/10 to-transparent",
  },
];

const signals = [
  {
    title: "像真的在岗",
    text: "Offer、领导消息、项目组协同、HR 资料和反馈链路都按真实工作节奏组织。",
    icon: BriefcaseBusiness,
  },
  {
    title: "反馈有标准",
    text: "不是随便上传就通过，而是围绕任务要求、提交质量和标准答案做出明确反馈。",
    icon: ShieldCheck,
  },
  {
    title: "成长可累计",
    text: "分数、勋章、完成记录和能力报告都会沉淀，逐步形成你的模拟经历资产。",
    icon: TrendingUp,
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[hsl(var(--background))] text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,76,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(70,120,255,0.12),transparent_28%),linear-gradient(180deg,#081322_0%,#0a1628_50%,#0b1930_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-14 pt-5 sm:px-8 lg:px-10">
        <nav className="glass-strong flex items-center justify-between rounded-full px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-gold text-base font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(201,168,76,0.25)]">
              入
            </div>
            <div>
              <div className="font-display text-lg font-semibold tracking-tight">入行 RuHang</div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Immersive Finance Career Lab</div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
            >
              登录
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-gradient-gold px-5 py-2 text-sm font-medium text-primary-foreground transition hover:scale-[1.02]"
            >
              免费注册
            </Link>
          </div>
        </nav>

        <main className="flex flex-1 flex-col justify-center py-12 lg:py-16">
          <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                深度模拟金融工作流
              </div>

              <h1 className="mt-6 max-w-4xl font-display text-5xl leading-[1.08] text-white sm:text-6xl lg:text-[76px]">
                把第一段金融经历，
                <span className="block text-gradient-gold">先在系统里做真。</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                从接 Offer、进项目组、收老板消息，到交作业、拿反馈、解锁下一任务，
                这不是泛泛练习，而是一套更像真实岗位节奏的沉浸式训练。
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:translate-y-[-1px]"
                >
                  免费开始第一条模拟线
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/8"
                >
                  已有账号，继续训练
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="glass rounded-3xl p-4">
                  <div className="text-2xl font-semibold text-white">3 条</div>
                  <div className="mt-1 text-sm text-muted-foreground">岗位模拟线</div>
                </div>
                <div className="glass rounded-3xl p-4">
                  <div className="text-2xl font-semibold text-white">18 个</div>
                  <div className="mt-1 text-sm text-muted-foreground">任务节点</div>
                </div>
                <div className="glass rounded-3xl p-4">
                  <div className="text-2xl font-semibold text-white">反馈 + 勋章</div>
                  <div className="mt-1 text-sm text-muted-foreground">形成可积累成果</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="glass-strong relative overflow-hidden rounded-[32px] border border-white/10 p-6 shadow-[0_30px_80px_rgba(5,12,23,0.45)]">
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-primary">本周最常开启</div>
                    <div className="mt-2 font-display text-2xl text-white">卖方投行 · 鼎晟项目</div>
                  </div>
                  <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                    V4 风格首页
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl border border-white/8 bg-black/15 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-300">老板消息</div>
                        <div className="mt-1 text-base font-medium text-white">今晚先把三年财务摘要和问题清单给我</div>
                      </div>
                      <div className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] text-primary">进行中</div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                      <div className="text-sm text-slate-300">项目组资料</div>
                      <div className="mt-3 space-y-2 text-sm text-slate-100">
                        <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-2">
                          <span>项目背景简报</span>
                          <span className="text-primary">HTML</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-2">
                          <span>三年财务摘要表</span>
                          <span className="text-primary">CSV</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-4">
                      <div className="text-sm text-slate-300">训练闭环</div>
                      <div className="mt-3 space-y-3 text-sm text-slate-100">
                        <div className="flex items-center justify-between">
                          <span>提交后评分</span>
                          <span className="text-primary">已接入</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>自评与解锁</span>
                          <span className="text-primary">状态机</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Completion 勋章</span>
                          <span className="text-primary">可累计</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-primary/20 bg-primary/10 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-primary">体验基准</div>
                    <p className="mt-2 text-sm leading-7 text-slate-200">
                      首页本轮只做一件事：把品牌气质、结构层次和入口感恢复到正式产品状态，不再继续堆新功能。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-16 grid gap-5 lg:grid-cols-3">
            {tracks.map((track) => (
              <div key={track.title} className="glass group relative overflow-hidden rounded-[28px] p-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${track.accent} opacity-70 transition group-hover:opacity-100`} />
                <div className="relative">
                  <div className="text-xs uppercase tracking-[0.22em] text-primary">{track.subtitle}</div>
                  <h2 className="mt-3 font-display text-3xl text-white">{track.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{track.description}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="mt-16 grid gap-5 lg:grid-cols-3">
            {signals.map((item) => (
              <div key={item.title} className="glass rounded-[28px] p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.text}</p>
              </div>
            ))}
          </section>

          <section className="mt-16">
            <div className="glass-strong flex flex-col items-start justify-between gap-6 rounded-[32px] px-6 py-8 sm:px-8 lg:flex-row lg:items-center">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-primary">Ready To Start</div>
                <div className="mt-3 font-display text-3xl text-white sm:text-4xl">
                  先把真实工作感找回来，再谈更多功能。
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  你现在进入的是重新收口后的正式基线：内容、样式、部署都只围绕一条清晰主线推进。
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground"
                >
                  创建账号
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-slate-100"
                >
                  登录查看 Dashboard
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
