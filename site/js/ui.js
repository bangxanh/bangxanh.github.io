/* Tiện ích giao diện dùng chung */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  /* Định dạng văn bản học liệu: **đậm**, xuống dòng, chỉ số trên/dưới, liên kết */
  function fmtPart(t) {
    t = esc(t);
    t = t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    t = t.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>').replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>');
    t = t.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');
    try { t = t.replace(/([\p{L}\p{N}°])_([\p{L}\p{N}]+)/gu, '$1<sub>$2</sub>'); } catch (e) { /* trình duyệt cũ */ }
    return t;
  }
  function fmt(s) {
    var str = String(s == null ? '' : s), out = '', re = /(https?:\/\/[^\s<>"']+)/g, last = 0, m;
    while ((m = re.exec(str))) {
      out += fmtPart(str.slice(last, m.index));
      var url = m[1].replace(/[.,;)]+$/, '');
      out += '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + '</a>';
      last = m.index + url.length;
      re.lastIndex = last;
    }
    out += fmtPart(str.slice(last));
    return out.replace(/\n/g, '<br>');
  }

  var ICONS = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    book: '<path d="M4 4h9a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M4 16a4 4 0 0 1 4-4h9"/>',
    quiz: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12l3 3 5-6"/>',
    exam: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    tools: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chart: '<path d="M4 20V11M10 20V5M16 20v-6M21 20H3"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>',
    left: '<path d="M15 6l-6 6 6 6"/>',
    right: '<path d="M9 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
    file: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>',
    text: '<path d="M5 6h14M5 11h14M5 16h9"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    pause: '<path d="M7 4v16M17 4v16"/>',
    reset: '<path d="M4 12a8 8 0 1 0 3-6.3"/><path d="M4 4v5h5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h2M16 15v3"/>',
    atom: '<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>',
    cards: '<rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v12"/>',
    bolt: '<path d="M13 3L4 14h7l-1 7 9-11h-7z"/>',
    note: '<path d="M5 3h10l4 4v14H5z"/><path d="M9 9h6M9 13h6M9 17h4"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9"/>',
    ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M22 20a7 7 0 0 0-4-6.3"/>',
    database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    auto: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>',
    rss: '<path d="M5 19h.01M5 12a7 7 0 0 1 7 7M5 5a14 14 0 0 1 14 14"/>',
    phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18h2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>'
  };
  function icon(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---- Hộp thoại ---- */
  var modalStack = [];
  function openModal(opt) {
    var back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = '<div class="modal ' + (opt.wide ? 'wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(opt.title || '') + '">' +
      '<div class="modal-head"><h3>' + esc(opt.title || '') + '</h3><button class="icon-btn" data-close aria-label="Đóng">' + icon('x') + '</button></div>' +
      '<div class="modal-body">' + (opt.body || '') + '</div>' +
      (opt.actions && opt.actions.length ? '<div class="modal-foot">' + opt.actions.map(function (a, i) { return '<button class="btn ' + (a.kind || '') + '" data-ai="' + i + '">' + esc(a.label) + '</button>'; }).join('') + '</div>' : '') +
      '</div>';
    document.body.appendChild(back);
    var api = {
      el: back.querySelector('.modal'),
      close: function () { if (back.parentNode) back.parentNode.removeChild(back); modalStack = modalStack.filter(function (m) { return m !== api; }); if (opt.onClose) opt.onClose(); }
    };
    modalStack.push(api);
    back.addEventListener('click', function (e) {
      if (e.target === back && !opt.sticky) api.close();
      if (e.target.closest('[data-close]')) api.close();
      var b = e.target.closest('[data-ai]');
      if (b) {
        var a = opt.actions[Number(b.getAttribute('data-ai'))];
        Promise.resolve(a.onClick ? a.onClick(api) : null).then(function (keep) { if (keep !== true && !a.keepOpen) api.close(); }).catch(function (er) { toast(er.userMessage || er.message, 'bad'); });
      }
    });
    var f = back.querySelector('input,select,textarea,button.btn');
    if (f) setTimeout(function () { f.focus(); }, 30);
    return api;
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modalStack.length) modalStack[modalStack.length - 1].close(); });
  function confirmBox(message, okLabel, danger) {
    return new Promise(function (resolve) {
      var done = false;
      openModal({
        title: 'Xác nhận', body: '<p>' + esc(message) + '</p>',
        actions: [{ label: 'Hủy', kind: 'ghost', onClick: function () { done = true; resolve(false); } }, { label: okLabel || 'Đồng ý', kind: danger ? 'danger' : 'primary', onClick: function () { done = true; resolve(true); } }],
        onClose: function () { if (!done) resolve(false); }
      });
    });
  }
  function textModal(title, text, filename) {
    var m = openModal({
      title: title, wide: true,
      body: '<p class="muted small">Nhấn <b>Sao chép</b> rồi dán vào Excel/Google Sheets, hoặc <b>Tải xuống</b> nếu trình duyệt cho phép.</p><textarea class="input mono" rows="14" readonly id="tm-text">' + esc(text) + '</textarea>',
      actions: [
        { label: 'Tải xuống', kind: 'ghost', keepOpen: true, onClick: function () { download(filename || 'du-lieu.txt', text); } },
        { label: 'Sao chép', kind: 'primary', keepOpen: true, onClick: function () { copyText(text); } }
      ]
    });
    return m;
  }
  function copyText(text) {
    var done = function () { toast('Đã sao chép vào bộ nhớ tạm.', 'ok'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text) ? done() : toast('Không sao chép được, hãy bôi đen và nhấn Ctrl+C.', 'bad'); });
    } else { fallbackCopy(text) ? done() : toast('Không sao chép được, hãy bôi đen và nhấn Ctrl+C.', 'bad'); }
  }
  function fallbackCopy(text) {
    try { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); var ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; }
  }
  function download(filename, text, mime) {
    try {
      var blob = new Blob(['﻿' + text], { type: (mime || 'text/plain') + ';charset=utf-8' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) { toast('Trình duyệt chặn tải xuống. Hãy dùng nút Sao chép.', 'bad'); }
  }

  /* ---- Thông báo nhanh ---- */
  function toast(msg, kind) {
    var box = $('#toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || '');
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 300); }, 3200);
  }

  /* ---- Định dạng thời gian, số ---- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dt(iso, withTime) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return '';
    var s = pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
    return withTime ? pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' · ' + s : s;
  }
  function dur(sec) {
    sec = Math.max(0, Math.round(sec || 0));
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + pad(m) : m) + ':' + pad(s);
  }
  function ago(iso) {
    var t = new Date(iso).getTime();
    if (isNaN(t)) return '';
    var m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return 'vừa xong';
    if (m < 60) return m + ' phút trước';
    var h = Math.round(m / 60);
    if (h < 24) return h + ' giờ trước';
    var d = Math.round(h / 24);
    if (d === 1) return 'hôm qua';
    if (d < 7) return d + ' ngày trước';
    return dt(iso);
  }
  function num(x, d) {
    if (x === null || x === undefined || isNaN(x)) return '–';
    return Number(x).toFixed(d === undefined ? 1 : d).replace('.', ',');
  }
  function scoreClass(s) { return s >= 8 ? 'good' : s >= 6.5 ? 'fair' : s >= 5 ? 'warn' : 'bad'; }

  /* ---- Biểu đồ đường SVG đơn giản ---- */
  function lineChart(points, opt) {
    opt = opt || {};
    var W = 640, H = 200, P = { l: 34, r: 14, t: 14, b: 26 };
    if (!points.length) return '<div class="empty small">Chưa có dữ liệu.</div>';
    var max = opt.max || 10, n = points.length;
    var x = function (i) { return P.l + (n === 1 ? (W - P.l - P.r) / 2 : i * (W - P.l - P.r) / (n - 1)); };
    var y = function (v) { return P.t + (1 - v / max) * (H - P.t - P.b); };
    var grid = [0, 2.5, 5, 7.5, 10].map(function (v) { return '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + y(v) + '" y2="' + y(v) + '" class="ch-grid"/><text x="' + (P.l - 8) + '" y="' + (y(v) + 4) + '" class="ch-lab" text-anchor="end">' + String(v).replace('.', ',') + '</text>'; }).join('');
    var path = points.map(function (p, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1); }).join(' ');
    var area = path + ' L' + x(n - 1).toFixed(1) + ' ' + y(0) + ' L' + x(0).toFixed(1) + ' ' + y(0) + ' Z';
    var dots = points.map(function (p, i) { return '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.v).toFixed(1) + '" r="' + (i === n - 1 ? 5 : 3) + '" class="ch-dot ' + (i === n - 1 ? 'last' : '') + '"><title>' + esc(p.label || '') + ': ' + num(p.v, 2) + '</title></circle>'; }).join('');
    var lastLab = '<text x="' + Math.min(x(n - 1), W - P.r - 4) + '" y="' + (y(points[n - 1].v) - 10) + '" class="ch-val" text-anchor="end">' + num(points[n - 1].v, 2) + '</text>';
    var xl = n > 1 ? '<text x="' + x(0) + '" y="' + (H - 6) + '" class="ch-lab">' + esc(points[0].label || '') + '</text><text x="' + x(n - 1) + '" y="' + (H - 6) + '" class="ch-lab" text-anchor="end">' + esc(points[n - 1].label || '') + '</text>' : '';
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.title || 'Biểu đồ điểm') + '">' + grid + '<path d="' + area + '" class="ch-area"/><path d="' + path + '" class="ch-line"/>' + dots + lastLab + xl + '</svg>';
  }
  function bars(items, max) {
    if (!items.length) return '<div class="empty small">Chưa có dữ liệu.</div>';
    max = max || Math.max.apply(null, items.map(function (i) { return i.v; }).concat([1]));
    return '<div class="hbars">' + items.map(function (it) {
      return '<div class="hbar"><span class="hb-lab">' + esc(it.label) + '</span><span class="hb-track"><span class="hb-fill" style="width:' + Math.max(2, (it.v / max) * 100).toFixed(1) + '%;' + (it.color ? 'background:' + it.color : '') + '"></span></span><span class="hb-val">' + esc(it.text || num(it.v)) + '</span></div>';
    }).join('') + '</div>';
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function csv(rows) { return rows.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n;]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n'); }
  function removeDiacritics(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }

  window.UI = { ago: ago, $: $, $$: $$, esc: esc, fmt: fmt, icon: icon, openModal: openModal, confirmBox: confirmBox, textModal: textModal, copyText: copyText, download: download, toast: toast, dt: dt, dur: dur, num: num, pad: pad, scoreClass: scoreClass, lineChart: lineChart, bars: bars, shuffle: shuffle, csv: csv, plain: removeDiacritics };
})();
