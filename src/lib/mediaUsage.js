export function isMediaUrlUsed(content, url) {
  if (!content || !url) return false;
  return JSON.stringify(content).includes(url);
}

export function getMediaUsageLabel(content, fileUrl) {
  if (!fileUrl) return "—";
  const filename = fileUrl.split("/").pop();
  const used =
    isMediaUrlUsed(content, fileUrl) ||
    (filename && isMediaUrlUsed(content, filename));
  return used ? "已被 CMS 使用" : "未使用";
}
