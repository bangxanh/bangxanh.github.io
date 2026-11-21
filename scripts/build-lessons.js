#!/usr/bin/env node
/* Chuyển nội dung bài học (noi-dung/bai/*.txt) thành dữ liệu cho trang (site/data/bai/*.json).
   Cách dùng: node scripts/build-lessons.js [thư-mục-nội-dung=noi-dung/bai] [thư-mục-trang=site]
   Mỗi lớp – môn tạo một tệp <lớp>-<môn>.json; thêm index.json để tìm kiếm và thống kê.
   Lớp – môn chưa có tệp bài học thì dựng tự động từ chương/chủ đề trong data/content.js.
   Lỗi định dạng (câu hỏi thiếu đáp án, …) được báo rõ và dừng với mã lỗi 1. */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SRC = path.resolve(process.argv[2] || path.join(ROOT, 'noi-dung', 'bai'));
const SITE = path.resolve(process.argv[3] || path.join(ROOT, 'site'));
const OUT = path.join(SITE, 'data', 'bai');
const IMG_SRC = path.join(path.dirname(SRC), 'hinh');
const IMG_OUT = path.join(SITE, 'hinh');
const SUBJ = ['toan', 'van', 'anh', 'khtn', 'khxh'];

const contentSrc = fs.readFileSync(path.join(SITE, 'data', 'content.js'), 'utf8');
const D = JSON.parse(contentSrc.slice(contentSrc.indexOf('=') + 1).trim().replace(/;\s*$/, ''));

const errors = [];
const br = (t) => String(t || '').replace(/\s+\/\/\s+/g, '\n').trim();
function slug(t) {
  return String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function plain(t) { return slug(t).replace(/-/g, ' '); }

/* ---------- Đọc một tệp bài học ---------- */
function parseFile(file) {
  const name = path.basename(file);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const books = [];
  let book = null, unit = null, les = null, mode = '', sec = null, ex = null, q = null, essay = null;
  const where = (i) => name + ':' + (i + 1);
  function needLesson(i, what) {
    if (!les) { errors.push(where(i) + ' – "' + what + '" phải nằm trong một bài (sau dòng ### …)'); return false; }
    return true;
  }
  function closeQ() {
    if (!q) return;
    const at = q._at;
    if (q.t === 'mc') {
      if (q.o.length < 2) errors.push(at + ' – câu trắc nghiệm cần ít nhất 2 phương án A) B) …');
      if (q.a < 0) errors.push(at + ' – câu trắc nghiệm chưa đánh dấu đáp án đúng bằng dấu * ở cuối phương án');
    } else if (q.t === 'tf') {
      if (q.o.length !== 4) errors.push(at + ' – câu Đúng/Sai cần đúng 4 ý a) b) c) d), hiện có ' + q.o.length);
    } else if (q.t === 'sa') {
      if (!q.a.length) errors.push(at + ' – câu trả lời ngắn thiếu dòng ANS:');
    } else if (q.t === 'ord') {
      if (q.o.length < 3) errors.push(at + ' – câu sắp xếp cần ít nhất 3 mục "1) …" viết theo ĐÚNG thứ tự');
      delete q.r;
    } else if (q.t === 'match') {
      if (q.o.length < 3) errors.push(at + ' – câu nối cột cần ít nhất 3 cặp "1) vế trái | vế phải"');
      if (q.r.length !== q.o.length || q.r.some((x) => !x)) errors.push(at + ' – mỗi dòng nối cột phải có dạng "1) vế trái | vế phải"');
    }
    delete q._at;
    q = null;
  }
  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, '');
    const t = line.trim();
    if (!t || t.startsWith('//')) return;
    let m;
    if ((m = t.match(/^#\s+(\d+)\s*\|\s*(\w+)\s*\|\s*(.+)$/)) && !t.startsWith('##')) {
      closeQ();
      book = { g: Number(m[1]), s: m[2], title: m[3].trim(), units: [] };
      books.push(book); unit = null; les = null; mode = '';
      return;
    }
    if (!book) { errors.push(where(i) + ' – thiếu dòng tiêu đề sách "# lớp | môn | Tên sách"'); return; }
    if (t.startsWith('### ')) {
      closeQ();
      if (!unit) { unit = { t: 'Nội dung', lessons: [] }; book.units.push(unit); }
      const full = t.slice(4).trim();
      const mm = full.match(/^((?:Bài|Unit|Chủ đề|Tiết|Lesson|Review|Ôn tập)\s*[\dA-Za-z]*)\s*[.:–-]?\s*(.*)$/i);
      les = { n: mm && mm[2] ? mm[1].trim() : '', t: mm && mm[2] ? mm[2].trim() : full, intro: '', goals: [], theory: [], types: [], examples: [], notes: [], qs: [], essays: [] };
      unit.lessons.push(les); mode = ''; sec = null; ex = null; essay = null;
      return;
    }
    if (t.startsWith('## ')) {
      closeQ();
      unit = { t: t.slice(3).trim(), lessons: [] };
      book.units.push(unit); les = null; mode = '';
      return;
    }
    if (t.startsWith('> ')) { if (les) les.intro = br(t.slice(2)); else if (unit) unit.d = br(t.slice(2)); return; }
    if ((m = t.match(/^HINH:\s*(.+)$/))) {
      if (!needLesson(i, 'HINH')) return;
      const parts = m[1].split('|');
      const f = parts[0].trim().replace(/^\/+/, ''), c = br(parts.slice(1).join('|'));
      if (!/^[\w./-]+\.(svg|png|jpg|jpeg|webp)$/i.test(f) || f.includes('..')) { errors.push(where(i) + ' – tên tệp hình không hợp lệ: "' + f + '"'); return; }
      if (!fs.existsSync(path.join(IMG_SRC, f))) { errors.push(where(i) + ' – không tìm thấy tệp hình noi-dung/hinh/' + f); return; }
      const fig = { f: 'hinh/' + f, c };
      if (q) q.img = fig;
      else if (mode === 'vd' && ex) (ex.img = ex.img || []).push(fig);
      else if (mode === 'lt' && sec) (sec.img = sec.img || []).push(fig);
      else (les.figs = les.figs || []).push(fig);
      return;
    }
    if ((m = t.match(/^(MT|LT|DB|VD|B|KQ|GN|Q|E|ANS|TL|MAU|TC):\s*(.*)$/))) {
      const tag = m[1], val = m[2];
      if (!needLesson(i, tag)) return;
      if (tag !== 'E' && tag !== 'ANS' && q) closeQ();
      if (tag === 'MT') { les.goals.push(br(val)); mode = ''; }
      else if (tag === 'LT') { sec = { h: br(val), pts: [] }; les.theory.push(sec); mode = 'lt'; }
      else if (tag === 'DB') { const pp = val.split('|'); sec = { h: br(pp[0].trim()), pts: pp[1] ? [br(pp.slice(1).join('|').trim())] : [] }; les.types.push(sec); mode = 'db'; }
      else if (tag === 'VD') { ex = { q: br(val), steps: [], ans: '' }; les.examples.push(ex); mode = 'vd'; }
      else if (tag === 'B') { if (!ex) errors.push(where(i) + ' – dòng B: phải nằm sau một dòng VD:'); else ex.steps.push(br(val)); }
      else if (tag === 'KQ') { if (!ex) errors.push(where(i) + ' – dòng KQ: phải nằm sau một dòng VD:'); else ex.ans = br(val); }
      else if (tag === 'GN') { les.notes.push(br(val)); mode = ''; }
      else if (tag === 'Q') {
        const qm = val.match(/^(mc|tf|sa|ord|match)\s*\|\s*(.+)$/i);
        if (!qm) { errors.push(where(i) + ' – câu hỏi phải có dạng "Q: mc | nội dung" (mc, tf, sa, ord hoặc match)'); return; }
        const type = qm[1].toLowerCase();
        q = { t: type, q: br(qm[2]), o: [], a: type === 'mc' ? -1 : [], e: '', _at: where(i) };
        if (type === 'match') q.r = [];
        les.qs.push(q); mode = 'q';
      } else if (tag === 'E') {
        if (!q) { errors.push(where(i) + ' – dòng E: (lời giải) phải nằm sau một câu hỏi'); return; }
        q.e = q.e ? q.e + '\n' + br(val) : br(val);
      } else if (tag === 'ANS') {
        if (!q || q.t !== 'sa') { errors.push(where(i) + ' – dòng ANS: chỉ dùng cho câu trả lời ngắn (sa)'); return; }
        q.a = val.split('||').map((x) => x.trim()).filter(Boolean);
      } else if (tag === 'TL') { essay = { q: br(val), sample: [], rubric: [] }; les.essays.push(essay); mode = 'tl'; }
      else if (tag === 'MAU') { if (!essay) errors.push(where(i) + ' – dòng MAU: phải nằm sau một dòng TL:'); else essay.sample.push(br(val)); }
      else if (tag === 'TC') {
        if (!essay) { errors.push(where(i) + ' – dòng TC: phải nằm sau một dòng TL:'); return; }
        const parts = val.split('|');
        const p = parseFloat(String(parts[1] || '1').replace(',', '.'));
        essay.rubric.push({ c: br(parts[0]), p: isNaN(p) ? 1 : p });
      }
      return;
    }
    if (q && q.t === 'mc' && (m = t.match(/^([A-Da-d])[).]\s*(.+)$/))) {
      let txt = m[2].trim();
      if (/\s\*$/.test(txt) || txt === '*') { txt = txt.replace(/\s*\*$/, ''); q.a = q.o.length; }
      q.o.push(br(txt));
      return;
    }
    if (q && q.t === 'tf' && (m = t.match(/^([a-d])\)\s*(.+?)\s*\|\s*(Đ|S|D|Đúng|Sai|T|F)\s*$/i))) {
      q.o.push(br(m[2]));
      q.a.push(/^(Đ|D|Đúng|T)$/i.test(m[3]));
      return;
    }
    if (q && (q.t === 'ord' || q.t === 'match') && (m = t.match(/^(\d+)[).]\s*(.+)$/))) {
      if (q.t === 'ord') q.o.push(br(m[2].trim()));
      else { const pr = m[2].split('|'); q.o.push(br(pr[0].trim())); q.r.push(pr[1] ? br(pr.slice(1).join('|').trim()) : ''); }
      return;
    }
    if (t.startsWith('- ') && mode === 'db' && sec) { sec.pts.push(br(t.slice(2))); return; }
    if (t.startsWith('- ')) {
      if (!les) { if (unit) { unit.pts = unit.pts || []; unit.pts.push(br(t.slice(2))); } return; }
      if (mode !== 'lt' || !sec) { sec = { h: 'Kiến thức cần nhớ', pts: [] }; les.theory.push(sec); mode = 'lt'; }
      sec.pts.push(br(t.slice(2)));
      return;
    }
    errors.push(where(i) + ' – không hiểu dòng: "' + t.slice(0, 60) + '"');
  });
  closeQ();
  return books;
}

/* ---------- Ghép với chương trình (content.js) ---------- */
const ROMAN = /^(Chương|Chủ đề|Phần)\s+([IVXLC]+|\d+)\b/i;
function matchChapter(unitTitle, chapters, used) {
  let best = -1, bestScore = 0;
  const ut = plain(unitTitle), ur = unitTitle.match(ROMAN);
  chapters.forEach((c, i) => {
    if (used.has(i)) return;
    let score = 0;
    if (plain(c.t) === ut) score = 100;
    else {
      const cr = c.t.match(ROMAN);
      if (ur && cr && ur[2].toUpperCase() === cr[2].toUpperCase()) score = 50;
      const a = new Set(ut.split(' ')), b = plain(c.t).split(' ');
      score += b.filter((w) => w.length > 2 && a.has(w)).length;
    }
    if (score > bestScore) { bestScore = score; best = i; }
  });
  return bestScore >= 3 ? best : -1;
}
function bestUnit(chTitle, units) {
  const ct = plain(chTitle), cr = chTitle.match(ROMAN);
  const cw = ct.split(' ').filter((w) => w.length > 2);
  let best = -1, bestScore = 0;
  units.forEach((u, i) => {
    let score = 0;
    if (plain(u.t) === ct) score = 100;
    const ur = u.t.match(ROMAN);
    if (ur && cr && ur[2].toUpperCase() === cr[2].toUpperCase()) score += 50;
    const uw = new Set((plain(u.t) + ' ' + u.lessons.map((l) => plain(l.t)).join(' ')).split(' '));
    score += cw.filter((w) => uw.has(w)).length;
    if (score > bestScore) { bestScore = score; best = i; }
  });
  return bestScore >= 1 ? best : -1;
}
function lessonReady(l) { return !!(l.theory.length || l.examples.length || l.qs.length); }
/* Các dạng câu hỏi: mc, tf, sa dùng chung với ngân hàng đề; ord (sắp xếp) và match (nối cột) chỉ dùng trong trang bài học. */

const parsed = {};
if (fs.existsSync(SRC)) {
  for (const f of fs.readdirSync(SRC).filter((x) => x.endsWith('.txt')).sort()) {
    for (const b of parseFile(path.join(SRC, f))) {
      const key = b.g + '-' + b.s;
      if (!SUBJ.includes(b.s)) { errors.push(f + ' – môn "' + b.s + '" không hợp lệ (dùng: ' + SUBJ.join(', ') + ')'); continue; }
      (parsed[key] = parsed[key] || []).push(b);
    }
  }
}
if (errors.length) {
  console.error('Có ' + errors.length + ' lỗi trong nội dung bài học:\n  ' + errors.join('\n  '));
  process.exit(1);
}

fs.mkdirSync(OUT, { recursive: true });
function copyDir(a, b) {
  if (!fs.existsSync(a)) return 0;
  fs.mkdirSync(b, { recursive: true });
  let n = 0;
  for (const e of fs.readdirSync(a, { withFileTypes: true })) {
    if (e.isDirectory()) n += copyDir(path.join(a, e.name), path.join(b, e.name));
    else { fs.copyFileSync(path.join(a, e.name), path.join(b, e.name)); n++; }
  }
  return n;
}
const nImg = copyDir(IMG_SRC, IMG_OUT);
const index = { updatedAt: new Date().toISOString(), list: [], search: [] };
let totalLessons = 0, totalReady = 0;
const hash = crypto.createHash('sha1');
for (let g = 1; g <= 12; g++) {
  for (const s of SUBJ) {
    const books = ((D.curriculum[String(g)] || {})[s]) || [];
    if (!books.length && !parsed[g + '-' + s]) continue;
    const srcBooks = parsed[g + '-' + s] || [];
    const outBooks = [];
    const usedSrc = new Set();
    const bookList = books.length ? books : srcBooks.map((b) => ({ title: b.title, note: '', chapters: [] }));
    bookList.forEach((cb, bi) => {
      let sb = srcBooks.findIndex((b, i) => !usedSrc.has(i) && plain(b.title) === plain(cb.title));
      if (sb < 0 && bookList.length === 1 && srcBooks.length === 1) sb = 0;
      const ob = { title: cb.title, note: cb.note || '', units: [] };
      if (sb >= 0) {
        usedSrc.add(sb);
        /* Danh mục bài trong noi-dung là chuẩn; kiến thức trọng tâm của từng chương/chủ đề cũ
           được gắn vào chương mới gần nhất (không tạo chương trùng lặp). */
        srcBooks[sb].units.forEach((u) => ob.units.push({ t: u.t, d: u.d || '', pts: (u.pts || []).slice(), lessons: u.lessons }));
        (cb.chapters || []).forEach((c) => {
          const ui = bestUnit(c.t, ob.units);
          if (ui >= 0) ob.units[ui].pts = ob.units[ui].pts.concat(c.items);
        });
      } else {
        (cb.chapters || []).forEach((c) => ob.units.push({ t: c.t, d: '', pts: c.items, lessons: [] }));
      }
      outBooks.push(ob);
    });
    /* gán mã bài, mã câu hỏi */
    let nLes = 0, nReady = 0, nQ = 0;
    const seen = new Set();
    outBooks.forEach((b, bi) => b.units.forEach((u, ui) => u.lessons.forEach((l, li) => {
      let id = g + '-' + s + '-' + (outBooks.length > 1 ? 'q' + (bi + 1) + '-' : '') + slug(l.n || ('bai ' + (ui + 1) + '-' + (li + 1)));
      while (seen.has(id)) id += 'x';
      seen.add(id);
      l.id = id; l.ready = lessonReady(l);
      l.qs.forEach((q, k) => { q.id = 'L' + id + '-' + (k + 1); q.g = g; q.s = s; q.b = ''; q.lesson = id; });
      nLes++; if (l.ready) nReady++; nQ += l.qs.length;
      index.search.push({ id, g, s, n: l.n, t: l.t, u: u.t, r: l.ready ? 1 : 0 });
    })));
    const data = { g, s, updatedAt: index.updatedAt, books: outBooks };
    hash.update(g + s + JSON.stringify(outBooks));
    fs.writeFileSync(path.join(OUT, g + '-' + s + '.json'), JSON.stringify(data));
    index.list.push({ g, s, lessons: nLes, ready: nReady, questions: nQ, units: outBooks.reduce((a, b) => a + b.units.length, 0) });
    totalLessons += nLes; totalReady += nReady;
  }
}
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index));
/* Ghi dấu phiên bản bài học vào version.json để trang đang mở biết có bài mới */
try {
  const vf = path.join(SITE, 'data', 'version.json');
  const v = fs.existsSync(vf) ? JSON.parse(fs.readFileSync(vf, 'utf8')) : {};
  const h = hash.digest('hex').slice(0, 12);
  if (v.lessons !== h) { v.lessons = h; fs.writeFileSync(vf, JSON.stringify(v)); }
} catch (e) { console.warn('Không ghi được version.json: ' + e.message); }
console.log('Đã tạo dữ liệu bài học: ' + index.list.length + ' lớp – môn, ' + totalLessons + ' bài (' + totalReady + ' bài có nội dung chi tiết), ' + nImg + ' hình minh họa.');
