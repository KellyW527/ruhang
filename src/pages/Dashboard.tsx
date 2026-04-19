import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  Sparkles,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { greeting, cn } from "@/lib/utils";
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
  { label: "设置", icon: SettingsIcon, to: "#" },
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
                  item.unlocked
                    ? "border-primary/25 bg-primary/8"
                    : "border-white/10 bg-white/[0.02]",
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
      <Link to="/" className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-gold font-display text-base font-bold text-primary-foreground">
          入
        </div>
        <span className="font-display text-lg font-semibold">入行</span>
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

          if (item.to === "#") {
            return (
              <button key={item.label} type="button" className={className}>
                {inner}
                <span className="ml-auto text-[10px] text-muted-foreground">soon</span>
              </button>
            );
          }

          return (
            <Link key={item.label} to={item.to} className={className}>
              {inner}
              {plan !== "pro" && item.label === "能力报告" && (
                <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] text-primary">
                  新
                </span>
              )}
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

const Dashboard = () => {
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

  const name = profile?.name ?? "新同学";

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <SidebarBody
          name={name}
          plan={profile?.plan ?? "free"}
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
                plan={profile?.plan ?? "free"}
                onSignOut={onSignOut}
                onOpenMedals={() => setMedalOpen(true)}
              />
            </SheetContent>
          </Sheet>
          <span className="font-display font-semibold">入行</span>
          <div className="w-10" />
        </div>

        <div className="container mx-auto px-6 py-10">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold">
                {greeting()}，{name} <span className="ml-1">👋</span>
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">继续你的项目，或开启一段新的职业模拟。</p>
            </div>

            <button
              type="button"
              onClick={() => setMedalOpen(true)}
              className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-white/5"
            >
              <Award className="h-4 w-4 text-primary" />
              我的勋章
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                {unlockedCount}/{achievements.length}
              </span>
            </button>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground">进行中模拟</div>
              <div className="mt-2 font-display text-3xl">{inProgress.length}</div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground">已完成模拟</div>
              <div className="mt-2 font-display text-3xl">{completed.length}</div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground">已解锁勋章</div>
              <div className="mt-2 font-display text-3xl text-primary">{unlockedCount}</div>
            </div>
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">进行中</h2>
              <Link to="/report" className="text-sm text-primary hover:underline">
                查看能力报告
              </Link>
            </div>
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="glass h-56 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : inProgress.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center text-muted-foreground">暂无进行中的模拟。</div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {inProgress.map((row) => {
                  const pct = row.total_tasks ? Math.round((row.completed_tasks / row.total_tasks) * 100) : 0;
                  return (
                    <motion.div
                      key={row.id}
                      whileHover={{ y: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="glass group flex flex-col rounded-2xl p-6"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="text-3xl">{row.simulation.cover_emoji}</div>
                        <div className="flex gap-1.5">
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                            {row.simulation.track}
                          </span>
                          {row.simulation.is_pro && (
                            <span className="rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                              PRO
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-display text-base font-semibold leading-snug">{row.simulation.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {row.simulation.company} · {row.simulation.role}
                      </p>
                      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {row.simulation.description}
                      </p>

                      <div className="mt-5">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            进度 {row.completed_tasks} / {row.total_tasks}
                          </span>
                          <span className="font-mono text-primary">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                          <div className="h-full rounded-full bg-gradient-gold transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <Link
                        to={continueLink(row)}
                        className="mt-6 inline-flex items-center gap-1 text-sm text-primary transition group-hover:gap-2"
                      >
                        {row.simulation.is_pro && profile?.plan !== "pro"
                          ? "升级解锁"
                          : row.offer_accepted
                            ? "继续模拟"
                            : "查看 Offer"}{" "}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">已完成</h2>
              <button type="button" onClick={() => setMedalOpen(true)} className="text-sm text-primary hover:underline">
                查看我的勋章
              </button>
            </div>
            {completed.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
                <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary" />
                完成第一个模拟后，会出现在这里。
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {completed.map((row) => (
                  <div key={row.id} className="glass rounded-2xl p-6">
                    <div className="flex items-start justify-between">
                      <div className="text-3xl">{row.simulation.cover_emoji}</div>
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">已完成</span>
                    </div>
                    <h3 className="mt-3 font-display text-base font-semibold">{row.simulation.title}</h3>
                    <div className="mt-2 text-xs text-muted-foreground">
                      完成时间 {row.completed_at ? new Date(row.completed_at).toLocaleDateString("zh-CN") : "--"}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Link to="/report" className="text-sm text-primary hover:underline">
                        查看能力报告
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <MedalShelf open={medalOpen} onOpenChange={setMedalOpen} rows={achievementRows} />
    </div>
  );
};

export default Dashboard;
