"use client";

import { ArrowUp, Globe2, Mail, MapPin, Phone } from "lucide-react";
import { company, socialLinks } from "../../data/company";
import { footerNavigation, navigation } from "../../data/navigation";
import { services } from "../../data/services";
import { AppLink } from "./AppLink";
import { BrandLogo } from "./BrandLogo";

type FooterProps = { onNavigate: (path: string) => void };

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-grid page-width">
        <section className="footer-brand">
          <BrandLogo variant="media" />
          <p>{company.slogan}</p>
          <p className="footer-note">TODO: Cập nhật mô tả doanh nghiệp chính thức trước khi xuất bản.</p>
        </section>
        <section>
          <h2>Liên kết nhanh</h2>
          <div className="footer-links">
            {navigation.slice(1).map((item) => <AppLink key={item.path} to={item.path} onNavigate={onNavigate}>{item.label}</AppLink>)}
            {footerNavigation.map((item) => <AppLink key={item.path} to={item.path} onNavigate={onNavigate}>{item.label}</AppLink>)}
          </div>
        </section>
        <section>
          <h2>Dịch vụ</h2>
          <div className="footer-links">
            {services.map((service) => <AppLink key={service.slug} to={`/dich-vu/${service.slug}`} onNavigate={onNavigate}>{service.navLabel}</AppLink>)}
          </div>
        </section>
        <section>
          <h2>Liên hệ</h2>
          <div className="footer-contact">
            <a href={`tel:${company.phone}`}><Phone size={16} aria-hidden="true" />{company.phoneDisplay}</a>
            <a href={`mailto:${company.email}`}><Mail size={16} aria-hidden="true" />{company.email}</a>
            <span><MapPin size={16} aria-hidden="true" />{company.address}</span>
          </div>
        </section>
        <section>
          <h2>Kết nối</h2>
          <div className="footer-contact">
            {socialLinks.map((item) => <a href={item.href} key={item.label} target="_blank" rel="noreferrer"><Globe2 size={16} aria-hidden="true" />{item.label}</a>)}
          </div>
        </section>
      </div>
      <div className="footer-bottom page-width">
        <span>© {new Date().getFullYear()} {company.name}. {company.slogan}</span>
        <button type="button" className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Trở về đầu trang">
          <ArrowUp size={17} aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
