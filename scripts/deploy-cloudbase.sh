#!/bin/bash
# 一键部署旧 CloudBase 地址迁移提示页。
# 旧地址：/app/paltform
# 新地址：https://yxqhuqin222-star.github.io/paltform/#/
# 注意：本环境 (xiaoqin-d0g0prppaa09e675e) 的根目录 / 已被 renxiao 占用，
# paltform 只部署到 /app/paltform 子目录，避免互相覆盖。
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$ROOT/.deploy-dist"
ENV="${CLOUDBASE_ENV_ID:-xiaoqin-d0g0prppaa09e675e}"
TCB="$(command -v tcb || echo /Users/kityhello/.workbuddy/binaries/node/cli-connector-packages/bin/tcb)"
NEW_URL="https://yxqhuqin222-star.github.io/paltform/#/"
OLD_PATH="/app/paltform"

echo "==> 1/2 assemble migration notice $DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"
cat > "$DEPLOY_DIR/index.html" <<HTML
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="6;url=$NEW_URL" />
    <title>小工具集合平台已迁移</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f8fafc;
        --card: #ffffff;
        --text: #1e293b;
        --muted: #64748b;
        --primary: #3b82f6;
        --primary-hover: #2563eb;
        --border: #dbe4f0;
        --accent: #eff6ff;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px 16px;
        background:
          radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 32rem),
          var(--bg);
        color: var(--text);
        font-family: "Noto Sans SC", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      main {
        width: min(100%, 560px);
        padding: 32px;
        border: 1px solid var(--border);
        border-radius: 20px;
        background: var(--card);
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        background: var(--accent);
        color: var(--primary);
        font-size: 14px;
        font-weight: 600;
      }

      h1 {
        margin: 20px 0 12px;
        font-size: clamp(28px, 5vw, 40px);
        line-height: 1.2;
        letter-spacing: -0.03em;
      }

      p {
        margin: 0;
        color: var(--muted);
        font-size: 16px;
        line-height: 1.8;
      }

      .url {
        margin: 20px 0 24px;
        padding: 12px 14px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: #f8fafc;
        color: var(--text);
        font-size: 14px;
        line-height: 1.6;
        overflow-wrap: anywhere;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      a.button {
        display: inline-flex;
        min-height: 44px;
        align-items: center;
        justify-content: center;
        padding: 0 18px;
        border-radius: 10px;
        background: var(--primary);
        color: #fff;
        text-decoration: none;
        font-weight: 600;
        transition: background 160ms ease-out, transform 160ms ease-out;
      }

      a.button:hover {
        background: var(--primary-hover);
        transform: translateY(-1px);
      }

      .hint {
        color: var(--muted);
        font-size: 13px;
      }

      @media (max-width: 520px) {
        main {
          padding: 24px;
          border-radius: 16px;
        }
      }
    </style>
    <script>
      window.setTimeout(function () {
        window.location.replace("$NEW_URL");
      }, 6000);
    </script>
  </head>
  <body>
    <main>
      <span class="badge">🔗 地址已迁移</span>
      <h1>小工具集合平台已搬到新网址</h1>
      <p>你现在访问的是旧地址。请使用下面的新网址继续访问，页面也会在 6 秒后自动跳转。</p>
      <div class="url">$NEW_URL</div>
      <div class="actions">
        <a class="button" href="$NEW_URL">打开新网站</a>
        <span class="hint">建议把书签更新为新地址。</span>
      </div>
    </main>
  </body>
</html>
HTML

echo "==> 2/2 deploy migration notice to CloudBase sub-path $OLD_PATH (env=$ENV)"
"$TCB" hosting deploy "$DEPLOY_DIR" "$OLD_PATH" -e "$ENV"

echo "==> done -> https://$ENV-1303050076.tcloudbaseapp.com$OLD_PATH/"
