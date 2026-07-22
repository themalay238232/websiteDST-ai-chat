import { Award, Compass, Target } from "lucide-react";
import { companyStats, companyTimeline, companyValues } from "../../data/company";
import { teamMembers } from "../../data/team";
import { AppLink } from "../components/AppLink";
import { CTASection } from "../components/CTASection";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { assetPath } from "../lib/site";

type PageProps = { onNavigate: (path: string) => void; onOpenChat: () => void };

export function AboutPage({ onNavigate, onOpenChat }: PageProps) {
  return (
    <>
      <PageHero eyebrow="Giới thiệu DST Group" title="Đồng hành cùng doanh nghiệp từ định hướng đến triển khai" description="DST Group phát triển các giải pháp Marketing, Media và Branding theo bối cảnh, mục tiêu và nguồn lực thực tế của từng doanh nghiệp." image="assets/01-team-event-launch.jpg" imageAlt="Đội ngũ DST tại sự kiện ra mắt" actions={<AppLink className="primary-btn" to="/lien-he" onNavigate={onNavigate}>Nhận tư vấn</AppLink>} />
      <section className="section page-width content-split">
        <Reveal><div className="content-panel"><p className="eyebrow">Tổng quan</p><h2>Vai trò của DST trong từng dự án</h2><p>DST Group phối hợp với doanh nghiệp để tổ chức lại thông điệp, nội dung, hình ảnh và các hoạt động tiếp cận khách hàng. Mỗi phạm vi được thống nhất theo mục tiêu cụ thể thay vì áp dụng một gói cố định.</p><p className="data-note">TODO: Cập nhật hồ sơ năng lực và mô tả doanh nghiệp chính thức.</p></div></Reveal>
        <Reveal><div className="vision-mission"><article><Compass size={24} aria-hidden="true" /><h2>Tầm nhìn</h2><p>TODO: Cập nhật tuyên bố tầm nhìn chính thức của DST Group.</p></article><article><Target size={24} aria-hidden="true" /><h2>Sứ mệnh</h2><p>Góp phần giúp doanh nghiệp tổ chức hoạt động Marketing, Media và Branding rõ ràng, có định hướng hơn.</p></article></div></Reveal>
      </section>
      <section className="section section-soft"><div className="page-width"><Reveal><SectionHeading eyebrow="Giá trị cốt lõi" title="Nguyên tắc được ưu tiên trong cách làm" /></Reveal><div className="value-grid">{companyValues.map((value, index) => <Reveal key={value.title}><article><span>{String(index + 1).padStart(2, "0")}</span><h3>{value.title}</h3><p>{value.text}</p></article></Reveal>)}</div></div></section>
      <section className="section page-width"><Reveal><SectionHeading eyebrow="Hành trình" title="Các mốc phát triển" /></Reveal><div className="timeline-list">{companyTimeline.map((item) => <Reveal key={item.year}><article><span>{item.year}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article></Reveal>)}</div></section>
      <section className="section page-width"><Reveal><SectionHeading eyebrow="Đội ngũ" title="Các nhóm năng lực phối hợp trong dự án" description="Thông tin nhân sự được mô tả theo nhóm chức năng để đảm bảo tính riêng tư và dễ cập nhật." /></Reveal><div className="team-grid">{teamMembers.map((member) => <Reveal key={member.role}><article>{member.image ? <img src={assetPath(member.image)} alt={member.imageAlt || member.role} loading="lazy" decoding="async" /> : null}<h3>{member.role}</h3><p>{member.focus}</p></article></Reveal>)}</div></section>
      <section className="section section-deep"><div className="page-width capability-summary"><Reveal><div><p className="eyebrow">Năng lực doanh nghiệp</p><h2>Tổ chức các hạng mục thành một kế hoạch dễ phối hợp</h2><p>Chiến lược, nội dung, thiết kế, sản xuất media và hoạt động triển khai có thể được kết nối theo từng giai đoạn phù hợp.</p></div></Reveal><div className="mini-stats">{companyStats.slice(0, 4).map((stat) => <Reveal key={stat.label}><article><Award size={18} aria-hidden="true" /><strong>{stat.value}</strong><span>{stat.label}</span></article></Reveal>)}</div></div></section>
      <CTASection onNavigate={onNavigate} onOpenChat={onOpenChat} title="Cùng làm rõ bước tiếp theo cho thương hiệu" />
    </>
  );
}
