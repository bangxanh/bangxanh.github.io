"""Bộ công cụ vẽ hình minh họa cho Bảng Xanh (SVG, nền trắng, chữ tiếng Việt).
Dùng: from bx_hinh import *  rồi  fig, ax = khung(); ...; luu(fig, '12-toan/ten-hinh.svg')
Tệp được lưu vào noi-dung/hinh/<đường dẫn>. Hình tự vẽ, không dùng ảnh có bản quyền."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Circle, Rectangle, FancyBboxPatch, Ellipse, Polygon, Wedge, Arc
import numpy as np

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'noi-dung', 'hinh')
MAU = dict(xanh='#1f5640', vang='#e8b440', lam='#2f6fde', do='#c93a58', ngoc='#0b879a', la='#55891b',
           cam='#bd7a12', tim='#7a4cc2', xam='#6b7a72', den='#1b2620', nen='#ffffff', nhat='#eef4f0')
plt.rcParams.update({
    'font.family': 'DejaVu Sans', 'font.size': 12, 'svg.fonttype': 'none',
    'axes.edgecolor': MAU['den'], 'axes.labelcolor': MAU['den'], 'xtick.color': MAU['den'], 'ytick.color': MAU['den'],
    'axes.spines.top': False, 'axes.spines.right': False, 'figure.facecolor': 'white', 'axes.facecolor': 'white',
})


def khung(w=6.4, h=4.2, truc=False):
    """Tạo hình. truc=True: trục tọa độ Oxy đi qua gốc O."""
    fig, ax = plt.subplots(figsize=(w, h), dpi=100)
    if truc:
        ax.spines['left'].set_position('zero'); ax.spines['bottom'].set_position('zero')
        ax.plot(1, 0, '>', color=MAU['den'], transform=ax.get_yaxis_transform(), clip_on=False, ms=6)
        ax.plot(0, 1, '^', color=MAU['den'], transform=ax.get_xaxis_transform(), clip_on=False, ms=6)
    return fig, ax


def trong(ax):
    """Bỏ khung trục (hình vẽ sơ đồ)."""
    ax.set_axis_off(); ax.set_aspect('equal')


def mui_ten(ax, a, b, mau=None, w=2.0, nhan=None, lech=(0, 0), **kw):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle='-|>', mutation_scale=16, color=mau or MAU['den'], lw=w, **kw))
    if nhan:
        ax.text((a[0] + b[0]) / 2 + lech[0], (a[1] + b[1]) / 2 + lech[1], nhan, color=mau or MAU['den'], ha='center', va='center', fontsize=12)


def hop(ax, x, y, w, h, chu='', mau='#eef4f0', vien=None, co=11, chu_mau=None, bo=0.12):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0,rounding_size=%s' % bo, fc=mau, ec=vien or MAU['xanh'], lw=1.6))
    if chu:
        ax.text(x + w / 2, y + h / 2, chu, ha='center', va='center', fontsize=co, color=chu_mau or MAU['den'], wrap=True)


def luu(fig, ten):
    p = os.path.join(ROOT, ten)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    fig.savefig(p, format='svg', bbox_inches='tight', pad_inches=0.12)
    plt.close(fig)
    return p
