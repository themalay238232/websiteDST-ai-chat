import { ArrowUpRight } from "lucide-react";
import type { Service } from "../../data/types";
import { AppLink } from "./AppLink";

type ServiceCardProps = { service: Service; onNavigate: (path: string) => void };

export function ServiceCard({ service, onNavigate }: ServiceCardProps) {
  const Icon = service.icon;
  return (
    <article className="service-card">
      <div className="service-card-icon"><Icon size={25} aria-hidden="true" /></div>
      <p className="card-kicker">{service.eyebrow}</p>
      <h3>{service.title}</h3>
      <p>{service.summary}</p>
      <div className="tag-list">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <AppLink className="card-link" to={`/dich-vu/${service.slug}`} onNavigate={onNavigate}>Xem chi tiết <ArrowUpRight size={16} aria-hidden="true" /></AppLink>
    </article>
  );
}
