/* Lớp lưu trữ dữ liệu.
   - Chế độ "server": chạy cùng server.js → tài khoản thật, dữ liệu dùng chung cho mọi máy.
   - Chế độ "local" (dùng thử): mọi dữ liệu lưu trong trình duyệt đang mở. */
(function () {
  'use strict';
  var ADMIN_WRITE = ['questions', 'exams', 'docs', 'lessons', 'news'];
  var OWN_ONLY = ['notes', 'todos', 'progress'];
  var COLS = ADMIN_WRITE.concat(['results']).concat(OWN_ONLY);
  var DEFAULT_SETTINGS = {
    siteName: 'Bảng Xanh',
    tagline: 'Học tập trực tuyến lớp 1 – 12',
    teacher: '',
    allowRegister: true,
    examName: 'Kỳ thi tốt nghiệp THPT 2027',
    examDate: '2027-06-11',
    exam10Name: 'Kỳ thi tuyển sinh vào lớp 10',
    exam10Date: '',
    feedEnabled: true
  };
  var CFG = window.BX_CONFIG || {};
  /* Đọc tệp dữ liệu đi kèm trang (bản công khai, bản dùng thử) */
  async function getJson(path) {
    var r = await fetch(path + (path.indexOf('?') < 0 ? '?t=' : '&t=') + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  async function staticFeed() {
    try { var j = await getJson('data/news.json'); return { updatedAt: j.updatedAt, items: j.items || [] }; } catch (e) { return { updatedAt: null, items: [] }; }
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function nowIso() { return new Date().toISOString(); }
  function err(msg) { var e = new Error(msg); e.userMessage = msg; return e; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function publicUser(u) {
    if (!u) return null;
    return { id: u.id, username: u.username, fullname: u.fullname, role: u.role, grade: u.grade, locked: !!u.locked, createdAt: u.createdAt, lastLogin: u.lastLogin || null };
  }
  function stripAnswers(q) { var c = clone(q); delete c.a; delete c.e; return c; }
  function allBankQuestions(custom) {
    var base = (window.HOCTAP_DATA && window.HOCTAP_DATA.questions) || [];
    return base.concat(custom || []);
  }

  /* ---------------- Lưu trữ cục bộ (bản dùng thử) ---------------- */
  var LS_KEY = 'bangxanh_db_v1', SS_KEY = 'bangxanh_session_v1';
  var memory = {};
  var storageOk = true;
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { storageOk = false; return memory[k] || null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { storageOk = false; memory[k] = v; } }
  function lsDel(k) { try { window.localStorage.removeItem(k); } catch (e) { delete memory[k]; } }

  async function hashPw(pw, salt) {
    var s = salt + ':' + pw;
    try {
      var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    } catch (e) {
      var h = 2166136261;
      for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return 'f' + (h >>> 0).toString(16);
    }
  }

  function LocalStore() { this.mode = 'local'; this.db = null; }
  LocalStore.prototype._save = function () { lsSet(LS_KEY, JSON.stringify(this.db)); };
  LocalStore.prototype._me = function () {
    var id = lsGet(SS_KEY);
    return id ? this.db.users.find(function (u) { return u.id === id && !u.locked; }) || null : null;
  };
  LocalStore.prototype._need = function (admin) {
    var me = this._me();
    if (!me) throw err('Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.');
    if (admin && me.role !== 'admin') throw err('Chỉ quản trị viên mới thực hiện được thao tác này.');
    return me;
  };
  LocalStore.prototype.init = async function () {
    var raw = lsGet(LS_KEY);
    if (raw) { try { this.db = JSON.parse(raw); } catch (e) { this.db = null; } }
    if (!this.db || !this.db.users) await this._seed();
    COLS.forEach(function (c) { if (!this.db.cols[c]) this.db.cols[c] = []; }, this);
    this.db.settings = Object.assign({}, DEFAULT_SETTINGS, this.db.settings || {});
    return { storageOk: storageOk };
  };
  LocalStore.prototype._seed = async function () {
    var db = { users: [], cols: {}, settings: Object.assign({}, DEFAULT_SETTINGS) };
    COLS.forEach(function (c) { db.cols[c] = []; });
    async function mk(username, pw, fullname, role, grade) {
      var salt = uid();
      db.users.push({ id: uid(), username: username, fullname: fullname, role: role, grade: grade, salt: salt, hash: await hashPw(pw, salt), createdAt: nowIso() });
    }
    await mk('admin', 'admin123', 'Quản trị viên', 'admin', 12);
    await mk('hocsinh', '123456', 'Nguyễn Minh An', 'student', 12);
    await mk('hocsinh9', '123456', 'Trần Thu Hà', 'student', 9);
    var adminId = db.users[0].id;
    db.cols.news.push({ id: uid(), owner: adminId, at: nowIso(), pinned: true, title: 'Chào mừng các em đến với lớp học trực tuyến', body: 'Năm học 2026–2027 cả nước dùng thống nhất bộ SGK **Kết nối tri thức với cuộc sống**. Học liệu trên trang được sắp xếp theo đúng mạch bài của bộ sách này.\nCác em vào mục **Học liệu** để ôn kiến thức, mục **Trắc nghiệm** để luyện tập và mục **Đề thi** để làm bài thầy cô giao.' });
    db.cols.exams.push({ id: uid(), owner: adminId, at: nowIso(), title: 'Kiểm tra 15 phút – Toán 12: Đạo hàm, Nguyên hàm, Tọa độ', g: 12, s: 'toan', minutes: 15, open: true, showAnswers: true, maxAttempts: 3, deadline: '', qids: pickIds(12, 'toan', 10) });
    db.cols.exams.push({ id: uid(), owner: adminId, at: nowIso(), title: 'Ôn tập Toán 9 – chuẩn bị thi vào lớp 10', g: 9, s: 'toan', minutes: 20, open: true, showAnswers: true, maxAttempts: 0, deadline: '', qids: pickIds(9, 'toan', 12) });
    db.cols.docs.push({ id: uid(), owner: adminId, at: nowIso(), title: 'Sách giáo khoa điện tử miễn phí (NXB Giáo dục Việt Nam)', g: 0, s: '', kind: 'link', url: 'https://taphuan.nxbgd.vn', body: 'Xem bản điện tử của bộ SGK Kết nối tri thức với cuộc sống, video và tài liệu tập huấn.' });
    db.cols.docs.push({ id: uid(), owner: adminId, at: nowIso(), title: 'Cổng thông tin Bộ Giáo dục và Đào tạo', g: 0, s: '', kind: 'link', url: 'https://moet.gov.vn', body: 'Văn bản, quy chế thi, thông báo chính thức của Bộ.' });
    db.cols.docs.push({ id: uid(), owner: adminId, at: nowIso(), title: 'Bảng công thức đạo hàm – nguyên hàm cơ bản', g: 12, s: 'toan', kind: 'text', url: '', body: '**Đạo hàm**\n(xⁿ)\' = n·xⁿ⁻¹ · (eˣ)\' = eˣ · (ln x)\' = 1/x · (sin x)\' = cos x · (cos x)\' = −sin x\n\n**Nguyên hàm**\n∫xⁿdx = xⁿ⁺¹/(n + 1) + C (n ≠ −1) · ∫dx/x = ln|x| + C · ∫eˣdx = eˣ + C · ∫cos x dx = sin x + C · ∫sin x dx = −cos x + C' });
    this.db = db;
    this._save();
  };
  function pickIds(g, s, n) {
    var qs = ((window.HOCTAP_DATA && window.HOCTAP_DATA.questions) || []).filter(function (q) { return q.g === g && q.s === s; });
    return qs.slice(0, n).map(function (q) { return q.id; });
  }
  LocalStore.prototype.me = async function () { return publicUser(this._me()); };
  LocalStore.prototype.needsSetup = async function () { return false; };
  LocalStore.prototype.login = async function (username, password) {
    var u = this.db.users.find(function (x) { return x.username.toLowerCase() === String(username).trim().toLowerCase(); });
    if (!u || u.hash !== await hashPw(password, u.salt)) throw err('Sai tên đăng nhập hoặc mật khẩu.');
    if (u.locked) throw err('Tài khoản đang bị khóa. Liên hệ giáo viên để mở khóa.');
    u.lastLogin = nowIso(); this._save();
    lsSet(SS_KEY, u.id);
    return publicUser(u);
  };
  LocalStore.prototype.logout = async function () { lsDel(SS_KEY); };
  LocalStore.prototype._validateNew = function (d) {
    var username = String(d.username || '').trim();
    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(username)) throw err('Tên đăng nhập 3–30 kí tự, chỉ gồm chữ không dấu, số, dấu chấm hoặc gạch dưới.');
    if (String(d.password || '').length < 6) throw err('Mật khẩu cần ít nhất 6 kí tự.');
    if (!String(d.fullname || '').trim()) throw err('Vui lòng nhập họ và tên.');
    if (this.db.users.some(function (u) { return u.username.toLowerCase() === username.toLowerCase(); })) throw err('Tên đăng nhập "' + username + '" đã có người dùng.');
    return username;
  };
  LocalStore.prototype._addUser = async function (d, role) {
    var username = this._validateNew(d);
    var salt = uid();
    var u = { id: uid(), username: username, fullname: String(d.fullname).trim(), role: role, grade: Number(d.grade) || 0, salt: salt, hash: await hashPw(d.password, salt), createdAt: nowIso() };
    this.db.users.push(u); this._save();
    return u;
  };
  LocalStore.prototype.register = async function (d) {
    if (!this.db.settings.allowRegister) throw err('Giáo viên đang tạm khóa chức năng tự đăng ký.');
    var u = await this._addUser(d, 'student');
    lsSet(SS_KEY, u.id);
    return publicUser(u);
  };
  LocalStore.prototype.updateMe = async function (patch) {
    var me = this._need();
    if (patch.fullname !== undefined) { if (!String(patch.fullname).trim()) throw err('Họ tên không được để trống.'); me.fullname = String(patch.fullname).trim(); }
    if (patch.grade !== undefined) me.grade = Number(patch.grade) || 0;
    if (patch.newPassword) {
      if (me.hash !== await hashPw(patch.oldPassword || '', me.salt)) throw err('Mật khẩu hiện tại không đúng.');
      if (String(patch.newPassword).length < 6) throw err('Mật khẩu mới cần ít nhất 6 kí tự.');
      me.salt = uid(); me.hash = await hashPw(patch.newPassword, me.salt);
    }
    this._save();
    return publicUser(me);
  };
  /* --- quản lí người dùng (quản trị) --- */
  LocalStore.prototype.users = async function () { this._need(true); return this.db.users.map(publicUser); };
  LocalStore.prototype.createUser = async function (d) { this._need(true); return publicUser(await this._addUser(d, d.role === 'admin' ? 'admin' : 'student')); };
  LocalStore.prototype.updateUser = async function (id, patch) {
    var me = this._need(true);
    var u = this.db.users.find(function (x) { return x.id === id; });
    if (!u) throw err('Không tìm thấy người dùng.');
    if (patch.fullname !== undefined) u.fullname = String(patch.fullname).trim() || u.fullname;
    if (patch.grade !== undefined) u.grade = Number(patch.grade) || 0;
    if (patch.role !== undefined && u.id !== me.id) u.role = patch.role === 'admin' ? 'admin' : 'student';
    if (patch.locked !== undefined && u.id !== me.id) u.locked = !!patch.locked;
    if (patch.password) { if (String(patch.password).length < 6) throw err('Mật khẩu cần ít nhất 6 kí tự.'); u.salt = uid(); u.hash = await hashPw(patch.password, u.salt); }
    this._save();
    return publicUser(u);
  };
  LocalStore.prototype.deleteUser = async function (id) {
    var me = this._need(true);
    if (id === me.id) throw err('Không thể tự xóa tài khoản đang đăng nhập.');
    this.db.users = this.db.users.filter(function (u) { return u.id !== id; });
    var cols = this.db.cols;
    ['results'].concat(OWN_ONLY).forEach(function (c) { cols[c] = cols[c].filter(function (r) { return r.owner !== id; }); });
    this._save();
  };
  /* --- bộ sưu tập dữ liệu chung --- */
  LocalStore.prototype.list = async function (col) {
    var me = this._need();
    var rows = this.db.cols[col] || [];
    if (OWN_ONLY.indexOf(col) >= 0) rows = rows.filter(function (r) { return r.owner === me.id; });
    if (col === 'results' && me.role !== 'admin') rows = rows.filter(function (r) { return r.owner === me.id; });
    if (col === 'exams' && me.role !== 'admin') rows = rows.filter(function (e) { return e.open && (!e.g || e.g === me.grade); }).map(function (e) { var c = clone(e); c.qcount = (c.qids || []).length; delete c.qids; return c; });
    if (col === 'questions' && me.role !== 'admin') rows = rows.filter(function (q) { return !q.hidden; });
    if (col === 'results' && me.role === 'admin') {
      var names = {}; this.db.users.forEach(function (u) { names[u.id] = u; });
      rows = rows.map(function (r) { var c = clone(r); var u = names[r.owner]; c.ownerName = u ? u.fullname : '(đã xóa)'; c.ownerGrade = u ? u.grade : 0; return c; });
    }
    return clone(rows);
  };
  LocalStore.prototype.create = async function (col, obj) {
    var me = this._need(ADMIN_WRITE.indexOf(col) >= 0);
    if (COLS.indexOf(col) < 0) throw err('Bộ dữ liệu không hợp lệ.');
    var row = Object.assign({}, obj, { id: uid(), owner: me.id, at: nowIso() });
    if (col === 'results') row.kind = row.kind === 'exam' ? 'practice' : (row.kind || 'practice');
    this.db.cols[col].push(row); this._save();
    return clone(row);
  };
  LocalStore.prototype.update = async function (col, id, patch) {
    var me = this._need(ADMIN_WRITE.indexOf(col) >= 0);
    var row = (this.db.cols[col] || []).find(function (r) { return r.id === id; });
    if (!row) throw err('Không tìm thấy dữ liệu.');
    if (OWN_ONLY.indexOf(col) >= 0 && row.owner !== me.id) throw err('Không có quyền sửa.');
    if (col === 'results') throw err('Không thể sửa kết quả bài làm.');
    Object.keys(patch).forEach(function (k) { if (['id', 'owner', 'at'].indexOf(k) < 0) row[k] = patch[k]; });
    row.updatedAt = nowIso(); this._save();
    return clone(row);
  };
  LocalStore.prototype.remove = async function (col, id) {
    var me = this._need();
    var rows = this.db.cols[col] || [];
    var row = rows.find(function (r) { return r.id === id; });
    if (!row) return;
    if (me.role !== 'admin' && (ADMIN_WRITE.indexOf(col) >= 0 || col === 'results' || row.owner !== me.id)) throw err('Không có quyền xóa.');
    this.db.cols[col] = rows.filter(function (r) { return r.id !== id; }); this._save();
  };
  /* --- đề thi --- */
  LocalStore.prototype._exam = function (id, me) {
    var e = this.db.cols.exams.find(function (x) { return x.id === id; });
    if (!e) throw err('Không tìm thấy đề thi.');
    if (me.role !== 'admin') {
      if (!e.open) throw err('Đề thi đang đóng.');
      if (e.g && e.g !== me.grade) throw err('Đề thi này dành cho lớp ' + e.g + '.');
      if (e.deadline && new Date(e.deadline) < new Date()) throw err('Đã hết hạn làm bài.');
      var used = this.db.cols.results.filter(function (r) { return r.owner === me.id && r.examId === id; }).length;
      if (e.maxAttempts && used >= e.maxAttempts) throw err('Em đã dùng hết ' + e.maxAttempts + ' lượt làm bài.');
    }
    return e;
  };
  LocalStore.prototype._questionsFor = function (ids) {
    var bank = allBankQuestions(this.db.cols.questions), map = {};
    bank.forEach(function (q) { map[q.id] = q; });
    return ids.map(function (i) { return map[i]; }).filter(Boolean);
  };
  LocalStore.prototype.examPaper = async function (id) {
    var me = this._need();
    var e = this._exam(id, me);
    var c = clone(e); delete c.qids;
    return { exam: c, questions: this._questionsFor(e.qids || []).map(stripAnswers) };
  };
  LocalStore.prototype.submitExam = async function (id, answers, duration) {
    var me = this._need();
    var e = this._exam(id, me);
    var qs = this._questionsFor(e.qids || []);
    var g = window.Grade.gradeAll(qs, answers || {});
    var row = { id: uid(), owner: me.id, at: nowIso(), kind: 'exam', examId: e.id, title: e.title, g: e.g || me.grade, s: e.s, score: g.score, correct: g.correct, count: g.count, earned: g.earned, total: g.total, duration: Math.max(0, Math.round(duration || 0)), detail: g.detail };
    this.db.cols.results.push(row); this._save();
    var out = clone(row);
    if (e.showAnswers || me.role === 'admin') out.questions = clone(qs);
    return out;
  };
  LocalStore.prototype.examReview = async function (resultId) {
    var me = this._need();
    var r = this.db.cols.results.find(function (x) { return x.id === resultId; });
    if (!r || (r.owner !== me.id && me.role !== 'admin')) throw err('Không tìm thấy bài làm.');
    var e = this.db.cols.exams.find(function (x) { return x.id === r.examId; });
    if (me.role !== 'admin' && e && !e.showAnswers) throw err('Giáo viên chưa cho xem đáp án của đề này.');
    return { result: clone(r), questions: this._questionsFor((r.detail || []).map(function (d) { return d.qid; })) };
  };
  LocalStore.prototype.leaderboard = async function () {
    this._need();
    var res = this.db.cols.results, users = this.db.users;
    return users.filter(function (u) { return u.role === 'student'; }).map(function (u) {
      var mine = res.filter(function (r) { return r.owner === u.id; });
      return { id: u.id, fullname: u.fullname, grade: u.grade, items: mine.map(function (r) { return { at: r.at, score: r.score, kind: r.kind }; }) };
    });
  };
  LocalStore.prototype.getSettings = async function () { return clone(this.db.settings); };
  LocalStore.prototype.saveSettings = async function (patch) {
    this._need(true);
    Object.keys(DEFAULT_SETTINGS).forEach(function (k) { if (patch[k] !== undefined) this.db.settings[k] = patch[k]; }, this);
    this._save();
    return clone(this.db.settings);
  };
  LocalStore.prototype.backup = async function () { this._need(true); return clone(this.db); };
  LocalStore.prototype.restore = async function (data) {
    this._need(true);
    if (!data || !Array.isArray(data.users) || !data.cols) throw err('Tệp sao lưu không đúng định dạng.');
    this.db = data; this._save();
  };
  LocalStore.prototype.upload = async function () { throw err('Tải tệp lên chỉ dùng được ở bản chạy máy chủ. Ở bản dùng thử, hãy dán đường liên kết (Google Drive, OneDrive…).'); };
  LocalStore.prototype.resetDemo = async function () { lsDel(LS_KEY); lsDel(SS_KEY); };
  LocalStore.prototype.feed = staticFeed;
  LocalStore.prototype.rev = async function () { try { var v = await getJson('data/version.json'); return { rev: v.content, feedAt: v.news }; } catch (e) { return null; } };

  /* ---------------- Máy chủ ---------------- */
  function ServerStore() { this.mode = 'server'; }
  async function api(method, path, body) {
    var opt = { method: method, headers: { 'X-Requested-With': 'bangxanh' }, credentials: 'same-origin' };
    if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    var r = await fetch('api/' + path, opt);
    var j = null;
    try { j = await r.json(); } catch (e) { j = {}; }
    if (!r.ok) throw err((j && j.error) || ('Máy chủ báo lỗi ' + r.status));
    return j;
  }
  ServerStore.prototype.init = async function () { return { storageOk: true }; };
  ServerStore.prototype.needsSetup = async function () { return (await api('GET', 'health')).needsSetup; };
  ServerStore.prototype.setup = async function (d) { return (await api('POST', 'setup', d)).user; };
  ServerStore.prototype.me = async function () { try { return (await api('GET', 'me')).user; } catch (e) { return null; } };
  ServerStore.prototype.login = async function (u, p) { return (await api('POST', 'login', { username: u, password: p })).user; };
  ServerStore.prototype.logout = async function () { await api('POST', 'logout', {}); };
  ServerStore.prototype.register = async function (d) { return (await api('POST', 'register', d)).user; };
  ServerStore.prototype.updateMe = async function (p) { return (await api('PUT', 'me', p)).user; };
  ServerStore.prototype.users = async function () { return (await api('GET', 'users')).users; };
  ServerStore.prototype.createUser = async function (d) { return (await api('POST', 'users', d)).user; };
  ServerStore.prototype.updateUser = async function (id, p) { return (await api('PUT', 'users/' + encodeURIComponent(id), p)).user; };
  ServerStore.prototype.deleteUser = async function (id) { await api('DELETE', 'users/' + encodeURIComponent(id)); };
  ServerStore.prototype.list = async function (col) { return (await api('GET', 'c/' + col)).rows; };
  ServerStore.prototype.create = async function (col, o) { return (await api('POST', 'c/' + col, o)).row; };
  ServerStore.prototype.update = async function (col, id, p) { return (await api('PUT', 'c/' + col + '/' + encodeURIComponent(id), p)).row; };
  ServerStore.prototype.remove = async function (col, id) { await api('DELETE', 'c/' + col + '/' + encodeURIComponent(id)); };
  ServerStore.prototype.examPaper = async function (id) { return await api('GET', 'exams/' + encodeURIComponent(id) + '/paper'); };
  ServerStore.prototype.submitExam = async function (id, a, d) { return (await api('POST', 'exams/' + encodeURIComponent(id) + '/submit', { answers: a, duration: d })).result; };
  ServerStore.prototype.examReview = async function (rid) { return await api('GET', 'results/' + encodeURIComponent(rid) + '/review'); };
  ServerStore.prototype.leaderboard = async function () { return (await api('GET', 'leaderboard')).rows; };
  ServerStore.prototype.getSettings = async function () { return (await api('GET', 'settings')).settings; };
  ServerStore.prototype.saveSettings = async function (p) { return (await api('PUT', 'settings', p)).settings; };
  ServerStore.prototype.backup = async function () { return (await api('GET', 'backup')).data; };
  ServerStore.prototype.restore = async function (d) { await api('POST', 'restore', { data: d }); };
  ServerStore.prototype.feed = async function () { return await api('GET', 'feed'); };
  ServerStore.prototype.rev = async function () { return await api('GET', 'rev'); };
  ServerStore.prototype.refreshFeed = async function () { return await api('POST', 'feed/refresh', {}); };
  ServerStore.prototype.upload = async function (file) {
    if (file.size > 20 * 1024 * 1024) throw err('Tệp quá lớn (tối đa 20 MB).');
    var dataUrl = await new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(fr.result); }; fr.onerror = rej; fr.readAsDataURL(file); });
    return (await api('POST', 'upload', { name: file.name, type: file.type, data: String(dataUrl).split(',')[1] })).file;
  };

  /* ---------------- Khách / bản công khai ----------------
     Ai cũng vào học được, không cần tài khoản. Nội dung chung (học liệu, tài liệu, thông báo, đề thi)
     lấy từ máy chủ (nếu có) hoặc từ tệp data/site-data.json; tiến độ, điểm, ghi chú lưu trên thiết bị. */
  var PRIVATE = ['results', 'notes', 'todos', 'progress'];
  var PK = 'bangxanh_guest_';
  function gGet(k, def) { var v = lsGet(PK + k); if (!v) return def; try { return JSON.parse(v); } catch (e) { return def; } }
  function gSet(k, v) { lsSet(PK + k, JSON.stringify(v)); }
  function PublicStore(server) { this.mode = server ? 'server' : 'public'; this.guest = true; this.server = server || null; this.site = null; }
  PublicStore.prototype.init = async function () {
    if (!this.server) await this.reloadSite();
    return { storageOk: storageOk };
  };
  PublicStore.prototype.reloadSite = async function () {
    try { this.site = await getJson('data/site-data.json'); } catch (e) { this.site = window.BX_SITE || this.site || {}; }
    this.site = this.site || {};
    ['news', 'docs', 'lessons', 'exams', 'questions'].forEach(function (k) { if (!Array.isArray(this.site[k])) this.site[k] = []; }, this);
  };
  PublicStore.prototype.needsSetup = async function () { return false; };
  PublicStore.prototype.me = async function () {
    var p = gGet('profile', {});
    return { id: 'guest', username: '', fullname: p.fullname || 'Bạn học', role: 'guest', grade: Number(p.grade) || 0, guest: true };
  };
  PublicStore.prototype.updateMe = async function (patch) {
    var p = gGet('profile', {});
    if (patch.fullname !== undefined) p.fullname = String(patch.fullname).trim().slice(0, 60);
    if (patch.grade !== undefined) p.grade = Number(patch.grade) || 0;
    gSet('profile', p);
    return this.me();
  };
  PublicStore.prototype.logout = async function () { /* khách không có phiên */ };
  PublicStore.prototype.list = async function (col) {
    if (PRIVATE.indexOf(col) >= 0) return clone(gGet(col, []));
    if (this.server) return this.server.list(col);
    var rows = clone(this.site[col] || []);
    if (col === 'exams') rows = rows.filter(function (e) { return e.open !== false; }).map(function (e) { e.qcount = (e.qids || []).length; return e; });
    if (col === 'questions') rows = rows.filter(function (q) { return !q.hidden; });
    return rows;
  };
  PublicStore.prototype.create = async function (col, obj) {
    if (PRIVATE.indexOf(col) < 0) throw err('Chỉ giáo viên mới thêm được nội dung này.');
    var rows = gGet(col, []);
    var row = Object.assign({}, obj, { id: uid(), owner: 'guest', at: nowIso() });
    if (col === 'results' && row.kind === 'exam' && !row.examId) row.kind = 'practice';
    rows.push(row);
    if (col === 'results' && rows.length > 400) rows = rows.slice(-400);
    gSet(col, rows);
    return clone(row);
  };
  PublicStore.prototype.update = async function (col, id, patch) {
    if (PRIVATE.indexOf(col) < 0) throw err('Chỉ giáo viên mới sửa được nội dung này.');
    var rows = gGet(col, []), row = rows.find(function (r) { return r.id === id; });
    if (!row) throw err('Không tìm thấy dữ liệu.');
    Object.keys(patch).forEach(function (k) { if (['id', 'owner', 'at'].indexOf(k) < 0) row[k] = patch[k]; });
    row.updatedAt = nowIso(); gSet(col, rows);
    return clone(row);
  };
  PublicStore.prototype.remove = async function (col, id) {
    if (PRIVATE.indexOf(col) < 0) throw err('Chỉ giáo viên mới xóa được nội dung này.');
    gSet(col, gGet(col, []).filter(function (r) { return r.id !== id; }));
  };
  PublicStore.prototype._bank = function () { return allBankQuestions(this.site ? this.site.questions : []); };
  PublicStore.prototype._exam = function (id) {
    if (this.server) throw err('Em cần đăng nhập để làm đề thi của giáo viên.');
    var e = (this.site.exams || []).find(function (x) { return x.id === id; });
    if (!e || e.open === false) throw err('Không tìm thấy đề thi.');
    return e;
  };
  PublicStore.prototype._qs = function (ids) { var map = {}; this._bank().forEach(function (q) { map[q.id] = q; }); return (ids || []).map(function (i) { return map[i]; }).filter(Boolean); };
  PublicStore.prototype.examPaper = async function (id) {
    var e = this._exam(id), c = clone(e); delete c.qids;
    return { exam: c, questions: this._qs(e.qids).map(stripAnswers) };
  };
  PublicStore.prototype.submitExam = async function (id, answers, duration) {
    var e = this._exam(id), qs = this._qs(e.qids);
    var g = window.Grade.gradeAll(qs, answers || {});
    var row = await this.create('results', { kind: 'exam', examId: e.id, title: e.title, g: e.g, s: e.s, score: g.score, correct: g.correct, count: g.count, earned: g.earned, total: g.total, duration: Math.max(0, Math.round(duration || 0)), detail: g.detail });
    if (e.showAnswers !== false) row.questions = clone(qs);
    return row;
  };
  PublicStore.prototype.examReview = async function (rid) {
    var r = gGet('results', []).find(function (x) { return x.id === rid; });
    if (!r) throw err('Không tìm thấy bài làm.');
    return { result: clone(r), questions: this._qs((r.detail || []).map(function (d) { return d.qid; })) };
  };
  PublicStore.prototype.leaderboard = async function () { return []; };
  PublicStore.prototype.getSettings = async function () {
    if (this.server) return this.server.getSettings();
    return Object.assign({}, DEFAULT_SETTINGS, (this.site && this.site.settings) || {});
  };
  PublicStore.prototype.feed = async function () { return this.server ? this.server.feed() : staticFeed(); };
  PublicStore.prototype.rev = async function () {
    if (this.server) return this.server.rev();
    try { var v = await getJson('data/version.json'); return { rev: v.content + '|' + v.site + '|' + (v.lessons || ''), content: v.content, site: v.site, feedAt: v.news }; } catch (e) { return null; }
  };
  PublicStore.prototype.clearLocal = async function () { PRIVATE.concat(['profile']).forEach(function (k) { lsDel(PK + k); }); };
  PublicStore.prototype.upload = async function () { throw err('Chỉ giáo viên mới tải tệp lên được.'); };

  /* ---------------- Chọn chế độ ---------------- */
  async function detect() {
    if (CFG.edition === 'public') return new PublicStore(null);
    if (location.protocol === 'file:') return new LocalStore();
    try {
      var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var t = setTimeout(function () { if (ctl) ctl.abort(); }, 2500);
      var r = await fetch('api/health', { credentials: 'same-origin', signal: ctl ? ctl.signal : undefined });
      clearTimeout(t);
      if (r.ok) { var j = await r.json(); if (j && j.app === 'bangxanh') return new ServerStore(); }
    } catch (e) { /* không có máy chủ */ }
    return CFG.edition === 'demo' ? new LocalStore() : new PublicStore(null);
  }
  window.BXStore = { detect: detect, DEFAULT_SETTINGS: DEFAULT_SETTINGS, allBankQuestions: allBankQuestions, uid: uid, PublicStore: PublicStore, LocalStore: LocalStore };
})();
