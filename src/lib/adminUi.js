/** 后台界面文案（仅 UI 显示，不涉及 API / JSON 字段名） */

export const BOOKING_STATUS_LABELS = {
  new: "新需求",
  contacted: "已联系",
  quoted: "已报价",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
  all: "全部",
};

export const MEDIA_TYPE_LABELS = {
  all: "全部",
  image: "图片",
  video: "视频",
  audio: "音频",
  document: "文档",
  other: "其他",
};

export const HERO_MODE_LABELS = {
  caseVideoCarousel: "案例视频自动轮播",
  manualSlides: "手动视频轮播",
  singleVideo: "单视频模式",
};

export function bookingStatusLabel(status) {
  return BOOKING_STATUS_LABELS[status] ?? status;
}

export function mediaTypeLabel(type) {
  return MEDIA_TYPE_LABELS[type] ?? type;
}

export function heroModeLabel(mode) {
  return HERO_MODE_LABELS[mode] ?? mode;
}
