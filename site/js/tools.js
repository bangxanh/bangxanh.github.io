/* Tiện ích học tập */
(function () {
  'use strict';
  var U = window.UI, App = window.App, esc = U.esc, fmt = U.fmt, icon = U.icon;

  var TOOLS = [
    { id: 'vocab', name: 'Thẻ từ vựng Tiếng Anh', desc: 'Lật thẻ, nghe phát âm, kiểm tra nhanh', icon: 'cards' },
    { id: 'drill', name: 'Luyện tính nhẩm', desc: '20 phép tính theo mức lớp', icon: 'bolt' },
    { id: 'calc', name: 'Máy tính khoa học', desc: 'sin, cos, log, căn, lũy thừa', icon: 'calc' },
    { id: 'ptable', name: 'Bảng tuần hoàn rút gọn', desc: 'Kí hiệu, tên, nguyên tử khối', icon: 'atom' },
    { id: 'units', name: 'Đổi đơn vị đo', desc: 'Độ dài, khối lượng, diện tích, thể tích…', icon: 'ruler' },
    { id: 'pomo', name: 'Đồng hồ học tập', desc: 'Học 25 phút, nghỉ 5 phút', icon: 'hourglass' },
    { id: 'notes', name: 'Sổ ghi chú', desc: 'Ghi lại công thức, ý chính', icon: 'note' },
    { id: 'todos', name: 'Việc cần làm', desc: 'Kế hoạch học tập có hạn chót', icon: 'list' },
    { id: 'countdown', name: 'Đếm ngược kì thi', desc: 'Còn bao nhiêu ngày đến kì thi', icon: 'clock' }
  ];

  App.views.tools = async function (main, alive) {
    var cur = App.S.tool;
    var t = TOOLS.find(function (x) { return x.id === cur; });
    main.innerHTML = '<div class="page"><header class="page-head"><div><h1>Tiện ích</h1><p class="muted">Công cụ hỗ trợ tự học hằng ngày.</p></div></header>' +
      '<div class="tool-grid">' + TOOLS.map(function (x) { return '<button class="tool ' + (x.id === cur ? 'on' : '') + '" data-tool="' + x.id + '">' + icon(x.icon) + '<span><b>' + esc(x.name) + '</b><small>' + esc(x.desc) + '</small></span></button>'; }).join('') + '</div>' +
      '<section class="card tool-panel" id="tool-panel">' + (t ? '' : '<div class="empty">Chọn một tiện ích ở trên để bắt đầu.</div>') + '</section></div>';
    U.$$('[data-tool]', main).forEach(function (b) { b.onclick = function () { App.S.tool = b.getAttribute('data-tool'); App.rerender(); }; });
    if (t) {
      var panel = U.$('#tool-panel');
      panel.innerHTML = '<h2>' + icon(t.icon) + esc(t.name) + '</h2><div id="tool-body"></div>';
      await RENDER[t.id](U.$('#tool-body'), alive);
    }
  };

  /* ---------- Thẻ từ vựng ---------- */
  var VS = { g: null, i: 0, flip: false, mode: 'cards', quiz: null };
  function speak(text) {
    try {
      if (!window.speechSynthesis) throw new Error('x');
      var u = new SpeechSynthesisUtterance(text); u.lang = 'en-US'; u.rate = 0.9;
      window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
    } catch (e) { U.toast('Trình duyệt này không hỗ trợ đọc phát âm.', 'warn'); }
  }
  async function renderVocab(el) {
    if (!VS.g) VS.g = Math.max(1, App.user.grade || 6);
    var words = (App.D.vocab[String(VS.g)] || []);
    var known = function (w) { return !!App.progress['v:' + w]; };
    var nKnown = words.filter(function (w) { return known(w[0]); }).length;
    var head = '<div class="filters"><select class="input" id="vc-g" aria-label="Lớp">' + Object.keys(App.D.vocab).map(function (g) { return '<option value="' + g + '"' + (Number(g) === VS.g ? ' selected' : '') + '>Từ vựng lớp ' + g + '</option>'; }).join('') + '</select>' +
      '<div class="seg"><button class="seg-btn ' + (VS.mode === 'cards' ? 'on' : '') + '" data-m="cards">Thẻ ghi nhớ</button><button class="seg-btn ' + (VS.mode === 'quiz' ? 'on' : '') + '" data-m="quiz">Kiểm tra nhanh</button><button class="seg-btn ' + (VS.mode === 'list' ? 'on' : '') + '" data-m="list">Danh sách</button></div>' +
      '<span class="muted">Đã thuộc ' + nKnown + '/' + words.length + ' từ</span></div>';
    var body = '';
    if (!words.length) body = '<div class="empty">Chưa có từ vựng.</div>';
    else if (VS.mode === 'cards') {
      if (VS.i >= words.length) VS.i = 0;
      var w = words[VS.i];
      body = '<div class="flash-wrap"><button class="flashcard ' + (VS.flip ? 'flip' : '') + '" id="vc-card" aria-label="Lật thẻ"><span class="fc-face front"><small>Từ ' + (VS.i + 1) + '/' + words.length + (known(w[0]) ? ' · đã thuộc' : '') + '</small><b>' + esc(w[0]) + '</b><em>Nhấn để xem nghĩa</em></span><span class="fc-face back"><small>Nghĩa</small><b>' + esc(w[1]) + '</b><em>' + esc(w[0]) + '</em></span></button>' +
        '<div class="row-btns"><button class="btn ghost" id="vc-prev">' + icon('left') + 'Trước</button><button class="btn ghost" id="vc-say">Nghe phát âm</button><button class="btn ghost" id="vc-no">Chưa thuộc</button><button class="btn primary" id="vc-yes">' + icon('check') + 'Đã thuộc</button><button class="btn ghost" id="vc-next">Sau' + icon('right') + '</button></div></div>';
    } else if (VS.mode === 'list') {
      body = '<div class="table-wrap"><table class="table"><thead><tr><th>Tiếng Anh</th><th>Nghĩa</th><th>Trạng thái</th><th></th></tr></thead><tbody>' + words.map(function (w, i) { return '<tr><td><b>' + esc(w[0]) + '</b></td><td>' + esc(w[1]) + '</td><td>' + (known(w[0]) ? '<span class="pill green">Đã thuộc</span>' : '<span class="pill gray">Chưa thuộc</span>') + '</td><td><button class="linkish" data-say="' + i + '">Nghe</button></td></tr>'; }).join('') + '</tbody></table></div>';
    } else {
      if (!VS.quiz || VS.quiz.g !== VS.g) {
        var pool = U.shuffle(words).slice(0, Math.min(10, words.length));
        var allW = [].concat.apply([], Object.keys(App.D.vocab).map(function (g) { return App.D.vocab[g]; }));
        VS.quiz = { g: VS.g, i: 0, ok: 0, t0: Date.now(), done: false, items: pool.map(function (w) {
          var wrong = U.shuffle(allW.filter(function (x) { return x[1] !== w[1]; })).slice(0, 3).map(function (x) { return x[1]; });
          var opts = U.shuffle(wrong.concat([w[1]]));
          return { w: w, opts: opts, a: opts.indexOf(w[1]), pick: null };
        }) };
      }
      var Q = VS.quiz;
      if (Q.done) {
        var sc = Math.round(Q.ok / Q.items.length * 1000) / 100;
        body = '<div class="drill-end"><div class="score-ring ' + U.scoreClass(sc) + '"><b>' + U.num(sc, 1) + '</b><small>/10</small></div><p>Em trả lời đúng <b>' + Q.ok + '/' + Q.items.length + '</b> từ.</p><button class="btn primary" id="vq-again">Làm bài mới</button></div>';
      } else {
        var it = Q.items[Q.i];
        body = '<div class="vq"><p class="eyebrow">Câu ' + (Q.i + 1) + '/' + Q.items.length + ' · Chọn nghĩa đúng</p><h3 class="vq-word">' + esc(it.w[0]) + ' <button class="linkish" id="vq-say">Nghe</button></h3><div class="opts">' +
          it.opts.map(function (o, k) { var cls = it.pick === null ? '' : k === it.a ? 'right' : k === it.pick ? 'wrong' : ''; return '<button class="opt ' + cls + '" data-vq="' + k + '"' + (it.pick !== null ? ' disabled' : '') + '><span class="opt-l">' + 'ABCD'[k] + '</span><span>' + esc(o) + '</span></button>'; }).join('') + '</div>' +
          (it.pick !== null ? '<button class="btn primary" id="vq-next">' + (Q.i < Q.items.length - 1 ? 'Câu tiếp' : 'Xem kết quả') + '</button>' : '') + '</div>';
      }
    }
    el.innerHTML = head + body;
    U.$('#vc-g', el).onchange = function () { VS.g = Number(this.value); VS.i = 0; VS.flip = false; VS.quiz = null; renderVocab(el); };
    U.$$('[data-m]', el).forEach(function (b) { b.onclick = function () { VS.mode = b.getAttribute('data-m'); VS.quiz = null; renderVocab(el); }; });
    var card = U.$('#vc-card', el);
    if (card) {
      var w2 = words[VS.i];
      card.onclick = function () { VS.flip = !VS.flip; card.classList.toggle('flip', VS.flip); };
      U.$('#vc-prev', el).onclick = function () { VS.i = (VS.i - 1 + words.length) % words.length; VS.flip = false; renderVocab(el); };
      U.$('#vc-next', el).onclick = function () { VS.i = (VS.i + 1) % words.length; VS.flip = false; renderVocab(el); };
      U.$('#vc-say', el).onclick = function () { speak(w2[0]); };
      U.$('#vc-yes', el).onclick = async function () { await setKnown(w2[0], true); VS.i = (VS.i + 1) % words.length; VS.flip = false; renderVocab(el); };
      U.$('#vc-no', el).onclick = async function () { await setKnown(w2[0], false); VS.i = (VS.i + 1) % words.length; VS.flip = false; renderVocab(el); };
    }
    U.$$('[data-say]', el).forEach(function (b) { b.onclick = function () { speak(words[Number(b.getAttribute('data-say'))][0]); }; });
    U.$$('[data-vq]', el).forEach(function (b) {
      b.onclick = function () { var Q = VS.quiz, it = Q.items[Q.i]; it.pick = Number(b.getAttribute('data-vq')); if (it.pick === it.a) { Q.ok++; setKnown(it.w[0], true); } renderVocab(el); };
    });
    var vs = U.$('#vq-say', el); if (vs) vs.onclick = function () { speak(VS.quiz.items[VS.quiz.i].w[0]); };
    var vn = U.$('#vq-next', el);
    if (vn) vn.onclick = async function () {
      var Q = VS.quiz;
      if (Q.i < Q.items.length - 1) { Q.i++; renderVocab(el); return; }
      Q.done = true;
      var sc = Math.round(Q.ok / Q.items.length * 1000) / 100;
      try { await App.store.create('results', { kind: 'vocab', title: 'Từ vựng Tiếng Anh lớp ' + VS.g, g: VS.g, s: 'anh', score: sc, correct: Q.ok, count: Q.items.length, duration: Math.round((Date.now() - Q.t0) / 1000) }); } catch (e) { App.fail(e); }
      renderVocab(el);
    };
    var va = U.$('#vq-again', el); if (va) va.onclick = function () { VS.quiz = null; renderVocab(el); };
  }
  async function setKnown(word, yes) {
    var key = 'v:' + word;
    try {
      if (yes && !App.progress[key]) { var r = await App.store.create('progress', { key: key }); App.progress[key] = r.id; }
      if (!yes && App.progress[key]) { await App.store.remove('progress', App.progress[key]); delete App.progress[key]; }
    } catch (e) { App.fail(e); }
  }

  /* ---------- Luyện tính nhẩm ---------- */
  var LEVEL_NAMES = ['Lớp 1: cộng, trừ trong phạm vi 10', 'Lớp 2: phạm vi 20 · bảng nhân 2, 5', 'Lớp 3: bảng nhân, chia 2 – 9', 'Lớp 4: số có hai, ba chữ số', 'Lớp 5: số thập phân, tỉ số phần trăm', 'THCS: số nguyên, lũy thừa, căn bậc hai'];
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function genDrill(lv) {
    var a, b, k;
    switch (lv) {
      case 1: a = rnd(0, 10); b = rnd(0, 10); if (Math.random() < 0.5 && a + b <= 10) return [a + ' + ' + b, a + b]; a = Math.max(a, b); b = Math.min(a, rnd(0, 10)); return [a + ' − ' + b, a - b];
      case 2: k = rnd(0, 2); if (k === 0) { a = rnd(2, 9); b = rnd(2, 11); return [a + ' + ' + b, a + b]; } if (k === 1) { a = rnd(11, 20); b = rnd(2, 9); return [a + ' − ' + b, a - b]; } a = [2, 5][rnd(0, 1)]; b = rnd(1, 10); return [a + ' × ' + b, a * b];
      case 3: a = rnd(2, 9); b = rnd(1, 10); return Math.random() < 0.5 ? [a + ' × ' + b, a * b] : [(a * b) + ' : ' + a, b];
      case 4: k = rnd(0, 3); if (k === 0) { a = rnd(12, 99); b = rnd(12, 99); return [a + ' + ' + b, a + b]; } if (k === 1) { a = rnd(100, 999); b = rnd(10, 99); return [a + ' − ' + b, a - b]; } if (k === 2) { a = rnd(11, 99); b = rnd(2, 9); return [a + ' × ' + b, a * b]; } b = rnd(2, 9); a = b * rnd(11, 99); return [a + ' : ' + b, a / b];
      case 5: k = rnd(0, 3);
        if (k === 0) { a = rnd(10, 99) / 10; b = rnd(10, 99) / 10; return [vn(a) + ' + ' + vn(b), Math.round((a + b) * 10) / 10]; }
        if (k === 1) { a = rnd(11, 999) / 100; b = [10, 100, 1000][rnd(0, 2)]; return [vn(a) + ' × ' + b, Math.round(a * b * 1000) / 1000]; }
        if (k === 2) { a = [10, 20, 25, 50, 75][rnd(0, 4)]; b = rnd(1, 20) * 4; return [a + '% của ' + b, a * b / 100]; }
        a = rnd(1, 9) / 10; b = rnd(2, 9); return [vn(a) + ' × ' + b, Math.round(a * b * 10) / 10];
      default: k = rnd(0, 3);
        if (k === 0) { a = rnd(-20, 20); b = rnd(-20, 20); return ['(' + a + ') + (' + b + ')', a + b]; }
        if (k === 1) { a = rnd(-12, 12); b = rnd(-9, 9); return ['(' + a + ') × (' + b + ')', a * b]; }
        if (k === 2) { a = rnd(2, 15); return [a + '²', a * a]; }
        a = rnd(2, 20); return ['√' + (a * a), a];
    }
  }
  function vn(x) { return String(x).replace('.', ','); }
  var DR = null;
  function renderDrill(el) {
    if (!DR || DR.done === 'setup') {
      var lv0 = App.user.grade ? Math.min(6, Math.max(1, App.user.grade)) : 1;
      el.innerHTML = '<p class="muted">Mỗi lượt 20 phép tính. Gõ đáp án rồi nhấn Enter. Số thập phân dùng dấu phẩy.</p><div class="lv-pick">' + LEVEL_NAMES.map(function (n, i) { return '<button class="chip ' + (i + 1 === lv0 ? 'on' : '') + '" data-lv="' + (i + 1) + '">' + esc(n) + '</button>'; }).join('') + '</div><button class="btn primary lg" id="dr-go">' + icon('play') + 'Bắt đầu</button>';
      var lv = lv0;
      U.$$('[data-lv]', el).forEach(function (b) { b.onclick = function () { lv = Number(b.getAttribute('data-lv')); U.$$('[data-lv]', el).forEach(function (x) { x.classList.toggle('on', x === b); }); }; });
      U.$('#dr-go', el).onclick = function () { DR = { lv: lv, i: 0, ok: 0, t0: Date.now(), items: [], done: false, last: null }; for (var j = 0; j < 20; j++) DR.items.push(genDrill(lv)); renderDrill(el); };
      return;
    }
    if (DR.done) {
      var sc = Math.round(DR.ok / 20 * 1000) / 100;
      el.innerHTML = '<div class="drill-end"><div class="score-ring ' + U.scoreClass(sc) + '"><b>' + U.num(sc, 1) + '</b><small>/10</small></div><p>Đúng <b>' + DR.ok + '/20</b> phép tính trong <b>' + U.dur((DR.t1 - DR.t0) / 1000) + '</b>.</p>' +
        '<div class="drill-list">' + DR.items.map(function (it) { return '<span class="' + (it.ok ? 'ok' : 'no') + '">' + esc(it[0]) + ' = ' + esc(vn(it[1])) + (it.ok ? '' : ' (em: ' + esc(it.given || '–') + ')') + '</span>'; }).join('') + '</div>' +
        '<div class="row-btns"><button class="btn primary" id="dr-again">Làm lượt mới</button><button class="btn ghost" id="dr-lv">Đổi mức</button></div></div>';
      U.$('#dr-again', el).onclick = function () { var lv = DR.lv; DR = { lv: lv, i: 0, ok: 0, t0: Date.now(), items: [], done: false }; for (var j = 0; j < 20; j++) DR.items.push(genDrill(lv)); renderDrill(el); };
      U.$('#dr-lv', el).onclick = function () { DR = null; renderDrill(el); };
      return;
    }
    var it = DR.items[DR.i];
    el.innerHTML = '<div class="drill"><p class="eyebrow">' + esc(LEVEL_NAMES[DR.lv - 1]) + ' · Phép tính ' + (DR.i + 1) + '/20 · Đúng ' + DR.ok + '</p><div class="drill-q">' + esc(it[0]) + ' = <input class="input drill-in" id="dr-in" inputmode="decimal" autocomplete="off" aria-label="Đáp án"></div>' +
      '<p class="drill-fb ' + (DR.last ? DR.last.cls : '') + '">' + (DR.last ? esc(DR.last.msg) : '&nbsp;') + '</p><div class="bar"><i style="width:' + (DR.i / 20 * 100) + '%"></i></div></div>';
    var inp = U.$('#dr-in', el);
    inp.focus();
    inp.onkeydown = function (e) {
      if (e.key !== 'Enter' || inp.value.trim() === '') return;
      var v = window.Grade.toNumber(inp.value);
      var ok = !isNaN(v) && Math.abs(v - it[1]) < 1e-9;
      it.ok = ok; it.given = inp.value;
      if (ok) DR.ok++;
      DR.last = ok ? { cls: 'ok', msg: 'Đúng rồi!' } : { cls: 'no', msg: 'Chưa đúng: ' + it[0] + ' = ' + vn(it[1]) };
      DR.i++;
      if (DR.i >= 20) {
        DR.done = true; DR.t1 = Date.now();
        App.store.create('results', { kind: 'drill', title: 'Tính nhẩm – ' + LEVEL_NAMES[DR.lv - 1].split(':')[0], g: DR.lv <= 5 ? DR.lv : (App.user.grade || 6), s: 'toan', score: Math.round(DR.ok / 20 * 1000) / 100, correct: DR.ok, count: 20, duration: Math.round((DR.t1 - DR.t0) / 1000) }).catch(App.fail);
      }
      renderDrill(el);
    };
  }

  /* ---------- Máy tính khoa học ---------- */
  var CALC = { deg: true, hist: [], expr: '' };
  function evaluate(src, deg) {
    var s = String(src).replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/(\d),(\d)/g, '$1.$2').replace(/\s+/g, '');
    var i = 0;
    function peek() { return s[i]; }
    function eat(c) { if (s[i] === c) { i++; return true; } return false; }
    var FN = {
      sin: function (x) { return Math.sin(deg ? x * Math.PI / 180 : x); }, cos: function (x) { return Math.cos(deg ? x * Math.PI / 180 : x); },
      tan: function (x) { return Math.tan(deg ? x * Math.PI / 180 : x); }, asin: function (x) { var r = Math.asin(x); return deg ? r * 180 / Math.PI : r; },
      acos: function (x) { var r = Math.acos(x); return deg ? r * 180 / Math.PI : r; }, atan: function (x) { var r = Math.atan(x); return deg ? r * 180 / Math.PI : r; },
      sqrt: Math.sqrt, cbrt: Math.cbrt, ln: Math.log, log: function (x) { return Math.log10(x); }, abs: Math.abs, exp: Math.exp
    };
    function expr() { var v = term(); for (;;) { if (eat('+')) v += term(); else if (eat('-')) v -= term(); else return v; } }
    function term() {
      var v = unary();
      for (;;) {
        if (eat('*')) v *= unary(); else if (eat('/')) v /= unary();
        else if (peek() && /[0-9a-z.(]/i.test(peek())) v *= power();
        else return v;
      }
    }
    function unary() { if (eat('-')) return -unary(); if (eat('+')) return unary(); return power(); }
    function power() { var b = postfix(); if (eat('^')) return Math.pow(b, unary()); return b; }
    function postfix() { var v = primary(); while (eat('!')) { if (v < 0 || v !== Math.floor(v) || v > 170) throw new Error('Giai thừa chỉ dùng cho số tự nhiên nhỏ'); var f = 1; for (var k = 2; k <= v; k++) f *= k; v = f; } if (eat('%')) v = v / 100; return v; }
    function primary() {
      if (eat('(')) { var v = expr(); if (!eat(')')) throw new Error('Thiếu dấu ")"'); return v; }
      var m = s.slice(i).match(/^(\d+\.?\d*(e[+-]?\d+)?|\.\d+)/i);
      if (m) { i += m[0].length; return parseFloat(m[0]); }
      var w = s.slice(i).match(/^[a-z]+/i);
      if (w) {
        var name = w[0].toLowerCase(); i += w[0].length;
        if (name === 'pi') return Math.PI;
        if (name === 'e') return Math.E;
        if (FN[name]) { var arg = (peek() === '(') ? primary() : power(); return FN[name](arg); }
        throw new Error('Không hiểu "' + name + '"');
      }
      throw new Error('Biểu thức chưa đúng');
    }
    var out = expr();
    if (i < s.length) throw new Error('Biểu thức chưa đúng gần "' + s.slice(i) + '"');
    return out;
  }
  App.calcEval = evaluate;
  function showNum(x) {
    if (!isFinite(x)) return isNaN(x) ? 'Không xác định' : (x > 0 ? '∞' : '−∞');
    var r = Math.abs(x) >= 1e12 || (Math.abs(x) < 1e-6 && x !== 0) ? x.toExponential(8) : String(parseFloat(x.toPrecision(12)));
    return r.replace('.', ',').replace('-', '−');
  }
  function renderCalc(el) {
    var keys = ['sin(', 'cos(', 'tan(', 'π', '(', ')', 'asin(', 'acos(', 'atan(', 'e', '^', '√(', 'ln(', 'log(', 'x²', '!', '%', 'C', '7', '8', '9', '÷', '⌫', 'Ans', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '=', '+'];
    el.innerHTML = '<div class="calc"><div class="calc-screen"><input class="input calc-in" id="cl-in" value="' + esc(CALC.expr) + '" placeholder="Nhập biểu thức, ví dụ: sin(30) + √(16) × 2^3" aria-label="Biểu thức" autocomplete="off"><div class="calc-out" id="cl-out" aria-live="polite">' + (CALC.hist[0] ? '= ' + esc(CALC.hist[0].r) : '&nbsp;') + '</div></div>' +
      '<div class="calc-bar"><div class="seg"><button class="seg-btn ' + (CALC.deg ? 'on' : '') + '" data-ang="1">Độ (DEG)</button><button class="seg-btn ' + (!CALC.deg ? 'on' : '') + '" data-ang="0">Radian</button></div></div>' +
      '<div class="calc-keys">' + keys.map(function (k) { return '<button class="ck ' + (/^[0-9,]$/.test(k) ? 'd' : k === '=' ? 'eq' : k === 'C' || k === '⌫' ? 'cl' : '') + '" data-k="' + esc(k) + '">' + esc(k) + '</button>'; }).join('') + '</div>' +
      '<div class="calc-hist">' + (CALC.hist.length ? CALC.hist.slice(0, 8).map(function (h) { return '<button class="linkish" data-h="' + esc(h.e) + '">' + esc(h.e) + ' = <b>' + esc(h.r) + '</b></button>'; }).join('') : '<span class="muted small">Lịch sử phép tính sẽ hiện ở đây.</span>') + '</div></div>';
    var inp = U.$('#cl-in', el), out = U.$('#cl-out', el);
    function run() {
      var e = inp.value.trim(); if (!e) return;
      try { var v = evaluate(e.replace(/Ans/g, '(' + (CALC.ans || 0) + ')'), CALC.deg); CALC.ans = v; var r = showNum(v); CALC.hist.unshift({ e: e, r: r }); CALC.expr = e; out.textContent = '= ' + r; renderCalc(el); }
      catch (er) { out.textContent = er.message; out.classList.add('bad'); }
    }
    inp.oninput = function () { CALC.expr = inp.value; out.classList.remove('bad'); };
    inp.onkeydown = function (e) { if (e.key === 'Enter') run(); };
    U.$$('[data-ang]', el).forEach(function (b) { b.onclick = function () { CALC.deg = b.getAttribute('data-ang') === '1'; renderCalc(el); }; });
    U.$$('[data-k]', el).forEach(function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-k');
        if (k === '=') return run();
        if (k === 'C') inp.value = '';
        else if (k === '⌫') inp.value = inp.value.slice(0, -1);
        else if (k === 'x²') inp.value += '^2';
        else inp.value += k;
        CALC.expr = inp.value; inp.focus();
      };
    });
    U.$$('[data-h]', el).forEach(function (b) { b.onclick = function () { inp.value = b.getAttribute('data-h'); CALC.expr = inp.value; inp.focus(); }; });
  }

  /* ---------- Bảng tuần hoàn ---------- */
  var EL = [
    [1, 'H', 'Hydrogen', 1, 1, 1, 'pk'], [2, 'He', 'Helium', 4, 1, 18, 'kh'],
    [3, 'Li', 'Lithium', 7, 2, 1, 'kl'], [4, 'Be', 'Beryllium', 9, 2, 2, 'kl'], [5, 'B', 'Boron', 11, 2, 13, 'ak'], [6, 'C', 'Carbon', 12, 2, 14, 'pk'], [7, 'N', 'Nitrogen', 14, 2, 15, 'pk'], [8, 'O', 'Oxygen', 16, 2, 16, 'pk'], [9, 'F', 'Fluorine', 19, 2, 17, 'pk'], [10, 'Ne', 'Neon', 20, 2, 18, 'kh'],
    [11, 'Na', 'Sodium (natri)', 23, 3, 1, 'kl'], [12, 'Mg', 'Magnesium', 24, 3, 2, 'kl'], [13, 'Al', 'Aluminium (nhôm)', 27, 3, 13, 'kl'], [14, 'Si', 'Silicon', 28, 3, 14, 'ak'], [15, 'P', 'Phosphorus', 31, 3, 15, 'pk'], [16, 'S', 'Sulfur', 32, 3, 16, 'pk'], [17, 'Cl', 'Chlorine', 35.5, 3, 17, 'pk'], [18, 'Ar', 'Argon', 40, 3, 18, 'kh'],
    [19, 'K', 'Potassium (kali)', 39, 4, 1, 'kl'], [20, 'Ca', 'Calcium', 40, 4, 2, 'kl'], [21, 'Sc', 'Scandium', 45, 4, 3, 'kl'], [22, 'Ti', 'Titanium', 48, 4, 4, 'kl'], [23, 'V', 'Vanadium', 51, 4, 5, 'kl'], [24, 'Cr', 'Chromium', 52, 4, 6, 'kl'], [25, 'Mn', 'Manganese', 55, 4, 7, 'kl'], [26, 'Fe', 'Iron (sắt)', 56, 4, 8, 'kl'], [27, 'Co', 'Cobalt', 59, 4, 9, 'kl'], [28, 'Ni', 'Nickel', 59, 4, 10, 'kl'], [29, 'Cu', 'Copper (đồng)', 64, 4, 11, 'kl'], [30, 'Zn', 'Zinc (kẽm)', 65, 4, 12, 'kl'], [31, 'Ga', 'Gallium', 70, 4, 13, 'kl'], [32, 'Ge', 'Germanium', 73, 4, 14, 'ak'], [33, 'As', 'Arsenic', 75, 4, 15, 'ak'], [34, 'Se', 'Selenium', 79, 4, 16, 'pk'], [35, 'Br', 'Bromine', 80, 4, 17, 'pk'], [36, 'Kr', 'Krypton', 84, 4, 18, 'kh'],
    [47, 'Ag', 'Silver (bạc)', 108, 5, 11, 'kl'], [50, 'Sn', 'Tin (thiếc)', 119, 5, 14, 'kl'], [53, 'I', 'Iodine', 127, 5, 17, 'pk'], [56, 'Ba', 'Barium', 137, 6, 2, 'kl'], [79, 'Au', 'Gold (vàng)', 197, 6, 11, 'kl'], [80, 'Hg', 'Mercury (thủy ngân)', 201, 6, 12, 'kl'], [82, 'Pb', 'Lead (chì)', 207, 6, 14, 'kl']
  ];
  var CAT = { kl: 'Kim loại', pk: 'Phi kim', ak: 'Á kim', kh: 'Khí hiếm' };
  function renderPtable(el) {
    var cells = '';
    for (var p = 1; p <= 6; p++) for (var g = 1; g <= 18; g++) {
      var e = EL.find(function (x) { return x[4] === p && x[5] === g; });
      if (p === 1 && g > 1 && g < 18) { cells += '<span class="pt-gap"></span>'; continue; }
      if ((p === 2 || p === 3) && g > 2 && g < 13) { cells += '<span class="pt-gap"></span>'; continue; }
      cells += e ? '<button class="pt-el ' + e[6] + '" data-z="' + e[0] + '" title="' + esc(e[2]) + '"><small>' + e[0] + '</small><b>' + e[1] + '</b><em>' + String(e[3]).replace('.', ',') + '</em></button>' : '<span class="pt-el empty"></span>';
    }
    el.innerHTML = '<p class="muted">Gồm các nguyên tố chu kì 1 – 4 và một số nguyên tố thường gặp. Tên gọi theo danh pháp IUPAC dùng trong chương trình mới. Nhấn vào ô để xem chi tiết.</p>' +
      '<div class="pt-legend">' + Object.keys(CAT).map(function (k) { return '<span><i class="pt-sw ' + k + '"></i>' + CAT[k] + '</span>'; }).join('') + '</div>' +
      '<div class="table-wrap"><div class="ptable">' + cells + '</div></div><div id="pt-info" class="callout">Chọn một nguyên tố.</div>';
    U.$$('[data-z]', el).forEach(function (b) {
      b.onclick = function () {
        var e = EL.find(function (x) { return x[0] === Number(b.getAttribute('data-z')); });
        U.$('#pt-info', el).innerHTML = '<b class="pt-big">' + e[1] + '</b> <b>' + esc(e[2]) + '</b> · Số hiệu nguyên tử Z = ' + e[0] + ' · Nguyên tử khối ≈ ' + String(e[3]).replace('.', ',') + ' · Chu kì ' + e[4] + ', nhóm ' + groupName(e[5]) + ' · ' + CAT[e[6]];
      };
    });
  }
  function groupName(g) { var A = { 1: 'IA', 2: 'IIA', 13: 'IIIA', 14: 'IVA', 15: 'VA', 16: 'VIA', 17: 'VIIA', 18: 'VIIIA' }; var B = { 3: 'IIIB', 4: 'IVB', 5: 'VB', 6: 'VIB', 7: 'VIIB', 8: 'VIIIB', 9: 'VIIIB', 10: 'VIIIB', 11: 'IB', 12: 'IIB' }; return A[g] || B[g] || g; }

  /* ---------- Đổi đơn vị ---------- */
  var UNITS = {
    'Độ dài': [['km', 1000], ['hm', 100], ['dam', 10], ['m', 1], ['dm', 0.1], ['cm', 0.01], ['mm', 0.001]],
    'Khối lượng': [['tấn', 1000], ['tạ', 100], ['yến', 10], ['kg', 1], ['hg', 0.1], ['dag', 0.01], ['g', 0.001], ['mg', 0.000001]],
    'Diện tích': [['km²', 1e6], ['ha', 1e4], ['m²', 1], ['dm²', 0.01], ['cm²', 1e-4], ['mm²', 1e-6]],
    'Thể tích': [['m³', 1], ['dm³', 0.001], ['lít', 0.001], ['cm³', 1e-6], ['ml', 1e-6]],
    'Thời gian': [['thế kỉ', 3153600000], ['năm (365 ngày)', 31536000], ['tuần', 604800], ['ngày', 86400], ['giờ', 3600], ['phút', 60], ['giây', 1]],
    'Tốc độ': [['km/h', 1 / 3.6], ['m/s', 1], ['m/phút', 1 / 60]],
    'Nhiệt độ': [['°C', 0], ['K', 0], ['°F', 0]]
  };
  var UV = { cat: 'Độ dài', from: 0, to: 5, v: '1' };
  function renderUnits(el) {
    var list = UNITS[UV.cat];
    if (UV.from >= list.length) UV.from = 0;
    if (UV.to >= list.length) UV.to = Math.min(1, list.length - 1);
    var v = window.Grade.toNumber(UV.v), out = '';
    if (!isNaN(v)) {
      var r;
      if (UV.cat === 'Nhiệt độ') {
        var c = UV.from === 0 ? v : UV.from === 1 ? v - 273.15 : (v - 32) * 5 / 9;
        r = UV.to === 0 ? c : UV.to === 1 ? c + 273.15 : c * 9 / 5 + 32;
      } else r = v * list[UV.from][1] / list[UV.to][1];
      out = U.esc(UV.v) + ' ' + list[UV.from][0] + ' = <b>' + showNum(r) + '</b> ' + list[UV.to][0];
    }
    el.innerHTML = '<div class="chips">' + Object.keys(UNITS).map(function (k) { return '<button class="chip ' + (k === UV.cat ? 'on' : '') + '" data-cat="' + k + '">' + k + '</button>'; }).join('') + '</div>' +
      '<div class="units-row"><input class="input lg" id="uv-v" value="' + esc(UV.v) + '" inputmode="decimal" aria-label="Giá trị"><select class="input" id="uv-f" aria-label="Từ đơn vị">' + list.map(function (u, i) { return '<option value="' + i + '"' + (i === UV.from ? ' selected' : '') + '>' + u[0] + '</option>'; }).join('') + '</select><span>→</span><select class="input" id="uv-t" aria-label="Sang đơn vị">' + list.map(function (u, i) { return '<option value="' + i + '"' + (i === UV.to ? ' selected' : '') + '>' + u[0] + '</option>'; }).join('') + '</select></div>' +
      '<div class="units-out">' + (out || 'Nhập một số hợp lệ.') + '</div>' +
      (UV.cat === 'Độ dài' || UV.cat === 'Khối lượng' ? '<p class="muted small">Mỗi đơn vị liền nhau gấp (kém) nhau 10 lần.</p>' : UV.cat === 'Diện tích' ? '<p class="muted small">Mỗi đơn vị diện tích liền nhau gấp (kém) nhau 100 lần · 1 ha = 10 000 m².</p>' : UV.cat === 'Thể tích' ? '<p class="muted small">1 dm³ = 1 lít · mỗi đơn vị thể tích liền nhau gấp (kém) nhau 1000 lần.</p>' : '');
    U.$$('[data-cat]', el).forEach(function (b) { b.onclick = function () { UV.cat = b.getAttribute('data-cat'); UV.from = 0; UV.to = 1; renderUnits(el); }; });
    var vi = U.$('#uv-v', el);
    vi.oninput = function () { UV.v = vi.value; var pos = vi.selectionStart; renderUnits(el); var n = U.$('#uv-v', el); n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { /* bỏ qua */ } };
    U.$('#uv-f', el).onchange = function () { UV.from = Number(this.value); renderUnits(el); };
    U.$('#uv-t', el).onchange = function () { UV.to = Number(this.value); renderUnits(el); };
  }

  /* ---------- Đồng hồ học tập ---------- */
  var PM = { work: 25, rest: 5, phase: 'work', left: 25 * 60, run: false, tid: null, done: 0 };
  function beep() {
    try { var C = window.AudioContext || window.webkitAudioContext; var ctx = new C(); var o = ctx.createOscillator(); var g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.2, ctx.currentTime); o.start(); o.stop(ctx.currentTime + 0.5); } catch (e) { /* bỏ qua */ }
  }
  function renderPomo(el) {
    var total = (PM.phase === 'work' ? PM.work : PM.rest) * 60;
    var pct = 1 - PM.left / total;
    el.innerHTML = '<div class="pomo"><div class="pomo-ring" style="--p:' + pct.toFixed(3) + '"><div><small>' + (PM.phase === 'work' ? 'Tập trung học' : 'Nghỉ ngơi') + '</small><b id="pm-t">' + U.dur(PM.left) + '</b></div></div>' +
      '<div class="row-btns"><button class="btn primary" id="pm-go">' + (PM.run ? icon('pause') + 'Tạm dừng' : icon('play') + 'Bắt đầu') + '</button><button class="btn ghost" id="pm-reset">' + icon('reset') + 'Đặt lại</button><button class="btn ghost" id="pm-skip">Chuyển sang ' + (PM.phase === 'work' ? 'nghỉ' : 'học') + '</button></div>' +
      '<div class="row2 small-inputs"><label class="field"><span>Phút học</span><input class="input" type="number" min="1" max="120" id="pm-w" value="' + PM.work + '"></label><label class="field"><span>Phút nghỉ</span><input class="input" type="number" min="1" max="60" id="pm-r" value="' + PM.rest + '"></label></div>' +
      '<p class="muted">Đã hoàn thành <b>' + PM.done + '</b> phiên học trong lần mở trang này.</p></div>';
    U.$('#pm-go', el).onclick = function () {
      PM.run = !PM.run;
      if (PM.run) {
        PM.tid = setInterval(function () {
          PM.left--;
          if (PM.left <= 0) { beep(); if (PM.phase === 'work') PM.done++; PM.phase = PM.phase === 'work' ? 'rest' : 'work'; PM.left = (PM.phase === 'work' ? PM.work : PM.rest) * 60; U.toast(PM.phase === 'work' ? 'Hết giờ nghỉ, vào học thôi!' : 'Hoàn thành một phiên học. Nghỉ ngơi nhé!', 'ok'); }
          var t = document.getElementById('pm-t');
          if (t && App.S.tool === 'pomo') {
            t.textContent = U.dur(PM.left);
            var ring = t.closest('.pomo-ring'), tot = (PM.phase === 'work' ? PM.work : PM.rest) * 60;
            if (ring) { ring.style.setProperty('--p', (1 - PM.left / tot).toFixed(3)); ring.querySelector('small').textContent = PM.phase === 'work' ? 'Tập trung học' : 'Nghỉ ngơi'; }
          }
        }, 1000);
      } else clearInterval(PM.tid);
      renderPomo(el);
    };
    U.$('#pm-reset', el).onclick = function () { clearInterval(PM.tid); PM.run = false; PM.phase = 'work'; PM.left = PM.work * 60; renderPomo(el); };
    U.$('#pm-skip', el).onclick = function () { PM.phase = PM.phase === 'work' ? 'rest' : 'work'; PM.left = (PM.phase === 'work' ? PM.work : PM.rest) * 60; renderPomo(el); };
    U.$('#pm-w', el).onchange = function () { PM.work = Math.min(120, Math.max(1, Number(this.value) || 25)); if (!PM.run && PM.phase === 'work') PM.left = PM.work * 60; renderPomo(el); };
    U.$('#pm-r', el).onchange = function () { PM.rest = Math.min(60, Math.max(1, Number(this.value) || 5)); if (!PM.run && PM.phase === 'rest') PM.left = PM.rest * 60; renderPomo(el); };
  }

  /* ---------- Sổ ghi chú ---------- */
  var NT = { sel: null };
  async function renderNotes(el, alive) {
    var notes = await App.store.list('notes');
    if (alive && !alive()) return;
    notes.sort(function (a, b) { return String(b.updatedAt || b.at).localeCompare(String(a.updatedAt || a.at)); });
    var cur = notes.find(function (n) { return n.id === NT.sel; }) || null;
    el.innerHTML = '<div class="notes"><aside><button class="btn primary block" id="nt-new">' + icon('plus') + 'Ghi chú mới</button><ul class="plain-list">' +
      (notes.length ? notes.map(function (n) { return '<li><button class="pl-row ' + (cur && cur.id === n.id ? 'on' : '') + '" data-nt="' + n.id + '"><span><b>' + esc(n.title || '(không tiêu đề)') + '</b><small>' + esc(U.dt(n.updatedAt || n.at, true)) + '</small></span></button></li>'; }).join('') : '<li class="muted small">Chưa có ghi chú.</li>') + '</ul></aside>' +
      '<div class="note-ed">' + (cur || NT.sel === 'new' ? '<input class="input lg" id="nt-t" placeholder="Tiêu đề" value="' + esc(cur ? cur.title : '') + '" aria-label="Tiêu đề"><textarea class="input" id="nt-b" rows="12" placeholder="Nội dung… (dùng **chữ đậm**, x^{2}, H_{2}O)" aria-label="Nội dung">' + esc(cur ? cur.body : '') + '</textarea>' +
        '<div class="row-btns"><button class="btn primary" id="nt-save">Lưu</button>' + (cur ? '<button class="btn danger ghost" id="nt-del">' + icon('trash') + 'Xóa</button>' : '') + '</div>' : '<div class="empty">Chọn hoặc tạo một ghi chú.</div>') + '</div></div>';
    U.$('#nt-new', el).onclick = function () { NT.sel = 'new'; renderNotes(el); };
    U.$$('[data-nt]', el).forEach(function (b) { b.onclick = function () { NT.sel = b.getAttribute('data-nt'); renderNotes(el); }; });
    var sv = U.$('#nt-save', el);
    if (sv) sv.onclick = async function () {
      var d = { title: U.$('#nt-t', el).value.trim(), body: U.$('#nt-b', el).value };
      try { if (cur) await App.store.update('notes', cur.id, d); else { var r = await App.store.create('notes', d); NT.sel = r.id; } U.toast('Đã lưu ghi chú.', 'ok'); renderNotes(el); } catch (e) { App.fail(e); }
    };
    var dl = U.$('#nt-del', el);
    if (dl) dl.onclick = async function () { if (await U.confirmBox('Xóa ghi chú này?', 'Xóa', true)) { try { await App.store.remove('notes', cur.id); NT.sel = null; renderNotes(el); } catch (e) { App.fail(e); } } };
  }

  /* ---------- Việc cần làm ---------- */
  async function renderTodos(el, alive) {
    var list = await App.store.list('todos');
    if (alive && !alive()) return;
    list.sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || String(a.due || '9').localeCompare(String(b.due || '9')); });
    el.innerHTML = '<form class="todo-add" id="td-f"><input class="input" id="td-t" placeholder="Ví dụ: Ôn chương Nguyên hàm, làm 20 câu trắc nghiệm" required aria-label="Việc cần làm"><input class="input" type="date" id="td-d" aria-label="Hạn chót"><button class="btn primary" type="submit">' + icon('plus') + 'Thêm</button></form>' +
      '<ul class="todos">' + (list.length ? list.map(function (t) {
        var dd = t.due ? App.daysUntil(t.due) : null;
        var due = t.due ? '<span class="pill ' + (t.done ? 'gray' : dd < 0 ? 'red' : dd <= 2 ? 'amber' : 'gray') + '">' + (dd < 0 ? 'Quá hạn ' : 'Hạn ') + esc(U.dt(t.due)) + '</span>' : '';
        return '<li class="' + (t.done ? 'done' : '') + '"><label><input type="checkbox" data-td="' + t.id + '"' + (t.done ? ' checked' : '') + '><span>' + esc(t.text) + '</span></label>' + due + '<button class="icon-btn" data-tdx="' + t.id + '" aria-label="Xóa">' + icon('trash') + '</button></li>';
      }).join('') : '<li class="empty small">Chưa có việc nào. Hãy lập kế hoạch ôn tập cho tuần này.</li>') + '</ul>';
    U.$('#td-f', el).onsubmit = async function (e) { e.preventDefault(); try { await App.store.create('todos', { text: U.$('#td-t', el).value.trim(), due: U.$('#td-d', el).value, done: false }); renderTodos(el); } catch (er) { App.fail(er); } };
    U.$$('[data-td]', el).forEach(function (c) { c.onchange = async function () { try { await App.store.update('todos', c.getAttribute('data-td'), { done: c.checked }); renderTodos(el); } catch (e) { App.fail(e); } }; });
    U.$$('[data-tdx]', el).forEach(function (b) { b.onclick = async function () { try { await App.store.remove('todos', b.getAttribute('data-tdx')); renderTodos(el); } catch (e) { App.fail(e); } }; });
  }

  /* ---------- Đếm ngược ---------- */
  var cdTimer = null;
  async function renderCountdown(el) {
    var st = App.settings;
    var items = [];
    if (st.examDate) items.push({ name: st.examName, date: st.examDate });
    if (st.exam10Date) items.push({ name: st.exam10Name, date: st.exam10Date });
    var todos = [];
    try { todos = (await App.store.list('todos')).filter(function (t) { return t.due && !t.done && App.daysUntil(t.due) >= 0; }); } catch (e) { /* bỏ qua */ }
    function tick() {
      var box = U.$('#cd-list');
      if (!box) { clearInterval(cdTimer); return; }
      box.innerHTML = items.map(function (it) {
        var ms = new Date(it.date + 'T07:00:00') - new Date();
        if (ms < 0) return '<div class="cd-card"><b>' + esc(it.name) + '</b><p class="muted">Đã diễn ra ngày ' + esc(U.dt(it.date)) + '.</p></div>';
        var d = Math.floor(ms / 86400000), h = Math.floor(ms % 86400000 / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000);
        return '<div class="cd-card"><b>' + esc(it.name) + '</b><p class="muted small">Dự kiến 7:00 ngày ' + esc(U.dt(it.date)) + '</p><div class="cd-units"><span><b>' + d + '</b>ngày</span><span><b>' + U.pad(h) + '</b>giờ</span><span><b>' + U.pad(m) + '</b>phút</span><span><b>' + U.pad(s) + '</b>giây</span></div></div>';
      }).join('') || '<div class="empty small">Giáo viên chưa đặt ngày thi.</div>';
    }
    el.innerHTML = '<div id="cd-list" class="cd-list"></div><p class="muted small">Ngày thi do giáo viên cài đặt trong trang Quản trị. Kì thi tốt nghiệp THPT năm 2027 dự kiến diễn ra ngày 11 – 12/6/2027 theo khung kế hoạch thời gian năm học của Bộ GD&ĐT.</p>' +
      '<h3>Hạn chót sắp tới trong "Việc cần làm"</h3>' + (todos.length ? '<ul class="plain-list">' + todos.map(function (t) { return '<li class="pl-row"><span class="pill amber">' + App.daysUntil(t.due) + ' ngày</span><span>' + esc(t.text) + '</span></li>'; }).join('') + '</ul>' : '<p class="muted small">Không có việc nào có hạn chót.</p>');
    clearInterval(cdTimer); tick(); cdTimer = setInterval(tick, 1000);
  }

  var RENDER = { vocab: renderVocab, drill: renderDrill, calc: renderCalc, ptable: renderPtable, units: renderUnits, pomo: renderPomo, notes: renderNotes, todos: renderTodos, countdown: renderCountdown };
})();
