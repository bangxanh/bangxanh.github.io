/* Trắc nghiệm: luyện tập, làm đề thi, chấm điểm, xem lại */
(function () {
  'use strict';
  var U = window.UI, App = window.App, esc = U.esc, fmt = U.fmt, icon = U.icon;
  var TYPE_LABEL = { mc: 'Trắc nghiệm nhiều lựa chọn', tf: 'Trắc nghiệm Đúng/Sai', sa: 'Trả lời ngắn' };
  var TYPE_SHORT = { mc: 'Nhiều lựa chọn', tf: 'Đúng/Sai', sa: 'Trả lời ngắn' };
  var LETTERS = ['A', 'B', 'C', 'D'];
  App.TYPE_LABEL = TYPE_LABEL; App.TYPE_SHORT = TYPE_SHORT;

  async function bank() {
    var custom = [];
    try { custom = await App.store.list('questions'); } catch (e) { App.fail(e); }
    return window.BXStore.allBankQuestions(custom.filter(function (q) { return !q.hidden; }));
  }
  App.bank = bank;
  function partsFor(g, s) {
    var books = ((App.D.curriculum[String(g)] || {})[s]) || [];
    var parts = [];
    books.forEach(function (b) { var k = App.partKey(b.title); if (k && parts.indexOf(k) < 0) parts.push(k); });
    return parts;
  }
  function orderByType(qs) {
    var rank = { mc: 0, tf: 1, sa: 2 };
    return qs.slice().sort(function (a, b) { return rank[a.t] - rank[b.t]; });
  }

  /* =============== TRANG TRẮC NGHIỆM =============== */
  App.views.quiz = async function (main, alive) {
    if (App.S.run) return renderRun(main);
    var all = await bank();
    if (!alive()) return;
    var C = App.S.quizSetup || (App.S.quizSetup = { g: App.user.grade || 12, s: 'toan', b: '', n: 20, types: { mc: true, tf: true, sa: true }, limit: 0 });
    var recent = [];
    try { recent = (await App.store.list('results')).filter(function (r) { return r.owner === App.user.id; }).sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); }).slice(0, 6); } catch (e) { /* bỏ qua */ }
    if (!alive()) return;
    function pool() {
      return all.filter(function (q) { return Number(q.g) === Number(C.g) && q.s === C.s && (!C.b || q.b === C.b) && C.types[q.t]; });
    }
    function draw() {
      var parts = partsFor(C.g, C.s);
      if (C.b && parts.indexOf(C.b) < 0) C.b = '';
      var p = pool();
      var counts = { mc: 0, tf: 0, sa: 0 };
      all.forEach(function (q) { if (Number(q.g) === Number(C.g) && q.s === C.s && (!C.b || q.b === C.b)) counts[q.t]++; });
      U.$('#qs-form').innerHTML =
        '<div class="row2"><label class="field"><span>Lớp</span><select class="input" id="qs-g">' + App.gradeOptions(C.g) + '</select></label>' +
        '<label class="field"><span>Môn</span><select class="input" id="qs-s">' + App.subjOptions(C.s, false, C.g) + '</select></label></div>' +
        (parts.length ? '<div class="field"><span>Phân môn</span><div class="chips"><button type="button" class="chip ' + (!C.b ? 'on' : '') + '" data-b="">Tất cả</button>' + parts.map(function (x) { return '<button type="button" class="chip ' + (C.b === x ? 'on' : '') + '" data-b="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div></div>' : '') +
        '<div class="field"><span>Dạng câu hỏi</span><div class="chips">' + ['mc', 'tf', 'sa'].map(function (t) { return '<button type="button" class="chip ' + (C.types[t] ? 'on' : '') + '" data-t="' + t + '">' + TYPE_SHORT[t] + ' <small>(' + counts[t] + ')</small></button>'; }).join('') + '</div></div>' +
        '<div class="row2"><label class="field"><span>Số câu</span><select class="input" id="qs-n">' + [5, 10, 20, 30, 40, 0].map(function (n) { return '<option value="' + n + '"' + (C.n === n ? ' selected' : '') + '>' + (n ? n + ' câu' : 'Tất cả câu phù hợp') + '</option>'; }).join('') + '</select></label>' +
        '<label class="field"><span>Thời gian</span><select class="input" id="qs-l">' + [0, 5, 10, 15, 30, 45, 50, 90].map(function (n) { return '<option value="' + n + '"' + (C.limit === n ? ' selected' : '') + '>' + (n ? n + ' phút' : 'Không giới hạn') + '</option>'; }).join('') + '</select></label></div>' +
        '<div class="setup-foot"><p class="muted">Có <b>' + p.length + '</b> câu phù hợp trong ngân hàng.</p><button class="btn primary lg" type="submit"' + (p.length ? '' : ' disabled') + '>' + icon('play') + 'Bắt đầu làm bài</button></div>';
      U.$('#qs-g').onchange = function () { C.g = Number(this.value); C.b = ''; draw(); };
      U.$('#qs-s').onchange = function () { C.s = this.value; C.b = ''; draw(); };
      U.$('#qs-n').onchange = function () { C.n = Number(this.value); };
      U.$('#qs-l').onchange = function () { C.limit = Number(this.value); };
      U.$$('[data-b]').forEach(function (b) { b.onclick = function () { C.b = b.getAttribute('data-b'); draw(); }; });
      U.$$('[data-t]').forEach(function (b) { b.onclick = function () { var t = b.getAttribute('data-t'); C.types[t] = !C.types[t]; if (!C.types.mc && !C.types.tf && !C.types.sa) C.types[t] = true; draw(); }; });
    }
    main.innerHTML = '<div class="page"><header class="page-head"><div><h1>Trắc nghiệm online</h1><p class="muted">Đủ 3 dạng câu hỏi của đề thi mới. Điểm quy về thang 10: nhiều lựa chọn 0,25 điểm/câu; Đúng/Sai tính theo số ý đúng (1 ý 0,1 · 2 ý 0,25 · 3 ý 0,5 · 4 ý 1 điểm); trả lời ngắn 0,5 điểm/câu với Toán, 0,25 điểm/câu với các môn khác.</p></div></header>' +
      '<div class="cols wide-left"><section class="card"><h2>Tạo bài luyện tập</h2><form id="qs-form" class="stack"></form></section>' +
      '<div class="stack"><section class="card"><h2>Luyện nhanh</h2><div class="quick">' +
      '<a class="quick-item" href="#exams">' + icon('exam') + '<span><b>Đề thi giáo viên giao</b><small>Làm bài có tính giờ</small></span></a>' +
      '<button class="quick-item" data-tool="drill">' + icon('bolt') + '<span><b>Luyện tính nhẩm</b><small>Dành cho học sinh tiểu học</small></span></button>' +
      '<button class="quick-item" data-tool="vocab">' + icon('cards') + '<span><b>Ôn từ vựng Tiếng Anh</b><small>Thẻ ghi nhớ và kiểm tra nhanh</small></span></button></div></section>' +
      '<section class="card"><h2>Bài gần đây</h2>' + (recent.length ? '<ul class="plain-list">' + recent.map(function (r) { return '<li class="pl-row"><span class="score ' + U.scoreClass(r.score || 0) + '">' + U.num(r.score, 1) + '</span><span><b>' + esc(r.title) + '</b><small>' + esc(App.kindLabel(r.kind)) + ' · ' + esc(U.dt(r.at, true)) + '</small></span></li>'; }).join('') + '</ul>' : '<div class="empty small">Em chưa làm bài nào.</div>') + '</section></div></div></div>';
    draw();
    U.$('#qs-form').onsubmit = function (e) {
      e.preventDefault();
      var p = U.shuffle(pool());
      if (C.n) p = p.slice(0, C.n);
      if (!p.length) return;
      var title = (C.b && C.b.length > 4 ? C.b : App.subjShort(C.s, C.g) + (C.b ? ' – ' + C.b : '')) + ' ' + C.g + ' · ' + p.length + ' câu';
      startRun({ mode: 'practice', title: title, qs: orderByType(p), limit: C.limit * 60, g: C.g, s: C.s });
    };
    U.$$('[data-tool]', main).forEach(function (b) { b.onclick = function () { App.S.tool = b.getAttribute('data-tool'); App.go('tools'); }; });
  };

  function startRun(o) {
    App.S.run = { mode: o.mode, title: o.title, qs: o.qs, ans: {}, flags: {}, i: 0, t0: Date.now(), limit: o.limit || 0, examId: o.examId || null, g: o.g, s: o.s, result: null, showAnswers: o.showAnswers !== false };
    App.go('quiz');
  }
  App.startRun = startRun;

  /* =============== LÀM BÀI =============== */
  var timerId = null;
  function elapsed(R) { return Math.round((Date.now() - R.t0) / 1000); }
  function answeredCount(R) { return R.qs.filter(function (q) { return isAnswered(q, R.ans[q.id]); }).length; }
  function isAnswered(q, a) {
    if (q.t === 'mc') return a !== undefined && a !== null;
    if (q.t === 'tf') return Array.isArray(a) && a.some(function (x) { return x === true || x === false; });
    return a !== undefined && String(a).trim() !== '';
  }
  function renderRun(main) {
    var R = App.S.run;
    if (R.result) return renderResult(main);
    var q = R.qs[R.i];
    var a = R.ans[q.id];
    var body = '';
    if (q.t === 'mc') {
      body = '<div class="opts">' + q.o.map(function (o, k) { return '<button class="opt ' + (a === k ? 'sel' : '') + '" data-opt="' + k + '"><span class="opt-l">' + LETTERS[k] + '</span><span>' + fmt(o) + '</span></button>'; }).join('') + '</div>';
    } else if (q.t === 'tf') {
      var arr = Array.isArray(a) ? a : [null, null, null, null];
      body = '<div class="tfs">' + q.o.map(function (o, k) {
        return '<div class="tf-row"><span class="tf-l">' + 'abcd'[k] + ')</span><span class="tf-text">' + fmt(o) + '</span><span class="tf-btns"><button class="tfb ' + (arr[k] === true ? 'on yes' : '') + '" data-tf="' + k + '|1">Đúng</button><button class="tfb ' + (arr[k] === false ? 'on no' : '') + '" data-tf="' + k + '|0">Sai</button></span></div>';
      }).join('') + '</div>';
    } else {
      body = '<label class="field sa"><span>Đáp án của em (số thập phân dùng dấu phẩy, ví dụ 0,5)</span><input class="input lg" id="sa-in" inputmode="decimal" autocomplete="off" value="' + esc(a || '') + '"></label>';
    }
    var remain = R.limit ? R.limit - elapsed(R) : null;
    main.innerHTML = '<div class="page run"><div class="run-head"><div><p class="eyebrow">' + (R.mode === 'exam' ? 'Đề thi' : 'Luyện tập') + '</p><h1>' + esc(R.title) + '</h1></div>' +
      '<div class="run-meta"><span class="timer ' + (remain !== null && remain < 60 ? 'urgent' : '') + '" id="timer">' + icon('clock') + '<b>' + (remain !== null ? U.dur(remain) : U.dur(elapsed(R))) + '</b></span><span class="muted">' + answeredCount(R) + '/' + R.qs.length + ' câu đã làm</span>' +
      '<button class="btn primary" id="btn-submit">Nộp bài</button></div></div>' +
      '<div class="run-body"><section class="qcard"><div class="q-top"><span class="q-no">Câu ' + (R.i + 1) + '<small>/' + R.qs.length + '</small></span><span class="badge">' + TYPE_LABEL[q.t] + '</span>' + (q.b ? '<span class="badge soft">' + esc(q.b) + '</span>' : '') +
      '<button class="flag-btn ' + (R.flags[q.id] ? 'on' : '') + '" id="btn-flag" aria-pressed="' + (R.flags[q.id] ? 'true' : 'false') + '">' + icon('flag') + 'Đánh dấu xem lại</button></div>' +
      '<div class="q-text">' + fmt(q.q) + '</div>' + body +
      '<div class="q-nav"><button class="btn ghost" id="btn-prev"' + (R.i ? '' : ' disabled') + '>' + icon('left') + 'Câu trước</button><button class="btn ghost" id="btn-next"' + (R.i < R.qs.length - 1 ? '' : ' disabled') + '>Câu sau' + icon('right') + '</button></div></section>' +
      '<aside class="navpane"><h3>Danh sách câu</h3><div class="navgrid">' + R.qs.map(function (x, k) {
        return '<button class="nb ' + (k === R.i ? 'cur ' : '') + (isAnswered(x, R.ans[x.id]) ? 'ans ' : '') + (R.flags[x.id] ? 'flag' : '') + '" data-go="' + k + '" aria-label="Câu ' + (k + 1) + '">' + (k + 1) + '</button>';
      }).join('') + '</div><p class="legend"><span class="nb ans">1</span> đã làm <span class="nb flag">2</span> đánh dấu <span class="nb">3</span> chưa làm</p>' +
      '<button class="btn danger ghost block" id="btn-quit">Hủy bài làm</button></aside></div></div>';
    U.$$('[data-opt]', main).forEach(function (b) { b.onclick = function () { R.ans[q.id] = Number(b.getAttribute('data-opt')); renderRun(main); }; });
    U.$$('[data-tf]', main).forEach(function (b) {
      b.onclick = function () {
        var p = b.getAttribute('data-tf').split('|'), arr = Array.isArray(R.ans[q.id]) ? R.ans[q.id].slice() : [null, null, null, null];
        var v = p[1] === '1';
        arr[Number(p[0])] = arr[Number(p[0])] === v ? null : v;
        R.ans[q.id] = arr; renderRun(main);
      };
    });
    var si = U.$('#sa-in', main);
    if (si) { si.oninput = function () { R.ans[q.id] = si.value; var nb = U.$('[data-go="' + R.i + '"]', main); if (nb) nb.classList.toggle('ans', si.value.trim() !== ''); }; si.onkeydown = function (e) { if (e.key === 'Enter' && R.i < R.qs.length - 1) { R.i++; renderRun(main); } }; si.focus(); }
    U.$('#btn-prev', main).onclick = function () { R.i--; renderRun(main); };
    U.$('#btn-next', main).onclick = function () { R.i++; renderRun(main); };
    U.$('#btn-flag', main).onclick = function () { R.flags[q.id] = !R.flags[q.id]; renderRun(main); };
    U.$$('[data-go]', main).forEach(function (b) { b.onclick = function () { R.i = Number(b.getAttribute('data-go')); renderRun(main); }; });
    U.$('#btn-submit', main).onclick = function () { askSubmit(main); };
    U.$('#btn-quit', main).onclick = async function () {
      if (await U.confirmBox('Hủy bài làm này? Câu trả lời sẽ không được lưu.', 'Hủy bài', true)) { stopTimer(); App.S.run = null; App.rerender(); }
    };
    startTimer(main);
  }
  function startTimer(main) {
    stopTimer();
    timerId = setInterval(function () {
      var R = App.S.run, el = U.$('#timer');
      if (!R || R.result || !el) { stopTimer(); return; }
      if (R.limit) {
        var remain = R.limit - elapsed(R);
        el.querySelector('b').textContent = U.dur(Math.max(0, remain));
        el.classList.toggle('urgent', remain < 60);
        if (remain <= 0) { stopTimer(); U.toast('Hết giờ! Bài làm đã được nộp tự động.', 'warn'); submit(main); }
      } else el.querySelector('b').textContent = U.dur(elapsed(R));
    }, 1000);
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  document.addEventListener('keydown', function (e) {
    var R = App.S.run;
    if (!R || R.result || location.hash !== '#quiz' || document.querySelector('.modal-back')) return;
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    var q = R.qs[R.i], main = U.$('#main');
    if (e.key === 'ArrowRight' && R.i < R.qs.length - 1) { R.i++; renderRun(main); }
    else if (e.key === 'ArrowLeft' && R.i > 0) { R.i--; renderRun(main); }
    else if (q.t === 'mc' && /^[1-4a-dA-D]$/.test(e.key)) { var k = /\d/.test(e.key) ? Number(e.key) - 1 : 'abcd'.indexOf(e.key.toLowerCase()); R.ans[q.id] = k; renderRun(main); }
  });
  async function askSubmit(main) {
    var R = App.S.run, left = R.qs.length - answeredCount(R);
    var ok = await U.confirmBox(left ? 'Em còn ' + left + ' câu chưa làm. Vẫn nộp bài?' : 'Em chắc chắn muốn nộp bài?', 'Nộp bài');
    if (ok) submit(main);
  }
  async function submit(main) {
    var R = App.S.run;
    if (!R || R.result || R.submitting) return;
    R.submitting = true;
    stopTimer();
    var duration = elapsed(R);
    if (R.limit) duration = Math.min(duration, R.limit);
    try {
      if (R.mode === 'exam') {
        var res = await App.store.submitExam(R.examId, R.ans, duration);
        R.result = res;
        if (res.questions) { var map = {}; res.questions.forEach(function (q) { map[q.id] = q; }); R.qs = R.qs.map(function (q) { return map[q.id] || q; }); }
        else R.showAnswers = false;
      } else {
        var g = window.Grade.gradeAll(R.qs, R.ans);
        var row = { kind: 'practice', title: R.title, g: R.g, s: R.s, score: g.score, correct: g.correct, count: g.count, earned: g.earned, total: g.total, duration: duration, detail: g.detail };
        try { row = await App.store.create('results', row); } catch (e) { App.fail(e); }
        R.result = row;
      }
    } catch (e) { R.submitting = false; App.fail(e); startTimer(main); return; }
    R.submitting = false;
    try { if (App.Mistakes && R.result && R.result.detail) App.Mistakes.record(R.qs, R.result.detail); } catch (e) { /* bỏ qua */ }
    renderResult(main);
    window.scrollTo(0, 0);
  }

  /* =============== KẾT QUẢ BÀI LÀM =============== */
  function verdict(s) { return s >= 9 ? 'Xuất sắc!' : s >= 8 ? 'Rất tốt!' : s >= 6.5 ? 'Khá tốt' : s >= 5 ? 'Đạt yêu cầu' : 'Cần ôn tập thêm'; }
  function renderResult(main) {
    var R = App.S.run, r = R.result;
    var det = {}; (r.detail || []).forEach(function (d) { det[d.qid] = d; });
    var wrong = R.qs.filter(function (q) { return det[q.id] && !det[q.id].ok; });
    main.innerHTML = '<div class="page"><section class="result-hero"><div class="score-ring ' + U.scoreClass(r.score) + '"><b>' + U.num(r.score, 2) + '</b><small>/10</small></div>' +
      '<div><p class="eyebrow">' + (R.mode === 'exam' ? 'Đã nộp đề thi' : 'Kết quả luyện tập') + '</p><h1>' + verdict(r.score) + '</h1><p class="muted">' + esc(R.title) + '</p>' +
      '<ul class="facts inline"><li><span>Đúng hoàn toàn</span><b>' + r.correct + '/' + r.count + ' câu</b></li><li><span>Điểm thô</span><b>' + U.num(r.earned, 2) + '/' + U.num(r.total, 2) + '</b></li><li><span>Thời gian</span><b>' + U.dur(r.duration) + '</b></li></ul>' +
      '<div class="hero-actions">' + (R.mode === 'practice' ? '<button class="btn primary" id="btn-again">' + icon('reset') + 'Làm lại đề này</button>' + (wrong.length ? '<button class="btn ghost" id="btn-wrong">Luyện lại ' + wrong.length + ' câu chưa đúng</button>' : '') : '') +
      '<button class="btn ghost" id="btn-done">' + (R.mode === 'exam' ? 'Về danh sách đề thi' : 'Tạo bài mới') + '</button></div></div></section>' +
      (R.showAnswers ? '<section class="card"><h2>Xem lại bài làm</h2>' + reviewList(R.qs, det) + '</section>' : '<div class="callout">Giáo viên chưa mở chế độ xem đáp án cho đề này. Em chỉ xem được điểm.</div>') + '</div>';
    var again = U.$('#btn-again', main);
    if (again) again.onclick = function () { startRun({ mode: 'practice', title: R.title, qs: R.qs, limit: R.limit, g: R.g, s: R.s }); };
    var wb = U.$('#btn-wrong', main);
    if (wb) wb.onclick = function () { startRun({ mode: 'practice', title: 'Luyện lại câu chưa đúng · ' + R.title, qs: wrong, limit: 0, g: R.g, s: R.s }); };
    U.$('#btn-done', main).onclick = function () { var m = R.mode; App.S.run = null; App.go(m === 'exam' ? 'exams' : 'quiz'); };
  }
  function givenText(q, g) {
    if (g === null || g === undefined || g === '') return '<i class="muted">(bỏ trống)</i>';
    if (q.t === 'mc') return LETTERS[g] || '?';
    if (q.t === 'sa') return esc(g);
    return '';
  }
  function reviewList(qs, det) {
    return '<ol class="review">' + qs.map(function (q, i) {
      var d = det[q.id] || { ok: false, given: null, pts: 0 };
      var g = d.given, inner = '';
      if (q.t === 'mc') {
        inner = '<div class="opts review-opts">' + q.o.map(function (o, k) {
          var cls = k === q.a ? 'right' : (g === k ? 'wrong' : '');
          return '<div class="opt ' + cls + '"><span class="opt-l">' + LETTERS[k] + '</span><span>' + fmt(o) + '</span>' + (k === q.a ? '<span class="tag-ok">Đáp án</span>' : g === k ? '<span class="tag-bad">Em chọn</span>' : '') + '</div>';
        }).join('') + '</div>';
      } else if (q.t === 'tf') {
        var arr = Array.isArray(g) ? g : [];
        inner = '<div class="tfs">' + q.o.map(function (o, k) {
          var you = arr[k] === true ? 'Đúng' : arr[k] === false ? 'Sai' : '–';
          var ok = arr[k] === q.a[k];
          return '<div class="tf-row ' + (ok ? 'right' : 'wrong') + '"><span class="tf-l">' + 'abcd'[k] + ')</span><span class="tf-text">' + fmt(o) + '</span><span class="tf-res">Em: <b>' + you + '</b> · Đáp án: <b>' + (q.a[k] ? 'Đúng' : 'Sai') + '</b></span></div>';
        }).join('') + '</div>';
      } else {
        inner = '<p class="sa-res">Em trả lời: <b>' + givenText(q, g) + '</b> · Đáp án: <b>' + esc((q.a || []).join(' hoặc ')) + '</b></p>';
      }
      return '<li class="rv ' + (d.ok ? 'ok' : 'no') + '"><div class="rv-head"><span class="rv-no">Câu ' + (i + 1) + '</span><span class="badge">' + TYPE_SHORT[q.t] + '</span><span class="rv-pts">' + (d.ok ? icon('check') : icon('x')) + U.num(d.pts || 0, 2) + ' điểm</span></div><div class="q-text">' + fmt(q.q) + '</div>' + inner + (q.e ? '<div class="explain"><b>Lời giải:</b> ' + fmt(q.e) + '</div>' : '') + '</li>';
    }).join('') + '</ol>';
  }
  App.reviewList = reviewList;

  App.reviewResult = async function (r) {
    try {
      var qs;
      if (r.kind === 'exam') { var rv = await App.store.examReview(r.id); qs = rv.questions; r = rv.result || r; }
      else { var all = await bank(); var map = {}; all.forEach(function (q) { map[q.id] = q; }); qs = (r.detail || []).map(function (d) { return map[d.qid]; }).filter(Boolean); }
      var det = {}; (r.detail || []).forEach(function (d) { det[d.qid] = d; });
      U.openModal({ title: r.title + ' · ' + U.num(r.score, 2) + ' điểm', wide: true, body: (r.ownerName ? '<p class="muted">Học sinh: <b>' + esc(r.ownerName) + '</b> · ' + esc(U.dt(r.at, true)) + '</p>' : '') + (qs.length ? reviewList(qs, det) : '<div class="empty small">Không còn dữ liệu câu hỏi của bài này.</div>') });
    } catch (e) { App.fail(e); }
  };

  /* =============== ĐỀ THI =============== */
  App.views.exams = async function (main, alive) {
    if (App.S.run && !App.S.run.result) { App.go('quiz'); return; }
    var exams = await App.store.list('exams');
    var results = [];
    try { results = (await App.store.list('results')).filter(function (r) { return r.kind === 'exam' && r.owner === App.user.id; }); } catch (e) { /* bỏ qua */ }
    if (!alive()) return;
    var admin = App.isAdmin(), needLogin = App.isGuest() && !!App.server, myG = Number(App.user.grade) || 0;
    exams.sort(function (a, b) { return ((Number(b.g) === myG) - (Number(a.g) === myG)) || String(b.at).localeCompare(String(a.at)); });
    main.innerHTML = '<div class="page"><header class="page-head"><div><h1>Đề thi</h1><p class="muted">' + (admin ? 'Các đề thi đã tạo. Học sinh chỉ thấy đề đang mở và đúng lớp.' : App.isGuest() ? 'Đề luyện thi có tính giờ, tự nộp khi hết giờ và chấm điểm ngay theo cách tính của đề thi mới.' + (needLogin ? ' Đăng nhập để làm đề giáo viên giao.' : '') : 'Đề thi giáo viên giao cho ' + esc(App.gradeLabel(App.user.grade)) + '. Bài được tính giờ và tự nộp khi hết giờ.') + '</p></div>' +
      (admin ? '<a class="btn primary" href="#admin" id="mk-exam">' + icon('plus') + 'Tạo đề thi</a>' : '') + '</header>' +
      (exams.length ? '<div class="exam-grid">' + exams.map(function (e) {
        var mine = results.filter(function (r) { return r.examId === e.id; });
        var best = mine.reduce(function (a, b) { return Math.max(a, b.score || 0); }, -1);
        var qn = e.qcount !== undefined ? e.qcount : (e.qids || []).length;
        var expired = e.deadline && new Date(e.deadline) < new Date();
        var out = e.maxAttempts && mine.length >= e.maxAttempts;
        var state = e.open === false ? '<span class="pill gray">Đang đóng</span>' : expired ? '<span class="pill gray">Hết hạn</span>' : out ? '<span class="pill gray">Hết lượt</span>' : '<span class="pill green">Đang mở</span>';
        return '<article class="exam" style="--c:' + (App.SUBJ_COLOR[e.s] || 'var(--board)') + '"><div class="exam-top"><span class="badge" style="--c:' + (App.SUBJ_COLOR[e.s] || 'var(--board)') + '">' + esc(App.subjShort(e.s, e.g)) + '</span>' + state + '</div>' +
          '<h3>' + esc(e.title) + '</h3><ul class="facts inline small"><li><span>Lớp</span><b>' + esc(e.g || 'Tất cả') + '</b></li><li><span>Thời gian</span><b>' + e.minutes + ' phút</b></li><li><span>Số câu</span><b>' + qn + '</b></li><li><span>Lượt làm</span><b>' + mine.length + (e.maxAttempts ? '/' + e.maxAttempts : '') + '</b></li></ul>' +
          (e.deadline ? '<p class="muted small">Hạn nộp: ' + esc(U.dt(e.deadline, true)) + '</p>' : '') +
          (best >= 0 ? '<p class="small">Điểm cao nhất của em: <span class="score ' + U.scoreClass(best) + '">' + U.num(best, 2) + '</span></p>' : '') +
          '<div class="exam-act">' + (needLogin ? '<button class="btn ghost" data-login="1">' + icon('user') + 'Đăng nhập để làm bài</button>' : '<button class="btn primary" data-take="' + esc(e.id) + '"' + ((e.open === false || expired || out) && !admin ? ' disabled' : '') + '>' + icon('play') + (admin ? 'Làm thử' : mine.length ? 'Làm lại' : 'Làm bài') + '</button>') + '</div></article>';
      }).join('') + '</div>' : '<div class="empty">' + (admin ? 'Chưa có đề thi. Vào Quản trị → Đề thi để tạo đề.' : 'Hiện chưa có đề thi nào dành cho lớp của em.') + '</div>') + '</div>';
    var mk = U.$('#mk-exam'); if (mk) mk.onclick = function () { App.S.adminTab = 'exams'; };
    U.$$('[data-login]', main).forEach(function (b) { b.onclick = function () { App.showAuth('login'); }; });
    U.$$('[data-take]', main).forEach(function (b) {
      b.onclick = async function () {
        var e = exams.find(function (x) { return x.id === b.getAttribute('data-take'); });
        var ok = await U.confirmBox('Bắt đầu làm "' + e.title + '" trong ' + e.minutes + ' phút? Đồng hồ sẽ chạy ngay khi bắt đầu.', 'Bắt đầu');
        if (!ok) return;
        try {
          var p = await App.store.examPaper(e.id);
          if (!p.questions.length) throw new Error('Đề thi chưa có câu hỏi.');
          startRun({ mode: 'exam', examId: e.id, title: e.title, qs: p.questions, limit: (Number(e.minutes) || 0) * 60, g: e.g, s: e.s, showAnswers: !!e.showAnswers });
        } catch (er) { App.fail(er); }
      };
    });
  };
})();
