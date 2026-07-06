/** 后台界面文案（仅 UI 显示，不涉及 API / JSON 字段名） */

export const adminRouteText = {
  dashboard: "后台控制台",
  hero: "首页视频",
  location: "所在地 / 服务范围",
  profile: "个人资料",
  services: "服务管理",
  cases: "案例管理",
  certificates: "证书管理",
  workPhotos: "工作照管理",
  tutorial: "经验分享 / 教程",
  bookings: "预约管理",
  social: "社媒 / 联系方式",
  seo: "SEO 设置",
  media: "媒体管理",
  siteModules: "站点模块",
};

export const bookingStatusText = {
  new: "新需求",
  contacted: "已联系",
  quoted: "已报价",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
  all: "全部",
};

export const mediaTypeText = {
  all: "全部",
  image: "图片",
  video: "视频",
  audio: "音频",
  document: "文档",
  other: "其他",
};

export const heroModeText = {
  caseVideoCarousel: "案例视频自动轮播",
  manualSlides: "手动视频轮播",
  singleVideo: "单视频模式",
};

export const commonActionText = {
  save: "保存",
  saving: "正在同步内容...",
  saved: "内容已同步",
  saveFailed: "保存失败，请检查接口或字段",
  delete: "删除",
  edit: "编辑",
  copy: "复制",
  preview: "预览",
  upload: "上传",
  replace: "替换",
  cancel: "取消",
  confirm: "确认",
  loading: "正在加载...",
  empty: "暂无数据",
  uploading: "正在上传媒体...",
  uploadSuccess: "媒体已加入素材库",
  uploadFailed: "上传失败，请检查文件类型",
  copied: "复制成功",
  copyFailed: "复制失败",
  deleteConfirm: "确认删除？",
  leaveConfirm: "有未保存修改，离开前请确认。",
  processing: "处理中...",
  apiOffline: "API 离线，无法保存",
  validateFailed: "校验失败",
  revert: "恢复",
  synced: "已同步",
  unsaved: "有未保存修改",
  close: "关闭",
  moveUp: "上移",
  moveDown: "下移",
  add: "添加",
  trashMoved: "已移入回收站",
  deleteFailed: "删除失败",
  loadFailed: "加载失败",
  updateFailed: "更新失败",
};

export const mediaUsageText = {
  inUse: "已被内容使用",
  unused: "未使用",
  trashed: "已移入回收站",
};

export const adminStatusText = {
  ok: "正常",
  idle: "未配置",
  warn: "需要处理",
  offline: "离线",
  online: "在线",
};

export const dashboardText = {
  title: "后台控制台",
  systemStatus: "系统状态",
  contentStats: "内容统计",
  heroStatus: "首页视频正常",
  mediaStatus: "媒体库正常",
  bookingStatus: "预约入口正常",
  apiOnline: "API 在线",
  cmsSynced: "内容已同步",
  completeness: "内容完整度检查",
  bookingOverview: "预约概览",
  recentBookings: "最近预约",
  recentSync: "最近更新时间",
  allChecksPass: "全部检查通过",
  noBookings: "暂无预约",
  heroVideoCount: "首页视频数量",
  missingHeroVideo: "缺少视频的首页案例",
  caseCount: "案例数量",
  certCount: "证书数量",
  serviceCount: "服务数量",
  workPhotoCount: "工作照数量",
  bookingTotal: "预约总数",
  newRequestCount: "新需求数量",
  seoScore: "SEO 完成度",
  pendingIssues: "待处理项",
};

/** @deprecated 使用 bookingStatusText */
export const BOOKING_STATUS_LABELS = bookingStatusText;

/** @deprecated 使用 mediaTypeText */
export const MEDIA_TYPE_LABELS = mediaTypeText;

/** @deprecated 使用 heroModeText */
export const HERO_MODE_LABELS = heroModeText;

export function bookingStatusLabel(status) {
  return bookingStatusText[status] ?? status;
}

export function mediaTypeLabel(type) {
  return mediaTypeText[type] ?? type;
}

export function heroModeLabel(mode) {
  return heroModeText[mode] ?? mode;
}

export const ADMIN_ROUTE_LINKS = [
  ["/admin", adminRouteText.dashboard],
  ["/admin/hero", adminRouteText.hero],
  ["/admin/location", adminRouteText.location],
  ["/admin/profile", adminRouteText.profile],
  ["/admin/services", adminRouteText.services],
  ["/admin/cases", adminRouteText.cases],
  ["/admin/certificates", adminRouteText.certificates],
  ["/admin/work-photos", adminRouteText.workPhotos],
  ["/admin/tutorial", adminRouteText.tutorial],
  ["/admin/site-modules", adminRouteText.siteModules],
  ["/admin/bookings", adminRouteText.bookings],
  ["/admin/social", adminRouteText.social],
  ["/admin/seo", adminRouteText.seo],
  ["/admin/media", adminRouteText.media],
];
