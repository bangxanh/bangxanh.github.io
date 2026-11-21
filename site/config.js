/* Bản công khai: ai cũng vào học được, không cần máy chủ */
window.BX_CONFIG = {
  edition: 'public',
  /* Trợ lý AI: điền địa chỉ máy chủ trung gian (Cloudflare Worker) sau khi làm theo worker/HUONG-DAN-AI.md.
     Để trống thì các nút AI hiện "sắp ra mắt". Ví dụ: endpoint: 'https://bangxanh-ai.ten-ban.workers.dev' */
  ai: { endpoint: 'https://bangxanh-ai.hoang59876.workers.dev' }
};
