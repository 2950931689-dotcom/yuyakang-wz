import mockData from "../data/site-content.mock.json";

const DEFAULT_SITE_NAME = {
  cn: "YU YAKANG AUDIO",
  en: "YU YAKANG AUDIO",
};

const DEFAULT_TAGLINE = {
  cn: "现场调音 / 系统工程 / 混音后期",
  en: "Live Sound / System Tuning / Mixing",
};

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

/**
 * Merge API / partial payloads with mock defaults so React never receives
 * missing siteSettings.siteName or non-array collections.
 */
export function normalizeContent(raw) {
  const source = asObject(raw);
  const baseSettings = asObject(mockData.siteSettings);
  const sourceSettings = asObject(source.siteSettings);

  return {
    ...mockData,
    ...source,
    siteSettings: {
      ...baseSettings,
      ...sourceSettings,
      siteName: {
        ...DEFAULT_SITE_NAME,
        ...asObject(baseSettings.siteName),
        ...asObject(sourceSettings.siteName),
      },
      tagline: {
        ...DEFAULT_TAGLINE,
        ...asObject(baseSettings.tagline),
        ...asObject(sourceSettings.tagline),
      },
      commonTools: asArray(sourceSettings.commonTools ?? baseSettings.commonTools),
      processSteps: asArray(sourceSettings.processSteps ?? baseSettings.processSteps),
      soundIssues: asArray(sourceSettings.soundIssues ?? baseSettings.soundIssues),
    },
    cases: asArray(source.cases ?? mockData.cases),
    services: asArray(source.services ?? mockData.services),
    certificates: asArray(source.certificates ?? mockData.certificates),
    featuredVideos: asArray(source.featuredVideos ?? mockData.featuredVideos),
    socialLinks: {
      ...asObject(mockData.socialLinks),
      ...asObject(source.socialLinks),
    },
    profile: {
      ...asObject(mockData.profile),
      ...asObject(source.profile),
    },
    hero: {
      ...asObject(mockData.hero),
      ...asObject(source.hero),
    },
    seo: {
      ...asObject(mockData.seo),
      ...asObject(source.seo),
    },
    i18n: {
      ...asObject(mockData.i18n),
      ...asObject(source.i18n),
    },
    location: source.location ?? mockData.location,
    serviceArea: source.serviceArea ?? mockData.serviceArea,
    display: {
      ...asObject(mockData.display),
      ...asObject(source.display),
    },
  };
}

export function getSiteDisplayName(content, lang = "en") {
  const name = content?.siteSettings?.siteName;
  if (typeof name === "string" && name.trim()) return name.trim();
  if (name && typeof name === "object") {
    return name[lang] ?? name.en ?? name.cn ?? DEFAULT_SITE_NAME.en;
  }
  return DEFAULT_SITE_NAME.en;
}
