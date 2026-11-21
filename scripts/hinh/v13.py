"""Hình minh họa đợt bản 1.3 (Ngữ văn, Địa lí, Toán, KHTN, Tiếng Anh). Chạy: python3 scripts/hinh/v13.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bx_hinh import *


def doan_van_200():
    fig, ax = khung(8.0, 4.6); trong(ax)
    ax.set_xlim(0, 16); ax.set_ylim(0, 9.2)
    hop(ax, 0.4, 7.2, 11.8, 1.5, 'CÂU CHỦ ĐỀ: đối tượng + nhận định khái quát', mau=MAU['xanh'], vien=MAU['xanh'], co=12, chu_mau='white')
    y = 5.2
    for i, (t, m, n) in enumerate([('Ý 1', 'lí lẽ + dẫn chứng "…" + phân tích tác dụng', '#e3eefc'),
                                   ('Ý 2', 'lí lẽ + dẫn chứng "…" + phân tích tác dụng', '#e3eefc'),
                                   ('Ý 3', 'nhận xét nghệ thuật: từ ngữ, hình ảnh, giọng điệu', '#e3eefc')]):
        hop(ax, 1.0, y - i * 1.6, 11.2, 1.25, t + ': ' + m, mau=n, vien=MAU['lam'], co=10.5)
    hop(ax, 0.4, 0.4, 11.8, 1.4, 'CÂU KẾT: đánh giá giá trị, thông điệp, liên hệ', mau=MAU['vang'], vien=MAU['cam'], co=11.5)
    for yy in (7.2, 5.2, 3.6, 2.0):
        mui_ten(ax, (6.0, yy), (6.0, yy - 0.35), MAU['xam'], 1.6)
    ax.plot([12.5, 12.9, 12.9, 12.5], [8.7, 8.7, 0.4, 0.4], color=MAU['do'], lw=2)
    ax.text(13.1, 5.1, 'MỘT đoạn', fontsize=12.5, color=MAU['do'], weight='bold')
    ax.text(13.1, 4.4, '≈ 200 chữ', fontsize=12.5, color=MAU['do'], weight='bold')
    ax.text(13.1, 3.7, '10 – 14 câu', fontsize=11, color=MAU['xam'])
    ax.text(13.1, 3.0, 'viết liền,', fontsize=11, color=MAU['xam'])
    ax.text(13.1, 2.4, 'không xuống dòng', fontsize=11, color=MAU['xam'])
    luu(fig, '12-van/doan-van-200.svg')


def dan_y_nlxh():
    fig, ax = khung(8.4, 5.0); trong(ax)
    ax.set_xlim(0, 16.8); ax.set_ylim(0, 10)
    hop(ax, 0.3, 8.4, 4.0, 1.3, 'MỞ BÀI\n60–80 chữ', mau=MAU['xanh'], vien=MAU['xanh'], co=11, chu_mau='white')
    ax.text(4.6, 9.05, 'dẫn dắt → nêu vấn đề nghị luận', fontsize=11, va='center')
    hop(ax, 0.3, 2.0, 4.0, 5.9, 'THÂN BÀI\n400–450 chữ', mau=MAU['lam'], vien=MAU['lam'], co=11.5, chu_mau='white')
    buoc = [('1', 'Giải thích', 'từ khóa, ý nghĩa vấn đề'), ('2', 'Bàn luận', 'vì sao? biểu hiện, ý nghĩa / nguyên nhân, hậu quả'),
            ('3', 'Dẫn chứng', 'có thật, tiêu biểu + phân tích'), ('4', 'Phản đề', 'phê phán mặt trái, mở rộng'),
            ('5', 'Bài học', 'nhận thức + hành động cụ thể')]
    for i, (n, t, m) in enumerate(buoc):
        y = 6.85 - i * 1.18
        ax.add_patch(Circle((5.2, y + 0.42), 0.38, fc=MAU['vang'], ec=MAU['cam']))
        ax.text(5.2, y + 0.42, n, ha='center', va='center', fontsize=11, weight='bold')
        ax.text(5.9, y + 0.42, t, fontsize=12, weight='bold', va='center', color=MAU['lam'])
        ax.text(9.0, y + 0.42, m, fontsize=10.5, va='center')
    hop(ax, 0.3, 0.3, 4.0, 1.3, 'KẾT BÀI\n60–80 chữ', mau=MAU['xanh'], vien=MAU['xanh'], co=11, chu_mau='white')
    ax.text(4.6, 0.95, 'khẳng định vấn đề → liên hệ bản thân', fontsize=11, va='center')
    luu(fig, '12-van/dan-y-nlxh.svg')


def bieu_do():
    fig, axs = plt.subplots(1, 4, figsize=(10.4, 3.2))
    ax = axs[0]; ax.bar([0, 1, 2], [3, 5, 4], color=[MAU['lam'], MAU['ngoc'], MAU['la']]); ax.set_xticks([]); ax.set_yticks([])
    ax.set_title('Cột\n"so sánh quy mô"', fontsize=11)
    ax = axs[1]; ax.plot([0, 1, 2, 3], [100, 115, 135, 160], marker='o', color=MAU['do'], lw=2.4); ax.plot([0, 1, 2, 3], [100, 108, 112, 125], marker='s', color=MAU['lam'], lw=2.4)
    ax.set_xticks([]); ax.set_yticks([]); ax.set_title('Đường\n"tốc độ tăng trưởng"', fontsize=11)
    ax = axs[2]; ax.pie([15, 25, 60], colors=[MAU['la'], MAU['vang'], MAU['lam']], startangle=90, counterclock=False, wedgeprops=dict(edgecolor='white'))
    ax.set_title('Tròn\n"cơ cấu" (1–3 năm)', fontsize=11)
    ax = axs[3]; x = [0, 1, 2, 3, 4]; a = [50, 44, 38, 33, 28]; b = [20, 24, 28, 30, 32]
    ax.stackplot(x, a, b, [100 - p - q for p, q in zip(a, b)], colors=[MAU['la'], MAU['vang'], MAU['lam']])
    ax.set_xlim(0, 4); ax.set_ylim(0, 100); ax.set_xticks([]); ax.set_yticks([])
    ax.set_title('Miền\n"chuyển dịch cơ cấu"', fontsize=11)
    for a_ in axs:
        for sp in a_.spines.values(): sp.set_color(MAU['xam'])
    fig.tight_layout()
    luu(fig, '12-khxh/bieu-do.svg')





def duong_tron_lg():
    fig, ax = khung(5.6, 5.2); trong(ax)
    ax.set_xlim(-1.55, 1.85); ax.set_ylim(-1.5, 1.5); ax.set_aspect('equal')
    ax.add_patch(Circle((0, 0), 1, fc='none', ec=MAU['lam'], lw=2))
    mui_ten(ax, (-1.4, 0), (1.45, 0), MAU['den'], 1.3); mui_ten(ax, (0, -1.3), (0, 1.35), MAU['den'], 1.3)
    a = np.radians(55); mx, my = np.cos(a), np.sin(a)
    ax.plot([0, mx], [0, my], color=MAU['do'], lw=2.2); ax.plot([mx], [my], 'o', color=MAU['do'])
    ax.plot([mx, mx], [0, my], ls='--', color=MAU['xanh'], lw=1.4); ax.plot([0, mx], [my, my], ls='--', color=MAU['xanh'], lw=1.4)
    ax.add_patch(Arc((0, 0), 0.5, 0.5, theta1=0, theta2=55, color=MAU['do'], lw=1.6))
    ax.text(0.3, 0.12, 'α', fontsize=13, color=MAU['do'])
    ax.text(mx + 0.05, my + 0.07, 'M(cos α; sin α)', fontsize=11, color=MAU['do'])
    ax.text(mx - 0.02, -0.16, 'cos α', fontsize=10.5, color=MAU['xanh'], ha='center')
    ax.text(-0.42, my - 0.04, 'sin α', fontsize=10.5, color=MAU['xanh'])
    ax.text(1.04, -0.13, 'A(1;0)', fontsize=10); ax.text(0.05, 1.05, '1', fontsize=10); ax.text(1.42, 0.06, 'x', fontsize=11); ax.text(0.06, 1.33, 'y', fontsize=11)
    q = [(0.75, 1.32, 'I: sin +, cos +'), (-1.5, 1.32, 'II: sin +, cos −'), (-1.5, -1.38, 'III: sin −, cos −'), (0.65, -1.38, 'IV: sin −, cos +')]
    for x, y, t in q: ax.text(x, y, t, fontsize=10, color=MAU['xam'])
    luu(fig, '11-toan/duong-tron-lg.svg')


def he_pt():
    fig, ax = khung(5.6, 4.6, truc=True)
    x = np.linspace(-1, 5.5, 50)
    ax.plot(x, 5 - x, color=MAU['lam'], lw=2.4, label='x + y = 5')
    ax.plot(x, 2 * x - 1, color=MAU['do'], lw=2.4, label='2x − y = 1')
    ax.plot([2], [3], 'o', ms=9, color=MAU['xanh'])
    ax.plot([2, 2, 0], [0, 3, 3], ls=':', color=MAU['xam'])
    ax.annotate('Nghiệm (2; 3)', xy=(2, 3), xytext=(2.6, 4.6), fontsize=12, color=MAU['xanh'], weight='bold', arrowprops=dict(arrowstyle='->', color=MAU['xanh']))
    ax.set_xlim(-1, 5.5); ax.set_ylim(-1.5, 6.5); ax.set_xticks([1, 2, 3, 4, 5]); ax.set_yticks([1, 2, 3, 4, 5])
    ax.legend(frameon=False, loc='center right')
    ax.text(5.35, -0.75, 'x', fontsize=11); ax.text(0.12, 6.2, 'y', fontsize=11)
    luu(fig, '9-toan/he-pt.svg')


def menh_de():
    fig, ax = khung(6.0, 3.2); trong(ax)
    ax.set_xlim(0, 12); ax.set_ylim(0, 6.4)
    cols = [(0.6, 'P'), (3.6, 'Q'), (6.6, 'P ⇒ Q')]
    hop(ax, 0.3, 5.0, 11.4, 1.0, '', mau=MAU['xanh'], vien=MAU['xanh'])
    for x, t in cols: ax.text(x + 1.3, 5.5, t, ha='center', va='center', fontsize=13, color='white', weight='bold')
    rows = [('Đ', 'Đ', 'Đ'), ('Đ', 'S', 'S'), ('S', 'Đ', 'Đ'), ('S', 'S', 'Đ')]
    for i, r in enumerate(rows):
        y = 3.95 - i * 1.05
        bad = r[2] == 'S'
        hop(ax, 0.3, y, 11.4, 0.95, '', mau='#fde9ec' if bad else ('#f3f7f4' if i % 2 else 'white'), vien=MAU['do'] if bad else MAU['xam'])
        for (x, _), v in zip(cols, r):
            ax.text(x + 1.3, y + 0.47, v, ha='center', va='center', fontsize=13, color=MAU['do'] if v == 'S' else MAU['den'], weight='bold')
    ax.text(9.2, 3.37, '← chỉ sai ở đây', fontsize=10.5, color=MAU['do'], va='center')
    luu(fig, '10-toan/menh-de.svg')


def community():
    fig, ax = khung(8.6, 4.8); trong(ax)
    ax.set_xlim(0, 17.2); ax.set_ylim(0, 9.6)
    ax.set_xlim(0, 17.6)
    nhom = [((0.1, 7.0), 'Facilities', 'library · sports centre\ncommunity centre · market', MAU['lam'], '#e3eefc'),
            ((11.1, 7.0), 'Community helpers', 'firefighter · police officer\ndelivery person · garbage collector', MAU['do'], '#fde9ec'),
            ((0.1, 0.5), 'Handicrafts', 'pottery · lacquerware · embroidery\nconical hat · artisan · craft village', MAU['cam'], '#fdf0dc'),
            ((11.1, 0.5), 'Phrasal verbs', 'pass down · set up · look around\ntake care of · find out · close down', MAU['la'], '#e8f4dc')]
    for (x, y), td, tu, mau, nen in nhom:
        x = x if x < 6 else 11.0
        cx = x + (6.5 if x < 6 else 0); cy = y + (0 if y > 5 else 2.1)
        ax.plot([cx, 8.8], [cy, 4.85], color=mau, lw=2, zorder=0)
        hop(ax, x, y, 6.5, 2.1, '', mau=nen, vien=mau)
        ax.text(x + 3.25, y + 1.6, td, ha='center', fontsize=12.5, color=mau, weight='bold')
        ax.text(x + 3.25, y + 0.75, tu, ha='center', va='center', fontsize=9.3, linespacing=1.5)
    hop(ax, 5.8, 4.2, 6.0, 1.3, 'LOCAL COMMUNITY', mau=MAU['xanh'], vien=MAU['xanh'], co=12.5, chu_mau='white')
    luu(fig, '9-anh/community.svg')


def present_tenses():
    fig, ax = khung(8.0, 3.4); trong(ax)
    ax.set_xlim(0, 16); ax.set_ylim(0, 6.8)
    mui_ten(ax, (0.4, 3.0), (15.6, 3.0), MAU['den'], 1.8)
    ax.text(15.4, 2.4, 'time', fontsize=10, color=MAU['xam'], ha='right')
    for x in (2.2, 5.2, 8.2, 11.2, 14.2):
        ax.plot([x], [3.0], marker='o', ms=9, color=MAU['lam'])
    ax.text(8.2, 5.9, 'Present simple: My mum cooks dinner every day.', ha='center', fontsize=11.5, color=MAU['lam'], weight='bold')
    ax.text(8.2, 5.2, 'lặp lại đều đặn – thói quen (every day, usually, often…)', ha='center', fontsize=10, color=MAU['lam'])
    ax.plot([12.3, 12.3], [2.3, 3.7], color=MAU['do'], lw=2.4)
    ax.add_patch(FancyBboxPatch((10.4, 2.6), 3.8, 0.8, boxstyle='round,pad=0,rounding_size=0.3', fc='#fde9ec', ec=MAU['do'], alpha=0.9))
    ax.text(12.3, 3.0, 'now', ha='center', va='center', fontsize=11, color=MAU['do'], weight='bold')
    ax.text(8.2, 1.4, 'Present continuous: Look! Dad is cooking dinner now.', ha='center', fontsize=11.5, color=MAU['do'], weight='bold')
    ax.text(8.2, 0.7, 'đang diễn ra lúc nói (now, at the moment, Look!, Listen!)', ha='center', fontsize=10, color=MAU['do'])
    luu(fig, '10-anh/present-tenses.svg')


def where_from():
    fig, ax = khung(8.0, 3.6); trong(ax)
    ax.set_xlim(0, 16); ax.set_ylim(0, 7.2)
    def ban(x, ao, toc, co):
        ax.add_patch(Circle((x, 3.2), 0.85, fc='#f6d2b0', ec=MAU['den'], lw=1.3))
        ax.add_patch(Wedge((x, 3.35), 0.9, 10, 170, fc=toc, ec='none'))
        ax.add_patch(Circle((x - 0.28, 3.1), 0.08, fc=MAU['den'])); ax.add_patch(Circle((x + 0.28, 3.1), 0.08, fc=MAU['den']))
        ax.add_patch(Arc((x, 2.85), 0.6, 0.4, theta1=200, theta2=340, color=MAU['den'], lw=1.5))
        ax.add_patch(FancyBboxPatch((x - 0.9, 0.3), 1.8, 1.9, boxstyle='round,pad=0,rounding_size=0.4', fc=ao, ec=MAU['den'], lw=1.3))
    ban(3.75, '#f6a5a5', '#2b1d16', None)
    ban(11.9, '#a9cdf5', '#8a5a2b', None)
    ax.add_patch(FancyBboxPatch((0.1, 4.7), 7.3, 2.1, boxstyle='round,pad=0.1,rounding_size=0.5', fc='white', ec=MAU['do'], lw=1.8))
    ax.text(3.75, 6.15, "Where are you from?", ha='center', fontsize=13, color=MAU['do'], weight='bold')
    ax.text(3.75, 5.3, "I'm from Viet Nam. I'm Vietnamese.", ha='center', fontsize=11, color=MAU['den'])
    ax.add_patch(FancyBboxPatch((8.2, 4.7), 7.4, 2.1, boxstyle='round,pad=0.1,rounding_size=0.5', fc='white', ec=MAU['lam'], lw=1.8))
    ax.text(11.9, 6.15, "What nationality are you?", ha='center', fontsize=13, color=MAU['lam'], weight='bold')
    ax.text(11.9, 5.3, "I'm from Japan. I'm Japanese.", ha='center', fontsize=11.5, color=MAU['den'])
    luu(fig, '4-anh/where-from.svg')


def can_bang():
    fig, ax = khung(6.2, 4.0)
    t = np.linspace(0, 10, 200)
    vt = 1.2 + 3.8 * np.exp(-0.55 * t); vn = 1.2 - 1.2 * np.exp(-0.55 * t)
    ax.plot(t, vt, color=MAU['lam'], lw=2.6, label='v thuận')
    ax.plot(t, vn, color=MAU['do'], lw=2.6, label='v nghịch')
    ax.axvline(6.2, ls='--', color=MAU['xam'], lw=1.2)
    ax.text(6.35, 4.3, 'Trạng thái cân bằng:\nv thuận = v nghịch', fontsize=10.5, color=MAU['xanh'])
    ax.set_xlim(0, 10); ax.set_ylim(0, 5.3); ax.set_xticks([]); ax.set_yticks([])
    ax.set_xlabel('Thời gian'); ax.set_ylabel('Tốc độ phản ứng')
    ax.legend(frameon=False, loc='center right')
    luu(fig, '11-khtn/can-bang.svg')


def chuyen_the():
    fig, ax = khung(8.6, 4.4); trong(ax)
    ax.set_xlim(0, 17.2); ax.set_ylim(0, 8.8)
    rng = np.random.default_rng(5)
    def hop_pt(x0, ten, kieu, mau):
        ax.add_patch(FancyBboxPatch((x0, 3.0), 3.6, 3.4, boxstyle='round,pad=0,rounding_size=0.3', fc='white', ec=mau, lw=2))
        if kieu == 'ran':
            for i in range(5):
                for j in range(5): ax.add_patch(Circle((x0 + 0.5 + i * 0.65, 3.45 + j * 0.62), 0.25, fc=mau, ec='white'))
        elif kieu == 'long':
            for k in range(20):
                ax.add_patch(Circle((x0 + 0.45 + rng.uniform(0, 2.7), 3.4 + rng.uniform(0, 1.7)), 0.25, fc=mau, ec='white'))
        else:
            for k in range(7):
                ax.add_patch(Circle((x0 + 0.45 + rng.uniform(0, 2.7), 3.4 + rng.uniform(0, 2.6)), 0.25, fc=mau, ec='white'))
        ax.text(x0 + 1.8, 2.45, ten, ha='center', fontsize=12.5, weight='bold', color=mau)
    hop_pt(0.6, 'RẮN', 'ran', MAU['lam']); hop_pt(6.8, 'LỎNG', 'long', MAU['ngoc']); hop_pt(13.0, 'KHÍ', 'khi', MAU['do'])
    def cung(a, b, y, t, mau, up=True):
        ax.annotate('', xy=b, xytext=a, arrowprops=dict(arrowstyle='->', color=mau, lw=1.8, connectionstyle='arc3,rad=%s' % (-0.25 if up else 0.25)))
        ax.text((a[0] + b[0]) / 2, y, t, ha='center', fontsize=10.5, color=mau)
    cung((4.3, 5.6), (6.7, 5.6), 6.75, 'nóng chảy', MAU['cam']); cung((6.7, 4.0), (4.3, 4.0), 3.05, 'đông đặc', MAU['xanh'], up=False)
    cung((10.5, 5.6), (12.9, 5.6), 6.75, 'hóa hơi', MAU['cam']); cung((12.9, 4.0), (10.5, 4.0), 3.05, 'ngưng tụ', MAU['xanh'], up=False)
    ax.annotate('', xy=(14.8, 6.5), xytext=(2.4, 6.5), arrowprops=dict(arrowstyle='->', color=MAU['cam'], lw=1.8, connectionstyle='arc3,rad=-0.22'))
    ax.text(8.6, 8.35, 'thăng hoa (rắn → khí)', ha='center', fontsize=10.5, color=MAU['cam'])
    ax.annotate('', xy=(2.4, 2.0), xytext=(14.8, 2.0), arrowprops=dict(arrowstyle='->', color=MAU['xanh'], lw=1.8, connectionstyle='arc3,rad=-0.22'))
    ax.text(8.6, 0.3, 'ngưng kết (khí → rắn)', ha='center', fontsize=10.5, color=MAU['xanh'])
    luu(fig, '12-khtn/chuyen-the.svg')


def phan_ung():
    fig, ax = khung(8.4, 3.4); trong(ax)
    ax.set_xlim(0, 17.4); ax.set_ylim(0, 6.8)
    H = dict(fc='#e9eef7', ec=MAU['lam'], lw=1.6); O = dict(fc=MAU['do'], ec='#8f2338', lw=1.6)
    def h2(x, y):
        ax.add_patch(Circle((x, y), 0.45, **H)); ax.add_patch(Circle((x + 0.75, y), 0.45, **H))
        ax.text(x, y, 'H', ha='center', va='center', fontsize=10); ax.text(x + 0.75, y, 'H', ha='center', va='center', fontsize=10)
    def o2(x, y):
        ax.add_patch(Circle((x, y), 0.6, **O)); ax.add_patch(Circle((x + 1.0, y), 0.6, **O))
        ax.text(x, y, 'O', ha='center', va='center', fontsize=11, color='white'); ax.text(x + 1.0, y, 'O', ha='center', va='center', fontsize=11, color='white')
    def nuoc(x, y):
        ax.add_patch(Circle((x, y), 0.6, **O)); ax.text(x, y, 'O', ha='center', va='center', fontsize=11, color='white')
        for dx in (-0.75, 0.75):
            ax.add_patch(Circle((x + dx, y - 0.55), 0.45, **H)); ax.text(x + dx, y - 0.55, 'H', ha='center', va='center', fontsize=10)
    h2(0.9, 4.4); h2(0.9, 2.4)
    ax.text(3.2, 3.4, '+', fontsize=20, ha='center', va='center')
    o2(4.3, 3.4)
    mui_ten(ax, (6.6, 3.4), (9.4, 3.4), MAU['xanh'], 2.6)
    ax.text(8.0, 3.9, 'liên kết sắp xếp lại', ha='center', fontsize=10, color=MAU['xanh'])
    nuoc(11.2, 4.4); nuoc(11.2, 2.0)
    ax.text(2.6, 0.8, '2 phân tử hydrogen + 1 phân tử oxygen', ha='center', fontsize=10.5)
    ax.text(11.2, 0.55, '2 phân tử nước', ha='center', fontsize=10.5)
    ax.text(14.9, 4.4, 'Trước: 4 H, 2 O', fontsize=10.5, ha='center', color=MAU['lam'])
    ax.text(14.9, 3.6, 'Sau: 4 H, 2 O', fontsize=10.5, ha='center', color=MAU['lam'])
    ax.text(14.9, 2.6, 'số nguyên tử\nkhông đổi', fontsize=10.5, ha='center', color=MAU['xanh'], weight='bold')
    luu(fig, '8-khtn/phan-ung.svg')


ALL = (doan_van_200, dan_y_nlxh, bieu_do, duong_tron_lg, he_pt, menh_de, community, present_tenses, where_from, can_bang, chuyen_the, phan_ung)


if __name__ == '__main__':
    for f in ALL:
        f()
