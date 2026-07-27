const WORKSPACE_STATE_FILE = 'workspace.json'
const VERSIONS_DIR = 'versions'

const SECTION_LABELS = {
  profile: '个人信息',
  educations: '教育经历',
  skills: '技术栈',
  internships: '实习经历',
  researchExperiences: '科研经历',
  projects: '项目经历',
  studentExperiences: '学生工作',
  customImages: '图片展示',
  awards: '获奖经历',
  certificates: '证书',
  selfSummary: '自我评价',
  theme: '主题样式',
  layout: '栏目布局',
  sectionVisibility: '栏目显隐',
}

const STATS_KEYS = [
  ['educations', '教育'],
  ['internships', '实习'],
  ['researchExperiences', '科研'],
  ['projects', '项目'],
  ['studentExperiences', '学生工作'],
  ['awards', '获奖'],
  ['certificates', '证书'],
]

export function isWorkspaceSupported() {
  return typeof window !== 'undefined' && typeof window.showDirectoryPicker === 'function'
}

export function pickWorkspaceDirectory() {
  return window.showDirectoryPicker({ mode: 'readwrite' })
}

export async function queryWorkspacePermission(handle) {
  if (!handle) return 'denied'
  const permission = await handle.queryPermission({ mode: 'readwrite' })
  return permission
}

export async function requestWorkspacePermission(handle) {
  if (!handle) return 'denied'
  const permission = await handle.requestPermission({ mode: 'readwrite' })
  return permission
}

function formatTimestamp(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  )
}

async function readJsonFile(fileHandle) {
  const file = await fileHandle.getFile()
  const text = await file.text()
  return JSON.parse(text)
}

async function writeJsonFile(dirHandle, name, data) {
  const fileHandle = await dirHandle.getFileHandle(name, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
}

async function getVersionsDir(dirHandle) {
  return dirHandle.getDirectoryHandle(VERSIONS_DIR, { create: true })
}

async function recoverWorkspaceState(dirHandle) {
  // workspace.json 缺失或损坏时，直接从 versions/ 目录扫描重建：
  // HEAD 取最新版本，序号计数器取最大 seq，保证文件夹单独拷贝也能完整恢复。
  const versions = await listVersions(dirHandle)
  return {
    head: versions[0]?.id || null,
    counter: versions.reduce((max, item) => Math.max(max, item.seq), 0),
  }
}

export async function readWorkspaceState(dirHandle) {
  try {
    const fileHandle = await dirHandle.getFileHandle(WORKSPACE_STATE_FILE)
    const state = await readJsonFile(fileHandle)
    return {
      head: typeof state.head === 'string' ? state.head : null,
      counter: Number.isFinite(state.counter) ? state.counter : 0,
    }
  } catch (error) {
    if ((error && error.name === 'NotFoundError') || error instanceof SyntaxError) {
      return recoverWorkspaceState(dirHandle)
    }
    throw error
  }
}

async function writeWorkspaceState(dirHandle, state) {
  await writeJsonFile(dirHandle, WORKSPACE_STATE_FILE, state)
}

export function summarizeStats(resume) {
  const stats = {}
  STATS_KEYS.forEach(([key, label]) => {
    const count = Array.isArray(resume?.[key]) ? resume[key].length : 0
    if (count > 0) stats[label] = count
  })
  return stats
}

export function summarizeChanges(current, base) {
  if (!base) return []
  const changed = []
  Object.keys(SECTION_LABELS).forEach((key) => {
    const before = JSON.stringify(base[key] ?? null)
    const after = JSON.stringify(current[key] ?? null)
    if (before !== after) changed.push(SECTION_LABELS[key])
  })
  return changed
}

export function buildDefaultCommitMessage(changedSections) {
  if (!changedSections.length) return '更新简历内容'
  const shown = changedSections.slice(0, 4)
  const suffix = changedSections.length > shown.length ? ' 等' : ''
  return `更新 ${shown.join('、')}${suffix}`
}

export async function listVersions(dirHandle) {
  const versionsDir = await getVersionsDir(dirHandle)
  const versions = []
  for await (const entry of versionsDir.values()) {
    if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue
    try {
      const record = await readJsonFile(entry)
      if (!record || typeof record.id !== 'string') continue
      versions.push({
        id: record.id,
        seq: Number.isFinite(record.seq) ? record.seq : 0,
        message: String(record.message || ''),
        createdAt: String(record.createdAt || ''),
        parentId: typeof record.parentId === 'string' ? record.parentId : null,
        stats: record.stats && typeof record.stats === 'object' ? record.stats : {},
      })
    } catch (error) {
      console.warn('Skip unreadable version file:', entry.name, error)
    }
  }
  versions.sort((a, b) => b.seq - a.seq || b.createdAt.localeCompare(a.createdAt))
  return versions
}

export async function commitVersion(dirHandle, resume, message) {
  const state = await readWorkspaceState(dirHandle)
  const seq = state.counter + 1
  const createdAt = new Date()
  const id = `${String(seq).padStart(4, '0')}-${formatTimestamp(createdAt)}`
  const record = {
    id,
    seq,
    message: String(message || '').trim() || '更新简历内容',
    createdAt: createdAt.toISOString(),
    parentId: state.head,
    stats: summarizeStats(resume),
    resume,
  }

  const versionsDir = await getVersionsDir(dirHandle)
  await writeJsonFile(versionsDir, `${id}.json`, record)
  await writeWorkspaceState(dirHandle, { head: id, counter: seq })

  const { resume: _resume, ...meta } = record
  return meta
}

export async function readVersion(dirHandle, versionId) {
  const versionsDir = await getVersionsDir(dirHandle)
  const fileHandle = await versionsDir.getFileHandle(`${versionId}.json`)
  return readJsonFile(fileHandle)
}

export async function readHeadResume(dirHandle) {
  const state = await readWorkspaceState(dirHandle)
  if (!state.head) return null
  try {
    const record = await readVersion(dirHandle, state.head)
    return record?.resume || null
  } catch (error) {
    console.warn('Read head version failed:', error)
    return null
  }
}

export async function deleteVersion(dirHandle, versionId) {
  const versionsDir = await getVersionsDir(dirHandle)
  let record = null
  try {
    record = await readVersion(dirHandle, versionId)
  } catch (error) {
    if (!error || error.name !== 'NotFoundError') throw error
  }

  await versionsDir.removeEntry(`${versionId}.json`)

  const state = await readWorkspaceState(dirHandle)
  if (state.head === versionId) {
    const remaining = await listVersions(dirHandle)
    const fallback = record?.parentId && remaining.some((item) => item.id === record.parentId)
      ? record.parentId
      : remaining[0]?.id || null
    await writeWorkspaceState(dirHandle, { head: fallback, counter: state.counter })
  }
}

export async function moveHead(dirHandle, versionId) {
  const state = await readWorkspaceState(dirHandle)
  await writeWorkspaceState(dirHandle, { head: versionId, counter: state.counter })
}
