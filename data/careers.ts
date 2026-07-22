import type { CareerPosition } from "./types";

// TODO: Xác nhận vị trí đang tuyển, mức đãi ngộ, hình thức làm việc và cách nhận hồ sơ trước khi công bố chính thức.
export const careerPositions: CareerPosition[] = [
  {
    slug: "chuyen-vien-noi-dung",
    title: "Chuyên viên Nội dung",
    department: "Nội dung & Truyền thông",
    workMode: "TODO: Cập nhật hình thức làm việc",
    summary: "Vị trí mẫu cho nhóm xây dựng kế hoạch, bài viết và kịch bản nội dung.",
    responsibilities: ["Phát triển nội dung theo kế hoạch đã thống nhất", "Phối hợp với thiết kế, media và khách hàng", "Theo dõi phản hồi để đề xuất điều chỉnh"],
    requirements: ["Khả năng viết rõ ràng, có cấu trúc", "Chủ động phối hợp công việc", "TODO: Cập nhật yêu cầu chính thức"],
    note: "Thông tin tuyển dụng mẫu - cần DST Group xác nhận trước khi nhận hồ sơ.",
  },
  {
    slug: "chuyen-vien-thiet-ke",
    title: "Chuyên viên Thiết kế",
    department: "Thiết kế & Nhận diện",
    workMode: "TODO: Cập nhật hình thức làm việc",
    summary: "Vị trí mẫu cho nhóm triển khai nhận diện và ấn phẩm truyền thông.",
    responsibilities: ["Thiết kế ấn phẩm theo hệ thống nhận diện", "Phối hợp trong quá trình phát triển concept", "Chuẩn bị file bàn giao theo quy chuẩn dự án"],
    requirements: ["Nắm vững nguyên tắc bố cục và typography", "Có tinh thần làm việc theo brief", "TODO: Cập nhật yêu cầu chính thức"],
    note: "Thông tin tuyển dụng mẫu - cần DST Group xác nhận trước khi nhận hồ sơ.",
  },
  {
    slug: "dieu-phoi-du-an",
    title: "Điều phối Dự án",
    department: "Vận hành & Khách hàng",
    workMode: "TODO: Cập nhật hình thức làm việc",
    summary: "Vị trí mẫu hỗ trợ điều phối timeline, đầu việc và trao đổi giữa các bên.",
    responsibilities: ["Theo dõi mốc triển khai", "Tổng hợp phản hồi và đầu việc", "Hỗ trợ chuẩn bị báo cáo theo phạm vi dự án"],
    requirements: ["Cẩn thận trong theo dõi công việc", "Giao tiếp rõ ràng", "TODO: Cập nhật yêu cầu chính thức"],
    note: "Thông tin tuyển dụng mẫu - cần DST Group xác nhận trước khi nhận hồ sơ.",
  },
];
