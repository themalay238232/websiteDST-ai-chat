import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { company } from "../../data/company";
import { ConsultationForm } from "../components/ConsultationForm";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/Reveal";

type PageProps = { onOpenChat: () => void };

export function ContactPage({ onOpenChat }: PageProps) {
  return (
    <>
      <PageHero eyebrow="Liên hệ DST Group" title="Trao đổi nhu cầu theo cách thuận tiện cho bạn" description="Bạn có thể gửi yêu cầu, gọi điện, liên hệ Zalo hoặc mở AI Chat. Các thông tin doanh nghiệp quan trọng được giữ trong file cấu hình để chủ dự án cập nhật tập trung." image="assets/01-team-event-launch.jpg" imageAlt="Đội ngũ DST tại sự kiện" />
      <section className="section page-width contact-page-grid">
        <Reveal><div className="contact-details"><p className="eyebrow">Thông tin liên hệ</p><h2>{company.legalName}</h2><a href={`tel:${company.phone}`}><Phone size={19} aria-hidden="true" /><span><small>Điện thoại</small>{company.phoneDisplay}</span></a><a href={`mailto:${company.email}`}><Mail size={19} aria-hidden="true" /><span><small>Email</small>{company.email}</span></a><span><MapPin size={19} aria-hidden="true" /><span><small>Địa chỉ</small>{company.address}</span></span><span><Clock3 size={19} aria-hidden="true" /><span><small>Giờ làm việc</small>{company.workingHours}</span></span><div className="contact-action-row"><a className="primary-btn" href={company.zaloUrl} target="_blank" rel="noreferrer">Liên hệ Zalo</a><button className="ghost-btn" type="button" onClick={onOpenChat}><MessageCircle size={17} aria-hidden="true" />Mở AI Chat</button></div></div></Reveal>
        <Reveal><ConsultationForm title="Gửi yêu cầu tư vấn" /></Reveal>
      </section>
      <section className="section section-soft"><div className="page-width"><Reveal><div className="map-frame"><iframe title="Bản đồ vị trí DST Group" src={company.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><p>TODO: Xác nhận địa chỉ và vị trí bản đồ chính thức trước khi công bố.</p></div></Reveal></div></section>
    </>
  );
}
