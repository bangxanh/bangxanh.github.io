"""Hình minh họa Toán 8 – KNTT (tự vẽ). Chạy: python3 scripts/hinh/toan8.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bx_hinh import *

D = '8-toan/'
ALL = []
NEN = dict(lam='#e3eefc', cam='#fdf0dc', la='#e8f4dc', do='#fde9ec', tim='#efe7fb', ngoc='#dff3f5', xam='#eef1ef', vang='#fdf3d6')


# ---------- Bài 1. Đơn thức ----------
def bai1_don_thuc():
    fig, ax = khung(9.6, 3.9); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 7.8)
    # Trái: cấu tạo đơn thức −3x²y³
    ax.text(4.6, 7.25, 'Cấu tạo của đơn thức', ha='center', fontsize=12, color=MAU['xanh'], weight='bold')
    hop(ax, 1.0, 3.6, 2.4, 1.8, '−3', mau=NEN['cam'], vien=MAU['cam'], co=24)
    hop(ax, 3.7, 3.6, 4.6, 1.8, 'x² y³', mau=NEN['lam'], vien=MAU['lam'], co=24)
    ax.text(2.2, 2.9, 'hệ số', ha='center', fontsize=12, color=MAU['cam'])
    ax.text(6.0, 2.9, 'phần biến', ha='center', fontsize=12, color=MAU['lam'])
    ax.text(4.6, 1.5, 'Bậc = tổng số mũ các biến', ha='center', fontsize=11.5, color=MAU['den'])
    ax.text(4.6, 0.55, '= 2 + 3 = 5', ha='center', fontsize=13, color=MAU['do'], weight='bold')
    ax.annotate('số mũ của x: 2', xy=(5.15, 5.15), xytext=(2.6, 6.35), fontsize=10.5, color=MAU['do'],
                arrowprops=dict(arrowstyle='->', color=MAU['do'], lw=1.3))
    ax.annotate('số mũ của y: 3', xy=(7.05, 5.15), xytext=(6.4, 6.35), fontsize=10.5, color=MAU['do'],
                arrowprops=dict(arrowstyle='->', color=MAU['do'], lw=1.3))
    ax.plot([9.6, 9.6], [0.3, 7.4], color=MAU['xam'], lw=1, ls=':')
    # Phải: nhóm đơn thức đồng dạng
    ax.text(14.5, 7.25, 'Đơn thức đồng dạng = cùng phần biến', ha='center', fontsize=12, color=MAU['xanh'], weight='bold')
    nhom = [('phần biến\nx²y', ['2x²y', '−5x²y', '(1/3)x²y'], 'lam'),
            ('phần biến\nxy²', ['xy²', '−4xy²', '7xy²'], 'la'),
            ('số\nkhác 0', ['6', '−1', '1/2'], 'cam')]
    for i, (ten, ds, m) in enumerate(nhom):
        x0 = 10.2 + i * 3.1
        hop(ax, x0, 1.1, 2.7, 5.0, '', mau=NEN[m], vien=MAU[m])
        ax.text(x0 + 1.35, 5.45, ten, ha='center', va='center', fontsize=10.5, color=MAU[m], weight='bold', linespacing=1.2)
        for j, d in enumerate(ds):
            ax.text(x0 + 1.35, 4.25 - j * 1.05, d, ha='center', fontsize=14, color=MAU['den'])
    ax.text(14.6, 0.45, 'x²y và xy² KHÔNG đồng dạng', ha='center', fontsize=10.5, color=MAU['do'])
    luu(fig, D + 'bai1-don-thuc.svg')


# ---------- Bài 2. Đa thức ----------
def bai2_bac_da_thuc():
    fig, ax = khung(9.6, 4.0); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 8.0)
    mau_nhom = {'A': 'lam', 'B': 'cam', 'C': 'la'}
    ax.text(0.2, 6.6, 'M =', fontsize=15, va='center', color=MAU['den'])
    hang = [('2x³y', 'A'), ('+ 5xy', 'B'), ('− x³y', 'A'), ('+ 3', 'C'), ('− 4xy', 'B')]
    x0 = 1.9
    for t, g in hang:
        w = 2.5 if len(t) > 3 else 1.7
        hop(ax, x0, 5.95, w, 1.3, t, mau=NEN[mau_nhom[g]], vien=MAU[mau_nhom[g]], co=15)
        x0 += w + 0.35
    ax.text(16.0, 6.6, 'chưa thu gọn', fontsize=11, va='center', color=MAU['xam'], style='italic')
    mui_ten(ax, (7.5, 5.7), (7.5, 4.55), MAU['xam'], 1.8)
    ax.text(7.9, 5.1, 'cộng các hạng tử cùng màu (đồng dạng)', fontsize=10.5, va='center', color=MAU['xam'])
    ax.text(0.2, 3.65, 'M =', fontsize=15, va='center', color=MAU['den'])
    gon = [('x³y', 'A', 'bậc 3 + 1 = 4'), ('+ xy', 'B', 'bậc 1 + 1 = 2'), ('+ 3', 'C', 'bậc 0')]
    x0 = 1.9
    for t, g, bac in gon:
        hop(ax, x0, 3.0, 2.6, 1.3, t, mau=NEN[mau_nhom[g]], vien=MAU[mau_nhom[g]], co=15)
        ax.text(x0 + 1.3, 2.35, bac, ha='center', fontsize=10.5, color=MAU[mau_nhom[g]])
        x0 += 3.6
    ax.text(16.0, 3.65, 'đã thu gọn', fontsize=11, va='center', color=MAU['xam'], style='italic')
    hop(ax, 1.9, 0.3, 11.6, 1.2, 'Bậc của M = bậc cao nhất của các hạng tử = 4', mau=NEN['do'], vien=MAU['do'], co=12.5)
    luu(fig, D + 'bai2-bac-da-thuc.svg')


# ---------- Bài 3. Cộng, trừ đa thức theo cột ----------
def bai3_cong_tru_cot():
    fig, ax = khung(9.6, 4.0); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 8.0)
    cot = [2.6, 5.2, 7.4]  # cột x², xy, hằng số

    def bang(dx, tieu_de, dong, kq, dau, mau_kq):
        ax.text(dx + 4.6, 7.4, tieu_de, ha='center', fontsize=12.5, color=MAU['xanh'], weight='bold')
        for c, ten in zip(cot, ['cột x²', 'cột xy', 'cột số']):
            ax.add_patch(Rectangle((dx + c - 1.05, 1.2), 2.1, 5.4, fc=NEN['xam'], ec='none'))
            ax.text(dx + c, 6.25, ten, ha='center', fontsize=9.5, color=MAU['xam'])
        for k, (ten, hs) in enumerate(dong):
            yy = 5.3 - k * 1.25
            ax.text(dx + 0.3, yy, ten, fontsize=13, va='center', color=MAU['den'])
            for c, h in zip(cot, hs):
                if h:
                    ax.text(dx + c, yy, h, ha='center', va='center', fontsize=14, color=MAU['den'])
        ax.text(dx + 0.95, 4.65, dau, fontsize=17, va='center', color=mau_kq)
        ax.plot([dx + 1.3, dx + 8.6], [3.35, 3.35], color=MAU['den'], lw=1.6)
        ax.text(dx + 0.3, 2.55, '=', fontsize=14, va='center', color=MAU['den'])
        for c, h in zip(cot, kq):
            ax.text(dx + c, 2.55, h, ha='center', va='center', fontsize=14, color=mau_kq, weight='bold')

    bang(0, 'Cộng: A + B', [('A', ['2x²', '− xy', '']), ('B', ['x²', '+ 3xy', '− 1'])], ['3x²', '+ 2xy', '− 1'], '+', MAU['lam'])
    bang(9.8, 'Trừ: A − B = A + (−B)', [('A', ['2x²', '− xy', '']), ('−B', ['−x²', '− 3xy', '+ 1'])], ['x²', '− 4xy', '+ 1'], '+', MAU['do'])
    ax.text(14.4, 0.45, 'đổi dấu MỌI hạng tử của B rồi cộng theo cột', ha='center', fontsize=10.5, color=MAU['do'])
    ax.text(4.6, 0.45, 'A = 2x² − xy;  B = x² + 3xy − 1', ha='center', fontsize=10.5, color=MAU['xam'])
    luu(fig, D + 'bai3-cong-tru-cot.svg')


# ---------- Bài 4. Mô hình diện tích (2x + 1)(x + 3) ----------
def bai4_nhan_da_thuc():
    fig, ax = khung(7.6, 4.6); trong(ax)
    X = 2.4  # độ dài vẽ của x (1 đơn vị = 1)
    W1, W2 = 2 * X, 1.0   # chiều ngang: 2x + 1
    H1, H2 = X, 3.0       # chiều dọc: x + 3
    o = (1.6, 0.9)
    o_x, o_y = o
    o_y2 = o_y + H2       # phần x ở trên, phần 3 ở dưới
    o_x2 = o_x + W1
    o_ = [(o_x, o_y2, W1, H1, '2x · x = 2x²', 'lam'), (o_x2, o_y2, W2, H1, 'x', 'la'),
          (o_x, o_y, W1, H2, '2x · 3 = 6x', 'cam'), (o_x2, o_y, W2, H2, '3', 'tim')]
    for (x0, y0, w, h, t, m) in o_:
        ax.add_patch(Rectangle((x0, y0), w, h, fc=NEN[m], ec=MAU[m], lw=1.8))
        ax.text(x0 + w / 2, y0 + h / 2, t, ha='center', va='center', fontsize=12.5 if w > 1.5 else 12, color=MAU['den'])
    # kích thước
    def kt_ngang(x0, x1, y, t):
        ax.annotate('', (x0, y), (x1, y), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.2))
        ax.text((x0 + x1) / 2, y + 0.18, t, ha='center', va='bottom', fontsize=12, color=MAU['den'])

    def kt_doc(y0, y1, x, t):
        ax.annotate('', (x, y0), (x, y1), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.2))
        ax.text(x - 0.15, (y0 + y1) / 2, t, ha='right', va='center', fontsize=12, color=MAU['den'])
    top = o_y + H1 + H2
    kt_ngang(o_x, o_x2, top + 0.25, '2x'); kt_ngang(o_x2, o_x2 + W2, top + 0.25, '1')
    kt_doc(o_y2, top, o_x - 0.25, 'x'); kt_doc(o_y, o_y2, o_x - 0.25, '3')
    ax.text(o_x + (W1 + W2) / 2, top + 1.05, 'Chiều ngang 2x + 1, chiều dọc x + 3', ha='center', fontsize=11, color=MAU['xanh'])
    rx = o_x2 + W2 + 0.6
    ax.text(rx, o_y + 4.3, '(2x + 1)(x + 3)', fontsize=13, color=MAU['den'], weight='bold')
    ax.text(rx, o_y + 3.45, '= 2x² + 6x + x + 3', fontsize=12.5, color=MAU['den'])
    ax.text(rx, o_y + 2.6, '= 2x² + 7x + 3', fontsize=13, color=MAU['do'], weight='bold')
    ax.text(rx, o_y + 1.4, 'Mỗi hạng tử của đa thức này', fontsize=10.5, color=MAU['xam'])
    ax.text(rx, o_y + 0.85, 'nhân với từng hạng tử của', fontsize=10.5, color=MAU['xam'])
    ax.text(rx, o_y + 0.3, 'đa thức kia: 2 · 2 = 4 tích', fontsize=10.5, color=MAU['xam'])
    ax.set_xlim(0, rx + 5.0); ax.set_ylim(0.4, top + 1.6)
    luu(fig, D + 'bai4-nhan-da-thuc.svg')


ALL += [bai1_don_thuc, bai2_bac_da_thuc, bai3_cong_tru_cot, bai4_nhan_da_thuc]


# ---------- Bài 5. Chia đa thức cho đơn thức (mô hình diện tích) ----------
def bai5_chia_da_thuc():
    fig, ax = khung(7.6, 3.9); trong(ax)
    X = 1.5                      # độ dài vẽ của x
    H = 2 * X                    # chiều rộng 2x
    W1, W2 = 3 * X, 2.0          # 3x và 2
    ox, oy = 1.3, 0.7
    ax.add_patch(Rectangle((ox, oy), W1, H, fc=NEN['lam'], ec=MAU['lam'], lw=1.8))
    ax.add_patch(Rectangle((ox + W1, oy), W2, H, fc=NEN['cam'], ec=MAU['cam'], lw=1.8))
    ax.text(ox + W1 / 2, oy + H / 2, '6x²', ha='center', va='center', fontsize=15)
    ax.text(ox + W1 + W2 / 2, oy + H / 2, '4x', ha='center', va='center', fontsize=15)
    ax.annotate('', (ox - 0.25, oy), (ox - 0.25, oy + H), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.2))
    ax.text(ox - 0.4, oy + H / 2, '2x', ha='right', va='center', fontsize=13, color=MAU['do'], weight='bold')
    top = oy + H + 0.25
    ax.annotate('', (ox, top), (ox + W1, top), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.2))
    ax.annotate('', (ox + W1, top), (ox + W1 + W2, top), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.2))
    ax.text(ox + W1 / 2, top + 0.15, '6x² : 2x = 3x', ha='center', va='bottom', fontsize=11.5, color=MAU['lam'])
    ax.text(ox + W1 + W2 / 2, top + 0.15, '4x : 2x = 2', ha='center', va='bottom', fontsize=11.5, color=MAU['cam'])
    ax.text(ox + (W1 + W2) / 2, top + 0.85, 'chiều dài = ?', ha='center', va='bottom', fontsize=11.5, color=MAU['xanh'])
    rx = ox + W1 + W2 + 0.7
    ax.text(rx, oy + 2.6, 'Diện tích: 6x² + 4x', fontsize=12, color=MAU['den'])
    ax.text(rx, oy + 2.0, 'Chiều rộng: 2x', fontsize=12, color=MAU['den'])
    ax.text(rx, oy + 1.15, '(6x² + 4x) : 2x', fontsize=12.5, color=MAU['den'], weight='bold')
    ax.text(rx, oy + 0.5, '= 3x + 2', fontsize=13, color=MAU['do'], weight='bold')
    ax.set_xlim(0, rx + 4.0); ax.set_ylim(0.3, top + 1.5)
    luu(fig, D + 'bai5-chia-da-thuc.svg')


# ---------- Bài 6. Mô hình diện tích (a + b)² và a² − b² ----------
def bai6_binh_phuong():
    fig, ax = khung(9.6, 4.3); trong(ax)
    a, b = 3.0, 1.3
    ox, oy = 1.0, 0.6
    o = [(ox, oy + b, a, a, 'a²', 'lam'), (ox + a, oy + b, b, a, 'ab', 'cam'),
         (ox, oy, a, b, 'ab', 'cam'), (ox + a, oy, b, b, 'b²', 'la')]
    for (x0, y0, w, h, t, m) in o:
        ax.add_patch(Rectangle((x0, y0), w, h, fc=NEN[m], ec=MAU[m], lw=1.8))
        ax.text(x0 + w / 2, y0 + h / 2, t, ha='center', va='center', fontsize=14)
    T = oy + a + b
    for (x0, x1, t) in ((ox, ox + a, 'a'), (ox + a, ox + a + b, 'b')):
        ax.annotate('', (x0, T + 0.2), (x1, T + 0.2), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.1))
        ax.text((x0 + x1) / 2, T + 0.3, t, ha='center', va='bottom', fontsize=12)
    for (y0, y1, t) in ((oy + b, T, 'a'), (oy, oy + b, 'b')):
        ax.annotate('', (ox - 0.2, y0), (ox - 0.2, y1), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.1))
        ax.text(ox - 0.3, (y0 + y1) / 2, t, ha='right', va='center', fontsize=12)
    ax.text(ox + (a + b) / 2, T + 1.05, '(a + b)² = a² + 2ab + b²', ha='center', fontsize=13, color=MAU['do'], weight='bold')
    # Phải: a² − b² = (a + b)(a − b)
    px = 7.6
    ax.add_patch(Rectangle((px, oy), a, a - b, fc=NEN['lam'], ec=MAU['lam'], lw=1.8))
    ax.add_patch(Rectangle((px, oy + a - b), a - b, b, fc=NEN['tim'], ec=MAU['tim'], lw=1.8))
    ax.add_patch(Rectangle((px + a - b, oy + a - b), b, b, fc='white', ec=MAU['xam'], lw=1.3, ls='--'))
    ax.text(px + a - b / 2, oy + a - b / 2, 'bỏ b²', ha='center', va='center', fontsize=10, color=MAU['xam'])
    ax.text(px + a / 2, oy + (a - b) / 2, 'a(a − b)', ha='center', va='center', fontsize=11.5)
    ax.text(px + (a - b) / 2, oy + a - b / 2, 'b(a − b)', ha='center', va='center', fontsize=10.5)
    ax.annotate('', (px, oy + a + 0.2), (px + a, oy + a + 0.2), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.1))
    ax.text(px + a / 2, oy + a + 0.3, 'a', ha='center', va='bottom', fontsize=12)
    ax.text(px + a / 2, T + 1.05, 'a² − b²', ha='center', fontsize=13, color=MAU['den'], weight='bold')
    mui_ten(ax, (px + a + 0.3, oy + 1.0), (px + a + 1.3, oy + 1.0), MAU['xam'], 1.8)
    ax.text(px + a + 0.8, oy + 1.35, 'ghép lại', ha='center', fontsize=10, color=MAU['xam'])
    qx = px + a + 1.6
    ax.add_patch(Rectangle((qx, oy), a, a - b, fc=NEN['lam'], ec=MAU['lam'], lw=1.8))
    ax.add_patch(Rectangle((qx + a, oy), b, a - b, fc=NEN['tim'], ec=MAU['tim'], lw=1.8))
    ax.annotate('', (qx, oy + a - b + 0.2), (qx + a + b, oy + a - b + 0.2), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.1))
    ax.text(qx + (a + b) / 2, oy + a - b + 0.3, 'a + b', ha='center', va='bottom', fontsize=12)
    ax.annotate('', (qx + a + b + 0.2, oy), (qx + a + b + 0.2, oy + a - b), arrowprops=dict(arrowstyle='<->', color=MAU['xam'], lw=1.1))
    ax.text(qx + a + b + 0.3, oy + (a - b) / 2, 'a − b', ha='left', va='center', fontsize=12)
    ax.text(qx + (a + b) / 2, T + 1.05, '= (a + b)(a − b)', ha='center', fontsize=13, color=MAU['do'], weight='bold')
    ax.plot([6.6, 6.6], [0.4, T + 1.4], color=MAU['xam'], lw=1, ls=':')
    ax.set_xlim(0, qx + a + b + 1.4); ax.set_ylim(0.3, T + 1.6)
    luu(fig, D + 'bai6-binh-phuong.svg')


# ---------- Khối hộp vẽ theo phép chiếu xiên ----------
KX, KY = 0.5 * np.cos(np.radians(35)), 0.5 * np.sin(np.radians(35))


def _p(x, y, z, g=(0, 0)):
    return (g[0] + x + KX * y, g[1] + z + KY * y)


def _tron(hexmau, t):
    """Màu đặc = t phần màu gốc + (1 − t) phần trắng."""
    r, g, b = (int(hexmau[i:i + 2], 16) for i in (1, 3, 5))
    return '#%02x%02x%02x' % tuple(int(round(t * c + (1 - t) * 255)) for c in (r, g, b))


def khoi(ax, x, y, z, dx, dy, dz, m, g=(0, 0), nhan=None, co=11):
    """Hộp [x,x+dx]×[y,y+dy]×[z,z+dz]; vẽ 3 mặt nhìn thấy (trước, phải, trên)."""
    P = lambda i, j, k: _p(x + i * dx, y + j * dy, z + k * dz, g)
    truoc = [P(0, 0, 0), P(1, 0, 0), P(1, 0, 1), P(0, 0, 1)]
    phai = [P(1, 0, 0), P(1, 1, 0), P(1, 1, 1), P(1, 0, 1)]
    tren = [P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1)]
    ax.add_patch(Polygon(truoc, closed=True, fc=NEN[m], ec=MAU[m], lw=1.4))
    ax.add_patch(Polygon(phai, closed=True, fc=_tron(MAU[m], 0.45), ec=MAU[m], lw=1.4))
    ax.add_patch(Polygon(tren, closed=True, fc=_tron(MAU[m], 0.25), ec=MAU[m], lw=1.4))
    if nhan:
        c = P(0.5, 0, 0.5)
        ax.text(c[0], c[1], nhan, ha='center', va='center', fontsize=co, color=MAU['den'])


# ---------- Bài 7. Lập phương của một tổng ----------
def bai7_lap_phuong():
    fig, ax = khung(9.6, 5.6); trong(ax)
    a, b = 2.0, 1.0
    mau = {3: 'lam', 2: 'cam', 1: 'la', 0: 'tim'}
    L = [a, b]
    g0 = (1.2, 5.0)
    hop_ = []
    for i in (0, 1):
        for j in (0, 1):
            for k in (0, 1):
                hop_.append(((0, a)[i], (0, a)[j], (0, a)[k], L[i], L[j], L[k], 3 - i - j - k))
    for (x0, y0, z0, dx, dy, dz, na) in sorted(hop_, key=lambda h: (-h[1], h[2], h[0])):
        khoi(ax, x0, y0, z0, dx, dy, dz, mau[na], g=g0)
    for (x0, x1, t) in ((0, a, 'a'), (a, a + b, 'b')):
        p0, p1 = _p(x0, 0, 0, g0), _p(x1, 0, 0, g0)
        ax.text((p0[0] + p1[0]) / 2, p0[1] - 0.45, t, ha='center', fontsize=12)
    for (z0, z1, t) in ((0, a, 'a'), (a, a + b, 'b')):
        p0, p1 = _p(0, 0, z0, g0), _p(0, 0, z1, g0)
        ax.text(p0[0] - 0.35, (p0[1] + p1[1]) / 2, t, ha='center', va='center', fontsize=12)
    for (y0, y1, t) in ((0, a, 'a'), (a, a + b, 'b')):
        p0, p1 = _p(a + b, y0, 0, g0), _p(a + b, y1, 0, g0)
        ax.text((p0[0] + p1[0]) / 2 + 0.3, (p0[1] + p1[1]) / 2 - 0.1, t, ha='left', va='center', fontsize=12)
    ax.text(3.0, 9.55, 'Khối lập phương cạnh a + b', ha='center', fontsize=11.5, color=MAU['xanh'], weight='bold')
    ax.text(7.2, 8.3, '(a + b)³ = a³ + 3a²b + 3ab² + b³', fontsize=14, color=MAU['do'], weight='bold')
    ax.text(7.2, 7.3, 'Khối lập phương cạnh a + b được chia thành 8 khối hộp:', fontsize=11, color=MAU['den'])
    ax.text(7.2, 6.55, '1 khối a³ + 3 khối a²b + 3 khối ab² + 1 khối b³', fontsize=11, color=MAU['den'])
    ax.text(7.2, 5.8, '(cùng màu = cùng thể tích)', fontsize=10.5, color=MAU['xam'], style='italic')
    ax.plot([0.3, 21.3], [4.25, 4.25], color=MAU['xam'], lw=1, ls=':')
    # Hàng dưới: 8 khối tách rời, cùng tỉ lệ
    nhom = [('1 khối a³', 'lam', [(a, a, a)]), ('3 khối a²b', 'cam', [(a, a, b), (a, b, a), (b, a, a)]),
            ('3 khối ab²', 'la', [(a, b, b), (b, a, b), (b, b, a)]), ('1 khối b³', 'tim', [(b, b, b)])]
    x = 0.5
    for ten, m, ds in nhom:
        x_dau = x
        for (dx, dy, dz) in ds:
            khoi(ax, 0, 0, 0, dx, dy, dz, m, g=(x, 0.9))
            x += dx + KX * dy + 0.3
        ax.text((x_dau + x - 0.3) / 2, 0.2, ten, ha='center', fontsize=11, color=MAU[m], weight='bold')
        x += 0.7
    ax.set_xlim(0, max(x, 21.4)); ax.set_ylim(-0.1, 9.9)
    luu(fig, D + 'bai7-lap-phuong.svg')


# ---------- Bài 8. Hiệu hai lập phương a³ − b³ ----------
def bai8_hieu_lap_phuong():
    fig, ax = khung(9.8, 4.4); trong(ax)
    a, b = 3.0, 1.2
    c = a - b
    g0 = (0.7, 0.9)
    # khối lập phương cạnh a bị cắt góc b³: vẽ 3 khối theo thứ tự sau → trước
    khoi(ax, 0, 0, 0, c, a, a, 'lam', g=g0)
    khoi(ax, c, c, 0, b, b, c, 'la', g=g0)
    khoi(ax, c, 0, 0, b, c, a, 'cam', g=g0)
    # góc bị cắt (nét đứt)
    P = lambda i, j, k: _p(c + i * b, c + j * b, c + k * b, g0)
    for u, v in (((0, 0, 1), (1, 0, 1)), ((1, 0, 1), (1, 1, 1)), ((1, 1, 1), (0, 1, 1)), ((0, 1, 1), (0, 0, 1)),
                 ((1, 0, 0), (1, 0, 1)), ((1, 1, 0), (1, 1, 1)), ((1, 0, 0), (1, 1, 0))):
        p, q = P(*u), P(*v)
        ax.plot([p[0], q[0]], [p[1], q[1]], color=MAU['do'], lw=1.2, ls='--')
    t = P(1, 1, 1)
    ax.text(t[0] + 0.15, t[1] + 0.05, 'bỏ b³', fontsize=11, color=MAU['do'])
    for (x0, x1, s) in ((0, c, 'a − b'), (c, a, 'b')):
        p0, p1 = _p(x0, 0, 0, g0), _p(x1, 0, 0, g0)
        ax.text((p0[0] + p1[0]) / 2, p0[1] - 0.4, s, ha='center', fontsize=11.5)
    p0, p1 = _p(0, 0, 0, g0), _p(0, 0, a, g0)
    ax.text(p0[0] - 0.3, (p0[1] + p1[1]) / 2, 'a', ha='center', va='center', fontsize=12)
    ax.text(2.6, 5.75, 'a³ − b³', ha='center', fontsize=13.5, color=MAU['den'], weight='bold')
    ax.text(5.9, 2.6, '=', fontsize=20, ha='center', va='center')
    # tách rời ba khối
    khoi(ax, 0, 0, 0, c, a, a, 'lam', g=(6.6, 0.9))
    ax.text(7.9, 0.25, '(a − b) · a · a', ha='center', fontsize=11, color=MAU['lam'])
    ax.text(10.0, 2.6, '+', fontsize=18, ha='center', va='center')
    khoi(ax, 0, 0, 0, b, c, a, 'cam', g=(10.5, 0.9))
    ax.text(11.45, 0.25, 'b · (a − b) · a', ha='center', fontsize=11, color=MAU['cam'])
    ax.text(13.05, 2.6, '+', fontsize=18, ha='center', va='center')
    khoi(ax, 0, 0, 0, b, b, c, 'la', g=(13.6, 0.9))
    ax.text(14.45, 0.25, 'b · b · (a − b)', ha='center', fontsize=11, color=MAU['la'])
    ax.text(10.6, 5.75, '= (a − b)(a² + ab + b²)', ha='center', fontsize=13.5, color=MAU['do'], weight='bold')
    ax.set_xlim(0, 15.9); ax.set_ylim(-0.1, 6.3)
    luu(fig, D + 'bai8-hieu-lap-phuong.svg')


ALL += [bai5_chia_da_thuc, bai6_binh_phuong, bai7_lap_phuong, bai8_hieu_lap_phuong]


# ---------- Bài 9. Phân tích đa thức thành nhân tử (sơ đồ) ----------
def bai9_phan_tich():
    fig, ax = khung(9.6, 4.6); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 9.2)
    hop(ax, 5.6, 7.9, 8.0, 1.0, 'Đa thức cần phân tích thành nhân tử', mau=NEN['xam'], vien=MAU['xanh'], co=12)
    buoc = [('1. Có nhân tử chung?', 'Đặt nhân tử chung', '6x³y − 9x²y² = 3x²y(2x − 3y)', 'lam'),
            ('2. Có dạng hằng đẳng thức?', 'Dùng hằng đẳng thức', '9x² − 4 = (3x − 2)(3x + 2)', 'cam'),
            ('3. Chưa được?', 'Nhóm hạng tử', 'x² − xy + 2x − 2y\n= x(x − y) + 2(x − y)\n= (x − y)(x + 2)', 'la')]
    for i, (hoi, pp, vd, m) in enumerate(buoc):
        x0 = 0.3 + i * 6.35
        hop(ax, x0, 5.4, 5.9, 1.7, '', mau=NEN[m], vien=MAU[m])
        ax.text(x0 + 2.95, 6.6, hoi, ha='center', va='center', fontsize=10.5, color=MAU['den'])
        ax.text(x0 + 2.95, 5.9, pp, ha='center', va='center', fontsize=12, color=MAU[m], weight='bold')
        ax.text(x0 + 2.95, 3.9, vd, ha='center', va='center', fontsize=10.5, color=MAU['den'], linespacing=1.45)
        mui_ten(ax, (9.6, 7.85), (x0 + 2.95, 7.15), MAU['xam'], 1.4)
        if i < 2:
            mui_ten(ax, (x0 + 5.95, 6.25), (x0 + 6.6, 6.25), MAU['xam'], 1.6)
    hop(ax, 1.5, 0.5, 16.2, 1.5, 'Kiểm tra: nhân các nhân tử phải được đa thức ban đầu; phân tích đến khi\nmỗi nhân tử không phân tích tiếp được nữa (thường phối hợp cả ba phương pháp).',
        mau=NEN['do'], vien=MAU['do'], co=10.5)
    luu(fig, D + 'bai9-phan-tich.svg')


# ---------- Công cụ hình học phẳng ----------
def _np(P):
    return np.array(P, dtype=float)


def doan(ax, P, Q, mau=None, lw=2.0, ls='-'):
    ax.plot([P[0], Q[0]], [P[1], Q[1]], color=mau or MAU['den'], lw=lw, ls=ls, solid_capstyle='round')


def gach(ax, P, Q, n=1, mau=None, dai=0.22, cach=0.1):
    """Kí hiệu n gạch nhỏ ở trung điểm đoạn PQ (đánh dấu đoạn bằng nhau)."""
    P, Q = _np(P), _np(Q); M = (P + Q) / 2; u = (Q - P) / np.linalg.norm(Q - P); v = np.array([-u[1], u[0]])
    for k in range(n):
        c = M + u * (k - (n - 1) / 2) * cach
        ax.plot(*zip(c - v * dai / 2, c + v * dai / 2), color=mau or MAU['den'], lw=1.6)


def goc(ax, O, P, Q, r=0.5, n=1, mau=None, nhan=None, rn=None, co=11):
    """Cung đánh dấu góc POQ (đi ngược chiều kim đồng hồ từ OP đến OQ)."""
    O = _np(O); a1 = np.degrees(np.arctan2(*(_np(P) - O)[::-1])); a2 = np.degrees(np.arctan2(*(_np(Q) - O)[::-1]))
    if a2 < a1:
        a2 += 360
    for k in range(n):
        ax.add_patch(Arc(O, 2 * (r + 0.09 * k), 2 * (r + 0.09 * k), theta1=a1, theta2=a2, color=mau or MAU['do'], lw=1.5))
    if nhan:
        am = np.radians((a1 + a2) / 2); rr = rn or (r + 0.45)
        ax.text(O[0] + rr * np.cos(am), O[1] + rr * np.sin(am), nhan, ha='center', va='center', fontsize=co, color=mau or MAU['do'])
    return a2 - a1


def vuong(ax, O, P, Q, d=0.3, mau=None):
    O = _np(O); u = (_np(P) - O) / np.linalg.norm(_np(P) - O) * d; v = (_np(Q) - O) / np.linalg.norm(_np(Q) - O) * d
    ax.plot(*zip(O + u, O + u + v, O + v), color=mau or MAU['den'], lw=1.3)


def ten_diem(ax, ds, tam, k=0.38, co=13):
    tam = _np(tam)
    for t, P in ds.items():
        P = _np(P); u = (P - tam) / np.linalg.norm(P - tam)
        ax.text(*(P + u * k), t, ha='center', va='center', fontsize=co, color=MAU['den'], style='italic')
        ax.plot(*P, 'o', color=MAU['den'], ms=3.5)


def do_goc(O, P, Q):
    O, P, Q = _np(O), _np(P), _np(Q); u, v = P - O, Q - O
    return np.degrees(np.arccos(np.dot(u, v) / np.linalg.norm(u) / np.linalg.norm(v)))


def tu_giac_goc(dai_AB, goc_trong, dai_BC):
    """Tứ giác lồi ABCD (ngược chiều kim đồng hồ) có AB, BC cho trước và các góc trong A, B, C, D (độ)."""
    A = np.array([0.0, 0.0]); B = np.array([dai_AB, 0.0])
    huong = [0.0]
    for g in goc_trong[1:3]:
        huong.append(huong[-1] + 180 - g)
    h = [np.array([np.cos(np.radians(t)), np.sin(np.radians(t))]) for t in huong]
    C = B + dai_BC * h[1]
    h_DA = np.radians(huong[2] + 180 - goc_trong[3])
    w = np.array([np.cos(h_DA), np.sin(h_DA)])
    # C + r·h[2] + p·w = A  →  giải r, p
    r, pp = np.linalg.solve(np.column_stack([h[2], w]), A - C)
    assert r > 0 and pp > 0
    return A, B, C, C + r * h[2]


# ---------- Bài 10. Tứ giác ----------
def bai10_tu_giac():
    fig, ax = khung(9.6, 4.4); trong(ax)
    A, B, C, Dd = tu_giac_goc(5.0, (75, 110, 85, 90), 3.0)
    ax.add_patch(Polygon([A, B, C], closed=True, fc=NEN['lam'], ec='none'))
    ax.add_patch(Polygon([A, C, Dd], closed=True, fc=NEN['cam'], ec='none'))
    for P, Q in ((A, B), (B, C), (C, Dd), (Dd, A)):
        doan(ax, P, Q)
    doan(ax, A, C, MAU['xam'], 1.5, '--'); doan(ax, B, Dd, MAU['xam'], 1.5, ':')
    tam = (A + B + C + Dd) / 4
    for O, P, Q in ((A, B, Dd), (B, C, A), (C, Dd, B)):
        g = goc(ax, O, P, Q, r=0.45, nhan='%d°' % round(do_goc(O, P, Q)), rn=0.95, co=10.5)
    vuong(ax, Dd, A, C, d=0.32, mau=MAU['do'])
    ax.text(*(Dd + (tam - Dd) / np.linalg.norm(tam - Dd) * 0.95), '90°', ha='center', va='center', fontsize=10.5, color=MAU['do'])
    ten_diem(ax, {'A': A, 'B': B, 'C': C, 'D': Dd}, tam)
    ax.text(2.55, -1.0, 'Tứ giác lồi ABCD: 75° + 110° + 85° + 90° = 360°', ha='center', fontsize=11, color=MAU['xanh'])
    g1, g2 = (A + B + C) / 3, (A + C + Dd) / 3
    ax.text(g1[0] - 0.75, g1[1] - 0.4, 'ΔABC', ha='center', fontsize=10, color=MAU['lam'])
    ax.text(g2[0] - 0.3, g2[1] + 0.1, 'ΔACD', ha='center', fontsize=10, color=MAU['cam'])
    # Tứ giác không lồi
    g0 = np.array([9.0, 0.0])
    M, N, P, Q = g0 + [0, 0.3], g0 + [2.0, 1.6], g0 + [4.2, 0.0], g0 + [2.0, 4.2]
    ax.add_patch(Polygon([M, N, P, Q], closed=True, fc=NEN['xam'], ec=MAU['den'], lw=2.0))
    u = (P - N) / np.linalg.norm(P - N)
    doan(ax, N - u * 2.6, P + u * 0.8, MAU['do'], 1.3, '--')
    ten_diem(ax, {'M': M, 'N': N, 'P': P, 'Q': Q}, g0 + [2.0, 2.2], k=0.36)
    ax.text(11.1, -1.0, 'Tứ giác không lồi MNPQ', ha='center', fontsize=11, color=MAU['xanh'])
    ax.text(13.45, 2.7, 'nằm ở cả hai phía\ncủa đường thẳng NP', ha='center', fontsize=9.5, color=MAU['do'], linespacing=1.3)
    ax.set_xlim(-0.9, 15.0); ax.set_ylim(-1.4, 4.9)
    luu(fig, D + 'bai10-tu-giac.svg')


# ---------- Bài 11. Hình thang cân ----------
def bai11_hinh_thang_can():
    fig, ax = khung(9.6, 4.0); trong(ax)
    h = 2 * np.sqrt(3)
    Dd, C, B, A = np.array([0, 0.0]), np.array([8, 0.0]), np.array([6, h]), np.array([2, h])
    # giao điểm hai đường chéo
    t = np.linalg.solve(np.column_stack([C - A, -(Dd - B)]), B - A)[0]; O = A + t * (C - A)
    ax.add_patch(Polygon([A, B, C, Dd], closed=True, fc=NEN['lam'], ec=MAU['den'], lw=2.0))
    doan(ax, A, C, MAU['cam'], 1.6); doan(ax, B, Dd, MAU['cam'], 1.6)
    gach(ax, A, Dd, 1); gach(ax, B, C, 1)
    gach(ax, A, C, 2, MAU['cam']); gach(ax, B, Dd, 2, MAU['cam'])
    goc(ax, Dd, C, A, r=0.55, nhan='60°', rn=1.05, co=10.5); goc(ax, C, B, Dd, r=0.55, nhan='60°', rn=1.05, co=10.5)
    goc(ax, A, Dd, B, r=0.45, n=2, mau=MAU['la'], nhan='120°', rn=1.0, co=10.5); goc(ax, B, A, C, r=0.45, n=2, mau=MAU['la'], nhan='120°', rn=1.0, co=10.5)
    ten_diem(ax, {'A': A, 'B': B, 'C': C, 'D': Dd, 'O': O}, np.array([4, h / 2 + 0.6]))
    ax.text(4, -0.75, 'Hình thang cân ABCD (AB ∥ CD)', ha='center', fontsize=11, color=MAU['xanh'])
    tx = 9.4
    for k, (t_, m) in enumerate((('• Ĉ = D̂, Â = B̂ (góc kề một đáy)', 'do'), ('• AD = BC (cạnh bên)', 'den'),
                                  ('• AC = BD (đường chéo)', 'cam'), ('• Â + D̂ = 180° (kề cạnh bên)', 'la'))):
        ax.text(tx, 3.2 - k * 0.75, t_, fontsize=11, color=MAU[m])
    # Hình thang vuông
    g0 = np.array([16.2, 0.0])
    E, F, G, H = g0, g0 + [3.4, 0], g0 + [2.0, 2.4], g0 + [0, 2.4]
    ax.add_patch(Polygon([E, F, G, H], closed=True, fc=NEN['la'], ec=MAU['den'], lw=2.0))
    vuong(ax, E, F, H); vuong(ax, H, E, G)
    ten_diem(ax, {'E': E, 'F': F, 'G': G, 'H': H}, g0 + [1.5, 1.2])
    ax.text(17.9, -0.75, 'Hình thang vuông', ha='center', fontsize=11, color=MAU['xanh'])
    ax.set_xlim(-0.8, 20.2); ax.set_ylim(-1.1, h + 0.7)
    luu(fig, D + 'bai11-hinh-thang-can.svg')


# ---------- Bài 12. Hình bình hành ----------
def bai12_hinh_binh_hanh():
    fig, ax = khung(9.6, 4.0); trong(ax)
    A = np.array([0.0, 0.0]); B = np.array([5.5, 0.0]); w = 3.4 * np.array([np.cos(np.radians(60)), np.sin(np.radians(60))])
    Dd = A + w; C = B + w; O = (A + C) / 2
    ax.add_patch(Polygon([A, B, C, Dd], closed=True, fc=NEN['ngoc'], ec=MAU['den'], lw=2.0))
    doan(ax, A, C, MAU['lam'], 1.5); doan(ax, B, Dd, MAU['cam'], 1.5)
    gach(ax, A, B, 2); gach(ax, Dd, C, 2); gach(ax, A, Dd, 1); gach(ax, B, C, 1)
    gach(ax, A, O, 1, MAU['lam'], dai=0.18); gach(ax, O, C, 1, MAU['lam'], dai=0.18)
    gach(ax, B, O, 3, MAU['cam'], dai=0.18, cach=0.08); gach(ax, O, Dd, 3, MAU['cam'], dai=0.18, cach=0.08)
    goc(ax, A, B, Dd, r=0.5, nhan='60°', rn=1.0, co=10.5); goc(ax, C, Dd, B, r=0.5, nhan='60°', rn=1.0, co=10.5)
    goc(ax, B, C, A, r=0.42, n=2, mau=MAU['la'], nhan='120°', rn=0.95, co=10.5); goc(ax, Dd, A, C, r=0.42, n=2, mau=MAU['la'], nhan='120°', rn=0.95, co=10.5)
    ten_diem(ax, {'A': A, 'B': B, 'C': C, 'D': Dd, 'O': O + [0, -0.02]}, O + [0, 0.9])
    ax.text(3.6, -0.8, 'Hình bình hành ABCD (AB ∥ CD, AD ∥ BC)', ha='center', fontsize=11, color=MAU['xanh'])
    tx = 9.6
    ax.text(tx, 3.05, 'Tính chất', fontsize=12, color=MAU['xanh'], weight='bold')
    for k, (t_, m) in enumerate((('• AB = CD, AD = BC (cạnh đối)', 'den'), ('• Â = Ĉ, B̂ = D̂ (góc đối)', 'la'),
                                  ('• OA = OC, OB = OD', 'lam'), ('  (đường chéo cắt nhau tại', 'xam'), ('  trung điểm của mỗi đường)', 'xam'))):
        ax.text(tx, 2.3 - k * 0.62, t_, fontsize=11, color=MAU[m])
    ax.set_xlim(-0.7, 15.6); ax.set_ylim(-1.15, C[1] + 0.6)
    luu(fig, D + 'bai12-hinh-binh-hanh.svg')


ALL += [bai9_phan_tich, bai10_tu_giac, bai11_hinh_thang_can, bai12_hinh_binh_hanh]

if __name__ == '__main__':
    for f in ALL:
        f()
