import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("注册成功，请查收验证邮件");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">注册</h1>
          <p className="text-sm text-gray-500 mt-1">加入入行 RuHang，开始你的金融模拟实习</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="至少 8 位" required minLength={8} />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "注册中…" : "注册"}
          </button>
        </form>
        <div className="text-center text-sm text-gray-500">
          已有账号？<Link to="/login" className="text-blue-600 hover:underline">登录</Link>
        </div>
      </div>
    </div>
  );
}
