import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./lib/auth";
import { Toaster } from "sonner";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OfferLetter from "./pages/OfferLetter";
import Workspace from "./pages/Workspace";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { supabasePublicConfig } from "./integrations/supabase/client";

const queryClient = new QueryClient();

function ConfigErrorScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[hsl(var(--background))] px-5 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,168,76,0.16),transparent_24%),radial-gradient(circle_at_80%_16%,rgba(84,131,255,0.14),transparent_26%),linear-gradient(180deg,#081322_0%,#0a1628_50%,#0b1930_100%)]" />
      <div className="glass-strong relative w-full max-w-3xl rounded-[32px] border border-white/10 p-8 shadow-[0_30px_80px_rgba(5,12,23,0.45)]">
        <div className="text-xs uppercase tracking-[0.24em] text-primary">Configuration Required</div>
        <h1 className="mt-4 font-display text-4xl text-white">Supabase 公共环境变量还没配完整</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          当前应用没有成功拿到有效的 Supabase 公共配置，所以 React 根应用不会继续初始化。
          这时我们直接显示配置错误页，而不是让首页整页空白。
        </p>

        <div className="mt-8 rounded-[28px] border border-primary/20 bg-primary/10 p-5">
          <div className="text-sm font-medium text-white">当前检测到的问题</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {supabasePublicConfig.issues.map((issue) => (
              <li key={issue}>• {issue}</li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-sm font-medium text-white">Vercel 里至少要填</div>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <div><code className="rounded bg-black/20 px-2 py-1 text-primary">VITE_SUPABASE_URL</code></div>
              <div><code className="rounded bg-black/20 px-2 py-1 text-primary">VITE_SUPABASE_PUBLISHABLE_KEY</code></div>
            </div>
          </div>
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <div className="text-sm font-medium text-white">补完后别忘了</div>
            <div className="mt-3 text-sm leading-7 text-slate-300">
              在 Vercel 里重新触发一次 Redeploy，让新的环境变量真正进入生产构建。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><span className="text-gray-400 text-sm">加载中…</span></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/simulation/:id/offer" element={<ProtectedRoute><OfferLetter /></ProtectedRoute>} />
        <Route path="/simulation/:id" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </BrowserRouter>
  );
}

export default function App() {
  if (!supabasePublicConfig.ok) {
    return <ConfigErrorScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}
