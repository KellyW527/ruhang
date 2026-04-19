export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface-1/40 py-12">
      <div className="container mx-auto grid grid-cols-2 gap-10 px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-gold font-display text-xs font-bold text-primary-foreground">
              入
            </div>
            <span className="font-display text-base font-semibold">入行</span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            重塑金融人才培养方式 — 在真实场景里学习，在真实工作中成长。
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-medium text-foreground">产品</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><a href="/pricing" className="hover:text-foreground">定价</a></li>
            <li><a href="/#how" className="hover:text-foreground">运作方式</a></li>
            <li><span className="opacity-60">能力报告（即将上线）</span></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-medium text-foreground">资源</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><span className="opacity-60">学员案例</span></li>
            <li><span className="opacity-60">行业指南</span></li>
            <li><span className="opacity-60">面试题库</span></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-medium text-foreground">联系</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>3165784931@qq.com</li>
            <li className="opacity-60">商务合作(即将开放)</li>
            <li className="opacity-60">校园大使计划(即将开放)</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-10 border-t border-white/5 px-6 pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} 入行 RuHang · 仅供学习交流，不构成投资建议
      </div>
    </footer>
  );
}
