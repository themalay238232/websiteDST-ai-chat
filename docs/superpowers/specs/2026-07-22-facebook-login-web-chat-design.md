# Thiết kế Facebook Login + chat AI riêng trên website DST

## Mục tiêu

Thay phần Facebook Page Plugin đang bị trắng hoặc yêu cầu đăng nhập bằng một
giao diện chat DST chạy trực tiếp tại:

`https://themalay238232.github.io/websiteDST-ai-chat/`

Khách phải đăng nhập Facebook trước khi sử dụng. Sau khi đăng nhập, khách chat
ngay trên website với bot Gemini và dữ liệu DST hiện có, không bị chuyển sang
Facebook hoặc Messenger.

## Giới hạn cần hiểu đúng

- Facebook Login chỉ xác thực tên và tài khoản khách; nó không biến giao diện
  web riêng thành Messenger.
- Tin nhắn trong giao diện này không xuất hiện trong Inbox của Facebook Page và
  không đồng bộ với lịch sử Messenger.
- Kênh Messenger hiện tại vẫn hoạt động độc lập qua webhook của Meta.
- Chỉ yêu cầu quyền hồ sơ công khai cơ bản; không yêu cầu email, danh sách bạn bè
  hoặc quyền đăng bài.

## Trải nghiệm người dùng

1. Khi mở panel chat, khách thấy giới thiệu ngắn và nút `Đăng nhập bằng Facebook`.
2. Facebook mở hộp thoại đăng nhập/đồng ý theo cơ chế chính thức của Meta.
3. Khi xác thực thành công, panel hiển thị tên, ảnh đại diện, nút đăng xuất và
   khung chat DST.
4. Khách gửi câu hỏi; bot trả lời bằng kiến thức DST, tìm địa điểm và trả ảnh như
   phiên bản Messenger hiện có.
5. Phiên đăng nhập web chỉ tồn tại trong tab/trình duyệt hiện tại. Khi hết hạn,
   panel yêu cầu khách đăng nhập lại nhưng không làm mất dữ liệu phía Facebook.
6. Nếu khách hủy đăng nhập, chặn popup hoặc Facebook không khả dụng, giao diện
   báo lỗi ngắn gọn và cho phép thử lại.

## Kiến trúc và luồng dữ liệu

### 1. Đăng nhập ở frontend

- Website tải Facebook JavaScript SDK sau khi khách mở panel chat.
- Frontend chỉ chứa Meta App ID công khai. App Secret, Page Access Token và
  Gemini API key không được đưa vào bundle.
- Sau khi Facebook Login thành công, frontend gửi access token tạm thời đến
  `POST /api/web-auth` qua HTTPS.
- Frontend không ghi Facebook access token vào `localStorage`, URL hoặc log.

### 2. Xác minh tại Cloudflare Worker

- Worker nhận Facebook access token và xác minh token với Graph API của Meta.
- Worker kiểm tra tối thiểu: token còn hiệu lực, thuộc đúng Meta App ID và có
  Facebook app-scoped user ID hợp lệ.
- Chỉ sau khi xác minh thành công, Worker đọc trường hồ sơ cơ bản cần thiết
  (`id`, `name`, `picture`) và phát hành web session token ngắn hạn do DST ký.
- Web session token dùng chữ ký HMAC, có thời hạn tối đa 60 phút và chỉ chứa dữ
  liệu tối thiểu. Khóa ký và Meta App Secret được lưu bằng Cloudflare secret.

### 3. Chat đã xác thực

- Frontend giữ web session token trong `sessionStorage` và gửi token bằng header
  `Authorization: Bearer ...` tới `POST /api/web-chat`.
- `/api/web-chat` xác minh chữ ký và thời hạn trước khi xử lý câu hỏi.
- Worker tự tạo khóa hội thoại từ Facebook app-scoped user ID; không tin
  `userId`, tên hoặc định danh do frontend tự khai báo.
- Endpoint tiếp tục dùng chung bộ xử lý hiện có: Gemini, kiến thức DST, nhớ hội
  thoại, tìm địa điểm, Google Maps link và tìm ảnh phù hợp.
- Phản hồi giữ cấu trúc hiện tại: nội dung trả lời cùng danh sách URL ảnh hợp lệ.

### 4. Đăng xuất và hết hạn

- Nút đăng xuất xóa web session token, trạng thái hồ sơ và lịch sử hiển thị trong
  tab hiện tại; sau đó đưa giao diện về màn hình đăng nhập.
- Phiên hết hạn trả về `401`; frontend tự xóa phiên và yêu cầu đăng nhập lại.
- Không tự động làm mới token âm thầm bằng App Secret trên trình duyệt.

## Thành phần dự kiến thay đổi

### Repository website

- Thay `FacebookMessengerChat` bằng panel đăng nhập và chat riêng, hoặc đổi tên
  thành thành phần thể hiện đúng chức năng.
- Thêm module nhỏ quản lý Facebook SDK, trạng thái xác thực và gọi API.
- Tái sử dụng phong cách panel DST đang có, bổ sung trạng thái loading, lỗi,
  đăng nhập, đã đăng nhập và đang gửi tin.
- Cập nhật test source/render để xác nhận không còn iframe Page Plugin và không
  có secret trong bundle.

### Repository Cloudflare Worker

- Thêm `POST /api/web-auth` để xác minh Facebook token và phát hành web session.
- Bắt buộc xác thực web session ở `POST /api/web-chat`.
- Giữ nguyên `/webhook` của Messenger để không làm hỏng bot Facebook hiện tại.
- Bổ sung cấu hình công khai `META_APP_ID` và secret `META_APP_SECRET`,
  `WEB_SESSION_SECRET`.
- CORS chỉ cho phép origin website DST đã duyệt và origin phát triển cục bộ.

## Bảo mật và chống lạm dụng

- Không nhận App Secret, Gemini key, Page token hoặc cookie Facebook từ khách.
- Không tin tên, ảnh đại diện hoặc Facebook ID do frontend gửi lên.
- Giới hạn độ dài tin nhắn, loại dữ liệu và kích thước request trước khi gọi AI.
- Áp dụng rate limit theo Facebook app-scoped user ID và trả lỗi thân thiện khi
  vượt giới hạn.
- Không đưa access token vào log; log chỉ dùng mã lỗi và request ID cần thiết.
- URL ảnh trả về phải là HTTPS và được lọc/giới hạn số lượng trước khi render.
- CORS không phải cơ chế xác thực; mọi request chat vẫn phải có session hợp lệ.

## Cấu hình bắt buộc trên Meta

- Dùng Meta App `DST GROUP AI Chat` hiện có sau khi xác nhận đúng App ID.
- Thêm `themalay238232.github.io` vào App Domains và cấu hình Website URL đúng
  trang GitHub Pages.
- Bật Facebook Login cho Web và thêm redirect/origin được Meta yêu cầu.
- Đưa app sang chế độ Live để khách không có vai trò trong app cũng đăng nhập
  được. Khi app còn Development, chỉ quản trị viên, nhà phát triển và tester dùng
  được.
- Hoàn thành các yêu cầu chính sách/kiểm tra dữ liệu mà bảng điều khiển Meta hiển
  thị tại thời điểm phát hành. Giao diện Meta có thể thay đổi nên bước này cần
  kiểm tra trực tiếp trong app.

## Xử lý lỗi

- Hủy đăng nhập/chặn popup: giữ màn hình đăng nhập và hiện nút thử lại.
- Facebook token sai, hết hạn hoặc thuộc app khác: trả `401`, không tạo session.
- Web session bị sửa hoặc hết hạn: trả `401` và buộc đăng nhập lại.
- Worker/Gemini quá tải: hiện một thông báo duy nhất, cho phép gửi lại; không lặp
  câu trả lời và không tự ghép tin nhắn cũ vào câu hỏi mới.
- Dịch vụ ảnh hoặc bản đồ lỗi: bot vẫn trả lời văn bản; không bịa địa chỉ hoặc
  hiển thị placeholder giả như `[Hệ thống đính kèm ảnh]`.

## Kiểm thử và tiêu chí hoàn thành

### Worker

- Test token Facebook hợp lệ, token sai app, token hết hạn và Graph API lỗi.
- Test chữ ký web session hợp lệ, bị sửa, hết hạn và thiếu header.
- Test `/api/web-chat` từ chối người chưa đăng nhập nhưng `/webhook` Messenger
  vẫn hoạt động như cũ.
- Test CORS cho GitHub Pages được phép và origin lạ bị từ chối.
- Test giới hạn độ dài/rate limit và phản hồi văn bản khi ảnh/bản đồ lỗi.

### Website

- Test các trạng thái đăng nhập, hủy, lỗi, chat, gửi ảnh kết quả và đăng xuất.
- TypeScript, lint, unit test và build GitHub Pages thành công.
- Quét bundle để chắc chắn không có App Secret, Page token, Gemini key hoặc khóa
  ký session.
- Kiểm tra trực tiếp trên desktop và mobile: panel không che nội dung, bàn phím
  dùng được, tin nhắn không bị cắt và không lặp.

### Kiểm tra tích hợp

- Đăng nhập bằng một tài khoản có vai trò app khi Development và chat thành công.
- Sau khi app Live, đăng nhập bằng một tài khoản Facebook bình thường không có
  vai trò app và chat thành công.
- Xác nhận câu hỏi cùng phiên giữ được ngữ cảnh; đăng xuất hoặc token hết hạn
  không cho tiếp tục gọi API.

## Triển khai

- Website được triển khai lên GitHub Pages của `themalay238232`.
- Worker được triển khai sau khi các secret cần thiết đã được đặt trên
  Cloudflare; giá trị secret không được in ra terminal hoặc commit vào Git.
- Triển khai Worker trước, kiểm tra auth/chat, sau đó triển khai website để tránh
  giao diện mới gọi vào endpoint chưa sẵn sàng.
- Nếu Meta App chưa Live hoặc chưa cấu hình domain, bản triển khai chỉ hoạt động
  cho tài khoản có vai trò app; đây là giới hạn cấu hình bên Meta, không phải lỗi
  của giao diện chat.
