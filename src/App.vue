<script setup>
import { reactive, watch } from 'vue'
import ResumeEditor from './components/resume/ResumeEditor.vue'
import ResumePreview from './components/resume/ResumePreview.vue'
import ResumeToolbar from './components/resume/ResumeToolbar.vue'
import { useResumeBuilder } from './composables/useResumeBuilder'

const {
  resume,
  panels,
  photoUploadMessage,
  photoUploadError,
  educationLogoFeedback,
  jsonStatusMessage,
  jsonErrorMessage,
  actionStatusMessage,
  actionErrorMessage,
  exportWarningMessage,
  jsonInputRef,
  pageOverflow,
  pageHeight,
  brandStyle,
  togglePanel,
  expandAllPanels,
  collapseAllPanels,
  loadDemo,
  clearAll,
  saveDraft,
  restoreDraft,
  exportPdf,
  exportImage,
  exportJson,
  triggerJsonImport,
  handleJsonImport,
  addEducation,
  removeEducation,
  toggleEducationHidden,
  moveEducationUp,
  moveEducationDown,
  onEducationLogoChange,
  removeEducationLogo,
  addInternship,
  removeInternship,
  toggleInternshipHidden,
  moveInternshipUp,
  moveInternshipDown,
  onLogoChange,
  removeLogo,
  addProject,
  removeProject,
  toggleProjectHidden,
  moveProjectUp,
  moveProjectDown,
  addAward,
  removeAward,
  toggleAwardHidden,
  moveAwardUp,
  moveAwardDown,
  addCertificate,
  removeCertificate,
  toggleCertificateHidden,
  moveCertificateUp,
  moveCertificateDown,
  onPhotoChange,
  removePhoto,
  onPageOverflowChange,
} = useResumeBuilder()

const dismissedNotices = reactive({
  jsonStatus: false,
  actionStatus: false,
  jsonError: false,
  actionError: false,
  exportWarning: false,
  pageOverflow: false,
})

function dismissNotice(type) {
  dismissedNotices[type] = true
}

watch(() => jsonStatusMessage.value, () => {
  dismissedNotices.jsonStatus = false
})

watch(() => actionStatusMessage.value, () => {
  dismissedNotices.actionStatus = false
})

watch(() => jsonErrorMessage.value, () => {
  dismissedNotices.jsonError = false
})

watch(() => actionErrorMessage.value, () => {
  dismissedNotices.actionError = false
})

watch(() => exportWarningMessage.value, () => {
  dismissedNotices.exportWarning = false
})

watch(() => `${pageOverflow.value}-${pageHeight.value}`, () => {
  dismissedNotices.pageOverflow = false
})
</script>

<template>
  <div class="min-h-screen bg-white text-slate-700" :style="brandStyle">
    <main class="mx-auto w-full max-w-[1480px] px-4 py-6 lg:px-8 lg:py-8">
      <ResumeToolbar
        @load-demo="loadDemo"
        @clear-all="clearAll"
        @save-draft="saveDraft"
        @restore-draft="restoreDraft"
        @export-json="exportJson"
        @import-json="triggerJsonImport"
        @export-pdf="exportPdf"
        @export-image="exportImage"
        @expand-all-panels="expandAllPanels"
        @collapse-all-panels="collapseAllPanels"
      />

      <input
        ref="jsonInputRef"
        type="file"
        accept=".json,application/json"
        class="hidden"
        @change="handleJsonImport"
      />

      <section class="no-print mb-4 space-y-2">
        <div
          v-if="jsonStatusMessage && !dismissedNotices.jsonStatus"
          class="notice-banner border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <span class="notice-banner__text">{{ jsonStatusMessage }}</span>
          <button
            type="button"
            class="notice-banner__close"
            aria-label="关闭提示"
            @click="dismissNotice('jsonStatus')"
          >
            ×
          </button>
        </div>
        <div
          v-if="actionStatusMessage && !dismissedNotices.actionStatus"
          class="notice-banner border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <span class="notice-banner__text">{{ actionStatusMessage }}</span>
          <button
            type="button"
            class="notice-banner__close"
            aria-label="关闭提示"
            @click="dismissNotice('actionStatus')"
          >
            ×
          </button>
        </div>
        <div
          v-if="jsonErrorMessage && !dismissedNotices.jsonError"
          class="notice-banner border-rose-200 bg-rose-50 text-rose-700"
        >
          <span class="notice-banner__text">{{ jsonErrorMessage }}</span>
          <button
            type="button"
            class="notice-banner__close"
            aria-label="关闭提示"
            @click="dismissNotice('jsonError')"
          >
            ×
          </button>
        </div>
        <div
          v-if="actionErrorMessage && !dismissedNotices.actionError"
          class="notice-banner border-rose-200 bg-rose-50 text-rose-700"
        >
          <span class="notice-banner__text">{{ actionErrorMessage }}</span>
          <button
            type="button"
            class="notice-banner__close"
            aria-label="关闭提示"
            @click="dismissNotice('actionError')"
          >
            ×
          </button>
        </div>
        <div
          v-if="exportWarningMessage && !dismissedNotices.exportWarning"
          class="notice-banner border-amber-200 bg-amber-50 text-amber-700"
        >
          <span class="notice-banner__text">{{ exportWarningMessage }}</span>
          <button
            type="button"
            class="notice-banner__close"
            aria-label="关闭提示"
            @click="dismissNotice('exportWarning')"
          >
            ×
          </button>
        </div>
        <div
          v-if="pageOverflow && !dismissedNotices.pageOverflow"
          class="notice-banner border-amber-200 bg-amber-50 text-amber-700"
        >
          <span class="notice-banner__text">当前内容已超过一页 A4，高度约 {{ pageHeight }}px，导出时可能分页。</span>
          <button
            type="button"
            class="notice-banner__close"
            aria-label="关闭提示"
            @click="dismissNotice('pageOverflow')"
          >
            ×
          </button>
        </div>
      </section>

      <section class="grid gap-5 xl:grid-cols-[560px_1fr]">
        <ResumeEditor
          :resume="resume"
          :panels="panels"
          :photo-upload-message="photoUploadMessage"
          :photo-upload-error="photoUploadError"
          :education-logo-feedback="educationLogoFeedback"
          @toggle-panel="togglePanel"
          @photo-change="onPhotoChange"
          @remove-photo="removePhoto"
          @add-education="addEducation"
          @remove-education="removeEducation"
          @toggle-education-hidden="toggleEducationHidden"
          @move-education-up="moveEducationUp"
          @move-education-down="moveEducationDown"
          @education-logo-change="onEducationLogoChange"
          @remove-education-logo="removeEducationLogo"
          @add-internship="addInternship"
          @remove-internship="removeInternship"
          @toggle-internship-hidden="toggleInternshipHidden"
          @move-internship-up="moveInternshipUp"
          @move-internship-down="moveInternshipDown"
          @logo-change="onLogoChange"
          @remove-logo="removeLogo"
          @add-project="addProject"
          @remove-project="removeProject"
          @toggle-project-hidden="toggleProjectHidden"
          @move-project-up="moveProjectUp"
          @move-project-down="moveProjectDown"
          @add-award="addAward"
          @remove-award="removeAward"
          @toggle-award-hidden="toggleAwardHidden"
          @move-award-up="moveAwardUp"
          @move-award-down="moveAwardDown"
          @add-certificate="addCertificate"
          @remove-certificate="removeCertificate"
          @toggle-certificate-hidden="toggleCertificateHidden"
          @move-certificate-up="moveCertificateUp"
          @move-certificate-down="moveCertificateDown"
        />
        <ResumePreview :resume="resume" @page-overflow-change="onPageOverflowChange" />
      </section>
    </main>
  </div>
</template>
