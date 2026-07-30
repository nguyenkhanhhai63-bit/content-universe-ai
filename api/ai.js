const SYSTEM_FALLBACK = `Bạn là biên tập viên kịch bản TikTok tiếng Việt cho Siêu Di Động.
Hãy viết tự nhiên, logic, có cảm xúc, không quảng cáo lộ liễu.`;

function buildPrompt(b) {
  const info = `
CHỦ ĐỀ: ${b.theme || ""}
NHÂN VẬT: ${b.character || ""}
BỐI CẢNH: ${b.context || ""}
MÂU THUẪN: ${b.conflict || ""}
TWIST: ${b.twist || ""}
KẾT THÚC: ${b.ending || ""}
ĐỘ DÀI: ${b.length || ""}
`;

  if (b.mode === "polish") return `Đọc lại và viết lại kịch bản dưới đây thành bản hoàn chỉnh hơn.
Giữ ý chính nhưng sửa toàn bộ chỗ khó hiểu, ghép máy móc, lặp ý, thiếu nguyên nhân, lời thoại không tự nhiên và twist vô lý.
Đảm bảo câu đầu dễ hiểu, diễn biến liền mạch và kết giải quyết mâu thuẫn ban đầu.

${info}

KỊCH BẢN CẦN CHỈNH:
${b.draft || b.result || ""}`;

  if (b.mode === "review") return `Phân tích kịch bản dưới đây.
Chỉ rõ ngắn gọn:
1. Đoạn nào khó hiểu.
2. Chi tiết nào không logic.
3. Hook có đủ rõ và đủ mạnh không.
4. Twist có hợp lý không.
5. Đề xuất bản sửa cụ thể.

${info}

KỊCH BẢN:
${b.draft || b.result || ""}`;

  if (b.mode === "hooks") return `Viết 10 hook TikTok khác nhau từ thông tin dưới đây.
Mỗi hook 1–2 câu, phải nêu rõ nhân vật, bối cảnh và sự cố.
Không viết giải thích, chỉ đánh số 1–10.

${info}`;

  return `Viết một kịch bản TikTok Voice Over hoàn chỉnh dựa trên thông tin sau.
Kịch bản phải có Hook, Mâu thuẫn, Diễn biến, Cao trào, Twist và Kết.
Không ghép câu máy móc. Mọi diễn biến phải có nguyên nhân và nối tiếp hợp lý.

${info}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Chỉ hỗ trợ POST." });
  if (!process.env.OPENAI_API_KEY) return res.status(500).json({ error: "Chưa cấu hình OPENAI_API_KEY trên máy chủ." });

  try {
    const b = req.body || {};
    const instructions = `${b.style || SYSTEM_FALLBACK}

CÔNG THỨC PHẢI TUÂN THEO:
${b.formula || ""}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6",
        instructions,
        input: buildPrompt(b)
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || "OpenAI API trả về lỗi.";
      return res.status(response.status).json({ error: message });
    }

    const text = data.output_text ||
      (data.output || []).flatMap(x => x.content || []).find(x => x.type === "output_text")?.text;

    if (!text) return res.status(500).json({ error: "AI không trả về nội dung." });
    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Lỗi máy chủ." });
  }
}