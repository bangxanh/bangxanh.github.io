# Soạn bài học cho Bảng Xanh

Mỗi tệp `<lớp>-<môn>.txt` trong thư mục này là toàn bộ bài học của một lớp – môn (môn: `toan`, `van`, `anh`, `khtn`, `khxh`).
Sửa tệp trên GitHub (biểu tượng cây bút) rồi bấm **Commit changes**: GitHub tự dựng lại dữ liệu và xuất bản trang sau khoảng 1 phút.
Nếu viết sai định dạng, lượt xuất bản sẽ báo lỗi ở thẻ **Actions** kèm số dòng cần sửa; trang cũ vẫn chạy bình thường.

## Cấu trúc

```
# 12 | toan | Toán 12                       ← sách (tên phải trùng tên sách trên trang, ví dụ "Vật lí 10")
## Chương I. Ứng dụng đạo hàm …             ← chương / chủ đề / Units 1–5
### Bài 1. Tính đơn điệu và cực trị …       ← một bài (Bài, Unit, Chủ đề …). Chỉ có dòng này = bài "đang bổ sung"
> Một câu giới thiệu bài.
MT: Mục tiêu (mỗi dòng một ý)
LT: 1. Tên mục lý thuyết
- Ý lý thuyết (mỗi dòng một ý, **in đậm** bằng hai dấu sao)
VD: Đề ví dụ
B: Bước giải 1
B: Bước giải 2
KQ: Kết luận
GN: Ghi nhớ / lỗi thường gặp
Q: mc | Câu trắc nghiệm nhiều lựa chọn
A) Phương án
B) Phương án đúng *                         ← dấu * ở cuối = đáp án đúng
C) …
D) …
E: Lời giải (chữa bài)
Q: tf | Câu Đúng/Sai (đúng 4 ý)
a) Ý thứ nhất | Đ
b) Ý thứ hai | S
c) … | Đ
d) … | S
E: Lời giải
Q: sa | Câu trả lời ngắn
ANS: 2,5 || 5/2                              ← các đáp án được chấp nhận, ngăn bằng ||
E: Lời giải
HINH: 12-toan/bai1-cuc-tri.svg | Chú thích   ← hình minh họa (tệp trong noi-dung/hinh/). Đặt sau mục LT → hình của mục đó;
                                              sau dòng VD → hình của ví dụ; sau dòng Q → hình của câu hỏi.
TL: Đề bài tự luận
MAU: Dòng đáp án mẫu (mỗi bước một dòng)
TC: Tiêu chí chấm | 1                        ← số điểm của tiêu chí
```

## Hình minh họa

- Tệp hình đặt trong `noi-dung/hinh/<lớp>-<môn>/`, ưu tiên SVG (nhẹ, nét). Hình phải **tự vẽ** – không chép ảnh có bản quyền.
- Bộ công cụ vẽ thống nhất màu sắc, phông chữ: `scripts/hinh/bx_hinh.py` (Python + matplotlib); ví dụ cách dùng ở `scripts/hinh/toan12.py` (đồ thị, hình không gian) và `scripts/hinh/khtn_anh.py` (sơ đồ tế bào, thí nghiệm, sơ đồ tư duy từ vựng, trục thời gian ngữ pháp).
- Mỗi bài nên có ít nhất 1 hình giúp học sinh hình dung: đồ thị, sơ đồ, hình vẽ thí nghiệm, sơ đồ tư duy từ vựng…
- Chú thích ngắn, nói hình cho thấy điều gì.

## Quy ước

- Viết ký hiệu bằng ký tự Unicode: x², x³, √, π, ≤, ≥, ≠, ∈, ⇒, ⇔, ∫, →, α, Δ. Chỉ số trên/dưới phức tạp: `e^{2x}`, `x_{n+1}`, `∫_{0}^{1}`.
- Muốn xuống dòng trong một ý, chèn ` // `.
- Dòng bắt đầu bằng `//` là ghi chú, không hiện trên trang.
- Mỗi bài nên có: 2–3 mục tiêu, 2–3 mục lý thuyết, 1–2 ví dụ giải mẫu có từng bước, 2–3 ghi nhớ, 4–5 câu luyện tập (đủ 3 dạng mc, tf, sa) có lời giải, 1 bài tự luận có đáp án mẫu và tiêu chí.
- Nội dung bám sát SGK Kết nối tri thức với cuộc sống; kiểm tra kỹ đáp án trước khi đưa lên.
- Thử trên máy (nếu có Node.js): `node scripts/build-lessons.js` – lệnh báo lỗi định dạng nếu có.
