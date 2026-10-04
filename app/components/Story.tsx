"use client";
import { useI18n } from "../i18n";
export function Story() {
  const { t } = useI18n();
  return (
    <section className="story">
      <div className="wrap storyContent">
        <p className="eyebrow">{t.story.eyebrow}</p>
        <h2>
          {t.story.title}
          <br />
          <em>{t.story.script}</em>
        </h2>
        <p>{t.story.text}</p>
      </div>
    </section>
  );
}
