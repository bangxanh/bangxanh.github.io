# Trợ lý AI của Bảng Xanh – đang chạy

- Máy chủ: Cloudflare Worker **bangxanh-ai** (tài khoản Cloudflare của thầy Hoàng), địa chỉ https://bangxanh-ai.hoang59876.workers.dev
- Mô hình mặc định: Cloudflare Workers AI `@cf/google/gemma-4-26b-a4b-it` – **miễn phí** trong hạn mức hằng ngày của gói Workers Free (không cần khóa API).
- Worker tự cập nhật mỗi khi thư mục `worker/` trong kho GitHub thay đổi (Workers Builds, thư mục gốc `/worker`).
- Muốn chất lượng cao hơn: tạo khóa Claude tại console.anthropic.com, rồi tự dán vào Cloudflare → Workers & Pages → bangxanh-ai → Settings → Variables and Secrets → Add → loại **Secret**, tên `ANTHROPIC_API_KEY`. Worker sẽ tự chuyển sang Claude. (Không gửi khóa cho ai, kể cả trợ lý.)
- Hết lượt miễn phí trong ngày, học sinh sẽ thấy thông báo "quay lại vào ngày mai"; có thể nâng lên gói Workers Paid nếu cần nhiều lượt hơn.
- Tắt AI: xóa địa chỉ ở `site/config.js` (endpoint: '').

---

# Bật Trợ lý AI cho Bảng Xanh

Trang đã có sẵn nút **Trợ lý AI**, nút **Gợi ý từ trợ lý AI** ở từng câu luyện tập và nút **Nhờ trợ lý AI chấm & chữa** ở bài tự luận. Khi chưa bật, các nút này hiện "sắp ra mắt". Để bật, cần một máy chủ trung gian nhỏ (miễn phí) giữ kín khóa API Claude.

```
Học sinh ──► bangxanh.github.io ──► Cloudflare Worker (miễn phí) ──► Claude Haiku 5.5 (Anthropic)
```

## Chi phí

- Cloudflare Workers: miễn phí tới 100 000 lượt/ngày.
- Claude Haiku 5.5: khoảng 0,10 USD cho 1 triệu token gửi đi và 0,50 USD cho 1 triệu token trả lời. Một lớp 50 em, mỗi em hỏi 10 câu/ngày ước khoảng 7 USD/tháng.
- Nên **nạp trước** một khoản nhỏ (ví dụ 5 USD) và **đặt mức chi tối đa mỗi tháng** trong trang quản lý Anthropic để không bao giờ bị tính quá.

## Các bước (khoảng 10 phút)

1. **Tạo khóa API Claude**
   - Vào https://console.anthropic.com, đăng ký tài khoản, nạp tiền (Billing) và đặt giới hạn chi tiêu (Limits).
   - Vào **API Keys → Create Key**, đặt tên `bangxanh`, sao chép khóa (chỉ hiện một lần). **Không gửi khóa này cho ai, kể cả qua chat.**
2. **Tạo Worker trên Cloudflare**
   - Vào https://dash.cloudflare.com, đăng ký miễn phí.
   - Chọn **Workers & Pages → Create → Create Worker**, đặt tên `bangxanh-ai`, bấm **Deploy**.
   - Bấm **Edit code**, xóa mã mẫu, dán toàn bộ nội dung tệp `worker/ai-proxy.js`, bấm **Deploy**.
3. **Dán khóa API vào Worker**
   - Trong Worker vừa tạo: **Settings → Variables and Secrets → Add**.
   - Loại **Secret**, tên `ANTHROPIC_API_KEY`, giá trị là khóa ở bước 1. Lưu lại.
   - (Tùy chọn) thêm biến `RATE_PER_HOUR` (số câu mỗi máy mỗi giờ, mặc định 30).
4. **Nối trang với Worker**
   - Sao chép địa chỉ Worker, dạng `https://bangxanh-ai.<tên-tài-khoản>.workers.dev`.
   - Sửa tệp `site/config.js`, điền vào `ai: { endpoint: 'https://bangxanh-ai.….workers.dev' }`, rồi lưu (Commit). Trang tự xuất bản lại sau khoảng 1 phút.

## An toàn cho học sinh (theo hướng dẫn của Anthropic cho sản phẩm dành cho người dưới 18 tuổi)

- Trang ghi rõ đây là **trí tuệ nhân tạo**, có thể trả lời sai.
- Lời dặn hệ thống trong `ai-proxy.js` giới hạn AI chỉ hỗ trợ học tập, dùng ngôn ngữ phù hợp lứa tuổi, không hỏi thông tin cá nhân, và hướng em tới người lớn tin cậy hoặc Tổng đài 111 khi cần.
- Không lưu nội dung trò chuyện; mỗi máy bị giới hạn số câu hỏi mỗi giờ.
- Worker chỉ nhận yêu cầu từ `https://bangxanh.github.io` (đổi bằng biến `ALLOWED_ORIGINS` nếu dùng tên miền khác).
- Thầy cô nên định kỳ xem mục **Usage** trong trang Anthropic để theo dõi mức dùng.
