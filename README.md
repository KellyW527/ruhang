# 入行 RuHang

`codex_clean` 是当前唯一正式开发基线。

## 正式基线

- 本地目录：`/Users/wangyiping/Desktop/codex_clean`
- GitHub：`KellyW527/RuHang-Clean`
- Vercel：`ru-hang-clean`

## 前端环境变量

正式前端变量只保留这两个：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

为了兼容旧环境，代码仍然支持：

- `VITE_SUPABASE_ANON_KEY`

但它只作为过渡 fallback，不应继续作为正式标准。

## 本地启动

```bash
npm install
cp .env.example .env
npm run build
npm run test
npm run dev
```

## 空白页排查

如果部署后看到“只有背景、没有任何文字”，优先检查：

1. Vercel 是否配置了：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
2. 修改环境变量后是否重新触发了 redeploy
3. 是否把 `VITE_SUPABASE_URL` 写错成了 `https://https://...`

当前代码在 Supabase 配置缺失时会显示明确错误页，而不是继续空白。
