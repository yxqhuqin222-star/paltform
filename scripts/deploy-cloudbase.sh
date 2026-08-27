#!/bin/bash
# 一键部署到 CloudBase 静态托管（独立部署，不依赖秒哒平台注入）
# 流程：build -> 替换模板占位符 -> 合并产物 -> tcb hosting deploy /app/paltform
# 注意：本环境 (xiaoqin-d0g0prppaa09e675e) 的根目录 / 已被 renxiao 占用，
# paltform 必须部署到 /app/paltform 子目录，避免互相覆盖。
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$ROOT/.deploy-dist"
ENV="${CLOUDBASE_ENV_ID:-xiaoqin-d0g0prppaa09e675e}"
TCB="$(command -v tcb || echo /Users/kityhello/.workbuddy/binaries/node/cli-connector-packages/bin/tcb)"

# 秒哒 preset 默认把 MIAODA_APP_ID 转成 /app/<id> 作为 basename；
# 我们前端改用 HashRouter，不需要 basename，因此只把资源改为相对路径，
# 这样部署到 /app/paltform 子目录后，assets 会从 /app/paltform/assets/ 加载。
export MIAODA_RESOURCE_CDN_PREFIX="./"

echo "==> 1/4 build"
npm run build

echo "==> 2/4 substitute miaoda template tokens (standalone CloudBase values)"
python3 "$ROOT/scripts/substitute_tokens.py" "$ROOT/dist/output/index.html"

echo "==> 3/4 assemble $DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR/assets"
cp "$ROOT/dist/output/index.html" "$DEPLOY_DIR/"
[ -d "$ROOT/dist/output_resource/assets" ] && cp -r "$ROOT/dist/output_resource/assets/." "$DEPLOY_DIR/assets/"
[ -d "$ROOT/public" ] && cp -r "$ROOT/public/." "$DEPLOY_DIR/"
[ -d "$ROOT/dist/output_static" ] && cp -r "$ROOT/dist/output_static/." "$DEPLOY_DIR/" 2>/dev/null || true

echo "==> 4/4 deploy to CloudBase sub-path /app/paltform (env=$ENV)"
"$TCB" hosting deploy "$DEPLOY_DIR" /app/paltform -e "$ENV"

echo "==> done -> https://$ENV-1303050076.tcloudbaseapp.com/app/paltform/"
