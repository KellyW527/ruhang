import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">重置密码</h1>
          <p className="text-sm text-gray-500 mt-1">输入注册邮箱，我们会发送重置链接</p>
        </div>
        {sent ? (
          <div className="text-center space-y-3">
            <p className="text-green-600 text-sm">邮件已发送，请查收收件箱</p>
            <Link to="/login" className="text-blue-600 hover:underline text-sm">返回登录</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? "发送中…" : "发送重置邮件"}
            </button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">返回登录</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
