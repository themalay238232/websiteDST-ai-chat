import { ShieldCheck } from "lucide-react";
import { PageHero } from "../components/PageHero";

type LegalPageProps = { type: "privacy" | "terms" };

const content = {
  privacy: {
    eyebrow: "Chính sách bảo mật",
    title: "Nguyên tắc xử lý thông tin liên hệ",
    description: "Bản nội dung mẫu này cần được DST Group cập nhật và phê duyệt trước khi dùng như một chính sách chính thức.",
    sections: [
      ["Thông tin được thu thập", "Biểu mẫu có thể yêu cầu họ tên, số điện thoại, email, doanh nghiệp và nội dung nhu cầu để phục vụ tư vấn."],
      ["Mục đích sử dụng", "Thông tin chỉ nên được dùng để phản hồi yêu cầu, tư vấn dịch vụ và cải thiện quá trình hỗ trợ khách hàng."],
      ["Lưu trữ và bảo mật", "Website không ghi API key vào frontend. Cách lưu trữ dữ liệu liên hệ và thời hạn lưu cần được DST Group công bố chính thức."],
    ],
  },
  terms: {
    eyebrow: "Điều khoản sử dụng",
    title: "Điều khoản sử dụng website",
    description: "Bản nội dung mẫu này cần được DST Group cập nhật và phê duyệt trước khi dùng như một điều khoản chính thức.",
    sections: [
      ["Nội dung website", "Nội dung, hình ảnh và case study chỉ nên được sử dụng theo phạm vi được chủ sở hữu cho phép."],
      ["Thông tin tư vấn", "Thông tin trên website có tính chất tham khảo. Phạm vi, chi phí và tiến độ chỉ có hiệu lực sau khi các bên thống nhất bằng văn bản."],
      ["Liên hệ", "Người dùng có thể liên hệ DST Group để làm rõ thông tin dịch vụ, nội dung hoặc quyền sử dụng tư liệu."],
    ],
  },
} as const;

export function LegalPage({ type }: LegalPageProps) {
  const page = content[type];
  return <><PageHero eyebrow={page.eyebrow} title={page.title} description={page.description} compact /><section className="section page-width legal-content"><ShieldCheck size={30} aria-hidden="true" />{page.sections.map(([heading, text]) => <section key={heading}><h2>{heading}</h2><p>{text}</p></section>)}</section></>;
}
