import { memo } from 'react';

function isImageIcon(icon: string): boolean {
  if (/^https?:\/\//.test(icon)) return true;
  if (icon.startsWith('/') || icon.startsWith('./')) return true;
  if (icon.startsWith('data:')) return true;
  // 本地图片目录相对路径(logos/、assets/ 等)
  if (/\.(webp|png|jpe?g|gif|svg)(\?.*)?$/i.test(icon)) return true;
  return false;
}

interface ToolIconProps {
  icon: string;
  className?: string;
}

/**
 * 统一渲染工具/分类图标。
 * - 图片 URL（logos/xxx.webp、http(s)://、data:）→ <img>
 * - 其它（emoji 或文字）→ <span>
 * 兼容旧数据（emoji 字符串）与用户自定义工具。
 */
export function ToolIcon({ icon, className }: ToolIconProps) {
  if (isImageIcon(icon)) {
    return (
      <img
        src={icon}
        alt=""
        draggable={false}
        className={className ?? 'size-full object-contain'}
        loading="lazy"
      />
    );
  }
  return <span className={className}>{icon}</span>;
}

export default memo(ToolIcon);
