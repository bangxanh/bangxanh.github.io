/* Lấy tin giáo dục mới từ các nguồn RSS (dùng chung cho server.js và GitHub Actions).
   Chỉ lưu tiêu đề, đường liên kết, nguồn và thời gian; người đọc bấm vào để đọc bài gốc. */
'use strict';
const SOURCES = [
  { name: 'VnExpress', url: 'https://vnexpress.net/rss/giao-duc.rss' },
  { name: 'Tuổi Trẻ', url: 'https://tuoitre.vn/rss/giao-duc.rss' },
  { name: 'Thanh Niên', url: 'https://thanhnien.vn/rss/giao-duc.rss' }
];
function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();
}
function tag(block, name) {
  const m = block.match(new RegExp('<' + name + '\\b[^>]*>([\\s\\S]*?)</' + name + '>', 'i'));
  return m ? decode(m[1]) : '';
}
function parseRss(xml, source) {
  const out = [];
  const items = String(xml).match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const it of items) {
    const t = tag(it, 'title');
    const u = tag(it, 'link') || tag(it, 'guid');
    let d = new Date(tag(it, 'pubDate'));
    if (isNaN(d)) d = new Date();
    if (t && /^https?:\/\//.test(u)) out.push({ t: t.slice(0, 220), u, s: source, d: d.toISOString() });
  }
  return out;
}
async function fetchFeeds(previous, opts) {
  opts = opts || {};
  const per = opts.perSource || 25, max = opts.max || 80;
  const all = [];
  const errors = [];
  await Promise.all(SOURCES.map(async (src) => {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 15000);
      const r = await fetch(src.url, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (BangXanh RSS reader)' } });
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      all.push(...parseRss(await r.text(), src.name).slice(0, per));
    } catch (e) { errors.push(src.name + ': ' + e.message); }
  }));
  /* gộp với tin cũ để không mất tin khi một nguồn tạm lỗi */
  const seen = new Set();
  const merged = all.concat((previous && previous.items) || []).filter((x) => {
    if (seen.has(x.u)) return false; seen.add(x.u); return true;
  });
  merged.sort((a, b) => String(b.d).localeCompare(String(a.d)));
  const changed = !previous || JSON.stringify(merged.slice(0, max).map((x) => x.u)) !== JSON.stringify(((previous && previous.items) || []).slice(0, max).map((x) => x.u));
  return { items: merged.slice(0, max), errors, changed, fetchedAt: new Date().toISOString() };
}
module.exports = { SOURCES, parseRss, fetchFeeds };
