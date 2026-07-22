import type { ReactNode } from "react";

type SectionHeadingProps = { eyebrow?: string; title: string; description?: string; action?: ReactNode; align?: "left" | "center" };

export function SectionHeading({ eyebrow, title, description, action, align = "left" }: SectionHeadingProps) {
  return (
    <div className={`section-heading ${align === "center" ? "is-centered" : ""}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <div className="section-heading-row">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
    </div>
  );
}
