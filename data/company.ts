import type { ClientPartner, ContactInformation, Stat, Testimonial } from "./types";

// TODO: Cập nhật và xác minh thông tin chính thức của DST Group trước khi công bố.
// Các giá trị dưới đây được giữ từ website hiện có để không làm mất thông tin đang dùng.
export const company: ContactInformation = {
  name: "DST Group",
  legalName: "Công ty Cổ phần Tập Đoàn DST",
  slogan: "Dịch vụ tận tâm - Nâng tầm thương hiệu",
  phone: "0328247888",
  phoneDisplay: "0328 247 888",
  email: "info@dstgroup.vn",
  address: "Đường Cao Hà, phường Cao Xanh, Quảng Ninh (đối diện Trường THPT Ngô Quyền)",
  workingHours: "TODO: Cập nhật giờ làm việc chính thức",
  website: "https://dstgroup.vn",
  zaloUrl: "https://zalo.me/0328247888",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Duong+Cao+Ha,+phuong+Cao+Xanh,+Quang+Ninh&output=embed",
};

// TODO: Xác nhận số liệu với DST Group trước khi dùng trong truyền thông chính thức.
export const companyStats: Stat[] = [
  { value: "2020", label: "Năm thành lập" },
  { value: "100+", label: "Dự án triển khai" },
  { value: "50+", label: "Doanh nghiệp đồng hành" },
  { value: "10+", label: "Nhóm dịch vụ" },
  { value: "24/7", label: "Hỗ trợ khách hàng" },
];

export const companyValues = [
  {
    title: "Tận tâm với mục tiêu",
    text: "Bắt đầu từ bối cảnh kinh doanh thực tế, không áp dụng một công thức giống nhau cho mọi doanh nghiệp.",
  },
  {
    title: "Minh bạch trong triển khai",
    text: "Phạm vi công việc, mốc thực hiện và cách phối hợp được trao đổi rõ từ đầu.",
  },
  {
    title: "Sáng tạo có định hướng",
    text: "Ý tưởng được đặt trong một hệ thống thương hiệu và mục tiêu truyền thông cụ thể.",
  },
  {
    title: "Đồng hành dài hạn",
    text: "Ưu tiên cách làm có thể tiếp tục tối ưu sau mỗi giai đoạn triển khai.",
  },
];

export const companyTimeline = [
  { year: "2020", title: "Khởi đầu hành trình", text: "TODO: Bổ sung mốc thành lập và câu chuyện chính thức." },
  { year: "Hiện tại", title: "Mở rộng hệ sinh thái dịch vụ", text: "Marketing, Media, Branding và giải pháp triển khai theo nhu cầu doanh nghiệp." },
  { year: "Tiếp theo", title: "Phát triển năng lực chuyên sâu", text: "TODO: Cập nhật định hướng chiến lược đã được phê duyệt." },
];

export const testimonials: Testimonial[] = [
  {
    name: "Nguyễn Minh Anh",
    role: "Founder, Mira Home",
    quote:
      "DST giúp chúng tôi chuyển từ làm nội dung rời rạc sang một kế hoạch thương hiệu rõ ràng, có số liệu và có nhịp triển khai.",
    image: "assets/12-spa-client-team.jpg",
    imageAlt: "Khách hàng trong dự án thương hiệu",
  },
  {
    name: "Trần Hoàng Nam",
    role: "Marketing Manager, Nova Hotel",
    quote:
      "Điểm mạnh nhất là sự chủ động. Đội ngũ theo sát từng giai đoạn, báo cáo minh bạch và tối ưu chiến dịch rất nhanh.",
    image: "assets/02-team-celebration.jpg",
    imageAlt: "Không khí hợp tác trong một dự án khách sạn",
  },
  {
    name: "Lê Quỳnh Trang",
    role: "COO, Lux Food",
    quote:
      "Hình ảnh, video và quảng cáo đồng bộ hơn hẳn. Thương hiệu của chúng tôi nhìn chuyên nghiệp và dễ thuyết phục khách hàng hơn.",
    image: "assets/14-restaurant-client-experience.jpg",
    imageAlt: "Trải nghiệm khách hàng tại dự án F&B",
  },
];

// TODO: Chỉ thay các tên dưới đây bằng logo/brand name khi có xác nhận sử dụng công khai.
// TODO: Replace contextual images with confirmed client logos or approved assets before publication.
// These images are illustrative project material, not client logos.
export const clientPartners: ClientPartner[] = [
  {
    name: "HALONG BAY",
    image: "assets/partner-halong-bay.jpg",
    imageAlt: "Cảnh vịnh Hạ Long dùng làm hình minh họa",
  },
  {
    name: "AURA SPA",
    image: "assets/partner-aura-spa.jpg",
    imageAlt: "Không gian spa dùng làm hình minh họa",
  },
  {
    name: "NOVA HOTEL",
    image: "assets/10-hotel-lobby-project.jpg",
    imageAlt: "Không gian sảnh khách sạn trong tư liệu dự án",
  },
  {
    name: "LUX FOOD",
    image: "assets/13-restaurant-food-project.jpg",
    imageAlt: "Hình ảnh món ăn trong tư liệu dự án F&B",
  },
  {
    name: "OCEAN GROUP",
    image: "assets/partner-ocean-group.jpg",
    imageAlt: "Góc nhìn đại dương từ trên cao dùng làm hình minh họa",
  },
  {
    name: "KAIROS",
    image: "assets/partner-kairos.jpg",
    imageAlt: "Đội ngũ sáng tạo làm việc dùng làm hình minh họa",
  },
  {
    name: "MIRA HOME",
    image: "assets/partner-mira-home.jpg",
    imageAlt: "Không gian nội thất hiện đại dùng làm hình minh họa",
  },
];

export const clientNames = clientPartners.map((client) => client.name);

// TODO: Add verified public social channels before publishing any additional links.
export const socialLinks = [
  { label: "Zalo", href: company.zaloUrl },
];
