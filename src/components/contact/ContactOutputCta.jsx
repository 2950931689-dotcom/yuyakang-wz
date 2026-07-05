import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function ContactOutputCta({ lang, bookLabel }) {
  return (
    <section className="contact-section contact-output-cta">
      <div className="contact-output-cta__module">
        <span className="contact-output-cta__code">OUTPUT / PROJECT EVALUATION</span>
        <h2 className="contact-output-cta__title">
          {lang === "cn" ? "项目评估输出" : "Project Evaluation Output"}
        </h2>
        <p className="contact-output-cta__desc">
          {lang === "cn"
            ? "已经有场地、设备或演出信息？可以直接提交项目需求，我会按城市、规模、系统复杂度和交付范围进行初步评估。"
            : "Have venue, gear or show details? Submit a project request for initial assessment by city, scale and delivery scope."}
        </p>
        <p className="contact-output-cta__hint">
          {lang === "cn"
            ? "适合 Livehouse 驻场、演出系统工程、现场扩声、混音后期与录音项目。"
            : "Livehouse residency, tour systems, live sound, mixing and recording projects."}
        </p>
        <div className="contact-output-cta__actions">
          <Button as={Link} to="/booking">{bookLabel}</Button>
          <Button as={Link} to="/cases" variant="secondary">
            {lang === "cn" ? "查看代表案例" : "View Cases"}
          </Button>
        </div>
        <span className="contact-output-cta__status">SIGNAL READY</span>
      </div>
    </section>
  );
}
