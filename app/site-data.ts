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
    highlights: [
      "Phân tích dữ liệu và ứng dụng AI để xác định đúng tệp khách hàng, thời điểm và thông điệp quảng cáo.",
      "Xây dựng chiến lược theo từng mục tiêu: tăng nhận diện, thu khách hàng tiềm năng, chuyển đổi hoặc doanh thu.",
      "Phát triển content, hình ảnh và video quảng cáo nhằm cải thiện tỷ lệ nhấp và tỷ lệ chuyển đổi.",
      "Theo dõi, đo lường và tối ưu liên tục để kiểm soát chi phí và nâng hiệu quả ngân sách.",
    ],
    proofImage: "assets/service-digital-advertising.png",
    proofAlt: "Hệ thống dữ liệu và tối ưu hiệu quả quảng cáo số",
    proofCaption: "Hệ thống theo dõi dữ liệu, phân tích hiệu quả và tối ưu chiến dịch đa kênh.",
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
    highlights: [
      "Tư vấn setup gian hàng, đăng sản phẩm chuẩn SEO và hỗ trợ xử lý các vấn đề liên quan đến chính sách vận hành.",
      "Nghiên cứu thị trường, sản phẩm, đối thủ và phân khúc giá trước khi xây dựng kế hoạch tăng trưởng.",
      "Kết nối, cập nhật báo giá và quản lý hiệu quả chiến dịch với mạng lưới KOC/KOL phù hợp.",
      "Xây dựng concept livestream, setup phòng live, hỗ trợ kỹ thuật và tối ưu quảng cáo trong phiên bán hàng.",
      "Cập nhật tính năng, chiến dịch theo tháng, voucher và thông tin chính thức từ nền tảng TikTok.",
      "Định hướng kênh TikTok cá nhân hoặc doanh nghiệp, lịch đăng và nội dung phục vụ bán hàng/Affiliate.",
    ],
    proofImage: "assets/03-studio-content-creator.jpg",
    proofAlt: "Không gian sản xuất nội dung và livestream cho TikTok Shop",
    proofCaption: "Không gian sản xuất nội dung và livestream dành cho hoạt động bán hàng trên TikTok Shop.",
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
    highlights: [
      "Thiết kế giao diện hiện đại, bám nhận diện thương hiệu và tối ưu trải nghiệm UX/UI.",
      "Xây dựng nền tảng chuẩn SEO, thân thiện với Google, AI Search và tối ưu tốc độ tải trên mọi thiết bị.",
      "Thiết kế Landing Page tập trung chuyển đổi với CTA, biểu mẫu và nội dung theo hành trình khách hàng.",
      "Tích hợp công cụ Marketing, chatbot AI, CRM, tên miền, hosting và định vị bản đồ theo nhu cầu.",
      "Ứng dụng AI hỗ trợ phát triển nội dung, tối ưu hình ảnh và rút ngắn thời gian triển khai.",
    ],
    proofImage: "assets/service-design-website.png",
    proofAlt: "Không gian thiết kế giao diện website đa thiết bị",
    proofCaption: "Quy trình phát triển giao diện từ wireframe, hệ thống thiết kế đến phiên bản đa thiết bị.",
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
    highlights: [
      "Xây dựng chiến lược Marketing và kế hoạch nội dung Fanpage theo tuần hoặc theo tháng.",
      "Nghiên cứu insight khách hàng, phát triển Fanpage chuẩn SEO và duy trì giọng nói thương hiệu nhất quán.",
      "Sáng tạo content bắt xu hướng, kết hợp AI để tăng tốc sản xuất nhưng vẫn bảo đảm chất lượng biên tập.",
      "Thiết kế hình ảnh, hỗ trợ seeding và xây dựng uy tín thương hiệu trên các nền tảng xã hội.",
    ],
    proofImage: "assets/05-studio-behind-scenes.jpg",
    proofAlt: "Hậu trường sản xuất nội dung tại studio",
    proofCaption: "Quá trình chuẩn bị và sản xuất nội dung tại studio DST.",
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
    highlights: [
      "Sản xuất TVC quảng cáo, Video Branding, Video Review, Reels/TikTok và tư liệu sự kiện.",
      "Xây dựng kịch bản dựa trên insight khách hàng và mục tiêu bán hàng hoặc nhận diện thương hiệu.",
      "Ứng dụng AI, 3D, VFX và Motion Graphics để tạo hiệu ứng hiện đại, khác biệt.",
      "Quay phim, dựng hậu kỳ và bàn giao phiên bản tối ưu cho Facebook, TikTok, YouTube và website.",
    ],
    proofImage: "assets/06-media-commercial-production.jpg",
    proofAlt: "Bối cảnh sản xuất video thương mại",
    proofCaption: "Bối cảnh sản xuất video thương mại và tư liệu truyền thông chuyên nghiệp.",
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
    highlights: [
      "Thiết kế Logo, bộ nhận diện, Catalogue, Profile, Brochure và các ấn phẩm Marketing đồng bộ.",
      "Biên tập nội dung hồ sơ năng lực theo cấu trúc logic, thuyết phục và phù hợp mục tiêu hợp tác/đấu thầu.",
      "Tổ chức chụp ảnh doanh nghiệp, tối ưu hình ảnh và bố cục bằng công nghệ AI theo nhu cầu.",
      "Bàn giao file gốc, PDF, JPG, font và tài nguyên thiết kế theo phạm vi thống nhất.",
    ],
    proofImage: "assets/09-branding-workshop.jpg",
    proofAlt: "Workshop xây dựng thương hiệu",
    proofCaption: "Workshop định vị và xây dựng định hướng thương hiệu cùng doanh nghiệp.",
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
    highlights: [
      "Kết nối KOC/KOL, Creator, fanpage, báo chí và các kênh truyền thông phù hợp từng chiến dịch.",
      "Cập nhật báo giá, quản lý lịch đăng và theo dõi hiệu quả hợp tác KOC/KOL.",
      "Phát triển chiến lược kênh, tối ưu nội dung và lịch đăng cho Creator hoặc thương hiệu cá nhân.",
      "Hỗ trợ xử lý vấn đề bản quyền, nội dung và các tình huống phát sinh trong phạm vi chiến dịch.",
    ],
    proofImage: "assets/07-media-event-production.jpg",
    proofAlt: "Sản xuất truyền thông tại sự kiện",
    proofCaption: "Hoạt động sản xuất và truyền thông trực tiếp tại sự kiện.",
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
    highlights: [
      "Xây dựng chiến lược Marketing theo tuần/tháng cho nhà hàng, khách sạn, spa và mô hình Nightlife.",
      "Quản trị Fanpage, phát triển thương hiệu và sáng tạo content bắt xu hướng theo từng mô hình dịch vụ.",
      "Thiết kế poster, menu, banner, visual và concept truyền thông phục vụ khai trương hoặc vận hành.",
      "Sản xuất video review, TVC, Reels; chụp ảnh không gian/sản phẩm và triển khai Ads đúng tệp khách hàng.",
      "Tư vấn giải pháp tăng đặt bàn, đặt phòng, độ phủ thương hiệu và doanh thu theo đặc thù địa phương.",
    ],
    proofImage: "assets/10-hotel-lobby-project.jpg",
    proofAlt: "Không gian dự án khách sạn",
    proofCaption: "Không gian dự án khách sạn trong nhóm dịch vụ setup hospitality.",
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
    highlights: [
      "Xây dựng chiến lược Marketing tổng thể theo từng giai đoạn phát triển và mục tiêu kinh doanh.",
      "Thiết kế cơ cấu nhân sự, mô tả vai trò, quy trình phối hợp và hệ thống KPI cho đội Marketing nội bộ.",
      "Đào tạo Marketing và ứng dụng AI cho doanh nghiệp, giúp đội ngũ tăng tốc sản xuất và phân tích dữ liệu.",
      "Tư vấn xây dựng AI Agent để hỗ trợ tự động hóa các quy trình Marketing phù hợp.",
      "Đồng hành triển khai, đánh giá hiệu quả và chuyển giao để doanh nghiệp có thể tự vận hành lâu dài.",
    ],
    proofImage: "assets/service-marketing-team.png",
    proofAlt: "Đội ngũ Marketing phối hợp xây dựng quy trình và kế hoạch",
    proofCaption: "Đội ngũ phối hợp trên cùng hệ thống vai trò, quy trình, KPI và kế hoạch triển khai.",
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
  { icon: Sparkles, text: "Đội ngũ trẻ, sáng tạo và giàu kinh nghiệm." },
  { icon: Target, text: "Giải pháp thiết kế riêng theo từng doanh nghiệp." },
  { icon: BarChart3, text: "Báo cáo tiến độ rõ ràng và minh bạch." },
  { icon: Handshake, text: "Đồng hành xuyên suốt trước, trong và sau dự án." },
  { icon: Blocks, text: "Hệ sinh thái dịch vụ Marketing toàn diện." },
  { icon: Rocket, text: "Tập trung vào hiệu quả thực tế và tăng trưởng dài hạn." },
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
