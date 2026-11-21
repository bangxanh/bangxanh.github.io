/* Bảng Xanh – ứng dụng học tập. Phần lõi: khởi động, đăng nhập, điều hướng và các trang chính. */
(function () {
  'use strict';
  var U = window.UI, esc = U.esc, fmt = U.fmt, icon = U.icon;
  var D = window.HOCTAP_DATA || { curriculum: {}, questions: [], vocab: {}, stats: {} };

  var LEVELS = [
    { id: 'th', name: 'Tiểu học', grades: [1, 2, 3, 4, 5] },
    { id: 'thcs', name: 'THCS', grades: [6, 7, 8, 9] },
    { id: 'thpt', name: 'THPT', grades: [10, 11, 12] }
  ];
  var SUBJ_KEYS = ['toan', 'van', 'anh', 'khtn', 'khxh'];
  var SUBJ_COLOR = { toan: 'var(--s-toan)', van: 'var(--s-van)', anh: 'var(--s-anh)', khtn: 'var(--s-khtn)', khxh: 'var(--s-khxh)' };
  function subjShort(s, g) {
    if (s === 'toan') return 'Toán';
    if (s === 'van') return g && g <= 5 ? 'Tiếng Việt' : 'Ngữ văn';
    if (s === 'anh') return 'Tiếng Anh';
    if (s === 'khtn') return 'KHTN';
    if (s === 'khxh') return 'KHXH';
    return s || 'Chung';
  }
  function subjLong(s, g) {
    g = Number(g) || 0;
    if (s === 'khtn') return !g ? 'Khoa học tự nhiên' : g <= 3 ? 'Tự nhiên và Xã hội (phần Tự nhiên)' : g <= 5 ? 'Khoa học' : g <= 9 ? 'Khoa học tự nhiên' : 'Vật lí · Hóa học · Sinh học';
    if (s === 'khxh') return !g ? 'Khoa học xã hội' : g <= 3 ? 'Tự nhiên và Xã hội · Đạo đức' : g <= 5 ? 'Lịch sử và Địa lí · Đạo đức' : g <= 9 ? 'Lịch sử và Địa lí · GDCD' : 'Lịch sử · Địa lí · GDKT&PL';
    return subjShort(s, g);
  }
  function subjDesc(s, g) {
    g = Number(g) || 0;
    if (s === 'toan') return g <= 5 ? 'Số và phép tính · Hình học và đo lường' : 'Đại số · Hình học · Thống kê và xác suất';
    if (s === 'van') return g <= 5 ? 'Đọc · Viết · Luyện từ và câu · Nói và nghe' : 'Đọc hiểu · Viết · Nói và nghe · Tiếng Việt';
    if (s === 'anh') return g <= 2 ? 'Global Success · môn tự chọn' : 'Global Success · từ vựng, ngữ pháp';
    return subjLong(s, g);
  }
  function levelOf(g) { return g <= 5 ? 'Tiểu học' : g <= 9 ? 'THCS' : 'THPT'; }
  function gradeLabel(g) { return g ? 'Lớp ' + g : 'Tất cả các lớp'; }
  function chapKey(g, s, b, c) { return g + '-' + s + '-' + b + '-' + c; }
  function chaptersOf(g) {
    var out = 0, cur = D.curriculum[String(g)] || {};
    SUBJ_KEYS.forEach(function (s) { (cur[s] || []).forEach(function (b) { out += b.chapters.length; }); });
    return out;
  }

  var App = window.App = {
    D: D, LEVELS: LEVELS, SUBJ_KEYS: SUBJ_KEYS, SUBJ_COLOR: SUBJ_COLOR, subjShort: subjShort, subjLong: subjLong, subjDesc: subjDesc, levelOf: levelOf, gradeLabel: gradeLabel, chapKey: chapKey,
    views: {}, store: null, user: null, settings: {}, progress: {}, S: { learn: {}, quizSetup: null, run: null, tool: null, adminTab: 'overview' },
    isAdmin: function () { return App.user && App.user.role === 'admin'; },
    go: function (name) { if (location.hash === '#' + name) route(); else location.hash = name; },
    rerender: function () { route(); },
    fail: function (e) { U.toast((e && (e.userMessage || e.message)) || 'Đã có lỗi xảy ra.', 'bad'); console.error(e); }
  };

  /* ---------- Giao diện sáng/tối ---------- */
  function applyTheme() {
    var t = 'auto';
    try { t = localStorage.getItem('bx_theme') || 'auto'; } catch (e) { t = App._themeMem || 'auto'; }
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  }
  var THEME_LABEL = { auto: 'Tự động', light: 'Sáng', dark: 'Tối' };
  var THEME_ICON = { auto: 'auto', light: 'sun', dark: 'moon' };
  App.setTheme = function (t) {
    try { localStorage.setItem('bx_theme', t); } catch (e) { /* bỏ qua */ }
    App._themeMem = t; applyTheme(); syncThemeButtons();
  };
  function themeBtnInner(withLabel) { var t = App.theme(); return icon(THEME_ICON[t]) + (withLabel ? '<span>Giao diện: <b>' + THEME_LABEL[t] + '</b></span>' : ''); }
  function syncThemeButtons() {
    U.$$('[data-theme-cycle]').forEach(function (b) { var lab = b.hasAttribute('data-label'); b.innerHTML = themeBtnInner(lab); b.setAttribute('aria-label', 'Đổi giao diện (đang: ' + THEME_LABEL[App.theme()] + ')'); b.title = 'Đổi giao diện Sáng / Tối / Tự động'; });
    U.$$('[data-th]').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-th') === App.theme()); });
  }
  App.themeButton = function (withLabel, cls) { return '<button class="' + (cls || 'theme-btn') + '" data-theme-cycle' + (withLabel ? ' data-label' : '') + ' aria-label="Đổi giao diện">' + themeBtnInner(withLabel) + '</button>'; };
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-theme-cycle]');
    if (!b) return;
    var order = ['light', 'dark', 'auto'], cur = App.theme();
    var next = order[(order.indexOf(cur) + 1) % order.length];
    App.setTheme(next);
    U.toast('Giao diện: ' + THEME_LABEL[next] + (next === 'auto' ? ' (theo cài đặt của thiết bị)' : ''), 'ok');
  });
  App.theme = function () { try { return localStorage.getItem('bx_theme') || App._themeMem || 'auto'; } catch (e) { return App._themeMem || 'auto'; } };

  /* ---------- Khởi động ---------- */
  async function boot() {
    applyTheme();
    var root = U.$('#app');
    try {
      App.store = await window.BXStore.detect();
      App.server = App.store.mode === 'server' && !App.store.guest ? App.store : null;
      readDeepLink();
      var info = await App.store.init();
      App.storageOk = info.storageOk;
      try { App.settings = await App.store.getSettings(); } catch (e) { App.settings = Object.assign({}, window.BXStore.DEFAULT_SETTINGS); }
      document.title = App.settings.siteName || 'Bảng Xanh';
      if (App.store.mode === 'server' && await App.store.needsSetup()) return renderSetup(root);
      App.user = await App.store.me();
      if (!App.user && App.server) { await becomeGuest(); }
      if (!App.user) return renderAuth(root);
      await startSession(root);
      startSync();
      registerSW();
    } catch (e) {
      root.innerHTML = '<div class="auth-wrap"><div class="auth-card"><h2>Không khởi động được</h2><p>' + esc(e.message) + '</p></div></div>';
    }
  }
  async function becomeGuest() {
    App.store = new window.BXStore.PublicStore(App.server);
    await App.store.init();
    App.user = await App.store.me();
  }
  App.isGuest = function () { return !!(App.user && App.user.role === 'guest'); };
  App.showAuth = function (tab) { renderAuth(U.$('#app'), tab || 'login'); };
  App.saveGuestGrade = async function (g) { App.user = await App.store.updateMe({ grade: g }); };
  /* Mở thẳng một lớp/môn từ đường liên kết, ví dụ ?lop=12&mon=toan#learn (dùng cho trang tìm kiếm Google) */
  function readDeepLink() {
    try {
      var q = new URLSearchParams(location.search), g = Number(q.get('lop')), s = q.get('mon');
      if (g >= 1 && g <= 12) {
        App.S.learn = { grade: g, subj: SUBJ_KEYS.indexOf(s) >= 0 ? s : 'toan', book: 0 };
        App.S.quizSetup = { g: g, s: App.S.learn.subj, b: '', n: 20, types: { mc: true, tf: true, sa: true }, limit: 0 };
      }
    } catch (e) { /* bỏ qua */ }
  }
  async function startSession(root) {
    App.progress = {};
    try { (await App.store.list('progress')).forEach(function (p) { App.progress[p.key] = p.id; }); } catch (e) { /* bỏ qua */ }
    renderShell(root);
    if (!location.hash) location.hash = 'home'; else route();
  }

  /* ---------- Trang đăng nhập / đăng kí ---------- */
  function brandBlock() {
    return '<div class="brand"><span class="brand-mark" aria-hidden="true">BX</span><span><b>' + esc(App.settings.siteName || 'Bảng Xanh') + '</b><small>' + esc(App.settings.tagline || '') + '</small></span></div>';
  }
  function gradeOptions(sel, withZero) {
    var h = withZero ? '<option value="0"' + (!sel ? ' selected' : '') + '>Tất cả các lớp</option>' : '';
    for (var g = 1; g <= 12; g++) h += '<option value="' + g + '"' + (Number(sel) === g ? ' selected' : '') + '>Lớp ' + g + '</option>';
    return h;
  }
  App.gradeOptions = gradeOptions;
  function subjOptions(sel, withAll, g) {
    var h = withAll ? '<option value=""' + (!sel ? ' selected' : '') + '>Tất cả các môn</option>' : '';
    SUBJ_KEYS.forEach(function (s) { h += '<option value="' + s + '"' + (sel === s ? ' selected' : '') + '>' + esc(g ? subjShort(s, g) + ' – ' + subjLong(s, g) : subjShort(s, 6) + (s === 'van' ? ' / Tiếng Việt' : s === 'khtn' ? ' – Khoa học tự nhiên' : s === 'khxh' ? ' – Khoa học xã hội' : '')) + '</option>'; });
    return h;
  }
  App.subjOptions = subjOptions;

  function renderAuth(root, tab) {
    tab = tab || 'login';
    var local = App.store.mode === 'local';
    root.innerHTML = '<div class="auth-wrap"><div class="auth-side">' + brandBlock() +
      '<h1>Ôn bài, làm đề và theo dõi tiến bộ ở một nơi.</h1>' +
      '<ul class="auth-points"><li>' + icon('book') + '<span><b>' + (D.stats.chapters || 0) + ' chương, chủ đề</b> từ lớp 1 đến lớp 12, theo mạch SGK Kết nối tri thức với cuộc sống</span></li>' +
      '<li>' + icon('quiz') + '<span><b>' + (D.stats.questions || 0) + ' câu hỏi có sẵn</b> đủ 3 dạng của đề thi mới: nhiều lựa chọn, Đúng/Sai, trả lời ngắn</span></li>' +
      '<li>' + icon('exam') + '<span><b>Đề thi do giáo viên giao</b>, tính giờ, chấm điểm tự động</span></li></ul>' +
      '<p class="auth-foot">Năm học ' + esc(D.schoolYear || '2026–2027') + '</p></div>' +
      '<div class="auth-card"><div class="tabs" role="tablist"><button class="tab ' + (tab === 'login' ? 'on' : '') + '" data-tab="login">Đăng nhập</button><button class="tab ' + (tab === 'reg' ? 'on' : '') + '" data-tab="reg">Đăng kí học sinh</button></div>' +
      (tab === 'login' ?
        '<form id="f-login" class="stack"><label class="field"><span>Tên đăng nhập</span><input class="input" id="li-u" autocomplete="username" required></label>' +
        '<label class="field"><span>Mật khẩu</span><input class="input" id="li-p" type="password" autocomplete="current-password" required></label>' +
        '<button class="btn primary block" type="submit">Đăng nhập</button></form>' +
        (local ? '<div class="demo-box"><b>Bản dùng thử</b> – tài khoản mẫu:<br><button class="linkish" data-demo="admin|admin123">admin / admin123</button> (giáo viên quản trị)<br><button class="linkish" data-demo="hocsinh|123456">hocsinh / 123456</button> (học sinh lớp 12)<br><button class="linkish" data-demo="hocsinh9|123456">hocsinh9 / 123456</button> (học sinh lớp 9)</div>' : '')
        :
        '<form id="f-reg" class="stack"><label class="field"><span>Họ và tên</span><input class="input" id="rg-n" required autocomplete="name"></label>' +
        '<div class="row2"><label class="field"><span>Tên đăng nhập</span><input class="input" id="rg-u" required autocomplete="username" placeholder="vd: an.nguyen"></label>' +
        '<label class="field"><span>Lớp</span><select class="input" id="rg-g">' + gradeOptions(12) + '</select></label></div>' +
        '<label class="field"><span>Mật khẩu (ít nhất 6 kí tự)</span><input class="input" id="rg-p" type="password" required autocomplete="new-password"></label>' +
        '<button class="btn primary block" type="submit">Tạo tài khoản</button><p class="muted small">Tài khoản giáo viên (quản trị) do quản trị viên tạo trong trang Quản trị.</p></form>') +
      '<p class="err" id="auth-err" role="alert"></p>' + (App.server ? '<button class="btn ghost block" id="auth-guest">' + icon('book') + 'Vào học ngay, không cần tài khoản</button>' : '') + '</div>' +
      '<div class="auth-tools">' + App.themeButton(true) + '</div></div>';
    U.$$('[data-tab]', root).forEach(function (b) { b.onclick = function () { renderAuth(root, b.getAttribute('data-tab')); }; });
    var ag = U.$('#auth-guest', root);
    if (ag) ag.onclick = async function () { await becomeGuest(); await startSession(root); };
    U.$$('[data-demo]', root).forEach(function (b) { b.onclick = function () { var p = b.getAttribute('data-demo').split('|'); U.$('#li-u').value = p[0]; U.$('#li-p').value = p[1]; }; });
    var errEl = U.$('#auth-err', root);
    var fl = U.$('#f-login', root);
    if (fl) fl.onsubmit = async function (e) {
      e.preventDefault(); errEl.textContent = '';
      try { var st = App.server || App.store; App.user = await st.login(U.$('#li-u').value, U.$('#li-p').value); App.store = st; await startSession(root); } catch (er) { errEl.textContent = er.userMessage || er.message; }
    };
    var fr = U.$('#f-reg', root);
    if (fr) fr.onsubmit = async function (e) {
      e.preventDefault(); errEl.textContent = '';
      try { var st = App.server || App.store; App.user = await st.register({ fullname: U.$('#rg-n').value, username: U.$('#rg-u').value, password: U.$('#rg-p').value, grade: U.$('#rg-g').value }); App.store = st; await startSession(root); } catch (er) { errEl.textContent = er.userMessage || er.message; }
    };
  }

  function renderSetup(root) {
    root.innerHTML = '<div class="auth-wrap single"><div class="auth-card wide">' + brandBlock() +
      '<h2>Thiết lập lần đầu</h2><p class="muted">Máy chủ chưa có tài khoản nào. Hãy tạo tài khoản <b>quản trị viên</b> (giáo viên) để quản lí trang.</p>' +
      '<form id="f-setup" class="stack"><label class="field"><span>Tên trang web</span><input class="input" id="su-site" value="' + esc(App.settings.siteName || 'Bảng Xanh') + '"></label>' +
      '<label class="field"><span>Họ và tên giáo viên</span><input class="input" id="su-n" required></label>' +
      '<div class="row2"><label class="field"><span>Tên đăng nhập</span><input class="input" id="su-u" required value="admin"></label>' +
      '<label class="field"><span>Mật khẩu (ít nhất 8 kí tự)</span><input class="input" id="su-p" type="password" required autocomplete="new-password"></label></div>' +
      '<button class="btn primary block" type="submit">Tạo tài khoản quản trị</button></form><p class="err" id="su-err" role="alert"></p></div></div>';
    U.$('#f-setup').onsubmit = async function (e) {
      e.preventDefault();
      try {
        App.user = await App.store.setup({ siteName: U.$('#su-site').value, fullname: U.$('#su-n').value, username: U.$('#su-u').value, password: U.$('#su-p').value });
        App.settings = await App.store.getSettings();
        await startSession(root);
      } catch (er) { U.$('#su-err').textContent = er.userMessage || er.message; }
    };
  }

  /* ---------- Khung trang ---------- */
  var NAV = [
    { id: 'home', label: 'Trang chủ', icon: 'home' },
    { id: 'learn', label: 'Học liệu', icon: 'book' },
    { id: 'quiz', label: 'Trắc nghiệm', icon: 'quiz' },
    { id: 'exams', label: 'Đề thi', icon: 'exam' },
    { id: 'docs', label: 'Tài liệu', icon: 'folder' },
    { id: 'tools', label: 'Tiện ích', icon: 'tools' },
    { id: 'results', label: 'Kết quả', icon: 'chart' },
    { id: 'rank', label: 'Xếp hạng', icon: 'trophy', member: true },
    { id: 'account', label: 'Tài khoản', icon: 'user' },
    { id: 'admin', label: 'Quản trị', icon: 'shield', admin: true }
  ];
  function renderShell(root) {
    var u = App.user;
    root.innerHTML = '<div class="shell"><aside class="side" id="side">' + brandBlock() +
      '<nav class="nav" aria-label="Điều hướng chính">' + NAV.filter(function (n) { return (!n.admin || App.isAdmin()) && (!n.member || !App.isGuest()); }).map(function (n) {
        return '<a href="#' + n.id + '" data-nav="' + n.id + '">' + icon(n.icon) + '<span>' + n.label + '</span></a>';
      }).join('') + '</nav>' +
      '<div class="side-foot">' + App.themeButton(true) +
      '<div class="me"><span class="avatar">' + esc(initials(u.fullname)) + '</span><span class="me-txt"><b>' + esc(u.fullname) + '</b><small>' + (u.role === 'admin' ? 'Quản trị viên' : u.role === 'guest' ? 'Khách · ' + (u.grade ? 'Lớp ' + u.grade : 'chưa chọn lớp') : 'Học sinh · ' + gradeLabel(u.grade)) + '</small></span>' +
      (App.isGuest() ? (App.server ? '<button class="btn sm primary" id="btn-login">Đăng nhập</button>' : '') : '<button class="icon-btn" id="btn-logout" title="Đăng xuất" aria-label="Đăng xuất">' + icon('logout') + '</button>') + '</div>' +
      '<div class="mode-pill ' + (App.isGuest() && !App.server ? 'public' : App.store.mode) + '">' + modeText() + '</div></div></aside>' +
      '<div class="side-scrim" id="scrim"></div>' +
      '<div class="main-wrap"><header class="topbar"><button class="icon-btn" id="btn-menu" aria-label="Mở menu">' + icon('menu') + '</button><span class="topbar-title">' + esc(App.settings.siteName || 'Bảng Xanh') + '</span>' + App.themeButton(false, 'icon-btn') + '</header>' +
      '<div class="update-bar" id="update-bar" hidden></div>' +
      '<main id="main" class="main" tabindex="-1"></main></div></div>';
    var lo = U.$('#btn-logout');
    if (lo) lo.onclick = async function () {
      if (App.S.run && !App.S.run.result && !(await U.confirmBox('Em đang làm bài dở. Đăng xuất sẽ mất bài làm này. Tiếp tục?', 'Đăng xuất', true))) return;
      await App.store.logout(); App.user = null; App.S.run = null; App.S.adminTab = 'overview';
      if (App.server) { await becomeGuest(); location.hash = 'home'; await startSession(root); } else { location.hash = ''; renderAuth(root); }
    };
    var li = U.$('#btn-login');
    if (li) li.onclick = function () { App.showAuth('login'); };
    U.$('#btn-menu').onclick = function () { document.body.classList.toggle('nav-open'); };
    U.$('#scrim').onclick = function () { document.body.classList.remove('nav-open'); };
  }
  App.refreshShell = function () { renderShell(U.$('#app')); route(); };
  function modeText() {
    if (App.isGuest()) return App.server ? 'Khách · tiến độ lưu trên thiết bị này' : 'Bản công khai · miễn phí cho mọi người';
    return App.store.mode === 'server' ? 'Đang chạy trên máy chủ' : 'Bản dùng thử · lưu trên trình duyệt này';
  }
  function initials(n) { var p = String(n || '?').trim().split(/\s+/); return (p.length > 1 ? p[p.length - 2][0] + p[p.length - 1][0] : p[0].slice(0, 2)).toUpperCase(); }
  App.initials = initials;

  var routeToken = 0;
  /* Trang không có trên thanh điều hướng: #bai/<mã bài>, #in/<loại>/<lớp-môn> */
  var HIDDEN_ROUTES = { bai: 'learn', 'in': 'docs' };
  async function route(keep) {
    if (!App.user) return;
    keep = keep === true;
    var keepY = window.scrollY;
    var raw = (location.hash || '#home').slice(1) || 'home';
    var cut = raw.indexOf('/');
    var name = cut >= 0 ? raw.slice(0, cut) : raw;
    App.routeArg = cut >= 0 ? decodeURIComponent(raw.slice(cut + 1)) : '';
    var navName = HIDDEN_ROUTES[name] || name;
    var item = NAV.find(function (n) { return n.id === navName; });
    if (name === 'login' && App.isGuest() && App.server) { App.showAuth('login'); return; }
    if (!item || (item.admin && !App.isAdmin()) || (item.member && App.isGuest()) || !App.views[name]) { name = 'home'; }
    document.body.classList.remove('nav-open');
    if (name !== 'bai' && name !== 'in') document.title = App.settings.siteName || 'Bảng Xanh';
    U.$$('[data-nav]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-nav') === (HIDDEN_ROUTES[name] || name)); if (a.classList.contains('on')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    var main = U.$('#main');
    if (!main) return;
    var tk = ++routeToken;
    if (!keep) main.innerHTML = '<div class="page"><div class="loading">Đang tải…</div></div>';
    try {
      await App.views[name](main, function () { return tk === routeToken; });
    } catch (e) {
      if (tk === routeToken) main.innerHTML = '<div class="page"><div class="empty">Không tải được trang: ' + esc(e.userMessage || e.message) + '</div></div>';
      console.error(e);
    }
    if (tk === routeToken) window.scrollTo(0, keep ? keepY : 0);
  }
  window.addEventListener('hashchange', function () { route(); });

  /* =============== TRANG CHỦ =============== */
  function streakDays(dates) {
    var set = {}; dates.forEach(function (d) { var x = new Date(d); set[x.getFullYear() + '-' + x.getMonth() + '-' + x.getDate()] = 1; });
    var n = 0, cur = new Date();
    var key = function (x) { return x.getFullYear() + '-' + x.getMonth() + '-' + x.getDate(); };
    if (!set[key(cur)]) cur.setDate(cur.getDate() - 1);
    while (set[key(cur)]) { n++; cur.setDate(cur.getDate() - 1); }
    return n;
  }
  function daysUntil(iso) {
    if (!iso) return null;
    var d = new Date(iso + 'T07:00:00');
    if (isNaN(d)) return null;
    return Math.ceil((d - new Date()) / 86400000);
  }
  App.daysUntil = daysUntil;
  App.views.home = async function (main, alive) {
    var u = App.user, st = App.settings;
    var res = [], news = [], exams = [];
    try { var r = await Promise.all([App.store.list('results'), App.store.list('news'), App.store.list('exams')]); res = r[0]; news = r[1]; exams = r[2]; } catch (e) { App.fail(e); }
    if (!alive()) return;
    var mine = res.filter(function (x) { return x.owner === u.id; });
    var avg = mine.length ? mine.reduce(function (a, b) { return a + (b.score || 0); }, 0) / mine.length : null;
    var g = u.grade || 12;
    var totalCh = chaptersOf(g);
    var doneCh = Object.keys(App.progress).filter(function (k) { return k.indexOf(g + '-') === 0; }).length;
    var streak = streakDays(mine.map(function (x) { return x.at; }));
    var openExams = exams.filter(function (e) { return e.open !== false; }).sort(function (a, b) { return (Number(b.g) === g) - (Number(a.g) === g); });
    var guest = App.isGuest();
    var cd = null;
    if (g >= 10 || App.isAdmin()) cd = { name: st.examName, days: daysUntil(st.examDate), date: st.examDate };
    else if (g === 9 && st.exam10Date) cd = { name: st.exam10Name, days: daysUntil(st.exam10Date), date: st.exam10Date };
    var hour = new Date().getHours();
    var hello = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
    news.sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.at).localeCompare(String(a.at)); });
    var html = '<div class="page">' +
      '<section class="hero"><div><p class="eyebrow">' + esc(hello) + ' · ' + esc(U.dt(new Date().toISOString())) + '</p><h1>' + (guest && u.fullname === 'Bạn học' ? 'Chào bạn!' : esc(u.fullname)) + '</h1><p class="muted">' + (App.isAdmin() ? 'Quản trị viên · ' + esc(st.siteName) : guest ? 'Học miễn phí, không cần tài khoản' + (u.grade ? ' · Lớp ' + u.grade + ' · ' + levelOf(g) + ' · <button class="linkish" id="chg-grade">Đổi lớp</button>' : '') : 'Học sinh ' + esc(gradeLabel(u.grade)) + ' · ' + levelOf(g)) + '</p>' +
      '<div class="hero-actions"><a class="btn primary" href="#learn">' + icon('book') + 'Vào học liệu ' + esc(gradeLabel(g)) + '</a><a class="btn ghost" href="#quiz">' + icon('quiz') + 'Luyện trắc nghiệm</a></div></div>' +
      (cd && cd.days !== null ? '<div class="countdown"><span class="cd-num">' + (cd.days > 0 ? cd.days : 0) + '</span><span class="cd-lab">ngày nữa<br><b>' + esc(cd.name) + '</b><small>' + (cd.date ? 'Dự kiến ' + esc(U.dt(cd.date)) : '') + '</small></span></div>' : '') + '</section>' +
      (guest && !u.grade ? '<section class="card grade-pick"><h2>Bạn học lớp mấy?</h2><p class="muted">Chọn lớp để trang hiện đúng học liệu, đề thi và từ vựng cho bạn. Có thể đổi lại bất cứ lúc nào.</p>' +
        LEVELS.map(function (lv) { return '<div class="lv-row"><span class="lv-name">' + lv.name + '</span><div class="chips">' + lv.grades.map(function (x) { return '<button class="chip" data-pickg="' + x + '">Lớp ' + x + '</button>'; }).join('') + '</div></div>'; }).join('') + '</section>' : '') +
      '<section class="kpis">' +
      kpi('Bài đã làm', mine.length, 'bài luyện tập và đề thi') +
      kpi('Điểm trung bình', avg === null ? '–' : U.num(avg, 2), 'thang điểm 10', avg === null ? '' : U.scoreClass(avg)) +
      kpi('Chủ đề đã học', doneCh + '/' + totalCh, gradeLabel(g)) +
      kpi('Chuỗi ngày học', streak, streak ? 'ngày liên tiếp' : 'làm một bài hôm nay để bắt đầu') + '</section>' +
      '<div class="cols"><section class="card"><div class="card-head"><h2>Môn học ' + esc(gradeLabel(g)) + '</h2><a class="linkish" href="#learn">Xem tất cả</a></div><div class="subj-mini">' +
      SUBJ_KEYS.map(function (s) {
        var books = (D.curriculum[String(g)] || {})[s] || [];
        var n = 0, d = 0; books.forEach(function (b, bi) { b.chapters.forEach(function (c, ci) { n++; if (App.progress[chapKey(g, s, bi, ci)]) d++; }); });
        return '<button class="sm-item" data-subj="' + s + '" style="--c:' + SUBJ_COLOR[s] + '"><span class="sm-name">' + esc(subjShort(s, g)) + '</span><span class="sm-sub">' + esc(subjDesc(s, g)) + '</span><span class="bar"><i style="width:' + (n ? Math.round(d / n * 100) : 0) + '%"></i></span><span class="sm-meta">' + d + '/' + n + ' chủ đề</span></button>';
      }).join('') + '</div></section>' +
      '<section class="card"><div class="card-head"><h2>Đề thi đang mở</h2><a class="linkish" href="#exams">Tất cả</a></div>' +
      (openExams.length ? '<ul class="plain-list">' + openExams.slice(0, 4).map(function (e) {
        return '<li><a href="#exams" class="pl-row"><span class="dot" style="background:' + (SUBJ_COLOR[e.s] || 'var(--board)') + '"></span><span><b>' + esc(e.title) + '</b><small>' + esc(subjShort(e.s, e.g)) + ' · ' + esc(gradeLabel(e.g)) + ' · ' + e.minutes + ' phút</small></span></a></li>';
      }).join('') + '</ul>' : '<div class="empty small">Chưa có đề thi nào đang mở cho lớp của em.</div>') + '</section></div>' +
      '<section class="card"><div class="card-head"><h2>' + icon('bell') + 'Thông báo</h2>' + (App.isAdmin() ? '<a class="linkish" href="#admin" data-admintab="news">Đăng thông báo</a>' : '') + '</div>' +
      (news.length ? news.slice(0, 5).map(function (n) {
        return '<article class="news ' + (n.pinned ? 'pinned' : '') + '"><h3>' + (n.pinned ? '<span class="badge">Ghim</span>' : '') + esc(n.title) + '</h3><p class="muted small">' + esc(U.dt(n.at, true)) + '</p><div class="prose">' + fmt(n.body) + '</div></article>';
      }).join('') : '<div class="empty small">Chưa có thông báo.</div>') + '</section>' +
      '<section class="card"><div class="card-head"><h2>' + icon('rss') + 'Tin giáo dục mới nhất</h2><a class="linkish" href="#docs" data-doctab="news">Xem thêm</a></div><div id="feed-home"><div class="loading small">Đang tải tin…</div></div></section>' +
      (mine.length ? '<section class="card"><div class="card-head"><h2>Điểm các bài gần đây</h2><a class="linkish" href="#results">Chi tiết</a></div>' + U.lineChart(mine.slice().sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); }).slice(-15).map(function (r) { return { v: r.score || 0, label: U.dt(r.at) }; })) + '</section>' : '') +
      '</div>';
    main.innerHTML = html;
    U.$$('[data-subj]', main).forEach(function (b) { b.onclick = function () { App.S.learn = { grade: g, subj: b.getAttribute('data-subj'), book: 0 }; App.go('learn'); }; });
    U.$$('[data-admintab]', main).forEach(function (a) { a.onclick = function () { App.S.adminTab = a.getAttribute('data-admintab'); }; });
    U.$$('[data-doctab]', main).forEach(function (a) { a.onclick = function () { App.S.docTab = a.getAttribute('data-doctab'); }; });
    U.$$('[data-pickg]', main).forEach(function (b) { b.onclick = async function () { await App.saveGuestGrade(Number(b.getAttribute('data-pickg'))); App.S.learn = {}; App.refreshShell(); }; });
    var cg = U.$('#chg-grade', main);
    if (cg) cg.onclick = async function () { await App.saveGuestGrade(0); App.refreshShell(); };
    App.fillFeed(U.$('#feed-home', main), 8);
  };
  /* ---------- Tin giáo dục tự cập nhật ---------- */
  App.getFeed = async function (force) {
    if (!force && App.feed && Date.now() - App.feed._t < 10 * 60 * 1000) return App.feed;
    try { var f = await App.store.feed(); f._t = Date.now(); App.feed = f; } catch (e) { App.feed = App.feed || { items: [], _t: Date.now() }; }
    return App.feed;
  };
  function feedList(items) {
    return '<ul class="feed">' + items.map(function (it) {
      return '<li><a href="' + esc(it.u) + '" target="_blank" rel="noopener"><span class="src" data-src="' + esc(it.s) + '">' + esc(it.s) + '</span><span class="feed-t">' + esc(it.t) + '</span><small>' + esc(U.ago(it.d)) + '</small></a></li>';
    }).join('') + '</ul>';
  }
  App.fillFeed = async function (el, n, src) {
    if (!el) return;
    var f = await App.getFeed();
    if (!el.isConnected) return;
    var items = (f.items || []).filter(function (x) { return !src || x.s === src; }).slice(0, n || 60);
    el.innerHTML = items.length ? feedList(items) + '<p class="muted small feed-note">Tự động cập nhật từ VnExpress, Tuổi Trẻ, Thanh Niên' + (f.updatedAt ? ' · lần gần nhất ' + esc(U.ago(f.updatedAt)) : '') + '. Bấm vào tin để đọc bài gốc.</p>' : '<div class="empty small">Chưa lấy được tin giáo dục. Trang sẽ tự thử lại sau.</div>';
  };
  function kpi(label, value, sub, cls) {
    return '<div class="kpi ' + (cls || '') + '"><span class="kpi-lab">' + esc(label) + '</span><span class="kpi-val">' + esc(String(value)) + '</span><span class="kpi-sub">' + esc(sub || '') + '</span></div>';
  }
  App.kpi = kpi;

  /* =============== HỌC LIỆU =============== */
  App.views.learn = async function (main, alive) {
    var L = App.S.learn;
    if (!L.grade) L.grade = App.user.grade || 12;
    if (!L.subj) L.subj = 'toan';
    if (L.book === undefined) L.book = 0;
    var lessons = [], docs = [];
    try { var r = await Promise.all([App.store.list('lessons'), App.store.list('docs')]); lessons = r[0]; docs = r[1]; } catch (e) { App.fail(e); }
    if (!alive()) return;
    var g = L.grade, s = L.subj;
    var books = (D.curriculum[String(g)] || {})[s] || [];
    if (L.book >= books.length) L.book = 0;
    var book = books[L.book];
    var myLessons = lessons.filter(function (x) { return Number(x.g) === g && x.s === s; });
    var myDocs = docs.filter(function (x) { return (!x.g || Number(x.g) === g) && (!x.s || x.s === s); });
    var html = '<div class="page"><header class="page-head"><div><h1>Học liệu</h1><p class="muted">Chương trình GDPT 2018 · sắp xếp theo mạch bài của bộ SGK <b>Kết nối tri thức với cuộc sống</b>, bộ sách dùng thống nhất toàn quốc từ năm học 2026–2027.</p></div>' +
      '<div class="searchbox">' + icon('search') + '<input class="input" id="lsearch" placeholder="Tìm kiến thức, công thức… (vd: Viète, quang hợp)" value="' + esc(L.q || '') + '" aria-label="Tìm trong học liệu"></div></header>' +
      '<div id="lresults"></div>' +
      '<section class="levels">' + LEVELS.map(function (lv) {
        return '<div class="lv"><span class="lv-name">' + lv.name + '</span><div class="chips">' + lv.grades.map(function (x) { return '<button class="chip ' + (x === g ? 'on' : '') + '" data-grade="' + x + '">Lớp ' + x + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</section>' +
      '<section class="subj-cards">' + SUBJ_KEYS.map(function (k) {
        var bs = (D.curriculum[String(g)] || {})[k] || [], n = 0, d = 0;
        bs.forEach(function (b, bi) { b.chapters.forEach(function (c, ci) { n++; if (App.progress[chapKey(g, k, bi, ci)]) d++; }); });
        return '<button class="subj-card ' + (k === s ? 'on' : '') + '" data-s="' + k + '" style="--c:' + SUBJ_COLOR[k] + '"><span class="sc-tag">' + esc(subjShort(k, g)) + '</span><span class="sc-name">' + esc(subjDesc(k, g)) + '</span><span class="bar"><i style="width:' + (n ? Math.round(d / n * 100) : 0) + '%"></i></span><span class="sc-meta">' + d + '/' + n + ' chủ đề đã học</span></button>';
      }).join('') + '</section>';
    if (book) {
      html += '<section class="reader" style="--c:' + SUBJ_COLOR[s] + '">' +
        (books.length > 1 ? '<div class="tabs book-tabs">' + books.map(function (b, i) { return '<button class="tab ' + (i === L.book ? 'on' : '') + '" data-book="' + i + '">' + esc(b.title) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="reader-head"><div><p class="eyebrow">' + esc(levelOf(g)) + ' · Lớp ' + g + '</p><h2>' + esc(book.title) + '</h2></div>' +
        '<button class="btn primary" id="btn-practice">' + icon('quiz') + 'Luyện trắc nghiệm</button></div>' +
        (book.note ? '<div class="callout">' + fmt(book.note) + '</div>' : '') +
        '<div class="chapters">' + book.chapters.map(function (c, ci) {
          var key = chapKey(g, s, L.book, ci), done = !!App.progress[key];
          return '<article class="chap ' + (done ? 'done' : '') + '" id="ch-' + ci + '"><div class="chap-head"><span class="chap-no">' + U.pad(ci + 1) + '</span><h3>' + esc(c.t) + '</h3>' +
            '<label class="done-toggle"><input type="checkbox" data-key="' + key + '"' + (done ? ' checked' : '') + '> Đã học</label></div>' +
            '<ul class="points">' + c.items.map(function (it) { return '<li>' + fmt(it) + '</li>'; }).join('') + '</ul></article>';
        }).join('') + '</div></section>';
    } else {
      html += '<div class="empty">Chưa có học liệu cho môn này.</div>';
    }
    html += '<div class="cols"><section class="card"><div class="card-head"><h2>Bài giảng của giáo viên</h2>' + (App.isAdmin() ? '<a class="linkish" href="#admin" data-admintab="lessons">Thêm bài giảng</a>' : '') + '</div>' +
      (myLessons.length ? myLessons.map(function (x) {
        return '<article class="lesson"><h3>' + esc(x.title) + '</h3><p class="muted small">' + esc(U.dt(x.at)) + '</p><div class="prose">' + fmt(x.body || '') + '</div>' + (x.video ? '<p><a class="btn ghost sm" href="' + esc(x.video) + '" target="_blank" rel="noopener">' + icon('play') + 'Xem video bài giảng</a></p>' : '') + '</article>';
      }).join('') : '<div class="empty small">Giáo viên chưa đăng bài giảng cho ' + esc(subjShort(s, g)) + ' lớp ' + g + '.</div>') + '</section>' +
      '<section class="card"><div class="card-head"><h2>Tài liệu tham khảo</h2><a class="linkish" href="#docs">Thư viện</a></div>' +
      (myDocs.length ? '<ul class="plain-list">' + myDocs.slice(0, 8).map(function (x) { return '<li><a class="pl-row" href="#docs">' + icon(x.kind === 'link' ? 'link' : x.kind === 'file' ? 'file' : 'text') + '<span><b>' + esc(x.title) + '</b><small>' + esc(x.g ? gradeLabel(x.g) : 'Dùng chung') + '</small></span></a></li>'; }).join('') + '</ul>' : '<div class="empty small">Chưa có tài liệu.</div>') + '</section></div></div>';
    main.innerHTML = html;
    U.$$('[data-grade]', main).forEach(function (b) { b.onclick = function () { L.grade = Number(b.getAttribute('data-grade')); L.book = 0; App.rerender(); }; });
    U.$$('[data-s]', main).forEach(function (b) { b.onclick = function () { L.subj = b.getAttribute('data-s'); L.book = 0; App.rerender(); }; });
    U.$$('[data-book]', main).forEach(function (b) { b.onclick = function () { L.book = Number(b.getAttribute('data-book')); App.rerender(); }; });
    U.$$('[data-admintab]', main).forEach(function (a) { a.onclick = function () { App.S.adminTab = a.getAttribute('data-admintab'); }; });
    U.$$('input[data-key]', main).forEach(function (cb) { cb.onchange = function () { toggleDone(cb); }; });
    var bp = U.$('#btn-practice', main);
    if (bp) bp.onclick = function () {
      var part = books.length > 1 ? book.title.replace(/\s*\d+$/, '').trim() : '';
      App.S.quizSetup = { g: g, s: s, b: partKey(part), n: 10, types: { mc: true, tf: true, sa: true }, limit: 0 };
      App.go('quiz');
    };
    var inp = U.$('#lsearch', main);
    inp.oninput = function () { L.q = inp.value; showSearch(inp.value); };
    if (L.q) showSearch(L.q);
    if (L.scrollTo !== undefined) { var el = U.$('#ch-' + L.scrollTo, main); L.scrollTo = undefined; if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); el.classList.add('flash'); }, 60); }
  };
  function partKey(t) {
    if (/Vật lí/.test(t)) return 'Vật lí'; if (/Hóa học/.test(t)) return 'Hóa học'; if (/Sinh học/.test(t)) return 'Sinh học';
    if (/^Lịch sử và Địa lí/.test(t)) return 'LS&ĐL'; if (/Giáo dục công dân/.test(t)) return 'GDCD';
    if (/^Lịch sử/.test(t)) return 'Lịch sử'; if (/^Địa lí/.test(t)) return 'Địa lí'; if (/kinh tế và pháp luật/.test(t)) return 'GDKT&PL';
    return '';
  }
  App.partKey = partKey;
  async function toggleDone(cb) {
    var key = cb.getAttribute('data-key');
    cb.disabled = true;
    try {
      if (cb.checked) { var row = await App.store.create('progress', { key: key }); App.progress[key] = row.id; }
      else if (App.progress[key]) { await App.store.remove('progress', App.progress[key]); delete App.progress[key]; }
      cb.closest('.chap').classList.toggle('done', cb.checked);
    } catch (e) { cb.checked = !cb.checked; App.fail(e); }
    cb.disabled = false;
  }
  function showSearch(q) {
    var box = U.$('#lresults');
    if (!box) return;
    q = U.plain(q).trim();
    if (q.length < 2) { box.innerHTML = ''; return; }
    var out = [];
    Object.keys(D.curriculum).forEach(function (g) {
      SUBJ_KEYS.forEach(function (s) {
        (D.curriculum[g][s] || []).forEach(function (b, bi) {
          b.chapters.forEach(function (c, ci) {
            var hit = null;
            if (U.plain(c.t).indexOf(q) >= 0) hit = c.items[0] || '';
            else c.items.forEach(function (it) { if (!hit && U.plain(it).indexOf(q) >= 0) hit = it; });
            if (hit !== null && out.length < 40) out.push({ g: Number(g), s: s, bi: bi, ci: ci, book: b.title, ch: c.t, text: hit });
          });
        });
      });
    });
    out.sort(function (a, b) { return a.g - b.g; });
    box.innerHTML = '<section class="card search-res"><div class="card-head"><h2>Kết quả tìm kiếm (' + out.length + (out.length === 40 ? '+' : '') + ')</h2><button class="linkish" id="clr-search">Đóng</button></div>' +
      (out.length ? '<ul class="plain-list">' + out.map(function (r, i) { return '<li><button class="pl-row" data-hit="' + i + '"><span class="dot" style="background:' + SUBJ_COLOR[r.s] + '"></span><span><b>' + esc(r.book) + ' · ' + esc(r.ch) + '</b><small>' + fmt(r.text) + '</small></span></button></li>'; }).join('') + '</ul>' : '<div class="empty small">Không tìm thấy nội dung phù hợp.</div>') + '</section>';
    U.$('#clr-search').onclick = function () { App.S.learn.q = ''; U.$('#lsearch').value = ''; box.innerHTML = ''; };
    U.$$('[data-hit]', box).forEach(function (b) {
      b.onclick = function () { var r = out[Number(b.getAttribute('data-hit'))]; Object.assign(App.S.learn, { grade: r.g, subj: r.s, book: r.bi, q: '', scrollTo: r.ci }); App.rerender(); };
    });
  }

  /* =============== TÀI LIỆU =============== */
  App.views.docs = async function (main, alive) {
    var docs = await App.store.list('docs');
    if (!alive()) return;
    var F = App.S.docF || (App.S.docF = { g: App.isAdmin() ? 0 : (App.user.grade || 0), s: '', q: '' });
    function draw() {
      var q = U.plain(F.q);
      var list = docs.filter(function (d) {
        return (!F.g || !d.g || Number(d.g) === Number(F.g)) && (!F.s || !d.s || d.s === F.s) && (!q || U.plain(d.title + ' ' + (d.body || '')).indexOf(q) >= 0);
      }).sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
      U.$('#doclist').innerHTML = list.length ? list.map(function (d) {
        var act = d.kind === 'link' ? '<a class="btn sm primary" href="' + esc(d.url) + '" target="_blank" rel="noopener">' + icon('link') + 'Mở liên kết</a>' :
          d.kind === 'file' ? '<a class="btn sm primary" href="' + esc(d.url) + '" target="_blank" rel="noopener">' + icon('download') + 'Tải tệp' + (d.size ? ' (' + Math.ceil(d.size / 1024) + ' KB)' : '') + '</a>' :
            '<button class="btn sm primary" data-read="' + esc(d.id) + '">' + icon('eye') + 'Đọc</button>';
        return '<article class="doc"><span class="doc-ic ' + d.kind + '">' + icon(d.kind === 'link' ? 'link' : d.kind === 'file' ? 'file' : 'text') + '</span><div class="doc-main"><h3>' + esc(d.title) + '</h3>' +
          '<p class="tags"><span class="badge">' + esc(d.g ? gradeLabel(d.g) : 'Mọi lớp') + '</span>' + (d.s ? '<span class="badge" style="--c:' + SUBJ_COLOR[d.s] + '">' + esc(subjShort(d.s, d.g)) + '</span>' : '') + '<span class="muted small">' + esc(U.dt(d.at)) + '</span></p>' +
          (d.kind !== 'text' && d.body ? '<p class="muted">' + esc(d.body) + '</p>' : d.kind === 'text' ? '<p class="muted clamp">' + esc(String(d.body || '').replace(/\*\*/g, '').slice(0, 220)) + '</p>' : '') + '</div><div class="doc-act">' + act + '</div></article>';
      }).join('') : '<div class="empty">Không có tài liệu phù hợp bộ lọc.</div>';
      U.$$('[data-read]').forEach(function (b) {
        b.onclick = function () { var d = docs.find(function (x) { return x.id === b.getAttribute('data-read'); }); U.openModal({ title: d.title, wide: true, body: '<div class="prose">' + fmt(d.body) + '</div>' }); };
      });
    }
    var tab = App.S.docTab || 'docs';
    main.innerHTML = '<div class="page"><header class="page-head"><div><h1>Thư viện tài liệu</h1><p class="muted">Tài liệu do giáo viên chia sẻ và tin giáo dục tự cập nhật mỗi ngày.</p></div>' + (App.isAdmin() ? '<a class="btn primary" href="#admin" id="add-doc">' + icon('plus') + 'Thêm tài liệu</a>' : '') + '</header>' +
      '<div class="tabs"><button class="tab ' + (tab === 'docs' ? 'on' : '') + '" data-dt="docs">' + icon('folder') + 'Tài liệu học tập (' + docs.length + ')</button><button class="tab ' + (tab === 'news' ? 'on' : '') + '" data-dt="news">' + icon('rss') + 'Tin giáo dục</button></div>' +
      (tab === 'news' ? '<div class="filters"><div class="seg" id="src-seg">' + ['', 'VnExpress', 'Tuổi Trẻ', 'Thanh Niên'].map(function (x) { return '<button class="seg-btn ' + ((App.S.feedSrc || '') === x ? 'on' : '') + '" data-src-f="' + x + '">' + (x || 'Tất cả nguồn') + '</button>'; }).join('') + '</div></div><section class="card" id="feed-all"><div class="loading small">Đang tải tin…</div></section></div>' :

      '<div class="filters"><select class="input" id="df-g" aria-label="Lọc theo lớp">' + gradeOptions(F.g, true) + '</select><select class="input" id="df-s" aria-label="Lọc theo môn">' + subjOptions(F.s, true) + '</select>' +
      '<div class="searchbox">' + icon('search') + '<input class="input" id="df-q" placeholder="Tìm tài liệu" value="' + esc(F.q) + '" aria-label="Tìm tài liệu"></div></div><div id="doclist" class="doclist"></div></div>');
    U.$$('[data-dt]', main).forEach(function (b) { b.onclick = function () { App.S.docTab = b.getAttribute('data-dt'); App.rerender(); }; });
    if (tab === 'news') {
      U.$$('[data-src-f]', main).forEach(function (b) { b.onclick = function () { App.S.feedSrc = b.getAttribute('data-src-f'); U.$$('[data-src-f]', main).forEach(function (x) { x.classList.toggle('on', x === b); }); App.fillFeed(U.$('#feed-all'), 80, App.S.feedSrc); }; });
      App.fillFeed(U.$('#feed-all', main), 80, App.S.feedSrc);
      return;
    }
    U.$('#df-g').onchange = function () { F.g = Number(this.value); draw(); };
    U.$('#df-s').onchange = function () { F.s = this.value; draw(); };
    U.$('#df-q').oninput = function () { F.q = this.value; draw(); };
    var ad = U.$('#add-doc'); if (ad) ad.onclick = function () { App.S.adminTab = 'docs'; };
    draw();
  };

  /* =============== KẾT QUẢ =============== */
  App.views.results = async function (main, alive) {
    var rows = await App.store.list('results');
    if (!alive()) return;
    var admin = App.isAdmin();
    var F = App.S.resF || (App.S.resF = { g: 0, s: '', kind: '', q: '' });
    rows.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
    function filtered() {
      var q = U.plain(F.q);
      return rows.filter(function (r) { return (!F.g || Number(r.g) === Number(F.g) || Number(r.ownerGrade) === Number(F.g)) && (!F.s || r.s === F.s) && (!F.kind || r.kind === F.kind) && (!q || U.plain((r.ownerName || '') + ' ' + (r.title || '')).indexOf(q) >= 0); });
    }
    function draw() {
      var list = filtered();
      var avg = list.length ? list.reduce(function (a, b) { return a + (b.score || 0); }, 0) / list.length : null;
      var bySubj = {};
      list.forEach(function (r) { if (!r.s) return; (bySubj[r.s] = bySubj[r.s] || []).push(r.score || 0); });
      var subjBars = SUBJ_KEYS.filter(function (s) { return bySubj[s]; }).map(function (s) { var a = bySubj[s]; var v = a.reduce(function (x, y) { return x + y; }, 0) / a.length; return { label: subjShort(s, 6) + ' (' + a.length + ')', v: v, text: U.num(v, 2), color: SUBJ_COLOR[s] }; });
      U.$('#res-body').innerHTML = '<section class="kpis">' + kpi('Số bài', list.length, admin ? 'của tất cả học sinh' : 'đã làm') + kpi('Điểm trung bình', avg === null ? '–' : U.num(avg, 2), 'thang 10', avg === null ? '' : U.scoreClass(avg)) +
        kpi('Từ 8 điểm trở lên', list.filter(function (r) { return r.score >= 8; }).length, 'bài') + kpi('Dưới 5 điểm', list.filter(function (r) { return r.score < 5; }).length, 'bài cần ôn lại') + '</section>' +
        '<div class="cols"><section class="card"><h2>Diễn biến điểm (20 bài gần nhất)</h2>' + U.lineChart(list.slice(0, 20).reverse().map(function (r) { return { v: r.score || 0, label: U.dt(r.at) }; })) + '</section>' +
        '<section class="card"><h2>Điểm trung bình theo môn</h2>' + U.bars(subjBars, 10) + '</section></div>' +
        '<section class="card"><div class="card-head"><h2>Danh sách bài làm</h2>' + (admin ? '<button class="btn sm ghost" id="res-csv">' + icon('download') + 'Xuất CSV</button>' : '') + '</div><div class="table-wrap"><table class="table"><thead><tr>' + (admin ? '<th>Học sinh</th><th>Lớp</th>' : '') + '<th>Bài</th><th>Loại</th><th class="num">Đúng</th><th class="num">Điểm</th><th class="num">Thời gian</th><th>Ngày</th><th></th></tr></thead><tbody>' +
        (list.length ? list.slice(0, 300).map(function (r) {
          return '<tr>' + (admin ? '<td>' + esc(r.ownerName || '') + '</td><td>' + esc(r.ownerGrade || '') + '</td>' : '') + '<td>' + esc(r.title || '') + '</td><td><span class="badge ' + (r.kind === 'exam' ? 'exam' : '') + '">' + kindLabel(r.kind) + '</span></td><td class="num">' + (r.correct || 0) + '/' + (r.count || 0) + '</td><td class="num"><span class="score ' + U.scoreClass(r.score || 0) + '">' + U.num(r.score, 2) + '</span></td><td class="num">' + U.dur(r.duration) + '</td><td>' + esc(U.dt(r.at, true)) + '</td><td>' + (r.detail && r.detail.length && (r.kind === 'practice' || r.kind === 'exam') ? '<button class="linkish" data-rev="' + esc(r.id) + '">Xem lại</button>' : '') + '</td></tr>';
        }).join('') : '<tr><td colspan="9" class="empty small">Chưa có bài làm nào.</td></tr>') + '</tbody></table></div></section>';
      U.$$('[data-rev]').forEach(function (b) { b.onclick = function () { App.reviewResult(rows.find(function (r) { return r.id === b.getAttribute('data-rev'); })); }; });
      var cv = U.$('#res-csv');
      if (cv) cv.onclick = function () {
        U.textModal('Xuất kết quả (CSV)', U.csv([['Học sinh', 'Lớp', 'Bài', 'Loại', 'Số câu đúng', 'Tổng số câu', 'Điểm', 'Thời gian (giây)', 'Ngày làm']].concat(list.map(function (r) { return [r.ownerName, r.ownerGrade, r.title, kindLabel(r.kind), r.correct, r.count, String(r.score).replace('.', ','), r.duration, U.dt(r.at, true)]; }))), 'ket-qua.csv');
      };
    }
    main.innerHTML = '<div class="page"><header class="page-head"><div><h1>' + (admin ? 'Kết quả học tập của học sinh' : 'Kết quả của em') + '</h1><p class="muted">Điểm quy về thang 10 theo cách tính của đề thi tốt nghiệp THPT từ năm 2025.</p></div></header>' +
      '<div class="filters">' + (admin ? '<select class="input" id="rf-g" aria-label="Lọc theo lớp">' + gradeOptions(F.g, true) + '</select>' : '') + '<select class="input" id="rf-s" aria-label="Lọc theo môn">' + subjOptions(F.s, true) + '</select>' +
      '<select class="input" id="rf-k" aria-label="Lọc theo loại bài"><option value="">Mọi loại bài</option><option value="practice"' + (F.kind === 'practice' ? ' selected' : '') + '>Luyện tập</option><option value="exam"' + (F.kind === 'exam' ? ' selected' : '') + '>Đề thi</option><option value="drill"' + (F.kind === 'drill' ? ' selected' : '') + '>Tính nhẩm</option><option value="vocab"' + (F.kind === 'vocab' ? ' selected' : '') + '>Từ vựng</option></select>' +
      (admin ? '<div class="searchbox">' + icon('search') + '<input class="input" id="rf-q" placeholder="Tìm học sinh hoặc tên bài" value="' + esc(F.q) + '" aria-label="Tìm"></div>' : '') + '</div><div id="res-body"></div></div>';
    var gsel = U.$('#rf-g'); if (gsel) gsel.onchange = function () { F.g = Number(this.value); draw(); };
    U.$('#rf-s').onchange = function () { F.s = this.value; draw(); };
    U.$('#rf-k').onchange = function () { F.kind = this.value; draw(); };
    var qi = U.$('#rf-q'); if (qi) qi.oninput = function () { F.q = this.value; draw(); };
    draw();
  };
  function kindLabel(k) { return k === 'exam' ? 'Đề thi' : k === 'drill' ? 'Tính nhẩm' : k === 'vocab' ? 'Từ vựng' : 'Luyện tập'; }
  App.kindLabel = kindLabel;

  /* =============== XẾP HẠNG =============== */
  App.views.rank = async function (main, alive) {
    var rows = await App.store.leaderboard();
    if (!alive()) return;
    var F = App.S.rankF || (App.S.rankF = { g: App.isAdmin() ? 0 : (App.user.grade || 0), period: 30 });
    function draw() {
      var since = F.period ? Date.now() - F.period * 86400000 : 0;
      var list = rows.filter(function (u) { return !F.g || Number(u.grade) === Number(F.g); }).map(function (u) {
        var it = u.items.filter(function (x) { return new Date(x.at).getTime() >= since; });
        var sum = it.reduce(function (a, b) { return a + (b.score || 0); }, 0);
        return { id: u.id, name: u.fullname, grade: u.grade, n: it.length, avg: it.length ? sum / it.length : 0, best: it.reduce(function (a, b) { return Math.max(a, b.score || 0); }, 0) };
      }).filter(function (x) { return x.n > 0; }).sort(function (a, b) { return b.avg - a.avg || b.n - a.n; });
      var busy = list.slice().sort(function (a, b) { return b.n - a.n; }).slice(0, 5);
      U.$('#rank-body').innerHTML = '<div class="cols wide-left"><section class="card"><h2>Bảng điểm trung bình</h2><div class="table-wrap"><table class="table"><thead><tr><th>Hạng</th><th>Học sinh</th><th>Lớp</th><th class="num">Số bài</th><th class="num">Điểm TB</th><th class="num">Cao nhất</th></tr></thead><tbody>' +
        (list.length ? list.slice(0, 100).map(function (x, i) {
          return '<tr class="' + (x.id === App.user.id ? 'me-row' : '') + '"><td><span class="rank r' + (i + 1) + '">' + (i + 1) + '</span></td><td>' + esc(x.name) + (x.id === App.user.id ? ' <span class="badge">Em</span>' : '') + '</td><td>' + esc(x.grade) + '</td><td class="num">' + x.n + '</td><td class="num"><b>' + U.num(x.avg, 2) + '</b></td><td class="num">' + U.num(x.best, 2) + '</td></tr>';
        }).join('') : '<tr><td colspan="6" class="empty small">Chưa có ai làm bài trong khoảng thời gian này.</td></tr>') + '</tbody></table></div></section>' +
        '<section class="card"><h2>Chăm chỉ nhất</h2>' + U.bars(busy.map(function (x) { return { label: x.name, v: x.n, text: x.n + ' bài' }; })) + '<p class="muted small">Tính theo số bài đã làm trong khoảng thời gian đã chọn.</p></section></div>';
    }
    main.innerHTML = '<div class="page"><header class="page-head"><div><h1>Bảng xếp hạng</h1><p class="muted">Xếp theo điểm trung bình các bài luyện tập, đề thi, tính nhẩm và từ vựng.</p></div></header>' +
      '<div class="filters"><select class="input" id="kf-g" aria-label="Lớp">' + gradeOptions(F.g, true) + '</select><div class="seg" role="group" aria-label="Khoảng thời gian">' +
      [[7, '7 ngày'], [30, '30 ngày'], [0, 'Tất cả']].map(function (p) { return '<button class="seg-btn ' + (F.period === p[0] ? 'on' : '') + '" data-p="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div></div><div id="rank-body"></div></div>';
    U.$('#kf-g').onchange = function () { F.g = Number(this.value); draw(); };
    U.$$('[data-p]', main).forEach(function (b) { b.onclick = function () { F.period = Number(b.getAttribute('data-p')); U.$$('[data-p]', main).forEach(function (x) { x.classList.toggle('on', x === b); }); draw(); }; });
    draw();
  };

  /* =============== TÀI KHOẢN =============== */
  function installCard() {
    return '<section class="card"><h2>' + icon('phone') + 'Cài trang lên điện thoại, máy tính</h2><p class="muted">Cài một lần để mở nhanh như ứng dụng, xem lại bài đã mở cả khi mất mạng.</p>' +
      (App.installPrompt ? '<div><button class="btn primary" id="btn-install">' + icon('download') + 'Cài đặt ngay</button></div>' : '') +
      '<ul class="facts small"><li><span>Điện thoại Android (Chrome)</span><b>Menu ⋮ → Thêm vào màn hình chính</b></li><li><span>iPhone, iPad (Safari)</span><b>Nút Chia sẻ → Thêm vào MH chính</b></li><li><span>Máy tính (Chrome, Edge, Cốc Cốc)</span><b>Biểu tượng cài đặt ở cuối thanh địa chỉ</b></li></ul></section>';
  }
  function bindInstall(main) {
    var b = U.$('#btn-install', main);
    if (b) b.onclick = async function () { try { App.installPrompt.prompt(); await App.installPrompt.userChoice; App.installPrompt = null; b.remove(); } catch (e) { App.fail(e); } };
  }
  function themeCard() {
    return '<section class="card"><h2>Giao diện</h2><p class="muted">Chọn nền sáng, nền tối hoặc tự động theo cài đặt của thiết bị. Nút đổi nhanh luôn có ở thanh bên (trên điện thoại: góc trên bên phải).</p><div class="seg" role="group" aria-label="Chế độ màu">' + [['light', 'Sáng'], ['dark', 'Tối'], ['auto', 'Tự động']].map(function (t) { return '<button class="seg-btn ' + (App.theme() === t[0] ? 'on' : '') + '" data-th="' + t[0] + '">' + icon(THEME_ICON[t[0]]) + ' ' + t[1] + '</button>'; }).join('') + '</div></section>';
  }
  function aboutCard() {
    return '<section class="card"><h2>Về trang web</h2><ul class="facts"><li><span>Năm học</span><b>' + esc(D.schoolYear) + '</b></li><li><span>Học liệu</span><b>' + D.stats.chapters + ' chương/chủ đề · ' + D.stats.points + ' ý kiến thức</b></li><li><span>Ngân hàng câu hỏi có sẵn</span><b>' + D.stats.questions + ' câu</b></li><li><span>Từ vựng Tiếng Anh</span><b>' + D.stats.words + ' từ</b></li></ul></section>';
  }
  App.views.account = async function (main) {
    if (App.isGuest()) return guestAccount(main);
    var u = App.user, local = App.store.mode === 'local';
    main.innerHTML = '<div class="page narrow"><header class="page-head"><div><h1>Tài khoản</h1><p class="muted">' + esc(u.username) + ' · ' + (u.role === 'admin' ? 'Quản trị viên' : 'Học sinh') + '</p></div></header>' +
      '<section class="card"><h2>Thông tin cá nhân</h2><form id="f-prof" class="stack"><div class="row2"><label class="field"><span>Họ và tên</span><input class="input" id="pf-n" value="' + esc(u.fullname) + '" required></label>' +
      '<label class="field"><span>Lớp</span><select class="input" id="pf-g">' + gradeOptions(u.grade, true) + '</select></label></div><div><button class="btn primary" type="submit">Lưu thông tin</button></div></form></section>' +
      '<section class="card"><h2>Đổi mật khẩu</h2><form id="f-pw" class="stack"><div class="row2"><label class="field"><span>Mật khẩu hiện tại</span><input class="input" type="password" id="pw-o" required autocomplete="current-password"></label>' +
      '<label class="field"><span>Mật khẩu mới</span><input class="input" type="password" id="pw-n" required autocomplete="new-password"></label></div><div><button class="btn primary" type="submit">Đổi mật khẩu</button></div></form></section>' +
      themeCard() + installCard() +
      '<section class="card"><h2>Về trang web</h2><ul class="facts"><li><span>Năm học</span><b>' + esc(D.schoolYear) + '</b></li><li><span>Học liệu</span><b>' + D.stats.chapters + ' chương/chủ đề · ' + D.stats.points + ' ý kiến thức</b></li><li><span>Ngân hàng câu hỏi có sẵn</span><b>' + D.stats.questions + ' câu</b></li><li><span>Từ vựng Tiếng Anh</span><b>' + D.stats.words + ' từ</b></li>' +
      '<li><span>Chế độ lưu dữ liệu</span><b>' + (local ? 'Bản dùng thử (trình duyệt này)' : 'Máy chủ') + '</b></li></ul>' +
      (local ? '<div class="callout warn"><b>Đây là bản dùng thử.</b> Tài khoản và bài làm chỉ lưu trong trình duyệt bạn đang mở, máy khác không thấy. Để học sinh đăng nhập từ mọi nơi, hãy chạy bộ mã nguồn kèm theo (tệp <code>server.js</code>) theo hướng dẫn trong tệp <code>HUONG-DAN.md</code>.' + (App.storageOk ? '' : '<br>Trình duyệt này đang chặn lưu trữ nên dữ liệu sẽ mất khi tải lại trang.') + '</div><button class="btn danger ghost" id="btn-reset">' + icon('reset') + 'Xóa dữ liệu dùng thử và bắt đầu lại</button>' : '') +
      '</section></div>';
    U.$('#f-prof').onsubmit = async function (e) { e.preventDefault(); try { App.user = await App.store.updateMe({ fullname: U.$('#pf-n').value, grade: U.$('#pf-g').value }); U.toast('Đã lưu thông tin.', 'ok'); renderShell(U.$('#app')); route(); } catch (er) { App.fail(er); } };
    U.$('#f-pw').onsubmit = async function (e) { e.preventDefault(); try { await App.store.updateMe({ oldPassword: U.$('#pw-o').value, newPassword: U.$('#pw-n').value }); U.toast('Đã đổi mật khẩu.', 'ok'); this.reset(); } catch (er) { App.fail(er); } };
    U.$$('[data-th]', main).forEach(function (b) { b.onclick = function () { App.setTheme(b.getAttribute('data-th')); }; });
    bindInstall(main);
    var rs = U.$('#btn-reset');
    if (rs) rs.onclick = async function () { if (await U.confirmBox('Xóa toàn bộ tài khoản, bài làm và nội dung đã thêm trong bản dùng thử?', 'Xóa hết', true)) { await App.store.resetDemo(); location.hash = ''; location.reload(); } };
  };

  function guestAccount(main) {
    var u = App.user;
    main.innerHTML = '<div class="page narrow"><header class="page-head"><div><h1>Hồ sơ học tập</h1><p class="muted">Bạn đang học với tư cách khách. Tiến độ, điểm luyện tập và ghi chú được lưu ngay trên thiết bị này.</p></div></header>' +
      '<section class="card"><h2>Tên và lớp</h2><form id="f-gp" class="stack"><div class="row2"><label class="field"><span>Tên hiển thị</span><input class="input" id="gp-n" value="' + esc(u.fullname === 'Bạn học' ? '' : u.fullname) + '" placeholder="Ví dụ: Minh An"></label>' +
      '<label class="field"><span>Lớp</span><select class="input" id="gp-g">' + gradeOptions(u.grade, true) + '</select></label></div><div><button class="btn primary" type="submit">Lưu</button></div></form></section>' +
      (App.server ? '<section class="card"><h2>Tài khoản học sinh</h2><p class="muted">Đăng nhập để làm đề thi giáo viên giao, lưu điểm trên mọi thiết bị và xem bảng xếp hạng.</p><div class="row-btns"><button class="btn primary" data-auth="login">Đăng nhập</button><button class="btn ghost" data-auth="reg">Đăng kí tài khoản</button></div></section>' : '') +
      themeCard() + installCard() +
      '<section class="card"><h2>Dữ liệu trên thiết bị này</h2><p class="muted">Xóa tiến độ học, điểm luyện tập, ghi chú và việc cần làm đã lưu trên trình duyệt này.</p><div><button class="btn danger ghost" id="gp-clear">' + icon('trash') + 'Xóa dữ liệu học tập trên máy này</button></div></section>' +
      aboutCard() + '</div>';
    U.$('#f-gp').onsubmit = async function (e) { e.preventDefault(); App.user = await App.store.updateMe({ fullname: U.$('#gp-n').value || 'Bạn học', grade: U.$('#gp-g').value }); App.S.learn = {}; U.toast('Đã lưu.', 'ok'); App.refreshShell(); };
    U.$$('[data-auth]', main).forEach(function (b) { b.onclick = function () { App.showAuth(b.getAttribute('data-auth')); }; });
    U.$$('[data-th]', main).forEach(function (b) { b.onclick = function () { App.setTheme(b.getAttribute('data-th')); }; });
    bindInstall(main);
    U.$('#gp-clear').onclick = async function () { if (await U.confirmBox('Xóa toàn bộ tiến độ, điểm và ghi chú đã lưu trên thiết bị này?', 'Xóa', true)) { await App.store.clearLocal(); App.progress = {}; App.user = await App.store.me(); U.toast('Đã xóa dữ liệu trên máy này.', 'ok'); App.refreshShell(); } };
  }

  /* ---------- Tự cập nhật: kiểm tra nội dung mới định kì ---------- */
  var syncTimer = null;
  function startSync() {
    clearInterval(syncTimer);
    if (!App.store.rev) return;
    tick(true);
    syncTimer = setInterval(tick, App.server ? 30000 : 5 * 60000);
  }
  App.startSync = startSync;
  document.addEventListener('visibilitychange', function () { if (!document.hidden && App.user) tick(); });
  async function tick(first) {
    if (first !== true && document.hidden) return;
    var r;
    try { r = await App.store.rev(); } catch (e) { return; }
    if (!r) return;
    if (first === true || App.rev === undefined) { App.rev = r.rev; App.revContent = r.content; App.feedAt = r.feedAt; return; }
    var feedChanged = !!r.feedAt && r.feedAt !== App.feedAt;
    var changed = r.rev !== App.rev;
    App.feedAt = r.feedAt;
    if (feedChanged) App.feed = null;
    if (changed) {
      if (r.content && App.revContent && r.content !== App.revContent) showUpdateBar();
      try { if (App.Lessons) App.Lessons.reset(); if (App.store.reloadSite && !App.server) await App.store.reloadSite(); App.settings = await App.store.getSettings(); } catch (e) { /* bỏ qua */ }
      App.rev = r.rev; App.revContent = r.content || App.revContent;
    }
    if (changed || feedChanged) softRefresh(changed ? 'Trang vừa có tài liệu, thông báo mới.' : 'Đã có tin giáo dục mới.');
  }
  App.tick = tick;
  function softRefresh(msg) {
    var name = (location.hash || '#home').slice(1) || 'home';
    var busy = document.querySelector('.modal-back') || (App.S.run && !App.S.run.result) || (document.activeElement && /input|textarea|select/i.test(document.activeElement.tagName));
    if (!busy && ['home', 'learn', 'docs', 'exams'].indexOf(name) >= 0) route(true);
    U.toast(msg, 'ok');
  }
  function showUpdateBar() {
    var b = U.$('#update-bar'); if (!b) return;
    b.hidden = false;
    b.innerHTML = '<span>Đã có phiên bản học liệu mới.</span><button class="btn sm primary" id="upd-reload">Tải lại trang</button>';
    U.$('#upd-reload').onclick = function () { location.reload(); };
  }

  /* ---------- Cài lên thiết bị, dùng ngoại tuyến ---------- */
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); App.installPrompt = e; });
  function registerSW() {
    try {
      if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || (window.BX_CONFIG && window.BX_CONFIG.noSW)) return;
      navigator.serviceWorker.register('sw.js').catch(function () { /* môi trường không cho phép */ });
    } catch (e) { /* bỏ qua */ }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
