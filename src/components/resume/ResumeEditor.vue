<script setup>
import { computed } from 'vue'
import Draggable from 'vuedraggable'
import { ColorPicker, Slider } from 'tdesign-vue-next'
import { BrowseIcon, BrowseOffIcon } from 'tdesign-icons-vue-next'
import {
  PHOTO_RATIO_OPTIONS,
  PHOTO_SIZE_MAX,
  PHOTO_SIZE_MIN,
  clampPhotoSize,
  getPhotoHeightByRatio,
  normalizePhotoConfig,
} from '../../modules/resume/photoConfig'
import { NAME_FONT_OPTIONS } from '../../modules/resume/nameFont'
import {
  NAME_FONT_SIZE_MAX,
  NAME_FONT_SIZE_MIN,
  SCHOOL_FONT_SIZE_MAX,
  SCHOOL_FONT_SIZE_MIN,
  clampNameFontSize,
  clampSchoolFontSize,
} from '../../modules/resume/typography'

const props = defineProps({
  resume: { type: Object, required: true },
  panels: { type: Object, required: true },
  photoUploadMessage: { type: String, default: '' },
  photoUploadError: { type: String, default: '' },
  educationLogoFeedback: {
    type: Object,
    default: () => ({
      id: '',
      message: '',
      error: '',
    }),
  },
})

defineEmits([
  'toggle-panel',
  'photo-change',
  'remove-photo',
  'add-education',
  'remove-education',
  'toggle-education-hidden',
  'move-education-up',
  'move-education-down',
  'education-logo-change',
  'remove-education-logo',
  'add-internship',
  'remove-internship',
  'toggle-internship-hidden',
  'move-internship-up',
  'move-internship-down',
  'logo-change',
  'remove-logo',
  'add-project',
  'remove-project',
  'toggle-project-hidden',
  'move-project-up',
  'move-project-down',
  'add-award',
  'remove-award',
  'toggle-award-hidden',
  'move-award-up',
  'move-award-down',
  'add-certificate',
  'remove-certificate',
  'toggle-certificate-hidden',
  'move-certificate-up',
  'move-certificate-down',
])

const photoMetaSummary = computed(() => {
  const meta = props.resume.profile.photoMeta
  if (!meta) return ''

  const finalFormat = meta.finalFormat || 'JPG'
  if (meta.compressed === false && finalFormat === meta.originalFormat) {
    return `原图 ${meta.originalFormat} ${meta.originalSizeKB}KB（未压缩，${meta.width}×${meta.height}）`
  }

  return `原图 ${meta.originalFormat} ${meta.originalSizeKB}KB -> ${finalFormat} ${meta.finalSizeKB}KB（${meta.width}×${meta.height}）`
})

function getColorValue(value, fallback = '#4a9fff') {
  if (typeof value === 'string' && value.trim()) return value
  return fallback
}

props.resume.theme.photoConfig = normalizePhotoConfig(props.resume.theme?.photoConfig || {})

const photoRatioOptions = PHOTO_RATIO_OPTIONS
const nameFontOptions = NAME_FONT_OPTIONS
const photoSizeMin = PHOTO_SIZE_MIN
const photoSizeMax = PHOTO_SIZE_MAX
const nameFontSizeMin = NAME_FONT_SIZE_MIN
const nameFontSizeMax = NAME_FONT_SIZE_MAX
const schoolFontSizeMin = SCHOOL_FONT_SIZE_MIN
const schoolFontSizeMax = SCHOOL_FONT_SIZE_MAX
const photoConfig = computed(() => props.resume.theme.photoConfig)
const sliderInputProps = {
  theme: 'column',
  size: 'small',
}

function updatePhotoConfig(patch = {}) {
  props.resume.theme.photoConfig = normalizePhotoConfig({
    ...photoConfig.value,
    ...patch,
  })
}

function onPhotoRatioChange(value) {
  updatePhotoConfig({ ratio: value })
}

function onPhotoLockChange(value) {
  updatePhotoConfig({ lockRatio: Boolean(value) })
}

function onPhotoWidthChange(value) {
  const width = clampPhotoSize(value, photoConfig.value.width)
  if (photoConfig.value.lockRatio) {
    updatePhotoConfig({
      width,
      height: getPhotoHeightByRatio(width, photoConfig.value.ratio),
    })
    return
  }
  updatePhotoConfig({ width })
}

function onPhotoHeightChange(value) {
  if (photoConfig.value.lockRatio) return
  updatePhotoConfig({
    height: clampPhotoSize(value, photoConfig.value.height),
  })
}

function onNameFontSizeChange(value) {
  props.resume.theme.nameFontSize = clampNameFontSize(value, props.resume.theme.nameFontSize)
}

function onSchoolFontSizeChange(value) {
  props.resume.theme.schoolFontSize = clampSchoolFontSize(value, props.resume.theme.schoolFontSize)
}
</script>

<template>
  <aside class="no-print flex flex-col gap-4 xl:sticky xl:top-5 xl:h-[calc(100vh-5rem)] xl:overflow-auto">
    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'profile')">
          <span class="panel-caret">{{ panels.profile ? '▾' : '▸' }}</span>
          <span class="panel-title">基本信息</span>
        </button>
        <button
          type="button"
          class="panel-eye"
          :class="resume.sectionVisibility.profile ? '' : 'panel-eye-off'"
          @click="resume.sectionVisibility.profile = !resume.sectionVisibility.profile"
        >
          <browse-icon
            v-if="resume.sectionVisibility.profile"
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
          <browse-off-icon
            v-else
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
        </button>
      </div>
      <div v-if="panels.profile" class="panel-body mt-4 grid gap-3 md:grid-cols-3">
        <label class="field-wrap">
          <span class="field-label">姓名</span>
          <input v-model="resume.profile.name" class="field-input" placeholder="请输入姓名" />
        </label>
        <label class="field-wrap">
          <span class="field-label">邮箱</span>
          <input v-model="resume.profile.email" class="field-input" placeholder="请输入邮箱" />
        </label>
        <label class="field-wrap">
          <span class="field-label">联系方式</span>
          <input v-model="resume.profile.phone" class="field-input" placeholder="请输入电话号" />
        </label>
        <label class="field-wrap md:col-span-3">
          <span class="field-label">个人网站</span>
          <input
            v-model="resume.profile.website"
            class="field-input"
            placeholder="请输入个人网站,支持github、gitee图标自动解析"
          />
        </label>
        <label class="field-wrap md:col-span-3">
          <span class="field-label">求职意向</span>
          <input v-model="resume.profile.title" class="field-input" placeholder="不填写则不展示" />
        </label>
        <label class="field-wrap md:col-span-3">
          <span class="field-label">证件照上传（JPG / PNG / WebP，5MB 内保留原图）</span>
          <div class="mt-2 flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="file-input"
              @change="$emit('photo-change', $event)"
            />
            <button type="button" class="danger-btn" @click="$emit('remove-photo')">移除证件照</button>
          </div>
          <p v-if="photoUploadMessage" class="mt-2 text-xs font-medium text-emerald-600">
            {{ photoUploadMessage }}
          </p>
          <p v-if="photoUploadError" class="mt-2 text-xs font-medium text-rose-600">
            {{ photoUploadError }}
          </p>
          <p v-if="photoMetaSummary" class="mt-1 text-xs text-slate-500">{{ photoMetaSummary }}</p>
        </label>
        <div class="field-wrap md:col-span-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <span class="field-label">证件照尺寸设置</span>
          <div class="mt-2 grid gap-3 sm:grid-cols-2">
            <label class="field-wrap">
              <span class="field-label">比例</span>
              <select
                class="field-input"
                :value="photoConfig.ratio"
                @change="onPhotoRatioChange($event.target.value)"
              >
                <option v-for="ratio in photoRatioOptions" :key="ratio" :value="ratio">
                  {{ ratio }}
                </option>
              </select>
            </label>
            <label class="switch-field mt-auto">
              <input
                type="checkbox"
                class="h-4 w-4 accent-sky-600"
                :checked="photoConfig.lockRatio"
                @change="onPhotoLockChange($event.target.checked)"
              />
              <span>锁定比例</span>
            </label>
            <label class="field-wrap">
              <span class="field-label">宽度（{{ photoSizeMin }}-{{ photoSizeMax }}）</span>
              <div class="setting-slider mt-1">
                <Slider
                  :model-value="photoConfig.width"
                  :min="photoSizeMin"
                  :max="photoSizeMax"
                  :input-number-props="sliderInputProps"
                  @change="onPhotoWidthChange"
                />
              </div>
            </label>
            <label class="field-wrap">
              <span class="field-label">高度（{{ photoSizeMin }}-{{ photoSizeMax }}）</span>
              <div class="setting-slider mt-1" :class="{ 'setting-slider-disabled': photoConfig.lockRatio }">
                <Slider
                  :model-value="photoConfig.height"
                  :min="photoSizeMin"
                  :max="photoSizeMax"
                  :disabled="photoConfig.lockRatio"
                  :input-number-props="sliderInputProps"
                  @change="onPhotoHeightChange"
                />
              </div>
            </label>
          </div>
          <p class="mt-2 text-xs text-slate-500">
            当前尺寸：{{ photoConfig.width }} × {{ photoConfig.height }} px
          </p>
        </div>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'education')">
          <span class="panel-caret">{{ panels.education ? '▾' : '▸' }}</span>
          <span class="panel-title">教育背景</span>
        </button>
        <button
          type="button"
          class="panel-eye"
          :class="resume.sectionVisibility.education ? '' : 'panel-eye-off'"
          @click="resume.sectionVisibility.education = !resume.sectionVisibility.education"
        >
          <browse-icon
            v-if="resume.sectionVisibility.education"
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
          <browse-off-icon
            v-else
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
        </button>
      </div>
      <div v-if="panels.education" class="panel-body mt-4 space-y-3">
        <div
          v-if="!resume.educations.length"
          class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"
        >
          暂无教育经历，点击下方按钮新增。
        </div>
        <draggable
          v-else
          v-model="resume.educations"
          item-key="id"
          handle=".drag-handle"
          class="drag-list"
          ghost-class="drag-ghost"
          chosen-class="drag-chosen"
          drag-class="drag-dragging"
          :animation="180"
        >
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button type="button" class="drag-handle" title="拖拽排序">::</button>
                  <span class="text-sm font-semibold text-slate-800">教育 {{ index + 1 }}</span>
                  <span
                    v-if="item.hidden"
                    class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                  >
                    已隐藏（预览不显示）
                  </span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-education-hidden', item.id)">
                    {{ item.hidden ? '显示' : '隐藏' }}
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === 0"
                    @click="$emit('move-education-up', index)"
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === resume.educations.length - 1"
                    @click="$emit('move-education-down', index)"
                  >
                    下移
                  </button>
                  <button type="button" class="small-btn small-btn-danger" @click="$emit('remove-education', item.id)">
                    删除
                  </button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap">
                  <span class="field-label">学校</span>
                  <input v-model="item.school" class="field-input" placeholder="例如：北京大学(985)" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">学历</span>
                  <input v-model="item.degree" class="field-input" placeholder="例如：本科" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">专业</span>
                  <input v-model="item.major" class="field-input" placeholder="例如：网络工程" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">起止时间</span>
                  <input v-model="item.studyPeriod" class="field-input" placeholder="例如：2023-2027" />
                </label>
                <div class="field-wrap sm:col-span-2">
                  <span class="field-label">学校 Logo（JPG / PNG / WebP，≤2MB）</span>
                  <div class="mt-2 flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      class="file-input"
                      @change="$emit('education-logo-change', item.id, $event)"
                    />
                    <button
                      type="button"
                      class="toolbar-btn !px-3 !py-1.5 !text-xs"
                      @click="$emit('remove-education-logo', item.id)"
                    >
                      移除
                    </button>
                  </div>
                  <p
                    v-if="educationLogoFeedback?.id === item.id && educationLogoFeedback.message"
                    class="mt-1 text-xs font-medium text-emerald-600"
                  >
                    {{ educationLogoFeedback.message }}
                  </p>
                  <p
                    v-if="educationLogoFeedback?.id === item.id && educationLogoFeedback.error"
                    class="mt-1 text-xs font-medium text-rose-600"
                  >
                    {{ educationLogoFeedback.error }}
                  </p>
                </div>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-education')">
          + 新增教育经历
        </button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'skills')">
          <span class="panel-caret">{{ panels.skills ? '▾' : '▸' }}</span>
          <span class="panel-title">技术栈</span>
        </button>
        <button
          type="button"
          class="panel-eye"
          :class="resume.sectionVisibility.skills ? '' : 'panel-eye-off'"
          @click="resume.sectionVisibility.skills = !resume.sectionVisibility.skills"
        >
          <browse-icon
            v-if="resume.sectionVisibility.skills"
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
          <browse-off-icon
            v-else
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
        </button>
      </div>
      <div v-if="panels.skills" class="panel-body mt-4">
        <label class="field-wrap">
          <span class="field-label">技能内容（支持 **加粗**）</span>
          <textarea v-model="resume.skills" class="field-input field-textarea h-40"></textarea>
        </label>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'internship')">
          <span class="panel-caret">{{ panels.internship ? '▾' : '▸' }}</span>
          <span class="panel-title">实习经历</span>
        </button>
        <button
          type="button"
          class="panel-eye"
          :class="resume.sectionVisibility.internships ? '' : 'panel-eye-off'"
          @click="resume.sectionVisibility.internships = !resume.sectionVisibility.internships"
        >
          <browse-icon
            v-if="resume.sectionVisibility.internships"
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
          <browse-off-icon
            v-else
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
        </button>
      </div>
      <div v-if="panels.internship" class="panel-body mt-4 space-y-3">
        <div
          v-if="!resume.internships.length"
          class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"
        >
          暂无实习经历，点击下方按钮新增。
        </div>
        <draggable
          v-else
          v-model="resume.internships"
          item-key="id"
          handle=".drag-handle"
          class="drag-list"
          ghost-class="drag-ghost"
          chosen-class="drag-chosen"
          drag-class="drag-dragging"
          :animation="180"
        >
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button type="button" class="drag-handle" title="拖拽排序">::</button>
                  <span class="text-sm font-semibold text-slate-800">实习 {{ index + 1 }}</span>
                  <span
                    v-if="item.hidden"
                    class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                  >
                    已隐藏（预览不显示）
                  </span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-internship-hidden', item.id)">
                    {{ item.hidden ? '显示' : '隐藏' }}
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === 0"
                    @click="$emit('move-internship-up', index)"
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === resume.internships.length - 1"
                    @click="$emit('move-internship-down', index)"
                  >
                    下移
                  </button>
                  <button type="button" class="small-btn small-btn-danger" @click="$emit('remove-internship', item.id)">
                    删除
                  </button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap">
                  <span class="field-label">公司名称</span>
                  <input v-model="item.company" class="field-input" placeholder="例如：阿里巴巴" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">岗位</span>
                  <input v-model="item.role" class="field-input" placeholder="例如：后端开发实习生" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">业务线 / 部门</span>
                  <input v-model="item.department" class="field-input" placeholder="例如：技术部-后端组" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">时间</span>
                  <input v-model="item.period" class="field-input" placeholder="例如:2026.03 - 2026.08" />
                </label>
                <label class="field-wrap sm:col-span-2">
                  <span class="field-label">地点（可留空）</span>
                  <input v-model="item.location" class="field-input" placeholder="例如：深圳" />
                </label>
                <label class="field-wrap sm:col-span-2">
                  <span class="field-label">工作简介</span>
                  <textarea
                    v-model="item.summary"
                    class="field-input field-textarea h-24"
                    placeholder="简要描述职责范围和业务背景"
                  ></textarea>
                </label>
                <label class="field-wrap sm:col-span-2">
                  <span class="field-label">成果亮点（按行输入）</span>
                  <textarea
                    v-model="item.highlights"
                    class="field-input field-textarea h-28"
                    placeholder="每行一条，可用 **关键字** 强调"
                  ></textarea>
                </label>
                <div class="field-wrap sm:col-span-2">
                  <span class="field-label">公司 Logo</span>
                  <div class="mt-2 flex items-center gap-3">
                    <input type="file" accept="image/*" class="file-input" @change="$emit('logo-change', item.id, $event)" />
                    <button type="button" class="toolbar-btn !px-3 !py-1.5 !text-xs" @click="$emit('remove-logo', item.id)">
                      移除
                    </button>
                  </div>
                </div>
                <div class="field-wrap">
                  <span class="field-label">条目背景色</span>
                  <div class="mt-2 flex items-center gap-2">
                    <div class="color-panel-wrap">
                      <ColorPicker
                        :model-value="getColorValue(item.stripColor, resume.theme.primaryColor || '#4a9fff')"
                        format="RGBA"
                        :enable-alpha="true"
                        :show-primary-color-preview="false"
                        :color-modes="['monochrome', 'linear-gradient']"
                        @update:model-value="item.stripColor = $event"
                        @change="item.stripColor = $event"
                      />
                    </div>
                    <button type="button" class="small-btn" @click="item.stripColor = ''">跟随主题</button>
                  </div>
                </div>
                <div class="field-wrap">
                  <span class="field-label">Logo 大小</span>
                  <div class="mt-2 flex items-center gap-2">
                    <input v-model.number="item.logoSize" type="range" min="14" max="48" class="w-full accent-sky-600" />
                    <input
                      v-model.number="item.logoSize"
                      type="number"
                      min="14"
                      max="48"
                      class="field-input !w-20 !px-2 !py-1.5 text-center"
                    />
                  </div>
                </div>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-internship')">
          + 新增实习经历
        </button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'project')">
          <span class="panel-caret">{{ panels.project ? '▾' : '▸' }}</span>
          <span class="panel-title">项目经历</span>
        </button>
        <button
          type="button"
          class="panel-eye"
          :class="resume.sectionVisibility.projects ? '' : 'panel-eye-off'"
          @click="resume.sectionVisibility.projects = !resume.sectionVisibility.projects"
        >
          <browse-icon
            v-if="resume.sectionVisibility.projects"
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
          <browse-off-icon
            v-else
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
        </button>
      </div>
      <div v-if="panels.project" class="panel-body mt-4 space-y-3">
        <div
          v-if="!resume.projects.length"
          class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"
        >
          暂无项目经历，点击下方按钮新增。
        </div>
        <draggable
          v-else
          v-model="resume.projects"
          item-key="id"
          handle=".drag-handle"
          class="drag-list"
          ghost-class="drag-ghost"
          chosen-class="drag-chosen"
          drag-class="drag-dragging"
          :animation="180"
        >
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button type="button" class="drag-handle" title="拖拽排序">::</button>
                  <span class="text-sm font-semibold text-slate-800">项目 {{ index + 1 }}</span>
                  <span
                    v-if="item.hidden"
                    class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                  >
                    已隐藏（预览不显示）
                  </span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-project-hidden', item.id)">
                    {{ item.hidden ? '显示' : '隐藏' }}
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === 0"
                    @click="$emit('move-project-up', index)"
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === resume.projects.length - 1"
                    @click="$emit('move-project-down', index)"
                  >
                    下移
                  </button>
                  <button type="button" class="small-btn small-btn-danger" @click="$emit('remove-project', item.id)">
                    删除
                  </button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap">
                  <span class="field-label">项目名称</span>
                  <input v-model="item.name" class="field-input" placeholder="例如：TsumiMusic" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">项目角色</span>
                  <input v-model="item.role" class="field-input" placeholder="例如：后端负责人" />
                </label>
                <label class="field-wrap sm:col-span-2">
                  <span class="field-label">项目周期</span>
                  <input v-model="item.period" class="field-input" placeholder="例如：2025.09 - 2026.01" />
                </label>
                <label class="field-wrap sm:col-span-2">
                  <span class="field-label">技术标签（逗号分隔）</span>
                  <input
                    v-model="item.tags"
                    class="field-input"
                    placeholder="例如：SpringBoot, Redis, MySQL"
                  />
                </label>
                <label class="field-wrap sm:col-span-2">
                  <span class="field-label">项目描述</span>
                  <textarea
                    v-model="item.summary"
                    class="field-input field-textarea h-28"
                    placeholder="建议包含业务目标、核心能力和结果"
                  ></textarea>
                </label>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-project')">
          + 新增项目经历
        </button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'awards')">
          <span class="panel-caret">{{ panels.awards ? '▾' : '▸' }}</span>
          <span class="panel-title">荣誉奖项</span>
        </button>
        <button
          type="button"
          class="panel-eye"
          :class="resume.sectionVisibility.awards ? '' : 'panel-eye-off'"
          @click="resume.sectionVisibility.awards = !resume.sectionVisibility.awards"
        >
          <browse-icon
            v-if="resume.sectionVisibility.awards"
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
          <browse-off-icon
            v-else
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
        </button>
      </div>
      <div v-if="panels.awards" class="panel-body mt-4 space-y-3">
        <div
          v-if="!resume.awards.length"
          class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"
        >
          暂无荣誉奖项，点击下方按钮新增。
        </div>
        <draggable
          v-else
          v-model="resume.awards"
          item-key="id"
          handle=".drag-handle"
          class="drag-list"
          ghost-class="drag-ghost"
          chosen-class="drag-chosen"
          drag-class="drag-dragging"
          :animation="180"
        >
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button type="button" class="drag-handle" title="拖拽排序">::</button>
                  <span class="text-sm font-semibold text-slate-800">奖项 {{ index + 1 }}</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-award-hidden', item.id)">
                    {{ item.hidden ? '显示' : '隐藏' }}
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === 0"
                    @click="$emit('move-award-up', index)"
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === resume.awards.length - 1"
                    @click="$emit('move-award-down', index)"
                  >
                    下移
                  </button>
                  <button type="button" class="small-btn small-btn-danger" @click="$emit('remove-award', item.id)">
                    删除
                  </button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap">
                  <span class="field-label">奖项名称</span>
                  <input v-model="item.name" class="field-input" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">获奖级别</span>
                  <input v-model="item.level" class="field-input" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">颁发单位</span>
                  <input v-model="item.issuer" class="field-input" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">获奖时间</span>
                  <input v-model="item.date" class="field-input" />
                </label>
                <label class="field-wrap sm:col-span-2">
                  <span class="field-label">补充描述</span>
                  <textarea v-model="item.description" class="field-input field-textarea h-24"></textarea>
                </label>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-award')">
          + 新增荣誉奖项
        </button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'certificates')">
          <span class="panel-caret">{{ panels.certificates ? '▾' : '▸' }}</span>
          <span class="panel-title">证书</span>
        </button>
        <button
          type="button"
          class="panel-eye"
          :class="resume.sectionVisibility.certificates ? '' : 'panel-eye-off'"
          @click="resume.sectionVisibility.certificates = !resume.sectionVisibility.certificates"
        >
          <browse-icon
            v-if="resume.sectionVisibility.certificates"
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
          <browse-off-icon
            v-else
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
        </button>
      </div>
      <div v-if="panels.certificates" class="panel-body mt-4 space-y-3">
        <div
          v-if="!resume.certificates.length"
          class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"
        >
          暂无证书，点击下方按钮新增。
        </div>
        <draggable
          v-else
          v-model="resume.certificates"
          item-key="id"
          handle=".drag-handle"
          class="drag-list"
          ghost-class="drag-ghost"
          chosen-class="drag-chosen"
          drag-class="drag-dragging"
          :animation="180"
        >
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button type="button" class="drag-handle" title="拖拽排序">::</button>
                  <span class="text-sm font-semibold text-slate-800">证书 {{ index + 1 }}</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-certificate-hidden', item.id)">
                    {{ item.hidden ? '显示' : '隐藏' }}
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === 0"
                    @click="$emit('move-certificate-up', index)"
                  >
                    上移
                  </button>
                  <button
                    type="button"
                    class="small-btn disabled:cursor-not-allowed disabled:opacity-40"
                    :disabled="index === resume.certificates.length - 1"
                    @click="$emit('move-certificate-down', index)"
                  >
                    下移
                  </button>
                  <button
                    type="button"
                    class="small-btn small-btn-danger"
                    @click="$emit('remove-certificate', item.id)"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap">
                  <span class="field-label">证书名称</span>
                  <input v-model="item.name" class="field-input" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">颁发机构</span>
                  <input v-model="item.issuer" class="field-input" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">获得时间</span>
                  <input v-model="item.date" class="field-input" />
                </label>
                <label class="field-wrap">
                  <span class="field-label">证书编号</span>
                  <input v-model="item.credentialId" class="field-input" />
                </label>
                <label class="field-wrap sm:col-span-2">
                  <span class="field-label">补充描述</span>
                  <textarea v-model="item.description" class="field-input field-textarea h-24"></textarea>
                </label>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-certificate')">
          + 新增证书
        </button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'selfSummary')">
          <span class="panel-caret">{{ panels.selfSummary ? '▾' : '▸' }}</span>
          <span class="panel-title">自我评价</span>
        </button>
        <button
          type="button"
          class="panel-eye"
          :class="resume.sectionVisibility.selfSummary ? '' : 'panel-eye-off'"
          @click="resume.sectionVisibility.selfSummary = !resume.sectionVisibility.selfSummary"
        >
          <browse-icon
            v-if="resume.sectionVisibility.selfSummary"
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
          <browse-off-icon
            v-else
            :fill-color="['transparent', 'transparent']"
            :stroke-color="['currentColor', '#0052d9']"
            :stroke-width="2"
          />
        </button>
      </div>
      <div v-if="panels.selfSummary" class="panel-body mt-4 space-y-3">
        <label class="field-wrap">
          <span class="field-label">内容</span>
          <textarea v-model="resume.selfSummary.content" class="field-input field-textarea h-28"></textarea>
        </label>
        <label class="switch-field">
          <input v-model="resume.selfSummary.hidden" type="checkbox" class="h-4 w-4 accent-sky-600" />
          <span>仅隐藏这段内容（预览不显示）</span>
        </label>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'theme')">
          <span class="panel-caret">{{ panels.theme ? '▾' : '▸' }}</span>
          <span class="panel-title">主题配置</span>
        </button>
      </div>
      <div v-if="panels.theme" class="panel-body mt-4 space-y-4">
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <label class="field-label mb-2 block">姓名字体</label>
          <select v-model="resume.theme.nameFont" class="field-input">
            <option v-for="option in nameFontOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <label class="field-label mb-2 block">姓名字号</label>
          <div class="setting-slider">
            <Slider
              :model-value="resume.theme.nameFontSize"
              :min="nameFontSizeMin"
              :max="nameFontSizeMax"
              :step="0.5"
              :input-number-props="sliderInputProps"
              @change="onNameFontSizeChange"
            />
          </div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <label class="field-label mb-2 block">学校字体</label>
          <select v-model="resume.theme.schoolFont" class="field-input">
            <option v-for="option in nameFontOptions" :key="`school-${option.value}`" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <label class="field-label mb-2 block">学校字号</label>
          <div class="setting-slider">
            <Slider
              :model-value="resume.theme.schoolFontSize"
              :min="schoolFontSizeMin"
              :max="schoolFontSizeMax"
              :step="0.5"
              :input-number-props="sliderInputProps"
              @change="onSchoolFontSizeChange"
            />
          </div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <label class="field-label mb-2 block">主题色（支持透明）</label>
          <div class="color-panel-wrap">
            <ColorPicker
              :model-value="getColorValue(resume.theme.primaryColor)"
              format="RGBA"
              :enable-alpha="true"
              :show-primary-color-preview="false"
              :color-modes="['monochrome', 'linear-gradient']"
              @update:model-value="resume.theme.primaryColor = $event"
              @change="resume.theme.primaryColor = $event"
            />
          </div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <label class="field-label mb-2 block">姓名颜色</label>
          <div class="flex items-center gap-2">
            <div class="color-panel-wrap">
              <ColorPicker
                :model-value="getColorValue(resume.theme.nameColor, resume.theme.primaryColor || '#4a9fff')"
                format="RGBA"
                :enable-alpha="true"
                :show-primary-color-preview="false"
                :color-modes="['monochrome', 'linear-gradient']"
                @update:model-value="resume.theme.nameColor = $event"
                @change="resume.theme.nameColor = $event"
              />
            </div>
            <button type="button" class="small-btn" @click="resume.theme.nameColor = ''">恢复默认</button>
          </div>
        </div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
          <label class="field-label mb-2 block">学校颜色</label>
          <div class="flex items-center gap-2">
            <div class="color-panel-wrap">
              <ColorPicker
                :model-value="getColorValue(resume.theme.schoolColor, resume.theme.primaryColor || '#4a9fff')"
                format="RGBA"
                :enable-alpha="true"
                :show-primary-color-preview="false"
                :color-modes="['monochrome', 'linear-gradient']"
                @update:model-value="resume.theme.schoolColor = $event"
                @change="resume.theme.schoolColor = $event"
              />
            </div>
            <button type="button" class="small-btn" @click="resume.theme.schoolColor = ''">恢复默认</button>
          </div>
        </div>
        <label class="switch-field">
          <input v-model="resume.theme.boldMajor" type="checkbox" class="h-4 w-4 accent-sky-600" />
          <span>专业加粗显示</span>
        </label>
      </div>
    </article>
  </aside>
</template>
