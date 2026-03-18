import { computed, reactive, ref } from 'vue'
import { STORAGE_KEY, PANELS_STORAGE_KEY, SCHEMA_VERSION } from '../modules/resume/constants'
import {
  createAwardItem,
  createCertificateItem,
  createEducationItem,
  createInternshipItem,
  createPanelsState,
  createProjectItem,
} from '../modules/resume/factories'
import { normalizeResumeData } from '../modules/resume/normalize'
import { createDemoResume, createEmptyResume } from '../modules/resume/templates'
import { processProfilePhoto } from '../modules/resume/photo'
import { deepBrandFrom } from '../modules/resume/color'

function moveItem(list, fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= list.length || fromIndex < 0 || fromIndex >= list.length) return
  const [target] = list.splice(fromIndex, 1)
  list.splice(toIndex, 0, target)
}

export function useResumeBuilder() {
  const resume = reactive(normalizeResumeData(createDemoResume()))
  const panels = reactive(createPanelsState())

  const photoUploadMessage = ref('')
  const photoUploadError = ref('')
  const jsonStatusMessage = ref('')
  const jsonErrorMessage = ref('')
  const jsonInputRef = ref(null)
  const pageOverflow = ref(false)
  const pageHeight = ref(0)

  function restorePanelsState() {
    const raw = localStorage.getItem(PANELS_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object') return

      Object.keys(panels).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(parsed, key)) {
          panels[key] = Boolean(parsed[key])
        }
      })
    } catch (error) {
      console.error('Restore panels failed:', error)
    }
  }

  function savePanelsState() {
    localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify(panels))
  }

  restorePanelsState()

  function applyResumeData(source) {
    Object.assign(resume, normalizeResumeData(source))
  }

  function resetPhotoFeedback() {
    photoUploadMessage.value = ''
    photoUploadError.value = ''
  }

  function togglePanel(name) {
    panels[name] = !panels[name]
    savePanelsState()
  }

  function loadDemo() {
    applyResumeData(createDemoResume())
    resetPhotoFeedback()
  }

  function clearAll() {
    applyResumeData(createEmptyResume())
    resetPhotoFeedback()
  }

  function saveDraft() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resume))
  }

  function restoreDraft() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      applyResumeData(parsed)
      resetPhotoFeedback()
    } catch (error) {
      console.error('Restore draft failed:', error)
    }
  }

  function exportPdf() {
    window.print()
  }

  function exportJson() {
    jsonStatusMessage.value = ''
    jsonErrorMessage.value = ''

    try {
      const payload = {
        ...resume,
        meta: {
          ...resume.meta,
          schemaVersion: SCHEMA_VERSION,
        },
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const dateText = new Date().toISOString().slice(0, 10)
      anchor.href = url
      anchor.download = `resume-${dateText}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      jsonStatusMessage.value = 'JSON 导出成功。'
    } catch (error) {
      console.error(error)
      jsonErrorMessage.value = 'JSON 导出失败，请重试。'
    }
  }

  function triggerJsonImport() {
    jsonStatusMessage.value = ''
    jsonErrorMessage.value = ''
    jsonInputRef.value?.click()
  }

  async function handleJsonImport(event) {
    const input = event.target
    const [file] = input.files || []
    if (!file) return

    jsonStatusMessage.value = ''
    jsonErrorMessage.value = ''

    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('INVALID_JSON_SHAPE')
      }
      applyResumeData(parsed)
      jsonStatusMessage.value = 'JSON 导入成功，已替换当前简历。'
    } catch (error) {
      console.error(error)
      jsonErrorMessage.value = 'JSON 导入失败，请检查文件内容是否正确。'
    } finally {
      input.value = ''
    }
  }

  function addEducation() {
    resume.educations.push(createEducationItem())
  }

  function removeEducation(id) {
    const index = resume.educations.findIndex((item) => item.id === id)
    if (index >= 0) resume.educations.splice(index, 1)
  }

  function toggleEducationHidden(id) {
    const target = resume.educations.find((item) => item.id === id)
    if (target) target.hidden = !target.hidden
  }

  function moveEducationUp(index) {
    moveItem(resume.educations, index, index - 1)
  }

  function moveEducationDown(index) {
    moveItem(resume.educations, index, index + 1)
  }

  function addInternship() {
    resume.internships.push(createInternshipItem())
  }

  function removeInternship(id) {
    const index = resume.internships.findIndex((item) => item.id === id)
    if (index >= 0) resume.internships.splice(index, 1)
  }

  function toggleInternshipHidden(id) {
    const target = resume.internships.find((item) => item.id === id)
    if (target) target.hidden = !target.hidden
  }

  function moveInternshipUp(index) {
    moveItem(resume.internships, index, index - 1)
  }

  function moveInternshipDown(index) {
    moveItem(resume.internships, index, index + 1)
  }

  function addProject() {
    resume.projects.push(createProjectItem())
  }

  function removeProject(id) {
    const index = resume.projects.findIndex((item) => item.id === id)
    if (index >= 0) resume.projects.splice(index, 1)
  }

  function toggleProjectHidden(id) {
    const target = resume.projects.find((item) => item.id === id)
    if (target) target.hidden = !target.hidden
  }

  function moveProjectUp(index) {
    moveItem(resume.projects, index, index - 1)
  }

  function moveProjectDown(index) {
    moveItem(resume.projects, index, index + 1)
  }

  function addAward() {
    resume.awards.push(createAwardItem())
  }

  function removeAward(id) {
    const index = resume.awards.findIndex((item) => item.id === id)
    if (index >= 0) resume.awards.splice(index, 1)
  }

  function toggleAwardHidden(id) {
    const target = resume.awards.find((item) => item.id === id)
    if (target) target.hidden = !target.hidden
  }

  function moveAwardUp(index) {
    moveItem(resume.awards, index, index - 1)
  }

  function moveAwardDown(index) {
    moveItem(resume.awards, index, index + 1)
  }

  function addCertificate() {
    resume.certificates.push(createCertificateItem())
  }

  function removeCertificate(id) {
    const index = resume.certificates.findIndex((item) => item.id === id)
    if (index >= 0) resume.certificates.splice(index, 1)
  }

  function toggleCertificateHidden(id) {
    const target = resume.certificates.find((item) => item.id === id)
    if (target) target.hidden = !target.hidden
  }

  function moveCertificateUp(index) {
    moveItem(resume.certificates, index, index - 1)
  }

  function moveCertificateDown(index) {
    moveItem(resume.certificates, index, index + 1)
  }

  function onLogoChange(id, event) {
    const [file] = event.target.files || []
    if (!file) return

    const target = resume.internships.find((item) => item.id === id)
    if (!target) return

    const reader = new FileReader()
    reader.onload = () => {
      target.logo = String(reader.result || '')
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function removeLogo(id) {
    const target = resume.internships.find((item) => item.id === id)
    if (target) target.logo = ''
  }

  async function onPhotoChange(event) {
    const input = event.target
    const [file] = input.files || []
    if (!file) return

    resetPhotoFeedback()
    input.value = ''

    try {
      const result = await processProfilePhoto(file)
      if (!result.ok) {
        photoUploadError.value = result.error
        return
      }

      resume.profile.photo = result.photo
      resume.profile.photoMeta = result.photoMeta
      photoUploadMessage.value = result.message
    } catch (error) {
      console.error(error)
      photoUploadError.value = '图片处理失败，请重试。'
    }
  }

  function removePhoto() {
    resume.profile.photo = ''
    resume.profile.photoMeta = null
    resetPhotoFeedback()
  }

  function onPageOverflowChange(payload) {
    pageOverflow.value = Boolean(payload?.overflow)
    pageHeight.value = Number(payload?.height || 0)
  }

  const brandStyle = computed(() => ({
    '--brand': resume.theme.primaryColor || '#4a9fff',
    '--brand-deep': deepBrandFrom(resume.theme.primaryColor),
  }))

  return {
    resume,
    panels,
    photoUploadMessage,
    photoUploadError,
    jsonStatusMessage,
    jsonErrorMessage,
    jsonInputRef,
    pageOverflow,
    pageHeight,
    brandStyle,
    togglePanel,
    loadDemo,
    clearAll,
    saveDraft,
    restoreDraft,
    exportPdf,
    exportJson,
    triggerJsonImport,
    handleJsonImport,
    addEducation,
    removeEducation,
    toggleEducationHidden,
    moveEducationUp,
    moveEducationDown,
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
  }
}
