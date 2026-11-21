"""Hình minh họa KHTN và Tiếng Anh (tự vẽ). Chạy: python3 scripts/hinh/khtn_anh.py"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from bx_hinh import *


def nhan(ax, xy, xytext, chu, mau=None, ha='left'):
    ax.annotate(chu, xy=xy, xytext=xytext, fontsize=11, color=mau or MAU['den'], ha=ha, va='center',
                arrowprops=dict(arrowstyle='-', color=MAU['xam'], lw=1))


# 1. KHTN 6 – tế bào động vật và tế bào thực vật
def te_bao():
    fig, ax = khung(9.2, 4.6); trong(ax)
    ax.set_xlim(0, 18.4); ax.set_ylim(0, 9.2)
    # Tế bào động vật
    ax.add_patch(Ellipse((4.3, 4.6), 6.6, 5.2, fc='#fde9ec', ec=MAU['do'], lw=2.2))
    ax.add_patch(Circle((4.7, 4.9), 1.15, fc='#c9b6ef', ec=MAU['tim'], lw=1.8))
    ax.add_patch(Circle((4.9, 5.1), 0.35, fc=MAU['tim'], ec='none'))
    for (x, y) in [(2.6, 3.4), (6.3, 3.6), (2.9, 6.0), (6.0, 6.4)]:
        ax.add_patch(Ellipse((x, y), 0.9, 0.42, angle=25, fc='#f4b183', ec=MAU['cam'], lw=1.2))
    nhan(ax, (1.4, 5.8), (-0.2, 7.9), 'Màng tế bào')
    nhan(ax, (4.4, 5.9), (4.2, 8.9), 'Nhân')
    nhan(ax, (6.3, 3.6), (5.6, 0.6), 'Ti thể')
    nhan(ax, (3.4, 2.7), (0.4, 0.8), 'Tế bào chất')
    ax.text(4.3, -0.15, 'Tế bào động vật', ha='center', fontsize=13, color=MAU['do'], weight='bold')
    # Tế bào thực vật
    ax.add_patch(FancyBboxPatch((10.6, 1.4), 6.6, 6.4, boxstyle='round,pad=0,rounding_size=0.5', fc='#e4f3d6', ec=MAU['la'], lw=4))
    ax.add_patch(FancyBboxPatch((10.85, 1.65), 6.1, 5.9, boxstyle='round,pad=0,rounding_size=0.4', fc='#eef8e4', ec=MAU['xanh'], lw=1.2))
    ax.add_patch(FancyBboxPatch((12.6, 2.6), 3.4, 3.6, boxstyle='round,pad=0,rounding_size=0.6', fc='#d7ecfb', ec=MAU['lam'], lw=1.5))
    ax.add_patch(Circle((11.9, 6.4), 0.75, fc='#c9b6ef', ec=MAU['tim'], lw=1.8))
    for (x, y) in [(11.6, 3.0), (11.7, 4.6), (16.4, 6.6), (16.5, 2.4), (14.2, 7.0)]:
        ax.add_patch(Ellipse((x, y), 0.95, 0.5, angle=-20, fc='#5fae3c', ec=MAU['la'], lw=1.2))
    nhan(ax, (17.2, 5.0), (17.45, 8.7), 'Thành tế bào', ha='right')
    nhan(ax, (14.3, 4.4), (14.3, 0.55), 'Không bào', ha='center')
    nhan(ax, (11.9, 6.9), (10.2, 8.9), 'Nhân')
    nhan(ax, (11.6, 3.0), (9.2, 2.2), 'Lục lạp', ha='right')
    ax.text(13.9, -0.15, 'Tế bào thực vật', ha='center', fontsize=13, color=MAU['la'], weight='bold')
    luu(fig, '6-khtn/te-bao.svg')


# 2. KHTN 7 – định luật phản xạ ánh sáng
def phan_xa():
    fig, ax = khung(6.4, 4.4); trong(ax)
    ax.set_xlim(-5, 5); ax.set_ylim(-1.2, 5.4)
    ax.add_patch(Rectangle((-4.5, -0.6), 9, 0.6, fc='#cfe3f7', ec=MAU['lam'], lw=1.5, hatch='////'))
    ax.text(3.2, -0.95, 'Gương phẳng', fontsize=11, color=MAU['lam'], ha='center')
    ax.plot([0, 0], [0, 4.8], ls='--', color=MAU['xam'], lw=1.4)
    ax.text(0.15, 4.95, 'N (pháp tuyến)', fontsize=11, color=MAU['xam'])
    S = (-3.2, 4.0); R = (3.2, 4.0)
    mui_ten(ax, S, (-1.6, 2.0), MAU['cam'], 2.4); ax.plot([S[0], 0], [S[1], 0], color=MAU['cam'], lw=2.4)
    ax.plot([0, R[0]], [0, R[1]], color=MAU['do'], lw=2.4); mui_ten(ax, (0, 0), (1.9, 2.375), MAU['do'], 2.4)
    ax.text(-3.4, 4.3, 'S', fontsize=13, weight='bold'); ax.text(3.3, 4.3, 'R', fontsize=13, weight='bold')
    ax.text(-0.45, 0.2, 'I', fontsize=13, weight='bold', ha='center')
    ax.add_patch(Arc((0, 0), 2.4, 2.4, theta1=90, theta2=90 + 38.66, color=MAU['cam'], lw=1.6))
    ax.add_patch(Arc((0, 0), 2.0, 2.0, theta1=90 - 38.66, theta2=90, color=MAU['do'], lw=1.6))
    ax.text(-0.75, 1.55, 'i', fontsize=14, color=MAU['cam'], style='italic')
    ax.text(0.45, 1.35, "i'", fontsize=14, color=MAU['do'], style='italic')
    ax.text(-4.6, 2.3, 'Tia tới', fontsize=11, color=MAU['cam'])
    ax.text(2.6, 2.3, 'Tia phản xạ', fontsize=11, color=MAU['do'])
    ax.text(0, 5.35, "Góc phản xạ = góc tới:  i' = i", ha='center', fontsize=12, color=MAU['xanh'], weight='bold')
    luu(fig, '7-khtn/phan-xa.svg')


# 3. KHTN 8 – lực đẩy Archimedes
def archimedes():
    fig, ax = khung(6.0, 4.6); trong(ax)
    ax.set_xlim(0, 10); ax.set_ylim(-0.7, 7.6)
    ax.plot([1.5, 1.5, 8.5, 8.5], [6.6, 0.6, 0.6, 6.6], color=MAU['den'], lw=2.4)
    ax.add_patch(Rectangle((1.5, 0.6), 7, 4.8, fc='#d7ecfb', ec='none'))
    ax.plot([1.5, 8.5], [5.4, 5.4], color=MAU['lam'], lw=1.6)
    ax.add_patch(Rectangle((4.0, 1.9), 2.0, 1.8, fc='#f4c27a', ec=MAU['cam'], lw=2))
    ax.text(5.0, 2.8, 'Vật', ha='center', va='center', fontsize=12)
    mui_ten(ax, (5.0, 1.9), (5.0, 0.95), MAU['do'], 2.6)
    ax.text(5.35, 1.2, 'P', fontsize=14, color=MAU['do'], weight='bold')
    mui_ten(ax, (5.0, 3.7), (5.0, 5.15), MAU['xanh'], 2.6)
    ax.text(5.3, 4.6, 'F_A', fontsize=14, color=MAU['xanh'], weight='bold')
    ax.text(6.4, 4.9, 'Chất lỏng', fontsize=11, color=MAU['lam'])
    ax.text(5.0, 7.2, 'F_A = d · V', ha='center', fontsize=14, color=MAU['xanh'], weight='bold')
    ax.text(5.0, -0.35, 'd: trọng lượng riêng chất lỏng (N/m³) · V: thể tích phần chìm (m³)', ha='center', fontsize=9.5, color=MAU['xam'])
    luu(fig, '8-khtn/archimedes.svg')


# 4. KHTN 9 – đồ thị I theo U (định luật Ohm)
def ohm():
    fig, ax = khung(6.0, 4.2)
    U = np.linspace(0, 12, 50)
    ax.plot(U, U / 10, color=MAU['lam'], lw=2.6, label='R₁ = 10 Ω')
    ax.plot(U, U / 20, color=MAU['do'], lw=2.6, label='R₂ = 20 Ω')
    ax.plot([6, 6, 0], [0, 0.6, 0.6], ls=':', color=MAU['xam']); ax.plot([6, 0], [0.3, 0.3], ls=':', color=MAU['xam'])
    ax.plot([6], [0.6], 'o', color=MAU['lam']); ax.plot([6], [0.3], 'o', color=MAU['do'])
    ax.set_xlim(0, 12.5); ax.set_ylim(0, 1.3)
    ax.set_xlabel('U (V)'); ax.set_ylabel('I (A)')
    ax.set_xticks([0, 3, 6, 9, 12]); ax.set_yticks([0, 0.3, 0.6, 0.9, 1.2])
    ax.legend(frameon=False, loc='upper left')
    ax.text(8.6, 0.25, 'I = U / R', fontsize=14, color=MAU['xanh'], weight='bold')
    luu(fig, '9-khtn/ohm.svg')


# 5. Vật lí 10 – đồ thị v – t của chuyển động thẳng biến đổi đều
def vt():
    fig, ax = khung(6.0, 4.2)
    t = np.array([0, 6]); v = 2 + 1.5 * t
    ax.fill_between(t, 0, v, color='#d7ecfb')
    ax.plot(t, v, color=MAU['lam'], lw=2.8)
    ax.plot([6, 6], [0, 11], ls=':', color=MAU['xam']); ax.plot([0, 6], [11, 11], ls=':', color=MAU['xam'])
    ax.set_xlim(0, 7); ax.set_ylim(0, 13)
    ax.set_xlabel('t (s)'); ax.set_ylabel('v (m/s)')
    ax.set_xticks([0, 2, 4, 6]); ax.set_yticks([0, 2, 5, 8, 11])
    ax.text(3, 3.0, 'Diện tích = độ dịch chuyển d', ha='center', fontsize=11.5, color=MAU['xanh'])
    ax.text(1.4, 8.6, 'v = v₀ + a·t', fontsize=13, color=MAU['lam'], weight='bold', rotation=27)
    ax.text(0.2, 1.0, 'v₀ = 2 m/s', fontsize=11, color=MAU['lam'])
    luu(fig, '10-khtn/vt-bien-doi-deu.svg')


# 6. Hóa học 10 – mô hình nguyên tử
def nguyen_tu():
    fig, ax = khung(6.6, 4.6); trong(ax)
    ax.set_xlim(-5.6, 7.6); ax.set_ylim(-4.6, 4.6)
    for r in (1.9, 3.6):
        ax.add_patch(Circle((0, 0), r, fc='none', ec=MAU['xam'], lw=1.3, ls='--'))
    pts = [(-0.28, 0.2, 'p'), (0.3, 0.25, 'n'), (0.0, -0.3, 'p'), (-0.35, -0.35, 'n'), (0.35, -0.3, 'p'), (0.02, 0.62, 'n')]
    for x, y, k in pts:
        ax.add_patch(Circle((x, y), 0.34, fc=MAU['do'] if k == 'p' else '#9aa8a0', ec='white', lw=1))
        ax.text(x, y, '+' if k == 'p' else '', ha='center', va='center', color='white', fontsize=10, weight='bold')
    for ang, r in [(90, 1.9), (270, 1.9), (30, 3.6), (150, 3.6), (210, 3.6), (330, 3.6)]:
        a = np.radians(ang); x, y = r * np.cos(a), r * np.sin(a)
        ax.add_patch(Circle((x, y), 0.26, fc=MAU['lam'], ec='white', lw=1))
        ax.text(x, y, '−', ha='center', va='center', color='white', fontsize=10, weight='bold')
    ax.text(4.4, 3.3, 'Electron (e)', fontsize=11.5, color=MAU['lam'], weight='bold')
    ax.text(4.4, 2.75, 'điện tích −1, rất nhẹ', fontsize=10, color=MAU['lam'])
    ax.text(4.4, 0.9, 'Hạt nhân', fontsize=11.5, color=MAU['den'], weight='bold')
    ax.text(4.4, 0.35, 'Proton (p): +1', fontsize=10.5, color=MAU['do'])
    ax.text(4.4, -0.2, 'Neutron (n): 0', fontsize=10.5, color=MAU['xam'])
    ax.text(4.4, -2.0, 'Nguyên tử trung hòa:', fontsize=10.5, color=MAU['xanh'])
    ax.text(4.4, -2.55, 'số p = số e', fontsize=11.5, color=MAU['xanh'], weight='bold')
    ax.annotate('', xy=(0.6, 0.1), xytext=(4.3, 0.6), arrowprops=dict(arrowstyle='->', color=MAU['xam']))
    ax.text(0, -4.3, 'Mô hình nguyên tử carbon (6p, 6n, 6e) – kích thước không theo tỉ lệ', ha='center', fontsize=9.5, color=MAU['xam'])
    luu(fig, '10-khtn/nguyen-tu.svg')


# 7. Sinh học 10 – tế bào nhân sơ
def nhan_so():
    fig, ax = khung(8.0, 4.0); trong(ax)
    ax.set_xlim(0, 16); ax.set_ylim(0, 8)
    ax.add_patch(FancyBboxPatch((3.0, 2.2), 9.0, 3.6, boxstyle='round,pad=0,rounding_size=1.8', fc='#fff3d6', ec=MAU['cam'], lw=1.5, ls='--'))
    ax.add_patch(FancyBboxPatch((3.35, 2.55), 8.3, 2.9, boxstyle='round,pad=0,rounding_size=1.45', fc='#e4f3d6', ec=MAU['la'], lw=3.2))
    ax.add_patch(FancyBboxPatch((3.6, 2.8), 7.8, 2.4, boxstyle='round,pad=0,rounding_size=1.2', fc='#f3faee', ec=MAU['xanh'], lw=1.2))
    th = np.linspace(0, 2 * np.pi, 200)
    ax.plot(7.6 + 1.6 * np.cos(th) + 0.25 * np.sin(5 * th), 4.0 + 0.7 * np.sin(th) + 0.2 * np.cos(7 * th), color=MAU['tim'], lw=1.8)
    ax.add_patch(Circle((5.0, 3.5), 0.38, fc='none', ec=MAU['do'], lw=1.6))
    rng = np.random.default_rng(3)
    for _ in range(26):
        x, y = rng.uniform(4.2, 10.8), rng.uniform(3.0, 5.0)
        if (x - 7.6) ** 2 / 3.2 + (y - 4) ** 2 / 0.6 > 1:
            ax.add_patch(Circle((x, y), 0.07, fc=MAU['den'], ec='none'))
    xs = np.linspace(12.0, 15.6, 100); ax.plot(xs, 4.0 + 0.3 * np.sin((xs - 12) * 4), color=MAU['den'], lw=1.6)
    for x in (4.2, 5.4, 6.6, 7.8, 9.0, 10.2):
        ax.plot([x, x - 0.15], [5.8, 6.3], color=MAU['xam'], lw=1.2); ax.plot([x, x + 0.1], [2.2, 1.7], color=MAU['xam'], lw=1.2)
    nhan(ax, (7.6, 4.7), (6.8, 7.6), 'Vùng nhân (DNA vòng)')
    nhan(ax, (5.0, 3.88), (0.1, 5.7), 'Plasmid')
    nhan(ax, (9.9, 3.2), (12.6, 1.0), 'Ribosome')
    nhan(ax, (3.6, 4.4), (0.1, 4.2), 'Màng sinh chất')
    nhan(ax, (3.36, 3.0), (0.1, 1.6), 'Thành tế bào')
    nhan(ax, (11.5, 5.6), (12.4, 7.3), 'Vỏ nhầy')
    nhan(ax, (4.2, 6.2), (2.4, 7.6), 'Lông')
    ax.text(14.0, 4.7, 'Roi', fontsize=11)
    ax.text(8.0, 0.25, 'Tế bào nhân sơ (vi khuẩn): chưa có màng nhân, chỉ có ribosome', ha='center', fontsize=10.5, color=MAU['xanh'])
    luu(fig, '10-khtn/te-bao-nhan-so.svg')


# 8. Vật lí 11 – đồ thị li độ – thời gian của dao động điều hòa
def dao_dong():
    fig, ax = khung(6.4, 3.8, truc=True)
    t = np.linspace(0, 2.6, 400); x = 5 * np.cos(np.pi * t)
    ax.plot(t, x, color=MAU['lam'], lw=2.6)
    ax.set_xlim(-0.05, 2.8); ax.set_ylim(-6.8, 7.2)
    ax.plot([0, 2.6], [5, 5], ls=':', color=MAU['xam']); ax.plot([0, 2.6], [-5, -5], ls=':', color=MAU['xam'])
    ax.annotate('', xy=(0, 6.2), xytext=(2, 6.2), arrowprops=dict(arrowstyle='<->', color=MAU['do'], lw=1.6))
    ax.text(1.0, 6.5, 'Chu kì T = 2 s', ha='center', fontsize=11.5, color=MAU['do'])
    ax.annotate('', xy=(2.0, 0), xytext=(2.0, 5), arrowprops=dict(arrowstyle='<->', color=MAU['xanh'], lw=1.6))
    ax.text(2.06, 2.4, 'A = 5 cm', fontsize=11.5, color=MAU['xanh'])
    ax.set_xticks([1, 2]); ax.set_yticks([-5, 5])
    ax.text(2.72, -1.2, 't (s)', fontsize=11); ax.text(0.05, 6.9, 'x (cm)', fontsize=11)
    ax.text(1.65, -6.4, 'x = 5cos(πt) (cm)', fontsize=12, color=MAU['lam'], weight='bold')
    luu(fig, '11-khtn/dao-dong.svg')


# 9. Tiếng Anh 3 – Hello (nhân vật tự vẽ)
def hello():
    fig, ax = khung(7.0, 3.6); trong(ax)
    ax.set_xlim(0, 14); ax.set_ylim(0, 7.2)
    def nguoi(x, mau_ao, toc):
        ax.add_patch(Circle((x, 3.6), 0.95, fc='#f6d2b0', ec=MAU['den'], lw=1.4))
        ax.add_patch(Wedge((x, 3.75), 1.0, 10, 170, fc=toc, ec='none'))
        ax.add_patch(Circle((x - 0.32, 3.5), 0.09, fc=MAU['den'])); ax.add_patch(Circle((x + 0.32, 3.5), 0.09, fc=MAU['den']))
        ax.add_patch(Arc((x, 3.2), 0.7, 0.45, theta1=200, theta2=340, color=MAU['den'], lw=1.6))
        ax.add_patch(FancyBboxPatch((x - 1.0, 0.4), 2.0, 2.15, boxstyle='round,pad=0,rounding_size=0.45', fc=mau_ao, ec=MAU['den'], lw=1.4))
    nguoi(3.0, '#f0a3b5', '#3b2a20'); nguoi(11.0, '#8fc1f2', '#7a4a22')
    ax.add_patch(FancyBboxPatch((0.4, 5.0), 5.4, 1.7, boxstyle='round,pad=0.1,rounding_size=0.5', fc='white', ec=MAU['do'], lw=1.8))
    ax.add_patch(Polygon([(2.6, 5.0), (3.1, 5.0), (2.9, 4.55)], fc='white', ec=MAU['do'], lw=1.8))
    ax.text(3.1, 5.85, "Hello. I'm Mai.", ha='center', va='center', fontsize=14, color=MAU['do'], weight='bold')
    ax.add_patch(FancyBboxPatch((8.1, 5.0), 5.5, 1.7, boxstyle='round,pad=0.1,rounding_size=0.5', fc='white', ec=MAU['lam'], lw=1.8))
    ax.add_patch(Polygon([(10.9, 5.0), (11.4, 5.0), (11.1, 4.55)], fc='white', ec=MAU['lam'], lw=1.8))
    ax.text(10.85, 5.85, "Hi, Mai. I'm Ben.", ha='center', va='center', fontsize=14, color=MAU['lam'], weight='bold')
    ax.text(7.0, 1.4, 'Hello / Hi = Xin chào', ha='center', fontsize=12, color=MAU['xanh'])
    luu(fig, '3-anh/hello.svg')


# 10. Tiếng Anh 6 – sơ đồ từ vựng My New School
def school_map():
    fig, ax = khung(8.6, 4.8); trong(ax)
    ax.set_xlim(0, 17.2); ax.set_ylim(0, 9.6)
    nhom = [
        ((0.1, 7.0), 'School things', 'pencil case · ruler · rubber\ncalculator · compass · textbook', MAU['lam'], '#e3eefc'),
        ((11.1, 7.0), 'Subjects', 'maths · science · history\nEnglish · music · art', MAU['do'], '#fde9ec'),
        ((0.1, 0.5), 'Verbs', 'have + lessons · do + homework\nstudy + maths · play + football', MAU['cam'], '#fdf0dc'),
        ((11.1, 0.5), 'People & places', 'classmate · teacher · library\nschool garden · gym · canteen', MAU['la'], '#e8f4dc'),
    ]
    for (x, y), tieu_de, tu, mau, nen in nhom:
        cx = x + (6.0 if x < 6 else 0); cy = y + (0 if y > 5 else 2.1)
        ax.plot([cx, 8.6], [cy, 4.85], color=mau, lw=2, zorder=0)
        hop(ax, x, y, 6.0, 2.1, '', mau=nen, vien=mau)
        ax.text(x + 3.0, y + 1.6, tieu_de, ha='center', fontsize=12.5, color=mau, weight='bold')
        ax.text(x + 3.0, y + 0.75, tu, ha='center', va='center', fontsize=10, color=MAU['den'], linespacing=1.5)
    hop(ax, 6.0, 4.2, 5.2, 1.3, 'MY NEW SCHOOL', mau=MAU['xanh'], vien=MAU['xanh'], co=12.5, chu_mau='white')
    luu(fig, '6-anh/school-map.svg')


# 11. Tiếng Anh 12 – past simple và past continuous
def past_tenses():
    fig, ax = khung(8.0, 3.2); trong(ax)
    ax.set_xlim(0, 16); ax.set_ylim(0, 6.4)
    mui_ten(ax, (0.5, 2.2), (15.5, 2.2), MAU['den'], 1.8)
    ax.text(15.3, 1.6, 'thời gian', fontsize=10, color=MAU['xam'], ha='right')
    ax.text(13.6, 2.7, 'now', fontsize=11, color=MAU['xam']); ax.plot([13.6, 13.6], [2.0, 2.4], color=MAU['xam'])
    ax.add_patch(FancyBboxPatch((2.2, 2.7), 7.0, 0.8, boxstyle='round,pad=0,rounding_size=0.3', fc='#d7ecfb', ec=MAU['lam'], lw=1.6))
    ax.text(5.7, 3.1, 'She was writing her memoir …', ha='center', va='center', fontsize=11.5, color=MAU['lam'])
    ax.plot([6.6], [2.2], marker='v', ms=16, color=MAU['do'])
    ax.text(6.6, 1.15, '… when the phone rang.', ha='center', fontsize=11.5, color=MAU['do'], weight='bold')
    ax.text(5.7, 4.3, 'Past continuous: hành động đang diễn ra (nền)', ha='center', fontsize=10.5, color=MAU['lam'])
    ax.text(6.6, 0.4, 'Past simple: hành động ngắn xen vào', ha='center', fontsize=10.5, color=MAU['do'])
    ax.text(8.0, 5.7, 'was/were + V-ing   vs   V2/V-ed', ha='center', fontsize=12.5, color=MAU['xanh'], weight='bold')
    luu(fig, '12-anh/past-tenses.svg')


if __name__ == '__main__':
    for f in (te_bao, phan_xa, archimedes, ohm, vt, nguyen_tu, nhan_so, dao_dong, hello, school_map, past_tenses):
        f()
    print('Đã vẽ 11 hình.')
