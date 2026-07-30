import { NextResponse } from "next/server";

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
};

function buildTask(body: any): string {
  const info = body?.info || {};

  if (body?.mode === "review") {
    return `Phân tích kịch bản dưới đây theo các tiêu chí: Hook, Logic, Twist, Cảm xúc, Nhịp kể và khả năng giữ chân.
Chỉ ra lỗi cụ thể, giải thích ngắn gọn và đề xuất cách sửa thực tế.
Sau phần phân tích, viết thêm một phiên bản đã chỉnh sửa hoàn chỉnh.

KỊCH BẢN:
${body?.input || ""}`;
  }

  if (body?.mode === "rewrite") {
    return `Viết lại kịch bản dưới đây thành một bản TikTok Voice Over hoàn chỉnh.
Giữ đúng ý chính nhưng sửa toàn bộ đoạn ghép máy móc, chi tiết vô lý, câu chữ cứng và twist thiếu tự nhiên.
Kịch bản phải giống người thật đang kể chuyện, có Hook → Mâu thuẫn → Diễn biến → Cao trào → Twist → Kết.

KỊCH BẢN GỐC:
${body?.input || ""}`;
  }

  if (body?.mode === "hooks") {
    return `Viết 20 câu hook TikTok khác nhau dựa trên thông tin sau.
Mỗi hook phải:
- Có nhân vật rõ ràng.
- Có bối cảnh hoặc lý do rõ ràng.
- Có sự cố, mâu thuẫn hoặc câu nói gây chú ý.
- Dễ hiểu ngay từ câu đầu.
- Không lặp ý.
- Chỉ đánh số từ 1 đến 20, không giải thích thêm.

THÔNG TIN:
${JSON.stringify(info, null, 2)}`;
  }

  return `Viết một kịch bản TikTok Voice Over hoàn chỉnh theo cấu trúc:
Hook → Mâu thuẫn → Diễn biến → Cao trào → Twist → Kết.

Yêu cầu:
- Kể như một câu chuyện thật vừa xảy ra tại shop Siêu Di Động.
- Câu đầu phải rõ ai đang làm gì, ở đâu và vì sao có chuyện.
- Ngôn ngữ tự nhiên, bình dân, không viết kiểu MC.
- Không quảng cáo lộ liễu, không review khô khan.
- Không ghép máy móc các trường thông tin.
- Mọi chi tiết phải liên kết logic với nhau.
- Twist phải hợp lý với diễn biến trước đó.
- Có thể dùng audio tag ElevenLabs V3 ở các đoạn phù hợp, nhưng hook không bắt buộc có tag.
- Không dùng các từ: "chốt đơn", "siêu phẩm", "xuống tiền", "cấu hình khủng".

THÔNG TIN KỊCH BẢN:
${JSON.stringify(info, null, 2)}`;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chưa cấu hình GEMINI_API_KEY trên Vercel." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const task = buildTask(body);

    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const systemInstruction =
      body?.style ||
      `Bạn là biên tập viên TikTok chuyên viết nội dung cho Siêu Di Động.
Viết tiếng Việt tự nhiên, logic, có cảm xúc, giống người thật kể chuyện.
Ưu tiên câu chuyện khách hàng tại shop, không quảng cáo lộ liễu và không dùng văn phong AI.`;

    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: task }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: body?.mode === "hooks" ? 3000 : 5000,
        },
      }),
      cache: "no-store",
    });

    const data = (await geminiResponse.json()) as GeminiResponse;

    if (!geminiResponse.ok) {
      const message =
        data?.error?.message ||
        `Gemini API trả về lỗi ${geminiResponse.status}.`;

      return NextResponse.json(
        { error: message },
        { status: geminiResponse.status }
      );
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || "")
        .join("")
        .trim() || "";

    if (!text) {
      const blockReason = data?.promptFeedback?.blockReason;

      return NextResponse.json(
        {
          error: blockReason
            ? `Gemini không tạo nội dung vì: ${blockReason}.`
            : "Gemini không trả về nội dung.",
        },
        { status: 500 }
      );
    }

    // Giữ đúng định dạng mà giao diện V6 hiện tại đang sử dụng.
    return NextResponse.json({ text });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Lỗi không xác định khi gọi Gemini.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
