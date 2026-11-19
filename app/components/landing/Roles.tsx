import type { CSSProperties } from "react";
import { roles } from "./content";
import "./RoleStack.css";

export function Roles() {
  return (
    <section className="fwRoles" id="roles">
      <div className="fwWrap fwRolesGrid">
        <div>
          <p className="fwEyebrow fwEyebrowLight">Viesi</p>
          <h2>
            Kas būsi tu <em>šovakar?</em>
          </h2>
          <p className="fwLead">
            Katram viesim sava kārts ar vārdu, pagātni un vienu noslēpumu. Īsto stāstu tu uzzināsi
            pirms vakara.
          </p>
        </div>
        <div className="fwRoleStack" aria-hidden="true">
          {roles.map((r) => (
            <div
              key={r.tag}
              className={`fwRoleCard fwRoleCard--${r.tone}`}
              style={{ "--rot": r.rot, "--left": r.left } as CSSProperties}
            >
              <span className="fwRoleTag">{r.tag}</span>
              <p className="fwRoleTitle">{r.title}</p>
              <span className="fwRoleSecret">Noslēpums: {r.secret}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
