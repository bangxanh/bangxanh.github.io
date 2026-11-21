/* Bảng Xanh – Học theo từng bài: danh mục bài theo SGK, trang bài học (lý thuyết, ví dụ giải mẫu,
   luyện tập chấm & chữa ngay, tự luận có đáp án mẫu và tiêu chí), tài liệu theo lớp – môn (sổ tay
   kiến thức, phiếu bài tập in được) và sổ lỗi sai. Dữ liệu: data/bai/<lớp>-<môn>.json. */
(function () {
  'use strict';
  var App = window.App, U = window.UI, esc = U.esc, fmt = U.fmt, icon = U.icon;
  var D = App.D;
  var LETTERS = ['A', 'B', 'C', 'D'];
  var SGK_URL = 'https://taphuan.nxbgd.vn';

  /* ---------- Tải dữ liệu bài học ---------- */
  var cache = {}, indexP = null;
  function getJson(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }
  function fromCurriculum(g, s) {
    var books = ((D.curriculum[String(g)] || {})[s]) || [];
    return { g: g, s: s, books: books.map(function (b) { return { title: b.title, note: b.note || '', units: b.chapters.map(function (c) { return { t: c.t, d: '', pts: c.items, lessons: [] }; }) }; }) };
  }
  var Lessons = App.Lessons = {
    load: function (g, s) {
      var k = g + '-' + s;
      if (!cache[k]) cache[k] = getJson('data/bai/' + k + '.json').catch(function () { return fromCurriculum(g, s); });
      return cache[k];
    },
    index: function () {
      if (!indexP) indexP = getJson('data/bai/index.json').catch(function () { return { list: [], search: [] }; });
      return indexP;
    },
    reset: function () { cache = {}; indexP = null; },
    parseId: function (id) { var m = String(id || '').match(/^(\d+)-(toan|van|anh|khtn|khxh)-/); return m ? { g: Number(m[1]), s: m[2] } : null; },
    flat: function (data) {
      var out = [];
      (data.books || []).forEach(function (b, bi) { b.units.forEach(function (u, ui) { u.lessons.forEach(function (l) { out.push({ l: l, u: u, b: b, bi: bi, ui: ui }); }); }); });
      return out;
    },
    allQuestions: function (data) {
      var qs = [];
      Lessons.flat(data).forEach(function (x) { qs = qs.concat(x.l.qs || []); });
      return qs;
    }
  };
  App.lessonKey = function (id) { return 'L:' + id; };
  App.isLessonDone = function (id) { return !!App.progress[App.lessonKey(id)]; };
  async function setDone(key, on) {
    if (on && !App.progress[key]) { var row = await App.store.create('progress', { key: key }); App.progress[key] = row.id; }
    else if (!on && App.progress[key]) { await App.store.remove('progress', App.progress[key]); delete App.progress[key]; }
  }
  App.setDone = setDone;

  /* ---------- Sổ lỗi sai (lưu trên thiết bị) ---------- */
  var MK = 'bx_mistakes';
  var memMistakes = {};
  function mkLoad() { try { return JSON.parse(localStorage.getItem(MK) || '{}'); } catch (e) { return memMistakes; } }
  function mkSave(o) { memMistakes = o; try { localStorage.setItem(MK, JSON.stringify(o)); } catch (e) { /* bộ nhớ đầy hoặc bị chặn */ } }
  var Mistakes = App.Mistakes = {
    list: function () { var o = mkLoad(); return Object.keys(o).map(function (k) { return o[k]; }).sort(function (a, b) { return b.at - a.at; }); },
    count: function () { return Object.keys(mkLoad()).length; },
    record: function (qs, detail) {
      var o = mkLoad(), map = {};
      (qs || []).forEach(function (q) { map[q.id] = q; });
      (detail || []).forEach(function (d) {
        var q = map[d.qid]; if (!q) return;
        if (d.ok) { if (o[q.id]) { o[q.id].streak = (o[q.id].streak || 0) + 1; if (o[q.id].streak >= 2) delete o[q.id]; } }
        else { var cur = o[q.id] || { q: q, n: 0 }; cur.q = q; cur.n++; cur.streak = 0; cur.at = Date.now(); o[q.id] = cur; }
      });
      var keys = Object.keys(o);
      if (keys.length > 300) keys.sort(function (a, b) { return o[a].at - o[b].at; }).slice(0, keys.length - 300).forEach(function (k) { delete o[k]; });
      mkSave(o);
    },
    clear: function () { mkSave({}); }
  };

  /* ---------- Bộ chấm và chữa từng câu (dùng trong trang bài học) ---------- */
  function qInput(q, idx, prefix) {
    var name = prefix + idx;
    if (q.t === 'mc') {
      return '<div class="opts">' + q.o.map(function (o, k) { return '<button type="button" class="opt" data-mc="' + name + '" data-k="' + k + '"><span class="opt-l">' + LETTERS[k] + '</span><span>' + fmt(o) + '</span></button>'; }).join('') + '</div>';
    }
    if (q.t === 'tf') {
      return '<div class="tfs">' + q.o.map(function (o, k) {
        return '<div class="tf-row" data-tfrow="' + name + '-' + k + '"><span class="tf-l">' + 'abcd'[k] + ')</span><span class="tf-text">' + fmt(o) + '</span><span class="tf-btns"><button type="button" class="tfb yes" data-tf="' + name + '" data-k="' + k + '" data-v="1">Đúng</button><button type="button" class="tfb no" data-tf="' + name + '" data-k="' + k + '" data-v="0">Sai</button></span></div>';
      }).join('') + '</div>';
    }
    return '<div class="sa-wrap"><input class="input sa-in" data-sa="' + name + '" placeholder="Nhập đáp số (vd: 2,5 hoặc 1/2)" inputmode="decimal" autocomplete="off"></div>';
  }
  function practiceBlock(qs, prefix) {
    return '<ol class="lp-list">' + qs.map(function (q, i) {
      return '<li class="lp" id="' + prefix + 'q' + i + '"><div class="lp-head"><span class="rv-no">Câu ' + (i + 1) + '</span><span class="badge">' + (App.TYPE_SHORT ? App.TYPE_SHORT[q.t] : q.t) + '</span></div>' +
        '<div class="q-text">' + fmt(q.q) + '</div>' + qInput(q, i, prefix) +
        '<div class="lp-act"><button type="button" class="btn sm primary" data-check="' + i + '">' + icon('check') + 'Kiểm tra</button><button type="button" class="btn sm ghost" data-hint="' + i + '">Gợi ý từ trợ lý AI</button></div>' +
        '<div class="lp-fb" id="' + prefix + 'fb' + i + '"></div></li>';
    }).join('') + '</ol><div class="lp-sum" id="' + prefix + 'sum"></div>';
  }
  function bindPractice(root, qs, prefix, opts) {
    opts = opts || {};
    var ans = {}, res = {};
    U.$$('[data-mc]', root).forEach(function (b) {
      b.onclick = function () {
        var i = Number(b.getAttribute('data-mc').slice(prefix.length)); if (res[i]) return;
        ans[i] = Number(b.getAttribute('data-k'));
        U.$$('[data-mc="' + prefix + i + '"]', root).forEach(function (x) { x.classList.toggle('sel', x === b); });
      };
    });
    U.$$('[data-tf]', root).forEach(function (b) {
      b.onclick = function () {
        var i = Number(b.getAttribute('data-tf').slice(prefix.length)); if (res[i]) return;
        var k = Number(b.getAttribute('data-k')), v = b.getAttribute('data-v') === '1';
        var arr = ans[i] || [null, null, null, null]; arr[k] = v; ans[i] = arr;
        U.$$('[data-tf="' + prefix + i + '"][data-k="' + k + '"]', root).forEach(function (x) { x.classList.toggle('on', x === b); });
      };
    });
    U.$$('[data-sa]', root).forEach(function (inp) {
      inp.oninput = function () { ans[Number(inp.getAttribute('data-sa').slice(prefix.length))] = inp.value; };
      inp.onkeydown = function (e) { if (e.key === 'Enter') { var i = Number(inp.getAttribute('data-sa').slice(prefix.length)); check(i); } };
    });
    function check(i) {
      if (res[i]) return;
      var q = qs[i], given = ans[i];
      var empty = given === undefined || given === null || (q.t === 'sa' && String(given).trim() === '') || (q.t === 'tf' && !given.some(function (x) { return x === true || x === false; }));
      if (empty) { U.toast('Em hãy trả lời trước rồi bấm Kiểm tra.', 'warn'); return; }
      var r = window.Grade.gradeOne(q, given);
      res[i] = r;
      var li = U.$('#' + prefix + 'q' + i, root);
      li.classList.add(r.ok ? 'ok' : 'no');
      if (q.t === 'mc') U.$$('[data-mc="' + prefix + i + '"]', root).forEach(function (x) { var k = Number(x.getAttribute('data-k')); if (k === q.a) x.classList.add('right'); else if (k === given) x.classList.add('wrong'); x.disabled = true; });
      if (q.t === 'tf') q.a.forEach(function (v, k) { var row = U.$('[data-tfrow="' + prefix + i + '-' + k + '"]', root); if (row) { row.classList.add(given[k] === v ? 'right' : 'wrong'); row.insertAdjacentHTML('beforeend', '<span class="tf-res">Đáp án: <b>' + (v ? 'Đúng' : 'Sai') + '</b></span>'); } U.$$('[data-tf="' + prefix + i + '"]', root).forEach(function (x) { x.disabled = true; }); });
      if (q.t === 'sa') { var inp = U.$('[data-sa="' + prefix + i + '"]', root); inp.disabled = true; inp.classList.add(r.ok ? 'right' : 'wrong'); }
      var verdict = r.ok ? '<b class="good">Chính xác!</b>' : q.t === 'tf' ? '<b class="' + (r.nRight >= 3 ? 'fair' : 'bad') + '">Đúng ' + r.nRight + '/4 ý</b>' : '<b class="bad">Chưa đúng.</b>';
      var right = q.t === 'sa' ? ' Đáp án: <b>' + esc((q.a || []).join(' hoặc ')) + '</b>.' : q.t === 'mc' ? ' Đáp án đúng: <b>' + LETTERS[q.a] + '</b>.' : '';
      U.$('#' + prefix + 'fb' + i, root).innerHTML = '<div class="explain">' + verdict + right + (q.e ? '<div class="sol"><b>Chữa bài:</b> ' + fmt(q.e) + '</div>' : '') +
        (!r.ok && opts.review ? '<div class="small muted">Gợi ý ôn lại: ' + esc(opts.review) + '</div>' : '') + '</div>';
      var hb = U.$('[data-hint="' + i + '"]', li); if (hb) hb.textContent = r.ok ? 'Hỏi trợ lý AI thêm' : 'Nhờ trợ lý AI giải thích';
      var cb = U.$('[data-check="' + i + '"]', li); if (cb) cb.remove();
      Mistakes.record([q], [{ qid: q.id, ok: r.ok }]);
      var done = Object.keys(res).length;
      if (done === qs.length) {
        var all = window.Grade.gradeAll(qs, qs.reduce(function (o, qq, k) { o[qq.id] = ans[k]; return o; }, {}));
        U.$('#' + prefix + 'sum', root).innerHTML = '<div class="lp-score ' + U.scoreClass(all.score) + '"><b>' + U.num(all.score, 2) + '</b>/10 · đúng hoàn toàn ' + all.correct + '/' + all.count + ' câu</div>' +
          '<div class="row-gap"><button type="button" class="btn sm ghost" id="' + prefix + 'redo">' + icon('reset') + 'Làm lại</button>' + (opts.onDone ? '' : '') + '</div>';
        U.$('#' + prefix + 'redo', root).onclick = function () { if (opts.onRedo) opts.onRedo(); };
        if (opts.onDone) opts.onDone(all, qs, ans);
      }
    }
    U.$$('[data-check]', root).forEach(function (b) { b.onclick = function () { check(Number(b.getAttribute('data-check'))); }; });
    U.$$('[data-hint]', root).forEach(function (b) {
      b.onclick = function () {
        var i = Number(b.getAttribute('data-hint')), q = qs[i];
        var txt = qText(q) + (res[i] ? '\n\nEm đã trả lời: ' + givenText(q, ans[i]) + (res[i].ok ? ' (đúng)' : ' (chưa đúng)') : '');
        if (App.AI) App.AI.open({ mode: res[i] ? 'explain' : 'hint', context: opts.context || '', prefill: res[i] ? 'Giải thích giúp em câu này:' : 'Gợi ý giúp em hướng làm câu này (chưa cho đáp án):', attach: txt });
      };
    });
  }
  function qText(q) {
    var t = q.q;
    if (q.t === 'mc') t += '\n' + q.o.map(function (o, k) { return LETTERS[k] + '. ' + o; }).join('\n');
    if (q.t === 'tf') t += '\n' + q.o.map(function (o, k) { return 'abcd'[k] + ') ' + o; }).join('\n');
    return t;
  }
  function givenText(q, g) {
    if (q.t === 'mc') return g === undefined ? '(bỏ trống)' : LETTERS[g];
    if (q.t === 'tf') return (g || []).map(function (v, k) { return 'abcd'[k] + ')' + (v === true ? 'Đ' : v === false ? 'S' : '–'); }).join(' ');
    return String(g || '');
  }
  App.qText = qText;

  /* ---------- Tự luận: đáp án mẫu + tự chấm theo tiêu chí (AI chấm khi đã bật) ---------- */
  function essayBlock(es, id) {
    return es.map(function (e, i) {
      var key = 'bx_tl_' + id + '_' + i, saved = '';
      try { saved = localStorage.getItem(key) || ''; } catch (x) { /* bỏ qua */ }
      var total = e.rubric.reduce(function (a, r) { return a + r.p; }, 0);
      return '<article class="essay" data-essay="' + i + '"><p class="ex-q"><b>Bài ' + (i + 1) + '.</b> ' + fmt(e.q) + '</p>' +
        '<textarea class="input essay-in" rows="5" data-tl="' + i + '" data-key="' + esc(key) + '" placeholder="Em trình bày lời giải ở đây (bài làm được lưu trên máy này)…">' + esc(saved) + '</textarea>' +
        '<div class="row-gap"><button type="button" class="btn sm primary" data-selfgrade="' + i + '">' + icon('check') + 'Nộp & tự chấm theo đáp án</button>' +
        '<button type="button" class="btn sm ghost" data-aigrade="' + i + '">Nhờ trợ lý AI chấm & chữa</button></div>' +
        '<div class="essay-fb" id="tlfb' + i + '"></div>' +
        '<template id="tlsol' + i + '"><div class="callout"><b>Đáp án mẫu</b><ol class="steps">' + e.sample.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ol></div>' +
        (e.rubric.length ? '<div class="rubric"><b>Tự chấm theo tiêu chí</b> <span class="muted small">(tích vào các ý em làm đúng)</span>' + e.rubric.map(function (r, k) { return '<label class="rb"><input type="checkbox" data-rb="' + i + '" data-p="' + r.p + '"> <span>' + fmt(r.c) + '</span> <b>' + U.num(r.p, 2) + 'đ</b></label>'; }).join('') +
          '<div class="rb-score" id="rbs' + i + '">Điểm tự chấm: <b>0</b>/' + U.num(total, 2) + ' (quy về thang 10: <b>0</b>)</div></div>' : '') + '</template></article>';
    }).join('');
  }
  function bindEssays(root, es, ctx) {
    U.$$('[data-tl]', root).forEach(function (ta) { ta.oninput = function () { try { localStorage.setItem(ta.getAttribute('data-key'), ta.value); } catch (e) { /* bỏ qua */ } }; });
    U.$$('[data-selfgrade]', root).forEach(function (b) {
      b.onclick = function () {
        var i = Number(b.getAttribute('data-selfgrade')), fb = U.$('#tlfb' + i, root);
        if (fb.innerHTML) return;
        fb.innerHTML = U.$('#tlsol' + i, root).innerHTML;
        var total = es[i].rubric.reduce(function (a, r) { return a + r.p; }, 0);
        U.$$('[data-rb="' + i + '"]', fb).forEach(function (c) {
          c.onchange = function () {
            var got = U.$$('[data-rb="' + i + '"]', fb).reduce(function (a, x) { return a + (x.checked ? Number(x.getAttribute('data-p')) : 0); }, 0);
            U.$('#rbs' + i, fb).innerHTML = 'Điểm tự chấm: <b>' + U.num(got, 2) + '</b>/' + U.num(total, 2) + ' (quy về thang 10: <b>' + U.num(total ? got / total * 10 : 0, 1) + '</b>)';
          };
        });
      };
    });
    U.$$('[data-aigrade]', root).forEach(function (b) {
      b.onclick = function () {
        var i = Number(b.getAttribute('data-aigrade')), e = es[i];
        var ans = (U.$('[data-tl="' + i + '"]', root).value || '').trim();
        if (!ans) { U.toast('Em hãy viết bài làm trước.', 'warn'); return; }
        if (App.AI) App.AI.grade({ question: e.q, sample: e.sample, rubric: e.rubric, answer: ans, context: ctx, target: U.$('#tlfb' + i, root) });
      };
    });
  }

  /* ---------- Trang Học liệu: chọn lớp, môn → chương → từng bài ---------- */
  function lessonRow(l) {
    var done = App.isLessonDone(l.id);
    return '<a class="lrow ' + (done ? 'done' : '') + '" href="#bai/' + esc(l.id) + '"><span class="lno">' + esc(l.n || '•') + '</span><span class="lt">' + esc(l.t) + '</span>' +
      '<span class="lst ' + (done ? 'ok' : l.ready ? 'rd' : 'wip') + '">' + (done ? icon('check') + 'Đã học' : l.ready ? 'Bài giảng + luyện tập' : 'Đang bổ sung') + '</span></a>';
  }
  App.views.learn = async function (main, alive) {
    var L = App.S.learn;
    if (!L.grade) L.grade = App.user.grade || 12;
    if (!L.subj) L.subj = 'toan';
    if (L.book === undefined) L.book = 0;
    var g = L.grade, s = L.subj;
    var data, idx, tLessons = [], tDocs = [];
    try {
      var r = await Promise.all([Lessons.load(g, s), Lessons.index(), App.store.list('lessons').catch(function () { return []; }), App.store.list('docs').catch(function () { return []; })]);
      data = r[0]; idx = r[1]; tLessons = r[2]; tDocs = r[3];
    } catch (e) { data = fromCurriculum(g, s); idx = { list: [], search: [] }; }
    if (!alive()) return;
    var books = data.books || [];
    if (L.book >= books.length) L.book = 0;
    var book = books[L.book];
    var myLessons = tLessons.filter(function (x) { return Number(x.g) === g && x.s === s; });
    var myDocs = tDocs.filter(function (x) { return (!x.g || Number(x.g) === g) && (!x.s || x.s === s); });
    var stat = function (gg, ss) { return (idx.list || []).find(function (x) { return x.g === gg && x.s === ss; }) || {}; };
    var html = '<div class="page"><header class="page-head"><div><h1>Học liệu</h1><p class="muted">Học theo <b>từng bài</b> của bộ SGK <b>Kết nối tri thức với cuộc sống</b> (dùng thống nhất toàn quốc từ năm học 2026–2027): lý thuyết trọng tâm, ví dụ giải mẫu, bài luyện tập được chấm và chữa ngay.</p></div>' +
      '<div class="searchbox">' + icon('search') + '<input class="input" id="lsearch" placeholder="Tìm bài học, kiến thức… (vd: nguyên hàm, Unit 3)" value="' + esc(L.q || '') + '" aria-label="Tìm trong học liệu"></div></header>' +
      '<div id="lresults"></div>' +
      '<section class="levels">' + App.LEVELS.map(function (lv) {
        return '<div class="lv"><span class="lv-name">' + lv.name + '</span><div class="chips">' + lv.grades.map(function (x) { return '<button class="chip ' + (x === g ? 'on' : '') + '" data-grade="' + x + '">Lớp ' + x + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</section>' +
      '<section class="subj-cards">' + App.SUBJ_KEYS.map(function (k) {
        var st = stat(g, k), n = st.lessons || 0, d = 0;
        if (n) (idx.search || []).forEach(function (x) { if (x.g === g && x.s === k && App.isLessonDone(x.id)) d++; });
        else { var bs = (D.curriculum[String(g)] || {})[k] || []; bs.forEach(function (b, bi) { b.chapters.forEach(function (c, ci) { n++; if (App.progress[App.chapKey(g, k, bi, ci)]) d++; }); }); }
        return '<button class="subj-card ' + (k === s ? 'on' : '') + '" data-s="' + k + '" style="--c:' + App.SUBJ_COLOR[k] + '"><span class="sc-tag">' + esc(App.subjShort(k, g)) + '</span><span class="sc-name">' + esc(App.subjDesc(k, g)) + '</span><span class="bar"><i style="width:' + (n ? Math.round(d / n * 100) : 0) + '%"></i></span><span class="sc-meta">' + d + '/' + n + ' ' + (st.lessons ? 'bài' : 'chủ đề') + ' đã học' + (st.ready ? ' · ' + st.ready + ' bài giảng' : '') + '</span></button>';
      }).join('') + '</section>';
    if (book) {
      var nL = 0, nR = 0; book.units.forEach(function (u) { nL += u.lessons.length; u.lessons.forEach(function (l) { if (l.ready) nR++; }); });
      html += '<section class="reader" style="--c:' + App.SUBJ_COLOR[s] + '">' +
        (books.length > 1 ? '<div class="tabs book-tabs">' + books.map(function (b, i) { return '<button class="tab ' + (i === L.book ? 'on' : '') + '" data-book="' + i + '">' + esc(b.title) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="reader-head"><div><p class="eyebrow">' + esc(App.levelOf(g)) + ' · Lớp ' + g + (nL ? ' · ' + nL + ' bài' + (nR ? ', ' + nR + ' bài có bài giảng chi tiết' : '') : '') + '</p><h2>' + esc(book.title) + '</h2></div>' +
        '<div class="row-gap"><button class="btn primary" id="btn-practice">' + icon('quiz') + 'Luyện trắc nghiệm</button><a class="btn ghost" href="#in/sotay/' + g + '-' + s + '">' + icon('book') + 'Sổ tay kiến thức</a><a class="btn ghost" href="#in/phieu/' + g + '-' + s + '">' + icon('file') + 'Phiếu bài tập</a></div></div>' +
        (book.note ? '<div class="callout">' + fmt(book.note) + '</div>' : '') +
        '<div class="units">' + book.units.map(function (u, ui) {
          var key = App.chapKey(g, s, L.book, ui), hasL = u.lessons.length > 0;
          var dn = u.lessons.filter(function (l) { return App.isLessonDone(l.id); }).length;
          var done = hasL ? dn === u.lessons.length : !!App.progress[key];
          return '<article class="unit ' + (done ? 'done' : '') + '" id="ch-' + ui + '"><div class="chap-head"><span class="chap-no">' + U.pad(ui + 1) + '</span><h3>' + esc(u.t) + '</h3>' +
            (hasL ? '<span class="muted small">' + dn + '/' + u.lessons.length + '</span>' : '<label class="done-toggle"><input type="checkbox" data-key="' + key + '"' + (done ? ' checked' : '') + '> Đã học</label>') + '</div>' +
            (u.d ? '<p class="muted">' + fmt(u.d) + '</p>' : '') +
            (hasL ? '<div class="lrows">' + u.lessons.map(lessonRow).join('') + '</div>' + (u.pts && u.pts.length ? '<details class="keypts"><summary>Kiến thức trọng tâm của chương</summary><ul class="points">' + u.pts.map(function (it) { return '<li>' + fmt(it) + '</li>'; }).join('') + '</ul></details>' : '')
              : '<ul class="points">' + (u.pts || []).map(function (it) { return '<li>' + fmt(it) + '</li>'; }).join('') + '</ul>') +
            '</article>';
        }).join('') + '</div>' +
        (!nL ? '<div class="callout">Danh mục từng bài của môn này đang được bổ sung dần theo SGK; trang tự cập nhật khi có bài mới. Trong lúc chờ, em học theo các chủ đề ở trên và luyện trắc nghiệm.</div>' : '') +
        '<p class="small muted">Xem sách giáo khoa điện tử miễn phí của NXB Giáo dục Việt Nam tại <a href="' + SGK_URL + '" target="_blank" rel="noopener">taphuan.nxbgd.vn</a>.</p></section>';
    } else {
      html += '<div class="empty">Chưa có học liệu cho môn này.</div>';
    }
    html += '<div class="cols"><section class="card"><div class="card-head"><h2>Bài giảng của giáo viên</h2>' + (App.isAdmin() ? '<a class="linkish" href="#admin" data-admintab="lessons">Thêm bài giảng</a>' : '') + '</div>' +
      (myLessons.length ? myLessons.map(function (x) {
        return '<article class="lesson"><h3>' + esc(x.title) + '</h3><p class="muted small">' + esc(U.dt(x.at)) + '</p><div class="prose">' + fmt(x.body || '') + '</div>' + (x.video ? '<p><a class="btn ghost sm" href="' + esc(x.video) + '" target="_blank" rel="noopener">' + icon('play') + 'Xem video bài giảng</a></p>' : '') + '</article>';
      }).join('') : '<div class="empty small">Giáo viên chưa đăng bài giảng riêng cho ' + esc(App.subjShort(s, g)) + ' lớp ' + g + '.</div>') + '</section>' +
      '<section class="card"><div class="card-head"><h2>Tài liệu</h2><a class="linkish" href="#docs">Thư viện</a></div>' +
      '<ul class="plain-list"><li><a class="pl-row" href="#in/sotay/' + g + '-' + s + '">' + icon('book') + '<span><b>Sổ tay kiến thức ' + esc(App.subjShort(s, g)) + ' ' + g + '</b><small>Tóm tắt lý thuyết, ghi nhớ – in hoặc lưu PDF</small></span></a></li>' +
      '<li><a class="pl-row" href="#in/phieu/' + g + '-' + s + '">' + icon('file') + '<span><b>Phiếu bài tập ' + esc(App.subjShort(s, g)) + ' ' + g + '</b><small>Có đáp án và lời giải ở trang cuối</small></span></a></li>' +
      myDocs.slice(0, 6).map(function (x) { return '<li><a class="pl-row" href="#docs">' + icon(x.kind === 'link' ? 'link' : x.kind === 'file' ? 'file' : 'text') + '<span><b>' + esc(x.title) + '</b><small>' + esc(x.g ? App.gradeLabel(x.g) : 'Dùng chung') + '</small></span></a></li>'; }).join('') + '</ul></section></div></div>';
    main.innerHTML = html;
    U.$$('[data-grade]', main).forEach(function (b) { b.onclick = function () { L.grade = Number(b.getAttribute('data-grade')); L.book = 0; App.rerender(); }; });
    U.$$('[data-s]', main).forEach(function (b) { b.onclick = function () { L.subj = b.getAttribute('data-s'); L.book = 0; App.rerender(); }; });
    U.$$('[data-book]', main).forEach(function (b) { b.onclick = function () { L.book = Number(b.getAttribute('data-book')); App.rerender(); }; });
    U.$$('[data-admintab]', main).forEach(function (a) { a.onclick = function () { App.S.adminTab = a.getAttribute('data-admintab'); }; });
    U.$$('input[data-key]', main).forEach(function (cb) {
      cb.onchange = async function () { cb.disabled = true; try { await setDone(cb.getAttribute('data-key'), cb.checked); cb.closest('.unit').classList.toggle('done', cb.checked); } catch (e) { cb.checked = !cb.checked; App.fail(e); } cb.disabled = false; };
    });
    var bp = U.$('#btn-practice', main);
    if (bp) bp.onclick = function () {
      var part = books.length > 1 ? book.title.replace(/\s*\d+$/, '').trim() : '';
      App.S.quizSetup = { g: g, s: s, b: App.partKey(part), n: 10, types: { mc: true, tf: true, sa: true }, limit: 0 };
      App.go('quiz');
    };
    var inp = U.$('#lsearch', main);
    inp.oninput = function () { L.q = inp.value; showSearch(inp.value, idx); };
    if (L.q) showSearch(L.q, idx);
    if (L.scrollTo !== undefined) { var el = U.$('#ch-' + L.scrollTo, main); L.scrollTo = undefined; if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('flash'); }, 60); }
  };
  function showSearch(q, idx) {
    var box = U.$('#lresults'); if (!box) return;
    q = U.plain(q).trim();
    if (q.length < 2) { box.innerHTML = ''; return; }
    var out = [];
    (idx.search || []).forEach(function (x) { if (out.length < 30 && U.plain((x.n || '') + ' ' + x.t + ' ' + x.u).indexOf(q) >= 0) out.push({ kind: 'l', x: x }); });
    Object.keys(D.curriculum).forEach(function (g) {
      App.SUBJ_KEYS.forEach(function (s) {
        (D.curriculum[g][s] || []).forEach(function (b, bi) {
          b.chapters.forEach(function (c, ci) {
            var hit = null;
            if (U.plain(c.t).indexOf(q) >= 0) hit = c.items[0] || '';
            else c.items.forEach(function (it) { if (!hit && U.plain(it).indexOf(q) >= 0) hit = it; });
            if (hit !== null && out.length < 50) out.push({ kind: 'c', g: Number(g), s: s, bi: bi, ci: ci, book: b.title, ch: c.t, text: hit });
          });
        });
      });
    });
    box.innerHTML = '<section class="card search-res"><div class="card-head"><h2>Kết quả tìm kiếm (' + out.length + ')</h2><button class="linkish" id="clr-search">Đóng</button></div>' +
      (out.length ? '<ul class="plain-list">' + out.map(function (r, i) {
        if (r.kind === 'l') return '<li><a class="pl-row" href="#bai/' + esc(r.x.id) + '"><span class="dot" style="background:' + App.SUBJ_COLOR[r.x.s] + '"></span><span><b>' + esc(App.subjShort(r.x.s, r.x.g) + ' ' + r.x.g + ' · ' + (r.x.n ? r.x.n + '. ' : '') + r.x.t) + '</b><small>' + esc(r.x.u) + (r.x.r ? ' · có bài giảng' : '') + '</small></span></a></li>';
        return '<li><button class="pl-row" data-hit="' + i + '"><span class="dot" style="background:' + App.SUBJ_COLOR[r.s] + '"></span><span><b>' + esc(r.book) + ' · ' + esc(r.ch) + '</b><small>' + fmt(r.text) + '</small></span></button></li>';
      }).join('') + '</ul>' : '<div class="empty small">Không tìm thấy nội dung phù hợp.</div>') + '</section>';
    U.$('#clr-search').onclick = function () { App.S.learn.q = ''; U.$('#lsearch').value = ''; box.innerHTML = ''; };
    U.$$('[data-hit]', box).forEach(function (b) {
      b.onclick = function () { var r = out[Number(b.getAttribute('data-hit'))]; Object.assign(App.S.learn, { grade: r.g, subj: r.s, book: r.bi, q: '', scrollTo: r.ci }); App.rerender(); };
    });
  }

  /* ---------- Trang một bài học ---------- */
  App.views.bai = async function (main, alive) {
    var id = App.routeArg || '', p = Lessons.parseId(id);
    if (!p) { main.innerHTML = '<div class="page"><div class="empty">Không tìm thấy bài học. <a href="#learn">Về Học liệu</a></div></div>'; return; }
    var data = await Lessons.load(p.g, p.s);
    if (!alive()) return;
    var flat = Lessons.flat(data), pos = flat.findIndex(function (x) { return x.l.id === id; });
    if (pos < 0) { main.innerHTML = '<div class="page"><div class="empty">Bài học này chưa có hoặc đã đổi tên. <a href="#learn">Về Học liệu</a></div></div>'; return; }
    var cur = flat[pos], l = cur.l, u = cur.u, b = cur.b, g = p.g, s = p.s;
    App.S.learn = Object.assign(App.S.learn || {}, { grade: g, subj: s, book: cur.bi });
    var prev = flat[pos - 1], next = flat[pos + 1];
    var done = App.isLessonDone(l.id);
    var ctx = b.title + ' · ' + u.t + ' · ' + (l.n ? l.n + '. ' : '') + l.t;
    document.title = (l.n ? l.n + '. ' : '') + l.t + ' – ' + b.title + ' | ' + (App.settings.siteName || 'Bảng Xanh');
    var sec = [];
    if (l.goals.length) sec.push(['goals', 'Mục tiêu']);
    if (l.theory.length) sec.push(['theory', 'Lý thuyết']);
    if (l.examples.length) sec.push(['ex', 'Ví dụ giải mẫu']);
    if (l.notes.length) sec.push(['notes', 'Ghi nhớ']);
    if (l.qs.length) sec.push(['practice', 'Luyện tập']);
    if (l.essays.length) sec.push(['essay', 'Tự luận']);
    var h = '<div class="page lesson-page" style="--c:' + App.SUBJ_COLOR[s] + '">' +
      '<nav class="crumbs small"><a href="#learn">Học liệu</a> › Lớp ' + g + ' › ' + esc(b.title) + ' › ' + esc(u.t) + '</nav>' +
      '<header class="lesson-head"><p class="eyebrow">' + esc((l.n ? l.n + ' · ' : '') + b.title) + '</p><h1>' + esc(l.t) + '</h1>' + (l.intro ? '<p class="lead">' + fmt(l.intro) + '</p>' : '') +
      '<div class="row-gap"><button class="btn ' + (done ? 'good-btn' : 'primary') + '" id="ls-done">' + icon('check') + (done ? 'Đã học xong' : 'Đánh dấu đã học') + '</button>' +
      '<button class="btn ghost" id="ls-ai">Hỏi trợ lý AI về bài này</button><a class="btn ghost" href="#in/bai/' + esc(l.id) + '">' + icon('file') + 'In / lưu PDF</a></div>' +
      (sec.length > 2 ? '<div class="chips toc">' + sec.map(function (x) { return '<a class="chip" href="javascript:void 0" data-jump="' + x[0] + '">' + x[1] + '</a>'; }).join('') + '</div>' : '') + '</header>';
    if (!l.ready) {
      h += '<section class="card"><div class="callout">Bài giảng chi tiết cho bài này <b>đang được bổ sung</b> – trang tự cập nhật mỗi ngày. Trong lúc chờ, em xem kiến thức trọng tâm của chương bên dưới, đọc SGK điện tử và luyện trắc nghiệm.</div>' +
        (u.pts && u.pts.length ? '<h2>Kiến thức trọng tâm của chương</h2><ul class="points">' + u.pts.map(function (it) { return '<li>' + fmt(it) + '</li>'; }).join('') + '</ul>' : '') +
        '<div class="row-gap"><button class="btn primary" id="ls-quiz">' + icon('quiz') + 'Luyện trắc nghiệm ' + esc(App.subjShort(s, g)) + ' ' + g + '</button><a class="btn ghost" href="' + SGK_URL + '" target="_blank" rel="noopener">' + icon('book') + 'SGK điện tử (NXB Giáo dục)</a></div></section>';
    }
    if (l.goals.length) h += '<section class="card" id="sec-goals"><h2>Mục tiêu bài học</h2><ul class="goals">' + l.goals.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ul></section>';
    if (l.theory.length) h += '<section class="card" id="sec-theory"><h2>Kiến thức trọng tâm</h2>' + l.theory.map(function (t) { return '<div class="th"><h3>' + fmt(t.h) + '</h3><ul class="points">' + t.pts.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ul></div>'; }).join('') + '</section>';
    if (l.examples.length) h += '<section class="card" id="sec-ex"><h2>Ví dụ giải mẫu</h2><p class="muted small">Em tự làm trước, sau đó bấm để xem lời giải từng bước.</p>' + l.examples.map(function (e, i) {
      return '<article class="example"><p class="ex-q"><b>Ví dụ ' + (i + 1) + '.</b> ' + fmt(e.q) + '</p><button type="button" class="btn sm ghost" data-reveal="' + i + '">Xem lời giải</button>' +
        '<div class="ex-sol" id="exs' + i + '" hidden>' + (e.steps.length ? '<ol class="steps">' + e.steps.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ol>' : '') + (e.ans ? '<p class="ex-ans"><b>Kết luận:</b> ' + fmt(e.ans) + '</p>' : '') + '</div></article>';
    }).join('') + '</section>';
    if (l.notes.length) h += '<section class="callout warn" id="sec-notes"><h2 class="h-sm">Ghi nhớ & lỗi thường gặp</h2><ul class="points">' + l.notes.map(function (x) { return '<li>' + fmt(x) + '</li>'; }).join('') + '</ul></section>';
    if (l.qs.length) h += '<section class="card" id="sec-practice"><div class="card-head"><h2>Luyện tập – chấm và chữa ngay</h2><button class="btn sm ghost" id="ls-timed">' + icon('clock') + 'Làm thành bài kiểm tra</button></div><p class="muted small">Làm từng câu rồi bấm <b>Kiểm tra</b>: trang chấm theo thang điểm đề thi tốt nghiệp và hiện lời giải. Câu sai được lưu vào <b>Sổ lỗi sai</b> để em luyện lại.</p><div id="lp-box">' + practiceBlock(l.qs, 'p') + '</div></section>';
    if (l.essays.length) h += '<section class="card" id="sec-essay"><h2>Bài tập tự luận</h2><p class="muted small">Viết lời giải, sau đó đối chiếu đáp án mẫu và tự chấm theo tiêu chí, hoặc nhờ trợ lý AI chấm và chữa chi tiết.</p>' + essayBlock(l.essays, l.id) + '</section>';
    h += '<nav class="lesson-nav">' + (prev ? '<a class="btn ghost" href="#bai/' + esc(prev.l.id) + '">← ' + esc((prev.l.n ? prev.l.n + '. ' : '') + prev.l.t) + '</a>' : '<span></span>') +
      (next ? '<a class="btn ghost" href="#bai/' + esc(next.l.id) + '">' + esc((next.l.n ? next.l.n + '. ' : '') + next.l.t) + ' →</a>' : '<a class="btn ghost" href="#learn">Về danh mục bài học</a>') + '</nav></div>';
    main.innerHTML = h;
    U.$$('[data-jump]', main).forEach(function (a) { a.onclick = function () { var el = U.$('#sec-' + a.getAttribute('data-jump')); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
    U.$$('[data-reveal]', main).forEach(function (b) { b.onclick = function () { var el = U.$('#exs' + b.getAttribute('data-reveal')); el.hidden = !el.hidden; b.textContent = el.hidden ? 'Xem lời giải' : 'Ẩn lời giải'; }; });
    U.$('#ls-done', main).onclick = async function () {
      var btn = this; btn.disabled = true;
      try { await setDone(App.lessonKey(l.id), !App.isLessonDone(l.id)); var d = App.isLessonDone(l.id); btn.className = 'btn ' + (d ? 'good-btn' : 'primary'); btn.innerHTML = icon('check') + (d ? 'Đã học xong' : 'Đánh dấu đã học'); if (d) U.toast('Tuyệt! Đã ghi nhận em học xong bài này.', 'ok'); } catch (e) { App.fail(e); }
      btn.disabled = false;
    };
    U.$('#ls-ai', main).onclick = function () { if (App.AI) App.AI.open({ mode: 'lesson', context: ctx, prefill: 'Em chưa hiểu phần … trong bài ' + (l.n ? l.n + ' ' : '') + l.t + '. Giải thích giúp em với ví dụ đơn giản.' }); };
    var qz = U.$('#ls-quiz', main);
    if (qz) qz.onclick = function () { App.S.quizSetup = { g: g, s: s, b: '', n: 10, types: { mc: true, tf: true, sa: true }, limit: 0 }; App.go('quiz'); };
    if (l.qs.length) {
      var mount = function () {
        var box = U.$('#lp-box', main); box.innerHTML = practiceBlock(l.qs, 'p');
        bindPractice(box, l.qs, 'p', { context: ctx, review: 'đọc lại phần Kiến thức trọng tâm và Ví dụ giải mẫu ở trên.', onRedo: mount,
          onDone: function (all) {
            App.store.create('results', { kind: 'practice', title: 'Luyện tập · ' + (l.n ? l.n + '. ' : '') + l.t, g: g, s: s, score: all.score, correct: all.correct, count: all.count, earned: all.earned, total: all.total, duration: 0, detail: all.detail }).catch(function () { /* bỏ qua */ });
            if (all.score >= 8 && !App.isLessonDone(l.id)) setDone(App.lessonKey(l.id), true).then(function () { var bt = U.$('#ls-done'); if (bt) { bt.className = 'btn good-btn'; bt.innerHTML = icon('check') + 'Đã học xong'; } }).catch(function () { /* bỏ qua */ });
          } });
      };
      mount();
      U.$('#ls-timed', main).onclick = function () { App.startRun({ mode: 'practice', title: 'Kiểm tra · ' + (l.n ? l.n + '. ' : '') + l.t, qs: l.qs, limit: Math.max(5, l.qs.length * 2) * 60, g: g, s: s }); };
    }
    if (l.essays.length) bindEssays(main, l.essays, ctx);
  };

  /* ---------- Tài liệu in được: sổ tay kiến thức, phiếu bài tập, một bài ---------- */
  function shuffleSeeded(arr, seed) {
    var a = arr.slice(), x = seed || 1;
    for (var i = a.length - 1; i > 0; i--) { x = (x * 9301 + 49297) % 233280; var j = Math.floor(x / 233280 * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function printQ(q, i) {
    var body = '';
    if (q.t === 'mc') body = '<ol class="p-opts" type="A">' + q.o.map(function (o) { return '<li>' + fmt(o) + '</li>'; }).join('') + '</ol>';
    else if (q.t === 'tf') body = '<table class="p-tf"><tbody>' + q.o.map(function (o, k) { return '<tr><td>' + 'abcd'[k] + ')</td><td>' + fmt(o) + '</td><td class="p-box">Đ ☐ S ☐</td></tr>'; }).join('') + '</tbody></table>';
    else body = '<p class="p-line">Đáp số: ……………………</p>';
    return '<li class="p-q"><div>' + fmt(q.q) + '</div>' + body + '</li>';
  }
  function printKey(q, i) {
    var a = q.t === 'mc' ? LETTERS[q.a] : q.t === 'tf' ? q.a.map(function (v, k) { return 'abcd'[k] + ')' + (v ? 'Đ' : 'S'); }).join(' ') : (q.a || []).join(' hoặc ');
    return '<li><b>' + esc(a) + '</b>' + (q.e ? ' – ' + fmt(q.e) : '') + '</li>';
  }
  App.views.in = async function (main, alive) {
    var arg = String(App.routeArg || ''), parts = arg.split('/'), kind = parts[0], key = parts.slice(1).join('/');
    var site = App.settings.siteName || 'Bảng Xanh', body = '', title = '';
    if (kind === 'bai') {
      var p = Lessons.parseId(key); if (!p) { main.innerHTML = '<div class="page"><div class="empty">Không tìm thấy tài liệu.</div></div>'; return; }
      var data = await Lessons.load(p.g, p.s); if (!alive()) return;
      var x = Lessons.flat(data).find(function (y) { return y.l.id === key; });
      if (!x) { main.innerHTML = '<div class="page"><div class="empty">Không tìm thấy bài học.</div></div>'; return; }
      var l = x.l; title = (l.n ? l.n + '. ' : '') + l.t;
      body = '<p class="p-sub">' + esc(x.b.title + ' · ' + x.u.t) + '</p>' +
        (l.goals.length ? '<h2>Mục tiêu</h2><ul>' + l.goals.map(function (z) { return '<li>' + fmt(z) + '</li>'; }).join('') + '</ul>' : '') +
        (l.theory.length ? '<h2>Kiến thức trọng tâm</h2>' + l.theory.map(function (t) { return '<h3>' + fmt(t.h) + '</h3><ul>' + t.pts.map(function (z) { return '<li>' + fmt(z) + '</li>'; }).join('') + '</ul>'; }).join('') : (x.u.pts && x.u.pts.length ? '<h2>Kiến thức trọng tâm của chương</h2><ul>' + x.u.pts.map(function (z) { return '<li>' + fmt(z) + '</li>'; }).join('') + '</ul>' : '')) +
        (l.examples.length ? '<h2>Ví dụ giải mẫu</h2>' + l.examples.map(function (e, i) { return '<div class="p-ex"><p><b>Ví dụ ' + (i + 1) + '.</b> ' + fmt(e.q) + '</p><ol>' + e.steps.map(function (z) { return '<li>' + fmt(z) + '</li>'; }).join('') + '</ol>' + (e.ans ? '<p><b>Kết luận:</b> ' + fmt(e.ans) + '</p>' : '') + '</div>'; }).join('') : '') +
        (l.notes.length ? '<h2>Ghi nhớ</h2><ul>' + l.notes.map(function (z) { return '<li>' + fmt(z) + '</li>'; }).join('') + '</ul>' : '') +
        (l.qs.length ? '<h2>Bài tập</h2><ol class="p-qs">' + l.qs.map(printQ).join('') + '</ol>' : '') +
        (l.essays.length ? '<h2>Tự luận</h2><ol>' + l.essays.map(function (e) { return '<li>' + fmt(e.q) + '</li>'; }).join('') + '</ol>' : '') +
        (l.qs.length || l.essays.length ? '<div class="p-break"></div><h2>Đáp án và lời giải</h2><ol>' + l.qs.map(printKey).join('') + '</ol>' + l.essays.map(function (e, i) { return '<p><b>Tự luận ' + (i + 1) + ':</b></p><ol>' + e.sample.map(function (z) { return '<li>' + fmt(z) + '</li>'; }).join('') + '</ol>'; }).join('') : '');
    } else {
      var m = key.match(/^(\d+)-(toan|van|anh|khtn|khxh)$/);
      if (!m) { main.innerHTML = '<div class="page"><div class="empty">Không tìm thấy tài liệu.</div></div>'; return; }
      var g = Number(m[1]), s = m[2];
      var dt = await Lessons.load(g, s); if (!alive()) return;
      var subj = App.subjShort(s, g) + ' ' + g;
      if (kind === 'sotay') {
        title = 'Sổ tay kiến thức ' + subj;
        body = '<p class="p-sub">Tóm tắt kiến thức trọng tâm theo chương và theo từng bài – SGK Kết nối tri thức với cuộc sống.</p>' + (dt.books || []).map(function (b) {
          return '<h2 class="p-book">' + esc(b.title) + '</h2>' + (b.note ? '<p class="p-note">' + fmt(b.note) + '</p>' : '') + b.units.map(function (u) {
            var inner = (u.pts && u.pts.length ? '<ul>' + u.pts.map(function (z) { return '<li>' + fmt(z) + '</li>'; }).join('') + '</ul>' : '');
            u.lessons.filter(function (ll) { return ll.ready; }).forEach(function (ll) {
              inner += '<h4>' + esc((ll.n ? ll.n + '. ' : '') + ll.t) + '</h4>' + ll.theory.map(function (t) { return '<p class="p-h">' + fmt(t.h) + '</p><ul>' + t.pts.map(function (z) { return '<li>' + fmt(z) + '</li>'; }).join('') + '</ul>'; }).join('') +
                (ll.notes.length ? '<p class="p-h">Ghi nhớ</p><ul>' + ll.notes.map(function (z) { return '<li>' + fmt(z) + '</li>'; }).join('') + '</ul>' : '');
            });
            return '<section class="p-unit"><h3>' + esc(u.t) + '</h3>' + inner + '</section>';
          }).join('');
        }).join('');
      } else if (kind === 'phieu') {
        title = 'Phiếu bài tập ' + subj;
        var all = Lessons.allQuestions(dt);
        var bankQs = []; try { bankQs = (await App.bank()).filter(function (q) { return Number(q.g) === g && q.s === s; }); } catch (e) { /* bỏ qua */ }
        if (!alive()) return;
        var seed = Number(new Date().toISOString().slice(0, 10).replace(/-/g, '')) % 100000;
        var pick = shuffleSeeded(all, seed).slice(0, 14).concat(shuffleSeeded(bankQs, seed + 7).slice(0, Math.max(6, 20 - Math.min(14, all.length))));
        var order = { mc: 0, tf: 1, sa: 2 }; pick.sort(function (a, b) { return order[a.t] - order[b.t]; });
        if (!pick.length) body = '<p>Chưa có câu hỏi cho lớp – môn này.</p>';
        else body = '<p class="p-sub">Họ và tên: ………………………………… Lớp: ……… Ngày: ………… · Gồm ' + pick.length + ' câu (nhiều lựa chọn, Đúng/Sai, trả lời ngắn). Phiếu đổi câu hỏi mỗi ngày.</p><ol class="p-qs">' + pick.map(printQ).join('') + '</ol><div class="p-break"></div><h2>Đáp án và lời giải</h2><ol>' + pick.map(printKey).join('') + '</ol>';
      } else { main.innerHTML = '<div class="page"><div class="empty">Không tìm thấy tài liệu.</div></div>'; return; }
    }
    document.title = title + ' | ' + site;
    main.innerHTML = '<div class="page print-page"><div class="print-bar no-print"><button class="btn ghost" id="pr-back">← Quay lại</button><button class="btn primary" id="pr-go">' + icon('download') + 'In / Lưu PDF</button><span class="muted small">Mẹo: ở hộp thoại in, chọn "Lưu dưới dạng PDF" để tải về.</span></div>' +
      '<article class="paper"><header class="p-head"><span class="p-brand">' + esc(site) + '</span><span>' + esc(location.host || '') + '</span></header><h1>' + esc(title) + '</h1>' + body + '<footer class="p-foot">Tài liệu miễn phí của ' + esc(site) + ' · biên soạn theo Chương trình GDPT 2018, SGK Kết nối tri thức với cuộc sống.</footer></article></div>';
    U.$('#pr-back', main).onclick = function () { history.length > 1 ? history.back() : App.go('docs'); };
    U.$('#pr-go', main).onclick = function () { window.print(); };
  };

  /* ---------- Thư viện tài liệu: thêm thẻ "Theo lớp – môn" ---------- */
  var origDocs = App.views.docs;
  App.views.docs = async function (main, alive) {
    var tab = App.S.docTab || 'class';
    if (tab !== 'class') {
      await origDocs(main, alive);
      if (!alive()) return;
      var tabs = U.$('.tabs', main);
      if (tabs) {
        tabs.insertAdjacentHTML('afterbegin', '<button class="tab" data-dt2="class">' + icon('book') + 'Theo lớp – môn</button>');
        U.$('[data-dt2]', tabs).onclick = function () { App.S.docTab = 'class'; App.rerender(); };
      }
      return;
    }
    var idx = await Lessons.index(); if (!alive()) return;
    var F = App.S.docClass || (App.S.docClass = { g: App.user.grade || 12 });
    var g = F.g;
    var stat = function (s) { return (idx.list || []).find(function (x) { return x.g === g && x.s === s; }) || {}; };
    var nq = function (s) { return (D.questions || []).filter(function (q) { return q.g === g && q.s === s; }).length + (stat(s).questions || 0); };
    main.innerHTML = '<div class="page"><header class="page-head"><div><h1>Thư viện tài liệu</h1><p class="muted">Tài liệu học tập cho từng môn, từng lớp: sổ tay kiến thức, phiếu bài tập có đáp án (in hoặc lưu PDF), danh mục bài học và sách giáo khoa điện tử.</p></div>' + (App.isAdmin() ? '<a class="btn primary" href="#admin" id="add-doc">' + icon('plus') + 'Thêm tài liệu</a>' : '') + '</header>' +
      '<div class="tabs"><button class="tab on">' + icon('book') + 'Theo lớp – môn</button><button class="tab" data-dt="docs">' + icon('folder') + 'Tài liệu giáo viên chia sẻ</button><button class="tab" data-dt="news">' + icon('rss') + 'Tin giáo dục</button></div>' +
      '<section class="levels">' + App.LEVELS.map(function (lv) { return '<div class="lv"><span class="lv-name">' + lv.name + '</span><div class="chips">' + lv.grades.map(function (x) { return '<button class="chip ' + (x === g ? 'on' : '') + '" data-dg="' + x + '">Lớp ' + x + '</button>'; }).join('') + '</div></div>'; }).join('') + '</section>' +
      '<div class="doc-grid">' + App.SUBJ_KEYS.filter(function (s) { return ((D.curriculum[String(g)] || {})[s] || []).length; }).map(function (s) {
        var st = stat(s);
        return '<article class="doc-subj" style="--c:' + App.SUBJ_COLOR[s] + '"><header><span class="sc-tag">' + esc(App.subjShort(s, g)) + ' ' + g + '</span><h3>' + esc(App.subjLong(s, g)) + '</h3><p class="muted small">' + (st.lessons ? st.lessons + ' bài' + (st.ready ? ' · ' + st.ready + ' bài giảng chi tiết' : '') : (st.units || 0) + ' chủ đề') + ' · ' + nq(s) + ' câu hỏi</p></header>' +
          '<ul class="plain-list"><li><a class="pl-row" href="#in/sotay/' + g + '-' + s + '">' + icon('book') + '<span><b>Sổ tay kiến thức</b><small>Tóm tắt lý thuyết theo chương, theo bài</small></span></a></li>' +
          '<li><a class="pl-row" href="#in/phieu/' + g + '-' + s + '">' + icon('file') + '<span><b>Phiếu bài tập</b><small>Đổi câu mỗi ngày · có đáp án, lời giải</small></span></a></li>' +
          '<li><button class="pl-row" data-open="' + s + '">' + icon('quiz') + '<span><b>Danh mục bài học</b><small>Học từng bài, luyện tập chấm ngay</small></span></button></li>' +
          '<li><a class="pl-row" href="' + SGK_URL + '" target="_blank" rel="noopener">' + icon('link') + '<span><b>SGK điện tử</b><small>Miễn phí trên taphuan.nxbgd.vn</small></span></a></li></ul></article>';
      }).join('') + '</div></div>';
    U.$$('[data-dt]', main).forEach(function (b) { b.onclick = function () { App.S.docTab = b.getAttribute('data-dt'); App.rerender(); }; });
    U.$$('[data-dg]', main).forEach(function (b) { b.onclick = function () { F.g = Number(b.getAttribute('data-dg')); App.rerender(); }; });
    U.$$('[data-open]', main).forEach(function (b) { b.onclick = function () { App.S.learn = { grade: g, subj: b.getAttribute('data-open'), book: 0 }; App.go('learn'); }; });
    var ad = U.$('#add-doc', main); if (ad) ad.onclick = function () { App.S.adminTab = 'docs'; };
  };

  /* ---------- Trắc nghiệm: thêm thẻ Sổ lỗi sai ---------- */
  var origQuiz = App.views.quiz;
  App.views.quiz = async function (main, alive) {
    await origQuiz(main, alive);
    if (!alive() || App.S.run) return;
    var n = Mistakes.count();
    var head = U.$('.page-head', main) || U.$('.page', main);
    if (!head) return;
    head.insertAdjacentHTML('afterend', '<section class="card mk-card"><div class="card-head"><h2>' + icon('reset') + 'Sổ lỗi sai</h2><span class="badge">' + n + ' câu</span></div>' +
      (n ? '<p class="muted small">Các câu em làm sai ở trang bài học, luyện tập và đề thi được lưu lại trên máy này. Làm đúng một câu 2 lần liên tiếp thì câu đó tự rời sổ.</p><div class="row-gap"><button class="btn primary" id="mk-run">Luyện lại ' + Math.min(n, 30) + ' câu sai gần nhất</button><button class="btn ghost" id="mk-view">Xem danh sách</button><button class="btn ghost" id="mk-clear">Xóa sổ</button></div>'
        : '<p class="muted small">Chưa có câu sai nào. Khi em làm sai, câu đó sẽ được lưu ở đây để luyện lại.</p>') + '</section>');
    var run = U.$('#mk-run', main);
    if (run) run.onclick = function () { var qs = Mistakes.list().slice(0, 30).map(function (x) { return x.q; }); App.startRun({ mode: 'practice', title: 'Luyện lại câu sai', qs: qs, limit: 0 }); };
    var view = U.$('#mk-view', main);
    if (view) view.onclick = function () {
      var list = Mistakes.list();
      U.openModal({ title: 'Sổ lỗi sai (' + list.length + ' câu)', wide: true, body: '<ol class="review">' + list.map(function (x) { var q = x.q; return '<li class="rv no"><div class="rv-head"><span class="badge">' + esc(App.subjShort(q.s, q.g) + ' ' + (q.g || '')) + '</span><span class="muted small">Sai ' + x.n + ' lần</span>' + (q.lesson ? '<a class="linkish small" href="#bai/' + esc(q.lesson) + '">Ôn lại bài</a>' : '') + '</div><div class="q-text">' + fmt(q.q) + '</div>' + (q.e ? '<div class="explain"><b>Lời giải:</b> ' + fmt(q.e) + '</div>' : '') + '</li>'; }).join('') + '</ol>' });
    };
    var clr = U.$('#mk-clear', main);
    if (clr) clr.onclick = async function () { if (await U.confirmBox('Xóa toàn bộ sổ lỗi sai trên máy này?', 'Xóa', true)) { Mistakes.clear(); App.rerender(); } };
  };
})();
