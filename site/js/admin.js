/* Trang quản trị dành cho giáo viên */
(function () {
  'use strict';
  var U = window.UI, App = window.App, esc = U.esc, fmt = U.fmt, icon = U.icon;
  var TABS = [
    ['overview', 'Tổng quan', 'chart'], ['users', 'Người dùng', 'users'], ['questions', 'Ngân hàng câu hỏi', 'quiz'], ['exams', 'Đề thi', 'exam'],
    ['docs', 'Tài liệu', 'folder'], ['lessons', 'Bài giảng', 'book'], ['news', 'Thông báo', 'bell'], ['settings', 'Cài đặt & sao lưu', 'settings']
  ];

  App.views.admin = async function (main, alive) {
    if (!App.isAdmin()) { App.go('home'); return; }
    var tab = App.S.adminTab || 'overview';
    main.innerHTML = '<div class="page"><header class="page-head"><div><h1>Quản trị</h1><p class="muted">Quản lí học sinh, câu hỏi, đề thi và nội dung của trang.</p></div></header>' +
      '<div class="tabs admin-tabs" role="tablist">' + TABS.map(function (t) { return '<button class="tab ' + (t[0] === tab ? 'on' : '') + '" data-at="' + t[0] + '">' + icon(t[2]) + t[1] + '</button>'; }).join('') + '</div><div id="admin-body"><div class="loading">Đang tải…</div></div></div>';
    U.$$('[data-at]', main).forEach(function (b) { b.onclick = function () { App.S.adminTab = b.getAttribute('data-at'); App.rerender(); }; });
    var body = U.$('#admin-body');
    await TAB[tab](body, alive);
  };
  function reload() { App.rerender(); }

  /* ---------- Tổng quan ---------- */
  function columns(items) {
    var max = Math.max.apply(null, items.map(function (i) { return i.v; }).concat([1]));
    return '<div class="cols-chart" role="img" aria-label="Số bài làm theo ngày">' + items.map(function (it) {
      return '<div class="cc"><span class="cc-v">' + (it.v || '') + '</span><span class="cc-bar" style="height:' + Math.max(2, it.v / max * 100) + '%"></span><span class="cc-l">' + esc(it.label) + '</span></div>';
    }).join('') + '</div>';
  }
  async function tabOverview(el, alive) {
    var r = await Promise.all([App.store.users(), App.store.list('results'), App.store.list('exams'), App.store.list('questions')]);
    if (!alive()) return;
    var users = r[0], res = r[1], exams = r[2], qs = r[3];
    var students = users.filter(function (u) { return u.role === 'student'; });
    var wk = Date.now() - 7 * 86400000;
    var res7 = res.filter(function (x) { return new Date(x.at).getTime() >= wk; });
    var avg7 = res7.length ? res7.reduce(function (a, b) { return a + (b.score || 0); }, 0) / res7.length : null;
    var days = [];
    for (var i = 13; i >= 0; i--) {
      var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      var e = new Date(d); e.setDate(e.getDate() + 1);
      days.push({ label: U.pad(d.getDate()) + '/' + U.pad(d.getMonth() + 1), v: res.filter(function (x) { var t = new Date(x.at); return t >= d && t < e; }).length });
    }
    var byGrade = {};
    students.forEach(function (s) { byGrade[s.grade] = (byGrade[s.grade] || 0) + 1; });
    var active = {};
    res7.forEach(function (x) { active[x.owner] = active[x.owner] || { name: x.ownerName, n: 0, sum: 0 }; active[x.owner].n++; active[x.owner].sum += x.score || 0; });
    var top = Object.keys(active).map(function (k) { return active[k]; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 6);
    var weak = students.filter(function (s) { return !res.some(function (x) { return x.owner === s.id && new Date(x.at).getTime() >= wk; }); });
    el.innerHTML = '<section class="kpis">' + App.kpi('Học sinh', students.length, users.filter(function (u) { return u.locked; }).length + ' tài khoản đang khóa') +
      App.kpi('Bài làm 7 ngày qua', res7.length, 'tổng cộng ' + res.length + ' bài') + App.kpi('Điểm TB 7 ngày', avg7 === null ? '–' : U.num(avg7, 2), 'thang 10', avg7 === null ? '' : U.scoreClass(avg7)) +
      App.kpi('Đề thi đang mở', exams.filter(function (x) { return x.open; }).length, exams.length + ' đề đã tạo') + '</section>' +
      '<div class="cols"><section class="card"><h2>Số bài làm 14 ngày gần đây</h2>' + columns(days) + '</section>' +
      '<section class="card"><h2>Học sinh theo lớp</h2>' + U.bars(Object.keys(byGrade).sort(function (a, b) { return a - b; }).map(function (g) { return { label: 'Lớp ' + g, v: byGrade[g], text: byGrade[g] + ' em' }; })) + '</section></div>' +
      '<div class="cols"><section class="card"><h2>Tích cực nhất 7 ngày</h2>' + (top.length ? '<ul class="plain-list">' + top.map(function (t) { return '<li class="pl-row"><span class="avatar sm">' + esc(App.initials(t.name)) + '</span><span><b>' + esc(t.name) + '</b><small>' + t.n + ' bài · điểm TB ' + U.num(t.sum / t.n, 2) + '</small></span></li>'; }).join('') + '</ul>' : '<div class="empty small">Chưa có bài làm trong tuần.</div>') + '</section>' +
      '<section class="card"><h2>Chưa làm bài trong 7 ngày</h2>' + (weak.length ? '<p class="muted small">' + weak.length + ' học sinh cần nhắc nhở:</p><p>' + weak.slice(0, 30).map(function (s) { return '<span class="badge">' + esc(s.fullname) + ' · ' + s.grade + '</span>'; }).join(' ') + '</p>' : '<div class="empty small">Tất cả học sinh đều đã làm bài.</div>') + '</section></div>' +
      '<section class="card"><div class="card-head"><h2>Ngân hàng câu hỏi</h2></div><p>' + App.D.questions.length + ' câu có sẵn · <b>' + qs.length + '</b> câu giáo viên tự thêm.</p><button class="btn ghost sm" data-goto="questions">Quản lí câu hỏi</button></section>';
    U.$$('[data-goto]', el).forEach(function (b) { b.onclick = function () { App.S.adminTab = b.getAttribute('data-goto'); reload(); }; });
  }

  /* ---------- Người dùng ---------- */
  var UF = { q: '', g: 0, role: '' };
  async function tabUsers(el, alive) {
    var users = await App.store.users();
    if (!alive()) return;
    function draw() {
      var q = U.plain(UF.q);
      var list = users.filter(function (u) { return (!UF.g || Number(u.grade) === UF.g) && (!UF.role || u.role === UF.role) && (!q || U.plain(u.fullname + ' ' + u.username).indexOf(q) >= 0); })
        .sort(function (a, b) { return (a.role === 'admin' ? 0 : 1) - (b.role === 'admin' ? 0 : 1) || (a.grade - b.grade) || a.fullname.localeCompare(b.fullname, 'vi'); });
      U.$('#u-table').innerHTML = '<table class="table"><thead><tr><th>Họ và tên</th><th>Tên đăng nhập</th><th>Vai trò</th><th>Lớp</th><th>Đăng nhập gần nhất</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
        list.map(function (u) {
          return '<tr><td><b>' + esc(u.fullname) + '</b></td><td class="mono">' + esc(u.username) + '</td><td>' + (u.role === 'admin' ? '<span class="pill green">Quản trị</span>' : 'Học sinh') + '</td><td>' + esc(u.grade || '–') + '</td><td>' + esc(u.lastLogin ? U.dt(u.lastLogin, true) : 'Chưa') + '</td><td>' + (u.locked ? '<span class="pill red">Đã khóa</span>' : '<span class="pill gray">Hoạt động</span>') + '</td>' +
            '<td class="acts"><button class="icon-btn" title="Sửa" aria-label="Sửa" data-ue="' + u.id + '">' + icon('edit') + '</button><button class="icon-btn" title="Đặt lại mật khẩu" aria-label="Đặt lại mật khẩu" data-up="' + u.id + '">' + icon('key') + '</button>' +
            (u.id !== App.user.id ? '<button class="icon-btn" title="' + (u.locked ? 'Mở khóa' : 'Khóa') + '" aria-label="' + (u.locked ? 'Mở khóa' : 'Khóa') + '" data-ul="' + u.id + '">' + icon(u.locked ? 'unlock' : 'lock') + '</button><button class="icon-btn danger" title="Xóa" aria-label="Xóa" data-ud="' + u.id + '">' + icon('trash') + '</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table>' + (list.length ? '' : '<div class="empty small">Không có người dùng phù hợp.</div>');
      U.$$('[data-ue]').forEach(function (b) { b.onclick = function () { userForm(users.find(function (u) { return u.id === b.getAttribute('data-ue'); })); }; });
      U.$$('[data-up]').forEach(function (b) { b.onclick = function () { resetPw(users.find(function (u) { return u.id === b.getAttribute('data-up'); })); }; });
      U.$$('[data-ul]').forEach(function (b) { b.onclick = async function () { var u = users.find(function (x) { return x.id === b.getAttribute('data-ul'); }); try { await App.store.updateUser(u.id, { locked: !u.locked }); U.toast(u.locked ? 'Đã mở khóa.' : 'Đã khóa tài khoản.', 'ok'); reload(); } catch (e) { App.fail(e); } }; });
      U.$$('[data-ud]').forEach(function (b) { b.onclick = async function () { var u = users.find(function (x) { return x.id === b.getAttribute('data-ud'); }); if (await U.confirmBox('Xóa tài khoản "' + u.fullname + '" cùng toàn bộ bài làm, ghi chú của tài khoản này?', 'Xóa', true)) { try { await App.store.deleteUser(u.id); U.toast('Đã xóa.', 'ok'); reload(); } catch (e) { App.fail(e); } } }; });
    }
    el.innerHTML = '<div class="toolbar"><div class="filters"><div class="searchbox">' + icon('search') + '<input class="input" id="uf-q" placeholder="Tìm theo tên" value="' + esc(UF.q) + '" aria-label="Tìm người dùng"></div><select class="input" id="uf-g" aria-label="Lớp">' + App.gradeOptions(UF.g, true) + '</select>' +
      '<select class="input" id="uf-r" aria-label="Vai trò"><option value="">Mọi vai trò</option><option value="student"' + (UF.role === 'student' ? ' selected' : '') + '>Học sinh</option><option value="admin"' + (UF.role === 'admin' ? ' selected' : '') + '>Quản trị</option></select></div>' +
      '<div class="row-btns"><button class="btn ghost" id="u-bulk">' + icon('upload') + 'Thêm hàng loạt</button><button class="btn primary" id="u-add">' + icon('plus') + 'Thêm tài khoản</button></div></div>' +
      '<p class="muted small">Học sinh tự đăng kí: <b>' + (App.settings.allowRegister ? 'đang cho phép' : 'đang tắt') + '</b> (đổi trong tab Cài đặt). Tổng ' + users.length + ' tài khoản.</p><div class="table-wrap" id="u-table"></div>';
    U.$('#uf-q').oninput = function () { UF.q = this.value; draw(); };
    U.$('#uf-g').onchange = function () { UF.g = Number(this.value); draw(); };
    U.$('#uf-r').onchange = function () { UF.role = this.value; draw(); };
    U.$('#u-add').onclick = function () { userForm(null); };
    U.$('#u-bulk').onclick = bulkUsers;
    draw();
  }
  function userForm(u) {
    U.openModal({
      title: u ? 'Sửa tài khoản' : 'Thêm tài khoản',
      body: '<div class="stack"><label class="field"><span>Họ và tên</span><input class="input" id="uf-n" value="' + esc(u ? u.fullname : '') + '"></label>' +
        (u ? '<p class="muted small">Tên đăng nhập: <b class="mono">' + esc(u.username) + '</b></p>' : '<div class="row2"><label class="field"><span>Tên đăng nhập</span><input class="input" id="uf-u"></label><label class="field"><span>Mật khẩu</span><input class="input" id="uf-p" value="' + Math.random().toString(36).slice(2, 8) + '"></label></div>') +
        '<div class="row2"><label class="field"><span>Lớp</span><select class="input" id="uf-gr">' + App.gradeOptions(u ? u.grade : 12, true) + '</select></label>' +
        '<label class="field"><span>Vai trò</span><select class="input" id="uf-ro"' + (u && u.id === App.user.id ? ' disabled' : '') + '><option value="student">Học sinh</option><option value="admin"' + (u && u.role === 'admin' ? ' selected' : '') + '>Quản trị (giáo viên)</option></select></label></div></div>',
      actions: [{ label: 'Hủy', kind: 'ghost' }, {
        label: 'Lưu', kind: 'primary', onClick: async function () {
          var d = { fullname: U.$('#uf-n').value, grade: U.$('#uf-gr').value, role: U.$('#uf-ro').value };
          if (u) await App.store.updateUser(u.id, d);
          else { d.username = U.$('#uf-u').value; d.password = U.$('#uf-p').value; await App.store.createUser(d); U.textModal('Thông tin đăng nhập vừa tạo', 'Họ tên: ' + d.fullname + '\nTên đăng nhập: ' + d.username + '\nMật khẩu: ' + d.password, 'tai-khoan.txt'); }
          U.toast('Đã lưu tài khoản.', 'ok'); reload();
        }
      }]
    });
  }
  function resetPw(u) {
    var pw = Math.random().toString(36).slice(2, 8);
    U.openModal({
      title: 'Đặt lại mật khẩu – ' + u.fullname,
      body: '<label class="field"><span>Mật khẩu mới</span><input class="input mono" id="rp-p" value="' + pw + '"></label><p class="muted small">Gửi mật khẩu này cho học sinh và nhắc em đổi lại trong trang Tài khoản.</p>',
      actions: [{ label: 'Hủy', kind: 'ghost' }, { label: 'Đặt lại', kind: 'primary', onClick: async function () { var p = U.$('#rp-p').value; await App.store.updateUser(u.id, { password: p }); U.textModal('Mật khẩu mới', 'Tên đăng nhập: ' + u.username + '\nMật khẩu mới: ' + p, 'mat-khau.txt'); } }]
    });
  }
  function bulkUsers() {
    U.openModal({
      title: 'Thêm nhiều học sinh', wide: true,
      body: '<p class="muted">Mỗi dòng một học sinh theo mẫu: <code>Họ và tên; tên đăng nhập; mật khẩu; lớp</code>. Có thể dán trực tiếp từ Excel (các cột cách nhau bằng phím Tab).</p><textarea class="input mono" id="bu-t" rows="10" placeholder="Nguyễn Văn An; an.nguyen; 123456; 12&#10;Lê Thị Bình; binh.le; 123456; 12"></textarea><div id="bu-r" class="small"></div>',
      actions: [{ label: 'Đóng', kind: 'ghost' }, {
        label: 'Tạo tài khoản', kind: 'primary', keepOpen: true, onClick: async function () {
          var lines = U.$('#bu-t').value.split(/\n/).map(function (l) { return l.trim(); }).filter(Boolean);
          var ok = 0, errs = [];
          for (var i = 0; i < lines.length; i++) {
            var p = lines[i].split(/\t|;/).map(function (x) { return x.trim(); });
            try { await App.store.createUser({ fullname: p[0], username: p[1], password: p[2] || '123456', grade: p[3] || 0, role: 'student' }); ok++; } catch (e) { errs.push('Dòng ' + (i + 1) + ': ' + (e.userMessage || e.message)); }
          }
          U.$('#bu-r').innerHTML = '<p class="ok-text">Đã tạo ' + ok + ' tài khoản.</p>' + (errs.length ? '<p class="err">' + errs.map(esc).join('<br>') + '</p>' : '');
          if (ok) U.toast('Đã tạo ' + ok + ' tài khoản.', 'ok');
        }
      }],
      onClose: reload
    });
  }

  /* ---------- Ngân hàng câu hỏi ---------- */
  var QF = { g: 12, s: 'toan', t: '', src: '', q: '' };
  async function tabQuestions(el, alive) {
    var custom = await App.store.list('questions');
    if (!alive()) return;
    var all = App.D.questions.map(function (q) { return Object.assign({ builtin: true }, q); }).concat(custom);
    function draw() {
      var q = U.plain(QF.q);
      var list = all.filter(function (x) { return (!QF.g || Number(x.g) === QF.g) && (!QF.s || x.s === QF.s) && (!QF.t || x.t === QF.t) && (!QF.src || (QF.src === 'b') === !!x.builtin) && (!q || U.plain(x.q).indexOf(q) >= 0); });
      U.$('#q-count').textContent = list.length + ' câu';
      U.$('#q-list').innerHTML = list.slice(0, 200).map(function (x) {
        var ans = x.t === 'mc' ? 'Đáp án ' + 'ABCD'[x.a] : x.t === 'tf' ? 'Đáp án ' + x.a.map(function (v) { return v ? 'Đ' : 'S'; }).join(' ') : 'Đáp án: ' + (x.a || []).join(' / ');
        return '<article class="qrow"><div class="qrow-meta"><span class="badge">Lớp ' + x.g + '</span><span class="badge" style="--c:' + App.SUBJ_COLOR[x.s] + '">' + esc(App.subjShort(x.s, x.g)) + '</span>' + (x.b ? '<span class="badge soft">' + esc(x.b) + '</span>' : '') + '<span class="badge soft">' + App.TYPE_SHORT[x.t] + '</span>' + (x.builtin ? '<span class="pill gray">Có sẵn</span>' : '<span class="pill green">Tự thêm</span>') + (x.hidden ? '<span class="pill amber">Chỉ dùng trong đề</span>' : '') + '</div>' +
          '<div class="qrow-text">' + fmt(x.q) + '</div><div class="qrow-foot"><span class="muted small">' + esc(ans) + '</span>' + (x.builtin ? '<button class="linkish" data-qc="' + x.id + '">Nhân bản để sửa</button>' : '<span><button class="linkish" data-qe="' + x.id + '">Sửa</button> · <button class="linkish danger" data-qd="' + x.id + '">Xóa</button></span>') + '</div></article>';
      }).join('') + (list.length > 200 ? '<p class="muted small">Đang hiện 200/' + list.length + ' câu. Hãy lọc thêm để xem các câu khác.</p>' : '') + (list.length ? '' : '<div class="empty">Không có câu hỏi phù hợp.</div>');
      U.$$('[data-qe]').forEach(function (b) { b.onclick = function () { questionForm(custom.find(function (x) { return x.id === b.getAttribute('data-qe'); })); }; });
      U.$$('[data-qc]').forEach(function (b) { b.onclick = function () { var src = App.D.questions.find(function (x) { return x.id === b.getAttribute('data-qc'); }); var c = JSON.parse(JSON.stringify(src)); delete c.id; questionForm(c, true); }; });
      U.$$('[data-qd]').forEach(function (b) { b.onclick = async function () { if (await U.confirmBox('Xóa câu hỏi này?', 'Xóa', true)) { try { await App.store.remove('questions', b.getAttribute('data-qd')); reload(); } catch (e) { App.fail(e); } } }; });
    }
    el.innerHTML = '<div class="toolbar"><div class="filters"><select class="input" id="qf-g" aria-label="Lớp">' + App.gradeOptions(QF.g, true) + '</select><select class="input" id="qf-s" aria-label="Môn">' + App.subjOptions(QF.s, true) + '</select>' +
      '<select class="input" id="qf-t" aria-label="Dạng"><option value="">Mọi dạng</option><option value="mc"' + (QF.t === 'mc' ? ' selected' : '') + '>Nhiều lựa chọn</option><option value="tf"' + (QF.t === 'tf' ? ' selected' : '') + '>Đúng/Sai</option><option value="sa"' + (QF.t === 'sa' ? ' selected' : '') + '>Trả lời ngắn</option></select>' +
      '<select class="input" id="qf-src" aria-label="Nguồn"><option value="">Mọi nguồn</option><option value="b"' + (QF.src === 'b' ? ' selected' : '') + '>Có sẵn</option><option value="c"' + (QF.src === 'c' ? ' selected' : '') + '>Tự thêm</option></select>' +
      '<div class="searchbox">' + icon('search') + '<input class="input" id="qf-q" placeholder="Tìm nội dung" value="' + esc(QF.q) + '" aria-label="Tìm câu hỏi"></div><span class="muted" id="q-count"></span></div>' +
      '<div class="row-btns"><button class="btn ghost" id="q-exp">' + icon('download') + 'Xuất câu tự thêm</button><button class="btn ghost" id="q-imp">' + icon('upload') + 'Nhập từ văn bản</button><button class="btn primary" id="q-add">' + icon('plus') + 'Thêm câu hỏi</button></div></div><div id="q-list" class="qlist"></div>';
    U.$('#qf-g').onchange = function () { QF.g = Number(this.value); draw(); };
    U.$('#qf-s').onchange = function () { QF.s = this.value; draw(); };
    U.$('#qf-t').onchange = function () { QF.t = this.value; draw(); };
    U.$('#qf-src').onchange = function () { QF.src = this.value; draw(); };
    U.$('#qf-q').oninput = function () { QF.q = this.value; draw(); };
    U.$('#q-add').onclick = function () { questionForm({ g: QF.g || 12, s: QF.s || 'toan', t: QF.t || 'mc' }); };
    U.$('#q-imp').onclick = importQuestions;
    U.$('#q-exp').onclick = function () { U.textModal('Câu hỏi tự thêm (JSON)', JSON.stringify(custom, null, 1), 'cau-hoi.json'); };
    draw();
  }
  function questionForm(q, isCopy) {
    q = q || {};
    var editing = q.id && !isCopy;
    var st = { t: q.t || 'mc' };
    function typePart() {
      if (st.t === 'mc') return '<div class="field"><span>Các phương án (chọn ô tròn ở đáp án đúng)</span>' + [0, 1, 2, 3].map(function (k) { return '<div class="opt-edit"><input type="radio" name="qa" value="' + k + '"' + ((q.t === 'mc' ? q.a : 0) === k ? ' checked' : '') + ' aria-label="Đáp án ' + 'ABCD'[k] + ' đúng"><b>' + 'ABCD'[k] + '</b><input class="input" id="qo' + k + '" value="' + esc(q.t === 'mc' && q.o ? q.o[k] : '') + '"></div>'; }).join('') + '</div>';
      if (st.t === 'tf') return '<div class="field"><span>Bốn ý (chọn Đúng hoặc Sai cho từng ý)</span>' + [0, 1, 2, 3].map(function (k) { var v = q.t === 'tf' && q.a ? q.a[k] : true; return '<div class="opt-edit"><b>' + 'abcd'[k] + ')</b><input class="input" id="qo' + k + '" value="' + esc(q.t === 'tf' && q.o ? q.o[k] : '') + '"><select class="input sm" id="qv' + k + '"><option value="1"' + (v ? ' selected' : '') + '>Đúng</option><option value="0"' + (!v ? ' selected' : '') + '>Sai</option></select></div>'; }).join('') + '</div>';
      return '<label class="field"><span>Đáp án chấp nhận (nhiều đáp án cách nhau bằng dấu ;)</span><input class="input" id="qsa" value="' + esc(q.t === 'sa' && q.a ? q.a.join('; ') : '') + '" placeholder="vd: 0,5; 1/2"></label>';
    }
    var m = U.openModal({
      title: editing ? 'Sửa câu hỏi' : 'Thêm câu hỏi', wide: true,
      body: '<div class="stack"><div class="row3"><label class="field"><span>Lớp</span><select class="input" id="qg">' + App.gradeOptions(q.g || 12) + '</select></label><label class="field"><span>Môn</span><select class="input" id="qs">' + App.subjOptions(q.s || 'toan') + '</select></label>' +
        '<label class="field"><span>Phân môn (nếu có)</span><input class="input" id="qb" value="' + esc(q.b || '') + '" placeholder="Vật lí, Hóa học, Lịch sử…" list="parts-dl"></label></div>' +
        '<datalist id="parts-dl"><option>Vật lí</option><option>Hóa học</option><option>Sinh học</option><option>Lịch sử</option><option>Địa lí</option><option>GDKT&PL</option><option>LS&ĐL</option><option>GDCD</option></datalist>' +
        '<div class="field"><span>Dạng câu hỏi</span><div class="seg" id="qt">' + ['mc', 'tf', 'sa'].map(function (t) { return '<button type="button" class="seg-btn ' + (st.t === t ? 'on' : '') + '" data-qt="' + t + '">' + App.TYPE_SHORT[t] + '</button>'; }).join('') + '</div></div>' +
        '<label class="field"><span>Nội dung câu hỏi</span><textarea class="input" id="qq" rows="3">' + esc(q.q || '') + '</textarea><small class="muted">Viết chỉ số: x^{2}, H_{2}O; chữ đậm: **nội dung**.</small></label>' +
        '<div id="q-type">' + typePart() + '</div>' +
        '<label class="field"><span>Lời giải / giải thích (không bắt buộc)</span><textarea class="input" id="qe" rows="2">' + esc(q.e || '') + '</textarea></label>' +
        '<label class="check"><input type="checkbox" id="qh"' + (q.hidden ? ' checked' : '') + '> Chỉ dùng trong đề thi (học sinh không thấy khi luyện tập)</label></div>',
      actions: [{ label: 'Hủy', kind: 'ghost' }, {
        label: 'Lưu câu hỏi', kind: 'primary', onClick: async function () {
          var d = { g: Number(U.$('#qg').value), s: U.$('#qs').value, b: U.$('#qb').value.trim(), t: st.t, q: U.$('#qq').value.trim(), e: U.$('#qe').value.trim(), hidden: U.$('#qh').checked };
          if (!d.q) throw new Error('Chưa nhập nội dung câu hỏi.');
          if (st.t === 'mc') {
            d.o = [0, 1, 2, 3].map(function (k) { return U.$('#qo' + k).value.trim(); });
            if (d.o.some(function (x) { return !x; })) throw new Error('Cần nhập đủ 4 phương án.');
            var r = document.querySelector('input[name="qa"]:checked'); d.a = r ? Number(r.value) : 0;
          } else if (st.t === 'tf') {
            d.o = [0, 1, 2, 3].map(function (k) { return U.$('#qo' + k).value.trim(); });
            if (d.o.some(function (x) { return !x; })) throw new Error('Cần nhập đủ 4 ý.');
            d.a = [0, 1, 2, 3].map(function (k) { return U.$('#qv' + k).value === '1'; });
          } else {
            d.a = U.$('#qsa').value.split(';').map(function (x) { return x.trim(); }).filter(Boolean);
            if (!d.a.length) throw new Error('Cần nhập đáp án.');
          }
          if (editing) await App.store.update('questions', q.id, d); else await App.store.create('questions', d);
          U.toast('Đã lưu câu hỏi.', 'ok'); reload();
        }
      }]
    });
    U.$$('[data-qt]', m.el).forEach(function (b) { b.onclick = function () { st.t = b.getAttribute('data-qt'); U.$$('[data-qt]', m.el).forEach(function (x) { x.classList.toggle('on', x === b); }); U.$('#q-type', m.el).innerHTML = typePart(); }; });
  }
  function parseImport(text, base) {
    var lines = text.replace(/\r/g, '').split('\n');
    var blocks = [], cur = [];
    lines.forEach(function (l) {
      if (/^\s*Câu\s*\d*\s*[:.)]/i.test(l) && cur.some(function (x) { return x.trim(); })) { blocks.push(cur); cur = []; }
      if (!l.trim() && cur.some(function (x) { return /^\s*(Đáp án|ĐA)\s*[:：]/i.test(x); })) { blocks.push(cur); cur = []; return; }
      cur.push(l);
    });
    if (cur.some(function (x) { return x.trim(); })) blocks.push(cur);
    var out = [], errs = [];
    blocks.forEach(function (b, bi) {
      var q = '', opts = [], star = -1, tf = [], ans = null, exp = '', mode = 'q';
      b.forEach(function (raw) {
        var l = raw.trim(); if (!l) return;
        var m;
        if ((m = l.match(/^(\*?)\s*([A-D])\s*[.)]\s*(.*)$/))) { if (m[1]) star = opts.length; opts.push(m[3].trim()); mode = 'o'; return; }
        if ((m = l.match(/^([a-d])\s*\)\s*(.*)$/))) { tf.push(m[2].trim()); mode = 'o'; return; }
        if ((m = l.match(/^(Đáp án|ĐA)\s*[:：]\s*(.*)$/i))) { ans = m[2].trim(); mode = 'a'; return; }
        if ((m = l.match(/^(Giải thích|Lời giải|Hướng dẫn)\s*[:：]\s*(.*)$/i))) { exp = m[2].trim(); mode = 'e'; return; }
        if (mode === 'e') { exp += '\n' + l; return; }
        if (mode === 'q') { q += (q ? '\n' : '') + l.replace(/^Câu\s*\d*\s*[:.)]\s*/i, ''); return; }
      });
      var item = { g: base.g, s: base.s, b: base.b, q: q.trim(), e: exp.trim(), hidden: base.hidden };
      if (!item.q) { errs.push('Khối ' + (bi + 1) + ': thiếu nội dung câu hỏi.'); return; }
      if (opts.length === 4) {
        var k = star >= 0 ? star : ans ? 'ABCD'.indexOf(ans.toUpperCase().replace(/[^A-D]/g, '').charAt(0)) : -1;
        if (k < 0) { errs.push('Câu "' + item.q.slice(0, 40) + '…": chưa có đáp án A/B/C/D.'); return; }
        item.t = 'mc'; item.o = opts; item.a = k;
      } else if (tf.length === 4) {
        var v = (ans || '').toUpperCase().replace(/ĐÚNG/g, 'Đ').replace(/SAI/g, 'S').replace(/[^ĐS]/g, '');
        if (v.length !== 4) { errs.push('Câu "' + item.q.slice(0, 40) + '…": đáp án Đúng/Sai cần dạng "Đ S Đ Đ".'); return; }
        item.t = 'tf'; item.o = tf; item.a = v.split('').map(function (c) { return c === 'Đ'; });
      } else if (!opts.length && !tf.length && ans) {
        item.t = 'sa'; item.a = ans.split(';').map(function (x) { return x.trim(); }).filter(Boolean);
      } else { errs.push('Câu "' + item.q.slice(0, 40) + '…": cần đủ 4 phương án A–D, hoặc 4 ý a)–d), hoặc chỉ có đáp án (trả lời ngắn).'); return; }
      out.push(item);
    });
    return { items: out, errs: errs };
  }
  App.parseImport = parseImport;
  function importQuestions() {
    var sample = 'Câu 1: Đạo hàm của hàm số y = x³ là:\nA. 3x\nB. 3x² \nC. x²\nD. 3x³\nĐáp án: B\nGiải thích: (xⁿ)\' = n·xⁿ⁻¹.\n\nCâu 2: Cho hàm số y = x² − 4.\na) Hàm số có đạo hàm y\' = 2x.\nb) Đồ thị cắt trục hoành tại x = 2 và x = −2.\nc) Hàm số đồng biến trên ℝ.\nd) Giá trị nhỏ nhất của hàm số là −4.\nĐáp án: Đ Đ S Đ\n\nCâu 3: Tính ∫₀² 3x² dx.\nĐáp án: 8';
    var m = U.openModal({
      title: 'Nhập câu hỏi từ văn bản', wide: true,
      body: '<div class="row3"><label class="field"><span>Lớp</span><select class="input" id="im-g">' + App.gradeOptions(QF.g || 12) + '</select></label><label class="field"><span>Môn</span><select class="input" id="im-s">' + App.subjOptions(QF.s || 'toan') + '</select></label><label class="field"><span>Phân môn</span><input class="input" id="im-b" list="parts-dl2" placeholder="(nếu có)"><datalist id="parts-dl2"><option>Vật lí</option><option>Hóa học</option><option>Sinh học</option><option>Lịch sử</option><option>Địa lí</option><option>GDKT&PL</option></datalist></label></div>' +
        '<p class="muted small">Dán đề từ Word. Mỗi câu bắt đầu bằng "Câu …:". Trắc nghiệm: 4 dòng A. B. C. D. và dòng "Đáp án: B" (hoặc đặt dấu * trước phương án đúng). Đúng/Sai: 4 dòng a) b) c) d) và "Đáp án: Đ S Đ Đ". Trả lời ngắn: chỉ cần dòng "Đáp án: 8". Dòng "Giải thích:" là không bắt buộc.</p>' +
        '<textarea class="input mono" id="im-t" rows="14">' + esc(sample) + '</textarea><label class="check"><input type="checkbox" id="im-h"> Chỉ dùng trong đề thi</label><div id="im-r" class="small"></div>',
      actions: [{ label: 'Đóng', kind: 'ghost' }, { label: 'Kiểm tra', kind: 'ghost', keepOpen: true, onClick: function () { preview(false); } }, { label: 'Nhập vào ngân hàng', kind: 'primary', keepOpen: true, onClick: function () { return preview(true); } }],
      onClose: reload
    });
    async function preview(commit) {
      var res = parseImport(U.$('#im-t', m.el).value, { g: Number(U.$('#im-g', m.el).value), s: U.$('#im-s', m.el).value, b: U.$('#im-b', m.el).value.trim(), hidden: U.$('#im-h', m.el).checked });
      var box = U.$('#im-r', m.el);
      var c = { mc: 0, tf: 0, sa: 0 }; res.items.forEach(function (x) { c[x.t]++; });
      box.innerHTML = '<p class="ok-text">Đọc được ' + res.items.length + ' câu: ' + c.mc + ' nhiều lựa chọn, ' + c.tf + ' Đúng/Sai, ' + c.sa + ' trả lời ngắn.</p>' + (res.errs.length ? '<p class="err">' + res.errs.map(esc).join('<br>') + '</p>' : '');
      if (commit && res.items.length) {
        var n = 0;
        for (var i = 0; i < res.items.length; i++) { try { await App.store.create('questions', res.items[i]); n++; } catch (e) { App.fail(e); break; } }
        box.innerHTML += '<p class="ok-text"><b>Đã thêm ' + n + ' câu vào ngân hàng.</b></p>';
        U.toast('Đã nhập ' + n + ' câu hỏi.', 'ok');
      }
    }
  }

  /* ---------- Đề thi ---------- */
  async function tabExams(el, alive) {
    var r = await Promise.all([App.store.list('exams'), App.store.list('results')]);
    if (!alive()) return;
    var exams = r[0].sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); }), res = r[1];
    el.innerHTML = '<div class="toolbar"><p class="muted">Đề thi lấy câu hỏi từ ngân hàng (có sẵn và tự thêm). Học sinh chỉ thấy đề <b>đang mở</b> và đúng lớp.</p><button class="btn primary" id="ex-add">' + icon('plus') + 'Tạo đề thi</button></div>' +
      '<div class="table-wrap"><table class="table"><thead><tr><th>Tên đề</th><th>Lớp</th><th>Môn</th><th class="num">Số câu</th><th class="num">Phút</th><th>Trạng thái</th><th class="num">Lượt nộp</th><th class="num">Điểm TB</th><th></th></tr></thead><tbody>' +
      (exams.length ? exams.map(function (e) {
        var rr = res.filter(function (x) { return x.examId === e.id; });
        var avg = rr.length ? rr.reduce(function (a, b) { return a + b.score; }, 0) / rr.length : null;
        return '<tr><td><b>' + esc(e.title) + '</b>' + (e.deadline ? '<br><small class="muted">Hạn ' + esc(U.dt(e.deadline, true)) + '</small>' : '') + '</td><td>' + esc(e.g || 'Tất cả') + '</td><td>' + esc(App.subjShort(e.s, e.g)) + '</td><td class="num">' + (e.qids || []).length + '</td><td class="num">' + e.minutes + '</td>' +
          '<td><button class="pill ' + (e.open ? 'green' : 'gray') + ' as-btn" data-xo="' + e.id + '" title="Bấm để ' + (e.open ? 'đóng' : 'mở') + ' đề">' + (e.open ? 'Đang mở' : 'Đang đóng') + '</button></td><td class="num">' + rr.length + '</td><td class="num">' + (avg === null ? '–' : U.num(avg, 2)) + '</td>' +
          '<td class="acts"><button class="linkish" data-xr="' + e.id + '">Kết quả</button><button class="icon-btn" aria-label="Sửa" title="Sửa" data-xe="' + e.id + '">' + icon('edit') + '</button><button class="icon-btn danger" aria-label="Xóa" title="Xóa" data-xd="' + e.id + '">' + icon('trash') + '</button></td></tr>';
      }).join('') : '<tr><td colspan="9" class="empty small">Chưa có đề thi.</td></tr>') + '</tbody></table></div>';
    U.$('#ex-add').onclick = function () { examForm(null); };
    U.$$('[data-xe]', el).forEach(function (b) { b.onclick = function () { examForm(exams.find(function (e) { return e.id === b.getAttribute('data-xe'); })); }; });
    U.$$('[data-xo]', el).forEach(function (b) { b.onclick = async function () { var e = exams.find(function (x) { return x.id === b.getAttribute('data-xo'); }); try { await App.store.update('exams', e.id, { open: !e.open }); reload(); } catch (er) { App.fail(er); } }; });
    U.$$('[data-xd]', el).forEach(function (b) { b.onclick = async function () { var e = exams.find(function (x) { return x.id === b.getAttribute('data-xd'); }); if (await U.confirmBox('Xóa đề "' + e.title + '"? Kết quả học sinh đã nộp vẫn được giữ.', 'Xóa', true)) { try { await App.store.remove('exams', e.id); reload(); } catch (er) { App.fail(er); } } }; });
    U.$$('[data-xr]', el).forEach(function (b) { b.onclick = function () { var e = exams.find(function (x) { return x.id === b.getAttribute('data-xr'); }); examResults(e, res.filter(function (x) { return x.examId === e.id; })); }; });
  }
  var PRESETS = [['Toán THPT', 12, 4, 6], ['Lí · Hóa · Sinh · Địa', 18, 4, 6], ['Sử · GDKT&PL', 24, 4, 0], ['Kiểm tra 15 phút', 10, 0, 0], ['THCS / Tiểu học', 20, 0, 0]];
  async function examForm(e) {
    var custom = await App.store.list('questions');
    var bankAll = window.BXStore.allBankQuestions(custom);
    var st = { mode: e ? 'keep' : 'auto', picked: {} };
    (e && e.qids || []).forEach(function (id) { st.picked[id] = true; });
    var m = U.openModal({
      title: e ? 'Sửa đề thi' : 'Tạo đề thi', wide: true,
      body: '<div class="stack"><label class="field"><span>Tên đề thi</span><input class="input" id="xf-t" value="' + esc(e ? e.title : '') + '" placeholder="vd: Kiểm tra giữa kì I – Toán 12"></label>' +
        '<div class="row3"><label class="field"><span>Lớp</span><select class="input" id="xf-g">' + App.gradeOptions(e ? e.g : 12, true) + '</select></label><label class="field"><span>Môn</span><select class="input" id="xf-s">' + App.subjOptions(e ? e.s : 'toan') + '</select></label><label class="field"><span>Phân môn</span><input class="input" id="xf-b" list="parts-dl3" placeholder="(lấy câu hỏi của phân môn)"><datalist id="parts-dl3"><option>Vật lí</option><option>Hóa học</option><option>Sinh học</option><option>Lịch sử</option><option>Địa lí</option><option>GDKT&PL</option><option>LS&ĐL</option><option>GDCD</option></datalist></label></div>' +
        '<div class="row3"><label class="field"><span>Thời gian (phút)</span><input class="input" type="number" min="1" max="300" id="xf-m" value="' + (e ? e.minutes : 45) + '"></label><label class="field"><span>Số lượt làm tối đa (0 = không giới hạn)</span><input class="input" type="number" min="0" id="xf-a" value="' + (e ? e.maxAttempts || 0 : 1) + '"></label><label class="field"><span>Hạn nộp (không bắt buộc)</span><input class="input" type="datetime-local" id="xf-d" value="' + esc(e && e.deadline ? e.deadline : '') + '"></label></div>' +
        '<div class="row-btns"><label class="check"><input type="checkbox" id="xf-o"' + (!e || e.open ? ' checked' : '') + '> Mở đề cho học sinh</label><label class="check"><input type="checkbox" id="xf-sa"' + (!e || e.showAnswers ? ' checked' : '') + '> Cho xem đáp án và lời giải sau khi nộp</label></div>' +
        '<div class="field"><span>Câu hỏi</span><div class="seg" id="xf-mode">' + (e ? '<button type="button" class="seg-btn" data-xm="keep">Giữ nguyên (' + (e.qids || []).length + ' câu)</button>' : '') + '<button type="button" class="seg-btn" data-xm="auto">Bốc ngẫu nhiên theo cấu trúc</button><button type="button" class="seg-btn" data-xm="manual">Chọn từng câu</button></div></div><div id="xf-q"></div></div>',
      actions: [{ label: 'Hủy', kind: 'ghost' }, {
        label: 'Lưu đề thi', kind: 'primary', onClick: async function () {
          var d = { title: U.$('#xf-t').value.trim(), g: Number(U.$('#xf-g').value), s: U.$('#xf-s').value, minutes: Math.max(1, Number(U.$('#xf-m').value) || 45), maxAttempts: Math.max(0, Number(U.$('#xf-a').value) || 0), deadline: U.$('#xf-d').value, open: U.$('#xf-o').checked, showAnswers: U.$('#xf-sa').checked };
          if (!d.title) throw new Error('Chưa nhập tên đề thi.');
          if (st.mode === 'auto') {
            var pool = poolOf(); var ids = [];
            ['mc', 'tf', 'sa'].forEach(function (t) { var n = Number(U.$('#xn-' + t).value) || 0; ids = ids.concat(U.shuffle(pool.filter(function (q) { return q.t === t; })).slice(0, n).map(function (q) { return q.id; })); });
            d.qids = ids;
          } else if (st.mode === 'manual') {
            var order = { mc: 0, tf: 1, sa: 2 }, map = {}; bankAll.forEach(function (q) { map[q.id] = q; });
            d.qids = Object.keys(st.picked).filter(function (k) { return st.picked[k] && map[k]; }).sort(function (a, b) { return order[map[a].t] - order[map[b].t]; });
          }
          if (st.mode !== 'keep' && !d.qids.length) throw new Error('Đề thi chưa có câu hỏi nào.');
          if (e) await App.store.update('exams', e.id, d); else await App.store.create('exams', d);
          U.toast('Đã lưu đề thi' + (d.qids ? ' (' + d.qids.length + ' câu)' : '') + '.', 'ok'); reload();
        }
      }]
    });
    function poolOf() {
      var g = Number(U.$('#xf-g', m.el).value), s = U.$('#xf-s', m.el).value, b = U.$('#xf-b', m.el).value.trim();
      return bankAll.filter(function (q) { return (!g || Number(q.g) === g) && q.s === s && (!b || q.b === b); });
    }
    function drawQ() {
      U.$$('[data-xm]', m.el).forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-xm') === st.mode); });
      var box = U.$('#xf-q', m.el), pool = poolOf();
      var c = { mc: 0, tf: 0, sa: 0 }; pool.forEach(function (q) { c[q.t]++; });
      if (st.mode === 'keep') { box.innerHTML = '<p class="muted small">Giữ nguyên ' + (e.qids || []).length + ' câu hỏi hiện có của đề.</p>'; return; }
      if (st.mode === 'auto') {
        box.innerHTML = '<p class="muted small">Ngân hàng hiện có: ' + c.mc + ' câu nhiều lựa chọn, ' + c.tf + ' câu Đúng/Sai, ' + c.sa + ' câu trả lời ngắn phù hợp lớp/môn đã chọn.</p>' +
          '<div class="chips">' + PRESETS.map(function (p, i) { return '<button type="button" class="chip" data-pr="' + i + '">' + esc(p[0]) + ' (' + p[1] + '–' + p[2] + '–' + p[3] + ')</button>'; }).join('') + '</div>' +
          '<div class="row3"><label class="field"><span>Nhiều lựa chọn</span><input class="input" type="number" min="0" id="xn-mc" value="' + Math.min(12, c.mc) + '"></label><label class="field"><span>Đúng/Sai</span><input class="input" type="number" min="0" id="xn-tf" value="' + Math.min(4, c.tf) + '"></label><label class="field"><span>Trả lời ngắn</span><input class="input" type="number" min="0" id="xn-sa" value="' + Math.min(6, c.sa) + '"></label></div>';
        U.$$('[data-pr]', box).forEach(function (b) { b.onclick = function () { var p = PRESETS[Number(b.getAttribute('data-pr'))]; U.$('#xn-mc').value = Math.min(p[1], c.mc); U.$('#xn-tf').value = Math.min(p[2], c.tf); U.$('#xn-sa').value = Math.min(p[3], c.sa); }; });
        return;
      }
      var n = Object.keys(st.picked).filter(function (k) { return st.picked[k]; }).length;
      box.innerHTML = '<p class="muted small">Đã chọn <b id="xf-n">' + n + '</b> câu. Danh sách theo lớp/môn/phân môn ở trên.</p><div class="pick-list">' + pool.map(function (q) {
        return '<label class="pick"><input type="checkbox" data-pk="' + q.id + '"' + (st.picked[q.id] ? ' checked' : '') + '><span class="badge soft">' + App.TYPE_SHORT[q.t] + '</span><span>' + fmt(q.q.length > 160 ? q.q.slice(0, 160) + '…' : q.q) + '</span></label>';
      }).join('') + '</div>';
      U.$$('[data-pk]', box).forEach(function (cb) { cb.onchange = function () { st.picked[cb.getAttribute('data-pk')] = cb.checked; U.$('#xf-n').textContent = Object.keys(st.picked).filter(function (k) { return st.picked[k]; }).length; }; });
    }
    U.$$('[data-xm]', m.el).forEach(function (b) { b.onclick = function () { st.mode = b.getAttribute('data-xm'); drawQ(); }; });
    ['#xf-g', '#xf-s'].forEach(function (s) { U.$(s, m.el).onchange = drawQ; });
    U.$('#xf-b', m.el).oninput = drawQ;
    drawQ();
  }
  function examResults(e, rows) {
    rows.sort(function (a, b) { return b.score - a.score; });
    var avg = rows.length ? rows.reduce(function (a, b) { return a + b.score; }, 0) / rows.length : null;
    var dist = [0, 0, 0, 0, 0];
    rows.forEach(function (r) { dist[r.score >= 8 ? 0 : r.score >= 6.5 ? 1 : r.score >= 5 ? 2 : r.score >= 3.5 ? 3 : 4]++; });
    var m = U.openModal({
      title: 'Kết quả: ' + e.title, wide: true,
      body: '<ul class="facts inline"><li><span>Lượt nộp</span><b>' + rows.length + '</b></li><li><span>Điểm TB</span><b>' + (avg === null ? '–' : U.num(avg, 2)) + '</b></li><li><span>Cao nhất</span><b>' + (rows.length ? U.num(rows[0].score, 2) : '–') + '</b></li><li><span>Thấp nhất</span><b>' + (rows.length ? U.num(rows[rows.length - 1].score, 2) : '–') + '</b></li></ul>' +
        U.bars([['Giỏi (≥ 8)', 0], ['Khá (6,5 – 8)', 1], ['Trung bình (5 – 6,5)', 2], ['Yếu (3,5 – 5)', 3], ['Kém (< 3,5)', 4]].map(function (x) { return { label: x[0], v: dist[x[1]], text: dist[x[1]] + ' bài' }; })) +
        '<div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Học sinh</th><th>Lớp</th><th class="num">Đúng</th><th class="num">Điểm</th><th class="num">Thời gian</th><th>Nộp lúc</th><th></th></tr></thead><tbody>' +
        (rows.length ? rows.map(function (r, i) { return '<tr><td>' + (i + 1) + '</td><td>' + esc(r.ownerName) + '</td><td>' + esc(r.ownerGrade) + '</td><td class="num">' + r.correct + '/' + r.count + '</td><td class="num"><span class="score ' + U.scoreClass(r.score) + '">' + U.num(r.score, 2) + '</span></td><td class="num">' + U.dur(r.duration) + '</td><td>' + esc(U.dt(r.at, true)) + '</td><td><button class="linkish" data-rv="' + r.id + '">Xem bài</button></td></tr>'; }).join('') : '<tr><td colspan="8" class="empty small">Chưa có học sinh nộp bài.</td></tr>') + '</tbody></table></div>',
      actions: [{ label: 'Xuất CSV', kind: 'ghost', keepOpen: true, onClick: function () { U.textModal('Kết quả đề thi (CSV)', U.csv([['STT', 'Học sinh', 'Lớp', 'Số câu đúng', 'Tổng câu', 'Điểm', 'Thời gian (giây)', 'Nộp lúc']].concat(rows.map(function (r, i) { return [i + 1, r.ownerName, r.ownerGrade, r.correct, r.count, String(r.score).replace('.', ','), r.duration, U.dt(r.at, true)]; }))), 'ket-qua-de-thi.csv'); } }, { label: 'Đóng', kind: 'primary' }]
    });
    U.$$('[data-rv]', m.el).forEach(function (b) { b.onclick = function () { App.reviewResult(rows.find(function (r) { return r.id === b.getAttribute('data-rv'); })); }; });
  }

  /* ---------- Tài liệu, bài giảng, thông báo ---------- */
  async function tabDocs(el, alive) {
    var docs = await App.store.list('docs');
    if (!alive()) return;
    docs.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
    el.innerHTML = '<div class="toolbar"><p class="muted">' + (App.store.mode === 'server' ? 'Có thể tải lên tệp PDF, Word, PowerPoint, hình ảnh (tối đa 20 MB) hoặc dán đường liên kết.' : 'Bản dùng thử chỉ lưu đường liên kết và nội dung văn bản. Tải tệp lên cần chạy bản máy chủ.') + '</p><button class="btn primary" id="d-add">' + icon('plus') + 'Thêm tài liệu</button></div>' +
      listTable(docs, ['Tiêu đề', 'Loại', 'Lớp', 'Môn', 'Ngày'], function (d) { return ['<b>' + esc(d.title) + '</b>', { link: 'Liên kết', text: 'Văn bản', file: 'Tệp' }[d.kind] || '', d.g ? 'Lớp ' + d.g : 'Mọi lớp', d.s ? App.subjShort(d.s, d.g) : 'Chung', U.dt(d.at)]; }, 'd');
    U.$('#d-add').onclick = function () { docForm(null); };
    bindRowActions(el, 'd', docs, docForm, 'docs');
  }
  function docForm(d) {
    var st = { kind: d ? d.kind : 'link', file: d && d.kind === 'file' ? { url: d.url, name: d.fileName, size: d.size } : null };
    var m = U.openModal({
      title: d ? 'Sửa tài liệu' : 'Thêm tài liệu', wide: true,
      body: '<div class="stack"><label class="field"><span>Tiêu đề</span><input class="input" id="df-t" value="' + esc(d ? d.title : '') + '"></label>' +
        '<div class="row3"><label class="field"><span>Lớp</span><select class="input" id="df-g">' + App.gradeOptions(d ? d.g : 0, true) + '</select></label><label class="field"><span>Môn</span><select class="input" id="df-s">' + App.subjOptions(d ? d.s : '', true) + '</select></label>' +
        '<div class="field"><span>Loại</span><div class="seg">' + [['link', 'Liên kết'], ['text', 'Văn bản'], ['file', 'Tải tệp lên']].map(function (k) { return '<button type="button" class="seg-btn ' + (st.kind === k[0] ? 'on' : '') + '" data-dk="' + k[0] + '">' + k[1] + '</button>'; }).join('') + '</div></div></div>' +
        '<div id="df-k"></div><label class="field"><span id="df-bl">Mô tả / nội dung</span><textarea class="input" id="df-b" rows="6">' + esc(d ? d.body || '' : '') + '</textarea></label></div>',
      actions: [{ label: 'Hủy', kind: 'ghost' }, {
        label: 'Lưu', kind: 'primary', onClick: async function () {
          var x = { title: U.$('#df-t').value.trim(), g: Number(U.$('#df-g').value), s: U.$('#df-s').value, kind: st.kind, body: U.$('#df-b').value };
          if (!x.title) throw new Error('Chưa nhập tiêu đề.');
          if (st.kind === 'link') { x.url = U.$('#df-u').value.trim(); if (!/^https?:\/\//i.test(x.url)) throw new Error('Đường liên kết cần bắt đầu bằng http:// hoặc https://'); }
          if (st.kind === 'file') { if (!st.file) throw new Error('Chưa chọn tệp.'); x.url = st.file.url; x.fileName = st.file.name; x.size = st.file.size; }
          if (st.kind === 'text') { x.url = ''; if (!x.body.trim()) throw new Error('Chưa nhập nội dung.'); }
          if (d) await App.store.update('docs', d.id, x); else await App.store.create('docs', x);
          U.toast('Đã lưu tài liệu.', 'ok'); reload();
        }
      }]
    });
    function drawKind() {
      U.$$('[data-dk]', m.el).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-dk') === st.kind); });
      var k = U.$('#df-k', m.el);
      U.$('#df-bl', m.el).textContent = st.kind === 'text' ? 'Nội dung (dùng **đậm**, xuống dòng, dán đường liên kết)' : 'Mô tả ngắn (không bắt buộc)';
      if (st.kind === 'link') k.innerHTML = '<label class="field"><span>Đường liên kết (Google Drive, OneDrive, YouTube…)</span><input class="input" id="df-u" value="' + esc(d && d.kind === 'link' ? d.url : '') + '" placeholder="https://"></label>';
      else if (st.kind === 'text') k.innerHTML = '';
      else {
        k.innerHTML = '<div class="field"><span>Tệp</span><input type="file" id="df-f" class="input"><small class="muted" id="df-fi">' + (st.file ? 'Đã có: ' + esc(st.file.name || st.file.url) : 'Chưa chọn tệp') + '</small></div>';
        U.$('#df-f', k).onchange = async function () {
          var f = this.files[0]; if (!f) return;
          U.$('#df-fi', k).textContent = 'Đang tải lên ' + f.name + '…';
          try { st.file = await App.store.upload(f); U.$('#df-fi', k).textContent = 'Đã tải lên: ' + f.name; if (!U.$('#df-t', m.el).value) U.$('#df-t', m.el).value = f.name.replace(/\.[^.]+$/, ''); }
          catch (e) { U.$('#df-fi', k).textContent = e.userMessage || e.message; st.file = null; }
        };
      }
    }
    U.$$('[data-dk]', m.el).forEach(function (b) { b.onclick = function () { st.kind = b.getAttribute('data-dk'); drawKind(); }; });
    drawKind();
  }
  async function tabLessons(el, alive) {
    var rows = await App.store.list('lessons');
    if (!alive()) return;
    rows.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
    el.innerHTML = '<div class="toolbar"><p class="muted">Bài giảng hiện trong mục Học liệu, đúng lớp và môn đã chọn.</p><button class="btn primary" id="l-add">' + icon('plus') + 'Thêm bài giảng</button></div>' +
      listTable(rows, ['Tiêu đề', 'Lớp', 'Môn', 'Video', 'Ngày'], function (d) { return ['<b>' + esc(d.title) + '</b>', 'Lớp ' + d.g, App.subjShort(d.s, d.g), d.video ? 'Có' : '–', U.dt(d.at)]; }, 'l');
    U.$('#l-add').onclick = function () { lessonForm(null); };
    bindRowActions(el, 'l', rows, lessonForm, 'lessons');
  }
  function lessonForm(d) {
    U.openModal({
      title: d ? 'Sửa bài giảng' : 'Thêm bài giảng', wide: true,
      body: '<div class="stack"><label class="field"><span>Tiêu đề</span><input class="input" id="lf-t" value="' + esc(d ? d.title : '') + '" placeholder="vd: Phương pháp đổi biến số tính nguyên hàm"></label>' +
        '<div class="row2"><label class="field"><span>Lớp</span><select class="input" id="lf-g">' + App.gradeOptions(d ? d.g : 12) + '</select></label><label class="field"><span>Môn</span><select class="input" id="lf-s">' + App.subjOptions(d ? d.s : 'toan') + '</select></label></div>' +
        '<label class="field"><span>Nội dung bài giảng</span><textarea class="input" id="lf-b" rows="12" placeholder="Viết lí thuyết, ví dụ mẫu, bài tập về nhà…">' + esc(d ? d.body : '') + '</textarea><small class="muted">Định dạng: **chữ đậm**, x^{2}, H_{2}O, đường liên kết tự nhận.</small></label>' +
        '<label class="field"><span>Đường liên kết video (YouTube, Drive… – không bắt buộc)</span><input class="input" id="lf-v" value="' + esc(d ? d.video || '' : '') + '" placeholder="https://"></label></div>',
      actions: [{ label: 'Hủy', kind: 'ghost' }, {
        label: 'Lưu', kind: 'primary', onClick: async function () {
          var x = { title: U.$('#lf-t').value.trim(), g: Number(U.$('#lf-g').value), s: U.$('#lf-s').value, body: U.$('#lf-b').value, video: U.$('#lf-v').value.trim() };
          if (!x.title) throw new Error('Chưa nhập tiêu đề.');
          if (x.video && !/^https?:\/\//i.test(x.video)) throw new Error('Liên kết video cần bắt đầu bằng http:// hoặc https://');
          if (d) await App.store.update('lessons', d.id, x); else await App.store.create('lessons', x);
          U.toast('Đã lưu bài giảng.', 'ok'); reload();
        }
      }]
    });
  }
  async function tabNews(el, alive) {
    var rows = await App.store.list('news');
    if (!alive()) return;
    rows.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
    el.innerHTML = '<div class="toolbar"><p class="muted">Thông báo hiện ở Trang chủ của mọi tài khoản. Thông báo được ghim luôn nằm trên cùng.</p><button class="btn primary" id="n-add">' + icon('plus') + 'Đăng thông báo</button></div>' +
      listTable(rows, ['Tiêu đề', 'Ghim', 'Ngày đăng'], function (d) { return ['<b>' + esc(d.title) + '</b>', d.pinned ? 'Có' : '–', U.dt(d.at, true)]; }, 'n');
    U.$('#n-add').onclick = function () { newsForm(null); };
    bindRowActions(el, 'n', rows, newsForm, 'news');
  }
  function newsForm(d) {
    U.openModal({
      title: d ? 'Sửa thông báo' : 'Đăng thông báo', wide: true,
      body: '<div class="stack"><label class="field"><span>Tiêu đề</span><input class="input" id="nf-t" value="' + esc(d ? d.title : '') + '"></label><label class="field"><span>Nội dung</span><textarea class="input" id="nf-b" rows="8">' + esc(d ? d.body : '') + '</textarea></label><label class="check"><input type="checkbox" id="nf-p"' + (d && d.pinned ? ' checked' : '') + '> Ghim lên đầu</label></div>',
      actions: [{ label: 'Hủy', kind: 'ghost' }, {
        label: 'Đăng', kind: 'primary', onClick: async function () {
          var x = { title: U.$('#nf-t').value.trim(), body: U.$('#nf-b').value, pinned: U.$('#nf-p').checked };
          if (!x.title) throw new Error('Chưa nhập tiêu đề.');
          if (d) await App.store.update('news', d.id, x); else await App.store.create('news', x);
          U.toast('Đã đăng thông báo.', 'ok'); reload();
        }
      }]
    });
  }
  function listTable(rows, heads, cells, p) {
    return '<div class="table-wrap"><table class="table"><thead><tr>' + heads.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '<th></th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (r) { return '<tr>' + cells(r).map(function (c, i) { return '<td>' + (i === 0 ? c : esc(c)) + '</td>'; }).join('') + '<td class="acts"><button class="icon-btn" aria-label="Sửa" title="Sửa" data-' + p + 'e="' + r.id + '">' + icon('edit') + '</button><button class="icon-btn danger" aria-label="Xóa" title="Xóa" data-' + p + 'd="' + r.id + '">' + icon('trash') + '</button></td></tr>'; }).join('') : '<tr><td colspan="' + (heads.length + 1) + '" class="empty small">Chưa có mục nào.</td></tr>') + '</tbody></table></div>';
  }
  function bindRowActions(el, p, rows, form, col) {
    U.$$('[data-' + p + 'e]', el).forEach(function (b) { b.onclick = function () { form(rows.find(function (r) { return r.id === b.getAttribute('data-' + p + 'e'); })); }; });
    U.$$('[data-' + p + 'd]', el).forEach(function (b) { b.onclick = async function () { if (await U.confirmBox('Xóa mục này?', 'Xóa', true)) { try { await App.store.remove(col, b.getAttribute('data-' + p + 'd')); reload(); } catch (e) { App.fail(e); } } }; });
  }

  /* ---------- Cài đặt & sao lưu ---------- */
  async function tabSettings(el) {
    var s = App.settings;
    el.innerHTML = '<section class="card"><h2>Thông tin trang</h2><form id="st-f" class="stack"><div class="row2"><label class="field"><span>Tên trang web</span><input class="input" id="st-n" value="' + esc(s.siteName) + '"></label><label class="field"><span>Khẩu hiệu</span><input class="input" id="st-t" value="' + esc(s.tagline) + '"></label></div>' +
      '<div class="row2"><label class="field"><span>Tên kì thi đếm ngược (THPT)</span><input class="input" id="st-en" value="' + esc(s.examName) + '"></label><label class="field"><span>Ngày thi</span><input class="input" type="date" id="st-ed" value="' + esc(s.examDate) + '"></label></div>' +
      '<div class="row2"><label class="field"><span>Tên kì thi vào lớp 10</span><input class="input" id="st-tn" value="' + esc(s.exam10Name) + '"></label><label class="field"><span>Ngày thi vào lớp 10 (theo lịch của tỉnh/thành)</span><input class="input" type="date" id="st-td" value="' + esc(s.exam10Date) + '"></label></div>' +
      '<label class="check"><input type="checkbox" id="st-r"' + (s.allowRegister ? ' checked' : '') + '> Cho phép học sinh tự đăng kí tài khoản</label>' +
      '<label class="check"><input type="checkbox" id="st-f"' + (s.feedEnabled !== false ? ' checked' : '') + '> Tự động lấy tin giáo dục mới (VnExpress, Tuổi Trẻ, Thanh Niên) mỗi 2 giờ</label>' +
      '<div class="row-btns"><button class="btn primary" type="submit">Lưu cài đặt</button>' + (App.store.refreshFeed ? '<button class="btn ghost" type="button" id="st-feed">' + icon('rss') + 'Lấy tin mới ngay</button>' : '') + '</div></form></section>' +
      '<section class="card"><h2>Sao lưu và khôi phục</h2><p class="muted">Tệp sao lưu chứa toàn bộ tài khoản (mật khẩu đã mã hóa), bài làm, câu hỏi, đề thi và tài liệu. Nên sao lưu mỗi tuần.</p>' +
      '<div class="row-btns"><button class="btn primary" id="bk-out">' + icon('download') + 'Sao lưu dữ liệu</button><label class="btn ghost file-btn">' + icon('upload') + 'Khôi phục từ tệp<input type="file" id="bk-in" accept=".json,application/json"></label></div></section>';
    U.$('#st-f').onsubmit = async function (e) {
      e.preventDefault();
      try {
        App.settings = await App.store.saveSettings({ siteName: U.$('#st-n').value.trim() || 'Bảng Xanh', tagline: U.$('#st-t').value.trim(), examName: U.$('#st-en').value.trim(), examDate: U.$('#st-ed').value, exam10Name: U.$('#st-tn').value.trim(), exam10Date: U.$('#st-td').value, allowRegister: U.$('#st-r').checked, feedEnabled: U.$('#st-f').checked });
        document.title = App.settings.siteName; U.toast('Đã lưu cài đặt.', 'ok'); App.refreshShell();
      } catch (er) { App.fail(er); }
    };
    var sf = U.$('#st-feed');
    if (sf) sf.onclick = async function () { sf.disabled = true; try { var r = await App.store.refreshFeed(); App.feed = null; U.toast('Đã lấy ' + r.count + ' tin' + (r.errors && r.errors.length ? ' (một số nguồn lỗi: ' + r.errors.join('; ') + ')' : '') + '.', 'ok'); } catch (e) { App.fail(e); } sf.disabled = false; };
    U.$('#bk-out').onclick = async function () {
      try { var data = await App.store.backup(); var name = 'sao-luu-' + new Date().toISOString().slice(0, 10) + '.json'; var txt = JSON.stringify(data); if (App.store.mode === 'server') U.download(name, txt, 'application/json'); U.textModal('Dữ liệu sao lưu', txt, name); } catch (e) { App.fail(e); }
    };
    U.$('#bk-in').onchange = async function () {
      var f = this.files[0]; if (!f) return;
      try {
        var data = JSON.parse(await f.text());
        if (!(await U.confirmBox('Khôi phục sẽ THAY THẾ toàn bộ dữ liệu hiện tại bằng dữ liệu trong tệp. Tiếp tục?', 'Khôi phục', true))) return;
        await App.store.restore(data); U.toast('Đã khôi phục. Trang sẽ tải lại.', 'ok'); setTimeout(function () { location.reload(); }, 900);
      } catch (e) { App.fail(e.userMessage ? e : new Error('Tệp không đọc được: ' + e.message)); }
    };
  }

  var TAB = { overview: tabOverview, users: tabUsers, questions: tabQuestions, exams: tabExams, docs: tabDocs, lessons: tabLessons, news: tabNews, settings: tabSettings };
})();
