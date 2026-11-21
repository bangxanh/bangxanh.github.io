#!/usr/bin/env python3
"""Chèn nội dung bài vào danh mục.
Cách dùng: python3 scripts/chen-bai.py <lớp-môn, vd 6-toan> <thư-mục-nháp> <số bài> [<số bài> ...]
Tệp có nhiều sách trùng số bài (vd 10-khtn: Vật lí 10, Hóa học 10, Sinh học 10): thêm --sach="Hóa học 10"
(chỉ tìm trong phần sách đó; tệp nháp vẫn đặt tên <số>.txt).
Mỗi bài là tệp <thư-mục-nháp>/<số>.txt (không có dòng ###); được chèn ngay sau dòng "### Bài <số>." hoặc "### Unit <số>."
của tệp noi-dung/bai/<lớp-môn>.txt. Báo lỗi nếu bài đó đã có nội dung."""
import sys, re, os
args = [a for a in sys.argv[1:] if not a.startswith('--sach=')]
sach = next((a[7:] for a in sys.argv[1:] if a.startswith('--sach=')), None)
stem, src = args[0], args[1]
p = os.path.join(os.path.dirname(__file__), '..', 'noi-dung', 'bai', stem + '.txt')
lines = open(p, encoding='utf-8').read().split('\n')
done = []
def in_book(i):
    if not sach:
        return True
    for j in range(i, -1, -1):
        if lines[j].startswith('# '):
            return lines[j].split('|')[-1].strip() == sach.strip()
    return False
for n in args[2:]:
    body = open(os.path.join(src, n + '.txt'), encoding='utf-8').read().strip('\n').split('\n')
    idx = [i for i, l in enumerate(lines) if re.match(r'^### (Bài|Unit|Chủ đề|Tiết) %s[.:]' % re.escape(n), l) and in_book(i)]
    if len(idx) != 1:
        sys.exit('Không tìm thấy duy nhất dòng "### Bài %s." trong %s (tìm thấy %d)' % (n, stem, len(idx)))
    i = idx[0]
    if not (i + 1 >= len(lines) or lines[i + 1].startswith('#') or lines[i + 1].strip() == ''):
        sys.exit('Bài %s của %s đã có nội dung – không chèn đè.' % (n, stem))
    lines[i + 1:i + 1] = body + ['']
    done.append(n)
tmp = p + '.tmp'
open(tmp, 'w', encoding='utf-8').write('\n'.join(lines))
os.replace(tmp, p)
print('Đã chèn', stem, done)
