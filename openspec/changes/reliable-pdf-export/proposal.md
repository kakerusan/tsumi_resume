## Why
固定 A4 高度和 overflow:hidden 会截断长简历，导出未等待字体及图片就绪。

## What Changes
- 保留完整预览，支持自然多页打印及每页边距。
- 导出等待字体和图片，失败反馈并支持重试。
- 一页适配优先收缩间距，再调整文字。
- 明确屏幕连续预览与浏览器打印分页的区别。

## Capabilities
### New Capabilities
- `resume-pdf-export`: 完整的多页打印、资源预检及适配策略。
### Modified Capabilities
无。

## Impact
预览样式、导出模块、useResumeBuilder 和提示文案。沿用浏览器打印，无新运行依赖。
