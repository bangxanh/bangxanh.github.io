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


def o_bang(ax, x, y, w, h, tieu_de, noi_dung, nen, vien, co=10):
    hop(ax, x, y, w, h, '', mau=nen, vien=vien)
    ax.text(x + w / 2, y + h - 0.45, tieu_de, ha='center', va='center', fontsize=co + 1.5, weight='bold', color=vien)
    ax.text(x + w / 2, y + (h - 0.9) / 2, noi_dung, ha='center', va='center', fontsize=co, linespacing=1.45)


def da_dang_chat():
    fig, ax = khung(9.0, 3.8); trong(ax)
    ax.set_xlim(0, 18); ax.set_ylim(0, 7.6)
    ax.text(5.6, 7.2, 'Vật thể tự nhiên', ha='center', fontsize=12, weight='bold', color=MAU['la'])
    ax.text(14.2, 7.2, 'Vật thể nhân tạo', ha='center', fontsize=12, weight='bold', color=MAU['lam'])
    ax.text(0.2, 5.0, 'Vật sống\n(hữu sinh)', fontsize=11, weight='bold', color=MAU['do'], va='center')
    ax.text(0.2, 1.8, 'Vật không\nsống\n(vô sinh)', fontsize=11, weight='bold', color=MAU['xam'], va='center')
    ax.plot([2.8, 17.8], [3.45, 3.45], color=MAU['nhat'], lw=2); ax.plot([9.9, 9.9], [0.2, 6.9], color=MAU['nhat'], lw=2)
    o_bang(ax, 3.5, 3.7, 6.2, 2.9, '', 'cây bàng, con mèo,\nvi khuẩn, con người\n(tạo nên từ nước,\nprotein, tinh bột…)', '#eef7e6', MAU['la'])
    o_bang(ax, 3.5, 0.3, 6.2, 2.9, '', 'hòn đá, sông, núi,\nkhông khí\n(đá vôi, nước, oxygen,\nnitrogen…)', '#f3f3f3', MAU['xam'])
    o_bang(ax, 10.2, 3.7, 7.6, 2.9, '', '(con người không tạo\nra vật sống)', '#fbfbfb', '#cccccc')
    o_bang(ax, 10.2, 0.3, 7.6, 2.9, '', 'cái bàn (gỗ), xe đạp (sắt,\ncao su), cốc (thủy tinh),\nchai nhựa (nhựa)', '#e3eefc', MAU['lam'])
    luu(fig, D + 'da-dang-chat.svg')


def hat(ax, x0, y0, w, h, n, kieu, mau):
    rng = np.random.default_rng(3)
    if kieu == 'ran':
        for i in range(n):
            for j in range(n):
                ax.add_patch(Circle((x0 + 0.35 + i * (w - 0.7) / (n - 1), y0 + 0.35 + j * (h - 0.7) / (n - 1)), 0.22, fc=mau, ec='#333', lw=0.6))
    elif kieu == 'long':
        for k in range(n * n):
            ax.add_patch(Circle((x0 + 0.3 + rng.random() * (w - 0.6), y0 + 0.3 + rng.random() * (h * 0.55)), 0.22, fc=mau, ec='#333', lw=0.6))
    else:
        for k in range(7):
            cx, cy = x0 + 0.3 + rng.random() * (w - 0.6), y0 + 0.3 + rng.random() * (h - 0.6)
            ax.add_patch(Circle((cx, cy), 0.22, fc=mau, ec='#333', lw=0.6))
            a = rng.random() * 6.28; ax.annotate('', xy=(cx + 0.6 * np.cos(a), cy + 0.6 * np.sin(a)), xytext=(cx + 0.25 * np.cos(a), cy + 0.25 * np.sin(a)), arrowprops=dict(arrowstyle='->', color='#777', lw=0.8))


def chuyen_the():
    fig, ax = khung(9.4, 4.0); trong(ax)
    ax.set_xlim(0, 18.8); ax.set_ylim(0, 8)
    for (x, t, k, mau) in [(0.4, 'RẮN', 'ran', '#9cc5f0'), (7.4, 'LỎNG', 'long', '#5aa0e6'), (14.4, 'KHÍ', 'khi', '#cfe3f8')]:
        ax.add_patch(Rectangle((x, 2.0), 4.0, 3.6, fc='white', ec='#333', lw=1.5))
        hat(ax, x, 2.0, 4.0, 3.6, 4, k, mau)
        ax.text(x + 2.0, 6.0, t, ha='center', fontsize=13, weight='bold', color=MAU['xanh'])
    ax.text(2.4, 1.2, 'hình dạng, thể tích\nxác định', ha='center', va='center', fontsize=9.6, linespacing=1.3)
    ax.text(9.4, 1.2, 'thể tích xác định,\nhình dạng theo vật chứa', ha='center', va='center', fontsize=9.6, linespacing=1.3)
    ax.text(16.4, 1.2, 'không xác định,\ndễ bị nén', ha='center', va='center', fontsize=9.6, linespacing=1.3)
    for (a, b, t, c, dy) in [((4.6, 4.6), (7.2, 4.6), 'nóng chảy', MAU['do'], 0.35), ((7.2, 3.0), (4.6, 3.0), 'đông đặc', MAU['lam'], -0.35),
                             ((11.6, 4.6), (14.2, 4.6), 'bay hơi', MAU['do'], 0.35), ((14.2, 3.0), (11.6, 3.0), 'ngưng tụ', MAU['lam'], -0.35)]:
        mui_ten(ax, a, b, c, 2.2); ax.text((a[0] + b[0]) / 2, a[1] + dy, t, ha='center', va='center', fontsize=10.5, color=c, weight='bold')
    ax.text(9.4, 7.4, 'nhận nhiệt (đỏ) – tỏa nhiệt (xanh)', ha='center', fontsize=10, color=MAU['xam'])
    luu(fig, D + 'chuyen-the.svg')


def khong_khi():
    fig, ax = khung(7.6, 3.6); trong(ax)
    ax.set_xlim(0, 15.2); ax.set_ylim(0, 7.2)
    vals = [(78, '#2f6fde', 'Nitrogen ~78%'), (21, '#55891b', 'Oxygen ~21%'), (1, '#bd7a12', 'Khí khác ~1%\n(CO₂, hơi nước, khí hiếm)')]
    a0 = 90
    for v, c, t in vals:
        a1 = a0 - v * 3.6
        ax.add_patch(Wedge((3.8, 3.6), 3.2, a1, a0, fc=c, ec='white', lw=2))
        a0 = a1
    ax.text(4.9, 2.2, '78%', fontsize=16, color='white', weight='bold', ha='center', va='center')
    ax.text(2.5, 5.0, '21%', fontsize=13, color='white', weight='bold', ha='center', va='center')
    for i, (v, c, t) in enumerate(vals):
        y = 5.4 - i * 1.6
        ax.add_patch(Rectangle((8.4, y - 0.3), 0.6, 0.6, fc=c)); ax.text(9.3, y, t, va='center', fontsize=11, linespacing=1.3)
    luu(fig, D + 'khong-khi.svg')


def vat_lieu():
    fig, ax = khung(9.6, 3.6); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 7.2)
    items = [('Kim loại', 'dẫn điện, dẫn nhiệt\ntốt; dễ uốn\n→ nồi, dây điện', '#e3e7ea', '#55626b'), ('Nhựa', 'nhẹ, bền, cách điện;\nkhó phân hủy\n→ vỏ dây, chai, hộp', '#e3eefc', MAU['lam']),
             ('Cao su', 'đàn hồi, không\nthấm nước\n→ lốp xe, ủng', '#ece7e1', '#4a3a2a'), ('Thủy tinh', 'trong suốt,\ngiòn, dễ vỡ\n→ cửa kính, lọ', '#e6f6f8', MAU['ngoc']),
             ('Gốm sứ', 'cứng, chịu nhiệt,\ncách điện\n→ bát, gạch, ngói', '#fbeee4', '#b5651d'), ('Gỗ', 'dễ gia công,\ndễ cháy, mối mọt\n→ bàn ghế, nhà', '#f6ecd9', '#8a5a2b')]
    for i, (t, m, nen, vien) in enumerate(items):
        x = 0.2 + (i % 3) * 6.35; y = 3.75 if i < 3 else 0.2
        hop(ax, x, y, 6.0, 3.25, '', mau=nen, vien=vien)
        ax.text(x + 0.3, y + 2.75, t, fontsize=12, weight='bold', color=vien, va='center')
        ax.text(x + 0.3, y + 1.25, m, fontsize=9.8, va='center', linespacing=1.35)
    # icons
    ax.add_patch(Ellipse((5.2, 5.4), 1.2, 0.5, fc='#b8c2c8', ec='#55626b')); ax.add_patch(Rectangle((4.6, 4.6), 1.2, 0.8, fc='#b8c2c8', ec='#55626b'))
    ax.add_patch(Rectangle((11.6, 4.4), 0.7, 1.6, fc='#bfe0ff', ec=MAU['lam'])); ax.add_patch(Rectangle((11.75, 6.0), 0.4, 0.3, fc=MAU['lam']))
    ax.add_patch(Circle((17.8, 5.3), 0.75, fc='#3a3a3a')); ax.add_patch(Circle((17.8, 5.3), 0.35, fc='#ece7e1'))
    ax.add_patch(Rectangle((4.6, 1.0), 1.3, 1.8, fc='#d8f3f6', ec=MAU['ngoc'], lw=2))
    ax.add_patch(Wedge((11.6, 1.9), 0.8, 180, 360, fc='white', ec='#b5651d', lw=1.6)); ax.plot([10.8, 12.4], [1.9, 1.9], color='#b5651d', lw=1.6)
    ax.add_patch(Rectangle((17.0, 1.6), 1.6, 0.25, fc='#c58b55', ec='#8a5a2b')); ax.plot([17.2, 17.2], [0.8, 1.6], color='#8a5a2b', lw=3); ax.plot([18.4, 18.4], [0.8, 1.6], color='#8a5a2b', lw=3)
    luu(fig, D + 'vat-lieu.svg')


def nguyen_lieu():
    fig, ax = khung(9.0, 3.8); trong(ax)
    ax.set_xlim(0, 18); ax.set_ylim(0, 7.6)
    rows = [('Đá vôi', 'nung, nghiền', 'vôi sống, xi măng', '#f3f3f3', MAU['xam']), ('Quặng sắt', 'luyện trong lò cao', 'gang, thép', '#f6e3da', '#8a3a1a'),
            ('Đất sét', 'nhào, nặn, nung', 'gạch, ngói, gốm', '#fbeee4', '#b5651d'), ('Cát', 'nấu chảy với phụ gia', 'thủy tinh', '#fff6d6', MAU['cam'])]
    ax.text(2.4, 7.3, 'NGUYÊN LIỆU', ha='center', fontsize=11.5, weight='bold', color=MAU['xanh'])
    ax.text(9.0, 7.3, 'chế biến', ha='center', fontsize=11, color=MAU['xam'])
    ax.text(15.3, 7.3, 'SẢN PHẨM / VẬT LIỆU', ha='center', fontsize=11.5, weight='bold', color=MAU['xanh'])
    for i, (a, b, c, nen, vien) in enumerate(rows):
        y = 5.6 - i * 1.7
        hop(ax, 0.3, y, 4.2, 1.25, a, mau=nen, vien=vien, co=11.5)
        mui_ten(ax, (4.6, y + 0.62), (12.5, y + 0.62), MAU['xam'], 1.8)
        ax.text(8.55, y + 0.9, b, ha='center', fontsize=10, color=MAU['xam'])
        hop(ax, 12.6, y, 5.2, 1.25, c, mau='#eef7e6', vien=MAU['la'], co=11)
    luu(fig, D + 'nguyen-lieu.svg')


def tam_giac_chay():
    fig, ax = khung(7.6, 4.0); trong(ax)
    ax.set_xlim(0, 15.2); ax.set_ylim(0, 8)
    P = np.array([[1.4, 1.0], [10.6, 1.0], [6.0, 7.4]])
    ax.add_patch(Polygon(P, fc='#fff3e6', ec=MAU['cam'], lw=4, joinstyle='round'))
    ax.add_patch(Polygon([[6.0, 5.2], [5.2, 3.6], [5.5, 2.4], [6.5, 2.4], [6.8, 3.6]], fc='#ff8a00', ec='#d9480f'))
    ax.add_patch(Polygon([[6.0, 4.2], [5.6, 3.2], [5.8, 2.5], [6.2, 2.5], [6.4, 3.2]], fc='#ffd43b', ec='none'))
    ax.text(6.0, 0.4, 'NHIÊN LIỆU (chất cháy)', ha='center', fontsize=11.5, weight='bold', color='#8a5a2b')
    ax.text(2.6, 4.6, 'OXYGEN\n(không khí)', ha='center', fontsize=11.5, weight='bold', color=MAU['lam'], rotation=54, va='center')
    ax.text(9.4, 4.6, 'NHIỆT ĐỘ', ha='center', fontsize=11.5, weight='bold', color=MAU['do'], rotation=-54, va='center')
    ax.text(11.4, 6.4, 'Dập lửa:', fontsize=11, weight='bold', color=MAU['xanh'])
    ax.text(11.4, 4.2, '• cách li oxygen\n  (chăn ướt, cát)\n• hạ nhiệt độ\n  (nước)\n• cách li nhiên liệu\n  (khóa van ga)', fontsize=9.8, va='center', linespacing=1.3)
    luu(fig, D + 'tam-giac-chay.svg')


def thap_dinh_duong():
    fig, ax = khung(8.0, 4.2); trong(ax)
    ax.set_xlim(0, 16); ax.set_ylim(0, 8.4)
    levels = [('Lương thực: cơm, bánh mì, ngô, khoai', 'ăn đủ', '#f2d27a'), ('Rau, củ, quả', 'ăn nhiều', '#9bd57a'), ('Thịt, cá, trứng, đậu, sữa', 'ăn vừa phải', '#f4a3a3'),
              ('Dầu, mỡ, vừng, lạc', 'ăn ít', '#ffe9a8'), ('Muối, đường', 'hạn chế', '#e0e0e0')]
    H = 1.5
    for i, (t, m, c) in enumerate(levels):
        y = 0.3 + i * H
        w0 = 10.0 - i * 2.0; w1 = 10.0 - (i + 1) * 2.0
        ax.add_patch(Polygon([[5.0 - w0 / 2 + 0.2, y], [5.0 + w0 / 2 + 0.2, y], [5.0 + w1 / 2 + 0.2, y + H], [5.0 - w1 / 2 + 0.2, y + H]], fc=c, ec='white', lw=2))
        ax.text(10.8, y + H / 2, t, va='center', fontsize=10)
        ax.text(5.2, y + H / 2, m, ha='center', va='center', fontsize=10.5, weight='bold', color='#333')
    luu(fig, D + 'thap-dinh-duong.svg')


def coc(ax, x, y, w=2.6, h=3.4):
    ax.plot([x, x, x + w, x + w], [y + h, y, y, y + h], color='#555', lw=1.8)


def hon_hop():
    fig, ax = khung(9.0, 3.6); trong(ax)
    ax.set_xlim(0, 18); ax.set_ylim(0, 7.2)
    rng = np.random.default_rng(5)
    for i, (t, m) in enumerate([('Dung dịch', 'nước muối: trong suốt,\nđồng nhất'), ('Huyền phù', 'nước phù sa: đục, chất\nrắn lơ lửng, lắng dần'), ('Nhũ tương', 'dầu lắc với nước:\ngiọt dầu nhỏ phân tán')]):
        x = 1.5 + i * 6.0
        coc(ax, x, 2.0)
        if i == 0:
            ax.add_patch(Rectangle((x + 0.05, 2.05), 2.5, 2.6, fc='#d7ecfb', ec='none'))
        elif i == 1:
            ax.add_patch(Rectangle((x + 0.05, 2.05), 2.5, 2.6, fc='#e8d7b5', ec='none'))
            for k in range(40): ax.add_patch(Circle((x + 0.2 + rng.random() * 2.2, 2.1 + rng.random() ** 1.8 * 2.4), 0.06, fc='#8a6a3a'))
        else:
            ax.add_patch(Rectangle((x + 0.05, 2.05), 2.5, 2.6, fc='#e3f1fb', ec='none'))
            for k in range(22): ax.add_patch(Circle((x + 0.25 + rng.random() * 2.1, 2.2 + rng.random() * 2.3), 0.09 + rng.random() * 0.07, fc='#f6d55c', ec='#c9a227', lw=0.5))
        ax.text(x + 1.3, 6.1, t, ha='center', fontsize=12, weight='bold', color=MAU['xanh'])
        ax.text(x + 1.3, 1.0, m, ha='center', va='center', fontsize=9.6, linespacing=1.3)
    luu(fig, D + 'hon-hop.svg')


def tach_chat():
    fig, ax = khung(9.6, 4.0); trong(ax)
    ax.set_xlim(0, 19.2); ax.set_ylim(0, 8)
    # loc
    ax.add_patch(Polygon([[1.0, 6.4], [4.0, 6.4], [2.7, 4.6], [2.3, 4.6]], fc='white', ec='#555', lw=1.6))
    ax.add_patch(Polygon([[1.25, 6.25], [3.75, 6.25], [2.5, 4.8]], fc='#f7f7f7', ec='#aaa', lw=1))
    ax.add_patch(Polygon([[1.7, 5.75], [3.3, 5.75], [2.5, 4.85]], fc='#d9c29a', ec='none'))
    ax.add_patch(Rectangle((2.3, 3.4), 0.4, 1.2, fc='white', ec='#555'))
    coc(ax, 1.3, 1.6, 2.4, 2.2); ax.add_patch(Rectangle((1.35, 1.65), 2.3, 1.0, fc='#d7ecfb', ec='none'))
    ax.text(4.2, 5.6, 'cát giữ lại\ntrên giấy lọc', fontsize=9.5, va='center')
    ax.text(2.5, 0.7, 'LỌC', ha='center', fontsize=12, weight='bold', color=MAU['xanh'])
    # co can
    ax.add_patch(Wedge((9.0, 4.4), 1.3, 180, 360, fc='#eeeeee', ec='#555', lw=1.6)); ax.plot([7.7, 10.3], [4.4, 4.4], color='#555', lw=1.6)
    for k in range(9): ax.add_patch(Rectangle((8.2 + k * 0.17, 3.45 + 0.1 * np.sin(k)), 0.12, 0.12, fc='white', ec='#999', lw=0.5))
    ax.plot([7.8, 10.2], [3.0, 3.0], color='#555', lw=2)
    ax.add_patch(Polygon([[9.0, 2.9], [8.6, 1.9], [8.8, 1.6], [9.2, 1.6], [9.4, 1.9]], fc='#ff8a00', ec='#d9480f'))
    ax.add_patch(Rectangle((8.5, 1.2), 1.0, 0.4, fc='#888'))
    for k in range(3): ax.plot([8.4 + k * 0.6, 8.6 + k * 0.6, 8.4 + k * 0.6], [4.8, 5.4, 6.0], color='#9bbad6', lw=1.4)
    ax.text(10.6, 5.6, 'nước bay hơi', fontsize=9.5, color=MAU['lam'])
    ax.text(10.6, 3.6, 'muối còn lại', fontsize=9.5)
    ax.text(9.0, 0.7, 'CÔ CẠN', ha='center', fontsize=12, weight='bold', color=MAU['xanh'])
    # chiet
    ax.add_patch(Ellipse((15.8, 4.8), 2.4, 3.0, fc='white', ec='#555', lw=1.6))
    ax.add_patch(Rectangle((15.6, 6.2), 0.4, 0.6, fc='white', ec='#555'))
    ax.add_patch(Wedge((15.8, 4.8), 1.15, 180, 360, fc='#d7ecfb', ec='none'))
    ax.add_patch(Rectangle((14.68, 4.8), 2.24, 0.8, fc='#f6d55c', ec='none'))
    ax.plot([15.8, 15.8], [3.3, 2.2], color='#555', lw=2.5); ax.add_patch(Rectangle((15.55, 2.7), 0.5, 0.25, fc='#888'))
    coc(ax, 14.7, 0.9, 2.2, 1.4); ax.add_patch(Rectangle((14.75, 0.95), 2.1, 0.5, fc='#d7ecfb', ec='none'))
    ax.text(17.3, 5.3, 'dầu', fontsize=9.5); ax.text(17.3, 4.2, 'nước', fontsize=9.5)
    ax.text(15.8, 7.3, 'CHIẾT', ha='center', fontsize=12, weight='bold', color=MAU['xanh'])
    luu(fig, D + 'tach-chat.svg')


ALL += [da_dang_chat, chuyen_the, khong_khi, vat_lieu, nguyen_lieu, tam_giac_chay, thap_dinh_duong, hon_hop, tach_chat]

if __name__ == '__main__':
    for f in ALL:
        f()
