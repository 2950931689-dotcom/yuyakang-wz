import SectionTitle from "../ui/SectionTitle";
import ExternalLinkButton from "../ui/ExternalLinkButton";
import { getCommonTools } from "../../lib/cmsBinding";

function safeUrl(url) {
  const trimmed = String(url ?? "").trim();
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return trimmed;
}

export default function CommonTools({ content, lang }) {
  const tools = getCommonTools(content);
  if (!tools.length) return null;

  return (
    <section className="contact-section common-tools console-rack">
      <SectionTitle
        sectionIndex={5}
        eyebrow="COMMON TOOLS"
        title={lang === "cn" ? "常用工具" : "Common Tools"}
        subtitle={
          lang === "cn"
            ? "我常用或推荐的音响系统、资料、工具与学习链接。"
            : "Recommended audio system resources, tools and learning links."
        }
      />

      <div className="common-tools__grid console-rack__grid">
        {tools.map((tool, i) => {
          const href = safeUrl(tool.url);
          const openNewTab = tool.openInNewTab !== false;

          return (
            <article
              key={tool.id ?? `${tool.title}-${i}`}
              className={`common-tools__card console-rack__unit${tool.isFeatured ? " is-featured" : ""}`}
            >
              <header className="common-tools__head">
                <span className="common-tools__index console-rack__index">
                  TOOL {String(i + 1).padStart(2, "0")}
                </span>
                {tool.isFeatured && (
                  <span className="common-tools__featured">
                    {lang === "cn" ? "推荐" : "FEATURED"}
                  </span>
                )}
                <span className="common-tools__status">
                  {lang === "cn" ? "工具链接就绪" : "TOOL LINK READY"}
                </span>
              </header>

              <h3 className="common-tools__title">{tool.title}</h3>

              {tool.description?.trim() && (
                <p className="common-tools__desc">{tool.description}</p>
              )}

              {tool.category?.trim() && (
                <span className="common-tools__category">{tool.category}</span>
              )}

              {href && (
                <ExternalLinkButton
                  href={href}
                  variant="secondary"
                  className="common-tools__link btn--console"
                  target={openNewTab ? "_blank" : undefined}
                  rel={openNewTab ? "noreferrer" : undefined}
                >
                  {lang === "cn" ? "打开工具" : "Open Tool"}
                </ExternalLinkButton>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
