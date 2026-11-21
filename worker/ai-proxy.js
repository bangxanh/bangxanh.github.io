/* Bảng Xanh – máy chủ trung gian cho Trợ lý AI (Cloudflare Worker, gói miễn phí).
   - Mặc định dùng mô hình AI miễn phí của Cloudflare Workers AI (biến liên kết AI, không cần khóa).
   - Nếu có biến bí mật ANTHROPIC_API_KEY thì dùng Claude (chất lượng tốt hơn); trang web không bao giờ thấy khóa.
   - Chỉ nhận yêu cầu từ trang của mình (ALLOWED_ORIGINS).
   - Giới hạn số câu hỏi mỗi địa chỉ IP (mặc định 30 câu/giờ) để tránh bị lạm dụng.
   - Lời dặn hệ thống an toàn cho học sinh: chỉ hỗ trợ học tập, ngôn ngữ phù hợp lứa tuổi,
     không hỏi/lưu thông tin cá nhân, luôn nói rõ mình là AI.
   - Không lưu nội dung trò chuyện.
   Cấu hình (Settings → Bindings / Variables):
     AI               liên kết Workers AI (bắt buộc nếu không dùng Claude)
     ANTHROPIC_API_KEY (bí mật, tùy chọn) – có thì dùng Claude, MODEL mặc định claude-haiku-5-5
     CF_MODEL         mô hình Workers AI, mặc định @cf/google/gemma-4-26b-a4b-it
     ALLOWED_ORIGINS  mặc định https://bangxanh.github.io
     RATE_PER_HOUR    mặc định 30 */

const SAFETY = `Bạn là "Trợ lý AI Bảng Xanh", trợ lý học tập của trang học miễn phí Bảng Xanh dành cho học sinh Việt Nam từ lớp 1 đến lớp 12 (chương trình GDPT 2018, sách Kết nối tri thức với cuộc sống). Người dùng có thể là trẻ em và thanh thiếu niên.

Nguyên tắc bắt buộc:
- Luôn trả lời bằng tiếng Việt chuẩn, thân thiện, xưng "mình" và gọi người học là "em". Nếu được hỏi, nói rõ mình là trí tuệ nhân tạo, không phải thầy cô hay con người.
- Chỉ hỗ trợ việc học: giải thích kiến thức, gợi ý cách làm bài, chữa bài, ôn tập, kỹ năng học tập. Với chủ đề ngoài học tập, nhẹ nhàng từ chối và hướng em quay lại bài học.
- Nội dung phải phù hợp lứa tuổi học sinh: không bạo lực, không nội dung người lớn, không chất kích thích, cờ bạc, không ngôn từ thù ghét; không hướng dẫn điều nguy hiểm hoặc trái pháp luật.
- Không hỏi, không ghi nhớ, không khuyến khích chia sẻ thông tin cá nhân (họ tên đầy đủ, địa chỉ, trường, số điện thoại, mạng xã hội, hình ảnh). Nếu em tự chia sẻ, nhắc em không nên làm vậy.
- Không khuyến khích gặp người lạ ngoài đời, không giữ bí mật với cha mẹ, thầy cô.
- Nếu em có dấu hiệu buồn bã nghiêm trọng, bị bắt nạt, bị xâm hại hoặc muốn làm hại bản thân: trả lời ân cần, khuyên em nói ngay với cha mẹ, thầy cô hoặc người lớn tin cậy, và gọi Tổng đài quốc gia bảo vệ trẻ em 111 (miễn phí, 24/7). Không đưa thông tin có thể gây hại.
- Trung thực: nếu không chắc chắn thì nói rõ, khuyên em kiểm tra lại với SGK hoặc thầy cô. Không bịa số liệu.
- Ưu tiên giúp em tự hiểu: gợi ý từng bước, đặt câu hỏi dẫn dắt; chỉ đưa lời giải đầy đủ khi em đã thử hoặc yêu cầu chữa bài.
- Viết ngắn gọn, rõ ràng, dùng ký hiệu toán học bằng ký tự Unicode (x², √, π, ≤, ≥, ∫, →). Không dùng LaTeX hay bảng phức tạp.`;

const MODE_HINT = {
  chat: 'Em đang hỏi chung về việc học.',
  lesson: 'Em đang học bài nêu trong phần "Ngữ cảnh". Giải thích bám sát bài đó, dùng ví dụ dễ hiểu.',
  hint: 'Em đang làm một câu hỏi và nhờ GỢI Ý. Tuyệt đối không cho đáp án cuối cùng; chỉ gợi ý hướng làm và bước đầu tiên.',
  explain: 'Em đã làm xong câu hỏi và muốn được CHỮA BÀI. Chỉ ra chỗ đúng/sai trong cách em làm (nếu có), giải thích lời giải đúng từng bước và lưu ý lỗi hay gặp.'
};

function cors(origin, allowed) {
  const ok = allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, headers || {}) });
}
const hits = new Map(); // giới hạn theo IP trong bộ nhớ của từng phiên bản Worker
function limited(ip, perHour) {
  const now = Date.now(), win = 3600 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  if (arr.length >= perHour) { hits.set(ip, arr); return true; }
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) for (const [k, v] of hits) { if (!v.length || now - v[v.length - 1] > win) hits.delete(k); }
  return false;
}
const clip = (s, n) => String(s == null ? '' : s).slice(0, n);

/* Đổi kí hiệu LaTeX mà mô hình hay dùng sang kí tự thường cho dễ đọc trên trang. */
function wrap(x) { return /^[\w.,√π\\]+$/.test(x.trim()) ? x.trim() : '(' + x.trim() + ')'; }
function tidy(t) {
  const sym = { cdot: '·', times: '×', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', pi: 'π', alpha: 'α', beta: 'β', gamma: 'γ', Delta: 'Δ', delta: 'δ', lambda: 'λ', omega: 'ω', varphi: 'φ', phi: 'φ', infty: '∞', Rightarrow: '⇒', Leftrightarrow: '⇔', to: '→', rightarrow: '→', approx: '≈', pm: '±', in: '∈', mathbb: '', circ: '°', degree: '°', left: '', right: '', quad: ' ', text: '', mathrm: '' };
  let s = String(t || '');
  for (let k = 0; k < 3; k++) s = s.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, (m, a, b) => wrap(a) + '/' + wrap(b)).replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');
  s = s.replace(/\\(sin|cos|tan|cot|log|ln|lim|max|min)\b/g, '$1')
    .replace(/\\([A-Za-z]+)/g, (m, w) => (Object.prototype.hasOwnProperty.call(sym, w) ? sym[w] : w))
    .replace(/\^\{?2\}?(?![0-9])/g, '²').replace(/\^\{?3\}?(?![0-9])/g, '³').replace(/_\{?([0-9])\}?/g, (m, d) => '₀₁₂₃₄₅₆₇₈₉'[d])
    .replace(/\$\$?/g, '').replace(/\\[()\[\]]/g, '').replace(/[{}]/g, '');
  return s;
}

export default {
  async fetch(request, env) {
    const allowed = String(env.ALLOWED_ORIGINS || 'https://bangxanh.github.io').split(',').map((x) => x.trim()).filter(Boolean);
    const origin = request.headers.get('Origin') || '';
    const h = cors(origin, allowed);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/') return json({ ok: true, service: 'Bảng Xanh AI' }, 200, h);
    if (request.method !== 'POST' || url.pathname !== '/ask') return json({ error: 'Không tìm thấy.' }, 404, h);
    if (!allowed.includes(origin)) return json({ error: 'Trang này không được phép dùng trợ lý.' }, 403, h);
    if (!env.ANTHROPIC_API_KEY && !env.AI) return json({ error: 'Trợ lý AI chưa được cấu hình.' }, 503, h);
    const ip = request.headers.get('CF-Connecting-IP') || 'x';
    if (limited(ip, Number(env.RATE_PER_HOUR || 30))) return json({ error: 'Em đã hỏi nhiều quá, nghỉ một lát (khoảng 1 giờ) rồi hỏi tiếp nhé.' }, 429, h);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'Yêu cầu không hợp lệ.' }, 400, h); }
    const mode = ['chat', 'lesson', 'hint', 'explain', 'grade'].includes(body.mode) ? body.mode : 'chat';
    const grade = Number(body.grade) >= 1 && Number(body.grade) <= 12 ? Number(body.grade) : null;
    let system = SAFETY + '\n\nNgữ cảnh: ' + (clip(body.context, 300) || 'không có') + (grade ? ' · Học sinh lớp ' + grade + ' (điều chỉnh cách giải thích cho phù hợp).' : '');
    let messages;
    if (mode === 'grade') {
      const t = body.task || {};
      system += '\n\nNhiệm vụ: CHẤM VÀ CHỮA bài tự luận của học sinh theo đáp án mẫu và tiêu chí. Trả lời theo cấu trúc:\n1) Điểm ước tính: x/10 (nói rõ đây là điểm tham khảo).\n2) Em đã làm tốt: …\n3) Chỗ cần sửa: chỉ ra từng lỗi cụ thể và cách sửa.\n4) Lời giải gọn đúng (nếu bài làm còn sai).\nKhông chấm khắt khe với lỗi trình bày nhỏ; khen ngợi cụ thể để động viên.';
      const rubric = Array.isArray(t.rubric) ? t.rubric.slice(0, 10).map((r) => '- ' + clip(r.c, 200) + ' (' + Number(r.p || 1) + ' điểm)').join('\n') : '';
      messages = [{ role: 'user', content: 'ĐỀ BÀI:\n' + clip(t.question, 1500) + '\n\nĐÁP ÁN MẪU:\n' + (Array.isArray(t.sample) ? t.sample.slice(0, 12).map((x) => clip(x, 400)).join('\n') : '') + '\n\nTIÊU CHÍ CHẤM:\n' + rubric + '\n\nBÀI LÀM CỦA HỌC SINH:\n' + clip(t.answer, 3000) }];
    } else {
      system += '\n\nYêu cầu: ' + MODE_HINT[mode];
      messages = (Array.isArray(body.messages) ? body.messages : []).slice(-8)
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
        .map((m) => ({ role: m.role, content: clip(m.content, 3200) }));
      while (messages.length && messages[0].role !== 'user') messages.shift();
      if (!messages.length) return json({ error: 'Em chưa nhập câu hỏi.' }, 400, h);
    }

    const maxTok = mode === 'grade' ? 2200 : 1800;
    try {
      if (env.ANTHROPIC_API_KEY) {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
          body: JSON.stringify({ model: env.MODEL || 'claude-haiku-5-5', max_tokens: maxTok, system, messages })
        });
        const j = await r.json();
        if (!r.ok) return json({ error: r.status === 429 ? 'Trợ lý AI đang quá tải, em thử lại sau ít phút.' : 'Trợ lý AI tạm thời gặp lỗi, em thử lại sau.' }, 502, h);
        const text = (j.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
        return json({ text, by: 'claude' }, 200, h);
      }
      const model = env.CF_MODEL || '@cf/google/gemma-4-26b-a4b-it';
      const out = await env.AI.run(model, {
        messages: [{ role: 'system', content: system }].concat(messages),
        max_completion_tokens: maxTok,
        temperature: 0.4,
        chat_template_kwargs: { enable_thinking: false }
      });
      let text = '', cut = false;
      if (out && Array.isArray(out.choices) && out.choices[0]) {
        const m = out.choices[0].message || {};
        cut = out.choices[0].finish_reason === 'length';
        text = typeof m.content === 'string' ? m.content : Array.isArray(m.content) ? m.content.map((c) => c.text || '').join('') : '';
      } else if (out && typeof out.response === 'string') text = out.response;
      text = tidy(text.replace(/<think>[\s\S]*?<\/think>/g, '').trim());
      if (cut) text += '\n\n(Câu trả lời dài nên bị cắt bớt – em hỏi "Giải thích tiếp" để xem phần còn lại.)';
      if (!text) return json({ error: 'Trợ lý AI chưa trả lời được, em hỏi lại theo cách khác nhé.' }, 502, h);
      return json({ text, by: 'workers-ai' }, 200, h);
    } catch (e) {
      const msg = String(e && e.message || e);
      if (/limit|quota|neuron|429|capacity/i.test(msg)) return json({ error: 'Hôm nay trợ lý AI đã dùng hết lượt miễn phí, em quay lại vào ngày mai nhé.' }, 429, h);
      return json({ error: 'Không kết nối được tới trợ lý AI.' }, 502, h);
    }
  }
};
