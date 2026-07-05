/**
 * Patch CMS content for Step 2.5 — profile, cases, hero carousel.
 * Usage: node scripts/patch-cms-step25.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const targets = [
  join(root, "src/data/site-content.mock.json"),
  join(root, "server/data/site-content.example.json"),
  join(root, "server/data/site-content.json"),
];

function patch(data) {
  data.meta.version = "1.1.0";
  data.meta.updatedAt = new Date().toISOString();

  data.profile = {
    ...data.profile,
    affiliation: {
      cn: "dBsource 音响系统工程师 · 中国录音师协会会员 · 录音技术专业毕业",
      en: "Sound System Engineer at dBsource · Member of China Recording Engineers Association · Recording Technology graduate",
    },
    bio: {
      cn: "余雅康，dBsource 音响系统工程师，中国录音师协会会员，录音技术专业毕业，持有初级录音师证书、华汇 DiGiCo 高级技术培训证书、VOS 认证音响系统工程师证书。具备录音、混音、和声编写、现场 FOH、Monitor、OB 调音、现场扩声与音响系统调试经验，参与过多场交响乐、合唱录音、年会会议、乐队演出和 Live 场地系统工程项目。",
      en: "Yu Yakang is a sound system engineer at dBsource, a member of the China Recording Engineers Association, and a graduate of recording technology. He holds certifications including Junior Recording Engineer, Huahui DiGiCo Advanced Technical Training, and VOS Certified Sound System Engineer. He has experience in recording, mixing, harmony writing, FOH, monitor, OB mixing, live sound reinforcement and sound system tuning, with project experience in orchestral recording, choir recording, corporate events, band performances and live venue system engineering.",
    },
    skillGroups: [
      {
        id: "recordingMixing",
        title: { cn: "录音 / 混音", en: "Recording / Mixing" },
        items: [
          { cn: "录音制式：AB / MS / ORTF / Decca Tree", en: "Recording formats: AB / MS / ORTF / Decca Tree" },
          { cn: "DAW：Cubase / Pro Tools / Studio One", en: "DAW: Cubase / Pro Tools / Studio One" },
          { cn: "音频编辑：修唱、修节奏、降噪、齿音、口水音处理", en: "Editing: vocal tuning, timing, denoise, de-ess, mouth noise" },
          { cn: "插件：Waves / FabFilter / Slate Digital / Ozone / Valhalla / iZotope RX", en: "Plugins: Waves / FabFilter / Slate Digital / Ozone / Valhalla / iZotope RX" },
          { cn: "音乐基础：乐理、和声、吉他演奏、音乐制作流程", en: "Music: theory, harmony, guitar, production workflow" },
        ],
      },
      {
        id: "systemEngineering",
        title: { cn: "系统工程 / 现场扩声", en: "System Engineering / Live Sound" },
        items: [
          { cn: "测量软件：Smaart / VOS4 / VOS Pro", en: "Measurement: Smaart / VOS4 / VOS Pro" },
          { cn: "仿真软件：EASE Focus / dBcover / AutoAngel", en: "Simulation: EASE Focus / dBcover / AutoAngel" },
          { cn: "系统能力：频响校正、相位耦合、延时对齐、超低阵列、补声系统、压限、EQ、增益架构", en: "System: tuning, phase coupling, delay alignment, sub arrays, fills, limiting, EQ, gain structure" },
          { cn: "调音台：DiGiCo、Yamaha、Behringer X32/WING、Midas、Allen&Heath、Soundcraft、Presonus 等", en: "Consoles: DiGiCo, Yamaha, Behringer X32/WING, Midas, Allen&Heath, Soundcraft, Presonus and more" },
        ],
      },
    ],
    workPhotos: [
      { id: "wp-01", order: 1, imageUrl: "/images/about/work-01.jpg", title: { cn: "现场调试", en: "On-site tuning" }, description: { cn: "项目现场工作记录", en: "On-site working record" } },
      { id: "wp-02", order: 2, imageUrl: "/images/about/work-02.jpg", title: { cn: "系统测量", en: "System measurement" }, description: { cn: "项目现场工作记录", en: "On-site working record" } },
      { id: "wp-03", order: 3, imageUrl: "/images/about/work-03.jpg", title: { cn: "Live 演出", en: "Live show" }, description: { cn: "项目现场工作记录", en: "On-site working record" } },
      { id: "wp-04", order: 4, imageUrl: "/images/about/work-04.jpg", title: { cn: "调音台工作", en: "Console work" }, description: { cn: "项目现场工作记录", en: "On-site working record" } },
      { id: "wp-05", order: 5, imageUrl: "/images/about/work-05.jpg", title: { cn: "系统搭建", en: "System setup" }, description: { cn: "项目现场工作记录", en: "On-site working record" } },
      { id: "wp-06", order: 6, imageUrl: "/images/about/work-06.jpg", title: { cn: "项目复盘", en: "Project review" }, description: { cn: "项目现场工作记录", en: "On-site working record" } },
    ],
  };

  data.hero = {
    ...data.hero,
    mode: "caseVideoCarousel",
    slideDuration: 5,
    fallbackPoster: "/hero/desktop/hero-poster.webp",
    slides: [
      { caseSlug: "echo-live-yunfu", enabled: true, title: { cn: "云浮 ECHO.回声 Live", en: "ECHO Live · Yunfu" }, video: "/cases/echo-live-yunfu/video.mp4", poster: "/cases/echo-live-yunfu/gallery/gallery-01.webp", startTime: 0, duration: 5 },
      { caseSlug: "maca-live-guangning", enabled: true, title: { cn: "Maca 音乐客厅 Live", en: "Maca Music Living Room" }, video: "/cases/maca-live-guangning/video.mp4", poster: "/cases/maca-live-guangning/gallery/gallery-01.webp", startTime: 0, duration: 5 },
      { caseSlug: "wild-live-shenzhen", enabled: true, title: { cn: "深圳 Wild Live", en: "Wild Live · Shenzhen" }, video: "/cases/wild-live-shenzhen/video.mp4", poster: "/cases/wild-live-shenzhen/gallery/gallery-01.webp", startTime: 0, duration: 5 },
      { caseSlug: "shuimuhuaya-jingdezhen-2025", enabled: true, title: { cn: "水木年华景德镇站", en: "Shui Mu Nian Hua · Jingdezhen" }, video: "/cases/shuimuhuaya-jingdezhen-2025/video.mp4", poster: "/cases/shuimuhuaya-jingdezhen-2025/gallery/gallery-01.webp", startTime: 0, duration: 4 },
    ],
  };

  data.certificates = [
    { id: "cert-01", order: 1, title: { cn: "初级录音师证书", en: "Junior Recording Engineer Certificate" }, issuer: { cn: "相关认证机构", en: "Certifying body" }, year: "", imageUrl: "/certificates/cert-01.webp", visible: true },
    { id: "cert-02", order: 2, title: { cn: "华汇 DiGiCo 高级技术培训证书", en: "Huahui DiGiCo Advanced Technical Training" }, issuer: { cn: "华汇 / DiGiCo", en: "Huahui / DiGiCo" }, year: "", imageUrl: "/certificates/cert-02.webp", visible: true },
    { id: "cert-03", order: 3, title: { cn: "VOS 认证音响系统工程师证书", en: "VOS Certified Sound System Engineer" }, issuer: { cn: "VOS", en: "VOS" }, year: "", imageUrl: "/certificates/cert-03.webp", visible: true },
  ];

  const caseUpdates = {
    "maca-live-guangning": {
      role: { cn: "现场扩声系统搭建与调试", en: "Live Sound System Setup & Tuning" },
      summary: { cn: "Maca 音乐客厅 Live 扩声系统搭建与调试，围绕中小型音乐空间的清晰度、覆盖均匀度、低频控制和长期稳定运营进行系统优化。", en: "Live sound system setup and tuning for Maca Music Living Room, optimizing clarity, coverage, low-frequency control and long-term reliability." },
      background: { cn: "Maca 音乐客厅是以 live 演出、音乐交流和现场氛围为核心的音乐空间。", en: "Maca Music Living Room is a venue focused on live performances, music community and on-site atmosphere." },
      challenge: { cn: "需要在有限空间内兼顾人声清晰度、乐器层次、低频包围感和不同观众区域的一致听感，同时系统也需要具备稳定、安全、易用的长期运营能力。", en: "The venue needed vocal clarity, instrument separation, controlled low end and consistent coverage across seating areas, with reliable long-term operation." },
      solution: { cn: "FOH 主扩及补声采用 dBsource DO 系列点声源音箱；低频系统采用 DO218S 超低；舞台监听使用 206M。调试过程中对每一路通道进行了精准限幅设置，提高系统安全性与稳定性。", en: "FOH and fills used dBsource DO series point-source loudspeakers; subs used DO218S; monitors used 206M. Precise limiting was applied on every channel for safety and stability." },
      result: { cn: "整套系统围绕「好听、耐听、稳定、易用」完成搭建与优化，在保证声音清晰度和低频能量的同时，也提升了场地后续运营的可靠性。", en: "The system was tuned for musicality, stability and ease of use, improving clarity, LF energy and operational reliability." },
      equipment: { cn: "dBsource DO 系列点声源音箱、DO218S 超低音箱、206M 监听音箱、系统处理器、限幅设置、EQ、延时、增益架构。", en: "dBsource DO series, DO218S subs, 206M monitors, system processor, limiting, EQ, delay, gain structure." },
    },
    "echo-live-yunfu": {
      role: { cn: "场地系统工程调试", en: "Venue System Engineering & Tuning" },
      summary: { cn: "与罗维老师共同完成 ECHO.回声 Live 的场地系统工程调试，整体系统围绕 Live 演出场景进行设计、搭建和优化。", en: "Venue system engineering and tuning for ECHO Live Yunfu, designed and optimized for live performance scenarios." },
      background: { cn: "ECHO.回声 Live 是云浮地区的 Live 音乐空间，需要满足多类型演出的扩声需求。", en: "ECHO Live Yunfu is a live music venue serving diverse performance formats." },
      challenge: { cn: "Live 音乐空间需要同时满足人声清晰度、乐队动态、低频能量、声压储备和不同区域覆盖一致性。存在多楼层、多补声区域和超低系统衔接问题。", en: "The venue required vocal clarity, band dynamics, controlled LF, headroom and consistent coverage across multiple levels and fill zones." },
      solution: { cn: "主扩采用 dBsource DO115H；二楼补声采用 DO112 与 DO110；超低系统采用 DO218S 弧形阵列布局。调试中对主扩、补声、超低进行耦合校准、延时对齐和相位检查。调音台使用 Behringer WING Compact。", en: "Main PA used DO115H; second-floor fills used DO112/DO110; subs used DO218S arc array. Coupling, delay and phase alignment were verified. Console: Behringer WING Compact." },
      result: { cn: "系统在不同听音区域保持更自然、更统一的声音表现，低频既有力量感也具备控制力，提升了 Live 场地整体声音完成度。", en: "The system delivered more natural, unified coverage with controlled yet powerful low end across listening zones." },
      equipment: { cn: "dBsource DO115H、DO112、DO110、DO218S、Behringer WING Compact、Smaart/VOS 测量、延时对齐、相位检查、低频阵列。", en: "dBsource DO115H, DO112, DO110, DO218S, Behringer WING Compact, Smaart/VOS, delay, phase, sub array." },
    },
    "wild-live-shenzhen": {
      role: { cn: "音响系统搭建与调试", en: "Sound System Engineering" },
      summary: { cn: "约 200 平方米 Live 场地的音响系统搭建与调试，采用 dBsource 音响、处理器与功放，围绕覆盖、低频控制和经济实用性进行设计。", en: "Sound system design and tuning for a ~200㎡ live venue using dBsource loudspeakers, processing and amplification." },
      background: { cn: "深圳南山 Wild Live 为小型音乐演出空间，需要在有限预算内实现可靠扩声。", en: "Wild Live Shenzhen is a compact live venue requiring reliable reinforcement within practical budget." },
      challenge: { cn: "场地面积约 200 平方米，低频驻波和低频反射是主要声学问题。过大尺寸或低频能量过强的系统容易造成低频堆积和听感浑浊。", en: "At ~200㎡, room modes and LF reflections were the main acoustic challenges; oversized LF systems would cause buildup and muddiness." },
      solution: { cn: "选择双 6.5 寸点声源音箱作为主扩方案，配置主扩、前补、后补、返听及 4 进 8 出处理器。前期通过声学模拟规划摆位；调音台使用 Behringer WING RACK，采用 PA 与 Monitor 一体化及 double patch 独立控制。", en: "Dual 6.5\" point-source mains with front/rear fills, monitors and 4×8 processor. Acoustic simulation guided placement. Behringer WING RACK with double-patch PA/monitor routing." },
      result: { cn: "方案从场地声学、覆盖均匀度、低频控制、系统成本和调试效率综合考虑，实现了更适合该场地实际使用需求的扩声系统。", en: "The solution balanced acoustics, coverage, LF control, cost and workflow for practical daily use." },
      equipment: { cn: "dBsource 双 6.5 寸点声源音箱、前补、后补、返听、4 进 8 出处理器、Behringer WING RACK、double patch、声学模拟、测量调试。", en: "dBsource dual 6.5\" point-source, fills, monitors, 4×8 processor, WING RACK, double patch, simulation, measurement." },
    },
  };

  for (const c of data.cases) {
    const patchCase = caseUpdates[c.slug];
    if (patchCase) Object.assign(c, patchCase);
  }

  const ncnu = {
    id: "case-ncnu-graduation",
    slug: "ncnu-graduation-gala",
    order: 7,
    featured: false,
    visible: true,
    category: "event-sound-reinforcement",
    date: "",
    location: { cn: "江西南昌", en: "Nanchang, Jiangxi" },
    role: { cn: "现场调音师 / FOH Engineer", en: "FOH Engineer" },
    title: { cn: "南昌师范学院毕业晚会", en: "NCNU Graduation Gala" },
    summary: { cn: "担任南昌师范学院毕业晚会现场调音师，负责整场晚会扩声调音与现场声音控制。", en: "FOH engineer for NCNU graduation gala, responsible for live sound reinforcement and on-site audio control." },
    background: { cn: "大型院校毕业晚会，演出形式以管弦乐与综合文艺节目为主。", en: "A large-scale university graduation gala featuring orchestral and mixed performance formats." },
    challenge: { cn: "Behringer X32 现场输入通道全部插满，对通道管理、增益结构、编组控制和现场应变能力要求较高。管弦乐扩声更注重声部层次、整体动态和自然听感。", en: "Full X32 channel count demanded rigorous gain structure, grouping and scene management. Orchestral reinforcement required natural dynamics and sectional balance." },
    solution: { cn: "演出前期完成通道命名、DCA 编组、Mute Group 和场景管理。对弦乐、木管、铜管、打击乐等声部进行合理规划，通过增益、声像、EQ 和动态控制保持层次并控制串扰。", en: "Pre-show channel naming, DCA groups, mute groups and scenes. Sectional planning for strings, woodwinds, brass and percussion with gain, pan, EQ and dynamics." },
    result: { cn: "整场晚会声音更加稳定、清晰、自然，更好地服务演出情绪表达，也强化了大型晚会系统调音与音乐性处理经验。", en: "The show delivered stable, clear and natural sound that supported the performance narrative and strengthened large-format FOH experience." },
    equipment: { cn: "Behringer X32、DCA 编组、Mute Group、场景管理、EQ、动态控制、管弦乐扩声、现场 FOH。", en: "Behringer X32, DCA groups, mute groups, scenes, EQ, dynamics, orchestral FOH." },
    services: { cn: "毕业晚会现场扩声调音", en: "Graduation gala live sound" },
    clientFeedback: { cn: "", en: "" },
    coverUrl: "",
    images: [],
    videoUrl: null,
    audioUrl: null,
    externalVideoUrl: null,
    seo: {
      title: { cn: "南昌师范学院毕业晚会 | YU YAKANG AUDIO", en: "NCNU Graduation Gala | YU YAKANG AUDIO" },
      description: { cn: "大型晚会管弦乐扩声与 X32 满通道现场调音案例。", en: "Large-format orchestral FOH with full X32 channel count." },
      keywords: { cn: ["毕业晚会", "管弦乐", "X32", "现场调音"], en: ["graduation gala", "orchestral", "X32", "FOH"] },
    },
  };

  if (!data.cases.find((c) => c.slug === "ncnu-graduation-gala")) {
    data.cases.push(ncnu);
  }

  return data;
}

for (const file of targets) {
  try {
    const data = JSON.parse(readFileSync(file, "utf8"));
    writeFileSync(file, `${JSON.stringify(patch(structuredClone(data)), null, 2)}\n`, "utf8");
    console.log("patched:", file);
  } catch (err) {
    console.warn("skip:", file, err.message);
  }
}
