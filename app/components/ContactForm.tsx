"use client";

import { CheckCircle2, LoaderCircle, Send, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { company } from "../../data/company";
import { services } from "../../data/services";

type FormKind = "contact" | "consultation" | "application";
type FormStatus = { type: "idle" | "loading" | "success" | "error"; message?: string };

type ContactFormProps = {
  kind?: FormKind;
  service?: string;
  position?: string;
  title?: string;
};

type FormValues = {
  name: string;
  phone: string;
  email: string;
  company: string;
  service: string;
  position: string;
  message: string;
  consent: boolean;
  companySite: string;
};

const phonePattern = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/;
const initialValues: FormValues = {
  name: "",
  phone: "",
  email: "",
  company: "",
  service: "",
  position: "",
  message: "",
  consent: false,
  companySite: "",
};

function getFormEndpoint() {
  if (typeof window === "undefined") return "";
  const config = (window as Window & { __DST_FORM_CONFIG__?: { endpoint?: string } }).__DST_FORM_CONFIG__;
  return config?.endpoint || "";
}

function validate(values: FormValues, kind: FormKind) {
  const name = values.name.trim();
  const phone = values.phone.replace(/[\s.-]/g, "");
  const email = values.email.trim();
  const message = values.message.trim();
  if (name.length < 2 || name.length > 80) return "Vui lòng nhập họ và tên từ 2 đến 80 ký tự.";
  if (!phonePattern.test(phone)) return "Vui lòng nhập số điện thoại Việt Nam hợp lệ.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return "Vui lòng nhập email hợp lệ.";
  if (kind === "consultation" && !values.service) return "Vui lòng chọn dịch vụ quan tâm.";
  if (kind === "application" && !values.position) return "Vui lòng chọn vị trí ứng tuyển.";
  if (message.length < 15 || message.length > 1000) return "Nội dung cần từ 15 đến 1000 ký tự.";
  if (!values.consent) return "Bạn cần đồng ý để DST Group xử lý thông tin tư vấn.";
  return "";
}

export function ContactForm({ kind = "contact", service = "", position = "", title }: ContactFormProps) {
  const [values, setValues] = useState<FormValues>({ ...initialValues, service, position });
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });
  const submitLabel = useMemo(() => kind === "application" ? "Gửi hồ sơ ứng tuyển" : "Gửi yêu cầu tư vấn", [kind]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (values.companySite) return;
    const error = validate(values, kind);
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }
    const rateKey = `dst-form-last-submit-${kind}`;
    const lastSubmit = Number(window.localStorage.getItem(rateKey) || 0);
    if (Date.now() - lastSubmit < 30_000) {
      setStatus({ type: "error", message: "Bạn vừa gửi yêu cầu. Vui lòng chờ khoảng 30 giây trước khi gửi lại." });
      return;
    }

    setStatus({ type: "loading" });
    try {
      const endpoint = getFormEndpoint();
      if (!endpoint) {
        throw new Error("FORM_ENDPOINT_MISSING");
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: kind,
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          company: values.company.trim(),
          service: values.service,
          position: values.position,
          message: values.message.trim(),
        }),
      });
      if (!response.ok) throw new Error("FORM_SUBMIT_FAILED");
      window.localStorage.setItem(rateKey, String(Date.now()));
      setStatus({ type: "success", message: "Cảm ơn bạn. DST Group đã nhận được yêu cầu và sẽ phản hồi theo thông tin bạn cung cấp." });
      setValues({ ...initialValues, service, position });
    } catch (submissionError) {
      const message = submissionError instanceof Error && submissionError.message === "FORM_ENDPOINT_MISSING"
        ? `Biểu mẫu chưa được kết nối kênh nhận yêu cầu chính thức. Vui lòng liên hệ Zalo hoặc gọi ${company.phoneDisplay} để DST tiếp nhận ngay.`
        : "Chưa thể gửi yêu cầu lúc này. Vui lòng thử lại hoặc liên hệ DST qua Zalo và điện thoại.";
      setStatus({ type: "error", message });
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      {title ? <h2>{title}</h2> : null}
      <input className="honeypot" name="company_site" value={values.companySite} onChange={(event) => update("companySite", event.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="form-grid">
        <label>Họ và tên<input value={values.name} onChange={(event) => update("name", event.target.value)} name="name" autoComplete="name" maxLength={80} required /></label>
        <label>Số điện thoại<input value={values.phone} onChange={(event) => update("phone", event.target.value)} name="phone" inputMode="tel" autoComplete="tel" maxLength={20} required /></label>
        <label>Email<input value={values.email} onChange={(event) => update("email", event.target.value)} name="email" type="email" autoComplete="email" maxLength={120} required /></label>
        <label>Tên doanh nghiệp <span className="optional">(nếu có)</span><input value={values.company} onChange={(event) => update("company", event.target.value)} name="company" autoComplete="organization" maxLength={120} /></label>
        {kind === "consultation" ? (
          <label>Dịch vụ quan tâm<select value={values.service} onChange={(event) => update("service", event.target.value)} name="service" required><option value="">Chọn dịch vụ</option>{services.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label>
        ) : null}
        {kind === "application" ? <label>Vị trí ứng tuyển<input value={values.position} onChange={(event) => update("position", event.target.value)} name="position" maxLength={120} required /></label> : null}
      </div>
      <label>Nội dung cần trao đổi<textarea value={values.message} onChange={(event) => update("message", event.target.value)} name="message" rows={5} maxLength={1000} required placeholder={kind === "application" ? "Giới thiệu ngắn về kinh nghiệm hoặc đường dẫn portfolio..." : "Chia sẻ mục tiêu, ngành hàng và thời gian dự kiến..."} /></label>
      <label className="consent-row"><input checked={values.consent} onChange={(event) => update("consent", event.target.checked)} name="consent" type="checkbox" required /><span><ShieldCheck size={17} aria-hidden="true" />Tôi đồng ý để DST Group liên hệ và xử lý thông tin theo chính sách bảo mật.</span></label>
      <button className="primary-btn" type="submit" disabled={status.type === "loading"}>{status.type === "loading" ? <><LoaderCircle className="spin" size={17} aria-hidden="true" />Đang gửi</> : <><Send size={17} aria-hidden="true" />{submitLabel}</>}</button>
      {status.type !== "idle" ? <p className={`form-status ${status.type}`} role="status">{status.type === "success" ? <CheckCircle2 size={17} aria-hidden="true" /> : null}{status.message}</p> : null}
    </form>
  );
}
