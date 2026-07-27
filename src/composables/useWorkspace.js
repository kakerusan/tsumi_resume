import { computed, ref } from 'vue'
import {
  clearWorkspaceHandle,
  loadWorkspaceHandle,
  saveWorkspaceHandle,
} from '../modules/resume/storage'
import {
  buildDefaultCommitMessage,
  commitVersion,
  deleteVersion,
  isWorkspaceSupported,
  listVersions,
  moveHead,
  pickWorkspaceDirectory,
  queryWorkspacePermission,
  readHeadResume,
  readVersion,
  readWorkspaceState,
  requestWorkspacePermission,
  summarizeChanges,
} from '../modules/resume/workspace'

export function useWorkspace({ getResumeSnapshot, onRestore, onStatus, onError } = {}) {
  const status = ref(isWorkspaceSupported() ? 'disconnected' : 'unsupported')
  const workspaceName = ref('')
  const versions = ref([])
  const headId = ref(null)
  const headResume = ref(null)
  const busy = ref(false)

  let dirHandle = null

  const connected = computed(() => status.value === 'connected')

  function reportStatus(message) {
    if (typeof onStatus === 'function') onStatus(message)
  }

  function reportError(message) {
    if (typeof onError === 'function') onError(message)
  }

  function isAbort(error) {
    return error && error.name === 'AbortError'
  }

  async function refresh() {
    if (!dirHandle) return
    const [state, list, headData] = await Promise.all([
      readWorkspaceState(dirHandle),
      listVersions(dirHandle),
      readHeadResume(dirHandle),
    ])
    headId.value = state.head
    versions.value = list
    headResume.value = headData
  }

  async function activate(handle) {
    dirHandle = handle
    workspaceName.value = handle.name || ''
    status.value = 'connected'
    await refresh()
  }

  async function connect() {
    if (!isWorkspaceSupported()) {
      reportError('当前浏览器不支持本地文件夹工作区，请使用最新版 Chrome 或 Edge。')
      return
    }

    busy.value = true
    try {
      const handle = await pickWorkspaceDirectory()
      await saveWorkspaceHandle(handle)
      await activate(handle)
      reportStatus(`已连接工作区文件夹「${workspaceName.value}」。`)
    } catch (error) {
      if (!isAbort(error)) {
        console.error('Connect workspace failed:', error)
        reportError('连接工作区失败，请重试。')
      }
    } finally {
      busy.value = false
    }
  }

  async function reconnect() {
    busy.value = true
    try {
      const handle = await loadWorkspaceHandle()
      if (!handle) {
        status.value = 'disconnected'
        return
      }
      const permission = await requestWorkspacePermission(handle)
      if (permission !== 'granted') {
        reportError('未获得工作区文件夹的读写权限。')
        return
      }
      await activate(handle)
      reportStatus(`已重新连接工作区文件夹「${workspaceName.value}」。`)
    } catch (error) {
      console.error('Reconnect workspace failed:', error)
      reportError('重新连接工作区失败，请重新选择文件夹。')
      status.value = 'disconnected'
    } finally {
      busy.value = false
    }
  }

  async function disconnect() {
    dirHandle = null
    workspaceName.value = ''
    versions.value = []
    headId.value = null
    headResume.value = null
    status.value = isWorkspaceSupported() ? 'disconnected' : 'unsupported'
    await clearWorkspaceHandle()
    reportStatus('已断开工作区，版本文件仍保留在原文件夹中。')
  }

  function suggestCommitMessage() {
    if (typeof getResumeSnapshot !== 'function') return '更新简历内容'
    const changed = summarizeChanges(getResumeSnapshot(), headResume.value)
    return buildDefaultCommitMessage(changed)
  }

  async function commit(message) {
    if (!connected.value || typeof getResumeSnapshot !== 'function') return null
    busy.value = true
    try {
      const record = await commitVersion(dirHandle, getResumeSnapshot(), message)
      await refresh()
      reportStatus(`已提交版本 #${String(record.seq).padStart(4, '0')}：${record.message}`)
      return record
    } catch (error) {
      console.error('Commit version failed:', error)
      reportError('提交版本失败，请检查工作区文件夹是否可写。')
      return null
    } finally {
      busy.value = false
    }
  }

  async function restore(versionId) {
    if (!connected.value || typeof onRestore !== 'function') return
    busy.value = true
    try {
      const record = await readVersion(dirHandle, versionId)
      if (!record || !record.resume) throw new Error('VERSION_EMPTY')
      onRestore(record.resume)
      await moveHead(dirHandle, versionId)
      await refresh()
      reportStatus(`已回滚到版本 #${String(record.seq).padStart(4, '0')}：${record.message}`)
    } catch (error) {
      console.error('Restore version failed:', error)
      reportError('回滚版本失败，请重试。')
    } finally {
      busy.value = false
    }
  }

  async function remove(versionId) {
    if (!connected.value) return
    busy.value = true
    try {
      await deleteVersion(dirHandle, versionId)
      await refresh()
      reportStatus('已删除该版本。')
    } catch (error) {
      console.error('Delete version failed:', error)
      reportError('删除版本失败，请重试。')
    } finally {
      busy.value = false
    }
  }

  async function bootstrap() {
    if (!isWorkspaceSupported()) return
    const handle = await loadWorkspaceHandle()
    if (!handle) return

    workspaceName.value = handle.name || ''
    try {
      const permission = await queryWorkspacePermission(handle)
      if (permission === 'granted') {
        await activate(handle)
      } else {
        status.value = 'needs-permission'
      }
    } catch (error) {
      console.error('Bootstrap workspace failed:', error)
      status.value = 'needs-permission'
    }
  }

  return {
    status,
    workspaceName,
    versions,
    headId,
    busy,
    connected,
    bootstrap,
    connect,
    reconnect,
    disconnect,
    suggestCommitMessage,
    commit,
    restore,
    remove,
    refresh,
  }
}
