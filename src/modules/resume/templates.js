import { SCHEMA_VERSION } from './constants'
import {
  createAwardItem,
  createCertificateItem,
  createEducationItem,
  createInternshipItem,
  createProjectItem,
  createResearchExperienceItem,
  createSectionVisibility,
} from './factories'
import { normalizePhotoConfig } from './photoConfig'
import { createDefaultLayout } from './sections'
import { DEFAULT_NAME_FONT, DEFAULT_SCHOOL_FONT } from './nameFont'
import { DEFAULT_NAME_FONT_SIZE, DEFAULT_SCHOOL_FONT_SIZE } from './typography'

export function createEmptyResume() {
  return {
    meta: {
      schemaVersion: SCHEMA_VERSION,
    },
    profile: {
      name: '',
      title: '',
      phone: '',
      email: '',
      website: '',
      photo: '',
      photoMeta: null,
    },
    educations: [],
    skills: '',
    internships: [],
    researchExperiences: [],
    projects: [],
    awards: [],
    certificates: [],
    selfSummary: {
      content: '',
      hidden: false,
    },
    sectionVisibility: createSectionVisibility(),
    layout: createDefaultLayout(),
    theme: {
      primaryColor: '#4a9fff',
      nameColor: '',
      schoolColor: '',
      nameFont: DEFAULT_NAME_FONT,
      nameFontSize: DEFAULT_NAME_FONT_SIZE,
      schoolFont: DEFAULT_SCHOOL_FONT,
      schoolFontSize: DEFAULT_SCHOOL_FONT_SIZE,
      boldMajor: false,
      educationFirst: true,
      photoConfig: normalizePhotoConfig(),
    },
  }
}

export function createDemoResume() {
  return {
    meta: {
      schemaVersion: SCHEMA_VERSION,
    },
    profile: {
      name: '哈基米',
      title: '求职意向：后端开发工程师',
      phone: '138****1234',
      email: 'zhangsan@example.com',
      website: 'https://github.com/zhangsan',
      photo: '',
      photoMeta: null,
    },
    educations: [
      createEducationItem({
        id: 'education-demo-1',
        school: '电子科技大学(985)',
        degree: '本科',
        major: '计算机科学与技术',
        studyPeriod: '2023-2027',
      }),
      
    ],
    skills: `**编程语言**：熟练掌握 Java、Python，熟悉 JavaScript/TypeScript
**后端框架**：精通 Spring Boot、MyBatis，了解 Spring Cloud 微服务架构
**数据库**：熟悉 MySQL 优化与事务，掌握 Redis 缓存设计与使用`,
    internships: [
      createInternshipItem({
        id: 'internship-demo-1',
        company: '某互联网公司',
        department: '技术部',
        role: '后端开发实习生',
        period: '2023.07 - 2023.12',
        location: '北京',
        summary: '参与业务系统开发，负责核心接口设计与性能优化工作。',
        highlights: `使用 **Redis + 布隆过滤器** 解决缓存穿透问题，提升接口响应速度 30%
优化数据库查询语句，通过索引优化将核心接口延迟降低 40%
设计并实现消息队列异步处理机制，提升系统吞吐量 2 倍`,
        logo: '',
      }),
    ],
    researchExperiences: [
      createResearchExperienceItem({
        id: 'research-demo-1',
        title: '多模态视觉导航中的鲁棒目标识别研究',
        lab: '智能感知与机器人实验室',
        role: '本科科研助理',
        supervisor: '指导教师：李教授',
        period: '2024.03 - 2025.01',
        paperTitle: 'Robust Object Recognition for Indoor Navigation with Multi-Modal Fusion',
        journal: '在投 SCI 期刊 / 一作',
        publicationStatus: '审稿中',
        summary: '围绕室内移动机器人导航场景，负责目标检测、特征融合与实验评估模块开发，完成数据整理与论文撰写支持。',
        highlights: `搭建 **RGB + 深度信息融合** 识别流程，在自建数据集上将复杂遮挡场景识别准确率提升 11%
负责论文实验部分复现与可视化，整理对比实验、消融实验与图表结果
协助完成投稿材料撰写，包括摘要润色、图表排版与期刊格式适配`,
      }),
    ],
    projects: [
      createProjectItem({
        id: 'project-demo-1',
        name: '在线商城系统',
        role: '后端负责人',
        period: '2023.03 - 2023.06',
        tags: 'SpringBoot, MySQL, Redis, RabbitMQ, Vue3',
        summary:
          '基于微服务架构的电商系统，实现商品管理、订单处理、支付集成等核心功能，采用分布式锁、缓存策略等技术保障系统性能与可靠性。',
      }),
    ],
    awards: [
      createAwardItem({
        id: 'award-demo-1',
        name: '全国大学生计算机设计大赛',
        issuer: '教育部',
        level: '省级一等奖',
        date: '2022.10',
        description: '负责项目后端开发与数据库设计，项目获得评委高度评价。',
      }),
    ],
    certificates: [
      createCertificateItem({
        id: 'certificate-demo-1',
        name: 'CET-6',
        issuer: '全国大学英语四六级考试委员会',
        date: '2022.06',
        credentialId: 'CET6-2022-000001',
        description: '具备良好的英语阅读和写作能力，能够阅读英文技术文档。',
      }),
    ],
    selfSummary: {
      content: '热爱技术，保持持续学习的习惯，注重代码质量和团队协作，善于分析和解决复杂问题。',
      hidden: false,
    },
    sectionVisibility: createSectionVisibility(),
    layout: createDefaultLayout(),
    theme: {
      primaryColor: '#4a9fff',
      nameColor: '',
      schoolColor: '',
      nameFont: DEFAULT_NAME_FONT,
      nameFontSize: DEFAULT_NAME_FONT_SIZE,
      schoolFont: DEFAULT_SCHOOL_FONT,
      schoolFontSize: DEFAULT_SCHOOL_FONT_SIZE,
      boldMajor: false,
      educationFirst: true,
      photoConfig: normalizePhotoConfig(),
    },
  }
}
