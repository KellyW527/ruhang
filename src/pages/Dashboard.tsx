import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogOut, Sparkles, LayoutDashboard, BookOpen, Settings as SettingsIcon, Menu, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { greeting, cn } from "@/lib/utils";
import { toast } from "sonner";

type SimRow = {
  id: string;
  status: string;
  progress: number;
  offer_accepted: boolean;
  current_task_index: number;
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

const NAV: { label: string; icon: any; to: string; soon?: boolean }[] = [
  { label: "我的模拟", icon: LayoutDashboard, to: "/dashboard" },
  { label: "能力报告", icon: BookOpen, to: "/report" },
  { label: "我的勋章", icon: Award, to: "#", soon: true },
  { label: "设置", icon: SettingsIcon, to: "#", soon: true },
];

function SidebarBody({ name, plan, onSignOut }: { name: string; plan: string; onSignOut: () => void }) {
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
        {NAV.map((n) => {
          const active = !n.soon && loc.pathname === n.to;
          const inner = (
            <>
              {active && <span className="absolute left-0 h-5 w-0.5 rounded-r bg-gradient-gold" />}
              <n.icon className="h-4 w-4" />
              {n.label}
              {n.soon && <span className="ml-auto text-[10px] text-muted-foreground">soon</span>}
              {plan !== "pro" && n.label === "能力报告" && (
                <span className="ml-auto rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] text-primary">
                  新
                </span>
              )}
            </>
          );
          const className = cn(
            "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
            active
              ? "bg-primary/10 text-foreground"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
          );
          if (n.soon) {
            return (
              <button key={n.label} onClick={() => toast.info("即将上线")} className={className}>
                {inner}
              </button>
            );
          }
          return (
            <Link key={n.label} to={n.to} className={className}>
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

const Dashboard = () => {
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();
  const [rows, setRows] = useState<SimRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "控制台 · 入行 RuHang";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data: us } = await supabase
        .from("user_simulations")
        .select("id, status, progress, offer_accepted, current_task_index, simulation:simulations(*)")
        .eq("user_id", user.id);

      if (!us) { setLoading(false); return; }

      // For each, count tasks done
      const enriched: SimRow[] = await Promise.all(
        us.map(async (u: any) => {
          const { count: total } = await supabase
            .from("tasks")
            .select("*", { count: "exact", head: true })
            .eq("simulation_id", u.simulation.id);
          const { count: done } = await supabase
            .from("user_task_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_simulation_id", u.id)
            .eq("status", "done");
          return { ...u, total_tasks: total ?? 6, completed_tasks: done ?? 0 };
        }),
      );
      setRows(enriched);
      setLoading(false);
    };
    load();
  }, [user]);

  const inProgress = rows.filter((r) => r.status !== "completed");
  const completed = rows.filter((r) => r.status === "completed");

  const onSignOut = async () => {
    await signOut();
    nav("/");
  };

  const continueLink = (r: SimRow) =>
    r.simulation.is_pro && profile?.plan !== "pro"
      ? "/pricing"
      : r.offer_accepted
        ? `/simulation/${r.simulation.id}`
        : `/simulation/${r.simulation.id}/offer`;

  const name = profile?.name ?? "新同学";

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar md:block">
        <SidebarBody name={name} plan={profile?.plan ?? "free"} onSignOut={onSignOut} />
      </aside>

      <main className="flex-1">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-white/5 p-4 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/5">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 border-sidebar-border bg-sidebar p-0">
              <SidebarBody name={name} plan={profile?.plan ?? "free"} onSignOut={onSignOut} />
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
              onClick={() => toast.info("勋章墙骨架已预留，下一版会接入真实解锁条件")}
              className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-foreground transition hover:bg-white/5"
            >
              <Award className="h-4 w-4 text-primary" />
              我的勋章
            </button>
          </div>

          <Tabs defaultValue="in_progress">
            <TabsList className="bg-surface-1 mb-6">
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground">
                进行中 ({inProgress.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground">
                已完成 ({completed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="in_progress">
              {loading ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass h-56 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : inProgress.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center text-muted-foreground">暂无进行中的模拟。</div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {inProgress.map((r) => {
                    const pct = Math.round((r.completed_tasks / r.total_tasks) * 100);
                    return (
                      <motion.div
                        key={r.id}
                        whileHover={{ y: -4 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="glass group flex flex-col rounded-2xl p-6"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="text-3xl">{r.simulation.cover_emoji}</div>
                          <div className="flex gap-1.5">
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                              {r.simulation.track}
                            </span>
                            {r.simulation.is_pro && (
                              <span className="rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[10px] text-primary">
                                PRO
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="font-display text-base font-semibold leading-snug">{r.simulation.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {r.simulation.company} · {r.simulation.role}
                        </p>
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                          {r.simulation.description}
                        </p>

                        <div className="mt-5">
                          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>
                              进度 {r.completed_tasks} / {r.total_tasks}
                            </span>
                            <span className="text-primary font-mono">{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                            <div className="h-full rounded-full bg-gradient-gold transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        <Link
                          to={continueLink(r)}
                          className="mt-6 inline-flex items-center gap-1 text-sm text-primary transition group-hover:gap-2"
                        >
                          {r.simulation.is_pro && profile?.plan !== "pro"
                            ? "升级解锁"
                            : r.offer_accepted
                              ? "继续模拟"
                              : "查看 Offer"}{" "}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completed.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
                  <Sparkles className="mx-auto mb-3 h-6 w-6 text-primary" />
                  完成第一个模拟后，会出现在这里。
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {completed.map((r) => (
                    <div key={r.id} className="glass rounded-2xl p-6">
                      <div className="text-3xl">{r.simulation.cover_emoji}</div>
                      <h3 className="mt-3 font-display text-base font-semibold">{r.simulation.title}</h3>
                      <div className="mt-2 text-xs text-emerald-400">已完成 ✓</div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
