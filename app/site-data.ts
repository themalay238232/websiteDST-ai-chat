import {
  BadgeCheck,
  BarChart3,
  Blocks,
  Building2,
  Camera,
  CheckCircle2,
  ClipboardList,
  Code2,
  Compass,
  FileText,
  Handshake,
  Hotel,
  Megaphone,
  MessageCircle,
  Palette,
  RadioTower,
  Rocket,
  ScanSearch,
  Settings2,
  ShoppingBag,
  Sparkles,
  Target,
  Users,
  Video,
} from "lucide-react";

export const navItems = [
  ["Trang chủ", "home"],
  ["Về chúng tôi", "about"],
  ["Dịch vụ", "services"],
  ["Quy trình", "process"],
  ["Dự án", "projects"],
  ["Khách hàng", "clients"],
  ["Liên hệ", "contact"],
] as const;

export const stats = [
  { value: "2020", label: "Năm thành lập" },
  { value: "100+", label: "Dự án triển khai" },
  { value: "50+", label: "Doanh nghiệp đồng hành" },
  { value: "10+", label: "Nhóm dịch vụ" },
  { value: "24/7", label: "Hỗ trợ khách hàng" },
];

export const services = [
  {
    slug: "digital-advertising",
    icon: Megaphone,
    title: "Digital Advertising",
    text: "Triển khai quảng cáo đa nền tảng với dữ liệu, thông điệp và tối ưu liên tục.",
    tags: ["Facebook Ads", "Google Ads", "TikTok Ads", "YouTube Ads"],
    detail:
      "DST xây dựng cấu trúc chiến dịch theo mục tiêu kinh doanh: nhận diện, khách hàng tiềm năng, chuyển đổi hoặc doanh thu. Dịch vụ tập trung vào đo lường, tối ưu ngân sách và báo cáo minh bạch.",
    fit: "Phù hợp với doanh nghiệp đã có sản phẩm, website/fanpage hoặc kênh bán hàng và cần tăng trưởng bằng quảng cáo có kiểm soát.",
    deliverables: ["Kế hoạch kênh và ngân sách", "Thông điệp quảng cáo", "Thiết lập tracking cơ bản", "Báo cáo hiệu quả định kỳ"],
    proofNote:
      "Không dùng ảnh minh họa cho hạng mục này vì hiệu quả quảng cáo nên được chứng minh bằng dữ liệu chiến dịch, dashboard và báo cáo thực tế.",
  },
  {
    slug: "tiktok-shop",
    icon: ShoppingBag,
    title: "TikTok Shop Partner",
    text: "Thiết lập, quản lý và tăng trưởng gian hàng TikTok Shop từ nội dung đến vận hành.",
    tags: ["Setup gian hàng", "Livestream", "KOC/KOL", "Tối ưu sản phẩm"],
    detail:
      "Đội ngũ DST hỗ trợ thiết lập gian hàng, tối ưu sản phẩm, xây dựng lịch nội dung, kịch bản livestream và kết nối KOC/KOL phù hợp ngành hàng.",
    fit: "Phù hợp với thương hiệu bán lẻ, mỹ phẩm, F&B, sản phẩm tiêu dùng hoặc doanh nghiệp muốn thử nghiệm social commerce.",
    deliverables: ["Checklist setup gian hàng", "Kịch bản livestream", "Lịch nội dung TikTok", "Đề xuất KOC/KOL và tối ưu sản phẩm"],
    proofImage: "assets/03-studio-content-creator.jpg",
    proofAlt: "Không gian sản xuất nội dung và livestream cho TikTok Shop",
    proofCaption: "Ảnh phù hợp vì thể hiện hoạt động sản xuất nội dung/livestream, không phải ảnh minh họa ngẫu nhiên.",
  },
  {
    slug: "design-website",
    icon: Code2,
    title: "Design & Website",
    text: "Thiết kế website, landing page và hệ thống nhận diện có tính ứng dụng cao.",
    tags: ["Website", "Landing page", "Logo", "Profile"],
    detail:
      "Dịch vụ tập trung vào trải nghiệm người dùng, cấu trúc nội dung, giao diện thương hiệu và khả năng chuyển đổi. Website/landing page được thiết kế theo mục tiêu bán hàng hoặc tuyển khách hàng tiềm năng.",
    fit: "Phù hợp với doanh nghiệp cần website giới thiệu, landing page chiến dịch, profile công ty hoặc hệ thống nhận diện đồng bộ.",
    deliverables: ["Sitemap và wireframe", "Thiết kế giao diện", "Nội dung theo cấu trúc chuyển đổi", "Bàn giao source/asset theo phạm vi dự án"],
    proofNote:
      "Bộ ảnh hiện tại không có ảnh màn hình website hoặc thiết kế giao diện cụ thể, nên phần này ưu tiên mô tả quy trình thay vì dùng ảnh sai ngữ cảnh.",
  },
  {
    slug: "content-marketing",
    icon: FileText,
    title: "Content Marketing",
    text: "Xây dựng kế hoạch nội dung, kịch bản video, bài PR và content quảng cáo.",
    tags: ["Social content", "Video script", "PR", "Content plan"],
    detail:
      "DST phát triển nội dung dựa trên định vị thương hiệu, chân dung khách hàng và mục tiêu từng kênh. Nội dung không chỉ để đăng đều mà phải phục vụ nhận diện, niềm tin và chuyển đổi.",
    fit: "Phù hợp với doanh nghiệp cần vận hành fanpage/kênh xã hội ổn định hoặc chuẩn hóa giọng nói thương hiệu.",
    deliverables: ["Content pillar", "Lịch nội dung", "Kịch bản video ngắn", "Bài PR hoặc bài quảng cáo theo chiến dịch"],
    proofImage: "assets/05-studio-behind-scenes.jpg",
    proofAlt: "Hậu trường sản xuất nội dung tại studio",
    proofCaption: "Ảnh minh chứng liên quan đến quá trình chuẩn bị và sản xuất nội dung.",
  },
  {
    slug: "studio-media",
    icon: Camera,
    title: "Studio & Media",
    text: "Sản xuất hình ảnh, video, TVC, livestream và tư liệu truyền thông chuyên nghiệp.",
    tags: ["TVC", "Livestream", "Chụp sản phẩm", "Sự kiện"],
    detail:
      "Dịch vụ bao gồm chụp ảnh sản phẩm, quay video doanh nghiệp, TVC, livestream và ghi hình sự kiện. DST chuẩn bị kịch bản, bối cảnh, thiết bị và hậu kỳ theo mục tiêu truyền thông.",
    fit: "Phù hợp với doanh nghiệp cần tư liệu hình ảnh/video chuyên nghiệp để dùng cho quảng cáo, website, social và sales kit.",
    deliverables: ["Kịch bản quay/chụp", "Shot list", "File ảnh/video đã hậu kỳ", "Phiên bản tối ưu cho nhiều nền tảng"],
    proofImage: "assets/06-media-commercial-production.jpg",
    proofAlt: "Bối cảnh sản xuất video thương mại",
    proofCaption: "Ảnh thể hiện đúng hoạt động sản xuất media, phù hợp với nội dung dịch vụ.",
  },
  {
    slug: "branding",
    icon: Palette,
    title: "Branding",
    text: "Định hình chiến lược, nhận diện và truyền thông thương hiệu dài hạn.",
    tags: ["Brand strategy", "Identity", "Personal brand", "Communication"],
    detail:
      "DST hỗ trợ làm rõ định vị, tính cách thương hiệu, thông điệp cốt lõi và hệ thống nhận diện. Mục tiêu là giúp thương hiệu nhất quán hơn trên mọi điểm chạm.",
    fit: "Phù hợp với doanh nghiệp mới ra mắt, tái định vị, mở rộng thị trường hoặc cần chuẩn hóa hình ảnh.",
    deliverables: ["Định vị thương hiệu", "Thông điệp và tagline", "Moodboard nhận diện", "Hướng dẫn ứng dụng cơ bản"],
    proofImage: "assets/09-branding-workshop.jpg",
    proofAlt: "Workshop xây dựng thương hiệu",
    proofCaption: "Ảnh phù hợp vì thể hiện hoạt động làm việc chiến lược và định hướng thương hiệu.",
  },
  {
    slug: "booking-pr",
    icon: RadioTower,
    title: "Booking & PR",
    text: "Kết nối truyền thông, KOL/KOC, fanpage, báo chí và màn hình LED.",
    tags: ["Fanpage", "Báo chí", "KOL/KOC", "Review"],
    detail:
      "Dịch vụ giúp doanh nghiệp chọn kênh truyền thông phù hợp, chuẩn hóa thông điệp PR và triển khai booking theo mục tiêu phủ sóng, uy tín hoặc ra mắt chiến dịch.",
    fit: "Phù hợp với thương hiệu chuẩn bị khai trương, ra mắt sản phẩm, sự kiện hoặc cần tăng độ tin cậy truyền thông.",
    deliverables: ["Đề xuất kênh booking", "Thông điệp PR", "Kịch bản truyền thông", "Theo dõi và tổng hợp hiệu quả"],
    proofImage: "assets/07-media-event-production.jpg",
    proofAlt: "Sản xuất truyền thông tại sự kiện",
    proofCaption: "Ảnh liên quan đến truyền thông sự kiện, phù hợp hơn ảnh stock hoặc minh họa chung chung.",
  },
  {
    slug: "setup-restaurant-hotel",
    icon: Hotel,
    title: "Setup Restaurant - Hotel",
    text: "Tư vấn thị trường, thương hiệu, khai trương và marketing vận hành dịch vụ.",
    tags: ["Market research", "Opening plan", "Team setup", "Hospitality"],
    detail:
      "DST hỗ trợ nghiên cứu thị trường, xây dựng thương hiệu, kế hoạch khai trương, nội dung vận hành và marketing cho nhà hàng, khách sạn, spa hoặc mô hình dịch vụ.",
    fit: "Phù hợp với mô hình hospitality chuẩn bị khai trương, cần tái định vị hoặc muốn tăng khách đặt bàn/đặt phòng.",
    deliverables: ["Khảo sát thị trường", "Concept thương hiệu", "Kế hoạch khai trương", "Lịch nội dung và quảng cáo vận hành"],
    proofImage: "assets/10-hotel-lobby-project.jpg",
    proofAlt: "Không gian dự án khách sạn",
    proofCaption: "Ảnh phù hợp vì bối cảnh thuộc nhóm nhà hàng/khách sạn, đúng với dịch vụ setup hospitality.",
  },
  {
    slug: "phong-marketing",
    icon: Building2,
    title: "Xây dựng phòng Marketing",
    text: "Thiết lập nhân sự, quy trình, KPI và năng lực marketing nội bộ cho doanh nghiệp.",
    tags: ["Tuyển dụng", "Quy trình", "Đào tạo", "KPI"],
    detail:
      "DST tư vấn cấu trúc phòng Marketing, vai trò nhân sự, quy trình phối hợp, KPI và cách đo lường để doanh nghiệp có thể tự vận hành lâu dài.",
    fit: "Phù hợp với doanh nghiệp đang tăng trưởng, có nhu cầu xây đội nội bộ nhưng thiếu quy trình và tiêu chuẩn triển khai.",
    deliverables: ["Sơ đồ vai trò nhân sự", "Quy trình làm việc", "Bộ KPI cơ bản", "Kế hoạch đào tạo và chuyển giao"],
    proofNote:
      "Không dùng ảnh minh họa vì hạng mục này nên được chứng minh bằng quy trình, sơ đồ tổ chức và tài liệu chuyển giao.",
  },
];

export const packageGroups = [
  {
    icon: Blocks,
    title: "Fanpage & nền tảng số",
    items: ["Tạo và tối ưu fanpage", "Cập nhật thông tin", "Quản trị nội dung", "Tư vấn vận hành"],
  },
  {
    icon: Sparkles,
    title: "Thiết kế - Content - Video",
    items: ["Thiết kế logo và ấn phẩm", "Viết bài quảng cáo", "Chụp ảnh sản phẩm", "Biên tập video"],
  },
  {
    icon: BarChart3,
    title: "Quảng cáo và tối ưu",
    items: ["Triển khai đa nền tảng", "Tối ưu chi phí", "Báo cáo minh bạch", "Điều chỉnh liên tục"],
  },
  {
    icon: Settings2,
    title: "Dịch vụ chuyên sâu",
    items: ["Website và landing page", "Hồ sơ năng lực", "TVC doanh nghiệp", "App mobile"],
  },
];

export const processSteps = [
  ["01", "Tiếp nhận yêu cầu và đặt lịch hẹn", MessageCircle],
  ["02", "Tư vấn mục tiêu kinh doanh", Target],
  ["03", "Khảo sát thị trường và đối thủ", ScanSearch],
  ["04", "Thống nhất phương án và báo giá", ClipboardList],
  ["05", "Xây dựng kế hoạch triển khai", Compass],
  ["06", "Ký kết hợp đồng", Handshake],
  ["07", "Triển khai, theo dõi và tối ưu", Rocket],
  ["08", "Báo cáo, nghiệm thu và đồng hành", BadgeCheck],
] as const;

export const reasons = [
  "Đội ngũ trẻ, sáng tạo và giàu kinh nghiệm.",
  "Giải pháp thiết kế riêng theo từng doanh nghiệp.",
  "Báo cáo tiến độ rõ ràng và minh bạch.",
  "Đồng hành xuyên suốt trước, trong và sau dự án.",
  "Hệ sinh thái dịch vụ Marketing toàn diện.",
  "Tập trung vào hiệu quả thực tế và tăng trưởng dài hạn.",
];

export const projects = [
  {
    title: "Marketing nhà hàng",
    type: "Hospitality Growth",
    img: "assets/13-restaurant-food-project.jpg",
    goal: "Tăng nhận diện và lượng đặt bàn.",
    result: "+42% lượt tương tác trong 8 tuần",
  },
  {
    title: "Marketing khách sạn",
    type: "Hotel Campaign",
    img: "assets/10-hotel-lobby-project.jpg",
    goal: "Nâng chuẩn hình ảnh thương hiệu lưu trú.",
    result: "Bộ nội dung đặt phòng đồng bộ",
  },
  {
    title: "Thương hiệu nội thất",
    type: "Branding",
    img: "assets/09-branding-workshop.jpg",
    goal: "Tạo hệ thống nhận diện và thông điệp bán hàng.",
    result: "Ra mắt bộ nhận diện mới",
  },
  {
    title: "TikTok Shop",
    type: "Commerce",
    img: "assets/03-studio-content-creator.jpg",
    goal: "Tối ưu gian hàng và nội dung bán hàng.",
    result: "Quy trình livestream ổn định",
  },
  {
    title: "Quay TVC doanh nghiệp",
    type: "Media Production",
    img: "assets/06-media-commercial-production.jpg",
    goal: "Sản xuất phim thương hiệu chuyên nghiệp.",
    result: "Tư liệu dùng đa kênh",
  },
  {
    title: "Truyền thông sự kiện",
    type: "PR & Booking",
    img: "assets/07-media-event-production.jpg",
    goal: "Tăng độ phủ cho chiến dịch ra mắt.",
    result: "Kịch bản truyền thông trọn gói",
  },
];

export const clientLogos = ["HALONG BAY", "AURA SPA", "NOVA HOTEL", "LUX FOOD", "OCEAN GROUP", "KAIROS", "MIRA HOME"];

export const testimonials = [
  {
    name: "Nguyễn Minh Anh",
    role: "Founder, Mira Home",
    img: "assets/12-spa-client-team.jpg",
    quote:
      "DST giúp chúng tôi chuyển từ làm nội dung rời rạc sang một kế hoạch thương hiệu rõ ràng, có số liệu và có nhịp triển khai.",
  },
  {
    name: "Trần Hoàng Nam",
    role: "Marketing Manager, Nova Hotel",
    img: "assets/02-team-celebration.jpg",
    quote:
      "Điểm mạnh nhất là sự chủ động. Đội ngũ theo sát từng giai đoạn, báo cáo minh bạch và tối ưu chiến dịch rất nhanh.",
  },
  {
    name: "Lê Quỳnh Trang",
    role: "COO, Lux Food",
    img: "assets/14-restaurant-client-experience.jpg",
    quote:
      "Hình ảnh, video và quảng cáo đồng bộ hơn hẳn. Thương hiệu của chúng tôi nhìn chuyên nghiệp và dễ thuyết phục khách hàng hơn.",
  },
];

export const quickLinks = [
  "Digital Advertising",
  "TikTok Shop",
  "Design & Website",
  "Content Marketing",
  "Studio & Media",
  "Branding",
];

export const CheckIcon = CheckCircle2;
export const UsersIcon = Users;
export const VideoIcon = Video;
