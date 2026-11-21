/* Chấm điểm dùng chung cho trình duyệt và máy chủ.
   Thang điểm theo định dạng đề thi tốt nghiệp THPT từ năm 2025:
   - Trắc nghiệm nhiều lựa chọn: 0,25 điểm/câu
   - Đúng/Sai (4 ý): đúng 1 ý 0,1; 2 ý 0,25; 3 ý 0,5; 4 ý 1 điểm
   - Trả lời ngắn: 0,5 điểm/câu (Toán), 0,25 điểm/câu (môn khác)
   Điểm cuối cùng quy về thang 10. */
(function (root) {
  var TF_SCALE = [0, 0.1, 0.25, 0.5, 1];

  function toNumber(s) {
    if (s === null || s === undefined) return NaN;
    var t = String(s).trim().replace(/\s+/g, '').replace(/−/g, '-').replace(/,/g, '.');
    if (t === '') return NaN;
    var m = t.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (m) { var d = parseFloat(m[2]); return d === 0 ? NaN : parseFloat(m[1]) / d; }
    if (/^-?\d*\.?\d+(e-?\d+)?$/i.test(t)) return parseFloat(t);
    return NaN;
  }
  function norm(s) {
    return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' ').replace(/−/g, '-');
  }
  function shortOk(given, accepted) {
    if (given === undefined || given === null || String(given).trim() === '') return false;
    var g = toNumber(given);
    for (var i = 0; i < accepted.length; i++) {
      var a = accepted[i];
      var n = toNumber(a);
      if (!isNaN(n) && !isNaN(g)) {
        if (Math.abs(n - g) <= 1e-9 + Math.abs(n) * 1e-9) return true;
      } else if (norm(a) === norm(given)) return true;
    }
    return false;
  }
  function maxPoints(q) {
    if (q.t === 'tf') return 1;
    if (q.t === 'sa') return q.s === 'toan' ? 0.5 : 0.25;
    if (q.t === 'match') return 0.5;
    return 0.25;
  }
  /* given: mc → số thứ tự đáp án; tf → mảng 4 phần tử true/false/null; sa → chuỗi;
     ord → mảng chỉ số các mục theo thứ tự em xếp; match → mảng: vế trái k nối với vế phải số given[k] */
  function gradeOne(q, given) {
    var max = maxPoints(q), pts = 0, ok = false, nRight = 0, answered = false;
    if (q.t === 'mc') {
      answered = given !== undefined && given !== null && given !== '';
      ok = answered && Number(given) === Number(q.a);
      pts = ok ? max : 0;
    } else if (q.t === 'tf') {
      var arr = Array.isArray(given) ? given : [];
      for (var i = 0; i < 4; i++) {
        if (arr[i] === true || arr[i] === false) answered = true;
        if (arr[i] === q.a[i]) nRight++;
      }
      pts = TF_SCALE[nRight];
      ok = nRight === 4;
    } else if (q.t === 'ord') {
      var seq = Array.isArray(given) ? given : [];
      answered = seq.length > 0;
      ok = seq.length === q.o.length && seq.every(function (v, k) { return Number(v) === k || q.o[Number(v)] === q.o[k]; });
      pts = ok ? max : 0;
    } else if (q.t === 'match') {
      var mm = Array.isArray(given) ? given : [];
      for (var j = 0; j < q.o.length; j++) {
        if (mm[j] !== undefined && mm[j] !== null && mm[j] !== '') answered = true;
        if (Number(mm[j]) === j || (mm[j] !== null && mm[j] !== undefined && q.r[Number(mm[j])] === q.r[j])) nRight++;
      }
      ok = nRight === q.o.length;
      pts = Math.round(max * nRight / Math.max(1, q.o.length) * 100) / 100;
    } else {
      answered = given !== undefined && given !== null && String(given).trim() !== '';
      ok = shortOk(given, q.a || []);
      pts = ok ? max : 0;
    }
    return { ok: ok, pts: pts, max: max, nRight: nRight, answered: answered };
  }
  function gradeAll(questions, answers) {
    var earned = 0, total = 0, correct = 0, detail = [];
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i], g = answers ? answers[q.id] : undefined;
      var r = gradeOne(q, g);
      earned += r.pts; total += r.max; if (r.ok) correct++;
      detail.push({ qid: q.id, ok: r.ok, pts: Math.round(r.pts * 100) / 100, given: g === undefined ? null : g });
    }
    var score = total > 0 ? Math.round((earned / total) * 1000) / 100 : 0;
    return { score: score, earned: Math.round(earned * 100) / 100, total: Math.round(total * 100) / 100, correct: correct, count: questions.length, detail: detail };
  }
  var Grade = { gradeOne: gradeOne, gradeAll: gradeAll, maxPoints: maxPoints, toNumber: toNumber, TF_SCALE: TF_SCALE };
  if (typeof module !== 'undefined' && module.exports) module.exports = Grade; else root.Grade = Grade;
})(this);
