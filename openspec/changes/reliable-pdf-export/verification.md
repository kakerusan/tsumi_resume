验证：npm run build；openspec validate reliable-pdf-export --no-interactive；git diff --check。
使用隔离 Chrome CDP :9333 和 Vite :5173，运行 node scripts/verify-pdf.mjs。
长简历输出 4 页 A4；pdftotext 确认 18 个项目尾标记和中文保留；逐页渲染检查无裁切或重叠。图片失败、重试、超时检查通过。
限制：连续屏幕预览不模拟精确打印断点；浏览器分页可拆分条目，最终断点应在打印预览中检查。没有宣称跨浏览器或 ATS 认证。
