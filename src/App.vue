<script setup>
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
  updateLayoutOrder,
  onPhotoChange,
  removePhoto,
  onPageOverflowChange,
} = useResumeBuilder()
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
        <p
          v-if="jsonStatusMessage"
          class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {{ jsonStatusMessage }}
        </p>
        <p
          v-if="actionStatusMessage"
          class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {{ actionStatusMessage }}
        </p>
        <p
          v-if="jsonErrorMessage"
          class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {{ jsonErrorMessage }}
        </p>
        <p
          v-if="actionErrorMessage"
          class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {{ actionErrorMessage }}
        </p>
        <p
          v-if="exportWarningMessage"
          class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
        >
          {{ exportWarningMessage }}
        </p>
        <p
          v-if="pageOverflow"
          class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700"
        >
          当前内容已超过一页 A4，高度约 {{ pageHeight }}px，导出时可能分页。
        </p>
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
          @update-layout-order="updateLayoutOrder"
        />
        <ResumePreview :resume="resume" @page-overflow-change="onPageOverflowChange" />
      </section>
    </main>
  </div>
</template>
