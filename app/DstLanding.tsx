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
import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
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

const marqueeItems = [
  "Marketing Strategy",
  "Creative Content",
  "Media Production",
  "TikTok Shop",
  "Branding",
  "Digital Transformation",
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function BrandLogo({ variant = "group", className = "" }: { variant?: "group" | "media"; className?: string }) {
  const src = variant === "media" ? "/assets/logo-dst-marketing-media.png" : "/assets/logo-dst-group.png";
  const alt = variant === "media" ? "DST Marketing Media" : "DST Group - Dịch vụ tận tâm - Nâng tầm thương hiệu";

  return <img className={`brand-logo ${className}`} src={src} alt={alt} loading="eager" decoding="async" />;
}

function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = sceneRef.current;
    if (!canvas || !shell) return;

    let disposed = false;
    let disposeScene = () => {};

    async function mountScene() {
      const THREE = await import("three");
      if (disposed) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 7.5);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));

      const group = new THREE.Group();
      scene.add(group);

      const gold = new THREE.MeshStandardMaterial({
        color: "#E09840",
        metalness: 0.42,
        roughness: 0.36,
        emissive: "#4c2606",
        emissiveIntensity: 0.3,
      });
      const teal = new THREE.MeshStandardMaterial({
        color: "#305858",
        metalness: 0.28,
        roughness: 0.42,
        emissive: "#0c2221",
        emissiveIntensity: 0.25,
      });

      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.018, 8, 96), gold);
      const orbit = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.01, 8, 96), teal);
      orbit.rotation.x = Math.PI / 2.6;
      group.add(ring, orbit);

      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), gold);
      cube.position.set(-2.45, 1.3, 0.1);
      const octa = new THREE.Mesh(new THREE.OctahedronGeometry(0.4), teal);
      octa.position.set(2.35, -1.2, 0.3);
      group.add(cube, octa);

      const particlesGeometry = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(70 * 3);
      for (let i = 0; i < particlePositions.length; i += 3) {
        particlePositions[i] = (Math.random() - 0.5) * 6.6;
        particlePositions[i + 1] = (Math.random() - 0.5) * 4.3;
        particlePositions[i + 2] = (Math.random() - 0.5) * 2.4;
      }
      particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
      const particles = new THREE.Points(
        particlesGeometry,
        new THREE.PointsMaterial({ color: "#E8A040", size: 0.024, transparent: true, opacity: 0.62 }),
      );
      scene.add(particles);

      scene.add(new THREE.AmbientLight("#fff7ea", 0.58));
      const key = new THREE.PointLight("#E09840", 4.2, 10);
      key.position.set(-1.2, 2.2, 3);
      scene.add(key);
      const rim = new THREE.PointLight("#305858", 2.6, 10);
      rim.position.set(3, -1, 3);
      scene.add(rim);

      const pointer = { x: 0, y: 0 };
      const resize = () => {
        const { width, height } = shell.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
      };
      const onMove = (event: PointerEvent) => {
        const rect = shell.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      };

      let frame = 0;
      let last = 0;
      const animate = (time: number) => {
        frame = requestAnimationFrame(animate);
        if (time - last < 33) return;
        last = time;
        if (!reduced) {
          group.rotation.y += 0.003;
          group.rotation.x += (pointer.y * 0.1 - group.rotation.x) * 0.035;
          group.rotation.z += (pointer.x * 0.08 - group.rotation.z) * 0.035;
          cube.rotation.x += 0.008;
          octa.rotation.y -= 0.007;
          particles.rotation.y += 0.001;
        }
        renderer.render(scene, camera);
      };

      resize();
      animate(0);
      window.addEventListener("resize", resize);
      shell.addEventListener("pointermove", onMove);

      disposeScene = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", resize);
        shell.removeEventListener("pointermove", onMove);
        renderer.dispose();
        particlesGeometry.dispose();
      };
    }

    mountScene();

    return () => {
      disposed = true;
      disposeScene();
    };
  }, []);

  return (
    <div className="hero-visual" ref={sceneRef} aria-label="Logo DST trong không gian nhận diện">
      <canvas ref={canvasRef} />
      <div className="logo-orb">
        <BrandLogo variant="media" />
      </div>
      <div className="orbit-label orbit-label-top">ADS</div>
      <div className="orbit-label orbit-label-bottom">BRANDING</div>
    </div>
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

export function DstLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => setLoaded(true), 550);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
          if (!numeric || reduced) {
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

    const onPointer = (event: PointerEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    window.addEventListener("pointermove", onPointer);

    return () => {
      window.clearTimeout(loadTimer);
      observer.disconnect();
      countObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  function handleTilt(event: MouseEvent<HTMLElement>) {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    card.style.setProperty("--rx", `${-(y / rect.height - 0.5) * 4}deg`);
    card.style.setProperty("--ry", `${(x / rect.width - 0.5) * 4}deg`);
  }

  function clearTilt(event: MouseEvent<HTMLElement>) {
    event.currentTarget.style.setProperty("--rx", "0deg");
    event.currentTarget.style.setProperty("--ry", "0deg");
  }

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />
      <div className={`loader ${loaded ? "loader-done" : ""}`} aria-hidden={loaded}>
        <BrandLogo />
        <span>Dịch vụ tận tâm - Nâng tầm thương hiệu</span>
      </div>

      <header className="site-header">
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
          <div className="hero-copy reveal">
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
          </div>
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
            <img src="/assets/01-team-event-launch.jpg" alt="Đội ngũ DST trong một sự kiện ra mắt" loading="lazy" decoding="async" />
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
                <article
                  className="service-card reveal"
                  key={service.title}
                  onMouseMove={handleTilt}
                  onMouseLeave={clearTilt}
                >
                  <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
                  <Icon className="service-icon" size={30} />
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                  <div className="tag-list">
                    {service.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <button onClick={() => scrollToSection("contact")}>
                    Xem chi tiết <ArrowUpRight size={16} />
                  </button>
                </article>
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
            {packageGroups.map((group) => {
              const Icon = group.icon;
              return (
                <article className="package-card reveal" key={group.title}>
                  <Icon size={26} />
                  <h3>{group.title}</h3>
                  {group.items.map((item) => (
                    <p key={item}>
                      <CheckIcon size={16} /> {item}
                    </p>
                  ))}
                </article>
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
            {processSteps.map(([step, title, Icon]) => (
              <article className="process-item reveal" key={step}>
                <div className="step-index">{step}</div>
                <Icon size={24} />
                <h3>{title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="section reasons-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Tại sao chọn DST Group</p>
            <h2>Đối tác tăng trưởng đáng tin cậy</h2>
          </div>
          <div className="reason-grid">
            {reasons.map((reason) => (
              <article className="reason-card reveal" key={reason}>
                <CheckIcon size={22} />
                <p>{reason}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="section project-section">
          <div className="section-heading reveal">
            <p className="eyebrow">Dự án tiêu biểu</p>
            <h2>Dấu ấn triển khai</h2>
          </div>
          <div className="project-rail">
            {projects.map((project) => (
              <article className="project-card reveal" key={project.title}>
                <img src={project.img} alt={project.title} loading="lazy" decoding="async" />
                <div className="project-overlay">
                  <span>{project.type}</span>
                  <h3>{project.title}</h3>
                  <p>{project.goal}</p>
                  <strong>{project.result}</strong>
                </div>
              </article>
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
            {testimonials.map((item) => (
              <article className="testimonial-card reveal" key={item.name}>
                <img src={item.img} alt={item.name} loading="lazy" decoding="async" />
                <div className="stars" aria-label="5 sao">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} fill="currentColor" />
                  ))}
                </div>
                <p>"{item.quote}"</p>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </article>
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
    </>
  );
}
