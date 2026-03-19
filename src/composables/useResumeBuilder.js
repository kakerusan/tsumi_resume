import { computed, reactive, ref, watch } from 'vue'
import { PANELS_STORAGE_KEY, SCHEMA_VERSION } from '../modules/resume/constants'
import {
  createAwardItem,
  createCertificateItem,
  createEducationItem,
  createInternshipItem,
  createPanelsState,
  createProjectItem,
} from '../modules/resume/factories'
import { normalizeResumeData } from '../modules/resume/normalize'
import { normalizeLayoutOrder } from '../modules/resume/sections'
import { createDemoResume, createEmptyResume } from '../modules/resume/templates'
import { processProfilePhoto } from '../modules/resume/photo'
import { deepBrandFrom, nameBrandFrom, schoolBrandFrom } from '../modules/resume/color'
import { getNameFontFamily, getSchoolFontFamily } from '../modules/resume/nameFont'
import {
  clampAwardMetaFontSize,
  clampAwardDescriptionFontSize,
  clampAwardTitleFontSize,
  clampCertificateMetaFontSize,
  clampCertificateDescriptionFontSize,
  clampCertificateTitleFontSize,
  clampInternshipCompanyMetaFontSize,
  clampInternshipHighlightsFontSize,
  clampInternshipRoleFontSize,
  clampInternshipSummaryFontSize,
  clampInternshipTimeFontSize,
  clampNameFontSize,
  clampProjectMetaFontSize,
  clampProjectHighlightsFontSize,
  clampProjectNameFontSize,
  clampProjectSummaryFontSize,
  clampProjectTagFontSize,
  clampSchoolFontSize,
  clampSelfSummaryFontSize,
  clampSkillsFontSize,
} from '../modules/resume/typography'
import {
  deleteResumeDraft,
  loadResumeDraft,
  migrateLegacyDraftIfNeeded,
  saveResumeDraft,
} from '../modules/resume/storage'

const EDUCATION_LOGO_MAX_BYTES = 2 * 1024 * 1024
const EDUCATION_LOGO_SUPPORTED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const AUTO_SAVE_DELAY = 800

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
  const actionStatusMessage = ref('')
  const actionErrorMessage = ref('')
  const exportWarningMessage = ref('')
  const educationLogoFeedback = reactive({
    id: '',
    message: '',
    error: '',
  })
  const jsonInputRef = ref(null)
  const pageOverflow = ref(false)
  const pageHeight = ref(0)
  const storageBackend = ref('indexeddb')

  let autoSaveTimer = null
  let bootstrapping = true
  let skipNextAutoSave = false
  let hasShownFallbackNotice = false

  function restorePanelsState() {
    const raw = localStorage.getItem(PANELS_STORAGE_KEY)
    if (!raw) return

    let svgUrl = ''

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

  function createResumeSnapshot() {
    return normalizeResumeData(JSON.parse(JSON.stringify(resume)))
  }

  function resetPhotoFeedback() {
    photoUploadMessage.value = ''
    photoUploadError.value = ''
  }

  function resetEducationLogoFeedback(id = '') {
    educationLogoFeedback.id = id
    educationLogoFeedback.message = ''
    educationLogoFeedback.error = ''
  }

  function clearActionFeedback() {
    actionStatusMessage.value = ''
    actionErrorMessage.value = ''
  }

  function scheduleAutoSave() {
    if (bootstrapping) return
    if (skipNextAutoSave) {
      skipNextAutoSave = false
      return
    }

    if (autoSaveTimer) {
      window.clearTimeout(autoSaveTimer)
    }

    autoSaveTimer = window.setTimeout(() => {
      persistDraft({ manual: false })
    }, AUTO_SAVE_DELAY)
  }

  async function persistDraft({ manual = false } = {}) {
    if (autoSaveTimer) {
      window.clearTimeout(autoSaveTimer)
      autoSaveTimer = null
    }

    if (manual) {
      clearActionFeedback()
    }

    try {
      const result = await saveResumeDraft(createResumeSnapshot())
      storageBackend.value = result.backend

      if (result.backend === 'localstorage') {
        if (!hasShownFallbackNotice) {
          actionErrorMessage.value = 'IndexedDB 不可用，已回退到浏览器本地轻量存储。'
          hasShownFallbackNotice = true
        }
        if (manual) {
          actionStatusMessage.value = '草稿已保存到浏览器本地存储。'
        }
        return
      }

      hasShownFallbackNotice = false
      if (manual) {
        actionStatusMessage.value = '草稿已保存到浏览器本地数据库。'
      }
    } catch (error) {
      console.error('Save draft failed:', error)
      actionErrorMessage.value = '草稿保存失败，请稍后重试。'
    }
  }

  function togglePanel(name) {
    panels[name] = !panels[name]
    savePanelsState()
  }

  function expandAllPanels() {
    Object.keys(panels).forEach((key) => {
      panels[key] = true
    })
    savePanelsState()
  }

  function collapseAllPanels() {
    Object.keys(panels).forEach((key) => {
      panels[key] = false
    })
    savePanelsState()
  }

  function loadDemo() {
    clearActionFeedback()
    applyResumeData(createDemoResume())
    resetPhotoFeedback()
    resetEducationLogoFeedback()
  }

  async function clearAll() {
    clearActionFeedback()
    skipNextAutoSave = true
    applyResumeData(createEmptyResume())
    resetPhotoFeedback()
    resetEducationLogoFeedback()

    try {
      await deleteResumeDraft()
      actionStatusMessage.value = '已清空当前内容，并移除本地草稿。'
    } catch (error) {
      console.error('Clear draft failed:', error)
      actionErrorMessage.value = '内容已清空，但本地草稿删除失败。'
    }
  }

  async function saveDraft() {
    await persistDraft({ manual: true })
  }

  async function restoreDraft() {
    clearActionFeedback()

    try {
      const draft = await loadResumeDraft()
      if (!draft) {
        actionErrorMessage.value = '当前没有可恢复的本地草稿。'
        return
      }

      skipNextAutoSave = true
      applyResumeData(draft)
      resetPhotoFeedback()
      resetEducationLogoFeedback()
      actionStatusMessage.value = '本地草稿已恢复。'
    } catch (error) {
      console.error('Restore draft failed:', error)
      actionErrorMessage.value = '恢复本地草稿失败，请稍后重试。'
    }
  }

  function exportPdf() {
    validateBeforeExport()
    window.print()
  }

  function readStyleText() {
    let cssText = ''
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        Array.from(sheet.cssRules || []).forEach((rule) => {
          cssText += `${rule.cssText}\n`
        })
      } catch (error) {
        // Ignore cross-origin stylesheets.
      }
    })
    return cssText
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('BLOB_TO_DATA_URL_FAILED'))
      reader.readAsDataURL(blob)
    })
  }

  async function toInlineImageUrl(src = '') {
    const source = String(src || '').trim()
    if (!source) return ''
    if (source.startsWith('data:')) return source

    const response = await fetch(source)
    if (!response.ok) {
      throw new Error('EXPORT_IMAGE_FETCH_FAILED')
    }

    const blob = await response.blob()
    return blobToDataUrl(blob)
  }

  async function inlineCloneImages(node) {
    const images = Array.from(node.querySelectorAll('img'))
    await Promise.all(
      images.map(async (image) => {
        const src = image.currentSrc || image.src || image.getAttribute('src') || ''
        if (!src) return

        try {
          const dataUrl = await toInlineImageUrl(src)
          if (dataUrl) {
            image.setAttribute('src', dataUrl)
          }
        } catch (error) {
          console.warn('Inline export image failed:', src, error)
        }
      })
    )
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.decoding = 'sync'
      image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('IMAGE_LOAD_FAILED'))
      image.src = src
    })
  }

  async function exportImage() {
    validateBeforeExport()
    clearActionFeedback()

    const target = document.getElementById('resume-preview-page')
    if (!target) {
      actionErrorMessage.value = '导出图片失败：未找到简历预览区域。'
      return
    }

    try {
      const cloned = target.cloneNode(true)
      const width = Math.ceil(target.scrollWidth)
      const height = Math.ceil(target.scrollHeight)
      await inlineCloneImages(cloned)
      const cssText = readStyleText()
      const serialized = new XMLSerializer().serializeToString(cloned)
      const svgText = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;background:#ffffff;">
              <style>${cssText}</style>
              ${serialized}
            </div>
          </foreignObject>
        </svg>
      `
      const svgBlob = new Blob([svgText], {
        type: 'image/svg+xml;charset=utf-8',
      })
      svgUrl = URL.createObjectURL(svgBlob)
      const image = await loadImage(svgUrl)
      const scale = Math.max(2, Math.min(3, Math.ceil(window.devicePixelRatio || 1)))
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const context = canvas.getContext('2d')
      if (!context) throw new Error('CANVAS_CONTEXT_UNAVAILABLE')

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(svgUrl)

      const url = canvas.toDataURL('image/png')
      const anchor = document.createElement('a')
      const dateText = new Date().toISOString().slice(0, 10)
      anchor.href = url
      anchor.download = `resume-${dateText}.png`
      anchor.click()
      actionStatusMessage.value = '图片导出成功（PNG）。'
    } catch (error) {
      console.error(error)
      actionErrorMessage.value = '图片导出失败，请稍后重试。'
    }
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

  function onEducationLogoChange(id, event) {
    const input = event?.target
    const [file] = input?.files || []
    if (!file) return

    resetEducationLogoFeedback(id)

    if (!EDUCATION_LOGO_SUPPORTED_TYPES.has(file.type)) {
      educationLogoFeedback.error = '学校 Logo 仅支持 JPG / PNG / WebP。'
      input.value = ''
      return
    }

    if (file.size > EDUCATION_LOGO_MAX_BYTES) {
      educationLogoFeedback.error = '学校 Logo 不能超过 2MB。'
      input.value = ''
      return
    }

    const target = resume.educations.find((item) => item.id === id)
    if (!target) {
      input.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      target.logo = String(reader.result || '')
      educationLogoFeedback.message = `学校 Logo 上传成功（${(file.size / 1024).toFixed(1)}KB）。`
      educationLogoFeedback.error = ''
    }
    reader.onerror = () => {
      educationLogoFeedback.error = '学校 Logo 读取失败，请重试。'
      educationLogoFeedback.message = ''
    }
    reader.readAsDataURL(file)
    input.value = ''
  }

  function removeEducationLogo(id) {
    const target = resume.educations.find((item) => item.id === id)
    if (target) {
      target.logo = ''
      resetEducationLogoFeedback(id)
      educationLogoFeedback.message = '已移除学校 Logo。'
    }
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

  function updateLayoutOrder(nextOrder) {
    resume.layout.order = normalizeLayoutOrder(nextOrder)
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

  function hasVisibleSection() {
    return Object.values(resume.sectionVisibility || {}).some((visible) => visible !== false)
  }

  function hasCoreContent() {
    const hasSkills = Boolean(String(resume.skills || '').trim())
    const hasInternships = resume.internships.some(
      (item) => Boolean(String(item.company || item.summary || item.highlights || '').trim()) && !item.hidden
    )
    const hasProjects = resume.projects.some(
      (item) => Boolean(String(item.name || item.summary || item.highlights || '').trim()) && !item.hidden
    )
    return hasSkills || hasInternships || hasProjects
  }

  function validateBeforeExport() {
    const warnings = []
    if (!String(resume.profile.name || '').trim()) {
      warnings.push('姓名未填写')
    }
    if (!hasVisibleSection()) {
      warnings.push('所有栏目当前都处于隐藏状态')
    }
    if (!hasCoreContent()) {
      warnings.push('技术栈、实习经历、项目经历目前都为空')
    }
    exportWarningMessage.value = warnings.length ? `导出提醒：${warnings.join('；')}。` : ''
    return warnings
  }

  async function bootstrapDraft() {
    try {
      const migrated = await migrateLegacyDraftIfNeeded()
      const draft = await loadResumeDraft()

      if (draft) {
        skipNextAutoSave = true
        applyResumeData(draft)
        resetPhotoFeedback()
        resetEducationLogoFeedback()
      }

      if (migrated) {
        actionStatusMessage.value = '已将旧版本地草稿迁移到 IndexedDB。'
        await persistDraft({ manual: false })
      }
    } catch (error) {
      console.error('Bootstrap draft failed:', error)
      storageBackend.value = 'localstorage'
      actionErrorMessage.value = '本地数据库初始化失败，已回退到浏览器本地存储。'
    } finally {
      bootstrapping = false
    }
  }

  watch(
    resume,
    () => {
      scheduleAutoSave()
    },
    { deep: true }
  )

  bootstrapDraft()

  const brandStyle = computed(() => ({
    '--brand': resume.theme.primaryColor || '#4a9fff',
    '--brand-deep': deepBrandFrom(resume.theme.primaryColor),
    '--brand-name': resume.theme.nameColor || nameBrandFrom(resume.theme.primaryColor),
    '--brand-school': resume.theme.schoolColor || schoolBrandFrom(resume.theme.primaryColor),
    '--name-font': getNameFontFamily(resume.theme.nameFont),
    '--name-font-size': `${clampNameFontSize(resume.theme.nameFontSize)}px`,
    '--school-font': getSchoolFontFamily(resume.theme.schoolFont),
    '--school-font-size': `${clampSchoolFontSize(resume.theme.schoolFontSize)}px`,
    '--skills-font-size': `${clampSkillsFontSize(resume.theme.skillsFontSize)}px`,
    '--internship-summary-font-size': `${clampInternshipSummaryFontSize(resume.theme.internshipSummaryFontSize)}px`,
    '--internship-highlights-font-size': `${clampInternshipHighlightsFontSize(resume.theme.internshipHighlightsFontSize)}px`,
    '--internship-time-font-size': `${clampInternshipTimeFontSize(resume.theme.internshipTimeFontSize)}px`,
    '--internship-company-meta-font-size': `${clampInternshipCompanyMetaFontSize(resume.theme.internshipCompanyMetaFontSize)}px`,
    '--internship-role-font-size': `${clampInternshipRoleFontSize(resume.theme.internshipRoleFontSize)}px`,
    '--project-summary-font-size': `${clampProjectSummaryFontSize(resume.theme.projectSummaryFontSize)}px`,
    '--project-highlights-font-size': `${clampProjectHighlightsFontSize(resume.theme.projectHighlightsFontSize)}px`,
    '--project-name-font-size': `${clampProjectNameFontSize(resume.theme.projectNameFontSize)}px`,
    '--project-meta-font-size': `${clampProjectMetaFontSize(resume.theme.projectMetaFontSize)}px`,
    '--project-tag-font-size': `${clampProjectTagFontSize(resume.theme.projectTagFontSize)}px`,
    '--award-title-font-size': `${clampAwardTitleFontSize(resume.theme.awardTitleFontSize)}px`,
    '--award-meta-font-size': `${clampAwardMetaFontSize(resume.theme.awardMetaFontSize)}px`,
    '--award-description-font-size': `${clampAwardDescriptionFontSize(resume.theme.awardDescriptionFontSize)}px`,
    '--certificate-title-font-size': `${clampCertificateTitleFontSize(resume.theme.certificateTitleFontSize)}px`,
    '--certificate-meta-font-size': `${clampCertificateMetaFontSize(resume.theme.certificateMetaFontSize)}px`,
    '--certificate-description-font-size': `${clampCertificateDescriptionFontSize(resume.theme.certificateDescriptionFontSize)}px`,
    '--self-summary-font-size': `${clampSelfSummaryFontSize(resume.theme.selfSummaryFontSize)}px`,
  }))

  return {
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
    storageBackend,
    brandStyle,
    togglePanel,
    expandAllPanels,
    collapseAllPanels,
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
  }
}
