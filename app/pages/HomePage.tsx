import { ArrowRight, ClipboardCheck, Lightbulb, ShieldCheck, Star, Users } from "lucide-react";
import { clientNames, companyStats, testimonials } from "../../data/company";
import { processSteps } from "../../data/home";
import { projects } from "../../data/projects";
import { services } from "../../data/services";
import { AppLink } from "../components/AppLink";
import { BrandLogo } from "../components/BrandLogo";
import { CTASection } from "../components/CTASection";
import { ProjectCard } from "../components/ProjectCard";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { ServiceCard } from "../components/ServiceCard";
import { assetPath } from "../lib/site";

type PageProps = { onNavigate: (path: string) => void; onOpenChat: () => void };

const reasons = [
  { icon: Lightbulb, title: "Làm từ mục tiêu", text: "Bắt đầu bằng bối cảnh và ưu tiên kinh doanh trước khi chọn hạng mục." },
  { icon: ClipboardCheck, title: "Phạm vi rõ ràng", text: "Đầu việc, mốc triển khai và cách phối hợp được thống nhất từ đầu." },
  { icon: ShieldCheck, title: "Đồng bộ điểm chạm", text: "Marketing, nội dung, media và thương hiệu có thể cùng bám một định hướng." },
  { icon: Users, title: "Phối hợp sát dự án", text: "Tập trung vào trao đổi thực tế để hỗ trợ đội ngũ triển khai hiệu quả hơn." },
];

export function HomePage({ onNavigate, onOpenChat }: PageProps) {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-grid page-width">
          <Reveal className="home-hero-copy">
            <p className="eyebrow">MARKETING • MEDIA • BRANDING</p>
            <h1>Marketing đúng hướng, <span>tăng trưởng bền vững</span></h1>
            <p>DST Group đồng hành cùng doanh nghiệp từ chiến lược, nội dung, quảng cáo đến Media và Branding. Mỗi kế hoạch hướng đến sự rõ ràng, khả năng phối hợp và tối ưu theo từng giai đoạn.</p>
            <div className="hero-actions">
              <AppLink className="primary-btn" to="/dich-vu" onNavigate={onNavigate}>Khám phá dịch vụ <ArrowRight size={17} aria-hidden="true" /></AppLink>
              <AppLink className="ghost-btn" to="/lien-he" onNavigate={onNavigate}>Nhận tư vấn</AppLink>
            </div>
            <div className="hero-capabilities">ADS • TIKTOK SHOP • DESIGN • MEDIA • CONTENT • BRANDING</div>
          </Reveal>
          <Reveal className="hero-brand-stage">
            <span className="brand-line brand-line-one" aria-hidden="true" />
            <span className="brand-line brand-line-two" aria-hidden="true" />
            <div className="hero-brand-logo"><BrandLogo variant="media" priority /></div>
            <span className="brand-tag tag-top">ADS</span>
            <span className="brand-tag tag-bottom">BRANDING</span>
          </Reveal>
        </div>
      </section>

      <section className="capability-strip" aria-label="Năng lực nổi bật"><div><span>Marketing Strategy</span><span>Creative Content</span><span>Media Production</span><span>TikTok Shop</span><span>Branding</span><span>Website Experience</span></div></section>

      <section className="section page-width intro-split">
        <Reveal className="intro-media">
          <img src={assetPath("assets/01-team-event-launch.jpg")} alt="Đội ngũ DST tại một sự kiện ra mắt" loading="lazy" decoding="async" />
          <span><Users size={18} aria-hidden="true" />Chiến lược rõ ràng • Triển khai minh bạch</span>
        </Reveal>
        <Reveal className="intro-copy">
          <p className="eyebrow">Về DST Group</p>
          <h2>Xây dựng giá trị thương hiệu có thể tiếp tục phát triển</h2>
          <p>DST Group cung cấp các giải pháp Marketing và Media để doanh nghiệp tổ chức lại cách tiếp cận khách hàng, hình ảnh thương hiệu và hoạt động truyền thông.</p>
          <AppLink className="text-link" to="/gioi-thieu" onNavigate={onNavigate}>Tìm hiểu về DST Group <ArrowRight size={16} aria-hidden="true" /></AppLink>
        </Reveal>
      </section>

      <section className="section page-width">
        <Reveal><SectionHeading eyebrow="Hệ sinh thái dịch vụ" title="Dịch vụ theo mục tiêu kinh doanh" description="Mỗi dịch vụ được mô tả rõ vấn đề, cách triển khai và hạng mục có thể bàn giao." action={<AppLink className="text-link" to="/dich-vu" onNavigate={onNavigate}>Xem tất cả <ArrowRight size={16} aria-hidden="true" /></AppLink>} /></Reveal>
        <div className="service-grid">{services.map((service) => <Reveal key={service.slug}><ServiceCard service={service} onNavigate={onNavigate} /></Reveal>)}</div>
      </section>

      <section className="section section-soft">
        <div className="page-width">
          <Reveal><SectionHeading eyebrow="Vì sao chọn DST" title="Cách làm hướng đến sự rõ ràng" description="Tập trung vào nền tảng để đội ngũ và doanh nghiệp dễ phối hợp trong suốt quá trình triển khai." /></Reveal>
          <div className="reason-grid">{reasons.map((reason) => { const Icon = reason.icon; return <Reveal key={reason.title}><article className="reason-card"><Icon size={23} aria-hidden="true" /><h3>{reason.title}</h3><p>{reason.text}</p></article></Reveal>; })}</div>
        </div>
      </section>

      <section className="section page-width">
        <Reveal><SectionHeading eyebrow="Quy trình làm việc" title="Rõ ràng từ trao đổi đến bàn giao" /></Reveal>
        <ol className="process-grid">{processSteps.map((step, index) => <Reveal key={step.title}><li><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.text}</p></li></Reveal>)}</ol>
      </section>

      <section className="section page-width">
        <Reveal><SectionHeading eyebrow="Dự án tiêu biểu" title="Một số hướng triển khai theo nhu cầu thực tế" description="Thông tin định lượng và tên khách hàng được giữ ở mức cần xác nhận để tránh công bố dữ liệu chưa được phê duyệt." action={<AppLink className="text-link" to="/du-an" onNavigate={onNavigate}>Xem dự án <ArrowRight size={16} aria-hidden="true" /></AppLink>} /></Reveal>
        <div className="project-grid">{projects.slice(0, 3).map((project) => <Reveal key={project.slug}><ProjectCard project={project} onNavigate={onNavigate} /></Reveal>)}</div>
      </section>

      <section className="section impact-section">
        <div className="page-width">
          <Reveal><SectionHeading eyebrow="Dấu mốc hoạt động" title="Những thông tin cần được xác nhận định kỳ" description="Các số liệu được giữ theo thông tin hiện có của website và được đánh dấu để DST Group rà soát trước khi dùng trong tài liệu chính thức." /></Reveal>
          <div className="stats-grid">{companyStats.map((stat) => <Reveal key={stat.label}><article><strong>{stat.value}</strong><span>{stat.label}</span></article></Reveal>)}</div>
        </div>
      </section>

      <section className="section page-width">
        <Reveal><SectionHeading eyebrow="Khách hàng chia sẻ" title="Góc nhìn từ quá trình hợp tác" /></Reveal>
        <div className="testimonial-grid">{testimonials.map((item) => <Reveal key={item.name}><article className="testimonial-card">{item.image ? <img src={assetPath(item.image)} alt={item.imageAlt || item.name} loading="lazy" decoding="async" /> : null}<div><span className="rating" aria-label="5 sao"><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /><Star size={15} fill="currentColor" /></span><blockquote>“{item.quote}”</blockquote><strong>{item.name}</strong><p>{item.role}</p></div></article></Reveal>)}</div>
      </section>

      <section className="client-section"><div className="page-width"><p className="eyebrow">Đối tác & khách hàng</p><div className="client-list">{clientNames.map((name) => <span key={name}>{name}</span>)}</div></div></section>
      <CTASection onNavigate={onNavigate} onOpenChat={onOpenChat} />
    </>
  );
}
