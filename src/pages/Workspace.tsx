import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Paperclip, Image as ImageIcon, Mail, MessageCircle, CheckCircle2, Lock, Circle, PenSquare, X, Loader2, Clock, Phone, ChevronDown, FileText, Download } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, supabasePublicConfig } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs as ATabs, TabsList as ATabsList, TabsTrigger as ATabsTrigger, TabsContent as ATabsContent } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import { cn, formatDeadline } from "@/lib/utils";
import { uploadFile } from "@/lib/upload";
import { SelfEval, type SelfEvalValue } from "@/components/workspace/SelfEval";
import { MarkdownContent } from "@/components/content/MarkdownContent";
import { TypingIndicator } from "@/components/workspace/TypingIndicator";
import { DropZone } from "@/components/workspace/DropZone";
import { IncomingCallDialog } from "@/components/workspace/IncomingCallDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  evaluateSubmission,
  getAutomatedReply,
  getConversationKind,
  getGroupWelcomeNotice,
  getPhoneScript,
  getSimulationRuntime,
  getStarterKitAssets,
  getTaskMaterials,
  getTaskReferenceContent,
  getTaskRuntime,
} from "@/data/workspace-runtime";
import { buildHrFaqCard } from "@/data/immersive-content";

type Conv = { id: string; name: string; role_label: string; avatar_emoji: string; is_group: boolean; unread_count: number };
type Msg = { id: string; conversation_id: string; sender: string; content: string; message_type: string; file_name?: string | null; file_size?: string | null; file_url?: string | null; task_id?: string | null; created_at: string };
type Task = { id: string; order_index: number; title: string; brief: string; requirements: string[]; deadline_hours: number; assignment_message: string; feedback_message: string; score: number; standard_answer: string; scoring_rubric: { dim: string; score: number; max: number }[]; boss_commentary: string };
type Email = { id: string; from_name: string; from_email: string; subject: string; body: string; is_read: boolean; received_at: string; folder: string };
type PendingUpload = { name: string; size: string; url: string; path: string; kind: "file" | "image" } | null;
type TaskStatusEntry = {
  status: string;
  score?: number;
  submission_type?: string | null;
  submission_quality?: string | null;
  review_summary?: string | null;
};

const Workspace = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [usId, setUsId] = useState<string | null>(null);
  const [simTitle, setSimTitle] = useState("");
  const [simCode, setSimCode] = useState<string | null>(null);
  const [simCompany, setSimCompany] = useState("");
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatusEntry>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"chat" | "email">("chat");
  const [emails, setEmails] = useState<Email[]>([]);
  const [activeEmail, setActiveEmail] = useState<Email | null>(null);
  const [feedbackTask, setFeedbackTask] = useState<Task | null>(null);
  const [pendingUpload, setPendingUpload] = useState<PendingUpload>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeSubject, setComposeSubject] = useState("");
  const [composeCc, setComposeCc] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeFile, setComposeFile] = useState<{ name: string; size: string; url: string; path: string } | null>(null);
  const [composeProgress, setComposeProgress] = useState<number | null>(null);
  const [composeSending, setComposeSending] = useState(false);
  const [composeSentFlash, setComposeSentFlash] = useState(false);
  const [selfEvalMap, setSelfEvalMap] = useState<Record<string, SelfEvalValue | null>>({});
  const [mobilePanel, setMobilePanel] = useState<"convs" | "chat" | "tasks">("chat");
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamStarted, setStreamStarted] = useState(false);
  const [feedbackTab, setFeedbackTab] = useState<"answer" | "detail" | "self">("answer");
  const [feedbackReadMap, setFeedbackReadMap] = useState<Record<string, { answer: boolean; detail: boolean }>>({});
  const [completionOpen, setCompletionOpen] = useState(false);
  const [completionAverageScore, setCompletionAverageScore] = useState<number | null>(null);
  const [completionAt, setCompletionAt] = useState<string | null>(null);
  const [typingConvId, setTypingConvId] = useState<string | null>(null);
  const [callOpen, setCallOpen] = useState(false);
  const [doneCollapsed, setDoneCollapsed] = useState(true);
  const [draftSaving, setDraftSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const composeFileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const syncingProgressRef = useRef(false);
  const composeBusy = composeSending || composeSentFlash || draftSaving;
  const isMobile = useIsMobile();
  const runtime = getSimulationRuntime(simCode);
  const starterKitAssets = getStarterKitAssets(simCode);
  const phoneScript = getPhoneScript(simCode);
  const completedCount = Object.values(taskStatuses).filter((s) => s.status === "done").length;
  const overall = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const activeTask = tasks.find((t) => {
    const status = taskStatuses[t.id]?.status;
    return status === "active" || status === "feedback_pending" || status === "needs_resubmission";
  });
  const activeConv = convs.find((c) => c.id === activeConvId);
  const feedbackStatus = feedbackTask ? taskStatuses[feedbackTask.id] : null;
  const feedbackReference = feedbackTask ? getTaskReferenceContent(simCode, feedbackTask.order_index) : null;
  const isReviewMode = feedbackStatus?.status === "done";
  const feedbackAnswerMarkdown = feedbackReference?.standardAnswer ?? feedbackTask?.standard_answer ?? "";
  const feedbackReviewMarkdown = feedbackTask
    ? feedbackStatus?.review_summary ??
      `### 评分拆解\n| 维度 | 得分 |\n| --- | --- |\n${feedbackTask.scoring_rubric.map((item) => `| ${item.dim} | ${item.score} / ${item.max} |`).join("\n")}\n\n### 上级反馈\n${feedbackTask.boss_commentary}`
    : "";
  const feedbackAnalysisMarkdown = feedbackReference?.analysis ?? feedbackReviewMarkdown;
  const selfEvalReady =
    feedbackTask && feedbackStatus?.submission_quality !== "retry"
      ? Boolean(selfEvalMap[feedbackTask.id]?.submitted_at)
      : false;
  const feedbackReadState = feedbackTask ? feedbackReadMap[feedbackTask.id] : null;
  const showTypingIndicator =
    (sending && getConversationKind(activeConv ?? { name: "", is_group: false, role_label: "" }, simCode) === "leader" && !streamStarted) ||
    typingConvId === activeConvId;
  const completionLetterUrl = completionAverageScore == null
    ? null
    : `data:text/plain;charset=utf-8,${encodeURIComponent(
        [
          "入行 RuHang 模拟实习结业信",
          "",
          `项目：${simTitle}`,
          `完成时间：${completionAt ? new Date(completionAt).toLocaleString("zh-CN") : new Date().toLocaleString("zh-CN")}`,
          `平均得分：${completionAverageScore}`,
          "",
          `致 ${profile?.name ?? "同学"}：`,
          runtime.leader.completionNote,
          "",
          `签发人：${runtime.leader.name} · ${runtime.leader.title}`,
        ].join("\n"),
      )}`;

  // ---- Initial load ----
  useEffect(() => {
    document.title = "工作台 · 入行 RuHang";
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;
      const { data: us } = await supabase
        .from("user_simulations")
        .select("id, completed_at, simulation:simulations(code, title, company, is_pro), offer_accepted")
        .eq("user_id", user.id)
        .eq("simulation_id", id)
        .maybeSingle();
      if (!us) return;
      if ((us.simulation as { title?: string; is_pro?: boolean } | null)?.is_pro && profile?.plan !== "pro") {
        toast.info("这个模拟需要升级 Pro 后才能进入");
        nav("/pricing", { replace: true });
        return;
      }
      if (!us.offer_accepted) {
        nav(`/simulation/${id}/offer`, { replace: true });
        return;
      }
      setUsId(us.id);
      setSimTitle((us.simulation as any)?.title ?? "");
      setSimCode((us.simulation as any)?.code ?? null);
      setSimCompany((us.simulation as any)?.company ?? "");
      setCompletionAt((us as any)?.completed_at ?? null);

      const { data: c } = await supabase.from("conversations").select("*").eq("user_simulation_id", us.id).order("order_index");
      if (c?.length) {
        setConvs(c as Conv[]);
        setActiveConvId(c[0].id);
      }

      const { data: t } = await supabase.from("tasks").select("*").eq("simulation_id", id).order("order_index");
      if (t) setTasks(t as any);

      const { data: tp } = await supabase
        .from("user_task_progress")
        .select("task_id, status, score, self_eval, submission_type, submission_quality, review_summary")
        .eq("user_simulation_id", us.id);
      const map: Record<string, TaskStatusEntry> = {};
      const seMap: Record<string, SelfEvalValue | null> = {};
      tp?.forEach((p: any) => {
        map[p.task_id] = {
          status: p.status,
          score: p.score ?? undefined,
          submission_type: p.submission_type ?? null,
          submission_quality: p.submission_quality ?? null,
          review_summary: p.review_summary ?? null,
        };
        seMap[p.task_id] = p.self_eval ?? null;
      });
      setTaskStatuses(map);
      setSelfEvalMap(seMap);

      const { data: em } = await supabase.from("emails").select("*").eq("user_simulation_id", us.id).order("received_at", { ascending: false });
      if (em) setEmails(em as Email[]);
    };
    load();
  }, [user, id, nav, profile?.plan]);

  // ---- Load messages for active conv ----
  useEffect(() => {
    if (!activeConvId) return;
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", activeConvId)
      .order("created_at")
      .then(({ data }) => { if (data) setMessages(data as Msg[]); });
  }, [activeConvId]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (tab !== "chat" || mobilePanel !== "chat") return;
    const timer = window.setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [activeConvId, mobilePanel, tab]);

  useEffect(() => {
    if (!feedbackTask) return;
    setFeedbackTab("answer");
    setFeedbackReadMap((current) => ({
      ...current,
      [feedbackTask.id]: {
        answer: true,
        detail: current[feedbackTask.id]?.detail ?? false,
      },
    }));
  }, [feedbackTask]);

  useEffect(() => {
    if (!activeConvId) return;
    void markConversationRead(activeConvId);
  }, [activeConvId, convs]);

  useEffect(() => {
    if (!activeEmail || activeEmail.is_read || activeEmail.folder === "sent" || activeEmail.folder === "draft") return;
    void supabase.from("emails").update({ is_read: true }).eq("id", activeEmail.id);
    setEmails((current) =>
      current.map((email) => (email.id === activeEmail.id ? { ...email, is_read: true } : email)),
    );
  }, [activeEmail]);

  useEffect(() => {
    if (!activeTask) return;
    void postTaskMaterialsToGroup(activeTask);
  }, [activeTask?.id, convs.length, simCode]);

  useEffect(() => {
    const backfillContextMessages = async () => {
      if (!usId || !convs.length) return;

      const groupConversation = convs.find((item) => getConversationKind(item, simCode) === "group");
      const hrConversation = convs.find((item) => getConversationKind(item, simCode) === "hr");
      const inserts: Record<string, unknown>[] = [];

      if (groupConversation) {
        const { data: groupMessages } = await supabase
          .from("messages")
          .select("content, file_name")
          .eq("conversation_id", groupConversation.id);

        const existingGroupContents = new Set((groupMessages ?? []).map((item: any) => item.content).filter(Boolean));
        const existingGroupFiles = new Set((groupMessages ?? []).map((item: any) => item.file_name).filter(Boolean));
        const groupNotice = getGroupWelcomeNotice(simCode);

        if (groupNotice && !existingGroupContents.has(`[通知]\n${groupNotice}`)) {
          inserts.push({
            conversation_id: groupConversation.id,
            sender: "system",
            message_type: "text",
            content: `[通知]\n${groupNotice}`,
          });
        }

        starterKitAssets.forEach((asset) => {
          if (!existingGroupFiles.has(asset.filename)) {
            inserts.push({
              conversation_id: groupConversation.id,
              sender: "system",
              message_type: "file",
              content: asset.description,
              file_name: asset.filename,
              file_size: asset.sizeLabel,
              file_url: asset.url,
            });
          }
        });
      }

      if (hrConversation) {
        const { data: hrMessages } = await supabase
          .from("messages")
          .select("content")
          .eq("conversation_id", hrConversation.id)
          .eq("message_type", "text");

        const faqCard = buildHrFaqCard();
        const existingHrContents = new Set((hrMessages ?? []).map((item: any) => item.content).filter(Boolean));
        if (!existingHrContents.has(faqCard)) {
          inserts.push({
            conversation_id: hrConversation.id,
            sender: "hr",
            message_type: "text",
            content: faqCard,
          });
        }
      }

      if (!inserts.length) return;

      const { data } = await supabase.from("messages").insert(inserts as any).select();
      if (data && activeConvId && data.some((item: any) => item.conversation_id === activeConvId)) {
        setMessages((current) => [...current, ...(data.filter((item: any) => item.conversation_id === activeConvId) as Msg[])]);
      }
    };

    void backfillContextMessages();
  }, [activeConvId, convs, simCode, starterKitAssets, usId]);

  useEffect(() => {
    void syncProgressState();
  }, [taskStatuses, selfEvalMap, tasks.length, usId]);

  const appendLocalSystemMessage = (content: string) => {
    if (!activeConvId) return;
    setMessages((current) => [
      ...current,
      {
        id: `system-${Date.now()}`,
        conversation_id: activeConvId,
        sender: "system",
        message_type: "system",
        content,
        created_at: new Date().toISOString(),
      } as Msg,
    ]);
  };

  const showBossFallback = (content: string, toastText = content) => {
    appendLocalSystemMessage(content);
    toast(toastText, { icon: "💬" });
  };

  const focusIntoView = (element: HTMLTextAreaElement | HTMLInputElement) => {
    if (window.innerWidth >= 1024) return;
    window.setTimeout(() => {
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 300);
  };

  const uploadIntoChat = async (file: File) => {
    if (!user || !id) return;
    const kind = file.type.startsWith("image/") ? "image" : "attachment";
    setUploadProgress(0);
    try {
      const r = await uploadFile({
        kind,
        userId: user.id,
        simulationId: id,
        taskOrder: activeTask?.order_index ?? null,
        file,
        onProgress: setUploadProgress,
      });
      setPendingUpload({
        name: r.name,
        size: r.sizeLabel,
        url: r.url,
        path: r.path,
        kind: kind === "image" ? "image" : "file",
      });
      toast.success(kind === "image" ? "图片已添加到消息" : "已添加附件，发送即提交", { description: r.name });
    } finally {
      setUploadProgress(null);
    }
  };

  const uploadIntoCompose = async (file: File) => {
    if (!user || !id) return;
    setComposeProgress(0);
    try {
      const r = await uploadFile({
        kind: "attachment",
        userId: user.id,
        simulationId: id,
        taskOrder: activeTask?.order_index ?? null,
        file,
        onProgress: setComposeProgress,
      });
      setComposeFile({ name: r.name, size: r.sizeLabel, url: r.url, path: r.path });
      toast.success("附件已添加到邮件", { description: r.name });
    } finally {
      setComposeProgress(null);
    }
  };

  const setConversationUnread = async (conversationId: string, unreadCount: number) => {
    setConvs((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unread_count: unreadCount }
          : conversation,
      ),
    );
    await supabase
      .from("conversations")
      .update({ unread_count: unreadCount })
      .eq("id", conversationId);
  };

  const markConversationRead = async (conversationId: string) => {
    const conversation = convs.find((item) => item.id === conversationId);
    if (!conversation || conversation.unread_count === 0) return;
    await setConversationUnread(conversationId, 0);
  };

  const upsertTaskStatus = (taskId: string, next: TaskStatusEntry) => {
    setTaskStatuses((current) => ({
      ...current,
      [taskId]: {
        ...current[taskId],
        ...next,
      },
    }));
  };

  const pushConversationMessages = async (
    conversationId: string,
    payload:
      | Record<string, unknown>
      | Record<string, unknown>[],
    options?: { markUnread?: boolean },
  ) => {
    const rows = Array.isArray(payload) ? payload : [payload];
    if (!rows.length) return [];

    const { data, error } = await supabase.from("messages").insert(rows as any).select();
    if (error) {
      console.error(error);
      return [];
    }

    if (conversationId === activeConvId) {
      setMessages((current) => [...current, ...(data as Msg[])]);
      await setConversationUnread(conversationId, 0);
    } else if (options?.markUnread !== false) {
      const currentUnread = convs.find((item) => item.id === conversationId)?.unread_count ?? 0;
      await setConversationUnread(conversationId, currentUnread + data.length);
    }

    return (data as Msg[]) ?? [];
  };

  const postTaskMaterialsToGroup = async (task: Task) => {
    const groupConversation = convs.find((item) => getConversationKind(item, simCode) === "group");
    if (!groupConversation) return;

    const materials = getTaskMaterials(simCode, task.order_index);
    if (!materials.length) return;

    const { data: existing } = await supabase
      .from("messages")
      .select("file_name")
      .eq("conversation_id", groupConversation.id)
      .eq("task_id", task.id)
      .eq("message_type", "file");

    const existingNames = new Set((existing ?? []).map((item: any) => item.file_name).filter(Boolean));
    const pending = materials.filter((material) => !existingNames.has(material.filename));

    if (!pending.length) return;

    await pushConversationMessages(
      groupConversation.id,
      [
        {
          conversation_id: groupConversation.id,
          sender: "system",
          message_type: "text",
          content: getTaskRuntime(simCode, task.order_index)?.groupNudge ?? "当前任务资料已同步。",
          task_id: task.id,
        },
        ...pending.map((material) => ({
          conversation_id: groupConversation.id,
          sender: "system",
          message_type: "file",
          content: material.description,
          file_name: material.filename,
          file_size: "starter kit",
          file_url: material.url,
          task_id: task.id,
        })),
      ],
      { markUnread: true },
    );
  };

  const finalizeTaskAndUnlock = async (task: Task) => {
    if (!usId) return;
    const nextTask = tasks.find((item) => item.order_index === task.order_index + 1);
    const currentScore = taskStatuses[task.id]?.score ?? task.score;

    await supabase
      .from("user_task_progress")
      .update({
        status: "done",
        score: currentScore,
        feedback_seen: true,
      })
      .eq("user_simulation_id", usId)
      .eq("task_id", task.id);

    if (nextTask) {
      const { data: nextProgress } = await supabase
        .from("user_task_progress")
        .select("id, status")
        .eq("user_simulation_id", usId)
        .eq("task_id", nextTask.id)
        .maybeSingle();

      if (!nextProgress) {
        await supabase.from("user_task_progress").insert({
          user_simulation_id: usId,
          task_id: nextTask.id,
          status: "active",
        });
      } else if (nextProgress.status === "locked") {
        await supabase
          .from("user_task_progress")
          .update({ status: "active" })
          .eq("id", nextProgress.id);
      }

      await supabase
        .from("user_simulations")
        .update({
          current_task_index: nextTask.order_index,
          progress: Math.round(((task.order_index + 1) / tasks.length) * 100),
        })
        .eq("id", usId);

      upsertTaskStatus(task.id, { status: "done", score: currentScore });
      upsertTaskStatus(nextTask.id, { status: "active" });

      const leaderConversation = convs.find((item) => getConversationKind(item, simCode) === "leader");
      if (leaderConversation) {
        await pushConversationMessages(
          leaderConversation.id,
          [
            {
              conversation_id: leaderConversation.id,
              sender: "boss",
              message_type: "text",
              content: nextTask.assignment_message,
            },
            {
              conversation_id: leaderConversation.id,
              sender: "boss",
              message_type: "task",
              content: nextTask.title,
              task_id: nextTask.id,
            },
          ],
          { markUnread: leaderConversation.id !== activeConvId },
        );
      }

      await postTaskMaterialsToGroup(nextTask);
      toast.success(`下一个任务：${nextTask.title}`);
      return;
    }

    const totalScore = tasks.reduce(
      (sum, item) => sum + (item.id === task.id ? currentScore : taskStatuses[item.id]?.score ?? 0),
      0,
    );

    await supabase
      .from("user_simulations")
      .update({
        status: "completed",
        progress: 100,
        completed_at: new Date().toISOString(),
      })
      .eq("id", usId);

    upsertTaskStatus(task.id, { status: "done", score: currentScore });
    setCompletionAverageScore(tasks.length ? Math.round(totalScore / tasks.length) : null);
    setCompletionAt(new Date().toISOString());
    setCompletionOpen(true);

    const leaderConversation = convs.find((item) => getConversationKind(item, simCode) === "leader");
    const hrConversation = convs.find((item) => getConversationKind(item, simCode) === "hr");

    if (leaderConversation) {
      await pushConversationMessages(
        leaderConversation.id,
        {
          conversation_id: leaderConversation.id,
          sender: "boss",
          message_type: "text",
          content: runtime.leader.completionNote,
        },
        { markUnread: leaderConversation.id !== activeConvId },
      );
    }

    if (hrConversation) {
      await pushConversationMessages(
        hrConversation.id,
        {
          conversation_id: hrConversation.id,
          sender: "hr",
          message_type: "file",
          content: "你的模拟实习结业通知已生成，可保存留档。",
          file_name: `${runtime.completionLetterTitle}.md`,
          file_size: "completion letter",
          file_url: `data:text/markdown;charset=utf-8,${encodeURIComponent(`# ${runtime.completionLetterTitle}\n\n同学你好，\n\n恭喜你完成《${simTitle}》全部任务。系统已记录你的任务反馈、自评与结业结果，可作为后续能力展示留存。\n\n${runtime.hrName}`)}`,
        },
        { markUnread: hrConversation.id !== activeConvId },
      );
    }
  };

  const syncProgressState = async () => {
    if (!usId || !tasks.length || syncingProgressRef.current) return;

    const pendingTask = tasks.find((task) => taskStatuses[task.id]?.status === "feedback_pending");
    if (!pendingTask) return;

    const readyToUnlock = Boolean(selfEvalMap[pendingTask.id]?.submitted_at);
    if (!readyToUnlock) {
      setFeedbackTask((current) => current ?? pendingTask);
      return;
    }

    syncingProgressRef.current = true;
    try {
      await finalizeTaskAndUnlock(pendingTask);
      setFeedbackTask(null);
    } finally {
      syncingProgressRef.current = false;
    }
  };

  const queueAutomatedReply = async (conversation: Conv, reply: { delayMs: number; content: string }) => {
    setTypingConvId(conversation.id);
    window.setTimeout(async () => {
      setTypingConvId((current) => (current === conversation.id ? null : current));
      await pushConversationMessages(
        conversation.id,
        {
          conversation_id: conversation.id,
          sender: getConversationKind(conversation, simCode) === "hr" ? "hr" : "boss",
          message_type: "text",
          content: reply.content,
        },
        { markUnread: conversation.id !== activeConvId },
      );
    }, reply.delayMs);
  };

  // ---- Trigger task submission flow (file or email) ----
  const triggerSubmission = async (
    submission: { kind: "file" | "email"; filename?: string; subject?: string; fileUrl?: string },
  ) => {
    const leaderConversation = convs.find((conversation) => getConversationKind(conversation, simCode) === "leader");
    const activeTaskNow = tasks.find((t) => {
      const status = taskStatuses[t.id]?.status;
      return status === "active" || status === "needs_resubmission";
    });
    if (!activeTaskNow || !usId) return;
    const evaluation = evaluateSubmission({
      task: activeTaskNow,
      simulationCode: simCode,
      submission,
    });

    await supabase
      .from("user_task_progress")
      .update({
        status: evaluation.quality === "pass" ? "feedback_pending" : "needs_resubmission",
        score: evaluation.score,
        submitted_filename: submission.filename ?? submission.subject ?? null,
        submitted_file_url: submission.fileUrl ?? null,
        submission_type: evaluation.submissionType,
        submission_quality: evaluation.quality,
        review_summary: evaluation.detailMarkdown,
        submitted_at: new Date().toISOString(),
      })
      .eq("user_simulation_id", usId)
      .eq("task_id", activeTaskNow.id);

    upsertTaskStatus(activeTaskNow.id, {
      status: evaluation.quality === "pass" ? "feedback_pending" : "needs_resubmission",
      score: evaluation.score ?? undefined,
      submission_type: evaluation.submissionType,
      submission_quality: evaluation.quality,
      review_summary: evaluation.detailMarkdown,
    });

    setTypingConvId(leaderConversation?.id ?? null);
    window.setTimeout(async () => {
      setTypingConvId((current) => (current === leaderConversation?.id ? null : current));
      if (leaderConversation) {
        await pushConversationMessages(
          leaderConversation.id,
          {
            conversation_id: leaderConversation.id,
            sender: "boss",
            message_type: "feedback",
            content: evaluation.leaderMessage,
            task_id: activeTaskNow.id,
          },
          { markUnread: leaderConversation.id !== activeConvId },
        );
      }
      setFeedbackTask(activeTaskNow);
    }, evaluation.quality === "pass" ? 6800 : 2600);
  };

  // ---- Send message ----
  const send = async () => {
    if ((!input.trim() && !pendingUpload) || !activeConvId || sending) return;
    setSending(true);

    const isImage = pendingUpload?.kind === "image";
    const isFile = pendingUpload?.kind === "file";
    const userMsg = {
      conversation_id: activeConvId,
      sender: "user",
      message_type: isImage ? "image" : isFile ? "file" : "text",
      content: input.trim() || (pendingUpload ? (isImage ? "" : "已提交附件") : ""),
      file_name: pendingUpload?.name ?? null,
      file_size: pendingUpload?.size ?? null,
      file_url: pendingUpload?.url ?? null,
    };

    const { data: inserted } = await supabase.from("messages").insert(userMsg as any).select().single();
    if (inserted) setMessages((m) => [...m, inserted as Msg]);
    setInput("");
    const wasUpload = pendingUpload;
    setPendingUpload(null);

    // Find current conversation role
    const activeConversation = convs.find((conversation) => conversation.id === activeConvId);
    const conversationKind = activeConversation ? getConversationKind(activeConversation, simCode) : "leader";
    const isLeaderConversation = conversationKind === "leader";
    let tempId: string | null = null;

    if (conversationKind !== "hr" && wasUpload?.kind === "file") {
      await triggerSubmission({ kind: "file", filename: wasUpload.name, fileUrl: wasUpload.url });
      setSending(false);
      return;
    }

    if (activeConversation && conversationKind !== "leader" && input.trim()) {
      const reply = getAutomatedReply({
        conversationKind,
        simulationCode: simCode,
        text: input.trim(),
        activeTask,
      });
      if (reply) await queueAutomatedReply(activeConversation, reply);
      setSending(false);
      return;
    }

    if (isLeaderConversation && input.trim()) {
      const fixedReply = getAutomatedReply({
        conversationKind: "leader",
        simulationCode: simCode,
        text: input.trim(),
        activeTask,
      });
      if (fixedReply) {
        await queueAutomatedReply(activeConversation!, fixedReply);
        setSending(false);
        return;
      }

      // AI streaming reply
      try {
        const activeTask = tasks.find((t) => taskStatuses[t.id]?.status === "active");
        const history = [...messages, inserted as Msg].slice(-10).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content,
        }));
        if (!supabasePublicConfig.ok || !supabasePublicConfig.url || !supabasePublicConfig.key) {
          throw new Error("Supabase public config missing");
        }

        const resp = await fetch(`${supabasePublicConfig.url}/functions/v1/boss-reply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabasePublicConfig.key}`,
          },
          body: JSON.stringify({
            messages: history,
            simulation_title: simTitle,
            current_task: activeTask ? { title: activeTask.title, brief: activeTask.brief } : null,
            user_name: profile?.name || user?.email?.split("@")[0] || "新人",
            leader_name: runtime.leader.name,
            leader_role: runtime.leader.title,
            leader_tone: runtime.leader.tonePrompt,
          }),
        });

        if (resp.status === 429) {
          showBossFallback(`${runtime.leader.name}刚在开会，等 30 秒再试试。`);
          setSending(false);
          return;
        }
        if (resp.status === 402) {
          showBossFallback("今日 AI 对话次数已用完，明天再来吧（或升级 Pro 享更多额度）。");
          setSending(false);
          return;
        }
        if (!resp.ok || !resp.body) throw new Error("stream failed");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let acc = "";
        // optimistic boss message
        tempId = `tmp-${Date.now()}`;
        setStreamingMessageId(tempId);
        setStreamStarted(false);
        setMessages((m) => [...m, { id: tempId, conversation_id: activeConvId, sender: "boss", message_type: "text", content: "", created_at: new Date().toISOString() } as Msg]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let i: number;
          while ((i = buf.indexOf("\n")) !== -1) {
            let line = buf.slice(0, i); buf = buf.slice(i + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const j = line.slice(6).trim();
            if (j === "[DONE]") break;
            try {
              const p = JSON.parse(j);
              const c = p.choices?.[0]?.delta?.content;
              if (c) {
                setStreamStarted(true);
                acc += c;
                setMessages((m) => m.map((mm) => mm.id === tempId ? { ...mm, content: acc } : mm));
              }
            } catch { buf = line + "\n" + buf; break; }
          }
        }
        // persist
        if (acc) {
          const { data: saved } = await supabase.from("messages").insert({
            conversation_id: activeConvId, sender: "boss", message_type: "text", content: acc,
          }).select().single();
          if (saved) setMessages((m) => m.map((mm) => mm.id === tempId ? saved as Msg : mm));
        } else if (tempId) {
          setMessages((m) => m.filter((mm) => mm.id !== tempId));
          showBossFallback(`${runtime.leader.name}暂时没回——网络可能不太稳，过会儿再发一次试试。`, `${runtime.leader.name}暂时没回，稍后再试`);
        }
        setStreamingMessageId(null);
        setStreamStarted(false);
      } catch (e) {
        console.error(e);
        if (tempId) {
          setMessages((m) => m.filter((mm) => mm.id !== tempId));
        }
        setStreamingMessageId(null);
        setStreamStarted(false);
        showBossFallback(`${runtime.leader.name}暂时没回——网络可能不太稳，过会儿再发一次试试。`, `${runtime.leader.name}暂时没回，稍后再试`);
      }
    }

    setSending(false);
  };

  // ---- Advance to next task from feedback modal ----
  const advance = async () => {
    if (!feedbackTask) return;
    await finalizeTaskAndUnlock(feedbackTask);
    setFeedbackTask(null);
  };

  // ---- Real uploads ----
  const handleChatFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadIntoChat(file);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "上传失败");
    }
  };

  const handleChatImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadIntoChat(file);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "上传失败");
    }
  };

  const openCompose = () => {
    setComposeSubject(activeTask ? `任务提交：${activeTask.title}` : "");
    setComposeCc("");
    setComposeBody("");
    setComposeFile(null);
    setComposeSentFlash(false);
    setComposeOpen(true);
  };

  const handleComposeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await uploadIntoCompose(file);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "上传失败");
    }
  };

  const sendCompose = async () => {
    if (!usId || !user) return;
    if (!composeSubject.trim() || !composeBody.trim()) {
      toast.error("请填写主题和正文");
      return;
    }
    setComposeSending(true);
    const fromName = profile?.name || user.email?.split("@")[0] || "我";
    const fromEmail = user.email || "me@ruhang.app";
    const ccArr = composeCc
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const bodyWithAttachment = composeFile
      ? `${composeBody}\n\n— 附件：${composeFile.name}（${composeFile.size}）`
      : composeBody;

    const { data: inserted, error } = await supabase
      .from("emails")
      .insert({
        user_simulation_id: usId,
        folder: "sent",
        from_name: fromName,
        from_email: fromEmail,
        to_addresses: [runtime.leader.email],
        cc_addresses: ccArr,
        subject: composeSubject.trim(),
        body: bodyWithAttachment,
        is_read: true,
      })
      .select()
      .single();

    if (error || !inserted) {
      console.error(error);
      toast.error("发送失败，请重试");
      setComposeSending(false);
      return;
    }

    setEmails((es) => [inserted as Email, ...es]);
    setActiveEmail(inserted as Email);
    setComposeSentFlash(true);
    toast.success(`邮件已送达${runtime.leader.name}收件箱`, { description: composeSubject.trim() });
    await new Promise((resolve) => window.setTimeout(resolve, 320));
    setComposeOpen(false);
    setComposeSending(false);
    setComposeSentFlash(false);

    // If there's an active task, treat email send as a submission
    if (activeTask) {
      await triggerSubmission({ kind: "email", subject: composeSubject.trim(), filename: composeFile?.name });
    }
  };

  const saveDraft = async () => {
    if (!usId || !user) return;
    if (!composeSubject.trim() && !composeBody.trim()) {
      setComposeOpen(false);
      return;
    }
    setDraftSaving(true);
    const fromName = profile?.name || user.email?.split("@")[0] || "我";
    const fromEmail = user.email || "me@ruhang.app";
    await supabase.from("emails").insert({
      user_simulation_id: usId,
      folder: "draft",
      from_name: fromName,
      from_email: fromEmail,
      to_addresses: [runtime.leader.email],
      cc_addresses: [],
      subject: composeSubject.trim() || "(无主题)",
      body: composeBody,
      is_read: true,
    });
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    setDraftSaving(false);
    toast.success("草稿已保存");
    setComposeOpen(false);
  };

  const handleCallEnded = async (durationSeconds: number) => {
    if (!activeConvId) return;
    const transcript = phoneScript
      ? [phoneScript.title, "", ...phoneScript.lines, "", phoneScript.followup].join("\n")
      : "通话脚本待补充";
    await pushConversationMessages(
      activeConvId,
      {
        conversation_id: activeConvId,
        sender: "system",
        message_type: "audio",
        content: phoneScript
          ? `${phoneScript.title} · 通话结束 · 时长 ${String(Math.floor(durationSeconds / 60)).padStart(2, "0")}:${String(durationSeconds % 60).padStart(2, "0")}`
          : `通话结束 · 时长 ${String(Math.floor(durationSeconds / 60)).padStart(2, "0")}:${String(durationSeconds % 60).padStart(2, "0")}`,
        file_name: `${phoneScript?.title ?? "call-script"}_subtitle.txt`,
        file_size: "00:30",
        file_url: `data:text/plain;charset=utf-8,${encodeURIComponent(transcript)}`,
      },
      { markUnread: false },
    );
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden lg:flex-row">
      {/* Top-left logo */}
      <AlertDialog>
// @ts-ignore
// @ts-ignore
// @ts-ignore
        // @ts-ignore
<AlertDialogTrigger asChild>
          <button className="absolute left-4 top-4 z-50 flex items-center gap-2 rounded-lg bg-surface-1/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="font-display font-semibold text-foreground">入行</span>
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="glass-strong border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>退出当前项目？</AlertDialogTitle>
            <AlertDialogDescription>你的进度会被自动保存，下次回来可继续。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>留在这里</AlertDialogCancel>
            <AlertDialogAction onClick={() => nav("/dashboard")} className="bg-gradient-gold text-primary-foreground hover:opacity-95">返回控制台</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile panel switcher */}
      <div className="flex shrink-0 items-center justify-center gap-1 border-b border-white/5 bg-surface-1/60 px-2 py-2 pl-24 lg:hidden">
        {([
          { k: "convs", label: "会话" },
          { k: "chat", label: "聊天" },
          { k: "tasks", label: "任务" },
        ] as const).map((t) => (
          <button
            key={t.k}
            onClick={() => setMobilePanel(t.k)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs transition",
              mobilePanel === t.k
                ? "bg-gradient-gold text-primary-foreground"
                : "text-muted-foreground hover:bg-white/5",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Left: conversations */}
      <aside className={cn(
        "w-full shrink-0 border-r border-white/5 bg-surface-1/60 lg:flex lg:w-[280px] lg:flex-col",
        mobilePanel === "convs" ? "flex flex-1 flex-col overflow-hidden" : "hidden",
      )}>
        <div className="px-4 pt-6 pb-4 lg:pt-16">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{simTitle}</div>
        </div>
        <div className="space-y-1 overflow-y-auto px-2">
          {convs.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveConvId(c.id); setMobilePanel("chat"); }}
              className={cn(
                "relative flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition",
                activeConvId === c.id ? "bg-primary/10" : "hover:bg-white/5",
              )}
            >
              {activeConvId === c.id && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-gradient-gold" />}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-base">
                {c.avatar_emoji}
              </div>
              <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    {c.unread_count > 0 && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{c.role_label}</div>
                </div>
              </button>
            ))}
        </div>
      </aside>

      {/* Center */}
      <main className={cn(
        "flex-1 flex-col bg-background lg:flex",
        mobilePanel === "chat" ? "flex" : "hidden lg:flex",
      )}>
        <div className="flex items-center justify-between border-b border-white/5 px-4 pt-4 pb-3 pl-20 lg:px-6 lg:pl-6">
          <div className="flex items-center gap-3">
            {activeConv && (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-base">{activeConv.avatar_emoji}</div>
                <div>
                  <div className="text-sm font-medium">{activeConv.name}</div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    在线
                  </div>
                </div>
              </>
            )}
          </div>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="bg-surface-1">
              <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground">
                <MessageCircle className="mr-1 h-3.5 w-3.5" /> 消息
              </TabsTrigger>
              <TabsTrigger value="email" className="text-xs data-[state=active]:bg-gradient-gold data-[state=active]:text-primary-foreground">
                <Mail className="mr-1 h-3.5 w-3.5" /> 邮件
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {tab === "chat" ? (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
              <div className="mx-auto max-w-3xl space-y-4">
                {messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    msg={m}
                    task={tasks.find((t) => t.id === m.task_id)}
                    streaming={m.id === streamingMessageId}
                    conversationKind={getConversationKind(activeConv ?? { name: "", is_group: false, role_label: "" }, simCode)}
                  />
                ))}
                {showTypingIndicator && activeConv && (
                  <TypingIndicator
                    role={getConversationKind(activeConv, simCode)}
                    label={
                      getConversationKind(activeConv, simCode) === "leader"
                        ? `${activeConv.name} 正在思考…`
                        : getConversationKind(activeConv, simCode) === "group"
                          ? `${activeConv.name} 正在同步资料…`
                          : `${activeConv.name} 正在查找答案…`
                    }
                  />
                )}
              </div>
            </div>

            <div className="border-t border-white/5 bg-surface-1/40 p-4">
              <DropZone kind="attachment" disabled={sending} uploading={uploadProgress !== null} onFile={uploadIntoChat}>
              <div className="mx-auto max-w-3xl">
                <input ref={fileInputRef} type="file" hidden onChange={handleChatFile} />
                <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleChatImage} />

                {uploadProgress !== null && (
                  <div className="mb-2 flex items-center gap-3 rounded-lg border border-white/10 bg-background/50 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">上传中…</span>
                    <Progress value={uploadProgress} className="h-1.5 flex-1" />
                    <span className="font-mono text-primary">{uploadProgress}%</span>
                  </div>
                )}
                {pendingUpload && pendingUpload.kind === "file" && (
                  <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs">
                    <Paperclip className="h-3.5 w-3.5 text-primary" />
                    <span>{pendingUpload.name}</span>
                    <span className="text-muted-foreground">{pendingUpload.size}</span>
                    <button onClick={() => setPendingUpload(null)} className="ml-2 text-muted-foreground hover:text-destructive">×</button>
                  </div>
                )}
                {pendingUpload && pendingUpload.kind === "image" && (
                  <div className="mb-2 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-1.5 text-xs">
                    <img src={pendingUpload.url} alt="" className="h-12 w-12 rounded object-cover" />
                    <span className="px-1">{pendingUpload.name}</span>
                    <button onClick={() => setPendingUpload(null)} className="px-1 text-muted-foreground hover:text-destructive">×</button>
                  </div>
                )}

                <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-background/50 p-2">
                  <Button
                    size="icon" variant="ghost"
                    className="h-9 w-9 hover:bg-white/5"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadProgress !== null}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon" variant="ghost"
                    className="h-9 w-9 hover:bg-white/5"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadProgress !== null}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={(e) => focusIntoView(e.target)}
                    onKeyDown={(e) => {
                      // `isComposing` / keyCode 229 protects Chinese IME (Pinyin) — don't send while composing
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder={
                      getConversationKind(activeConv ?? { name: "", is_group: false, role_label: "" }, simCode) === "leader"
                        ? `和${runtime.leader.name}聊聊…（Enter 发送，Shift+Enter 换行）`
                        : "输入消息…（Enter 发送）"
                    }
                    className="min-h-[44px] max-h-[120px] flex-1 resize-none border-0 bg-transparent p-2 text-sm focus-visible:ring-0"
                  />
                  <Button
                    size="icon"
                    onClick={send}
                    disabled={sending || (!input.trim() && !pendingUpload)}
                    className="h-9 w-9 rounded-full bg-gradient-gold text-primary-foreground hover:opacity-95"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              </DropZone>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                收件箱 · {emails.filter((e) => e.folder !== "sent" && e.folder !== "draft").length}
                <span className="mx-2 text-white/10">·</span>
                已发送 · {emails.filter((e) => e.folder === "sent").length}
              </div>
              <Button
                size="sm"
                onClick={openCompose}
                className="h-8 bg-gradient-gold text-primary-foreground hover:opacity-95"
              >
                <PenSquare className="mr-1.5 h-3.5 w-3.5" />
                写邮件
              </Button>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="w-[35%] border-r border-white/5 overflow-y-auto">
                {emails.length === 0 && (
                  <div className="p-6 text-center text-xs text-muted-foreground">还没有邮件</div>
                )}
                {emails.map((e) => {
                  const isSent = e.folder === "sent";
                  return (
                    <button
                      key={e.id}
                      onClick={() => setActiveEmail(e)}
                      className={cn(
                        "block w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5",
                        isSent && "bg-primary/[0.03]",
                        activeEmail?.id === e.id && "bg-primary/10",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                          {isSent && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] uppercase text-primary">
                              <Send className="h-2.5 w-2.5" />
                              已发送
                            </span>
                          )}
                          <div className="truncate text-sm font-medium">
                            {isSent ? `→ ${runtime.leader.name} · ${runtime.leader.title}` : e.from_name}
                          </div>
                        </div>
                        {!e.is_read && !isSent && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary animate-pulse-dot" />}
                      </div>
                      <div className="mt-1 truncate text-xs text-foreground">{e.subject}</div>
                      <div className="mt-1 truncate text-[11px] text-muted-foreground">{e.body.slice(0, 60)}…</div>
                    </button>
                  );
                })}
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                {activeEmail ? (
                  <div className="mx-auto max-w-2xl">
                    <h2 className="font-display text-xl font-semibold">{activeEmail.subject}</h2>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {activeEmail.from_name} &lt;{activeEmail.from_email}&gt;
                    </div>
                    <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{activeEmail.body}</div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">选择一封邮件查看</div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Right: tasks */}
      <aside className={cn(
        "w-full shrink-0 border-l border-white/5 bg-surface-1/60 lg:flex lg:w-[320px] lg:flex-col",
        mobilePanel === "tasks" ? "flex flex-1 flex-col overflow-hidden" : "hidden",
      )}>
        <div className="border-b border-white/5 px-5 pt-6 pb-4 lg:pt-16">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">任务进度</h3>
            <span className="font-mono text-sm text-primary">{overall}%</span>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-gold transition-all" style={{ width: `${overall}%` }} />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{completedCount} / {tasks.length} 已完成</div>
        </div>
        <ScrollArea className="flex-1 px-5 py-4">
          <div className="space-y-3">
            {starterKitAssets.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">Starter Kit</div>
                    <div className="text-xs text-muted-foreground">开工前先把这些核心材料过一遍</div>
                  </div>
                  <Badge className="bg-primary/15 text-primary">{starterKitAssets.length} 份</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {starterKitAssets.map((asset) => (
                    <a
                      key={asset.id}
                      href={asset.url}
                      download={asset.filename}
                      className="flex items-start gap-3 rounded-lg border border-white/5 bg-background/30 px-3 py-2 transition hover:bg-white/5"
                    >
                      <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary">
                        <FileText className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{asset.title}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{asset.description}</div>
                        <div className="mt-1 text-[11px] text-primary">{asset.sizeLabel}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {tasks.filter((t) => taskStatuses[t.id]?.status !== "done").map((t) => {
              const st = taskStatuses[t.id]?.status ?? "locked";
              const sc = taskStatuses[t.id]?.score;
              const isActive = st === "active" || st === "feedback_pending" || st === "needs_resubmission";
              const isDone = st === "done";
              const requiresRetry = st === "needs_resubmission";
              const materials = getTaskMaterials(simCode, t.order_index);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (st === "feedback_pending" || st === "needs_resubmission" || st === "done") setFeedbackTask(t);
                  }}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition",
                    isActive
                      ? requiresRetry
                        ? "border-amber-500/40 bg-amber-500/5"
                        : "border-primary/40 bg-primary/5"
                      : isDone
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-white/5 bg-white/[0.02]",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : isActive ? (
                      <span className={cn("h-2 w-2 rounded-full animate-pulse-dot", requiresRetry ? "bg-amber-400" : "bg-primary")} />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className={cn("text-xs font-medium", !isActive && !isDone && "text-muted-foreground")}>
                      Task {t.order_index + 1}
                    </div>
                    {requiresRetry && <span className="ml-auto text-[10px] font-medium text-amber-300">需重交</span>}
                    {!requiresRetry && sc != null && <span className="ml-auto font-mono text-xs text-emerald-400">{sc}</span>}
                  </div>
                  <div className={cn("mt-1 text-sm", !isActive && !isDone && "text-muted-foreground")}>{t.title}</div>
                  {isActive && (
                    <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                      <p>{t.brief}</p>
                      <ul className="space-y-1">
                        {t.requirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Circle className="mt-1 h-2 w-2 shrink-0 fill-primary text-primary" /> {r}
                          </li>
                        ))}
                      </ul>
                      <div className="inline-flex items-center gap-1.5 rounded bg-primary/10 px-2 py-1 text-primary">
                        <Clock className="h-3 w-3" />
                        {formatDeadline(t.deadline_hours)}
                      </div>
                      <div className="text-[11px] italic">
                        {getTaskRuntime(simCode, t.order_index)?.minimumRequirement}
                      </div>
                      {materials.length > 0 && (
                        <div className="space-y-1 rounded-lg border border-white/10 bg-background/40 p-2">
                          <div className="text-[11px] font-medium text-foreground">最小资料包</div>
                          {materials.map((material) => (
                            <a
                              key={material.id}
                              href={material.url}
                              download={material.filename}
                              className="flex items-center gap-2 rounded-md px-2 py-1 transition hover:bg-white/5"
                            >
                              <Paperclip className="h-3 w-3 text-primary" />
                              <span className="truncate">{material.title}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
            {tasks.some((t) => taskStatuses[t.id]?.status === "done") && (
              <Collapsible open={!doneCollapsed} onOpenChange={(open) => setDoneCollapsed(!open)}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left">
                  <div>
                    <div className="text-sm font-medium">已完成任务</div>
                    <div className="text-xs text-muted-foreground">支持随时回看标准答案、解析和自评记录</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-300">
                    <span>({tasks.filter((t) => taskStatuses[t.id]?.status === "done").length})</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", !doneCollapsed && "rotate-180")} />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  {tasks.filter((t) => taskStatuses[t.id]?.status === "done").map((t) => {
                    const sc = taskStatuses[t.id]?.score;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setFeedbackTask(t)}
                        className="w-full rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-left transition hover:bg-emerald-500/10"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          <div className="text-xs font-medium">Task {t.order_index + 1}</div>
                          {sc != null && <span className="ml-auto font-mono text-xs text-emerald-400">{sc}</span>}
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <div className="text-sm">{t.title}</div>
                          <span className="text-[10px] text-emerald-300 hover:underline">回看</span>
                        </div>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}
            {activeTask && (
              <button
                type="button"
                onClick={() => setCallOpen(true)}
                className="flex w-full items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left text-sm text-foreground/90 transition hover:bg-primary/10"
              >
                <Phone className="h-4 w-4 text-primary" />
                电话 / 语音任务入口骨架
              </button>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Feedback modal */}
      <Dialog open={!!feedbackTask} onOpenChange={(o) => !o && setFeedbackTask(null)}>
        <DialogContent className="glass-strong max-h-[90vh] max-w-3xl overflow-y-auto border-white/10">
          {feedbackTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 font-display text-xl">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-sm",
                      feedbackStatus?.submission_quality === "retry"
                        ? "bg-amber-500/15 font-medium text-amber-200"
                        : "bg-gradient-gold font-mono text-primary-foreground",
                    )}
                  >
                    {feedbackStatus?.submission_quality === "retry" ? "需重交" : feedbackStatus?.score ?? feedbackTask.score}
                  </span>
                  {feedbackTask.title} · 反馈
                  {isReviewMode && <Badge className="bg-emerald-500/15 text-emerald-200">已完成 · 回看模式</Badge>}
                </DialogTitle>
              </DialogHeader>
              <ATabs
                value={feedbackTab}
                onValueChange={(value) => {
                  const next = value as "answer" | "detail" | "self";
                  setFeedbackTab(next);
                  if (!feedbackTask || next === "self") return;
                  setFeedbackReadMap((current) => ({
                    ...current,
                    [feedbackTask.id]: {
                      answer: current[feedbackTask.id]?.answer || next === "answer",
                      detail: current[feedbackTask.id]?.detail || next === "detail",
                    },
                  }));
                }}
              >
                <ATabsList className="bg-surface-1">
                  <ATabsTrigger value="answer" className="gap-1.5">
                    标准答案
                    {feedbackReadState?.answer && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </ATabsTrigger>
                  <ATabsTrigger value="detail" className="gap-1.5">
                    详细解析
                    {feedbackReadState?.detail && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </ATabsTrigger>
                  <ATabsTrigger value="self">自我评估</ATabsTrigger>
                </ATabsList>
                <ATabsContent value="answer" className="max-h-[60vh] pr-3 md:max-h-[55vh] overflow-y-auto">
                  <MarkdownContent content={feedbackAnswerMarkdown} />
                </ATabsContent>
                <ATabsContent value="detail" className="max-h-[60vh] space-y-3 overflow-y-auto pr-3 md:max-h-[55vh]">
                  <MarkdownContent content={feedbackAnalysisMarkdown} />
                </ATabsContent>
                <ATabsContent value="self">
                  {feedbackStatus?.submission_quality === "retry" ? (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-100">
                      当前提交还没达到最低标准，请先按要求重新提交，再保存自评。
                    </div>
                  ) : usId ? (
                    <SelfEval
                      key={feedbackTask.id}
                      dimensions={feedbackTask.scoring_rubric.map((r) => ({ dim: r.dim, max: r.max }))}
                      initial={selfEvalMap[feedbackTask.id] ?? null}
                      taskId={feedbackTask.id}
                      userSimulationId={usId}
                      onSaved={(v) => setSelfEvalMap((m) => ({ ...m, [feedbackTask.id]: v }))}
                      readOnly={isReviewMode}
                    />
                  ) : null}
                </ATabsContent>
              </ATabs>
              <div className="flex justify-end border-t border-white/5 pt-4">
                <div className="flex flex-col items-end gap-2">
                  {feedbackStatus?.submission_quality === "retry" ? (
                    <div className="text-xs text-amber-200">当前提交已记录，但需要重新提交后才能进入下一任务。</div>
                  ) : !selfEvalReady && !isReviewMode ? (
                    <div className="text-xs text-muted-foreground">先完成自评，才能进入下一个任务。</div>
                  ) : null}
                  {!isReviewMode && (
                    <Button
                      onClick={feedbackStatus?.submission_quality === "retry" ? () => setFeedbackTask(null) : advance}
                      disabled={feedbackStatus?.submission_quality !== "retry" && !selfEvalReady}
                      className="bg-gradient-gold text-primary-foreground hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {feedbackStatus?.submission_quality === "retry"
                        ? "关闭反馈"
                        : selfEvalReady
                          ? "进入下一个任务 →"
                          : "请先完成自评"}
                    </Button>
                  )}
                  {isReviewMode && (
                    <Button type="button" onClick={() => setFeedbackTask(null)} className="bg-gradient-gold text-primary-foreground hover:opacity-95">
                      关闭回看
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={completionOpen} onOpenChange={setCompletionOpen}>
        <DialogContent className="glass-strong max-w-lg border-white/10">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">项目交付完成</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center">
              <div className="text-sm text-muted-foreground">本次模拟平均分</div>
              <div className="mt-2 font-mono text-3xl text-primary">{completionAverageScore ?? "--"}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xs uppercase tracking-wider text-primary">Leader 寄语</div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">{runtime.leader.completionNote}</p>
              <div className="mt-3 text-[11px] text-muted-foreground">
                完成时间 {completionAt ? new Date(completionAt).toLocaleString("zh-CN") : "--"}
              </div>
            </div>
            <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4">
              <div className="text-xs uppercase tracking-wider text-amber-200">本轮点亮</div>
              <div className="mt-2 font-display text-lg text-amber-100">全线结项</div>
              <div className="mt-1 text-sm text-amber-50/80">完成任意一条模拟线的全部任务。</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              {completionLetterUrl && (
                <Button type="button" variant="ghost" asChild>
                  <a href={completionLetterUrl} download={`${simTitle || "ruhang"}_completion_letter.txt`}>
                    下载 Completion Letter
                  </a>
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={() => nav("/dashboard")}>
                返回控制台
              </Button>
              <Button type="button" onClick={() => nav("/report")} className="bg-gradient-gold text-primary-foreground hover:opacity-95">
                查看能力报告
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compose email Sheet */}
      <Sheet open={composeOpen} onOpenChange={setComposeOpen}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={cn(
            "glass-strong flex h-full w-full flex-col bg-surface-1/95 p-0",
            isMobile
              ? "h-[90dvh] rounded-t-2xl border-t border-white/10"
              : "border-l border-white/10 sm:max-w-xl",
          )}
        >
          <SheetHeader className="shrink-0 border-b border-white/5 px-6 py-4">
            <SheetTitle className="font-display text-lg">写邮件</SheetTitle>
            <SheetDescription className="text-xs">
              {activeTask
                ? `当前任务：${activeTask.title} — 发送即视为提交`
                : `向${runtime.leader.name} · ${runtime.leader.title} 发送邮件`}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex min-h-0 flex-1 flex-col">
            <DropZone kind="attachment" disabled={composeBusy} uploading={composeProgress !== null} onFile={uploadIntoCompose}>
            <div className="space-y-4 overflow-y-auto px-6 pb-4 pr-6">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">收件人</Label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-white/10 bg-background/50 px-3 py-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {runtime.leader.name} · {runtime.leader.title}
                  <span className="text-muted-foreground">&lt;{runtime.leader.email}&gt;</span>
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cc" className="text-xs text-muted-foreground">抄送（可选）</Label>
              <Input
                id="cc"
                value={composeCc}
                disabled={composeBusy}
                onChange={(e) => setComposeCc(e.target.value)}
                placeholder="多个邮箱用逗号分隔"
                className="bg-background/50 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-xs text-muted-foreground">主题</Label>
              <Input
                id="subject"
                value={composeSubject}
                disabled={composeBusy}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="邮件主题"
                className="bg-background/50 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="body" className="text-xs text-muted-foreground">正文</Label>
              <Textarea
                id="body"
                value={composeBody}
                disabled={composeBusy}
                onFocus={(e) => focusIntoView(e.target)}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="周总，您好…"
                className="min-h-[160px] resize-y bg-background/50 text-sm leading-relaxed md:min-h-[200px]"
              />
            </div>

            {composeFile && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background/50">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">{composeFile.name}</div>
                  <div className="text-muted-foreground">{composeFile.size}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setComposeFile(null)}
                  disabled={composeBusy}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                  aria-label="移除附件"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            </div>
            </DropZone>

            <div className="sticky bottom-0 mt-4 flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/5 bg-surface-1/95 px-6 py-3 backdrop-blur">
              <input ref={composeFileInputRef} type="file" hidden onChange={handleComposeFile} />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => composeFileInputRef.current?.click()}
                  disabled={composeProgress !== null || composeBusy}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                  {composeProgress !== null ? `上传 ${composeProgress}%` : "添加附件"}
                </Button>
                {composeProgress !== null && (
                  <Progress value={composeProgress} className="h-1.5 w-32" />
                )}
                {composeSentFlash && (
                  <div className="inline-flex items-center gap-1.5 text-xs text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    已发送给{runtime.leader.name}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={saveDraft} disabled={composeBusy}>
                  {draftSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  存草稿
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={sendCompose}
                  disabled={composeBusy}
                  className="bg-gradient-gold text-primary-foreground hover:opacity-95"
                >
                  {composeSending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                  {composeSending ? "发送中…" : "发送"}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <IncomingCallDialog
        open={callOpen}
        callerName={runtime.leader.name}
        callerRole={runtime.leader.title}
        script={phoneScript}
        onOpenChange={setCallOpen}
        onEnded={handleCallEnded}
      />
    </div>
  );
};

function MessageBubble({
  msg,
  task,
  streaming = false,
  conversationKind,
}: {
  msg: Msg;
  task?: Task;
  streaming?: boolean;
  conversationKind: "leader" | "group" | "hr";
}) {
  if (msg.content.startsWith("[通知]")) {
    const body = msg.content.replace("[通知]", "").trim();
    return (
      <div className="max-w-[85%] rounded-2xl border border-primary/20 bg-white/[0.03] p-4">
        <div className="mb-3 h-0.5 w-16 rounded-full bg-gradient-gold" />
        <div className="text-xs uppercase tracking-wider text-primary">📢 项目组通知</div>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{body}</div>
      </div>
    );
  }

  if (msg.content.startsWith("[FAQ]")) {
    const faqItems = msg.content
      .replace("[FAQ]", "")
      .trim()
      .split(/\n\s*\n/)
      .map((block) => {
        const match = block.match(/Q:\s*(.+)\nA:\s*([\s\S]+)/);
        return match ? { q: match[1], a: match[2] } : null;
      })
      .filter(Boolean) as { q: string; a: string }[];

    return (
      <div className="max-w-[85%] rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4">
        <div className="text-xs uppercase tracking-wider text-fuchsia-300">HR FAQ</div>
// @ts-ignore
// @ts-ignore
        // @ts-ignore
<Accordion type="single" collapsible className="mt-3">
// @ts-ignore
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`faq-${index}`} className="border-white/5">
              <AccordionTrigger className="text-left text-sm hover:text-fuchsia-200 hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-foreground/85">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }

  if (msg.message_type === "system") {
    return <div className="text-center text-[11px] text-muted-foreground">— {msg.content} —</div>;
  }
  const isUser = msg.sender === "user";

  if (msg.message_type === "task" && task) {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-[85%]">
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
          <div className="text-[10px] uppercase tracking-wider text-primary">📌 新任务</div>
          <div className="mt-1 font-display text-base font-semibold">{task.title}</div>
          <p className="mt-1 text-xs text-muted-foreground">{task.brief}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
            <Clock className="h-3 w-3" />
            {formatDeadline(task.deadline_hours)}
          </div>
        </div>
      </motion.div>
    );
  }

  if (msg.message_type === "image" && msg.file_url) {
    return (
      <div className={cn("flex max-w-[85%]", isUser && "ml-auto")}>
        <a href={msg.file_url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-white/10">
          <img src={msg.file_url} alt={msg.file_name ?? "image"} className="max-h-72 max-w-full object-cover" />
        </a>
      </div>
    );
  }

  if (msg.message_type === "file") {
    const isMaterialCard = !isUser && conversationKind === "group";
    const inner = (
      <div
        className={cn(
          "rounded-2xl px-4 py-3",
          isUser
            ? "rounded-tr-sm bg-gradient-gold text-primary-foreground"
            : isMaterialCard
              ? "rounded-tl-sm border border-primary/25 bg-primary/5"
              : "rounded-tl-sm bg-white/5",
        )}
      >
        <div className="flex items-center gap-2 text-sm">
          <Paperclip className={cn("h-4 w-4", isMaterialCard && "text-primary")} />
          <span className="font-medium">{msg.file_name}</span>
          <span className="text-xs opacity-70">{msg.file_size}</span>
          {isMaterialCard && <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary">资料</span>}
        </div>
        {msg.content && <div className="mt-1 text-xs opacity-90">{msg.content}</div>}
        {isMaterialCard && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded bg-background/60 px-2 py-1 text-[11px] text-primary">
            <Download className="h-3 w-3" />
            下载资料
          </div>
        )}
      </div>
    );
    return (
      <div className={cn("flex max-w-[85%]", isUser && "ml-auto")}>
        {msg.file_url ? (
          <a href={msg.file_url} target="_blank" rel="noreferrer" className="hover:opacity-90">{inner}</a>
        ) : inner}
      </div>
    );
  }

  if (msg.message_type === "audio") {
    return (
      <div className={cn("flex max-w-[60%]", isUser && "ml-auto")}>
        <div className={cn("rounded-2xl px-4 py-3", isUser ? "bg-gradient-gold text-primary-foreground" : "bg-white/5")}>
          <div className="flex items-center gap-3">
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-background/40">
              <Phone className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-end gap-1">
              {Array.from({ length: 16 }).map((_, index) => (
                <span
                  key={index}
                  className="w-1 rounded-full bg-current/70"
                  style={{ height: `${8 + ((index * 7) % 18)}px` }}
                />
              ))}
            </div>
            <span className="text-xs opacity-80">{msg.file_size ?? "00:30"}</span>
          </div>
          <div className="mt-2 text-xs opacity-80">{msg.content}</div>
          {msg.file_url && (
            <a
              href={msg.file_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <Download className="h-3 w-3" />
              查看字幕
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={cn("flex max-w-[85%]", isUser && "ml-auto")}>
      <div className={cn(
        "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        isUser ? "rounded-tr-sm bg-gradient-gold text-primary-foreground" : "rounded-tl-sm bg-white/5 text-foreground",
      )}>
        {streaming && !msg.content ? (
          <span className="inline-flex items-center gap-1 text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot [animation-delay:120ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot [animation-delay:240ms]" />
          </span>
        ) : (
          <>
            {msg.content}
            {streaming && <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-primary align-middle" />}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default Workspace;
