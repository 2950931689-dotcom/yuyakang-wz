import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { useContent } from "../../context/ContentContext";

import { useAdmin } from "../../context/AdminContext";

import { fetchBookings } from "../../lib/api";

import { bookingStatusLabel, heroModeLabel } from "../../lib/adminUi";

import {

  getCases,

  getContentCompleteness,

  getHeroCasePreviewList,

  getHeroSlides,

  getSafeHero,

  getWorkPhotos,

} from "../../lib/content";

import AdminTopbar from "./AdminTopbar";

import { AdminStatusItem } from "./AdminForm";



export default function AdminDashboard() {

  const { content, loading, source } = useContent();

  const { apiOnline } = useAdmin();

  const [bookings, setBookings] = useState([]);



  useEffect(() => {

    fetchBookings()

      .then(setBookings)

      .catch(() => setBookings([]));

  }, []);



  if (loading || !content) {

    return <div className="admin-placeholder admin-mono">初始化中…</div>;

  }



  const cases = getCases(content, { visible: false });

  const certs = content.certificates ?? [];

  const services = content.services ?? [];

  const workPhotos = getWorkPhotos(content);

  const hero = getSafeHero(content);

  const heroSlides = getHeroSlides(content, hero);

  const heroPreview = getHeroCasePreviewList(content, hero);

  const heroVideoCount = heroSlides.length;

  const heroMissingVideo = heroPreview.filter((c) => c.showInHero && !c.hasVideo).length;

  const issues = getContentCompleteness(content);

  const newCount = bookings.filter((b) => b.status === "new").length;

  const seoScore = issues.filter((i) => i.section === "seo").length === 0 ? 100 : 70;

  const recent = bookings.slice(0, 5);



  const apiStatus = apiOnline ? "ok" : apiOnline === false ? "warn" : "idle";

  const cmsStatus = source === "api" ? "ok" : "warn";

  const heroStatus = heroVideoCount > 0 ? "ok" : "idle";

  const bookingStatus = newCount > 0 ? "warn" : bookings.length > 0 ? "ok" : "idle";



  const stats = [

    { label: "案例数量", value: cases.length },

    { label: "Hero 视频数", value: heroVideoCount },

    { label: "Hero 警告", value: heroMissingVideo },

    { label: "证书数量", value: certs.length },

    { label: "工作照数量", value: workPhotos.length },

    { label: "服务数量", value: services.length },

    { label: "预约数量", value: bookings.length },

    { label: "新需求数量", value: newCount },

    { label: "SEO 得分", value: `${seoScore}%`, small: true },

    { label: "待修复项", value: issues.length },

  ];



  return (

    <>

      <AdminTopbar

        eyebrow="后台控制台"

        title="系统状态面板"

        description="YU YAKANG AUDIO · JSON CMS 控制台"

      />



      <section className="admin-status-bar" aria-label="系统状态">

        <AdminStatusItem label="API 在线" status={apiStatus} />

        <AdminStatusItem label="CMS 就绪" status={cmsStatus} />

        <AdminStatusItem label="Hero 活跃" status={heroStatus} />

        <AdminStatusItem label="预约输入" status={bookingStatus} />

      </section>



      <div className="admin-stats">

        {stats.map((item) => (

          <div key={item.label} className="admin-stat">

            <span className="admin-panel-eyebrow">内容信号</span>

            <div className="admin-stat__label">{item.label}</div>

            <div className={`admin-stat__value admin-mono${item.small ? " admin-stat__value--sm" : ""}`}>

              {item.value}

            </div>

          </div>

        ))}

      </div>



      <div className="admin-meta-line admin-mono">

        最近同步 · {content.meta?.updatedAt ?? "—"} · 模式 · {heroModeLabel(hero.mode ?? "caseVideoCarousel")} · 默认 · {hero.slideDuration ?? 8}s

      </div>



      <div className="admin-quick-links">

        <Link to="/admin/hero" className="admin-btn admin-btn--ghost admin-btn--sm">首页视频 →</Link>

        <Link to="/admin/cases" className="admin-btn admin-btn--ghost admin-btn--sm">案例 →</Link>

        <Link to="/admin/media" className="admin-btn admin-btn--ghost admin-btn--sm">媒体 →</Link>

        <Link to="/admin/bookings" className="admin-btn admin-btn--ghost admin-btn--sm">预约 →</Link>

      </div>



      <h2 className="admin-section-title">

        <span className="admin-panel-eyebrow">完整度</span>

        内容完整度检查

      </h2>

      {issues.length === 0 ? (

        <div className="admin-placeholder admin-mono">全部检查通过</div>

      ) : (

        <div className="admin-table-wrap">

          <table className="admin-table">

            <thead>

              <tr>

                <th>区块</th>

                <th>引用</th>

                <th>问题</th>

              </tr>

            </thead>

            <tbody>

              {issues.slice(0, 12).map((issue, i) => (

                <tr key={i}>

                  <td className="admin-mono">{issue.section}</td>

                  <td className="admin-mono">{issue.slug ?? issue.id ?? issue.field}</td>

                  <td>{issue.message}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}



      <h2 className="admin-section-title">

        <span className="admin-panel-eyebrow">预约输入</span>

        最近预约

      </h2>

      {recent.length === 0 ? (

        <div className="admin-placeholder admin-mono">暂无预约</div>

      ) : (

        <div className="admin-table-wrap">

          <table className="admin-table">

            <thead>

              <tr>

                <th>姓名</th>

                <th>服务</th>

                <th>状态</th>

                <th>创建时间</th>

              </tr>

            </thead>

            <tbody>

              {recent.map((b) => (

                <tr key={b.id}>

                  <td>{b.name || b.wechat || "—"}</td>

                  <td className="admin-mono">{b.serviceType}</td>

                  <td>{bookingStatusLabel(b.status)}</td>

                  <td className="admin-mono">{new Date(b.createdAt).toLocaleString()}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </>

  );

}


