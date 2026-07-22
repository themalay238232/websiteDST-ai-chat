"use client";

import { ArrowDown, BriefcaseBusiness, HeartHandshake, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { careerPositions } from "../../data/careers";
import { ContactForm } from "../components/ContactForm";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";

type PageProps = { onNavigate: (path: string) => void; onOpenChat: () => void };

const culture = [
  { icon: Sparkles, title: "Làm việc có định hướng", text: "Mỗi đầu việc cần có mục tiêu, bối cảnh và cách phối hợp rõ ràng." },
  { icon: HeartHandshake, title: "Tôn trọng sự phối hợp", text: "Các nhóm cùng trao đổi thẳng thắn để xử lý công việc và hỗ trợ khách hàng tốt hơn." },
  { icon: BriefcaseBusiness, title: "Phát triển qua dự án", text: "Cơ hội học hỏi đến từ những tình huống thực tế, phản hồi và quá trình hoàn thiện sản phẩm." },
];

export function CareersPage({ onOpenChat }: PageProps) {
  const [selected, setSelected] = useState(careerPositions[0]);
  const formRef = useRef<HTMLElement>(null);
  function selectPosition(slug: string) {
    const next = careerPositions.find((position) => position.slug === slug);
    if (!next) return;
    setSelected(next);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return (
    <>
      <PageHero eyebrow="Tuyển dụng DST Group" title="Một môi trường cùng học hỏi từ dự án thực tế" description="Thông tin tuyển dụng hiện được trình bày ở dạng mẫu để chủ dự án cập nhật vị trí, quyền lợi và điều kiện chính thức." image="assets/02-team-celebration.jpg" imageAlt="Không khí hợp tác của đội ngũ" />
      <section className="section page-width"><Reveal><SectionHeading eyebrow="Môi trường & văn hóa" title="Những điều được ưu tiên khi phối hợp" /></Reveal><div className="reason-grid">{culture.map((item) => { const Icon = item.icon; return <Reveal key={item.title}><article className="reason-card"><Icon size={24} aria-hidden="true" /><h3>{item.title}</h3><p>{item.text}</p></article></Reveal>; })}</div></section>
      <section className="section section-soft"><div className="page-width"><Reveal><SectionHeading eyebrow="Vị trí" title="Danh sách cần xác nhận chính thức" description="Các vị trí dưới đây là cấu trúc mẫu. Nội dung mô tả, quyền lợi và thời gian nhận hồ sơ cần được DST Group cập nhật trước khi công bố." /></Reveal><div className="job-list">{careerPositions.map((position) => <Reveal key={position.slug}><article className="job-card"><div><span>{position.department}</span><h3>{position.title}</h3><p>{position.summary}</p><small>{position.workMode}</small></div><button type="button" className="ghost-btn" onClick={() => selectPosition(position.slug)}>Ứng tuyển <ArrowDown size={16} aria-hidden="true" /></button></article></Reveal>)}</div></div></section>
      <section className="section page-width career-form-section" ref={formRef}><Reveal><div><p className="eyebrow">Ứng tuyển</p><h2>{selected.title}</h2><p>{selected.note}</p><div className="job-detail-columns"><div><h3>Trách nhiệm</h3><ul>{selected.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul></div><div><h3>Yêu cầu</h3><ul>{selected.requirements.map((item) => <li key={item}>{item}</li>)}</ul></div></div></div></Reveal><Reveal><ContactForm key={selected.slug} kind="application" position={selected.title} title="Gửi thông tin ứng tuyển" /></Reveal></section>
      <button className="career-chat-prompt" type="button" onClick={onOpenChat}>Hỏi AI về vị trí phù hợp</button>
    </>
  );
}
