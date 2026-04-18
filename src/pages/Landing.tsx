import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-4 border-b">
        <span className="text-lg font-bold text-gray-900">入行 RuHang</span>
        <div className="flex gap-4">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">登录</Link>
          <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700">注册</Link>
        </div>
      </nav>
      <main className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">沉浸式金融岗位模拟</h1>
        <p className="text-xl text-gray-500 mb-8 max-w-xl">像真的在金融机构上班一样完成任务，获得反馈，积累经验。</p>
        <div className="flex gap-4">
          <Link to="/register" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700">免费开始</Link>
          <Link to="/login" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50">已有账号</Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 text-left max-w-3xl">
          {[
            { title: "卖方投行", desc: "模拟 IPO 项目、财务尽调、招股书撰写" },
            { title: "PE/VC 投资", desc: "商业模式拆解、尽调纪要、投委会准备" },
            { title: "二级行研", desc: "赛道研究、盈利预测、深度研报输出" },
          ].map(t => (
            <div key={t.title} className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{t.title}</h3>
              <p className="text-sm text-gray-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
