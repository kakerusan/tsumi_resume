import { SCHEMA_VERSION } from './constants'
import {
  createAwardItem,
  createCertificateItem,
  createEducationItem,
  createInternshipItem,
  createProjectItem,
  createSectionVisibility,
} from './factories'

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
    projects: [],
    awards: [],
    certificates: [],
    selfSummary: {
      content: '',
      hidden: false,
    },
    sectionVisibility: createSectionVisibility(),
    theme: {
      primaryColor: '#4a9fff',
      boldMajor: false,
      educationFirst: true,
    },
  }
}

export function createDemoResume() {
  return {
    meta: {
      schemaVersion: SCHEMA_VERSION,
    },
    profile: {
      name: '黄龙翔',
      title: '后端开发工程师',
      phone: '18976420973',
      email: '1832317010@qq.com',
      website: 'https://github.com/kakerusan',
      photo: '',
      photoMeta: null,
    },
    educations: [
      createEducationItem({
        id: 'education-demo-1',
        school: '电子科技大学 (985)',
        degree: '本科',
        major: '网络工程',
        studyPeriod: '2023-2027',
      }),
      createEducationItem({
        id: 'education-demo-2',
        school: '英语等级',
        degree: 'CET-6',
        major: '(GPA 3.83/4)',
        studyPeriod: '',
      }),
    ],
    skills: `• **计算机网络**：熟悉 TCP/IP 协议栈、HTTP/HTTPS 与常见网络协议。
• **Java 基础**：掌握集合、并发、JVM 内存模型与常见 GC 机制。
• **数据库**：熟悉 MySQL 索引与事务，了解 Redis 持久化与高可用。`,
    internships: [
      createInternshipItem({
        id: 'internship-demo-1',
        company: '腾讯',
        department: 'S3 人力资源产品线',
        role: '全栈开发实习生',
        period: '2026.03 - 2026.08',
        location: '深圳',
        summary: '参与招聘系统核心链路重构，负责权限、面试流程和消息通知模块。',
        highlights: `• 使用 **JWT + Redis** 实现无状态鉴权，接口延迟下降 24%
• 优化文件上传流程，支持分片与断点续传，上传成功率提升至 99.7%
• 落地缓存隔离策略，核心 API 峰值吞吐提升 1.8 倍`,
        logo: '',
      }),
    ],
    projects: [
      createProjectItem({
        id: 'project-demo-1',
        name: 'TsumiMusic',
        role: '后端负责人',
        period: '2025.09 - 2026.01',
        tags: 'SpringCloud, SpringBoot, Redis, RabbitMQ, MySQL',
        summary:
          '基于微服务的在线音乐平台，围绕用户注册、歌曲检索、订单支付与推荐系统完成模块化建设，重点优化服务治理、缓存策略与异步消息链路。',
      }),
    ],
    awards: [
      createAwardItem({
        id: 'award-demo-1',
        name: '全国大学生服务外包创新创业大赛',
        issuer: '教育部',
        level: '国家级二等奖',
        date: '2025.08',
        description: '负责后端架构设计与性能优化，项目在结题答辩中获评优秀实践案例。',
      }),
    ],
    certificates: [
      createCertificateItem({
        id: 'certificate-demo-1',
        name: 'CET-6',
        issuer: '全国大学英语四六级考试委员会',
        date: '2024.12',
        credentialId: 'CET6-2024-000001',
        description: '英语阅读与技术文档写作能力良好，可支持英文技术资料检索与沟通。',
      }),
    ],
    selfSummary: {
      content: '保持快速学习和复盘习惯，注重工程质量与协作效率，擅长从用户价值出发持续优化系统。',
      hidden: false,
    },
    sectionVisibility: createSectionVisibility(),
    theme: {
      primaryColor: '#4a9fff',
      boldMajor: false,
      educationFirst: true,
    },
  }
}
