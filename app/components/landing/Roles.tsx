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
          {c.items.map((r, i) => {
            const meta = roleMeta[i];
            if (!meta) return null;
            return (
              <div
                key={r.tag}
                className={`fwRoleCard fwRoleCard--${meta.tone}`}
                style={{ "--rot": meta.rot, "--left": meta.left } as CSSProperties}
              >
                <span className="fwRoleTag">{r.tag}</span>
                <p className="fwRoleTitle">{r.title}</p>
                <span className="fwRoleSecret">
                  {c.secret} {r.secret}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
