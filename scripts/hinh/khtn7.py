"""Hình minh họa KHTN 7 (tự vẽ). Chạy: python3 scripts/hinh/khtn7.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bx_hinh import *

D = '7-khtn/'


def chuoi_hop(ax, items, y, w, h, gap, mau_nen, vien, co=10.5, x0=0.3):
    """Vẽ một dãy hộp nối bằng mũi tên theo hàng ngang; trả về danh sách tâm."""
    xs = []
    for i, t in enumerate(items):
        x = x0 + i * (w + gap)
        hop(ax, x, y, w, h, t, mau=mau_nen if isinstance(mau_nen, str) else mau_nen[i], vien=vien if isinstance(vien, str) else vien[i], co=co)
        if i:
            mui_ten(ax, (x - gap + 0.05, y + h / 2), (x - 0.05, y + h / 2), MAU['xam'], 1.6)
        xs.append(x + w / 2)
    return xs


def pp_tim_hieu():
    fig, ax = khung(9.8, 3.8); trong(ax)
    ax.set_xlim(0, 19.8); ax.set_ylim(0, 7.6)
    buoc = ['1. Đề xuất\nvấn đề', '2. Đưa ra\ndự đoán', '3. Lập\nkế hoạch', '4. Thực hiện\nkế hoạch', '5. Viết báo cáo,\nthảo luận']
    nen = ['#e3eefc', '#fdf0dc', '#e8f4dc', '#fde9ec', '#efe7fb']
    vien = [MAU['lam'], MAU['cam'], MAU['la'], MAU['do'], MAU['tim']]
    xs = chuoi_hop(ax, buoc, 4.0, 3.4, 1.9, 0.6, nen, vien, co=10.5, x0=0.2)
    vd = ['Hạt đậu có cần\nnước để nảy mầm?', 'Không có nước,\nhạt không nảy mầm', '2 cốc bông ẩm/khô,\ncùng số hạt, cùng chỗ', 'Theo dõi 5 ngày,\nghi số hạt nảy mầm', 'Cốc ẩm nảy mầm,\ncốc khô không ⇒ đúng']
    for x, t in zip(xs, vd):
        ax.text(x, 2.6, t, ha='center', va='center', fontsize=9.4, color=MAU['den'], linespacing=1.4)
    ax.annotate('', xy=(xs[1], 6.1), xytext=(xs[4], 6.1), arrowprops=dict(arrowstyle='->', color=MAU['xam'], lw=1.4, ls='--', connectionstyle='arc3,rad=0.18'))
    ax.text((xs[1] + xs[4]) / 2, 7.15, 'nếu kết quả khác dự đoán: sửa dự đoán, làm lại', ha='center', fontsize=9.5, color=MAU['xam'])
    ax.text(9.9, 0.7, 'Ví dụ áp dụng ở hàng dưới', ha='center', fontsize=9.5, color=MAU['xam'], style='italic')
    luu(fig, D + 'pp-tim-hieu.svg')


def nguyen_tu_bohr():
    fig, ax = khung(8.4, 4.2); trong(ax)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 9.4)
    def mo_hinh(cx, cy, lop, p, n, ten):
        r0 = 1.0
        for i, ne in enumerate(lop):
            r = r0 + 0.95 * (i + 1)
            ax.add_patch(Circle((cx, cy), r, fc='none', ec=MAU['xam'], lw=1.1, ls='--'))
            for k in range(ne):
                a = np.pi / 2 + 2 * np.pi * k / ne
                ax.add_patch(Circle((cx + r * np.cos(a), cy + r * np.sin(a)), 0.2, fc=MAU['lam'], ec='white', lw=0.8))
        ax.add_patch(Circle((cx, cy), 0.72, fc='#f6c9d2', ec=MAU['do'], lw=1.5))
        ax.text(cx, cy + 0.17, '%dp' % p, ha='center', va='center', fontsize=10, color=MAU['do'], weight='bold')
        ax.text(cx, cy - 0.25, '%dn' % n, ha='center', va='center', fontsize=9.5, color=MAU['xam'])
        ax.text(cx, 0.25, ten, ha='center', fontsize=11.5, weight='bold', color=MAU['xanh'])
    mo_hinh(4.0, 4.4, [2, 6], 8, 8, 'Oxygen (O): 2 – 6')
    mo_hinh(12.4, 4.6, [2, 8, 1], 11, 12, 'Sodium (Na): 2 – 8 – 1')
    ax.add_patch(Circle((0.4, 9.0), 0.2, fc=MAU['lam'], ec='white')); ax.text(0.75, 9.0, 'electron (−)', va='center', fontsize=10)
    ax.add_patch(Circle((0.4, 8.45), 0.2, fc='#f6c9d2', ec=MAU['do'])); ax.text(0.75, 8.45, 'hạt nhân: proton (+), neutron', va='center', fontsize=10)
    luu(fig, D + 'nguyen-tu-bohr.svg')


def nguyen_to():
    fig, ax = khung(9.0, 3.6); trong(ax)
    ax.set_xlim(0, 18); ax.set_ylim(0, 7.2)
    ds = [('H', 'hydrogen', 1, '1'), ('C', 'carbon', 6, '12'), ('N', 'nitrogen', 7, '14'), ('O', 'oxygen', 8, '16'), ('Na', 'sodium', 11, '23'), ('Mg', 'magnesium', 12, '24'),
          ('Al', 'aluminium', 13, '27'), ('S', 'sulfur', 16, '32'), ('Cl', 'chlorine', 17, '35,5'), ('K', 'potassium', 19, '39'), ('Ca', 'calcium', 20, '40'), ('Fe', 'iron (sắt)', 26, '56')]
    kl = {'Na', 'Mg', 'Al', 'K', 'Ca', 'Fe'}
    for i, (k, t, z, m) in enumerate(ds):
        x = 0.25 + (i % 6) * 2.95; y = 3.75 if i < 6 else 0.35
        kim = k in kl
        ax.add_patch(FancyBboxPatch((x, y), 2.7, 3.0, boxstyle='round,pad=0,rounding_size=0.25', fc='#e3eefc' if kim else '#fdf0dc', ec=MAU['lam'] if kim else MAU['cam'], lw=1.5))
        ax.text(x + 0.2, y + 2.6, str(z), fontsize=10, va='center', color=MAU['den'])
        ax.text(x + 1.35, y + 1.6, k, fontsize=21, ha='center', va='center', weight='bold', color=MAU['lam'] if kim else MAU['cam'])
        ax.text(x + 1.35, y + 0.75, t, fontsize=9.2, ha='center', va='center')
        ax.text(x + 1.35, y + 0.28, m + ' amu', fontsize=8.8, ha='center', va='center', color=MAU['xam'])
    luu(fig, D + 'nguyen-to.svg')


def bang_tuan_hoan():
    fig, ax = khung(9.4, 4.0); trong(ax)
    ax.set_xlim(-0.6, 17.4); ax.set_ylim(-1.2, 7.6)
    ten = {1: 'H', 2: 'He', 3: 'Li', 4: 'Be', 5: 'B', 6: 'C', 7: 'N', 8: 'O', 9: 'F', 10: 'Ne', 11: 'Na', 12: 'Mg', 13: 'Al', 14: 'Si', 15: 'P', 16: 'S', 17: 'Cl', 18: 'Ar', 19: 'K', 20: 'Ca'}
    pos = {1: (0, 0), 2: (7, 0), 19: (0, 3), 20: (1, 3)}
    for z in range(3, 11): pos[z] = ([0, 1, 2, 3, 4, 5, 6, 7][z - 3], 1)
    for z in range(11, 19): pos[z] = ([0, 1, 2, 3, 4, 5, 6, 7][z - 11], 2)
    kim = {3, 4, 11, 12, 13, 19, 20}; hiem = {2, 10, 18}; ban = {5, 14}
    W = 2.05; H = 1.6
    for z, (c, r) in pos.items():
        x = c * W; y = 5.6 - r * H
        fc, ec = ('#e3eefc', MAU['lam']) if z in kim else ('#efe7fb', MAU['tim']) if z in hiem else ('#eeeeee', MAU['xam']) if z in ban else ('#fdf0dc', MAU['cam'])
        ax.add_patch(FancyBboxPatch((x, y), W - 0.15, H - 0.15, boxstyle='round,pad=0,rounding_size=0.15', fc=fc, ec=ec, lw=1.3))
        ax.text(x + 0.15, y + 1.18, str(z), fontsize=8.5)
        ax.text(x + (W - 0.15) / 2, y + 0.55, ten[z], fontsize=14, ha='center', va='center', weight='bold')
    for r in range(4): ax.text(-0.45, 5.6 - r * H + 0.7, str(r + 1), fontsize=10.5, ha='center', va='center', color=MAU['xanh'], weight='bold')
    for c, g in enumerate(['IA', 'IIA', 'IIIA', 'IVA', 'VA', 'VIA', 'VIIA', 'VIIIA']):
        ax.text(c * W + 0.95, 7.35, g, fontsize=10, ha='center', color=MAU['xanh'], weight='bold')
    ax.text(-0.45, 7.35, 'Chu kì', fontsize=8.5, ha='center', color=MAU['xanh'])
    for i, (t, fc, ec) in enumerate([('Kim loại', '#e3eefc', MAU['lam']), ('Phi kim', '#fdf0dc', MAU['cam']), ('Khí hiếm', '#efe7fb', MAU['tim']), ('B, Si: á kim', '#eeeeee', MAU['xam'])]):
        ax.add_patch(Rectangle((0.2 + i * 4.2, -1.0), 0.6, 0.5, fc=fc, ec=ec)); ax.text(0.95 + i * 4.2, -0.75, t, fontsize=10, va='center')
    luu(fig, D + 'bang-tuan-hoan.svg')


def phan_tu():
    fig, ax = khung(9.2, 3.4); trong(ax)
    ax.set_xlim(0, 18.4); ax.set_ylim(0, 6.8)
    H = dict(fc='#e9eef7', ec=MAU['lam'], lw=1.5); O = dict(fc=MAU['do'], ec='#8f2338', lw=1.5); C = dict(fc='#4a4a4a', ec='#222', lw=1.5)
    def ng(x, y, r, st, t, mau='black'):
        ax.add_patch(Circle((x, y), r, **st)); ax.text(x, y, t, ha='center', va='center', fontsize=10.5, color=mau, weight='bold')
    ng(1.6, 4.0, 0.5, H, 'H'); ng(2.5, 4.0, 0.5, H, 'H')
    ng(5.6, 4.0, 0.65, O, 'O', 'white'); ng(6.75, 4.0, 0.65, O, 'O', 'white')
    ng(11.0, 4.25, 0.7, O, 'O', 'white'); ng(10.05, 3.55, 0.5, H, 'H'); ng(11.95, 3.55, 0.5, H, 'H')
    ng(15.9, 4.0, 0.62, C, 'C', 'white'); ng(14.75, 4.0, 0.65, O, 'O', 'white'); ng(17.05, 4.0, 0.65, O, 'O', 'white')
    for x, t1, t2 in [(2.05, 'H₂', '2 amu'), (6.2, 'O₂', '32 amu'), (11.0, 'H₂O', '18 amu'), (15.9, 'CO₂', '44 amu')]:
        ax.text(x, 2.2, t1, ha='center', fontsize=14, weight='bold'); ax.text(x, 1.5, t2, ha='center', fontsize=10, color=MAU['xam'])
    ax.plot([0.4, 8.2], [5.6, 5.6], color=MAU['la'], lw=2.5); ax.text(4.3, 6.0, 'ĐƠN CHẤT (1 nguyên tố)', ha='center', fontsize=11.5, color=MAU['la'], weight='bold')
    ax.plot([9.2, 18.2], [5.6, 5.6], color=MAU['tim'], lw=2.5); ax.text(13.7, 6.0, 'HỢP CHẤT (≥ 2 nguyên tố)', ha='center', fontsize=11.5, color=MAU['tim'], weight='bold')
    ax.plot([8.7, 8.7], [0.6, 6.4], color=MAU['xam'], lw=1, ls=':')
    luu(fig, D + 'phan-tu.svg')


def lien_ket_ion():
    fig, ax = khung(10.4, 3.8); trong(ax)
    ax.set_xlim(0, 22); ax.set_ylim(0, 7.6)
    def vo(cx, cy, lop, nhan, mau_nhan, mau_e='#1f4fbf', them=None):
        for i, ne in enumerate(lop):
            r = 0.75 + 0.6 * (i + 1)
            ax.add_patch(Circle((cx, cy), r, fc='none', ec=MAU['xam'], lw=1, ls='--'))
            for k in range(ne):
                a = np.pi / 2 + 2 * np.pi * k / max(ne, 1)
                col = MAU['cam'] if (them is not None and i == len(lop) - 1 and k == them) else mau_e
                ax.add_patch(Circle((cx + r * np.cos(a), cy + r * np.sin(a)), 0.15, fc=col, ec='white', lw=0.6))
        ax.add_patch(Circle((cx, cy), 0.55, fc=mau_nhan, ec='white'))
        ax.text(cx, cy, nhan, ha='center', va='center', fontsize=9.5, color='white', weight='bold')
    vo(2.8, 4.4, [2, 8, 1], '11+', MAU['lam'], them=0)
    vo(8.4, 4.4, [2, 8, 7], '17+', MAU['la'])
    ax.annotate('', xy=(7.0, 6.6), xytext=(2.85, 6.75), arrowprops=dict(arrowstyle='->', color=MAU['cam'], lw=2, connectionstyle='arc3,rad=-0.3'))
    ax.text(4.9, 7.25, 'nhường 1e', ha='center', fontsize=10.5, color=MAU['cam'], weight='bold')
    ax.text(2.8, 1.3, 'Na (2 – 8 – 1)', ha='center', fontsize=11); ax.text(8.4, 1.3, 'Cl (2 – 8 – 7)', ha='center', fontsize=11)
    mui_ten(ax, (11.1, 4.4), (12.3, 4.4), MAU['xanh'], 2.4)
    vo(14.4, 4.4, [2, 8], '11+', MAU['lam'])
    vo(19.2, 4.4, [2, 8, 8], '17+', MAU['la'], them=0)
    ax.text(14.4, 1.3, 'Na⁺ (2 – 8)', ha='center', fontsize=11, weight='bold', color=MAU['lam'])
    ax.text(19.2, 1.3, 'Cl⁻ (2 – 8 – 8)', ha='center', fontsize=11, weight='bold', color=MAU['la'])
    ax.text(16.8, 0.45, 'hút nhau ⇒ liên kết ion trong NaCl', ha='center', fontsize=10.5, color=MAU['xanh'])
    luu(fig, D + 'lien-ket-ion.svg')


def quy_tac_hoa_tri():
    fig, ax = khung(8.0, 3.4); trong(ax)
    ax.set_xlim(0, 16); ax.set_ylim(0, 6.8)
    ax.text(3.0, 5.3, 'III', ha='center', fontsize=15, color=MAU['do'], weight='bold')
    ax.text(5.6, 5.3, 'II', ha='center', fontsize=15, color=MAU['lam'], weight='bold')
    ax.text(3.0, 3.6, 'Al', ha='center', fontsize=30, weight='bold'); ax.text(5.6, 3.6, 'O', ha='center', fontsize=30, weight='bold')
    ax.text(3.95, 3.1, 'x', fontsize=15, style='italic'); ax.text(6.45, 3.1, 'y', fontsize=15, style='italic')
    ax.annotate('', xy=(6.5, 3.35), xytext=(3.3, 5.2), arrowprops=dict(arrowstyle='->', color=MAU['do'], lw=1.8))
    ax.annotate('', xy=(4.0, 3.35), xytext=(5.4, 5.2), arrowprops=dict(arrowstyle='->', color=MAU['lam'], lw=1.8))
    ax.text(4.3, 1.6, 'III · x = II · y', ha='center', fontsize=14, color=MAU['xanh'], weight='bold')
    ax.text(4.3, 0.7, 'x : y = 2 : 3', ha='center', fontsize=13)
    mui_ten(ax, (8.0, 3.8), (9.6, 3.8), MAU['xanh'], 2.4)
    ax.text(12.6, 3.7, 'Al₂O₃', ha='center', va='center', fontsize=32, weight='bold', color=MAU['xanh'])
    ax.text(12.6, 1.8, 'Kiểm tra: III · 2 = II · 3 = 6 ✓', ha='center', fontsize=11.5, color=MAU['la'])
    luu(fig, D + 'quy-tac-hoa-tri.svg')


ALL = [pp_tim_hieu, nguyen_tu_bohr, nguyen_to, bang_tuan_hoan, phan_tu, lien_ket_ion, quy_tac_hoa_tri]

if __name__ == '__main__':
    for f in ALL:
        f()
