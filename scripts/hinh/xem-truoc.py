"""Xem trước hình (PNG) trước khi xuất SVG.
Cách dùng (chạy ở thư mục gốc repo):
  python3 scripts/hinh/xem-truoc.py <module> <ham1,ham2,...> <tệp-ảnh-ghép.png>
Vẽ các hàm, lưu SVG như bình thường và ghép ảnh PNG xem trước vào <tệp-ảnh-ghép.png> (đọc bằng công cụ Read)."""
import sys, os, importlib, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bx_hinh
mod = importlib.import_module(sys.argv[1])
out = sys.argv[3]
tmp = tempfile.mkdtemp()
orig = bx_hinh.luu
pngs = []
def luu2(fig, ten):
    f = os.path.join(tmp, ten.replace('/', '_').replace('.svg', '.png'))
    fig.savefig(f, format='png', bbox_inches='tight', pad_inches=0.1, dpi=62)
    pngs.append(f)
    return orig(fig, ten)
mod.luu = luu2
for n in sys.argv[2].split(','):
    getattr(mod, n)()
from PIL import Image
ims = [Image.open(f).convert('RGB') for f in pngs]
W = max(i.width for i in ims); H = sum(i.height for i in ims)
S = Image.new('RGB', (W, H), 'white'); y = 0
for i in ims:
    S.paste(i, (0, y)); y += i.height
S.save(out); print('xem:', out, S.size)
