"""Hình minh họa Toán 6 – Chương I, II (tự vẽ). Chạy: python3 scripts/hinh/toan6.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bx_hinh import *

D = '6-toan/'
ALL = []


def tia_so(ax, x0, x1, y, n, buoc=1.0, nhan=True, co=11, mau=None, goc=0):
    """Vẽ tia số gốc tại x0 (ứng với số `goc`), mỗi vạch cách nhau `buoc`, n vạch; trả về hàm đổi số -> hoành độ."""
    mau = mau or MAU['den']
    ax.annotate('', (x1, y), (x0, y), arrowprops=dict(arrowstyle='-|>', color=mau, lw=1.6, mutation_scale=14))
    for k in range(n + 1):
        xx = x0 + k * buoc
        ax.plot([xx, xx], [y - 0.12, y + 0.12], color=mau, lw=1.4)
        if nhan:
            ax.text(xx, y - 0.42, str(goc + k), ha='center', va='center', fontsize=co, color=mau)
    return lambda v: x0 + (v - goc) * buoc


def nhay(ax, a, b, y, mau, chu=None, co=11, w=2.0, rad=0.45, duoi=False):
    """Mũi tên cong (bước nhảy) từ a đến b, phía trên (hoặc dưới) tia số; nhãn đặt ở đỉnh cung."""
    r = -rad if (b > a) != duoi else rad
    y0 = y - 0.75 if duoi else y + 0.1
    ax.add_patch(FancyArrowPatch((a, y0), (b, y0), connectionstyle='arc3,rad=%s' % r,
                                 arrowstyle='-|>', mutation_scale=14, color=mau, lw=w))
    if chu:
        dinh = rad * abs(b - a) / 2
        ax.text((a + b) / 2, y0 - dinh - 0.4 if duoi else y0 + dinh + 0.35, chu, ha='center', va='center', fontsize=co, color=mau, weight='bold')


# ---------------- Bài 1 ----------------
def bai1_so_do_ven():
    fig, ax = khung(8.0, 3.6); trong(ax)
    ax.set_xlim(0, 16); ax.set_ylim(0, 7.2)
    ax.add_patch(Ellipse((5.2, 3.6), 7.6, 5.0, fc='#e6f0fb', ec=MAU['lam'], lw=2.2))
    ax.text(1.75, 5.9, 'A', fontsize=17, weight='bold', color=MAU['lam'])
    pts = {1: (3.2, 4.4), 3: (4.9, 5.0), 5: (6.8, 4.5), 7: (3.9, 2.6), 9: (6.2, 2.4)}
    for k, (x, y) in pts.items():
        ax.plot(x, y, 'o', color=MAU['lam'], ms=6)
        ax.text(x + 0.22, y + 0.12, str(k), fontsize=13, color=MAU['den'])
    for k, (x, y) in {4: (10.0, 5.6), 8: (10.4, 1.4)}.items():
        ax.plot(x, y, 'o', color=MAU['do'], ms=6)
        ax.text(x + 0.22, y + 0.12, str(k), fontsize=13, color=MAU['den'])
    ax.annotate('3 ∈ A\n(3 thuộc A)', (4.95, 5.15), (8.2, 6.6), fontsize=11, color=MAU['lam'], ha='center', va='center',
                arrowprops=dict(arrowstyle='->', color=MAU['lam'], lw=1.4))
    ax.annotate('4 ∉ A\n(4 không thuộc A)', (10.05, 5.7), (12.9, 5.9), fontsize=11, color=MAU['do'], ha='center', va='center',
                arrowprops=dict(arrowstyle='->', color=MAU['do'], lw=1.4))
    hop(ax, 10.9, 2.3, 4.9, 2.0, '', mau='#fff8e6', vien=MAU['cam'])
    ax.text(13.35, 3.65, 'Liệt kê:', ha='center', fontsize=10.5, color=MAU['cam'], weight='bold')
    ax.text(13.35, 2.85, 'A = {1; 3; 5; 7; 9}', ha='center', fontsize=11.5, color=MAU['den'])
    ax.text(5.2, 0.35, 'A: tập hợp các số tự nhiên lẻ nhỏ hơn 10', ha='center', fontsize=10.5, color=MAU['xam'])
    luu(fig, D + 'bai1-so-do-ven.svg')


ALL += [bai1_so_do_ven]


# ---------------- Bài 2 ----------------
def bai2_hang_lop():
    fig, ax = khung(9.4, 3.9); trong(ax)
    ax.set_xlim(0, 18.8); ax.set_ylim(0, 7.8)
    w, x0 = 2.0, 0.4
    lop = [('Lớp triệu', MAU['tim'], '#efe7fb'), ('Lớp nghìn', MAU['lam'], '#e3eefc'), ('Lớp đơn vị', MAU['la'], '#eef7e6')]
    hang = ['Trăm\ntriệu', 'Chục\ntriệu', 'Triệu', 'Trăm\nnghìn', 'Chục\nnghìn', 'Nghìn', 'Trăm', 'Chục', 'Đơn\nvị']
    so = '803506274'
    for i in range(3):
        t, vien, nen = lop[i]
        ax.add_patch(Rectangle((x0 + 3 * i * w, 6.5), 3 * w, 0.9, fc=nen, ec=vien, lw=1.6))
        ax.text(x0 + 3 * i * w + 1.5 * w, 6.95, t, ha='center', va='center', fontsize=12, weight='bold', color=vien)
    for k in range(9):
        t, vien, nen = lop[k // 3]
        ax.add_patch(Rectangle((x0 + k * w, 5.1), w, 1.4, fc='white', ec=vien, lw=1.3))
        ax.text(x0 + k * w + w / 2, 5.8, hang[k], ha='center', va='center', fontsize=9.5, color=MAU['den'], linespacing=1.1)
        noi_bat = (k == 3)
        ax.add_patch(Rectangle((x0 + k * w, 3.9), w, 1.2, fc='#fff3cd' if noi_bat else nen, ec=vien, lw=1.3))
        ax.text(x0 + k * w + w / 2, 4.5, so[k], ha='center', va='center', fontsize=18, weight='bold',
                color=MAU['do'] if noi_bat else MAU['den'])
    ax.annotate('chữ số 5 ở hàng trăm nghìn\ncó giá trị 500 000', (x0 + 3.5 * w, 3.85), (x0 + 3.5 * w, 2.75), ha='center', va='center',
                fontsize=10.5, color=MAU['do'], arrowprops=dict(arrowstyle='->', color=MAU['do'], lw=1.4))
    ax.text(x0, 1.45, 'Viết: 803 506 274', fontsize=12, color=MAU['den'], weight='bold')
    ax.text(x0, 0.6, 'Đọc: Tám trăm linh ba triệu năm trăm linh sáu nghìn hai trăm bảy mươi tư', fontsize=11, color=MAU['den'])
    luu(fig, D + 'bai2-hang-lop.svg')


def la_ma(n):
    s = ''
    for v, c in ((10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')):
        while n >= v:
            s += c; n -= v
    return s


def bai2_so_la_ma():
    fig, ax = khung(9.6, 3.8); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0.9, 8.0)
    w, h, x0 = 1.8, 1.3, 0.6
    mau = [('#e3eefc', MAU['lam']), ('#eef7e6', MAU['la']), ('#fdf0dc', MAU['cam'])]
    for r in range(3):
        y = 5.6 - r * (h + 0.25)
        for c in range(10):
            n = r * 10 + c + 1
            nen, vien = mau[r]
            ax.add_patch(Rectangle((x0 + c * w, y), w, h, fc=nen, ec=vien, lw=1.2))
            ax.text(x0 + c * w + w / 2, y + h - 0.3, str(n), ha='center', va='center', fontsize=9.5, color=MAU['xam'])
            ax.text(x0 + c * w + w / 2, y + 0.45, la_ma(n), ha='center', va='center', fontsize=11.5, weight='bold', color=MAU['den'])
    ax.text(x0, 7.35, 'Chữ số La Mã:  I = 1    V = 5    X = 10', fontsize=12, color=MAU['xanh'], weight='bold')
    ax.text(x0, 1.45, 'IV = 5 − 1 = 4;  IX = 10 − 1 = 9;  thêm X (hoặc XX) vào bên trái các số từ I đến X được các số từ 11 đến 20 (21 đến 30).',
            fontsize=9.6, color=MAU['den'])
    luu(fig, D + 'bai2-so-la-ma.svg')


ALL += [bai2_hang_lop, bai2_so_la_ma]


# ---------------- Bài 3 ----------------
def bai3_tia_so():
    fig, ax = khung(9.0, 3.2); trong(ax)
    ax.set_xlim(0, 18); ax.set_ylim(0, 6.4)
    f = tia_so(ax, 1.0, 17.4, 2.4, 12, buoc=1.25, co=12)
    for v, c in ((3, MAU['lam']), (8, MAU['do'])):
        ax.plot(f(v), 2.4, 'o', color=c, ms=9, zorder=5)
    ax.add_patch(FancyArrowPatch((f(3), 2.62), (f(8), 2.62), connectionstyle='arc3,rad=-0.35', arrowstyle='-|>', mutation_scale=15, color=MAU['xanh'], lw=2))
    ax.text((f(3) + f(8)) / 2, 4.25, '3 < 8: điểm 3 nằm bên trái điểm 8', ha='center', fontsize=12, color=MAU['xanh'], weight='bold')
    ax.annotate('gốc O ứng với số 0\n(số tự nhiên nhỏ nhất)', (f(0), 2.25), (f(0) + 0.1, 0.65), fontsize=10, color=MAU['xam'], ha='left', va='center',
                arrowprops=dict(arrowstyle='->', color=MAU['xam']))
    ax.annotate('11 là số liền trước của 12;  12 là số liền sau của 11', (f(11.5), 2.2), (f(7.6), 0.65), fontsize=10, color=MAU['cam'], ha='center', va='center',
                arrowprops=dict(arrowstyle='->', color=MAU['cam']))
    ax.text(17.5, 2.95, 'chiều tăng', ha='right', fontsize=10, color=MAU['xam'])
    luu(fig, D + 'bai3-tia-so.svg')


ALL += [bai3_tia_so]


# ---------------- Bài 4 ----------------
def bai4_cong_tru():
    fig, ax = khung(9.0, 5.0); trong(ax)
    ax.set_xlim(0, 18); ax.set_ylim(-1.4, 8.6)
    # Phép cộng 5 + 4 = 9
    f = tia_so(ax, 1.0, 16.2, 5.8, 11, buoc=1.3, co=11)
    nhay(ax, f(0), f(5), 5.8, MAU['lam'], '5')
    nhay(ax, f(5), f(9), 5.8, MAU['cam'], '+ 4')
    ax.plot(f(9), 5.8, 'o', color=MAU['do'], ms=8, zorder=5)
    ax.text(16.9, 6.6, 'Phép cộng\n5 + 4 = 9', ha='center', va='center', fontsize=11.5, color=MAU['xanh'], weight='bold')
    # Phép trừ 9 − 4 = 5
    g = tia_so(ax, 1.0, 16.2, 1.9, 11, buoc=1.3, co=11)
    nhay(ax, g(0), g(9), 1.9, MAU['lam'], '9', rad=0.3)
    nhay(ax, g(9), g(5), 1.9, MAU['do'], '− 4 (lùi lại 4 đơn vị)', duoi=True)
    ax.plot(g(5), 1.9, 'o', color=MAU['do'], ms=8, zorder=5)
    ax.text(16.9, 2.4, 'Phép trừ\n9 − 4 = 5', ha='center', va='center', fontsize=11.5, color=MAU['xanh'], weight='bold')
    luu(fig, D + 'bai4-cong-tru.svg')


ALL += [bai4_cong_tru]

# ---------------- Bài 5 ----------------
def bai5_phan_phoi():
    fig, ax = khung(8.6, 3.6); trong(ax)
    ax.set_xlim(0, 17.2); ax.set_ylim(0, 7.2)
    u = 0.5   # 1 đơn vị độ dài
    x0, y0 = 1.2, 1.6
    ax.add_patch(Rectangle((x0, y0), 20 * u, 6 * u * 1.0, fc='#e3eefc', ec=MAU['lam'], lw=2))
    ax.add_patch(Rectangle((x0 + 20 * u, y0), 4 * u, 6 * u, fc='#fdf0dc', ec=MAU['cam'], lw=2))
    for k in range(1, 24):
        ax.plot([x0 + k * u] * 2, [y0, y0 + 6 * u], color='white', lw=0.6)
    for k in range(1, 6):
        ax.plot([x0, x0 + 24 * u], [y0 + k * u] * 2, color='white', lw=0.6)
    ax.add_patch(Rectangle((x0, y0), 24 * u, 6 * u, fill=False, ec=MAU['den'], lw=1.2))
    ax.text(x0 + 10 * u, y0 + 3 * u, '6 · 20 = 120', ha='center', va='center', fontsize=13, weight='bold', color=MAU['lam'])
    ax.text(x0 + 22 * u, y0 + 3 * u, '6 · 4\n= 24', ha='center', va='center', fontsize=10.5, weight='bold', color=MAU['cam'])
    ax.annotate('', (x0, y0 - 0.35), (x0 + 20 * u, y0 - 0.35), arrowprops=dict(arrowstyle='<->', color=MAU['lam']))
    ax.text(x0 + 10 * u, y0 - 0.75, '20', ha='center', fontsize=11, color=MAU['lam'])
    ax.annotate('', (x0 + 20 * u, y0 - 0.35), (x0 + 24 * u, y0 - 0.35), arrowprops=dict(arrowstyle='<->', color=MAU['cam']))
    ax.text(x0 + 22 * u, y0 - 0.75, '4', ha='center', fontsize=11, color=MAU['cam'])
    ax.annotate('', (x0 - 0.35, y0), (x0 - 0.35, y0 + 6 * u), arrowprops=dict(arrowstyle='<->', color=MAU['den']))
    ax.text(x0 - 0.75, y0 + 3 * u, '6', ha='center', va='center', fontsize=11)
    ax.text(x0 + 12 * u, 5.25, 'Diện tích cả hình: 6 · (20 + 4) = 6 · 20 + 6 · 4 = 120 + 24 = 144', ha='center', fontsize=11.5, color=MAU['xanh'], weight='bold')
    hop(ax, 13.9, 2.0, 3.1, 2.2, 'a · (b + c)\n= a · b + a · c', mau='#eef4f0', vien=MAU['xanh'], co=11)
    luu(fig, D + 'bai5-phan-phoi.svg')


def bai5_chia_co_du():
    fig, ax = khung(8.6, 3.8); trong(ax)
    ax.set_xlim(0, 17.2); ax.set_ylim(0, 7.6)
    cw = 0.62   # độ rộng một cột chữ số
    X = lambda c: 1.6 + c * cw
    def viet(chu, c0, y, mau=MAU['den'], dam=False):
        for i, ch in enumerate(chu):
            if ch != ' ':
                ax.text(X(c0 + i), y, ch, ha='center', va='center', fontsize=17, color=mau, weight='bold' if dam else 'normal')
    viet('4817', 0, 6.4, MAU['lam'], True)
    viet('46', 0, 5.3); ax.text(X(0) - 0.55, 5.85, '−', fontsize=15, ha='center', va='center')
    ax.plot([X(0) - 0.3, X(1) + 0.3], [4.85, 4.85], color=MAU['den'], lw=1.3)
    viet('217', 1, 4.3)
    viet('207', 1, 3.2); ax.text(X(1) - 0.55, 3.75, '−', fontsize=15, ha='center', va='center')
    ax.plot([X(1) - 0.3, X(3) + 0.3], [2.75, 2.75], color=MAU['den'], lw=1.3)
    viet('10', 2, 2.2, MAU['do'], True)
    # số chia, thương
    xv = X(3) + 0.55
    ax.plot([xv, xv], [6.95, 3.9], color=MAU['den'], lw=1.5)
    ax.plot([xv, xv + 2.4], [5.85, 5.85], color=MAU['den'], lw=1.5)
    for i, ch in enumerate('23'):
        ax.text(xv + 0.6 + i * cw, 6.4, ch, ha='center', va='center', fontsize=17, color=MAU['cam'], weight='bold')
    for i, ch in enumerate('209'):
        ax.text(xv + 0.6 + i * cw, 5.3, ch, ha='center', va='center', fontsize=17, color=MAU['la'], weight='bold')
    # chú thích
    ax.text(X(0) - 1.0, 6.4, 'số bị chia', ha='right', va='center', fontsize=10.5, color=MAU['lam'])
    ax.text(xv + 2.3, 6.4, 'số chia', ha='left', va='center', fontsize=10.5, color=MAU['cam'])
    ax.text(xv + 2.3, 5.3, 'thương', ha='left', va='center', fontsize=10.5, color=MAU['la'])
    ax.text(X(4) - 0.1, 2.2, '← số dư (10 < 23)', ha='left', va='center', fontsize=10.5, color=MAU['do'])
    ax.text(X(0) - 1.0, 4.3, '21 < 23: viết 0\nở thương, hạ 7', ha='right', va='center', fontsize=9.5, color=MAU['xam'])
    hop(ax, 9.6, 3.0, 7.2, 3.4, '', mau='#eef4f0', vien=MAU['xanh'])
    ax.text(13.2, 5.6, '4 817 : 23 = 209 (dư 10)', ha='center', fontsize=12, color=MAU['xanh'], weight='bold')
    ax.text(13.2, 4.6, '4 817 = 23 · 209 + 10', ha='center', fontsize=12.5, color=MAU['den'])
    ax.text(13.2, 3.6, 'a = b · q + r  (0 ≤ r < b)', ha='center', fontsize=11.5, color=MAU['tim'])
    luu(fig, D + 'bai5-chia-co-du.svg')


ALL += [bai5_phan_phoi, bai5_chia_co_du]


# ---------------- Bài 6 ----------------
def bai6_luy_thua():
    fig, ax = khung(9.6, 3.8); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 7.6)
    # cơ số, số mũ
    ax.text(1.4, 4.3, '2', fontsize=44, color=MAU['lam'], weight='bold', ha='center', va='center')
    ax.text(2.35, 5.35, '5', fontsize=24, color=MAU['do'], weight='bold', ha='center', va='center')
    ax.annotate('cơ số', (1.3, 3.5), (0.9, 1.9), fontsize=11, color=MAU['lam'], ha='center', arrowprops=dict(arrowstyle='->', color=MAU['lam']))
    ax.annotate('số mũ', (2.5, 5.85), (3.6, 6.9), fontsize=11, color=MAU['do'], ha='center', arrowprops=dict(arrowstyle='->', color=MAU['do']))
    ax.text(3.2, 4.3, '= 2 · 2 · 2 · 2 · 2 = 32', fontsize=12.5, va='center')
    ax.text(3.2, 3.35, '(5 thừa số 2)', fontsize=10.5, color=MAU['xam'], va='center')
    # 3² ô vuông
    u = 0.85; x0, y0 = 9.0, 2.2
    for i in range(3):
        for j in range(3):
            ax.add_patch(Rectangle((x0 + i * u, y0 + j * u), u, u, fc='#eef7e6', ec=MAU['la'], lw=1.6))
    ax.text(x0 + 1.5 * u, 6.2, '3² = 3 · 3 = 9', ha='center', fontsize=12.5, color=MAU['la'], weight='bold')
    ax.text(x0 + 1.5 * u, 1.3, '"3 bình phương"', ha='center', fontsize=10.5, color=MAU['xam'])
    # 3³ khối lập phương (hình chiếu xiên)
    u = 0.75; ox, oy = 14.2, 1.9; dx, dy = 0.42, 0.34
    def P(i, j, k):  # i: ngang, j: sâu, k: cao
        return (ox + i * u + j * dx, oy + k * u + j * dy)
    for i in range(3):
        for k in range(3):   # mặt trước
            ax.add_patch(Polygon([P(i, 0, k), P(i + 1, 0, k), P(i + 1, 0, k + 1), P(i, 0, k + 1)], fc='#fdf0dc', ec=MAU['cam'], lw=1.3))
    for i in range(3):
        for j in range(3):   # mặt trên
            ax.add_patch(Polygon([P(i, j, 3), P(i + 1, j, 3), P(i + 1, j + 1, 3), P(i, j + 1, 3)], fc='#fbe3bd', ec=MAU['cam'], lw=1.3))
    for j in range(3):
        for k in range(3):   # mặt bên phải
            ax.add_patch(Polygon([P(3, j, k), P(3, j + 1, k), P(3, j + 1, k + 1), P(3, j, k + 1)], fc='#f3cf98', ec=MAU['cam'], lw=1.3))
    ax.text(ox + 1.5 * u + 0.6, 6.2, '3³ = 3 · 3 · 3 = 27', ha='center', fontsize=12.5, color=MAU['cam'], weight='bold')
    ax.text(ox + 1.5 * u + 0.6, 1.3, '"3 lập phương"', ha='center', fontsize=10.5, color=MAU['xam'])
    luu(fig, D + 'bai6-luy-thua.svg')


ALL += [bai6_luy_thua]


# ---------------- Bài 7 ----------------
def bai7_thu_tu():
    fig, ax = khung(9.6, 4.4); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 8.8)
    ax.text(0.3, 8.2, 'Biểu thức không có dấu ngoặc', fontsize=12, weight='bold', color=MAU['xanh'])
    buoc = [('Lũy thừa', '#efe7fb', MAU['tim']), ('Nhân và chia\n(trái → phải)', '#e3eefc', MAU['lam']), ('Cộng và trừ\n(trái → phải)', '#eef7e6', MAU['la'])]
    for i, (t, nen, vien) in enumerate(buoc):
        x = 0.3 + i * 4.0
        hop(ax, x, 5.9, 3.2, 1.6, t, mau=nen, vien=vien, co=11)
        if i:
            mui_ten(ax, (x - 0.75, 6.7), (x - 0.05, 6.7), MAU['xam'], 1.8)
    ax.text(0.3, 4.6, 'Biểu thức có dấu ngoặc', fontsize=12, weight='bold', color=MAU['xanh'])
    ngoac = [('( )\nngoặc tròn', '#fdf0dc', MAU['cam']), ('[ ]\nngoặc vuông', '#fde8ec', MAU['do']), ('{ }\nngoặc nhọn', '#e6f4f1', MAU['ngoc'])]
    for i, (t, nen, vien) in enumerate(ngoac):
        x = 0.3 + i * 4.0
        hop(ax, x, 2.3, 3.2, 1.6, t, mau=nen, vien=vien, co=11)
        if i:
            mui_ten(ax, (x - 0.75, 3.1), (x - 0.05, 3.1), MAU['xam'], 1.8)
    ax.text(6.1, 1.3, 'Trong mỗi ngoặc vẫn làm: lũy thừa → nhân, chia → cộng, trừ', ha='center', fontsize=10, color=MAU['xam'])
    # ví dụ
    hop(ax, 12.6, 1.0, 6.3, 6.5, '', mau='#fffaf0', vien=MAU['vang'])
    ax.text(15.75, 6.85, 'Ví dụ', ha='center', fontsize=11.5, weight='bold', color=MAU['cam'])
    dong = ['40 − 3 · 2³', '= 40 − 3 · 8', '= 40 − 24', '= 16']
    chu = ['', '(lũy thừa)', '(nhân)', '(trừ)']
    for i, (d, c) in enumerate(zip(dong, chu)):
        y = 5.8 - i * 1.25
        ax.text(13.0, y, d, fontsize=12.5, va='center')
        ax.text(18.7, y, c, fontsize=10, va='center', ha='right', color=MAU['xam'])
    luu(fig, D + 'bai7-thu-tu.svg')


ALL += [bai7_thu_tu]


# ---------------- Bài 8 ----------------
def bai8_uoc_boi():
    fig, ax = khung(9.6, 4.8); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 9.6)
    u = 0.55
    ax.text(0.3, 9.0, 'Xếp 12 ô vuông thành hình chữ nhật', fontsize=12, weight='bold', color=MAU['xanh'])
    cach = [(1, 12, 0.4, 6.6), (2, 6, 8.3, 6.0), (3, 4, 13.3, 5.5)]
    for (r, c, x0, y0) in cach:
        for i in range(c):
            for j in range(r):
                ax.add_patch(Rectangle((x0 + i * u, y0 + j * u), u, u, fc='#e3eefc', ec=MAU['lam'], lw=1.3))
        ax.text(x0 + c * u / 2, y0 - 0.45, '%d · %d = 12' % (r, c), ha='center', va='center', fontsize=11, color=MAU['den'])
    ax.text(16.4, 6.6, '', fontsize=1)
    ax.text(9.6, 4.55, 'Ư(12) = {1; 2; 3; 4; 6; 12}', ha='center', fontsize=12.5, weight='bold', color=MAU['lam'])
    # bội của 4 trên tia số
    f = tia_so(ax, 0.6, 18.6, 1.9, 21, buoc=0.82, co=9.5)
    for v in range(0, 21, 4):
        ax.plot(f(v), 1.9, 'o', color=MAU['do'], ms=7, zorder=5)
        if v:
            nhay(ax, f(v - 4), f(v), 1.9, MAU['do'], '+4', co=9.5, w=1.6)
    ax.text(18.6, 0.45, 'B(4) = {0; 4; 8; 12; 16; 20; …}', ha='right', fontsize=12, weight='bold', color=MAU['do'])
    luu(fig, D + 'bai8-uoc-boi.svg')


ALL += [bai8_uoc_boi]

# ---------------- Bài 9 ----------------
def rai_so(ax, ds, co=12, mau=None):
    for (x, y, t) in ds:
        ax.text(x, y, t, ha='center', va='center', fontsize=co, color=mau or MAU['den'])


def bai9_dau_hieu():
    fig, ax = khung(9.8, 4.4); trong(ax)
    ax.set_xlim(0, 19.6); ax.set_ylim(0, 8.8)
    # Venn 2 và 5
    ax.add_patch(Circle((3.4, 4.6), 2.6, fc='#e3eefc', ec=MAU['lam'], lw=2, alpha=0.85))
    ax.add_patch(Circle((6.6, 4.6), 2.6, fc='#fdf0dc', ec=MAU['cam'], lw=2, alpha=0.6))
    ax.text(2.2, 7.75, 'chia hết cho 2', ha='center', fontsize=11, weight='bold', color=MAU['lam'])
    ax.text(7.8, 7.75, 'chia hết cho 5', ha='center', fontsize=11, weight='bold', color=MAU['cam'])
    rai_so(ax, [(2.0, 5.6, '14'), (2.1, 4.4, '36'), (2.4, 3.2, '58')])
    rai_so(ax, [(5.0, 5.4, '20'), (5.0, 4.4, '70'), (5.0, 3.4, '130')], mau=MAU['do'])
    rai_so(ax, [(7.8, 5.6, '15'), (7.9, 4.4, '45'), (7.6, 3.2, '95')])
    rai_so(ax, [(0.6, 1.4, '21'), (9.4, 1.4, '33')], mau=MAU['xam'])
    ax.text(5.0, 1.45, 'Phần chung: tận cùng là 0', ha='center', fontsize=10.5, color=MAU['do'])
    ax.text(5.0, 0.6, 'Cho 2: tận cùng 0; 2; 4; 6; 8.  Cho 5: tận cùng 0; 5.', ha='center', fontsize=10, color=MAU['den'])
    # 3 và 9
    ax.add_patch(Circle((14.9, 4.7), 3.0, fc='#eef7e6', ec=MAU['la'], lw=2))
    ax.add_patch(Circle((15.9, 4.2), 1.6, fc='#efe7fb', ec=MAU['tim'], lw=2))
    ax.text(13.0, 8.15, 'chia hết cho 3', ha='center', fontsize=11, weight='bold', color=MAU['la'])
    ax.text(15.9, 6.3, 'chia hết cho 9', ha='center', fontsize=10, weight='bold', color=MAU['tim'])
    rai_so(ax, [(15.4, 4.95, '18'), (16.5, 4.6, '54'), (15.7, 3.5, '81')], mau=MAU['tim'])
    rai_so(ax, [(13.1, 5.6, '12'), (12.9, 4.3, '21'), (13.6, 3.0, '48')])
    rai_so(ax, [(11.2, 1.4, '25'), (18.6, 1.4, '41')], mau=MAU['xam'])
    ax.text(14.9, 0.6, 'Tổng các chữ số chia hết cho 3 (cho 9)\nthì số đó chia hết cho 3 (cho 9).', ha='center', va='center', fontsize=10, color=MAU['den'], linespacing=1.3)
    ax.plot([10.2, 10.2], [0.2, 8.4], color=MAU['nhat'], lw=2)
    luu(fig, D + 'bai9-dau-hieu.svg')


ALL += [bai9_dau_hieu]


# ---------------- Bài 10 ----------------
def bai10_phan_tich():
    fig, ax = khung(9.6, 4.6); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 9.2)
    ax.text(0.3, 8.6, 'Sơ đồ cây', fontsize=12, weight='bold', color=MAU['xanh'])
    nut = [('180', 4.4, 7.6, False), ('2', 2.8, 6.2, True), ('90', 6.0, 6.2, False), ('2', 4.4, 4.8, True), ('45', 7.6, 4.8, False),
           ('3', 6.0, 3.4, True), ('15', 9.2, 3.4, False), ('3', 7.6, 2.0, True), ('5', 10.8, 2.0, True)]
    canh = [(0, 1), (0, 2), (2, 3), (2, 4), (4, 5), (4, 6), (6, 7), (6, 8)]
    for a, b in canh:
        ax.plot([nut[a][1], nut[b][1]], [nut[a][2] - 0.35, nut[b][2] + 0.35], color=MAU['xam'], lw=1.6)
    for (t, x, y, nt) in nut:
        if nt:
            ax.add_patch(Circle((x, y), 0.42, fc='#fde8ec', ec=MAU['do'], lw=1.8))
        ax.text(x, y, t, ha='center', va='center', fontsize=13, weight='bold', color=MAU['do'] if nt else MAU['den'])
    ax.text(5.8, 0.6, '180 = 2 · 2 · 3 · 3 · 5 = 2² · 3² · 5', ha='center', fontsize=12.5, weight='bold', color=MAU['xanh'])
    # theo cột dọc
    ax.text(13.2, 8.6, 'Sơ đồ cột', fontsize=12, weight='bold', color=MAU['xanh'])
    cot = [('180', '2'), ('90', '2'), ('45', '3'), ('15', '3'), ('5', '5'), ('1', '')]
    xv = 15.0
    for i, (a, b) in enumerate(cot):
        y = 7.6 - i * 1.1
        ax.text(xv - 0.35, y, a, ha='right', va='center', fontsize=13)
        ax.text(xv + 0.35, y, b, ha='left', va='center', fontsize=13, weight='bold', color=MAU['do'])
    ax.plot([xv, xv], [8.1, 1.95], color=MAU['den'], lw=1.6)
    ax.text(17.0, 5.4, 'chia lần lượt\ncho các số\nnguyên tố\ntừ nhỏ đến lớn', ha='left', va='center', fontsize=9.5, color=MAU['xam'])
    ax.plot([11.9, 11.9], [0.3, 8.8], color=MAU['nhat'], lw=2)
    luu(fig, D + 'bai10-phan-tich.svg')


def bai10_sang():
    fig, ax = khung(8.4, 4.6); trong(ax)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 9.2)
    def nto(n):
        return n > 1 and all(n % d for d in range(2, int(n ** 0.5) + 1))
    w = 1.5
    for n in range(1, 51):
        r, c = (n - 1) // 10, (n - 1) % 10
        x, y = 0.6 + c * w, 7.4 - r * w
        if nto(n):
            nen, vien, mau = '#fde8ec', MAU['do'], MAU['do']
        elif n == 1:
            nen, vien, mau = '#f2f2f2', MAU['xam'], MAU['xam']
        else:
            nen, vien, mau = 'white', '#c9d3cd', '#9aa59f'
        ax.add_patch(Rectangle((x, y), w, w, fc=nen, ec=vien, lw=1.0))
        ax.text(x + w / 2, y + w / 2, str(n), ha='center', va='center', fontsize=12, color=mau, weight='bold' if nto(n) else 'normal')
    ax.text(0.6, 0.35, 'Ô đỏ: 15 số nguyên tố nhỏ hơn 50. Số 1 không là số nguyên tố, cũng không là hợp số.', fontsize=10, color=MAU['den'])
    luu(fig, D + 'bai10-sang.svg')


ALL += [bai10_phan_tich, bai10_sang]


# ---------------- Bài 11 ----------------
def bai11_uoc_chung():
    fig, ax = khung(8.8, 4.0); trong(ax)
    ax.set_xlim(0, 17.6); ax.set_ylim(0, 8.0)
    ax.add_patch(Ellipse((6.0, 4.0), 7.4, 5.6, fc='#e3eefc', ec=MAU['lam'], lw=2, alpha=0.85))
    ax.add_patch(Ellipse((11.0, 4.0), 7.8, 5.6, fc='#eef7e6', ec=MAU['la'], lw=2, alpha=0.6))
    ax.text(4.0, 7.3, 'Ư(18)', ha='center', fontsize=13, weight='bold', color=MAU['lam'])
    ax.text(13.3, 7.3, 'Ư(30)', ha='center', fontsize=13, weight='bold', color=MAU['la'])
    rai_so(ax, [(4.0, 4.9, '9'), (4.2, 3.1, '18')], co=14)
    rai_so(ax, [(12.9, 5.4, '5'), (13.6, 4.2, '10'), (12.9, 3.0, '15'), (13.8, 1.9, '30')], co=14)
    rai_so(ax, [(7.9, 5.2, '1'), (9.1, 5.2, '2'), (7.9, 4.0, '3')], co=14, mau=MAU['den'])
    ax.add_patch(Circle((9.1, 4.0), 0.42, fc='#fff3cd', ec=MAU['do'], lw=2))
    ax.text(9.1, 4.0, '6', ha='center', va='center', fontsize=14, weight='bold', color=MAU['do'])
    ax.text(8.5, 2.3, 'ƯC(18, 30)', ha='center', fontsize=10.5, color=MAU['xanh'], weight='bold')
    ax.text(8.5, 0.45, 'ƯC(18, 30) = {1; 2; 3; 6};   ƯCLN(18, 30) = 6', ha='center', fontsize=12, color=MAU['do'], weight='bold')
    luu(fig, D + 'bai11-uoc-chung.svg')


ALL += [bai11_uoc_chung]


# ---------------- Bài 12 ----------------
def bai12_boi_chung():
    fig, ax = khung(9.8, 3.9); trong(ax)
    ax.set_xlim(0, 20.2); ax.set_ylim(0, 7.8)
    b = 0.48
    f = tia_so(ax, 1.4, 20.0, 5.2, 36, buoc=b, nhan=False)
    g = tia_so(ax, 1.4, 20.0, 2.2, 36, buoc=b, nhan=False)
    ax.text(0.2, 5.2, 'B(4)', va='center', fontsize=12, weight='bold', color=MAU['lam'])
    ax.text(0.2, 2.2, 'B(6)', va='center', fontsize=12, weight='bold', color=MAU['cam'])
    for v in range(0, 37, 4):
        chung = v % 12 == 0
        ax.plot(f(v), 5.2, 'o', color=MAU['do'] if chung else MAU['lam'], ms=9 if chung else 7, zorder=5)
        ax.text(f(v), 4.6, str(v), ha='center', va='center', fontsize=10.5, color=MAU['do'] if chung else MAU['lam'], weight='bold' if chung else 'normal')
    for v in range(0, 37, 6):
        chung = v % 12 == 0
        ax.plot(g(v), 2.2, 'o', color=MAU['do'] if chung else MAU['cam'], ms=9 if chung else 7, zorder=5)
        ax.text(g(v), 1.6, str(v), ha='center', va='center', fontsize=10.5, color=MAU['do'] if chung else MAU['cam'], weight='bold' if chung else 'normal')
    for v in (12, 24, 36):
        ax.plot([f(v), f(v)], [2.45, 4.95], color=MAU['do'], ls='--', lw=1.3)
    ax.text(f(12), 6.2, 'BCNN(4, 6) = 12', ha='center', fontsize=12, weight='bold', color=MAU['do'])
    ax.text(10.3, 0.45, 'BC(4, 6) = {0; 12; 24; 36; …} – đều là bội của 12', ha='center', fontsize=11.5, color=MAU['xanh'], weight='bold')
    luu(fig, D + 'bai12-boi-chung.svg')


ALL += [bai12_boi_chung]


if __name__ == '__main__':
    for f in ALL:
        f()
    print('Đã vẽ', len(ALL), 'hình Toán 6')
