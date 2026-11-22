import type { CSSProperties } from "react";
import { useI18n } from "../../lib/i18n";
import { landingCopy } from "./copy";
import { roleMeta } from "./content";
import "./RoleStack.css";

export function Roles() {
  const { locale } = useI18n();
  const c = landingCopy[locale].roles;
  return (
    <section className="fwRoles" id="roles">
      <div className="fwWrap fwRolesGrid">
        <div>
          <p className="fwEyebrow fwEyebrowLight">{c.eyebrow}</p>
          <h2>
            {c.title} <em>{c.titleAccent}</em>
          </h2>
          <p className="fwLead">{c.lead}</p>
        </div>
        <div className="fwRoleStack" aria-hidden="true">
          {roleMeta.map((meta, i) => (
            <div
              key={c.items[i].tag}
              className={`fwRoleCard fwRoleCard--${meta.tone}`}
              style={{ "--rot": meta.rot, "--left": meta.left } as CSSProperties}
            >
              <span className="fwRoleTag">{c.items[i].tag}</span>
              <p className="fwRoleTitle">{c.items[i].title}</p>
              <span className="fwRoleSecret">
                {c.secret} {c.items[i].secret}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
