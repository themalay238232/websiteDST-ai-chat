"use client";

import {
  ArrowUpRight,
  ChevronRight,
  Mail,
  Menu,
  Mouse,
  Phone,
  Send,
  Star,
  X,
  Zap,
} from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { FormEvent, MouseEvent, ReactNode, useEffect, useState } from "react";
import {
  CheckIcon,
  clientLogos,
  navItems,
  packageGroups,
  processSteps,
  projects,
  quickLinks,
  reasons,
  services,
  stats,
  testimonials,
  UsersIcon,
} from "./site-data";
import { AiConsultantChat } from "./AiConsultantChat";

const marqueeItems = [
  "Marketing Strategy",
  "Creative Content",
  "Media Production",
  "TikTok Shop",
  "Branding",
  "Digital Transformation",
];

type ServiceItem = (typeof services)[number];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function BrandLogo({ variant = "group", className = "" }: { variant?: "group" | "media"; className?: string }) {
  const src = variant === "media" ? "assets/logo-dst-marketing-media.png" : "assets/logo-dst-group.png";
  const alt = variant === "media" ? "DST Marketing Media" : "DST Group - Dịch vụ tận tâm - Nâng tầm thương hiệu";

  return <img className={`brand-logo ${className}`} src={src} alt={alt} loading="eager" decoding="async" />;
}

function useTilt3D(strength = 10) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 180, damping: 22, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [strength, -strength]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-strength, strength]), spring);
  const glareX = useTransform(x, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(y, [-0.5, 0.5], [0, 100]);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.18), transparent 42%)`;

  function onMove(event: MouseEvent<HTMLElement>) {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return { reduce, rotateX, rotateY, glare, onMove, onLeave };
}

function Tilt3DCard({
  className,
  children,
  delay = 0,
  strength = 6,
}: {
  className: string;
  children: ReactNode;
  delay?: number;
  strength?: number;
}) {
  const { reduce, rotateX, rotateY, glare, onMove, onLeave } = useTilt3D(strength);

  return (
    <motion.article
      className={`${className} tilt-3d`}
      style={
        reduce
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1200,
              transformStyle: "preserve-3d",
            }
      }
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduce ? undefined : { y: -6, transition: { type: "spring", stiffness: 280, damping: 22 } }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {!reduce ? <motion.span className="tilt-glare" style={{ background: glare }} aria-hidden="true" /> : null}
      <div className="tilt-3d-content">{children}</div>
    </motion.article>
  );
}

function HeroScene() {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 120, damping: 18, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), spring);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), spring);
  const layerSlowX = useSpring(useTransform(x, [-0.5, 0.5], [-18, 18]), spring);
  const layerSlowY = useSpring(useTransform(y, [-0.5, 0.5], [-12, 12]), spring);
  const layerFastX = useSpring(useTransform(x, [-0.5, 0.5], [-34, 34]), spring);
  const layerFastY = useSpring(useTransform(y, [-0.5, 0.5], [-22, 22]), spring);

  function onMove(event: MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className="hero-visual"
      aria-label="Logo DST trong không gian nhận diện"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={reduce ? false : { opacity: 0, rotateY: -16, z: -40 }}
      animate={{ opacity: 1, rotateY: 0, z: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformStyle: "preserve-3d", transformPerspective: 1400 }}
    >
      <motion.div
        className="hero-orb hero-orb-coral"
        aria-hidden="true"
        style={reduce ? undefined : { x: layerSlowX, y: layerSlowY }}
      />
      <motion.div
        className="hero-orb hero-orb-seafoam"
        aria-hidden="true"
        style={reduce ? undefined : { x: layerFastX, y: layerFastY }}
      />
      <motion.div className="brand-orbit brand-orbit-one" style={reduce ? undefined : { x: layerSlowX, y: layerSlowY }} />
      <motion.div className="brand-orbit brand-orbit-two" style={reduce ? undefined : { x: layerFastX, y: layerFastY }} />
      <motion.div className="brand-chip chip-gold" style={reduce ? undefined : { x: layerFastX, y: layerSlowY }} />
      <motion.div className="brand-chip chip-teal" style={reduce ? undefined : { x: layerSlowX, y: layerFastY }} />
      <motion.div
        className="logo-orb"
        style={
          reduce
            ? undefined
            : {
                rotateX,
                rotateY,
                transformPerspective: 1200,
                transformStyle: "preserve-3d",
              }
        }
        animate={reduce ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <BrandLogo variant="media" />
      </motion.div>
      <motion.div className="orbit-label orbit-label-top" style={reduce ? undefined : { x: layerFastX, y: layerSlowY }}>
        ADS
      </motion.div>
      <motion.div
        className="orbit-label orbit-label-bottom"
        style={reduce ? undefined : { x: layerSlowX, y: layerFastY }}
      >
        BRANDING
      </motion.div>
    </motion.div>
  );
}

function ContactForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const trap = (form.elements.namedItem("company_site") as HTMLInputElement | null)?.value;
    if (trap) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setSent(true);
    form.reset();
  }

  return (
    <form className="contact-form reveal" onSubmit={onSubmit}>
      <input className="hidden-field" name="company_site" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="form-grid">
        <label>
          Họ và tên
          <input required name="name" placeholder="Nguyễn Văn A" />
        </label>
        <label>
          Số điện thoại
          <input required name="phone" inputMode="tel" pattern="^[0-9+\\s]{8,15}$" placeholder="0328 247 888" />
        </label>
        <label>
          Email
          <input required name="email" type="email" placeholder="email@doanhnghiep.vn" />
        </label>
        <label>
          Tên doanh nghiệp
          <input required name="company" placeholder="Tên công ty" />
        </label>
        <label>
          Dịch vụ quan tâm
          <select required name="service" defaultValue="">
            <option value="" disabled>
              Chọn dịch vụ
            </option>
            {quickLinks.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Ngân sách dự kiến
          <select required name="budget" defaultValue="">
            <option value="" disabled>
              Chọn khoảng ngân sách
            </option>
            <option>Dưới 20 triệu</option>
            <option>20 - 50 triệu</option>
            <option>50 - 100 triệu</option>
            <option>Trên 100 triệu</option>
          </select>
        </label>
      </div>
      <label>
        Nội dung cần tư vấn
        <textarea required name="message" rows={5} placeholder="Chia sẻ mục tiêu, ngành hàng và thời gian mong muốn..." />
      </label>
      <label className="policy">
        <input required type="checkbox" />
        Tôi đồng ý để DST Group liên hệ tư vấn và xử lý thông tin theo chính sách bảo mật.
      </label>
      <button className="primary-btn wide" type="submit" aria-label="Gửi yêu cầu tư vấn">
        Gửi yêu cầu tư vấn <Send size={18} />
      </button>
      {sent ? <p className="success-message">Cảm ơn bạn. DST Group sẽ liên hệ tư vấn trong thời gian sớm nhất.</p> : null}
    </form>
  );
}

function ServiceDetailModal({
  service,
  onClose,
}: {
  service: ServiceItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!service) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [service, onClose]);

  if (!service) return null;

  const Icon = service.icon;
  const hasImage = "proofImage" in service && service.proofImage;

  return (
    <div className="service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
      <button className="modal-backdrop" onClick={onClose} aria-label="Đóng chi tiết dịch vụ" />
      <article className="service-modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Đóng chi tiết dịch vụ">
          <X size={20} />
        </button>
        <div className="modal-intro">
          <div className="modal-icon">
            <Icon size={30} />
          </div>
          <p className="eyebrow">Chi tiết dịch vụ</p>
          <h2 id="service-modal-title">{service.title}</h2>
          <p>{service.detail}</p>
        </div>

        <div className={`modal-body ${hasImage ? "" : "no-proof-image"}`}>
          {hasImage ? (
            <figure className="service-proof">
              <img src={service.proofImage} alt={service.proofAlt} loading="lazy" decoding="async" />
              <figcaption>{service.proofCaption}</figcaption>
            </figure> ) : null}

          <div className="modal-detail-grid">
            <section>
              <h3>Phù hợp với</h3>
              <p>{service.fit}</p>
            </section>
            <section>
              <h3>Hạng mục bàn giao</h3>
              <ul>
                {service.deliverables.map((item) => (
                  <li key={item}>
                    <CheckIcon size={16} /> {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="primary-btn"
            onClick={() => {
              onClose();
              scrollToSection("contact");
            }}
          >
            Tư vấn dịch vụ này <ChevronRight size={18} />
          </button>
          <button className="ghost-btn" onClick={onClose}>
            Xem dịch vụ khác
          </button>
        </div>
      </article>
    </div>
  );
}

export function DstLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const loadTimer = window.setTimeout(() => setLoaded(true), 550);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onScroll = () => setHeaderScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const element = entry.target as HTMLElement;
          const raw = element.dataset.count ?? "";
          const numeric = Number(raw.replace(/[^0-9]/g, ""));
          const suffix = raw.replace(/[0-9]/g, "");
          if (!numeric || raw.includes("/") || reduced) {
            element.textContent = raw;
          } else {
            let current = 0;
            const step = Math.max(1, Math.ceil(numeric / 28));
            const timer = window.setInterval(() => {
              current = Math.min(numeric, current + step);
              element.textContent = `${current}${suffix}`;
              if (current >= numeric) window.clearInterval(timer);
            }, 32);
          }
          countObserver.unobserve(element);
        });
      },
      { threshold: 0.5 },
    );
    document.querySelectorAll("[data-count]").forEach((element) => countObserver.observe(element));
    return () => {
      window.clearTimeout(loadTimer);
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      countObserver.disconnect();
    };
  }, []);

  return (
    <>
      <div className={`loader ${loaded ? "loader-done" : ""}`} aria-hidden={loaded}>
        <BrandLogo />
        <span>Dịch vụ tận tâm - Nâng tầm thương hiệu</span>
      </div>

      <header className={`site-header${headerScrolled ? " is-scrolled" : ""}`}>
        <button className="brand" onClick={() => scrollToSection("home")} aria-label="Về đầu trang">
          <BrandLogo />
        </button>
        <nav className="desktop-nav" aria-label="Menu chính">
          {navItems.map(([label, id]) => (
            <button key={id} onClick={() => scrollToSection(id)}>
              {label}
            </button>
          ))}
        </nav>
        <button className="header-cta" onClick={() => scrollToSection("contact")}>
          Nhận tư vấn
        </button>
        <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Mở menu">
          <Menu />
        </button>
      </header>

      <div className={`mobile-panel ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <button className="close-btn" onClick={() => setMenuOpen(false)} aria-label="Đóng menu">
          <X />
        </button>
        {navItems.map(([label, id]) => (
          <button
            key={id}
            onClick={() => {
              setMenuOpen(false);
              scrollToSection(id);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <main>
        <section id="home" className="hero-section">
          <div className="ambient-grid" />
          <motion.div
            className="hero-copy"
            initial={reduce ? false : { opacity: 0, y: 28, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 900 }}
          >
            <p className="eyebrow">MARKETING • MEDIA • BRANDING</p>
            <h1>
              Marketing đúng hướng, thương hiệu <span>tăng trưởng</span>
            </h1>
            <p className="hero-desc">
              DST Group đồng hành cùng doanh nghiệp từ chiến lược, nội dung, quảng cáo đến Media và Branding. Mỗi kế hoạch
              được triển khai rõ ràng, đo lường minh bạch và tối ưu liên tục.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => scrollToSection("services")}>
                Khám phá dịch vụ <ChevronRight size={18} />
              </button>
              <button className="ghost-btn" onClick={() => scrollToSection("contact")}>
                Nhận tư vấn miễn phí
              </button>
            </div>
            <div className="hero-metrics">
              <span>
                <Zap size={18} /> ADS • TIKTOK SHOP • DESIGN • MEDIA • CONTENT • BRANDING
              </span>
            </div>
          </motion.div>
          <HeroScene />
          <button className="scroll-cue" onClick={() => scrollToSection("about")} aria-label="Cuộn xuống phần giới thiệu">
            <Mouse size={18} />
          </button>
        </section>

        <section className="marquee-strip" aria-label="Năng lực nổi bật">
          <div>
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span key={`${item}-${index}`}>{item}</span>
            ))}
          </div>
        </section>

        <section id="about" className="section split-section">
          <div className="media-panel reveal">
            <img src="assets/01-team-event-launch.jpg" alt="Đội ngũ DST trong một sự kiện ra mắt" loading="lazy" decoding="async" />
            <div className="media-badge">
              <UsersIcon size={20} /> Chiến lược rõ ràng • Triển khai minh bạch
            </div>
          </div>
          <div className="section-copy reveal">
            <p className="eyebrow">Về chúng tôi</p>
            <h2>Xây dựng giá trị thương hiệu bền vững</h2>
            <p>
              DST Group là đơn vị cung cấp giải pháp Marketing và Media toàn diện, đồng hành cùng doanh nghiệp trong quá
              trình tiếp cận khách hàng, xây dựng hình ảnh và phát triển kinh doanh.
            </p>
            <div className="stats-grid">
              {stats.map((item) => (
                <div key={item.label}>
                  <strong data-count={item.value}>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="highlight-line">Dịch vụ tận tâm - Nâng tầm thương hiệu</p>
          </div>
        </section>

        <section id="services" className="section">
          <div className="section-heading reveal">
            <p className="eyebrow">Hệ sinh thái dịch vụ</p>
            <h2>Giải pháp toàn diện</h2>
            <p>
              Từ chiến lược đến thực thi, DST Group cung cấp đầy đủ giải pháp giúp doanh nghiệp xây dựng thương hiệu và
              tăng trưởng doanh thu.
            </p>
          </div>
          <div className="service-grid">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Tilt3DCard className="service-card" key={service.title} delay={index * 0.05} strength={5}>
                  <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="service-icon-wrap">
                    <Icon className="service-icon" size={28} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <div className="tag-list">
                    {service.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <button onClick={() => setSelectedService(service)}>
                    Xem chi tiết <ArrowUpRight size={16} />
                  </button>
                </Tilt3DCard>
              );
            })}
          </div>
        </section>

        <section className="package-section">
          <div className="package-inner reveal">
            <div>
              <p className="eyebrow dark">Giải pháp trọn gói</p>
              <h2>Một đội Marketing chuyên nghiệp, chi phí tối ưu</h2>
            </div>
            <button className="dark-btn" onClick={() => scrollToSection("contact")}>
              Yêu cầu báo giá
            </button>
          </div>
          <div className="package-grid">
            {packageGroups.map((group, index) => {
              const Icon = group.icon;
              return (
                <Tilt3DCard className="package-card" key={group.title} delay={index * 0.07} strength={5}>
                  <Icon size={26} />
                  <h3>{group.title}</h3>
                  {group.items.map((item) => (
                    <p key={item}>
                      <CheckIcon size={16} /> {item}
                    </p>
                  ))}
                </Tilt3DCard>
              );
            })}
          </div>
        </section>

        <section id="process" className="section process-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Quy trình làm việc</p>
            <h2>Rõ ràng và minh bạch</h2>
          </div>
          <div className="process-list">
            <div className="timeline-line">
              <span />
            </div>
            {processSteps.map(([step, title, Icon], index) => (
              <motion.article
                className="process-item"
                key={step}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <div className="step-index">{step}</div>
                <Icon size={24} />
                <h3>{title}</h3>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="section reasons-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Tại sao chọn DST Group</p>
            <h2>Đối tác tăng trưởng đáng tin cậy</h2>
          </div>
          <div className="reason-grid">
            {reasons.map((reason, index) => (
              <motion.article
                className="reason-card"
                key={reason}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
              >
                <CheckIcon size={22} />
                <p>{reason}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="projects" className="section project-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Dự án tiêu biểu</p>
            <h2>Dấu ấn triển khai</h2>
          </div>
          <div className="project-rail">
            {projects.map((project, index) => (
              <motion.article
                className="project-card"
                key={project.title}
                initial={reduce ? false : { opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
              >
                <img src={project.img} alt={project.title} loading="lazy" decoding="async" />
                <div className="project-overlay">
                  <span>{project.type}</span>
                  <h3>{project.title}</h3>
                  <p>{project.goal}</p>
                  <strong>{project.result}</strong>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="clients" className="section clients-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Đối tác và khách hàng</p>
            <h2>Được doanh nghiệp tin tưởng</h2>
          </div>
          <div className="logo-cloud reveal">
            {[...clientLogos, ...clientLogos].map((logo, index) => (
              <span key={`${logo}-${index}`}>{logo}</span>
            ))}
          </div>
          <div className="testimonial-grid">
            {testimonials.map((item, index) => (
              <motion.article
                className="testimonial-card"
                key={item.name}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08, duration: 0.45 }}
              >
                <img src={item.img} alt={item.name} loading="lazy" decoding="async" />
                <div className="stars" aria-label="5 sao">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} size={15} fill="currentColor" />
                  ))}
                </div>
                <p>&ldquo;{item.quote}&rdquo;</p>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <div className="cta-content reveal">
            <p className="eyebrow">DST Group Marketing & Media</p>
            <h2>Sẵn sàng nâng tầm thương hiệu?</h2>
            <p>
              Hãy chia sẻ mục tiêu của bạn. Đội ngũ DST Group sẽ tư vấn giải pháp phù hợp và xây dựng kế hoạch triển khai
              cụ thể.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" onClick={() => scrollToSection("contact")}>
                Nhận tư vấn miễn phí
              </button>
              <a className="ghost-btn" href="tel:0328247888">
                Liên hệ ngay
              </a>
            </div>
          </div>
          <div className="cta-sphere" aria-hidden="true">
            <BrandLogo />
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-info reveal">
            <p className="eyebrow">Liên hệ</p>
            <h2>Nhận tư vấn chiến lược</h2>
            <p>
              Công ty Cổ phần Tập Đoàn DST
              <br />
              Địa chỉ: Hạ Long, Quảng Ninh
            </p>
            <a href="tel:0328247888">
              <Phone size={18} /> 0328 247 888
            </a>
            <a href="mailto:info@dstgroup.vn">
              <Mail size={18} /> info@dstgroup.vn
            </a>
            <a href="https://dstgroup.vn" target="_blank" rel="noreferrer">
              <ArrowUpRight size={18} /> dstgroup.vn
            </a>
          </div>
          <ContactForm />
        </section>
      </main>

      <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} />

      <footer className="site-footer">
        <div>
          <BrandLogo variant="media" />
          <p>Dịch vụ tận tâm - Nâng tầm thương hiệu.</p>
        </div>
        <div>
          <h3>Menu nhanh</h3>
          {navItems.slice(1).map(([label, id]) => (
            <button key={id} onClick={() => scrollToSection(id)}>
              {label}
            </button>
          ))}
        </div>
        <div>
          <h3>Dịch vụ</h3>
          {quickLinks.map((link) => (
            <span key={link}>{link}</span>
          ))}
        </div>
        <div>
          <h3>Kết nối</h3>
          <a href="tel:0328247888">Điện thoại</a>
          <a href="mailto:info@dstgroup.vn">Email</a>
          <a href="https://dstgroup.vn" target="_blank" rel="noreferrer">
            Website
          </a>
          <span>Facebook • TikTok • YouTube • Zalo</span>
        </div>
        <p className="copyright">© DST Group. Dịch vụ tận tâm - Nâng tầm thương hiệu.</p>
      </footer>

      <div className="floating-actions">
        <a href="tel:0328247888" aria-label="Gọi DST Group">
          <Phone size={20} />
        </a>
        <a href="https://zalo.me/0328247888" aria-label="Liên hệ Zalo DST Group">
          Zalo
        </a>
        <button onClick={() => scrollToSection("home")} aria-label="Quay lại đầu trang">
          ↑
        </button>
      </div>
      <AiConsultantChat />
    </>
  );
}

