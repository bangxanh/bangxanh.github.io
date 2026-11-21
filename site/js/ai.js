/* Bảng Xanh – Trợ lý AI cho học sinh.
   Trang gọi tới một máy chủ trung gian (Cloudflare Worker, mã ở thư mục worker/) giữ kín khóa API Claude.
   Bật bằng cách điền địa chỉ máy chủ vào config.js:  window.BX_CONFIG.ai = { endpoint: 'https://….workers.dev' }.
   Khi chưa bật, các nút AI vẫn hiện nhưng báo "sắp ra mắt". Nội dung trò chuyện không được lưu. */
(function () {
  'use strict';
  var App = window.App, U = window.UI, esc = U.esc, fmt = U.fmt, icon = U.icon;
  var CFG = (window.BX_CONFIG && window.BX_CONFIG.ai) || {};
  var MAX_IN = 1500;
  var state = { open: false, busy: false, msgs: [], context: '', mode: 'chat', attach: '' };

  function endpoint() { return String(CFG.endpoint || (App.settings && App.settings.aiEndpoint) || '').trim(); }
  function enabled() { return /^https:\/\//.test(endpoint()); }

  async function call(payload) {
    var ctl = new AbortController(), t = setTimeout(function () { ctl.abort(); }, 45000);
    try {
      var r = await fetch(endpoint().replace(/\/+$/, '') + '/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl.signal });
      var j = {}; try { j = await r.json(); } catch (e) { /* bỏ qua */ }
      if (!r.ok) throw new Error(j.error || (r.status === 429 ? 'Em đã hỏi nhiều quá, nghỉ một lát rồi hỏi tiếp nhé.' : 'Trợ lý AI đang bận, em thử lại sau.'));
      return j.text || '';
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('Trợ lý AI phản hồi quá lâu, em thử lại nhé.');
      throw e;
    } finally { clearTimeout(t); }
  }

  /* Hiển thị câu trả lời: xuống dòng, **đậm**, danh sách đơn giản */
  function render(text) {
    return String(text || '').split(/\n{2,}/).map(function (para) {
      var lines = para.split('\n');
      if (lines.every(function (l) { return /^\s*([-*•]|\d+[.)])\s+/.test(l); })) {
        return '<ul>' + lines.map(function (l) { return '<li>' + fmt(l.replace(/^\s*([-*•]|\d+[.)])\s+/, '')) + '</li>'; }).join('') + '</ul>';
      }
      return '<p>' + fmt(para) + '</p>';
    }).join('');
  }

  function panelHtml() {
    var on = enabled();
    return '<div class="ai-panel" role="dialog" aria-label="Trợ lý AI"><header class="ai-head"><div><b>Trợ lý AI Bảng Xanh</b><small>Đây là trí tuệ nhân tạo, không phải thầy cô · có thể trả lời sai</small></div><button class="icon-btn" id="ai-x" aria-label="Đóng">' + icon('x') + '</button></header>' +
      (state.context ? '<div class="ai-ctx small">Đang hỏi về: <b>' + esc(state.context) + '</b></div>' : '') +
      '<div class="ai-body" id="ai-body">' + (on ? msgsHtml() : soonHtml()) + '</div>' +
      (on ? '<form class="ai-form" id="ai-form">' + (state.attach ? '<div class="ai-attach small"><b>Kèm câu hỏi:</b> ' + esc(state.attach.slice(0, 160)) + (state.attach.length > 160 ? '…' : '') + ' <button type="button" class="linkish" id="ai-unattach">bỏ</button></div>' : '') +
        '<textarea class="input" id="ai-in" rows="2" maxlength="' + MAX_IN + '" placeholder="Hỏi về bài học, nhờ gợi ý cách làm…"></textarea><button class="btn primary" id="ai-send"' + (state.busy ? ' disabled' : '') + '>Gửi</button></form>' +
        '<p class="ai-note small">Không nhập họ tên, số điện thoại, địa chỉ hay thông tin cá nhân. Nội dung trò chuyện không được lưu lại.</p>' : '') + '</div>';
  }
  function soonHtml() {
    return '<div class="ai-soon"><p class="ai-big">' + icon('star') + '</p><h3>Trợ lý AI sắp ra mắt</h3><p>Trợ lý AI sẽ giúp em: giải thích lại bài học bằng ví dụ dễ hiểu, gợi ý từng bước khi em bí, chấm và chữa bài tự luận, tạo thêm bài luyện tập.</p>' +
      '<p class="muted small">Trong lúc chờ, em dùng phần <b>Ví dụ giải mẫu</b>, nút <b>Kiểm tra</b> (chấm và chữa ngay) và <b>Sổ lỗi sai</b> ở mỗi bài học nhé.</p>' +
      (App.isAdmin && App.isAdmin() ? '<p class="small">Thầy/cô: xem tệp <b>worker/HUONG-DAN-AI.md</b> trong kho mã để bật trợ lý.</p>' : '') + '</div>';
  }
  function msgsHtml() {
    if (!state.msgs.length) {
      var tips = state.mode === 'lesson' ? ['Tóm tắt bài này trong 5 ý', 'Cho em một ví dụ dễ hiểu', 'Ra cho em 3 câu luyện tập kèm đáp án'] : ['Giải thích giúp em khái niệm này', 'Gợi ý hướng làm, đừng cho đáp án ngay', 'Em hay nhầm ở đâu với dạng bài này?'];
      return '<div class="ai-hello"><p>Chào em! Em cần giúp gì? Trợ lý sẽ ưu tiên <b>gợi ý từng bước</b> để em tự làm được.</p><div class="chips">' + tips.map(function (t) { return '<button type="button" class="chip" data-tip="' + esc(t) + '">' + esc(t) + '</button>'; }).join('') + '</div></div>';
    }
    return state.msgs.map(function (m) { return '<div class="ai-msg ' + m.role + '">' + (m.role === 'user' ? '<p>' + fmt(m.show || m.content) + '</p>' : render(m.content)) + '</div>'; }).join('') + (state.busy ? '<div class="ai-msg assistant typing"><span></span><span></span><span></span></div>' : '');
  }
  function draw() {
    var host = U.$('#ai-host');
    if (!host) { host = document.createElement('div'); host.id = 'ai-host'; document.body.appendChild(host); }
    host.innerHTML = (state.open ? panelHtml() : '') + '<button class="ai-fab' + (state.open ? ' on' : '') + '" id="ai-fab" aria-label="Trợ lý AI">' + icon('star') + '<span>Trợ lý AI</span></button>';
    U.$('#ai-fab').onclick = function () { state.open = !state.open; draw(); };
    if (!state.open) return;
    U.$('#ai-x').onclick = function () { state.open = false; draw(); };
    var body = U.$('#ai-body'); body.scrollTop = body.scrollHeight;
    U.$$('[data-tip]').forEach(function (b) { b.onclick = function () { send(b.getAttribute('data-tip')); }; });
    var ua = U.$('#ai-unattach'); if (ua) ua.onclick = function () { state.attach = ''; draw(); };
    var f = U.$('#ai-form');
    if (f) {
      var inp = U.$('#ai-in');
      if (state.prefill) { inp.value = state.prefill; state.prefill = ''; }
      inp.focus();
      inp.onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); f.requestSubmit ? f.requestSubmit() : f.onsubmit(e); } };
      f.onsubmit = function (e) { e.preventDefault(); send(inp.value); };
    }
  }
  async function send(text) {
    text = String(text || '').trim();
    if (!text || state.busy || !enabled()) return;
    var content = text.slice(0, MAX_IN) + (state.attach ? '\n\n[Câu hỏi kèm theo]\n' + state.attach.slice(0, 1500) : '');
    state.msgs.push({ role: 'user', content: content, show: text + (state.attach ? '\n(kèm câu hỏi)' : '') });
    state.attach = ''; state.busy = true; draw();
    try {
      var reply = await call({ mode: state.mode, context: state.context, grade: App.S.learn && App.S.learn.grade, messages: state.msgs.slice(-8).map(function (m) { return { role: m.role, content: m.content }; }) });
      state.msgs.push({ role: 'assistant', content: reply || '(không có trả lời)' });
    } catch (e) {
      state.msgs.push({ role: 'assistant', content: e.message || 'Có lỗi, em thử lại nhé.' });
    }
    state.busy = false; draw();
  }

  App.AI = {
    enabled: enabled,
    open: function (o) {
      o = o || {};
      if (o.context !== undefined && o.context !== state.context) state.msgs = [];
      state.context = o.context || state.context || '';
      state.mode = o.mode || 'chat';
      state.attach = o.attach || '';
      state.prefill = enabled() ? (o.prefill || '') : '';
      state.open = true; draw();
    },
    grade: async function (o) {
      var box = o.target;
      if (!enabled()) {
        box.innerHTML = '<div class="callout">Trợ lý AI chấm bài <b>sắp ra mắt</b>. Em bấm <b>Nộp & tự chấm theo đáp án</b> để đối chiếu với đáp án mẫu và tự chấm theo tiêu chí nhé.</div>';
        return;
      }
      box.innerHTML = '<div class="loading small">Trợ lý AI đang đọc bài làm của em…</div>';
      try {
        var text = await call({ mode: 'grade', context: o.context || '', grade: App.S.learn && App.S.learn.grade, task: { question: o.question, sample: o.sample, rubric: o.rubric, answer: String(o.answer).slice(0, 3000) } });
        box.innerHTML = '<div class="ai-grade"><p class="eyebrow">Nhận xét của trợ lý AI · chỉ để tham khảo</p>' + render(text) + '</div>';
      } catch (e) {
        box.innerHTML = '<div class="callout warn">' + esc(e.message) + '</div>';
      }
    }
  };
  document.addEventListener('DOMContentLoaded', draw);
  if (document.readyState !== 'loading') setTimeout(draw, 0);
})();
