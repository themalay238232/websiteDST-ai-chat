"use client";

import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { projectFilters, projects } from "../../data/projects";
import { CTASection } from "../components/CTASection";
import { PageHero } from "../components/PageHero";
import { ProjectCard } from "../components/ProjectCard";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

type PageProps = { onNavigate: (path: string) => void; onOpenChat: () => void };

export function ProjectsPage({ onNavigate, onOpenChat }: PageProps) {
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(() => filter === "all" ? projects : projects.filter((project) => project.industry === filter), [filter]);
  return (
    <>
      <PageHero eyebrow="Dự án DST Group" title="Các hướng triển khai theo bối cảnh ngành hàng" description="Dự án được trình bày theo lĩnh vực và nhóm dịch vụ. Nội dung nhạy cảm, tên khách hàng hoặc số liệu chưa có xác nhận được đánh dấu để chủ dự án cập nhật." image="assets/10-hotel-lobby-project.jpg" imageAlt="Không gian dự án khách sạn" />
      <section className="section page-width"><Reveal><SectionHeading eyebrow="Danh mục dự án" title="Lọc theo lĩnh vực" description="Chọn một nhóm để xem các case study mẫu liên quan." /></Reveal><div className="filter-bar" role="group" aria-label="Lọc dự án"><Filter size={17} aria-hidden="true" />{projectFilters.map((item) => <button type="button" key={item.value} className={filter === item.value ? "is-active" : ""} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>)}</div><div className="project-grid filtered-projects">{filtered.map((project) => <Reveal key={project.slug}><ProjectCard project={project} onNavigate={onNavigate} /></Reveal>)}</div>{!filtered.length ? <p className="empty-state">Chưa có dự án trong nhóm này.</p> : null}</section>
      <CTASection onNavigate={onNavigate} onOpenChat={onOpenChat} title="Tìm một hướng triển khai tương tự mục tiêu của bạn" />
    </>
  );
}
