#!/usr/bin/env node
/* Tạo các trang HTML tĩnh theo từng lớp – môn để Google và các công cụ tìm kiếm đọc được nội dung.
   Cách dùng: node scripts/build-seo.js [thư-mục-trang=public] [địa-chỉ-trang, ví dụ https://ten.github.io/bang-xanh/]
   Khi có địa chỉ trang, tạo thêm sitemap.xml và robots.txt. */
'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(process.argv[2] || path.join(__dirname, '..', 'public'));
let SITE = process.argv[3] || process.env.SITE_URL || '';
if (SITE && !SITE.endsWith('/')) SITE += '/';
const src = fs.readFileSync(path.join(DIR, 'data', 'content.js'), 'utf8');
const D = JSON.parse(src.slice(src.indexOf('=') + 1).trim().replace(/;\s*$/, ''));
let siteName = 'Bảng Xanh';
try { siteName = JSON.parse(fs.readFileSync(path.join(DIR, 'data', 'site-data.json'), 'utf8')).settings.siteName || siteName; } catch (e) { /* mặc định */ }

const SUBJ = ['toan', 'van', 'anh', 'khtn', 'khxh'];
const COLOR = { toan: '#2f6fde', van: '#c93a58', anh: '#0b879a', khtn: '#55891b', khxh: '#bd7a12' };
function short(s, g) { return s === 'toan' ? 'Toán' : s === 'van' ? (g <= 5 ? 'Tiếng Việt' : 'Ngữ văn') : s === 'anh' ? 'Tiếng Anh' : s === 'khtn' ? 'Khoa học tự nhiên' : 'Khoa học xã hội'; }
function long(s, g) {
  if (s === 'khtn') return g <= 3 ? 'Tự nhiên và Xã hội' : g <= 5 ? 'Khoa học' : g <= 9 ? 'Khoa học tự nhiên' : 'Vật lí, Hóa học, Sinh học';
  if (s === 'khxh') return g <= 3 ? 'Tự nhiên và Xã hội, Đạo đức' : g <= 5 ? 'Lịch sử và Địa lí, Đạo đức' : g <= 9 ? 'Lịch sử và Địa lí, Giáo dục công dân' : 'Lịch sử, Địa lí, Giáo dục kinh tế và pháp luật';
  return short(s, g);
}
const level = (g) => (g <= 5 ? 'Tiểu học' : g <= 9 ? 'THCS' : 'THPT');
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function fmt(t) {
  return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>').replace(/\^\(([^)]+)\)/g, '<sup>$1</sup>')
    .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>').replace(/([\p{L}\p{N}°])_([\p{L}\p{N}]+)/gu, '$1<sub>$2</sub>');
}
function page(title, desc, body, file) {
  const canonical = SITE ? '<link rel="canonical" href="' + SITE + 'hoc/' + (file === 'index.html' ? '' : file) + '">' : '';
  return '<!DOCTYPE html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>' + esc(title) + '</title>\n<meta name="description" content="' + esc(desc) + '">\n' + canonical +
    '\n<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n<link rel="icon" href="../icon.svg">\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n<header class="top"><a class="brand" href="../"><span class="mark">BX</span>' + esc(siteName) + '</a><a class="cta" href="../">Mở trang học tập</a></header>\n<main>\n' + body + '\n</main>\n<footer>Học liệu biên soạn theo Chương trình GDPT 2018, sắp xếp theo mạch bài bộ SGK Kết nối tri thức với cuộc sống (bộ sách dùng thống nhất toàn quốc từ năm học 2026–2027). Miễn phí cho mọi học sinh.</footer>\n</body>\n</html>\n';
}

const lessonPages = [];
function lessonData(g, s) {
  try { return JSON.parse(fs.readFileSync(path.join(DIR, 'data', 'bai', g + '-' + s + '.json'), 'utf8')); } catch (e) { return null; }
}
const out = path.join(DIR, 'hoc');
fs.mkdirSync(out, { recursive: true });
const pages = [];
for (let g = 1; g <= 12; g++) {
  for (const s of SUBJ) {
    const books = (D.curriculum[String(g)] || {})[s] || [];
    if (!books.length) continue;
    const file = 'lop-' + g + '-' + s + '.html';
    const nq = D.questions.filter((q) => q.g === g && q.s === s).length;
    const chapters = books.reduce((a, b) => a + b.chapters.length, 0);
    const title = short(s, g) + ' lớp ' + g + ' – Tóm tắt kiến thức trọng tâm theo chương | ' + siteName;
    const firstPoints = books[0].chapters.slice(0, 3).map((c) => c.t).join('; ');
    const desc = 'Kiến thức trọng tâm ' + long(s, g) + ' lớp ' + g + ' (' + level(g) + ', SGK Kết nối tri thức): ' + chapters + ' chương/chủ đề – ' + firstPoints + '. Kèm ' + nq + ' câu trắc nghiệm online miễn phí.';
    let body = '<nav class="crumb"><a href="./">Học liệu</a> › Lớp ' + g + ' › ' + esc(short(s, g)) + '</nav>\n<h1 style="--c:' + COLOR[s] + '">' + esc(short(s, g)) + ' lớp ' + g + ': tóm tắt kiến thức trọng tâm</h1>\n<p class="lead">' + esc(long(s, g)) + ' · ' + level(g) + ' · ' + chapters + ' chương, chủ đề.</p>\n' +
      '<p class="actions"><a class="btn" href="../?lop=' + g + '&amp;mon=' + s + '#quiz">Làm trắc nghiệm ' + esc(short(s, g)) + ' ' + g + ' (' + nq + ' câu)</a><a class="btn ghost" href="../?lop=' + g + '&amp;mon=' + s + '#learn">Học có đánh dấu tiến độ</a></p>\n';
    for (const b of books) {
      body += '<section><h2>' + esc(b.title) + '</h2>' + (b.note ? '<p class="note">' + fmt(b.note) + '</p>' : '') +
        b.chapters.map((c) => '<article><h3>' + esc(c.t) + '</h3><ul>' + c.items.map((it) => '<li>' + fmt(it) + '</li>').join('') + '</ul></article>').join('\n') + '</section>\n';
    }
    const LD = lessonData(g, s);
    const lessonList = [];
    if (LD) LD.books.forEach((b) => b.units.forEach((u) => u.lessons.forEach((l) => lessonList.push({ l, u, b }))));
    if (lessonList.length) {
      body += '<section><h2>Danh mục bài học (' + lessonList.length + ' bài)</h2><ol class="lessons">' + lessonList.map((x) => '<li>' + (x.l.ready ? '<a href="bai/' + x.l.id + '.html">' : '<a href="../#bai/' + x.l.id + '">') + esc((x.l.n ? x.l.n + '. ' : '') + x.l.t) + '</a>' + (x.l.ready ? ' <small>bài giảng, ví dụ, luyện tập</small>' : '') + '</li>').join('') + '</ol></section>\n';
      lessonList.filter((x) => x.l.ready).forEach((x, i, arr) => lessonPages.push({ g, s, x, prev: arr[i - 1], next: arr[i + 1] }));
    }
    const others = SUBJ.filter((x) => x !== s && ((D.curriculum[String(g)] || {})[x] || []).length).map((x) => '<a href="lop-' + g + '-' + x + '.html">' + esc(short(x, g)) + ' ' + g + '</a>').join(' · ');
    body += '<p class="more">Các môn khác lớp ' + g + ': ' + others + '</p>';
    fs.writeFileSync(path.join(out, file), page(title, desc, body, file));
    pages.push({ g, s, file, chapters, nq });
  }
}
let idx = '<h1>Học liệu lớp 1 – 12 theo chương trình mới</h1>\n<p class="lead">Tóm tắt kiến thức trọng tâm từng chương của 5 nhóm môn, kèm câu hỏi trắc nghiệm online miễn phí. Chọn lớp và môn để xem.</p>\n';
for (const lv of [['Tiểu học', [1, 2, 3, 4, 5]], ['Trung học cơ sở', [6, 7, 8, 9]], ['Trung học phổ thông', [10, 11, 12]]]) {
  idx += '<section><h2>' + lv[0] + '</h2><div class="grid">' + lv[1].map((g) => '<div class="grade"><h3>Lớp ' + g + '</h3><ul>' + pages.filter((p) => p.g === g).map((p) => '<li><a href="' + p.file + '">' + esc(short(p.s, g)) + '</a> <small>' + p.chapters + ' chủ đề</small></li>').join('') + '</ul></div>').join('') + '</div></section>\n';
}
fs.writeFileSync(path.join(out, 'index.html'), page('Học liệu lớp 1 – 12: tóm tắt kiến thức, trắc nghiệm online | ' + siteName, 'Mục lục học liệu miễn phí lớp 1 – 12: Toán, Ngữ văn, Tiếng Anh, Khoa học tự nhiên, Khoa học xã hội theo SGK Kết nối tri thức; trắc nghiệm online và đề luyện thi tốt nghiệp THPT 2027.', idx, 'index.html'));
fs.writeFileSync(path.join(out, 'style.css'), `:root{--bg:#f2f5f3;--surface:#fff;--ink:#14211b;--muted:#56675e;--line:#d9e2dc;--board:#1f5640;--chalk:#e8b440;color-scheme:light}
@media (prefers-color-scheme:dark){:root{--bg:#0d1511;--surface:#141f19;--ink:#e3ebe6;--muted:#9bb0a4;--line:#283a30;--board:#3f9a73;--chalk:#f0c45a;color-scheme:dark}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.65 system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}
a{color:var(--board)}.top{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 20px;background:#1b4a37;color:#fff}
.brand{display:flex;align-items:center;gap:10px;color:#fff;text-decoration:none;font-weight:700}.mark{display:grid;place-items:center;width:32px;height:32px;border-radius:8px;background:var(--chalk);color:#1f5640;font-weight:800;font-size:.85rem}
.cta{color:#1f5640;background:var(--chalk);padding:7px 14px;border-radius:9px;text-decoration:none;font-weight:700}
main{max-width:860px;margin:0 auto;padding:24px 18px 48px}h1{font-size:1.7rem;line-height:1.25;border-left:6px solid var(--c,var(--board));padding-left:12px}
h2{margin-top:28px;font-size:1.25rem}h3{font-size:1.05rem;margin:0 0 6px}.lead{color:var(--muted)}.crumb{font-size:.9rem;color:var(--muted)}
article{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:12px 0}ul{margin:0;padding-left:1.2em}li{margin:3px 0}
.note{background:var(--surface);border-left:4px solid var(--chalk);padding:10px 14px;border-radius:0 10px 10px 0}
.actions{display:flex;gap:10px;flex-wrap:wrap}.btn{display:inline-block;padding:10px 16px;border-radius:10px;background:var(--board);color:#fff;text-decoration:none;font-weight:600}.btn.ghost{background:transparent;color:var(--board);border:1px solid var(--line)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}.grade{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px}.grade small{color:var(--muted)}
.more{margin-top:28px}ol.lessons li{margin:4px 0}figure{margin:10px 0;text-align:center}figure img{max-width:100%;height:auto;background:#fff;border-radius:10px}figcaption{font-size:.88rem;color:var(--muted)}ol.lessons small{color:var(--muted)}details summary{cursor:pointer;color:var(--board);font-weight:600}footer{max-width:860px;margin:0 auto;padding:0 18px 40px;color:var(--muted);font-size:.85rem}
`);
/* Trang tĩnh cho từng bài có bài giảng: hoc/bai/<mã bài>.html */
fs.mkdirSync(path.join(out, 'bai'), { recursive: true });
const L = ['A', 'B', 'C', 'D'];
for (const lp of lessonPages) {
  const { g, s } = lp, l = lp.x.l, u = lp.x.u, b = lp.x.b;
  const name = (l.n ? l.n + '. ' : '') + l.t;
  const file = 'bai/' + l.id + '.html';
  const title = name + ' – ' + b.title + ' (Kết nối tri thức) | ' + siteName;
  const desc = name + ' – ' + b.title + ': ' + (l.intro || '') + ' Lý thuyết trọng tâm, ' + l.examples.length + ' ví dụ giải mẫu, ' + l.qs.length + ' câu luyện tập có lời giải.';
  const li = (arr) => '<ul>' + arr.map((t) => '<li>' + fmt(t) + '</li>').join('') + '</ul>';
  const figs = (arr) => (arr || []).map((f) => '<figure><img src="../../' + f.f + '" alt="' + esc(f.c || name) + '" loading="lazy">' + (f.c ? '<figcaption>' + fmt(f.c) + '</figcaption>' : '') + '</figure>').join('');
  let body = '<nav class="crumb"><a href="../">Học liệu</a> › <a href="../lop-' + g + '-' + s + '.html">' + esc(short(s, g)) + ' ' + g + '</a> › ' + esc(u.t) + '</nav>\n<h1 style="--c:' + COLOR[s] + '">' + esc(name) + '</h1>\n<p class="lead">' + esc(b.title) + ' · ' + esc(u.t) + (l.intro ? ' – ' + esc(l.intro) : '') + '</p>\n' +
    '<p class="actions"><a class="btn" href="../../#bai/' + l.id + '">Học và luyện tập có chấm điểm</a><a class="btn ghost" href="../../#in/bai/' + l.id + '">In / lưu PDF</a></p>\n';
  if (l.figs) body += figs(l.figs);
  if (l.goals.length) body += '<section><h2>Mục tiêu</h2>' + li(l.goals) + '</section>';
  if (l.theory.length) body += '<section><h2>Kiến thức trọng tâm</h2>' + l.theory.map((t) => '<article><h3>' + fmt(t.h) + '</h3>' + li(t.pts) + figs(t.img) + '</article>').join('') + '</section>';
  if (l.examples.length) body += '<section><h2>Ví dụ giải mẫu</h2>' + l.examples.map((e, i) => '<article><h3>Ví dụ ' + (i + 1) + '</h3><p>' + fmt(e.q) + '</p>' + figs(e.img) + '<details><summary>Xem lời giải</summary><ol>' + e.steps.map((x) => '<li>' + fmt(x) + '</li>').join('') + '</ol>' + (e.ans ? '<p><b>Kết luận:</b> ' + fmt(e.ans) + '</p>' : '') + '</details></article>').join('') + '</section>';
  if (l.notes.length) body += '<section><h2>Ghi nhớ</h2><p class="note">' + l.notes.map(fmt).join('<br>') + '</p></section>';
  if (l.qs.length) body += '<section><h2>Câu hỏi luyện tập</h2>' + l.qs.map((q, i) => '<article><h3>Câu ' + (i + 1) + '</h3><p>' + fmt(q.q) + '</p>' + (q.img ? figs([q.img]) : '') +
    (q.t === 'mc' ? '<ol type="A">' + q.o.map((o) => '<li>' + fmt(o) + '</li>').join('') + '</ol>' : q.t === 'tf' ? '<ol type="a">' + q.o.map((o) => '<li>' + fmt(o) + '</li>').join('') + '</ol>' : '') +
    '<details><summary>Đáp án và lời giải</summary><p><b>' + esc(q.t === 'mc' ? L[q.a] : q.t === 'tf' ? q.a.map((v, k) => 'abcd'[k] + ') ' + (v ? 'Đúng' : 'Sai')).join('; ') : q.a.join(' hoặc ')) + '</b>' + (q.e ? ' – ' + fmt(q.e) : '') + '</p></details></article>').join('') + '</section>';
  body += '<p class="more">' + (lp.prev ? '← <a href="' + lp.prev.l.id + '.html">' + esc((lp.prev.l.n ? lp.prev.l.n + '. ' : '') + lp.prev.l.t) + '</a>' : '') + (lp.prev && lp.next ? ' · ' : '') + (lp.next ? '<a href="' + lp.next.l.id + '.html">' + esc((lp.next.l.n ? lp.next.l.n + '. ' : '') + lp.next.l.t) + '</a> →' : '') + '</p>';
  const html = page(title, desc, body, file).replace('href="../icon.svg"', 'href="../../icon.svg"').replace('href="style.css"', 'href="../style.css"').replace('class="brand" href="../"', 'class="brand" href="../../"').replace('class="cta" href="../"', 'class="cta" href="../../#bai/' + l.id + '"');
  fs.writeFileSync(path.join(out, file), html);
}
if (SITE) {
  const day = new Date().toISOString().slice(0, 10);
  const urls = [SITE, SITE + 'hoc/'].concat(pages.map((p) => SITE + 'hoc/' + p.file)).concat(lessonPages.map((p) => SITE + 'hoc/bai/' + p.x.l.id + '.html'));
  fs.writeFileSync(path.join(DIR, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map((u) => '  <url><loc>' + u + '</loc><lastmod>' + day + '</lastmod></url>').join('\n') + '\n</urlset>\n');
  fs.writeFileSync(path.join(DIR, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + SITE + 'sitemap.xml\n');
}
console.log('Đã tạo ' + pages.length + ' trang học liệu, ' + lessonPages.length + ' trang bài học' + (SITE ? ' + sitemap.xml, robots.txt cho ' + SITE : ''));
