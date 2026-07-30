import { NextResponse } from "next/server";

type ScoreSet = {
  hook: number;
  logic: number;
  twist: number;
  emotion: number;
  retention: number;
};

function cleanJson(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function clampScore(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(10, Math.round(number * 10) / 10));
}

async function generateWithModel(
  model: string,
  apiKey: string,
  systemInstruction: string,
  prompt: string,
  jsonMode = false
) {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(endpoint, {
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
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: jsonMode ? 0.45 : 0.92,
        topP: 0.95,
        maxOutputTokens: 7000,
        ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini lỗi ${response.status}.`);
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    throw new Error("Gemini không trả về nội dung.");
  }

  return text;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chưa cấu hình GEMINI_API_KEY trên Vercel." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const mode = body?.mode || "create";
    const style = body?.style || "";
    const userPrompt = body?.prompt || body?.input || "";
    const theme = body?.theme || "Tự do";
    const versions = Math.max(1, Math.min(5, Number(body?.versions) || 1));
    const formula = body?.formula || {};
    const hookLibrary = Array.isArray(body?.hooks) ? body.hooks : [];

    const systemInstruction = `${style}

Bạn đang vận hành Content Universe V7.
Mục tiêu là tạo nội dung có thể đọc thẳng bằng giọng Adam ElevenLabs V3.
Không trình bày như bài phân tích trừ khi người dùng yêu cầu chấm điểm.
Không thêm lời dẫn kiểu "Dưới đây là..." hoặc "Phiên bản của bạn...".
Không dùng markdown heading trong kịch bản, trừ nhãn "PHIÊN BẢN A/B/C" khi tạo nhiều phiên bản.
Không đánh số từng đoạn.
Mỗi phiên bản phải là một câu chuyện hoàn chỉnh, tự nhiên và có logic nhân quả rõ ràng.`;

    let prompt = "";
    let jsonMode = false;

    if (mode === "review") {
      jsonMode = true;
      prompt = `Phân tích kịch bản sau theo đúng JSON schema bên dưới.

JSON bắt buộc:
{
  "scores": {
    "hook": 0-10,
    "logic": 0-10,
    "twist": 0-10,
    "emotion": 0-10,
    "retention": 0-10
  },
  "analysis": "Phân tích chi tiết bằng tiếng Việt, có các phần: Điểm mạnh, Điểm yếu, Cách sửa, Bản viết lại gợi ý."
}

Tiêu chí:
- Hook có rõ nhân vật, bối cảnh và sự cố không.
- Mạch kể có nguyên nhân và kết quả rõ không.
- Twist có được dẫn dắt hay bị gượng ép.
- Cảm xúc có tự nhiên, hợp giọng kể không.
- Nhịp kể có giữ người xem tới cuối không.

KỊCH BẢN:
${body?.input || ""}`;
    } else if (mode === "rewrite") {
      prompt = `Viết lại kịch bản sau thành một bản TikTok Voice Over hoàn chỉnh.
Giữ ý chính nhưng sửa toàn bộ câu ghép máy móc, đoạn thừa, lỗi logic và twist vô lý.
Không đánh số từng đoạn.
Audio tag phải đi cùng câu thoại hoặc cảm xúc.
Kết quả chỉ gồm kịch bản đã viết lại.

KỊCH BẢN GỐC:
${body?.input || ""}`;
    } else if (mode === "hooks") {
      prompt = `Viết đúng 20 hook TikTok khác nhau dựa trên tình huống sau.

TÌNH HUỐNG:
${userPrompt}

CHỦ ĐỀ:
${theme}

Yêu cầu:
- Mỗi hook chỉ 1-2 câu.
- Câu đầu phải cho biết rõ ai, ở đâu và chuyện gì xảy ra.
- Có mâu thuẫn hoặc câu nói khiến người xem muốn nghe tiếp.
- Không lặp ý, không lặp cách mở câu.
- Không chê khách nghèo.
- Chỉ đánh số từ 1 đến 20 trong danh sách hook.

Một số hook trong kho để hiểu phong cách, tuyệt đối không sao chép:
${hookLibrary.map((hook: { text?: string }) => `- ${hook.text || ""}`).join("\n")}`;
    } else {
      const versionLabels = ["A", "B", "C", "D", "E"].slice(0, versions);
      prompt = `Viết ${versions} phiên bản kịch bản TikTok Voice Over hoàn chỉnh.

Ý TƯỞNG NGƯỜI DÙNG:
${userPrompt}

CHỦ ĐỀ:
${theme}

CÔNG THỨC GỢI Ý:
Tên: ${formula?.name || "Tự chọn"}
Mô tả: ${formula?.description || ""}
Cấu trúc: ${formula?.template || "Hook → Mâu thuẫn → Diễn biến → Cao trào → Twist → Kết"}

Yêu cầu bắt buộc:
- Không ghép lại nguyên văn các trường thông tin.
- Tự suy luận để nối mọi chi tiết thành một câu chuyện có nguyên nhân và kết quả.
- Hook là một câu mở đầu hoàn chỉnh, rõ nhân vật, bối cảnh và sự cố.
- Sau hook mới triển khai cảm xúc và diễn biến.
- Có ít nhất một câu thoại tự nhiên.
- Twist phải được dẫn dắt từ diễn biến trước đó.
- Kết thúc hợp lý, không quảng cáo lộ liễu.
- Không đánh số từng đoạn.
- Độ dài mỗi phiên bản khoảng 220-380 từ.
- Không tự bịa tên máy hoặc thông số nếu người dùng chưa cung cấp.
- Nếu có audio tag, dùng đúng kiểu: [surprised] Hả??? Cả phòng họp im bặt.
- Không để tag đứng một mình.

${
  versions > 1
    ? `Mỗi bản phải khác nhau rõ rệt về góc kể hoặc nhịp kể.
Đặt nhãn đúng theo thứ tự:
${versionLabels.map((label) => `PHIÊN BẢN ${label}`).join("\n")}`
    : "Chỉ trả về nội dung kịch bản, không thêm tiêu đề giải thích."
}`;
    }

    const configuredModel = process.env.GEMINI_MODEL?.trim();
    const candidates = [
      configuredModel,
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-2.5-flash-lite",
    ].filter((item, index, array): item is string => Boolean(item) && array.indexOf(item) === index);

    let text = "";
    let lastError: Error | null = null;

    for (const model of candidates) {
      try {
        text = await generateWithModel(
          model,
          apiKey,
          systemInstruction,
          prompt,
          jsonMode
        );
        lastError = null;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Lỗi Gemini.");
        const message = lastError.message.toLowerCase();
        const canFallback =
          message.includes("not found") ||
          message.includes("no longer available") ||
          message.includes("not supported") ||
          message.includes("model");
        if (!canFallback) break;
      }
    }

    if (lastError || !text) {
      throw lastError || new Error("Không tìm thấy model Gemini phù hợp.");
    }

    if (mode === "review") {
      try {
        const parsed = JSON.parse(cleanJson(text));
        const scores: ScoreSet = {
          hook: clampScore(parsed?.scores?.hook),
          logic: clampScore(parsed?.scores?.logic),
          twist: clampScore(parsed?.scores?.twist),
          emotion: clampScore(parsed?.scores?.emotion),
          retention: clampScore(parsed?.scores?.retention),
        };
        return NextResponse.json({
          text: String(parsed?.analysis || "Gemini chưa trả về phần phân tích."),
          scores,
        });
      } catch {
        return NextResponse.json({
          text,
          scores: { hook: 0, logic: 0, twist: 0, emotion: 0, retention: 0 },
        });
      }
    }

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi AI không xác định." },
      { status: 500 }
    );
  }
}
