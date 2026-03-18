<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Image as TImage } from 'tdesign-vue-next'

import { normalizePhotoConfig } from '../../modules/resume/photoConfig'
import { normalizeLayoutOrder } from '../../modules/resume/sections'

const A4_HEIGHT_PX = 1122

const props = defineProps({
  resume: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['page-overflow-change'])
const pageRef = ref(null)
let resizeObserver = null

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function richText(text = '') {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br />')
}

function splitLines(text = '') {
  return String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function splitTags(text = '') {
  return String(text)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function cleanText(value = '') {
  return String(value).trim()
}

function formatWebsiteLabel(url = '') {
  return String(url).replace(/^https?:\/\//, '').replace(/\/$/, '')
}

function getWebsiteType(url = '') {
  const normalized = String(url).toLowerCase()
  if (normalized.includes('github.com')) return 'github'
  if (normalized.includes('gitee.com')) return 'gitee'
  return 'link'
}

function parseLogoSize(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 22
  return Math.min(48, Math.max(14, Math.round(parsed)))
}

function getInternshipStripStyle(item) {
  if (!cleanText(item?.stripColor)) return null
  return { backgroundColor: item.stripColor }
}

function getInternshipLogoStyle(item) {
  return { height: `${parseLogoSize(item?.logoSize)}px` }
}

function emitOverflowStatus() {
  const element = pageRef.value
  if (!element) return
  const height = Math.ceil(element.scrollHeight)
  emit('page-overflow-change', {
    overflow: height > A4_HEIGHT_PX,
    height,
  })
}

onMounted(() => {
  nextTick(emitOverflowStatus)
  if (typeof ResizeObserver !== 'undefined' && pageRef.value) {
    resizeObserver = new ResizeObserver(() => {
      emitOverflowStatus()
    })
    resizeObserver.observe(pageRef.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

watch(
  () => props.resume,
  () => {
    nextTick(emitOverflowStatus)
  },
  { deep: true }
)

const hasPhoto = computed(() => Boolean(props.resume.profile.photo))
const photoConfig = computed(() => normalizePhotoConfig(props.resume.theme?.photoConfig || {}))
const photoStyle = computed(() => ({
  width: `${photoConfig.value.width}px`,
  height: `${photoConfig.value.height}px`,
}))
const resumeInfoStyle = computed(() => ({
  maxWidth: `calc(100% - ${photoConfig.value.width + 42}px)`,
}))

const sectionVisibility = computed(() => ({
  profile: props.resume.sectionVisibility?.profile !== false,
  education: props.resume.sectionVisibility?.education !== false,
  skills: props.resume.sectionVisibility?.skills !== false,
  internships: props.resume.sectionVisibility?.internships !== false,
  projects: props.resume.sectionVisibility?.projects !== false,
  awards: props.resume.sectionVisibility?.awards !== false,
  certificates: props.resume.sectionVisibility?.certificates !== false,
  selfSummary: props.resume.sectionVisibility?.selfSummary !== false,
}))

const visibleEducations = computed(() => (props.resume.educations || []).filter((item) => !item.hidden))
const showProfile = computed(() => sectionVisibility.value.profile)
const showEducationSection = computed(() => sectionVisibility.value.education && visibleEducations.value.length > 0)
const showHeader = computed(() => showProfile.value || showEducationSection.value)

const skillLines = computed(() => splitLines(props.resume.skills))
const showSkills = computed(() => sectionVisibility.value.skills && skillLines.value.length > 0)

const visibleInternships = computed(() =>
  sectionVisibility.value.internships ? (props.resume.internships || []).filter((item) => !item.hidden) : []
)

const visibleProjects = computed(() =>
  sectionVisibility.value.projects ? (props.resume.projects || []).filter((item) => !item.hidden) : []
)

const visibleAwards = computed(() =>
  sectionVisibility.value.awards ? (props.resume.awards || []).filter((item) => !item.hidden) : []
)

const visibleCertificates = computed(() =>
  sectionVisibility.value.certificates ? (props.resume.certificates || []).filter((item) => !item.hidden) : []
)

const showSelfSummary = computed(() => {
  const content = cleanText(props.resume.selfSummary?.content || '')
  return sectionVisibility.value.selfSummary && Boolean(content) && !props.resume.selfSummary?.hidden
})

const educationFirst = computed(() => Boolean(props.resume.theme?.educationFirst))
const profileTitle = computed(() => cleanText(props.resume.profile.title))
const sectionOrderMap = computed(() => {
  const map = {}
  normalizeLayoutOrder(props.resume.layout?.order).forEach((id, index) => {
    map[id] = index + 1
  })
  return map
})

function getSectionOrder(id) {
  return sectionOrderMap.value[id] ?? 99
}

const headerOrder = computed(() => {
  const orderList = []
  if (showProfile.value) orderList.push(getSectionOrder('profile'))
  if (showEducationSection.value) orderList.push(getSectionOrder('education'))
  return orderList.length ? Math.min(...orderList) : 99
})

const contactItems = computed(() => {
  const items = []
  const phone = cleanText(props.resume.profile.phone)
  const email = cleanText(props.resume.profile.email)
  const website = cleanText(props.resume.profile.website)

  if (phone) items.push({ type: 'phone', text: phone, href: `tel:${phone}` })
  if (email) items.push({ type: 'email', text: email, href: `mailto:${email}` })
  if (website) items.push({ type: getWebsiteType(website), text: formatWebsiteLabel(website), href: website })
  return items
})

const hasAnyVisibleSection = computed(
  () =>
    showHeader.value ||
    showEducationSection.value ||
    showSkills.value ||
    visibleInternships.value.length > 0 ||
    visibleProjects.value.length > 0 ||
    visibleAwards.value.length > 0 ||
    visibleCertificates.value.length > 0 ||
    showSelfSummary.value
)
</script>

<template>
  <section class="glass-card flex justify-center p-2 sm:p-4 lg:p-5">
    <article id="resume-preview-page" ref="pageRef" class="resume-page resume-page--editorial">
      <div class="resume-flow">
        <header v-if="showHeader" class="resume-head resume-head--plain" :style="{ order: headerOrder }">
          <div :class="['resume-identity', hasPhoto ? 'resume-identity--with-photo' : 'resume-identity--no-photo']">
            <div class="resume-info" :class="hasPhoto ? 'text-left' : 'text-center'" :style="hasPhoto ? resumeInfoStyle : null">
              <template v-if="showProfile">
                <h2 class="title-font text-[18px] font-bold tracking-tight text-[color:var(--brand-deep)]">
                  {{ resume.profile.name || '你的姓名' }}
                </h2>
                <p v-if="profileTitle" class="mt-0 text-[12px] font-semibold text-slate-700">
                  {{ profileTitle }}
                </p>
              </template>

              <div v-if="showEducationSection && educationFirst" class="mt-1 space-y-0 text-[12.5px] leading-5">
                <p v-for="item in visibleEducations" :key="item.id">
                  <span class="education-school-wrap">
                    <img
                      v-if="item.logo"
                      :src="item.logo"
                      alt="school logo"
                      class="education-school-logo"
                    />
                    <strong class="font-semibold text-[color:var(--brand-deep)]">{{ item.school || '学校' }}</strong>
                  </span>
                  <span class="mx-1 text-slate-300">/</span>
                  <strong class="font-semibold text-slate-800">{{ item.degree || '学历' }}</strong>
                  <template v-if="item.major">
                    <span class="mx-1 text-slate-300">/</span>
                    <span :class="resume.theme.boldMajor ? 'font-semibold text-slate-800' : 'text-slate-600'">
                      {{ item.major }}
                    </span>
                  </template>
                  <template v-if="item.studyPeriod">
                    <span class="mx-1 text-slate-300">/</span>
                    <span class="text-slate-500">{{ item.studyPeriod }}</span>
                  </template>
                </p>
              </div>

              <div v-if="showProfile && contactItems.length" class="resume-contacts">
                <a
                  v-for="item in contactItems"
                  :key="`${item.type}-${item.text}`"
                  :href="item.href"
                  class="resume-contact"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    v-if="item.type === 'phone'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M22 16.92v3a2 2 0 0 1-2.18 2a19.8 19.8 0 0 1-8.63-3.07a19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.78.68 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.25a2 2 0 0 1 2.11-.45c.84.33 1.72.56 2.62.68A2 2 0 0 1 22 16.92Z"
                    />
                  </svg>
                  <svg
                    v-else-if="item.type === 'email'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="m22 8l-8.97 5.7a2 2 0 0 1-2.06 0L2 8" />
                  </svg>
                  <svg
                    v-else-if="item.type === 'github'"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.8A5.3 5.3 0 0 0 19 4.8a4.9 4.9 0 0 0-.1-3.8s-1.1-.3-3.8 1.5a13.2 13.2 0 0 0-7 0C5.4.7 4.3 1 4.3 1a4.9 4.9 0 0 0-.1 3.8A5.3 5.3 0 0 0 2.9 8.7c0 5.3 3.2 6.5 6.2 6.8a3.4 3.4 0 0 0-.9 2.6V22" />
                  </svg>
                  <svg v-else-if="item.type === 'gitee'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 6.8A3.8 3.8 0 0 1 6.8 3h10.4A3.8 3.8 0 0 1 21 6.8v10.4A3.8 3.8 0 0 1 17.2 21H6.8A3.8 3.8 0 0 1 3 17.2Zm4.8.2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h7a1 1 0 0 0 0-2H8.8V13h5.3a1 1 0 1 0 0-2H8.8V9h6a1 1 0 0 0 0-2Z" />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 13a5 5 0 0 0 0-7l-1-1a5 5 0 0 0-7 7" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 11a5 5 0 0 0 0 7l1 1a5 5 0 0 0 7-7" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h8" />
                  </svg>
                  <span>{{ item.text }}</span>
                </a>
              </div>

              <div v-if="showEducationSection && !educationFirst" class="mt-1 space-y-0 text-[12.5px] leading-5">
                <p v-for="item in visibleEducations" :key="`edu-tail-${item.id}`">
                  <span class="education-school-wrap">
                    <img
                      v-if="item.logo"
                      :src="item.logo"
                      alt="school logo"
                      class="education-school-logo"
                    />
                    <strong class="font-semibold text-[color:var(--brand-deep)]">{{ item.school || '学校' }}</strong>
                  </span>
                  <span class="mx-1 text-slate-300">/</span>
                  <strong class="font-semibold text-slate-800">{{ item.degree || '学历' }}</strong>
                  <template v-if="item.major">
                    <span class="mx-1 text-slate-300">/</span>
                    <span :class="resume.theme.boldMajor ? 'font-semibold text-slate-800' : 'text-slate-600'">
                      {{ item.major }}
                    </span>
                  </template>
                  <template v-if="item.studyPeriod">
                    <span class="mx-1 text-slate-300">/</span>
                    <span class="text-slate-500">{{ item.studyPeriod }}</span>
                  </template>
                </p>
              </div>
            </div>

            <TImage
              v-if="hasPhoto && showProfile"
              class="resume-photo resume-photo--plain"
              fit="cover"
              shape="round"
              :src="resume.profile.photo"
              alt="profile photo"
              :style="photoStyle"
            />
          </div>
        </header>

        <section v-if="showSkills" class="resume-section" :style="{ order: getSectionOrder('skills') }">
        <h3 class="resume-section-title">
          相关技能
          <span class="resume-section-subtitle">TECH STACK</span>
        </h3>
        <ul class="skill-list">
          <li v-for="(line, index) in skillLines" :key="`skill-${index}`" class="skill-line">
            <span class="skill-line-dot"></span>
            <span class="skill-line-text" v-html="richText(line)"></span>
          </li>
        </ul>
      </section>

        <section v-if="visibleInternships.length" class="resume-section" :style="{ order: getSectionOrder('internships') }">
        <h3 class="resume-section-title">
          实习经历
          <span class="resume-section-subtitle">INTERNSHIP EXPERIENCE</span>
        </h3>
        <div class="resume-list">
          <article v-for="item in visibleInternships" :key="item.id" class="resume-entry">
            <div class="entry-strip" :style="getInternshipStripStyle(item)">
              <div class="entry-strip-main">
                <p class="entry-time">{{ item.period || '时间段' }}</p>
                <p class="entry-brand">
                  <span>{{ item.company || '公司名称' }}</span>
                  <span v-if="cleanText(item.department)" class="entry-divider">|</span>
                  <span v-if="cleanText(item.department)">{{ item.department }}</span>
                  <span v-if="cleanText(item.location)" class="entry-location">· {{ item.location }}</span>
                </p>
                <p class="entry-role">{{ item.role || '岗位' }}</p>
              </div>
              <img v-if="item.logo" :src="item.logo" alt="实习公司 logo" class="entry-logo" :style="getInternshipLogoStyle(item)" />
            </div>
            <div class="entry-body">
              <p v-if="cleanText(item.summary)" class="entry-summary">
                <span class="entry-label">简介：</span>
                <span v-html="richText(item.summary)"></span>
              </p>
              <ul v-if="splitLines(item.highlights).length" class="entry-bullets">
                <li v-for="(line, index) in splitLines(item.highlights)" :key="`${item.id}-highlight-${index}`" class="entry-bullet">
                  <span class="entry-bullet-dot"></span>
                  <span v-html="richText(line)"></span>
                </li>
              </ul>
            </div>
          </article>
        </div>
      </section>

        <section v-if="visibleProjects.length" class="resume-section" :style="{ order: getSectionOrder('projects') }">
        <h3 class="resume-section-title">
          项目经历
          <span class="resume-section-subtitle">PROJECTS</span>
        </h3>
        <div class="resume-list">
          <article v-for="item in visibleProjects" :key="item.id" class="project-entry">
            <div class="project-entry-head">
              <div class="project-entry-title-row">
                <p class="project-entry-name">{{ item.name || '项目名称' }}</p>
                <p class="project-entry-meta" v-if="cleanText(item.role) || cleanText(item.period)">
                  <span v-if="cleanText(item.role)">{{ item.role }}</span>
                  <span v-if="cleanText(item.role) && cleanText(item.period)"> / </span>
                  <span v-if="cleanText(item.period)">{{ item.period }}</span>
                </p>
              </div>
              <div v-if="splitTags(item.tags).length" class="project-tag-row">
                <span v-for="(tag, index) in splitTags(item.tags)" :key="`${item.id}-tag-${index}`" class="project-tag">
                  {{ tag }}
                </span>
              </div>
            </div>
            <p v-if="cleanText(item.summary)" class="entry-summary">
              <span class="entry-label">简介：</span>
              <span v-html="richText(item.summary)"></span>
            </p>
          </article>
        </div>
      </section>

        <section v-if="visibleAwards.length" class="resume-section" :style="{ order: getSectionOrder('awards') }">
        <h3 class="resume-section-title">
          荣誉奖项
          <span class="resume-section-subtitle">AWARDS</span>
        </h3>
        <div class="resume-list resume-list--compact">
          <article v-for="item in visibleAwards" :key="item.id" class="plain-meta">
            <div class="plain-meta-head">
              <p class="plain-meta-title">
                <span>{{ item.name || '奖项名称' }}</span>
                <span v-if="cleanText(item.level)" class="plain-meta-level">{{ item.level }}</span>
                <span v-if="cleanText(item.issuer)" class="plain-meta-issuer">· {{ item.issuer }}</span>
              </p>
              <p class="plain-meta-date">{{ item.date || '获奖时间' }}</p>
            </div>
            <p v-if="cleanText(item.description)" class="plain-meta-desc" v-html="richText(item.description)"></p>
          </article>
        </div>
      </section>

        <section v-if="visibleCertificates.length" class="resume-section" :style="{ order: getSectionOrder('certificates') }">
        <h3 class="resume-section-title">
          证书
          <span class="resume-section-subtitle">CERTIFICATES</span>
        </h3>
        <div class="resume-list resume-list--compact">
          <article v-for="item in visibleCertificates" :key="item.id" class="plain-meta">
            <div class="plain-meta-head">
              <p class="plain-meta-title">{{ item.name || '证书名称' }}</p>
              <p class="plain-meta-date">{{ item.date || '获得时间' }}</p>
            </div>
            <p class="plain-meta-sub" v-if="cleanText(item.issuer) || cleanText(item.credentialId)">
              <span v-if="cleanText(item.issuer)">{{ item.issuer }}</span>
              <span v-if="cleanText(item.issuer) && cleanText(item.credentialId)"> / </span>
              <span v-if="cleanText(item.credentialId)">编号：{{ item.credentialId }}</span>
            </p>
            <p v-if="cleanText(item.description)" class="plain-meta-desc" v-html="richText(item.description)"></p>
          </article>
        </div>
      </section>

        <section v-if="showSelfSummary" class="resume-section" :style="{ order: getSectionOrder('selfSummary') }">
        <h3 class="resume-section-title">
          自我评价
          <span class="resume-section-subtitle">SUMMARY</span>
        </h3>
        <p class="summary-text" v-html="richText(resume.selfSummary.content)"></p>
        </section>

        <section v-if="!hasAnyVisibleSection" class="resume-section" :style="{ order: 999 }">
          <p class="summary-text text-slate-400">暂无可展示内容，请在左侧编辑区填写信息。</p>
        </section>
      </div>
    </article>
  </section>
</template>
