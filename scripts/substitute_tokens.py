#!/usr/bin/env python3
# 把秒哒/飞书 APAAS 平台在部署时才注入的 {{...}} 模板变量，
# 替换为「独立部署到 CloudBase 根路径」所需的真实值。
# 这是 CloudBase 手动部署必须的桥接步骤（平台侧注入被跳过）。
import io
import sys

PATH = sys.argv[1]

with io.open(PATH, encoding="utf-8") as f:
    html = f.read()

# 注意：三重括号 {{{appAvatar}}} 必须优先于双重括号替换
# 全部使用相对路径，支持部署到 CloudBase 任意子路径（如 /toolbox/）
REPL = {
    "{{{appAvatar}}}": "favicon.svg",
    "{{appAvatar}}": "favicon.svg",
    "{{basename}}": "",  # 空串 -> 应用代码 `window.__BASENAME__ || "/"` 解析为 "/"
    "{{appName}}": "工具广场",
    "{{appDescription}}": "精选实用小工具，一键即用。",
    "{{appId}}": "",
    "{{userId}}": "",
    "{{tenantId}}": "",
    "{{userName}}": "",
    "{{csrfToken}}": "",
    "{{environment}}": "online",
}

for k, v in REPL.items():
    html = html.replace(k, v)

with io.open(PATH, "w", encoding="utf-8") as f:
    f.write(html)

print("substituted miaoda tokens in", PATH)
