import { ArrowUpRight } from "lucide-react";
import type { Project } from "../../data/types";
import { assetPath } from "../lib/site";
import { AppLink } from "./AppLink";

type ProjectCardProps = { project: Project; onNavigate: (path: string) => void };

export function ProjectCard({ project, onNavigate }: ProjectCardProps) {
  return (
    <article className="project-card">
      {project.image ? <img src={assetPath(project.image)} alt={project.imageAlt || project.title} loading="lazy" decoding="async" /> : null}
      <div className="project-card-body">
        <span>{project.industryLabel}</span>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <ul>{project.services.slice(0, 2).map((service) => <li key={service}>{service}</li>)}</ul>
        <AppLink className="card-link" to={`/du-an/${project.slug}`} onNavigate={onNavigate}>Xem dự án <ArrowUpRight size={16} aria-hidden="true" /></AppLink>
      </div>
    </article>
  );
}
