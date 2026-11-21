# Bảng Xanh – bản công khai (GitHub Pages, miễn phí)

Bản này đưa trang học tập lên Internet **miễn phí, chạy 24/7, ai cũng vào học được không cần tài khoản**, Google tìm thấy được, và **tự cập nhật tin giáo dục mỗi 3 giờ**.

## Cách đưa lên mạng (khoảng 10 phút, làm một lần)

1. Tạo tài khoản tại **github.com** (miễn phí) nếu chưa có.
2. Bấm **New repository** → đặt tên, ví dụ `bang-xanh` → chọn **Public** → **Create repository**.
3. Trong trang kho vừa tạo, bấm **uploading an existing file**, kéo **toàn bộ nội dung** thư mục này (gồm cả thư mục ẩn `.github`) vào rồi bấm **Commit changes**.
   - Nếu trình duyệt không kéo được thư mục `.github`: bấm **Add file → Create new file**, gõ tên `.github/workflows/xuat-ban.yml`, dán nội dung tệp cùng tên trong thư mục này, rồi **Commit**.
4. Vào **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
5. Vào thẻ **Actions** → chọn **Xuat ban va cap nhat** → **Run workflow**. Sau 1–2 phút, trang có địa chỉ dạng `https://ten-tai-khoan.github.io/bang-xanh/`.

Từ đó GitHub tự chạy lại mỗi 3 giờ để lấy tin giáo dục mới và xuất bản lại trang.

## Cho Google tìm thấy nhanh hơn

Vào **search.google.com/search-console** → thêm địa chỉ trang → xác minh → mục **Sơ đồ trang web (Sitemaps)** gửi `sitemap.xml`. Trang đã có sẵn 60 trang học liệu theo lớp – môn để Google lập chỉ mục.

## Thêm nội dung

Mở tệp `site/data/site-data.json` trên GitHub (biểu tượng cây bút để sửa):
- `news`: thông báo trên trang chủ
- `docs`: tài liệu (đường liên kết hoặc văn bản)
- `lessons`: bài giảng theo lớp – môn
- `exams`: đề luyện thi (danh sách mã câu hỏi `qids`)
- `questions`: câu hỏi bổ sung

Sau khi lưu (Commit), trang tự xuất bản lại; học sinh đang mở trang sẽ thấy thông báo "Trang vừa có tài liệu mới" trong vòng 5 phút.

## Lưu ý

- GitHub tạm dừng lịch chạy tự động nếu kho không có hoạt động trong 60 ngày. Quy trình này tự lưu tin mới vào kho mỗi lần chạy nên lịch luôn được giữ hoạt động; nếu thấy tin không còn cập nhật, vào thẻ **Actions** bấm **Enable workflow**.
- Bản công khai không có tài khoản: tiến độ và điểm của học sinh lưu trên thiết bị các em dùng. Muốn có tài khoản, đề thi chấm trên máy chủ, bảng xếp hạng và trang quản trị, dùng **bản máy chủ** (xem HUONG-DAN.md).
