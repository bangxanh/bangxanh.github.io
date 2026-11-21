"""Hình minh họa Toán 12 (chạy: python3 scripts/hinh/toan12.py)."""
from bx_hinh import *

# Bài 1 – đồ thị y = x³ − 3x + 2, cực đại, cực tiểu, khoảng đơn điệu
fig, ax = khung(6.4, 4.4, truc=True)
x = np.linspace(-2.25, 2.1, 300); y = x**3 - 3*x + 2
ax.plot(x[x <= -1], y[x <= -1], color=MAU['la'], lw=3, label='đồng biến (y\' > 0)')
ax.plot(x[(x >= -1) & (x <= 1)], y[(x >= -1) & (x <= 1)], color=MAU['do'], lw=3, label='nghịch biến (y\' < 0)')
ax.plot(x[x >= 1], y[x >= 1], color=MAU['la'], lw=3)
ax.plot([-1, 1], [4, 0], 'o', color=MAU['xanh'], ms=8, zorder=5)
ax.annotate('Cực đại (−1; 4)', (-1, 4), (-2.2, 5.1), fontsize=11, color=MAU['xanh'], arrowprops=dict(arrowstyle='->', color=MAU['xanh']))
ax.annotate('Cực tiểu (1; 0)', (1, 0), (-1.05, -1.5), fontsize=11, color=MAU['xanh'], arrowprops=dict(arrowstyle='->', color=MAU['xanh']))
ax.plot([-1, -1], [0, 4], ':', color=MAU['xam']); ax.set_ylim(-2.2, 5.8); ax.set_xlim(-2.4, 2.4)
ax.set_xticks([-2, -1, 1, 2]); ax.set_yticks([2, 4])
ax.text(2.15, 5.3, 'y = x³ − 3x + 2', fontsize=12, ha='right', color=MAU['den'])
ax.legend(loc='lower right', fontsize=10, frameon=False)
luu(fig, '12-toan/bai1-cuc-tri.svg')

# Bài 3 – tiệm cận của y = (2x − 1)/(x + 1)
fig, ax = khung(6.4, 4.4, truc=True)
for xs in (np.linspace(-6, -1.15, 200), np.linspace(-0.88, 5, 200)):
    ax.plot(xs, (2*xs - 1)/(xs + 1), color=MAU['lam'], lw=3)
ax.axvline(-1, ls='--', color=MAU['do'], lw=1.8); ax.axhline(2, ls='--', color=MAU['cam'], lw=1.8)
ax.text(-0.9, 7.2, 'Tiệm cận đứng x = −1', color=MAU['do'], fontsize=11)
ax.text(2.0, 2.4, 'Tiệm cận ngang y = 2', color=MAU['cam'], fontsize=11)
ax.text(-5.8, -5.5, 'y = (2x − 1)/(x + 1)', color=MAU['lam'], fontsize=12)
ax.set_xlim(-6, 5); ax.set_ylim(-7, 8); ax.set_xticks([-4, -2, 2, 4]); ax.set_yticks([-4, 4])
luu(fig, '12-toan/bai3-tiem-can.svg')

# Bài 4 – biện luận số nghiệm x³ − 3x² + 2 = m
fig, ax = khung(6.4, 4.4, truc=True)
x = np.linspace(-1.3, 3.25, 300); ax.plot(x, x**3 - 3*x**2 + 2, color=MAU['lam'], lw=3)
for m, c, t in ((3, MAU['xam'], 'm = 3: 1 nghiệm'), (2, MAU['cam'], 'm = 2: 2 nghiệm'), (0.8, MAU['la'], 'm = 0,8: 3 nghiệm')):
    ax.axhline(m, color=c, lw=1.6, ls='--'); ax.text(-1.35, m + 0.12, t, color=c, fontsize=10, ha='left')
ax.plot([0, 2, 1], [2, -2, 0], 'o', color=MAU['xanh'], ms=7)
ax.text(1.08, 0.22, 'I(1; 0) tâm đối xứng', fontsize=10, color=MAU['xanh'])
ax.text(2.05, -2.45, 'CT (2; −2)', fontsize=10, color=MAU['xanh']); ax.text(0.12, 2.12, 'CĐ (0; 2)', fontsize=10, color=MAU['xanh'])
ax.set_xlim(-1.4, 3.4); ax.set_ylim(-3, 3.6); ax.set_xticks([-1, 1, 2, 3]); ax.set_yticks([-2, 2])
luu(fig, '12-toan/bai4-bien-luan.svg')

# Bài 6 – quy tắc hình hộp
fig, ax = khung(6, 4.4); trong(ax)
o = np.array([0, 0]); a = np.array([3.2, 0]); d = np.array([1.2, 1.25]); h = np.array([0, 2.2])
P = {'A': o, 'B': a, 'D': d, 'C': a + d, "A'": h, "B'": a + h, "D'": d + h, "C'": a + d + h}
for u, v in [('A', 'B'), ('B', 'C'), ("A'", "B'"), ("B'", "C'"), ("C'", "D'"), ("D'", "A'"), ('A', "A'"), ('B', "B'"), ('C', "C'")]:
    ax.plot(*zip(P[u], P[v]), color=MAU['xam'], lw=1.4)
for u, v in [('A', 'D'), ('D', 'C'), ('D', "D'")]:
    ax.plot(*zip(P[u], P[v]), color=MAU['xam'], lw=1.2, ls='--')
mui_ten(ax, P['A'], P['B'], MAU['lam'], 2.6); mui_ten(ax, P['A'], P['D'], MAU['la'], 2.6); mui_ten(ax, P['A'], P["A'"], MAU['cam'], 2.6)
mui_ten(ax, P['A'], P["C'"], MAU['do'], 3)
LECH = {'A': (-0.32, -0.28), 'B': (0.1, -0.3), 'C': (0.12, -0.12), 'D': (-0.38, 0.05), "A'": (-0.42, 0.05), "B'": (0.1, -0.32), "C'": (0.1, 0.08), "D'": (-0.2, 0.12)}
for k, v in P.items():
    ax.text(v[0] + LECH[k][0], v[1] + LECH[k][1], k, fontsize=13, color=MAU['den'])
ax.text(0.1, -0.9, 'AB→ + AD→ + AA\'→ = AC\'→', fontsize=14, color=MAU['do'])
ax.set_xlim(-0.6, 5); ax.set_ylim(-1.2, 3.5)
luu(fig, '12-toan/bai6-hinh-hop.svg')

# Bài 9 – mẫu số liệu ghép nhóm, Q1 và Q3
fig, ax = khung(6.4, 4)
edges = [0, 10, 20, 30, 40, 50]; f = [4, 10, 14, 8, 4]
ax.bar([e + 5 for e in edges[:-1]], f, width=10, color=MAU['ngoc'], alpha=0.75, edgecolor='white')
for q, t, c in ((16, 'Q₁ = 16', MAU['do']), (32.5, 'Q₃ = 32,5', MAU['cam'])):
    ax.axvline(q, color=c, lw=2.2, ls='--'); ax.text(q + 0.6, 14.2, t, color=c, fontsize=11)
ax.annotate('', (16, 15.6), (32.5, 15.6), arrowprops=dict(arrowstyle='<->', color=MAU['xanh'], lw=1.6))
ax.text(24.2, 16.0, 'ΔQ = 16,5', ha='center', color=MAU['xanh'], fontsize=11)
ax.set_xticks(edges); ax.set_xlabel('Thời gian tự học (phút)'); ax.set_ylabel('Số học sinh'); ax.set_ylim(0, 17.5)
luu(fig, '12-toan/bai9-tu-phan-vi.svg')

# Bài 12 – ý nghĩa hình học của tích phân
fig, ax = khung(6.4, 4.2, truc=True)
x = np.linspace(-0.2, 3.3, 300); y = 0.4*x**2 + 0.6
ax.plot(x, y, color=MAU['lam'], lw=3)
xs = np.linspace(0.6, 2.6, 200); ax.fill_between(xs, 0.4*xs**2 + 0.6, color=MAU['vang'], alpha=0.55)
ax.plot([0.6, 0.6], [0, 0.4*0.36 + 0.6], color=MAU['xam'], ls=':'); ax.plot([2.6, 2.6], [0, 0.4*6.76 + 0.6], color=MAU['xam'], ls=':')
ax.text(1.55, 0.9, 'S = ∫ₐᵇ f(x)dx', ha='center', fontsize=13, color=MAU['xanh'])
ax.text(0.6, -0.35, 'a', ha='center', fontsize=12); ax.text(2.6, -0.35, 'b', ha='center', fontsize=12)
ax.text(2.75, 3.9, 'y = f(x)', fontsize=12, color=MAU['lam'])
ax.set_xticks([]); ax.set_yticks([]); ax.set_xlim(-0.3, 3.4); ax.set_ylim(-0.5, 4.6)
luu(fig, '12-toan/bai12-dien-tich.svg')

# Bài 13 – diện tích giữa y = x và y = x², khối tròn xoay
fig, (a1, a2) = plt.subplots(1, 2, figsize=(8.4, 3.8), dpi=100)
x = np.linspace(-0.15, 1.25, 200)
a1.plot(x, x, color=MAU['lam'], lw=2.6, label='y = x'); a1.plot(x, x**2, color=MAU['do'], lw=2.6, label='y = x²')
xs = np.linspace(0, 1, 100); a1.fill_between(xs, xs**2, xs, color=MAU['vang'], alpha=0.6)
a1.annotate('S = 1/6', (0.5, 0.37), (0.85, 0.12), fontsize=12, color=MAU['xanh'], arrowprops=dict(arrowstyle='->', color=MAU['xanh']))
a1.axhline(0, color=MAU['den'], lw=1); a1.axvline(0, color=MAU['den'], lw=1); a1.legend(frameon=False, fontsize=10, loc='upper left')
a1.set_title('Diện tích hình phẳng', fontsize=12); a1.set_xticks([0, 1]); a1.set_yticks([0, 1])
x = np.linspace(0, 4, 200); r = np.sqrt(x)
a2.plot(x, r, color=MAU['lam'], lw=2.4); a2.plot(x, -r, color=MAU['lam'], lw=1.4, ls='--')
for xi in (1, 2, 3, 4):
    a2.add_patch(Ellipse((xi, 0), 0.35, 2*np.sqrt(xi), fill=False, ec=MAU['ngoc'], lw=1.3))
a2.axhline(0, color=MAU['den'], lw=1); a2.text(2.0, 2.15, 'V = π∫₀⁴ x dx = 8π', ha='center', fontsize=12, color=MAU['xanh'])
a2.text(3.0, 1.95, '', fontsize=1); a2.set_title('Quay y = √x quanh trục Ox', fontsize=12); a2.set_xticks([0, 4]); a2.set_yticks([]); a2.set_ylim(-2.4, 2.6)
for a in (a1, a2):
    a.spines['top'].set_visible(False); a.spines['right'].set_visible(False)
luu(fig, '12-toan/bai13-ung-dung.svg')

# Bài 14 – mặt phẳng và vectơ pháp tuyến
fig, ax = khung(6, 4.2); trong(ax)
ax.add_patch(Polygon([(0, 0), (4, 0), (5.4, 1.6), (1.4, 1.6)], closed=True, fc='#dbeafe', ec=MAU['lam'], lw=1.6))
ax.text(4.6, 0.35, '(P)', fontsize=14, color=MAU['lam'])
m0 = (2.7, 0.8); ax.plot(*m0, 'o', color=MAU['den']); ax.text(2.82, 0.55, 'M₀', fontsize=12)
mui_ten(ax, m0, (2.7, 3.2), MAU['do'], 2.8); ax.text(2.85, 3.0, 'n→ = (A; B; C)', fontsize=12, color=MAU['do'])
mui_ten(ax, m0, (4.1, 1.25), MAU['la'], 2.2); ax.text(3.6, 1.32, 'M', fontsize=12)
ax.text(0.0, -0.75, 'M ∈ (P) ⇔ n→ · M₀M→ = 0 ⇔ A(x − x₀) + B(y − y₀) + C(z − z₀) = 0', fontsize=11, color=MAU['den'])
ax.set_xlim(-0.2, 6.2); ax.set_ylim(-1.0, 3.5)
luu(fig, '12-toan/bai14-mat-phang.svg')

# Bài 18 – sơ đồ hình cây lấy bi không hoàn lại
def cay(ax, goc, nhanh, x0=0.2, y0=2.0):
    ax.text(x0 - 0.15, y0, goc, ha='right', va='center', fontsize=11)
    for (t1, p1, con) in nhanh:
        y1 = y0 + con[0]
        ax.plot([x0, 2.2], [y0, y1], color=MAU['xam'], lw=1.4); ax.text(1.15, (y0 + y1) / 2 + 0.12, p1, fontsize=11, color=MAU['lam'], ha='center')
        hop(ax, 2.2, y1 - 0.22, 1.2, 0.44, t1, co=10)
        for (t2, p2, dy, kq) in con[1]:
            y2 = y1 + dy
            ax.plot([3.4, 5.2], [y1, y2], color=MAU['xam'], lw=1.4); ax.text(4.3, (y1 + y2) / 2 + 0.12, p2, fontsize=11, color=MAU['lam'], ha='center')
            hop(ax, 5.2, y2 - 0.22, 1.2, 0.44, t2, co=10)
            ax.text(6.55, y2, kq, va='center', fontsize=11, color=MAU['xanh'])
fig, ax = khung(7.6, 4.0); trong(ax)
cay(ax, 'Hộp: 5 đỏ, 3 xanh', [('Đỏ', '5/8', (1.0, [('Đỏ', '4/7', 0.55, '5/8 · 4/7 = 5/14'), ('Xanh', '3/7', -0.55, '15/56')])),
                                ('Xanh', '3/8', (-1.0, [('Đỏ', '5/7', 0.55, '15/56'), ('Xanh', '2/7', -0.55, '6/56')]))], x0=1.4)
ax.text(2.8, 4.05, 'Lần 1', fontsize=11, color=MAU['xam'], ha='center'); ax.text(5.8, 4.05, 'Lần 2 (không hoàn lại)', fontsize=11, color=MAU['xam'], ha='center')
ax.set_xlim(-1.8, 8.4); ax.set_ylim(0.0, 4.35)
luu(fig, '12-toan/bai18-so-do-cay.svg')

# Bài 19 – công thức xác suất toàn phần và Bayes (nhà máy)
fig, ax = khung(7.6, 3.8); trong(ax)
cay(ax, 'Sản phẩm', [('Máy I', '0,6', (0.95, [('Lỗi', '0,02', 0.45, '0,6 · 0,02 = 0,012'), ('Tốt', '0,98', -0.45, '')])),
                     ('Máy II', '0,4', (-0.95, [('Lỗi', '0,03', 0.45, '0,4 · 0,03 = 0,012'), ('Tốt', '0,97', -0.45, '')]))], x0=1.0)
ax.text(-0.9, 0.15, 'P(lỗi) = 0,012 + 0,012 = 0,024  ·  P(máy I | lỗi) = 0,012 / 0,024 = 0,5', fontsize=11, color=MAU['do'])
ax.set_xlim(-1.4, 9.0); ax.set_ylim(-0.1, 3.6)
luu(fig, '12-toan/bai19-bayes.svg')
print('Đã vẽ hình Toán 12')
