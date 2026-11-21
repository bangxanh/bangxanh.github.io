#!/usr/bin/env node
/* Cập nhật tệp tin tức cho bản công khai (chạy bởi GitHub Actions hoặc thủ công).
   Cách dùng: node scripts/update-news.js <đường-dẫn-news.json> <đường-dẫn-version.json> */
'use strict';
const fs = require('fs');
const { fetchFeeds } = require('../lib/feed.js');
(async () => {
  const newsFile = process.argv[2] || 'public/data/news.json';
  const verFile = process.argv[3] || 'public/data/version.json';
  let prev = null;
  try { prev = JSON.parse(fs.readFileSync(newsFile, 'utf8')); } catch (e) { /* chưa có */ }
  const r = await fetchFeeds(prev);
  if (r.errors.length) console.log('Nguồn lỗi:', r.errors.join(' | '));
  if (!r.items.length) { console.log('Không lấy được tin nào, giữ nguyên tệp cũ.'); return; }
  if (!r.changed && prev) { console.log('Không có tin mới.'); return; }
  fs.writeFileSync(newsFile, JSON.stringify({ updatedAt: r.fetchedAt, items: r.items }, null, 0));
  let ver = {};
  try { ver = JSON.parse(fs.readFileSync(verFile, 'utf8')); } catch (e) { /* chưa có */ }
  ver.news = r.fetchedAt;
  fs.writeFileSync(verFile, JSON.stringify(ver));
  console.log('Đã cập nhật ' + r.items.length + ' tin.');
})().catch((e) => { console.error(e); process.exit(1); });
