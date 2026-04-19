import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { greeting, cn } from "@/lib/utils";
import { getPreferredDisplayName } from "@/lib/settings";
import { buildAchievementStates, type AchievementProgressRow } from "@/data/achievements";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type SimRow = {
  id: string;
  status: string;
  progress: number;
  offer_accepted: boolean;
  current_task_index: number;
  completed_at?: string | null;
  simulation: {
    id: string;
    code: string;
    title: string;
    company: string;
    role: string;
    track: string;
    description: string;
    cover_emoji: string;
    duration_label: string;
    is_pro: boolean;
  };
  total_tasks: number;
  completed_tasks: number;
};

const NAV: { label: string; icon: any; to: string; medal?: boolean }[] = [
  { label: "我的模拟", icon: LayoutDashboard, to: "/dashboard" },
  { label: "能力报告", icon: BookOpen, to: "/report" },
  { label: "我的勋章", icon: Award, to: "#", medal: true },
  { label: "设置", icon: SettingsIcon, to: "/settings" },
];

function MedalShelf({
  open,
  onOpenChange,
  rows,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: AchievementProgressRow[];
}) {
  const achievements = useMemo(() => buildAchievementStates(rows), [rows]);
  const unlocked = achievements.filter((item) => item.unlocked);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-3xl border-white/10">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">我的勋章</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="text-sm text-muted-foreground">当前已解锁</div>
            <div className="mt-2 font-display text-3xl text-primary">{unlocked.length} / {achievements.length}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              勋章只按系统里可真实计算的行为解锁，不做虚假点亮。
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {achievements.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border p-4",
                  item.unlocked ? "border-primary/25 bg-primary/8" : "border-white/10 bg-white/[0.02]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-lg">{item.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.description}</div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px]",
                      item.rarity === "史诗"
                        ? "bg-amber-500/15 text-amber-200"
                        : item.rarity === "稀有"
                          ? "bg-sky-500/15 text-sky-200"
                          : "bg-white/10 text-muted-foreground",
                    )}
                  >
                    {item.rarity}
                  </span>
                </div>
                <div className="mt-4 text-xs text-foreground/85">{item.condition}</div>
                <div className="mt-3 text-[11px] text-muted-foreground">
                  {item.unlocked
                    ? `已解锁${item.unlockedAt ? ` · ${new Date(item.unlockedAt).toLocaleDateString("zh-CN")}` : ""}`
                    : "未解锁"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SidebarBody({
  name,
  plan,
  onSignOut,
  onOpenMedals,
}: {
  name: string;
  plan: string;
  onSignOut: () => void;
  onOpenMedals: () => void;
}) {
  const loc = useLocation();

  return (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2.5 px-6 py-7">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold font-display text-base font-bold text-primary-foreground shadow-glow-gold">
          入
        </div>
        <span className="font-display text-lg font-semibold">入行 RuHang</span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = !item.medal && item.to !== "#" && loc.pathname === item.to;
          const className = cn(
            "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
            active
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
          );

          const inner = (
            <>
              {active && <span className="absolute left-0 h-5 w-0.5 rounded-r bg-gradient-gold" />}
              <item.icon className="h-4 w-4" />
              {item.label}
            </>
          );

          if (item.medal) {
            return (
              <button key={item.label} type="button" onClick={onOpenMedals} className={className}>
                {inner}
              </button>
            );
          }

          return (
            <Link key={item.label} to={item.to} className={className}>
              {inner}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm text-primary">
            {(name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{name}</div>
            <div className={cn("flex items-center gap-1 text-[10px] uppercase tracking-wider", plan === "pro" ? "text-primary" : "text-muted-foreground")}>
              {plan === "pro" && <Sparkles className="h-3 w-3" />}
              {plan === "pro" ? "PRO 会员" : "免费版"}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:bg-white/5 hover:text-foreground" onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> 退出登录
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<SimRow[]>([]);
  const [achievementRows, setAchievementRows] = useState<AchievementProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [medalOpen, setMedalOpen] = useState(false);

  useEffect(() => {
    document.title = "控制台 · 入行 RuHang";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const { data: userSimulations } = await supabase
        .from("user_simulations")
        .select("id, status, progress, offer_accepted, current_task_index, completed_at, simulation:simulations(*)")
        .eq("user_id", user.id);

      if (!userSimulations) {
        setLoading(false);
        return;
      }

      const enriched: SimRow[] = await Promise.all(
        userSimulations.map(async (simulationRow: any) => {
          const { count: total } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("simulation_id", simulationRow.simulation.id);

          const { count: done } = await supabase
            .from("user_task_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_simulation_id", simulationRow.id)
            .eq("status", "done");

          return {
            ...simulationRow,
            total_tasks: total ?? 0,
            completed_tasks: done ?? 0,
          };
        }),
      );

      setRows(enriched);

      const userSimulationIds = userSimulations.map((item: any) => item.id);
      if (userSimulationIds.length) {
        const { data: progressRows } = await supabase
          .from("user_task_progress")
          .select("status, score, submission_quality, submitted_at, self_eval, task:tasks(order_index, title), user_simulation:user_simulations(status, offer_accepted, simulation:simulations(code))")
          .in("user_simulation_id", userSimulationIds);

        const normalized = (progressRows ?? []).map((row: any) => ({
          simulationCode: row.user_simulation?.simulation?.code ?? "ibd-ipo",
          simulationStatus: row.user_simulation?.status ?? "not_started",
          offerAccepted: Boolean(row.user_simulation?.offer_accepted),
          title: row.task?.title ?? "",
          orderIndex: row.task?.order_index ?? 0,
          status: row.status ?? "locked",
          score: row.score ?? null,
          submissionQuality: row.submission_quality ?? null,
          submittedAt: row.submitted_at ?? null,
          selfEvalSubmitted: Boolean(row.self_eval?.submitted_at),
        })) as AchievementProgressRow[];

        setAchievementRows(normalized);
      } else {
        setAchievementRows([]);
      }

      setLoading(false);
    };

    void load();
  }, [user]);

  const inProgress = rows.filter((row) => row.status !== "completed");
  const completed = rows.filter((row) => row.status === "completed");
  const achievements = useMemo(() => buildAchievementStates(achievementRows), [achievementRows]);
  const unlockedCount = achievements.filter((item) => item.unlocked).length;
  const totalCompletedTasks = rows.reduce((sum, row) => sum + row.completed_tasks, 0);
  const spotlight = inProgress[0] ?? rows[0] ?? null;

  const onSignOut = async () => {
    await signOut();
    nav("/");
  };

  const continueLink = (row: SimRow) =>
    row.simulation.is_pro && profile?.plan !== "pro"
      ? "/pricing"
      : row.offer_accepted
        ? `/simulation/${row.simulation.id}`
        : `/simulation/${row.simulation.id}/offer`;

  const name = getPreferredDisplayName(profile ?? null, user?.email) ?? "新同学";
  const plan = profile?.plan ?? "free";

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <SidebarBody
          name={name}
          plan={plan}
          onSignOut={onSignOut}
          onOpenMedals={() => setMedalOpen(true)}
        />
      </aside>

      <main className="flex-1">
        <div className="flex items-center justify-between border-b border-white/5 p-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/5">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
              <SidebarBody
                name={name}
                plan={plan}
                onSignOut={onSignOut}
                onOpenMedals={() => setMedalOpen(true)}
              />
            </SheetContent>
          </Sheet>
          <span className="font-display font-semibold">入行 RuHang</span>
          <div className="w-10" />
        </div>

        <div className="container mx-auto px-6 py-10 lg:py-14">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow">控制台</div>
              <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                {greeting()}，{name} <span className="ml-1">👋</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                继续手头的项目，或者用一套更像真实岗位系统的节奏，开启下一条模拟线。
              </p>
            </div>
            {plan !== "pro" && (
              <Link
                to="/pricing"
                className="group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs text-primary transition hover:bg-primary/10"
              >
                <Sparkles className="h-3.5 w-3.5" />
                升级 PRO 解锁全部赛道
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>

          <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={<Clock3 className="h-4 w-4" />} label="进行中模拟" value={String(inProgress.length)} accent />
            <KpiCard icon={<CheckCircle2 className="h-4 w-4" />} label="已完成模拟" value={String(completed.length)} />
            <KpiCard icon={<ShieldCheck className="h-4 w-4" />} label="累计任务" value={String(totalCompletedTasks)} suffix="个" />
            <KpiCard icon={<Trophy className="h-4 w-4" />} label="已解锁勋章" value={String(unlockedCount)} suffix={`/ ${achievements.length}`} />
          </div>

          <div className="mb-12 grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
            <section className="glass-deep relative overflow-hidden rounded-3xl p-6">
              <div className="absolute inset-0 halo-blue opacity-50" />
              <div className="relative">
                <div className="eyebrow">本周总览</div>
                <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-white">
                      {spotlight ? spotlight.simulation.title : "从第一条模拟线开始"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                      {spotlight
                        ? `${spotlight.simulation.company} · ${spotlight.simulation.role} · ${spotlight.simulation.description}`
                        : "接 Offer、收老板消息、交作业、拿反馈，再一步步把第一段金融经历做出来。"}
                    </p>
                  </div>
                  <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
                    {spotlight ? spotlight.simulation.track : "Ready"}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">当前状态</div>
                    <div className="mt-2 font-display text-xl text-white">
                      {spotlight ? (spotlight.offer_accepted ? "已入组" : "待接收 Offer") : "未开始"}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {spotlight ? `${spotlight.completed_tasks} / ${spotlight.total_tasks} 任务` : "创建账号后即可开始"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">能力档案</div>
                    <div className="mt-2 font-display text-xl text-white">能力报告</div>
                    <div className="mt-2 text-xs text-muted-foreground">反馈、成绩、雷达图与 completion 会在这里持续累计。</div>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">设置与偏好</div>
                    <div className="mt-2 font-display text-xl text-white">设置中心</div>
                    <div className="mt-2 text-xs text-muted-foreground">称呼、反馈风格、通知和导出入口都已并到正式基线。</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {spotlight && (
                    <Link
                      to={continueLink(spotlight)}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow-gold"
                    >
                      {spotlight.simulation.is_pro && plan !== "pro"
                        ? "升级后进入"
                        : spotlight.offer_accepted
                          ? "继续当前模拟"
                          : "查看 Offer"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link to="/report" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-foreground hover:bg-white/8">
                    查看能力报告
                  </Link>
                  <Link to="/settings" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-foreground hover:bg-white/8">
                    打开设置
                  </Link>
                </div>
              </div>
            </section>

            <section className="glass-deep relative overflow-hidden rounded-3xl p-6">
              <div className="absolute inset-0 halo-gold opacity-50" />
              <div className="relative flex h-full flex-col">
                <div className="eyebrow">荣誉档案</div>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-white">我的勋章</h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      完成模拟、任务与关键成长节点后，系统会按真实行为自动点亮勋章。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMedalOpen(true)}
                    className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary"
                  >
                    {unlockedCount}/{achievements.length}
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8 xl:grid-cols-4">
                  {achievements.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex h-14 items-center justify-center rounded-2xl text-lg",
                        item.unlocked
                          ? "bg-gradient-gold text-primary-foreground shadow-glow-gold"
                          : "border border-white/10 bg-white/[0.03] text-muted-foreground",
                      )}
                      title={item.name}
                    >
                      {item.unlocked ? "✦" : "•"}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <div className="text-xs text-muted-foreground">最新说明</div>
                  <div className="mt-2 text-sm text-foreground">
                    勋章入口和成就计算已保留当前正式逻辑，这一块是基于 handoff 风格做的 V4 续写外壳。
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section className="mb-14">
            <div className="mb-5 flex items-baseline justify-between">
              <div>
                <div className="eyebrow">进行中</div>
                <h2 className="mt-2 font-display text-2xl font-semibold">正在推进的模拟线</h2>
              </div>
              <Link to="/report" className="text-xs text-primary hover:underline">
                查看能力报告 →
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass h-64 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : inProgress.length === 0 ? (
              <EmptyState
                title="还没有进行中的模拟"
                desc="选一条赛道，开启你的第一段实习。"
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {inProgress.map((r) => (
                  <SimCard key={r.id} row={r} to={continueLink(r)} plan={plan} />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-5 flex items-baseline justify-between">
              <div>
                <div className="eyebrow">已完成</div>
                <h2 className="mt-2 font-display text-2xl font-semibold">已经完成的模拟线</h2>
              </div>
              <button type="button" onClick={() => setMedalOpen(true)} className="text-xs text-primary hover:underline">
                查看我的勋章 →
              </button>
            </div>

            {completed.length === 0 ? (
              <EmptyState
                icon={<Trophy className="h-6 w-6 text-primary" />}
                title="还没有完成的模拟"
                desc="完成第一个模拟后，这里会展示你的已完成项目与回看入口。"
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {completed.map((r) => (
                  <CompletedCard key={r.id} row={r} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <MedalShelf open={medalOpen} onOpenChange={setMedalOpen} rows={achievementRows} />
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className={accent ? "text-primary" : "text-muted-foreground"}>{icon}</span>
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className={cn("font-display text-3xl font-semibold tabular-nums", accent ? "text-gradient-gold" : "text-foreground")}>
          {value}
        </span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

function SimCard({ row, to, plan }: { row: SimRow; to: string; plan: string }) {
  const pct = row.total_tasks ? Math.round((row.completed_tasks / row.total_tasks) * 100) : 0;
  const sim = row.simulation;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass group relative flex flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative px-6 pt-6 pb-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
            {sim.cover_emoji}
          </div>
          <div className="flex gap-1.5">
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">{sim.track}</span>
            {sim.is_pro && <span className="badge-pro">PRO</span>}
          </div>
        </div>
        <h3 className="mt-4 font-display text-base font-semibold leading-snug">{sim.title}</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">{sim.company} · {sim.role}</p>
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{sim.description}</p>
      </div>

      <div className="mt-auto border-t border-white/5 bg-white/[0.015] px-6 py-4">
        {!row.offer_accepted ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-primary">待接收</div>
              <div className="text-xs text-foreground">Offer Letter 已送达</div>
            </div>
            <Link
              to={to}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-gold px-3 py-1.5 text-xs font-medium text-primary-foreground transition group-hover:shadow-glow-gold"
            >
              查看 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground">进度 {row.completed_tasks} / {row.total_tasks}</span>
              <span className="font-mono text-primary">{pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-gradient-gold transition-all" style={{ width: `${pct}%` }} />
            </div>
            <Link to={to} className="mt-3 inline-flex items-center gap-1 text-xs text-primary transition group-hover:gap-2">
              {sim.is_pro && plan !== "pro" ? "升级后进入" : "继续模拟"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
}

function CompletedCard({ row }: { row: SimRow }) {
  const sim = row.simulation;
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-6">
      <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
        {sim.cover_emoji}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold">{sim.title}</h3>
      <p className="mt-1 text-[11px] text-muted-foreground">{sim.company} · {sim.role}</p>
      <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3 text-xs">
        <span className="badge-done">已完成</span>
        <span className="text-muted-foreground">{row.completed_tasks} / {row.total_tasks} 任务</span>
        <Link to={`/simulation/${sim.id}`} className="ml-auto text-primary hover:underline">
          回看 →
        </Link>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  desc,
}: {
  icon?: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="glass flex flex-col items-center justify-center rounded-2xl px-6 py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon ?? <Sparkles className="h-5 w-5" />}
      </div>
      <div className="font-display text-base font-medium">{title}</div>
      <div className="mt-1.5 max-w-sm text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}
