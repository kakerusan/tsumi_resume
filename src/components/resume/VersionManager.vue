<script setup>
import { ref, watch } from 'vue'
import { Dialog } from 'tdesign-vue-next'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  workspace: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:visible'])

const commitMessage = ref('')
const confirmState = ref({
  visible: false,
  type: '',
  version: null,
})
const confirmLoading = ref(false)

function close() {
  emit('update:visible', false)
}

function formatTime(iso) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-CN', { hour12: false })
}

function formatSeq(seq) {
  return `#${String(seq).padStart(4, '0')}`
}

function formatStats(stats) {
  const entries = Object.entries(stats || {})
  if (!entries.length) return ''
  return entries.map(([label, count]) => `${label}×${count}`).join(' · ')
}

function requestConfirm(type, version) {
  confirmState.value = { visible: true, type, version }
}

function closeConfirm() {
  if (confirmLoading.value) return
  confirmState.value.visible = false
}

async function confirmAction() {
  const { type, version } = confirmState.value
  if (!version) return
  confirmLoading.value = true
  try {
    if (type === 'restore') {
      await props.workspace.restore(version.id)
    } else if (type === 'remove') {
      await props.workspace.remove(version.id)
    }
    confirmState.value.visible = false
  } finally {
    confirmLoading.value = false
  }
}

async function submitCommit() {
  const record = await props.workspace.commit(commitMessage.value)
  if (record) commitMessage.value = ''
}

watch(
  () => props.visible,
  (visible) => {
    if (visible && props.workspace.connected.value) {
      commitMessage.value = props.workspace.suggestCommitMessage()
    }
  }
)
</script>

<template>
  <Dialog
    :visible="visible"
    header="版本管理"
    placement="center"
    width="640px"
    destroy-on-close
    :footer="false"
    @close="close"
  >
    <div class="version-manager">
      <div v-if="workspace.status.value === 'unsupported'" class="version-manager__notice">
        当前浏览器不支持本地文件夹工作区，请使用最新版 Chrome 或 Edge 打开本页面。
      </div>

      <div v-else-if="!workspace.connected.value" class="version-manager__connect">
        <p class="version-manager__hint">
          选择一个本地文件夹作为工作区，简历的每个版本都会以 JSON 文件保存在里面，像 git 历史一样可以查看和回滚。
        </p>
        <div class="version-manager__connect-actions">
          <button
            v-if="workspace.status.value === 'needs-permission'"
            type="button"
            class="toolbar-btn toolbar-btn-primary"
            :disabled="workspace.busy.value"
            @click="workspace.reconnect()"
          >
            重新连接「{{ workspace.workspaceName.value }}」
          </button>
          <button
            type="button"
            class="toolbar-btn"
            :disabled="workspace.busy.value"
            @click="workspace.connect()"
          >
            选择工作区文件夹
          </button>
        </div>
      </div>

      <template v-else>
        <div class="version-manager__bar">
          <span class="version-manager__folder" :title="workspace.workspaceName.value">
            工作区：{{ workspace.workspaceName.value }}
          </span>
          <button
            type="button"
            class="version-manager__link"
            :disabled="workspace.busy.value"
            @click="workspace.disconnect()"
          >
            断开连接
          </button>
        </div>

        <div class="version-manager__commit">
          <input
            v-model="commitMessage"
            type="text"
            class="field-input version-manager__commit-input"
            placeholder="提交信息（如：更新 项目经历、自我评价）"
            @keyup.enter="submitCommit"
          />
          <button
            type="button"
            class="toolbar-btn toolbar-btn-primary"
            :disabled="workspace.busy.value"
            @click="submitCommit"
          >
            提交版本
          </button>
        </div>

        <ul v-if="workspace.versions.value.length" class="version-manager__list">
          <li
            v-for="version in workspace.versions.value"
            :key="version.id"
            class="version-manager__item"
            :class="{ 'version-manager__item--head': version.id === workspace.headId.value }"
          >
            <div class="version-manager__item-main">
              <div class="version-manager__item-title">
                <span class="version-manager__seq">{{ formatSeq(version.seq) }}</span>
                <span class="version-manager__message">{{ version.message }}</span>
                <span v-if="version.id === workspace.headId.value" class="version-manager__head-tag">HEAD</span>
              </div>
              <div class="version-manager__item-meta">
                <span>{{ formatTime(version.createdAt) }}</span>
                <span v-if="formatStats(version.stats)">{{ formatStats(version.stats) }}</span>
              </div>
            </div>
            <div class="version-manager__item-actions">
              <button
                v-if="version.id !== workspace.headId.value"
                type="button"
                class="version-manager__link"
                :disabled="workspace.busy.value"
                @click="requestConfirm('restore', version)"
              >
                回滚
              </button>
              <button
                type="button"
                class="version-manager__link version-manager__link--danger"
                :disabled="workspace.busy.value"
                @click="requestConfirm('remove', version)"
              >
                删除
              </button>
            </div>
          </li>
        </ul>
        <p v-else class="version-manager__empty">还没有版本。点击「提交版本」保存第一份快照。</p>
      </template>
    </div>

    <Dialog
      v-model:visible="confirmState.visible"
      :header="confirmState.type === 'restore' ? '确认回滚到该版本' : '确认删除该版本'"
      placement="center"
      width="440px"
      destroy-on-close
      :close-on-overlay-click="!confirmLoading"
      :close-on-esc-keydown="!confirmLoading"
      :confirm-btn="{
        content: confirmState.type === 'restore' ? '确认回滚' : '确认删除',
        theme: confirmState.type === 'restore' ? 'primary' : 'danger',
        loading: confirmLoading,
      }"
      :cancel-btn="{ content: '取消', disabled: confirmLoading }"
      @confirm="confirmAction"
      @close="closeConfirm"
      @cancel="closeConfirm"
    >
      <div v-if="confirmState.version" class="space-y-2 text-[15px] leading-7 text-slate-700">
        <p>
          {{ formatSeq(confirmState.version.seq) }} · {{ confirmState.version.message }}
        </p>
        <p v-if="confirmState.type === 'restore'" class="text-slate-500">
          当前编辑内容会被该版本覆盖（浏览器草稿也会随之更新），之后的新提交将基于该版本。
        </p>
        <p v-else class="text-slate-500">删除后该版本文件将从工作区文件夹中移除，无法恢复。</p>
      </div>
    </Dialog>
  </Dialog>
</template>

<style scoped>
.version-manager { display: grid; gap: 14px; font-size: 13px; color: #334155; }
.version-manager__notice { border: 1px solid #fde68a; border-radius: 10px; background: #fffbeb; padding: 12px 14px; color: #92400e; }
.version-manager__connect { display: grid; gap: 12px; }
.version-manager__hint { margin: 0; line-height: 1.7; color: #64748b; }
.version-manager__connect-actions { display: flex; flex-wrap: wrap; gap: 9px; }
.version-manager__bar { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.version-manager__folder { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; color: #17243a; }
.version-manager__commit { display: flex; gap: 9px; }
.version-manager__commit-input { flex: 1; }
.version-manager__list { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; max-height: 320px; overflow-y: auto; }
.version-manager__item { display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; }
.version-manager__item--head { border-color: var(--brand, #4a9fff); background: #f0f7ff; }
.version-manager__item-main { min-width: 0; }
.version-manager__item-title { display: flex; align-items: center; gap: 8px; }
.version-manager__seq { font-family: ui-monospace, monospace; font-size: 12px; color: #64748b; }
.version-manager__message { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; color: #17243a; }
.version-manager__head-tag { border-radius: 999px; background: var(--brand, #4a9fff); padding: 1px 8px; font-size: 10px; font-weight: 700; letter-spacing: .08em; color: #fff; }
.version-manager__item-meta { display: flex; gap: 10px; margin-top: 3px; font-size: 12px; color: #94a3b8; }
.version-manager__item-actions { display: flex; flex-shrink: 0; gap: 10px; }
.version-manager__link { font-size: 12px; color: #3180b5; }
.version-manager__link:hover { text-decoration: underline; }
.version-manager__link:disabled { color: #cbd5e1; text-decoration: none; cursor: not-allowed; }
.version-manager__link--danger { color: #e11d48; }
.version-manager__empty { margin: 0; padding: 18px 0; text-align: center; color: #94a3b8; }
</style>
