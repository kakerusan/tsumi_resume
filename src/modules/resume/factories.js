let idSeed = 0
const DEFAULT_INTERNSHIP_LOGO_SIZE = 22

function clampLogoSize(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return DEFAULT_INTERNSHIP_LOGO_SIZE
  return Math.min(48, Math.max(14, Math.round(parsed)))
}

export function createId(prefix) {
  idSeed += 1
  return `${prefix}-${Date.now()}-${idSeed}`
}

export function createEducationItem(partial = {}) {
  return {
    id: partial.id || createId('education'),
    hidden: Boolean(partial.hidden),
    school: partial.school || '',
    degree: partial.degree || '',
    major: partial.major || '',
    studyPeriod: partial.studyPeriod || '',
  }
}

export function createInternshipItem(partial = {}) {
  return {
    id: partial.id || createId('internship'),
    hidden: Boolean(partial.hidden),
    company: partial.company || '',
    department: partial.department || '',
    role: partial.role || '',
    period: partial.period || '',
    location: partial.location || '',
    summary: partial.summary || '',
    highlights: partial.highlights || '',
    logo: partial.logo || '',
    stripColor: partial.stripColor || '',
    logoSize: clampLogoSize(partial.logoSize),
  }
}

export function createProjectItem(partial = {}) {
  return {
    id: partial.id || createId('project'),
    hidden: Boolean(partial.hidden),
    name: partial.name || '',
    role: partial.role || '',
    period: partial.period || '',
    tags: partial.tags || '',
    summary: partial.summary || '',
  }
}

export function createAwardItem(partial = {}) {
  return {
    id: partial.id || createId('award'),
    hidden: Boolean(partial.hidden),
    name: partial.name || '',
    issuer: partial.issuer || '',
    level: partial.level || '',
    date: partial.date || '',
    description: partial.description || '',
  }
}

export function createCertificateItem(partial = {}) {
  return {
    id: partial.id || createId('certificate'),
    hidden: Boolean(partial.hidden),
    name: partial.name || '',
    issuer: partial.issuer || '',
    date: partial.date || '',
    credentialId: partial.credentialId || '',
    description: partial.description || '',
  }
}

export function createSectionVisibility(partial = {}) {
  return {
    profile: partial.profile !== false,
    education: partial.education !== false,
    skills: partial.skills !== false,
    internships: partial.internships !== false,
    projects: partial.projects !== false,
    awards: partial.awards !== false,
    certificates: partial.certificates !== false,
    selfSummary: partial.selfSummary !== false,
  }
}

export function createPanelsState() {
  return {
    profile: true,
    education: true,
    skills: true,
    internship: true,
    project: true,
    awards: true,
    certificates: true,
    selfSummary: true,
    theme: true,
  }
}
