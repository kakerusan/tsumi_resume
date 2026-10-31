// Resource readiness is bounded so broken assets never leave export stuck.
export async function waitForPrintResources(root, timeoutMs = 15000) {
  if (!root) throw new Error('简历预览尚未就绪，请稍后重试。')
  let timeout
  try {
    const resources = Promise.all([
      document.fonts?.ready,
      ...Array.from(root.querySelectorAll('img'), async (image) => {
        try {
          await image.decode()
          if (!image.naturalWidth) throw new Error('Empty image')
        } catch {
          throw new Error('有图片未能加载，请重新上传或移除后重试。')
        }
      }),
    ])
    await Promise.race([
      resources,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('字体或图片加载超时，请检查网络后重试。')), timeoutMs)
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
}
