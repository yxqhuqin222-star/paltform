import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AppContainer, ErrorRender } from "@lark-apaas/client-toolkit-lite";
import App from "./app";
import "./index.css";

// 运行时移除秒搭/妙搭注入的水印和推广卡片（它们使用 shadow DOM，仅靠 CSS 无法隐藏）
(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const MIAODA_MARKERS = [
    "doubao-watermark",
    "doubao-watermark-mobile",
    "safety-report",
    "safety-close",
    "safety-more",
  ];

  const MIAODA_TEXTS = [
    "由妙搭搭建",
    "由飞书妙搭提供支持",
    "豆包 AI 生成",
    "飞书妙搭",
    "让灵感即刻可用",
    "包含 AI 生成内容",
    "投诉与举报",
    "不再展示",
    "了解更多",
  ];

  const isMiaodaNode = (node: Node): boolean => {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === "doubao-watermark") return true;
    const custom = el.getAttribute("data-custom-element") || "";
    if (MIAODA_MARKERS.includes(custom)) return true;
    const text = el.textContent || "";
    if (MIAODA_TEXTS.some((t) => text.includes(t))) return true;
    return false;
  };

  const removeMiaodaNodes = () => {
    // 1) 直接移除已知 host/标记元素
    document.querySelectorAll("doubao-watermark").forEach((el) => el.remove());
    MIAODA_MARKERS.forEach((marker) => {
      document.querySelectorAll(`[data-custom-element="${marker}"]`).forEach((el) => {
        let target: Element | null = el;
        // 推广卡片通常包裹在 Popover/Portal 的父 div 中，向上回溯到固定定位或 body 直接子元素
        while (target && target.parentElement && target.parentElement !== document.body) {
          const style = window.getComputedStyle(target.parentElement);
          if (style.position === "fixed" || target.parentElement === document.body) break;
          target = target.parentElement;
        }
        target?.remove();
      });
    });
    // 2) 扫描 body 下所有固定/绝对定位元素，按文本内容移除
    document.body.querySelectorAll("*").forEach((el) => {
      if (isMiaodaNode(el)) {
        const style = window.getComputedStyle(el);
        if (style.position === "fixed" || style.position === "absolute" || style.position === "sticky") {
          el.remove();
        }
      }
    });
  };

  // 初始清理 + DOM 变化监听
  removeMiaodaNodes();
  const observer = new MutationObserver((mutations) => {
    let shouldClean = false;
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (isMiaodaNode(node)) {
          shouldClean = true;
          break;
        }
      }
      if (shouldClean) break;
    }
    if (shouldClean) removeMiaodaNodes();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  // 部分节点是延迟注入的，定时再扫几次
  [500, 1500, 3000, 6000].forEach((delay) => setTimeout(removeMiaodaNodes, delay));
})();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <AppContainer>
        <ErrorBoundary
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorRender error={error} resetErrorBoundary={resetErrorBoundary} />
          )}
        >
          <App />
        </ErrorBoundary>
      </AppContainer>
    </HashRouter>
  </StrictMode>,
);
