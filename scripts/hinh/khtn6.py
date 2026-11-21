"""Hình minh họa KHTN 6 (tự vẽ). Chạy: python3 scripts/hinh/khtn6.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bx_hinh import *

D = '6-khtn/'
ALL = []


def linh_vuc_khtn():
    fig, ax = khung(9.6, 3.6); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 7.2)
    hop(ax, 6.6, 5.4, 6.0, 1.4, 'KHOA HỌC TỰ NHIÊN', mau='#e8f4ec', vien=MAU['xanh'], co=13, chu_mau=MAU['xanh'])
    items = [('Vật lí học', 'lực, chuyển động,\nánh sáng, âm, điện', '#e3eefc', MAU['lam']), ('Hóa học', 'chất và sự\nbiến đổi của chất', '#fdf0dc', MAU['cam']),
             ('Sinh học', 'vật sống và\nhoạt động sống', '#eef7e6', MAU['la']), ('KH Trái Đất', 'đất, nước, khí\nquyển, thời tiết', '#f3ece2', '#8a5a2b'), ('Thiên văn học', 'Mặt Trời, Mặt Trăng,\nsao, vũ trụ', '#efe7fb', MAU['tim'])]
    for i, (t, m, nen, vien) in enumerate(items):
        x = 0.2 + i * 3.8
        hop(ax, x, 0.3, 3.5, 3.6, '', mau=nen, vien=vien)
        ax.text(x + 1.75, 3.25, t, ha='center', fontsize=11.5, weight='bold', color=vien)
        ax.text(x + 1.75, 1.7, m, ha='center', va='center', fontsize=9.0, linespacing=1.4)
        mui_ten(ax, (9.6, 5.35), (x + 1.75, 3.95), vien, 1.6)
    luu(fig, D + 'linh-vuc-khtn.svg')


def bien_canh_bao():
    fig, ax = khung(9.0, 3.4); trong(ax)
    ax.set_xlim(0, 18); ax.set_ylim(0, 6.8)
    # canh bao
    ax.add_patch(Polygon([[1.0, 2.0], [4.0, 2.0], [2.5, 4.6]], fc='#ffd54a', ec='#111', lw=3, joinstyle='round'))
    ax.text(2.5, 2.75, '!', ha='center', va='center', fontsize=26, weight='bold')
    ax.add_patch(Polygon([[4.6, 2.0], [7.6, 2.0], [6.1, 4.6]], fc='#ffd54a', ec='#111', lw=3, joinstyle='round'))
    ax.add_patch(Polygon([[6.25, 4.0], [5.75, 3.0], [6.15, 3.0], [5.9, 2.3], [6.55, 3.25], [6.15, 3.25]], fc='#111'))
    ax.text(4.3, 0.5, 'CẢNH BÁO\n(tam giác, nền vàng)', ha='center', fontsize=11, weight='bold', color='#8a6a00', linespacing=1.3)
    # cam
    ax.add_patch(Circle((10.0, 3.4), 1.25, fc='white', ec='#d32f2f', lw=5))
    ax.add_patch(Polygon([[10.0, 4.2], [9.55, 3.2], [9.75, 2.7], [10.25, 2.7], [10.45, 3.2]], fc='#ff8a00', ec='#c55'))
    ax.plot([9.15, 10.85], [2.55, 4.25], color='#d32f2f', lw=5)
    ax.text(10.0, 0.5, 'CẤM\n(tròn, viền đỏ)', ha='center', fontsize=11, weight='bold', color='#b71c1c', linespacing=1.3)
    # bat buoc
    ax.add_patch(Circle((15.2, 3.4), 1.25, fc='#1e64c8', ec='#0d3f8a', lw=2))
    ax.add_patch(FancyBboxPatch((14.75, 2.55), 0.9, 1.1, boxstyle='round,pad=0,rounding_size=0.2', fc='white', ec='none'))
    for k in range(4): ax.add_patch(FancyBboxPatch((14.75 + k * 0.23, 3.5), 0.18, 0.55, boxstyle='round,pad=0,rounding_size=0.08', fc='white', ec='none'))
    ax.add_patch(FancyBboxPatch((14.45, 3.0), 0.35, 0.6, boxstyle='round,pad=0,rounding_size=0.12', fc='white', ec='none', transform=ax.transData))
    ax.text(15.2, 0.5, 'BẮT BUỘC\n(tròn, nền xanh)', ha='center', fontsize=11, weight='bold', color='#0d3f8a', linespacing=1.3)
    ax.text(15.2, 5.2, 'đeo găng tay', ha='center', fontsize=9.5, color=MAU['xam'])
    ax.text(10.0, 5.2, 'cấm lửa', ha='center', fontsize=9.5, color=MAU['xam'])
    ax.text(2.5, 5.2, 'nguy hiểm', ha='center', fontsize=9.5, color=MAU['xam']); ax.text(6.1, 5.2, 'điện cao thế', ha='center', fontsize=9.5, color=MAU['xam'])
    luu(fig, D + 'bien-canh-bao.svg')


def kinh_lup():
    fig, ax = khung(8.4, 3.4); trong(ax)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 6.8)
    ax.add_patch(Circle((3.0, 4.2), 1.6, fc='#dff0fb', ec='#333', lw=5))
    ax.plot([4.15, 6.0], [3.05, 1.2], color='#5a3d1a', lw=10, solid_capstyle='round')
    ax.annotate('mặt kính lồi', xy=(2.6, 4.6), xytext=(0.2, 6.5), fontsize=10.5, arrowprops=dict(arrowstyle='-', color=MAU['xam']))
    ax.annotate('khung', xy=(4.4, 4.9), xytext=(5.4, 6.2), fontsize=10.5, arrowprops=dict(arrowstyle='-', color=MAU['xam']))
    ax.annotate('tay cầm', xy=(5.4, 1.8), xytext=(6.3, 2.6), fontsize=10.5, arrowprops=dict(arrowstyle='-', color=MAU['xam']))
    # cach dung
    ax.add_patch(Rectangle((8.6, 0.6), 7.6, 0.25, fc='#c9b18a', ec='none'))
    ax.add_patch(Ellipse((12.6, 1.05), 0.7, 0.3, fc='#3a2a1a'))
    ax.plot([12.35, 12.15], [1.0, 0.85], color='#3a2a1a', lw=1); ax.plot([12.85, 13.05], [1.0, 0.85], color='#3a2a1a', lw=1)
    ax.add_patch(Ellipse((12.6, 3.0), 2.6, 0.45, fc='#dff0fb', ec='#333', lw=2.5))
    ax.plot([13.9, 15.6], [3.0, 3.6], color='#5a3d1a', lw=6, solid_capstyle='round')
    ax.add_patch(Ellipse((12.6, 5.9), 1.0, 0.5, fc='white', ec='#333', lw=1.5)); ax.add_patch(Circle((12.6, 5.9), 0.17, fc='#333'))
    ax.plot([12.6, 12.6], [5.6, 3.3], color=MAU['xam'], lw=1, ls='--')
    ax.annotate('', xy=(10.6, 3.6), xytext=(10.6, 2.0), arrowprops=dict(arrowstyle='<->', color=MAU['do'], lw=1.6))
    ax.text(10.4, 2.8, 'đưa kính\nra xa dần', ha='right', va='center', fontsize=9.8, color=MAU['do'])
    ax.text(13.3, 1.5, 'vật nhỏ', fontsize=9.5)
    ax.text(13.3, 5.85, 'mắt', fontsize=9.5)
    luu(fig, D + 'kinh-lup.svg')


def kinh_hien_vi():
    fig, ax = khung(7.6, 5.0); trong(ax)
    ax.set_xlim(0, 15.2); ax.set_ylim(0, 10)
    ax.add_patch(FancyBboxPatch((4.2, 0.5), 5.0, 0.8, boxstyle='round,pad=0,rounding_size=0.3', fc='#3d4f5c', ec='#222'))
    ax.add_patch(Polygon([[8.0, 1.3], [8.8, 1.3], [8.8, 7.0], [7.6, 8.0], [7.0, 7.4], [8.0, 6.5]], fc='#4f6575', ec='#222'))
    ax.add_patch(Polygon([[5.6, 6.7], [6.4, 6.7], [7.4, 9.2], [6.6, 9.4]], fc='#5c7384', ec='#222'))
    ax.add_patch(Rectangle((6.6, 9.2), 1.0, 0.5, angle=-22, fc='#2b3a44', ec='#222'))
    ax.add_patch(Polygon([[5.2, 6.7], [7.4, 6.7], [7.0, 6.2], [5.6, 6.2]], fc='#6f8797', ec='#222'))
    for dx in (-0.6, 0.0, 0.6): ax.add_patch(Rectangle((6.2 + dx - 0.13, 5.4), 0.26, 0.8, fc='#c0c8cc', ec='#333'))
    ax.add_patch(Rectangle((3.8, 4.3), 5.0, 0.35, fc='#2b3a44', ec='#222'))
    ax.add_patch(Rectangle((5.4, 4.65), 1.6, 0.12, fc='#e3f1fb', ec='#5a7a9a'))
    ax.plot([4.1, 5.5], [4.8, 4.75], color='#999', lw=2)
    ax.add_patch(Circle((6.2, 2.0), 0.45, fc='#fff7c2', ec='#c9a227', lw=1.6))
    ax.add_patch(Circle((9.15, 3.4), 0.55, fc='#8899a6', ec='#222')); ax.add_patch(Circle((9.1, 2.3), 0.35, fc='#a7b6c0', ec='#222'))
    lab = [((7.0, 9.5), (10.6, 9.4), 'thị kính'), ((6.4, 7.6), (10.6, 8.3), 'ống kính'), ((6.4, 6.5), (0.3, 7.6), 'đĩa quay'), ((5.6, 5.8), (0.3, 6.3), 'vật kính'),
           ((5.8, 4.7), (0.3, 5.0), 'kẹp, tiêu bản'), ((4.2, 4.45), (0.3, 3.9), 'bàn kính'), ((6.2, 2.0), (0.3, 2.3), 'đèn chiếu sáng'), ((9.6, 3.5), (10.6, 4.4), 'ốc to (chỉnh thô)'),
           ((9.4, 2.2), (10.6, 2.7), 'ốc nhỏ (chỉnh tinh)'), ((8.6, 5.2), (10.6, 6.2), 'thân kính'), ((7.0, 0.8), (10.6, 0.8), 'chân kính')]
    for xy, xt, t in lab:
        ax.annotate(t, xy=xy, xytext=xt, fontsize=10.2, va='center', arrowprops=dict(arrowstyle='-', color=MAU['xam'], lw=0.9))
    luu(fig, D + 'kinh-hien-vi.svg')


def do_chieu_dai():
    fig, ax = khung(8.8, 3.0); trong(ax)
    ax.set_xlim(-0.6, 17); ax.set_ylim(0, 6)
    ax.add_patch(Rectangle((0, 1.0), 16.0, 1.4, fc='#fff3c4', ec='#a8913a', lw=1.5))
    for k in range(0, 161):
        x = k * 0.1; hh = 0.6 if k % 10 == 0 else (0.42 if k % 5 == 0 else 0.25)
        ax.plot([x, x], [2.4, 2.4 - hh], color='#333', lw=0.8 if k % 10 else 1.2)
        if k % 10 == 0: ax.text(x, 1.3, str(k // 10), ha='center', fontsize=9)
    ax.text(16.25, 1.75, 'cm', fontsize=9)
    ax.add_patch(Rectangle((0, 2.45), 12.7, 0.5, fc='#e9c46a', ec='#8a6a10'))
    ax.add_patch(Polygon([[12.7, 2.45], [13.6, 2.7], [12.7, 2.95]], fc='#f4dcb0', ec='#8a6a10')); ax.add_patch(Polygon([[13.3, 2.62], [13.6, 2.7], [13.3, 2.78]], fc='#333'))
    ax.plot([0, 0], [2.4, 3.3], color=MAU['do'], lw=1.5, ls='--'); ax.text(0, 3.5, 'vạch 0', ha='center', fontsize=9.6, color=MAU['do'])
    ax.add_patch(Ellipse((13.6, 5.2), 0.9, 0.5, fc='white', ec='#333')); ax.add_patch(Circle((13.6, 5.2), 0.16, fc='#333'))
    ax.plot([13.6, 13.6], [4.9, 2.9], color=MAU['xanh'], lw=1.3, ls='--')
    ax.text(14.2, 4.1, 'mắt nhìn\nvuông góc', fontsize=9.6, color=MAU['xanh'])
    ax.add_patch(Ellipse((10.6, 5.2), 0.9, 0.5, fc='white', ec='#bbb')); ax.add_patch(Circle((10.6, 5.2), 0.16, fc='#bbb'))
    ax.plot([10.6, 13.5], [4.95, 2.95], color='#bbb', lw=1.2, ls=':')
    ax.text(8.0, 5.2, 'nhìn xiên ✗', fontsize=9.6, color='#999', va='center')
    ax.text(6.0, 0.4, 'Chiều dài bút chì ≈ 13,6 cm (ĐCNN 1 mm)', ha='center', fontsize=10.5, weight='bold', color=MAU['xanh'])
    luu(fig, D + 'do-chieu-dai.svg')


def can_dong_ho():
    fig, ax = khung(6.6, 4.0); trong(ax)
    ax.set_xlim(0, 13.2); ax.set_ylim(0, 8)
    ax.add_patch(Ellipse((4.6, 7.3), 5.2, 0.6, fc='#c0c8cc', ec='#555'))
    ax.add_patch(Rectangle((4.2, 6.2), 0.8, 1.0, fc='#9aa5ab', ec='#555'))
    ax.add_patch(FancyBboxPatch((1.4, 0.5), 6.4, 5.8, boxstyle='round,pad=0,rounding_size=0.6', fc='#d64545', ec='#8a2020', lw=2))
    ax.add_patch(Circle((4.6, 3.4), 2.5, fc='white', ec='#333', lw=1.5))
    for k in range(0, 51):
        a = np.radians(90 - k * 360 / 50)
        r1 = 2.05 if k % 5 == 0 else 2.25
        ax.plot([4.6 + r1 * np.cos(a), 4.6 + 2.4 * np.cos(a)], [3.4 + r1 * np.sin(a), 3.4 + 2.4 * np.sin(a)], color='#333', lw=1.2 if k % 5 == 0 else 0.6)
        if k % 10 == 0 and k < 50: ax.text(4.6 + 1.7 * np.cos(a), 3.4 + 1.7 * np.sin(a), str(k // 10), ha='center', va='center', fontsize=10, weight='bold')
    a = np.radians(90 - 1.6 * 72); ax.plot([4.6, 4.6 + 2.0 * np.cos(a)], [3.4, 3.4 + 2.0 * np.sin(a)], color=MAU['do'], lw=2.4); ax.add_patch(Circle((4.6, 3.4), 0.14, fc='#333'))
    ax.text(4.6, 2.5, 'kg', ha='center', fontsize=9.5)
    ax.text(8.6, 6.0, 'GHĐ: 5 kg', fontsize=11.5, weight='bold', color=MAU['xanh'])
    ax.text(8.6, 4.9, 'ĐCNN: 0,1 kg', fontsize=11.5, weight='bold', color=MAU['xanh'])
    ax.text(8.6, 3.6, '(giữa 2 số liền nhau\ncó 10 khoảng chia)', fontsize=9.6, color=MAU['xam'], linespacing=1.3)
    ax.text(8.6, 2.0, 'Kim chỉ: 1,6 kg', fontsize=11.5, color=MAU['do'], weight='bold')
    luu(fig, D + 'can-dong-ho.svg')


def dong_ho_bam_giay():
    fig, ax = khung(6.6, 3.8); trong(ax)
    ax.set_xlim(0, 13.2); ax.set_ylim(0, 7.6)
    ax.add_patch(Rectangle((3.8, 6.4), 1.4, 0.6, fc='#888', ec='#444'))
    ax.add_patch(Circle((4.5, 3.6), 3.0, fc='#2f6fde', ec='#1a3f80', lw=2))
    ax.add_patch(FancyBboxPatch((2.4, 3.3), 4.2, 1.4, boxstyle='round,pad=0,rounding_size=0.2', fc='#d9e8d0', ec='#333'))
    ax.text(4.5, 4.0, '00:12.47', ha='center', va='center', fontsize=17, family='monospace', weight='bold', color='#1b2620')
    for (x, t, c) in [(3.2, 'START', '#2e9d4a'), (5.8, 'STOP', '#d64545')]:
        ax.add_patch(Circle((x, 2.0), 0.55, fc=c, ec='#222')); ax.text(x, 2.0, t, ha='center', va='center', fontsize=7.5, color='white', weight='bold')
    ax.add_patch(Circle((4.5, 1.2), 0.45, fc='#f0c419', ec='#222')); ax.text(4.5, 1.2, 'RESET', ha='center', va='center', fontsize=6.5, weight='bold')
    ax.text(8.2, 5.6, 'phút : giây . phần trăm giây', fontsize=10, color=MAU['xam'])
    ax.text(8.2, 4.2, '1. RESET → về 0', fontsize=11)
    ax.text(8.2, 3.2, '2. START khi bắt đầu', fontsize=11, color='#2e9d4a')
    ax.text(8.2, 2.2, '3. STOP khi kết thúc', fontsize=11, color='#d64545')
    ax.text(8.2, 1.0, 'Kết quả: 12,47 s', fontsize=11.5, weight='bold', color=MAU['xanh'])
    luu(fig, D + 'dong-ho-bam-giay.svg')


def nhiet_ke():
    fig, ax = khung(6.4, 4.4); trong(ax)
    ax.set_xlim(0, 12.8); ax.set_ylim(0, 8.8)
    ax.add_patch(FancyBboxPatch((3.2, 1.6), 1.2, 6.8, boxstyle='round,pad=0,rounding_size=0.5', fc='#f4f9ff', ec='#555', lw=1.5))
    ax.add_patch(Circle((3.8, 1.3), 0.75, fc=MAU['do'], ec='#7a1a2a', lw=1.5))
    ax.add_patch(Rectangle((3.7, 1.6), 0.2, 2.67, fc=MAU['do'], ec='none'))
    y0, y100 = 2.2, 7.8
    for t in range(0, 101, 10):
        y = y0 + (y100 - y0) * t / 100
        ax.plot([4.4, 4.9], [y, y], color='#333', lw=1); ax.text(5.05, y, '%d' % t, va='center', fontsize=9)
    for t in range(0, 101, 2):
        y = y0 + (y100 - y0) * t / 100; ax.plot([4.4, 4.62], [y, y], color='#333', lw=0.5)
    ax.text(5.2, 8.45, '°C', fontsize=10)
    for (t, txt, c) in [(0, 'nước đá đang tan', MAU['lam']), (37, 'thân nhiệt người', MAU['do']), (100, 'nước sôi', MAU['cam'])]:
        y = y0 + (y100 - y0) * t / 100
        ax.annotate('%d °C – %s' % (t, txt), xy=(5.9, y), xytext=(7.0, y), fontsize=10.5, color=c, va='center', arrowprops=dict(arrowstyle='-', color=c))
    ax.annotate('bầu chứa\nchất lỏng', xy=(3.1, 1.3), xytext=(0.2, 1.0), fontsize=10, va='center', arrowprops=dict(arrowstyle='-', color=MAU['xam']))
    ax.annotate('ống quản', xy=(3.7, 4.0), xytext=(0.2, 4.3), fontsize=10, va='center', arrowprops=dict(arrowstyle='-', color=MAU['xam']))
    ax.annotate('thang chia độ', xy=(4.6, 6.4), xytext=(0.2, 6.9), fontsize=10, va='center', arrowprops=dict(arrowstyle='-', color=MAU['xam']))
    luu(fig, D + 'nhiet-ke.svg')


ALL += [linh_vuc_khtn, bien_canh_bao, kinh_lup, kinh_hien_vi, do_chieu_dai, can_dong_ho, dong_ho_bam_giay, nhiet_ke]

if __name__ == '__main__':
    for f in ALL:
        f()
