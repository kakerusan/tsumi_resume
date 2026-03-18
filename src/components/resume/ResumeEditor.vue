<script setup>
import { computed } from 'vue'
import Draggable from 'vuedraggable'
import { ColorPicker } from 'tdesign-vue-next'
import { BrowseIcon, BrowseOffIcon } from 'tdesign-icons-vue-next'

const props = defineProps({
  resume: { type: Object, required: true },
  panels: { type: Object, required: true },
  photoUploadMessage: { type: String, default: '' },
  photoUploadError: { type: String, default: '' },
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
</script>

<template>
  <aside class="no-print space-y-4 xl:sticky xl:top-5 xl:h-[calc(100vh-5rem)] xl:overflow-auto">
    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'profile')">
          <span class="panel-caret">{{ panels.profile ? '▾' : '▸' }}</span>
          <span class="panel-title">基本信息</span>
        </button>
        <button type="button" class="panel-eye" :class="resume.sectionVisibility.profile ? '' : 'panel-eye-off'" @click="resume.sectionVisibility.profile = !resume.sectionVisibility.profile">
          <browse-icon v-if="resume.sectionVisibility.profile" :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
          <browse-off-icon v-else :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
        </button>
      </div>
      <div v-if="panels.profile" class="panel-body mt-4 grid gap-3 md:grid-cols-3">
        <label class="field-wrap"><span class="field-label">姓名</span><input v-model="resume.profile.name" class="field-input" /></label>
        <label class="field-wrap"><span class="field-label">证件照</span><button type="button" class="danger-btn mt-[2px]" @click="$emit('remove-photo')">移除证件照</button></label>
        <label class="field-wrap"><span class="field-label">布局顺序</span><label class="switch-field"><input v-model="resume.theme.educationFirst" type="checkbox" class="h-4 w-4 accent-sky-600" /><span>教育背景优先</span></label></label>
        <label class="field-wrap"><span class="field-label">邮箱</span><input v-model="resume.profile.email" class="field-input" /></label>
        <label class="field-wrap"><span class="field-label">联系方式</span><input v-model="resume.profile.phone" class="field-input" /></label>
        <label class="field-wrap"><span class="field-label">个人网站</span><input v-model="resume.profile.website" class="field-input" /></label>
        <label class="field-wrap md:col-span-3"><span class="field-label">求职意向</span><input v-model="resume.profile.title" class="field-input" /></label>
        <label class="field-wrap md:col-span-3">
          <span class="field-label">证件照上传（JPG / PNG / WebP，5MB 内保留原图）</span>
          <div class="mt-2 flex flex-wrap items-center gap-3"><input type="file" accept="image/jpeg,image/png,image/webp" class="file-input" @change="$emit('photo-change', $event)" /></div>
          <p v-if="photoUploadMessage" class="mt-2 text-xs font-medium text-emerald-600">{{ photoUploadMessage }}</p>
          <p v-if="photoUploadError" class="mt-2 text-xs font-medium text-rose-600">{{ photoUploadError }}</p>
          <p v-if="photoMetaSummary" class="mt-1 text-xs text-slate-500">{{ photoMetaSummary }}</p>
        </label>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'education')">
          <span class="panel-caret">{{ panels.education ? '▾' : '▸' }}</span>
          <span class="panel-title">教育背景</span>
        </button>
        <button type="button" class="panel-eye" :class="resume.sectionVisibility.education ? '' : 'panel-eye-off'" @click="resume.sectionVisibility.education = !resume.sectionVisibility.education">
          <browse-icon v-if="resume.sectionVisibility.education" :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
          <browse-off-icon v-else :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
        </button>
      </div>
      <div v-if="panels.education" class="panel-body mt-4 space-y-3">
        <div v-if="!resume.educations.length" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">暂无教育经历，点击下方按钮新增。</div>
        <draggable v-else v-model="resume.educations" item-key="id" handle=".drag-handle" class="drag-list" ghost-class="drag-ghost" chosen-class="drag-chosen" drag-class="drag-dragging" :animation="180">
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button type="button" class="drag-handle" title="拖拽排序">::</button>
                  <span class="text-sm font-semibold text-slate-800">教育 {{ index + 1 }}</span>
                  <span v-if="item.hidden" class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">已隐藏（预览不显示）</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-education-hidden', item.id)">{{ item.hidden ? '显示' : '隐藏' }}</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===0" @click="$emit('move-education-up', index)">上移</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===resume.educations.length-1" @click="$emit('move-education-down', index)">下移</button>
                  <button type="button" class="small-btn small-btn-danger" @click="$emit('remove-education', item.id)">删除</button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap"><span class="field-label">学校</span><input v-model="item.school" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">学历</span><input v-model="item.degree" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">专业</span><input v-model="item.major" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">起止时间</span><input v-model="item.studyPeriod" class="field-input" /></label>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-education')">+ 新增教育经历</button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'skills')">
          <span class="panel-caret">{{ panels.skills ? '▾' : '▸' }}</span>
          <span class="panel-title">技术栈</span>
        </button>
        <button type="button" class="panel-eye" :class="resume.sectionVisibility.skills ? '' : 'panel-eye-off'" @click="resume.sectionVisibility.skills = !resume.sectionVisibility.skills">
          <browse-icon v-if="resume.sectionVisibility.skills" :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
          <browse-off-icon v-else :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
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
        <button type="button" class="panel-eye" :class="resume.sectionVisibility.internships ? '' : 'panel-eye-off'" @click="resume.sectionVisibility.internships = !resume.sectionVisibility.internships">
          <browse-icon v-if="resume.sectionVisibility.internships" :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
          <browse-off-icon v-else :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
        </button>
      </div>
      <div v-if="panels.internship" class="panel-body mt-4 space-y-3">
        <div v-if="!resume.internships.length" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">暂无实习经历，点击下方按钮新增。</div>
        <draggable v-else v-model="resume.internships" item-key="id" handle=".drag-handle" class="drag-list" ghost-class="drag-ghost" chosen-class="drag-chosen" drag-class="drag-dragging" :animation="180">
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button type="button" class="drag-handle" title="拖拽排序">::</button>
                  <span class="text-sm font-semibold text-slate-800">实习 {{ index + 1 }}</span>
                  <span v-if="item.hidden" class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">已隐藏（预览不显示）</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-internship-hidden', item.id)">{{ item.hidden ? '显示' : '隐藏' }}</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===0" @click="$emit('move-internship-up', index)">上移</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===resume.internships.length-1" @click="$emit('move-internship-down', index)">下移</button>
                  <button type="button" class="small-btn small-btn-danger" @click="$emit('remove-internship', item.id)">删除</button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap"><span class="field-label">公司名称</span><input v-model="item.company" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">岗位</span><input v-model="item.role" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">业务线 / 部门</span><input v-model="item.department" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">时间</span><input v-model="item.period" class="field-input" /></label>
                <label class="field-wrap sm:col-span-2"><span class="field-label">地点（可留空）</span><input v-model="item.location" class="field-input" /></label>
                <label class="field-wrap sm:col-span-2"><span class="field-label">工作简介</span><textarea v-model="item.summary" class="field-input field-textarea h-24"></textarea></label>
                <label class="field-wrap sm:col-span-2"><span class="field-label">成果亮点（按行输入）</span><textarea v-model="item.highlights" class="field-input field-textarea h-28"></textarea></label>
                <div class="field-wrap sm:col-span-2">
                  <span class="field-label">公司 Logo</span>
                  <div class="mt-2 flex items-center gap-3">
                    <input type="file" accept="image/*" class="file-input" @change="$emit('logo-change', item.id, $event)" />
                    <button type="button" class="toolbar-btn !px-3 !py-1.5 !text-xs" @click="$emit('remove-logo', item.id)">移除</button>
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
                    <input v-model.number="item.logoSize" type="number" min="14" max="48" class="field-input !w-20 !px-2 !py-1.5 text-center" />
                  </div>
                </div>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-internship')">+ 新增实习经历</button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'project')">
          <span class="panel-caret">{{ panels.project ? '▾' : '▸' }}</span>
          <span class="panel-title">项目经历</span>
        </button>
        <button type="button" class="panel-eye" :class="resume.sectionVisibility.projects ? '' : 'panel-eye-off'" @click="resume.sectionVisibility.projects = !resume.sectionVisibility.projects">
          <browse-icon v-if="resume.sectionVisibility.projects" :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
          <browse-off-icon v-else :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
        </button>
      </div>
      <div v-if="panels.project" class="panel-body mt-4 space-y-3">
        <div v-if="!resume.projects.length" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">暂无项目经历，点击下方按钮新增。</div>
        <draggable v-else v-model="resume.projects" item-key="id" handle=".drag-handle" class="drag-list" ghost-class="drag-ghost" chosen-class="drag-chosen" drag-class="drag-dragging" :animation="180">
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button type="button" class="drag-handle" title="拖拽排序">::</button>
                  <span class="text-sm font-semibold text-slate-800">项目 {{ index + 1 }}</span>
                  <span v-if="item.hidden" class="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">已隐藏（预览不显示）</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-project-hidden', item.id)">{{ item.hidden ? '显示' : '隐藏' }}</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===0" @click="$emit('move-project-up', index)">上移</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===resume.projects.length-1" @click="$emit('move-project-down', index)">下移</button>
                  <button type="button" class="small-btn small-btn-danger" @click="$emit('remove-project', item.id)">删除</button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap"><span class="field-label">项目名称</span><input v-model="item.name" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">项目角色</span><input v-model="item.role" class="field-input" /></label>
                <label class="field-wrap sm:col-span-2"><span class="field-label">项目周期</span><input v-model="item.period" class="field-input" /></label>
                <label class="field-wrap sm:col-span-2"><span class="field-label">技术标签（逗号分隔）</span><input v-model="item.tags" class="field-input" /></label>
                <label class="field-wrap sm:col-span-2"><span class="field-label">项目描述</span><textarea v-model="item.summary" class="field-input field-textarea h-28"></textarea></label>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-project')">+ 新增项目经历</button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'awards')">
          <span class="panel-caret">{{ panels.awards ? '▾' : '▸' }}</span>
          <span class="panel-title">荣誉奖项</span>
        </button>
        <button type="button" class="panel-eye" :class="resume.sectionVisibility.awards ? '' : 'panel-eye-off'" @click="resume.sectionVisibility.awards = !resume.sectionVisibility.awards">
          <browse-icon v-if="resume.sectionVisibility.awards" :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
          <browse-off-icon v-else :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
        </button>
      </div>
      <div v-if="panels.awards" class="panel-body mt-4 space-y-3">
        <div v-if="!resume.awards.length" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">暂无荣誉奖项，点击下方按钮新增。</div>
        <draggable v-else v-model="resume.awards" item-key="id" handle=".drag-handle" class="drag-list" ghost-class="drag-ghost" chosen-class="drag-chosen" drag-class="drag-dragging" :animation="180">
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2"><button type="button" class="drag-handle" title="拖拽排序">::</button><span class="text-sm font-semibold text-slate-800">奖项 {{ index + 1 }}</span></div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-award-hidden', item.id)">{{ item.hidden ? '显示' : '隐藏' }}</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===0" @click="$emit('move-award-up', index)">上移</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===resume.awards.length-1" @click="$emit('move-award-down', index)">下移</button>
                  <button type="button" class="small-btn small-btn-danger" @click="$emit('remove-award', item.id)">删除</button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap"><span class="field-label">奖项名称</span><input v-model="item.name" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">获奖级别</span><input v-model="item.level" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">颁发单位</span><input v-model="item.issuer" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">获奖时间</span><input v-model="item.date" class="field-input" /></label>
                <label class="field-wrap sm:col-span-2"><span class="field-label">补充描述</span><textarea v-model="item.description" class="field-input field-textarea h-24"></textarea></label>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-award')">+ 新增荣誉奖项</button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'certificates')">
          <span class="panel-caret">{{ panels.certificates ? '▾' : '▸' }}</span>
          <span class="panel-title">证书</span>
        </button>
        <button type="button" class="panel-eye" :class="resume.sectionVisibility.certificates ? '' : 'panel-eye-off'" @click="resume.sectionVisibility.certificates = !resume.sectionVisibility.certificates">
          <browse-icon v-if="resume.sectionVisibility.certificates" :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
          <browse-off-icon v-else :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
        </button>
      </div>
      <div v-if="panels.certificates" class="panel-body mt-4 space-y-3">
        <div v-if="!resume.certificates.length" class="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">暂无证书，点击下方按钮新增。</div>
        <draggable v-else v-model="resume.certificates" item-key="id" handle=".drag-handle" class="drag-list" ghost-class="drag-ghost" chosen-class="drag-chosen" drag-class="drag-dragging" :animation="180">
          <template #item="{ element: item, index }">
            <article class="sub-card drag-item">
              <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2"><button type="button" class="drag-handle" title="拖拽排序">::</button><span class="text-sm font-semibold text-slate-800">证书 {{ index + 1 }}</span></div>
                <div class="flex flex-wrap gap-1.5">
                  <button type="button" class="small-btn" @click="$emit('toggle-certificate-hidden', item.id)">{{ item.hidden ? '显示' : '隐藏' }}</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===0" @click="$emit('move-certificate-up', index)">上移</button>
                  <button type="button" class="small-btn disabled:cursor-not-allowed disabled:opacity-40" :disabled="index===resume.certificates.length-1" @click="$emit('move-certificate-down', index)">下移</button>
                  <button type="button" class="small-btn small-btn-danger" @click="$emit('remove-certificate', item.id)">删除</button>
                </div>
              </div>
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="field-wrap"><span class="field-label">证书名称</span><input v-model="item.name" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">颁发机构</span><input v-model="item.issuer" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">获得时间</span><input v-model="item.date" class="field-input" /></label>
                <label class="field-wrap"><span class="field-label">证书编号</span><input v-model="item.credentialId" class="field-input" /></label>
                <label class="field-wrap sm:col-span-2"><span class="field-label">补充描述</span><textarea v-model="item.description" class="field-input field-textarea h-24"></textarea></label>
              </div>
            </article>
          </template>
        </draggable>
        <button type="button" class="toolbar-btn w-full border-dashed" @click="$emit('add-certificate')">+ 新增证书</button>
      </div>
    </article>

    <article class="panel-card">
      <div class="panel-head">
        <button type="button" class="panel-head-main" @click="$emit('toggle-panel', 'selfSummary')">
          <span class="panel-caret">{{ panels.selfSummary ? '▾' : '▸' }}</span>
          <span class="panel-title">自我评价</span>
        </button>
        <button type="button" class="panel-eye" :class="resume.sectionVisibility.selfSummary ? '' : 'panel-eye-off'" @click="resume.sectionVisibility.selfSummary = !resume.sectionVisibility.selfSummary">
          <browse-icon v-if="resume.sectionVisibility.selfSummary" :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
          <browse-off-icon v-else :fill-color='["transparent","transparent"]' :stroke-color='["currentColor","#0052d9"]' :stroke-width="2" />
        </button>
      </div>
      <div v-if="panels.selfSummary" class="panel-body mt-4 space-y-3">
        <label class="field-wrap"><span class="field-label">内容</span><textarea v-model="resume.selfSummary.content" class="field-input field-textarea h-28"></textarea></label>
        <label class="switch-field"><input v-model="resume.selfSummary.hidden" type="checkbox" class="h-4 w-4 accent-sky-600" /><span>仅隐藏这段内容（预览不显示）</span></label>
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
        <label class="switch-field"><input v-model="resume.theme.boldMajor" type="checkbox" class="h-4 w-4 accent-sky-600" /><span>专业加粗显示</span></label>
      </div>
    </article>
  </aside>
</template>
