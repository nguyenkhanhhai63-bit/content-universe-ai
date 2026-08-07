import { NextResponse } from "next/server";

type Scores = {
  hook: number;
  drama: number;
  twist: number;
  retention: number;
  natural: number;
  overall: number;
};

function stripJson(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
}

function score(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(10, Math.round(number * 10) / 10));
}

async function runGemini(
  model: string,
  apiKey: string,
  systemInstruction: string,
  prompt: string,
  jsonMode = false
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: jsonMode ? 0.4 : 0.92,
          topP: 0.95,
          maxOutputTokens: 8000,
          ...(jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || `Gemini lỗi ${response.status}.`);
  }

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text || "")
      .join("")
      .trim() || "";

  if (!text) throw new Error("Gemini không trả về nội dung.");
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
    const style = String(body?.style || "");
    const idea = String(body?.idea || "");
    const input = String(body?.input || "");
    const theme = String(body?.theme || "Tự do");
    const buyerType = String(body?.buyerType || "Khách hàng");
    const companion = String(body?.companion || "Đi một mình");
    const location = String(body?.location || "Siêu Di Động Quy Nhơn");
    const hookSpeaker = String(body?.hookSpeaker || "Người mua");
    const openingEmotion = String(body?.openingEmotion || "Căng thẳng");
    const scriptLength = String(body?.scriptLength || "short");
    const lengthInstruction =
      scriptLength === "long"
        ? "Kịch bản dài khoảng 90–120 giây, diễn biến chi tiết hơn nhưng không lan man."
        : scriptLength === "medium"
          ? "Kịch bản vừa khoảng 60–90 giây, đủ diễn biến và twist."
          : "Kịch bản ngắn khoảng 45–60 giây, câu gọn, nhịp nhanh, vào thẳng vấn đề.";
    const versions = Math.max(1, Math.min(5, Number(body?.versions) || 1));
    const formula = body?.formula || {};
    const hooks = Array.isArray(body?.hooks) ? body.hooks : [];
    const history = Array.isArray(body?.history) ? body.history : [];
    const promptTemplate = body?.promptTemplate || null;
    const knowledge = body?.knowledge || {};
    const rewriteStyle = String(body?.rewriteStyle || "tối ưu tổng thể");
    const learningExamples = Array.isArray(body?.learningExamples) ? body.learningExamples.slice(0, 12) : [];
    const communityExamples = String(body?.communityExamples || "");
    const communityCopiedExamples = Array.isArray(body?.communityCopiedExamples) ? body.communityCopiedExamples.slice(0, 80) : [];
    const communitySettings = body?.communitySettings || {};
    const existingQuestions = Array.isArray(body?.existingQuestions) ? body.existingQuestions.slice(0, 120) : [];
    const communityFeedback = String(body?.feedback || "");
    const communityQuestionsInput = Array.isArray(body?.questions) ? body.questions.slice(0, 80) : [];

    const renderTemplate = (template: string) =>
      template
        .replaceAll("{{buyer}}", buyerType)
        .replaceAll("{{companion}}", companion)
        .replaceAll("{{location}}", location)
        .replaceAll("{{hookSpeaker}}", hookSpeaker)
        .replaceAll("{{emotion}}", openingEmotion)
        .replaceAll("{{topic}}", theme)
        .replaceAll("{{formula}}", formula?.name || "Tự chọn")
        .replaceAll("{{length}}", lengthInstruction)
        .replaceAll("{{story}}", idea || input);

    const templateSystemPrompt = promptTemplate?.systemPrompt
      ? renderTemplate(String(promptTemplate.systemPrompt))
      : "";

    const systemInstruction = `${style}

${templateSystemPrompt}

Bạn đang vận hành Content Universe V25.
Bạn là trợ lý content làm việc lâu năm tại Siêu Di Động.
Kết quả phải viết bằng tiếng Việt tự nhiên và có thể đọc thẳng bằng giọng Adam ElevenLabs V3.
Không thêm lời dẫn kiểu "Dưới đây là".
Không trình bày như bài luận.
Khi người dùng đang trò chuyện, hãy nhớ nội dung các tin nhắn gần nhất được cung cấp.
Không dùng markdown heading trong kịch bản, trừ nhãn PHIÊN BẢN A/B/C khi tạo nhiều bản.${learningExamples.length ? `

DỮ LIỆU PHONG CÁCH ĐÃ ĐƯỢC NGƯỜI DÙNG XÁC NHẬN BẰNG THAO TÁC COPY:
${learningExamples.map((item: any, index: number) => `MẪU ${index + 1} · ${item.theme || "Tự do"} · đã Copy ${item.copyCount || 1} lần
${String(item.content || "").slice(0, 1800)}`).join("\n\n---\n\n")}

Hãy học nhịp kể, độ dài câu, cấu trúc hook, mâu thuẫn, twist và cách kết. Ưu tiên đặc điểm xuất hiện trong mẫu được Copy nhiều lần. Tuyệt đối không sao chép nguyên văn hoặc tái sử dụng y hệt tình huống. Không nhắc tới dữ liệu học trong kết quả.` : ""}`;

    let prompt = "";
    let jsonMode = false;

    if (mode === "community_refine") {
      jsonMode = true;
      prompt = `Bạn đang chỉnh sửa một danh sách câu hỏi mua điện thoại dạng cộng đồng.

DANH SÁCH HIỆN TẠI:
${communityQuestionsInput.map((item: string, index: number) => `${index + 1}. ${item}`).join("\n")}

GÓP Ý CỦA NGƯỜI DÙNG:
${communityFeedback || "(không có)"}

CÂU MẪU DÙNG ĐỂ HỌC PHONG CÁCH:
${communityExamples || "(chưa có mẫu)"}

CÂU ĐÃ COPY VÀ ĐƯỢC XEM LÀ ĐẠT:
${communityCopiedExamples.length ? communityCopiedExamples.map((item: string, index: number) => `${index + 1}. ${item}`).join("\n") : "(chưa có)"}

YÊU CẦU:
- Sửa TOÀN BỘ danh sách theo đúng góp ý, nhưng giữ tinh thần câu hỏi tự nhiên như người thật trong group điện thoại.
- Không viết quá chỉnh chu; có thể lược chủ ngữ, viết tắt vừa phải, câu ngắn hoặc xuống dòng tự nhiên.
- Nếu góp ý nói "ngắn hơn", "đời hơn", "ưu tiên iPhone", "ít viết tắt", "thêm câu hỏi giá", v.v. thì phải áp dụng rõ ràng.
- Không sao chép nguyên văn câu mẫu.
- Không biến câu hỏi thành quảng cáo, review giả hay lời khen cửa hàng.
- Giữ số lượng câu gần bằng danh sách gốc, trừ khi góp ý yêu cầu khác.
- Chỉ trả JSON hợp lệ:
{"questions":["câu 1","câu 2"]}`;
    } else if (mode === "community") {
      jsonMode = true;
      const quantity = Math.max(1, Math.min(50, Number(communitySettings?.quantity) || 12));
      const iphoneWeight = Math.max(0, Math.min(100, Number(communitySettings?.iphoneWeight) || 70));
      const naturalness = Math.max(40, Math.min(100, Number(communitySettings?.naturalness) || 90));
      const omitSubject = communitySettings?.omitSubject !== false;
      const communityLocation = String(communitySettings?.location || "Quy Nhơn").trim();
      const communityIntent = String(communitySettings?.intent || "Tự chọn").trim();
      const communityBudget = String(communitySettings?.budget || "").trim();

      prompt = `Tạo đúng ${quantity} CÂU HỎI / NHU CẦU MUA ĐIỆN THOẠI dạng cộng đồng.

Mục tiêu: tạo bản nháp câu hỏi tự nhiên để nghiên cứu nhu cầu và soạn nội dung thảo luận.
Không bịa trải nghiệm đã mua, đã dùng, đã được cửa hàng phục vụ hoặc đánh giá giả.

PHONG CÁCH MẪU NGƯỜI DÙNG CUNG CẤP:
${communityExamples || "(chưa có mẫu)"}

CÁC CÂU NGƯỜI DÙNG ĐÃ COPY VÀ XÁC NHẬN LÀ ĐẠT:
${communityCopiedExamples.length ? communityCopiedExamples.map((item: string, index: number) => `${index + 1}. ${item}`).join("\n") : "(chưa có)"}

THIẾT LẬP:
- Tỷ lệ chủ đề: khoảng ${iphoneWeight}% iPhone, ${100 - iphoneWeight}% Android.
- Độ đời thường: ${naturalness}/100.
- ${omitSubject ? "Ưu tiên mạnh câu lược bỏ chủ ngữ." : "Có thể dùng hoặc không dùng chủ ngữ."}
- Khu vực tham khảo: ${communityLocation || "không bắt buộc"}.
- Dạng câu hỏi: ${communityIntent}.
- Ngân sách tham khảo: ${communityBudget || "tự chọn đa dạng"}.

QUY TẮC QUAN TRỌNG:
- iPhone là chủ đề chính nếu tỷ lệ iPhone cao. Có thể dùng cách gọi như ip11, 13pr, 14prm, 15pl, 15pr, 16 thường... khi phù hợp.
- Android vẫn phải đa dạng Samsung, Xiaomi, Redmi, Oppo, OnePlus, vivo, Honor... nhưng không bịa model chưa được nhắc nếu không cần thiết.
- Ưu tiên những câu rất ngắn như: "15pr giờ bn", "tìm đth 2-3tr chữa cháy", "lên 14pro 256 bù nhiêu ạ".
- Không viết câu nào cũng đầy đủ ngữ pháp. Có thể thiếu chủ ngữ, thiếu dấu chấm, viết tắt, dùng "kh", "ko", "đc", "bn", "g", "v", "ạ", "pr", "prm", "pl" với tần suất tự nhiên.
- Không cố tình làm sai chính tả mọi câu. Phải có độ hỗn hợp như người thật trong group.
- Có câu 1 dòng, có câu 2-3 dòng, có câu chỉ 4-8 từ.
- Có thể hỏi giá, máy chữa cháy, mua cho người lớn, đổi máy bù tiền, máy lỗi màn/pin/Face ID, mua gấp trong ngày, mua số lượng, so sánh 2 máy.
- Không nhồi "mọi người ơi", "các bác ơi", "anh em ơi" vào tất cả câu.
- Không dùng văn quảng cáo, không tự khen Siêu Di Động, không chèn tên cửa hàng trừ khi câu hỏi có nhu cầu địa phương hợp lý.
- Không lặp y hệt câu mẫu. Học nhịp câu và từ vựng, rồi tạo câu mới.
- Tránh lặp hoặc tạo câu quá giống danh sách câu đã sinh gần đây.

CÂU ĐÃ SINH GẦN ĐÂY:
${existingQuestions.length ? existingQuestions.map((item: string) => `- ${item}`).join("\n") : "(chưa có)"}
- Không đánh số trong nội dung câu.
- Chỉ trả về JSON hợp lệ theo dạng:
{"questions":["câu 1","câu 2"]}`;
    } else if (mode === "chat") {
      const transcript = history
        .map((item: { role?: string; content?: string }) =>
          `${item.role === "assistant" ? "AI" : "Người dùng"}: ${item.content || ""}`
        )
        .join("\n\n");

      prompt = `Tiếp tục cuộc trò chuyện dưới đây như một biên tập viên content của Siêu Di Động.

Yêu cầu:
- Trả lời đúng điều người dùng vừa yêu cầu.
- Nếu người dùng bảo sửa kịch bản, chỉ trả về bản đã sửa trừ khi họ yêu cầu giải thích.
- Giữ ngữ cảnh của các tin nhắn trước.
- Không bịa thông số sản phẩm.
- Không viết kiểu quảng cáo lộ liễu.

CUỘC TRÒ CHUYỆN:
${transcript}

TIN NHẮN MỚI:
${input}`;
    } else if (mode === "review") {
      jsonMode = true;
      prompt = `Chấm kịch bản sau và trả về đúng JSON:
{
  "scores": {
    "hook": 0-10,
    "drama": 0-10,
    "twist": 0-10,
    "retention": 0-10,
    "natural": 0-10,
    "overall": 0-10
  },
  "analysis": "Phân tích bằng tiếng Việt gồm Điểm mạnh, Điểm yếu, Cách sửa và Bản viết lại gợi ý."
}

KỊCH BẢN:
${input}`;
    } else if (mode === "rewrite") {
      prompt = `Viết lại kịch bản sau theo phong cách: ${rewriteStyle}.
Vẫn phải là bản TikTok Voice Over hoàn chỉnh.
Sửa hook khó hiểu, câu ghép máy móc, đoạn thừa, lỗi logic và twist gượng.
Không đánh số đoạn. Audio tag phải đi cùng câu.
Chỉ trả về kịch bản đã viết lại.

KỊCH BẢN:
${input}`;
    } else if (mode === "hooks") {
      prompt = `Tạo đúng 20 hook TikTok khác nhau.

Ý TƯỞNG:
${idea}

CHỦ ĐỀ:
${theme}

NHÂN VẬT VÀ BỐI CẢNH:
- Người mua: ${buyerType}
- Người đi cùng: ${companion}
- Nơi xảy ra: ${location}
- Người nói câu Hook đầu tiên: ${hookSpeaker}
- Cảm xúc mở đầu: ${openingEmotion}
- Độ dài mong muốn: ${lengthInstruction}

Yêu cầu:
- Mỗi hook 1-2 câu.
- Câu đầu rõ ai, ở đâu, chuyện gì xảy ra.
- Có lý do hoặc mâu thuẫn khiến người xem muốn nghe tiếp.
- Không lặp cấu trúc.
- Không chê khách nghèo.
- Chỉ đánh số danh sách hook từ 1 đến 20.

Tham khảo phong cách, không sao chép:
${hooks.map((item: { text?: string }) => `- ${item.text || ""}`).join("\n")}`;
    } else {
      const labels = ["A", "B", "C", "D", "E"].slice(0, versions);

      if (promptTemplate?.userPrompt) {
        const basePrompt = renderTemplate(String(promptTemplate.userPrompt));
        prompt = `${basePrompt}

SỐ PHIÊN BẢN:
${versions}

${
  versions > 1
    ? `Mỗi phiên bản phải khác rõ về góc kể hoặc nhịp kể.
Dùng nhãn:
${labels.map((label) => `PHIÊN BẢN ${label}`).join("\n")}`
    : "Chỉ trả về một kịch bản hoàn chỉnh."
}`;
      } else {
        prompt = `Viết ${versions} phiên bản kịch bản TikTok Voice Over hoàn chỉnh.

Ý TƯỞNG:
${idea}

CHỦ ĐỀ:
${theme}

NHÂN VẬT VÀ BỐI CẢNH:
- Người mua / nhân vật chính: ${buyerType}
- Người đi cùng: ${companion}
- Nơi xảy ra: ${location}
- Người nói câu Hook đầu tiên: ${hookSpeaker}
- Cảm xúc mở đầu: ${openingEmotion}
- Độ dài mong muốn: ${lengthInstruction}

CÔNG THỨC:
Tên: ${formula?.name || "Tự chọn"}
Mô tả: ${formula?.description || ""}
Cấu trúc: ${formula?.structure || "Hook → Mâu thuẫn → Diễn biến → Cao trào → Twist → Kết"}

Yêu cầu:
- Không ghép lại nguyên văn các trường dữ liệu.
- Tự nối mọi chi tiết thành câu chuyện có nguyên nhân và kết quả.
- Dùng đúng cách xưng hô "${buyerType}" từ đầu đến cuối, không tự đổi thành anh/chị/em khác.
- Nếu "${companion}" không phải "Đi một mình", phải đưa người đi cùng vào diễn biến hợp lý.
- Toàn bộ câu chuyện phải diễn ra trong khu vực "${location}" thuộc Siêu Di Động. Không tự chuyển sang địa điểm ngoài cửa hàng.
- Câu Hook đầu tiên do "${hookSpeaker}" nói hoặc trực tiếp tạo ra.
- Cảm xúc mở đầu là "${openingEmotion}".
- Hook phải là câu hoàn chỉnh, rõ nhân vật, bối cảnh và sự cố.
- Có ít nhất một câu thoại tự nhiên.
- Twist được dẫn từ diễn biến trước đó.
- Kết thúc hợp lý, không quảng cáo lộ liễu.
- Không đánh số từng đoạn.
- Bám đúng yêu cầu độ dài: ${lengthInstruction}
- Không tự bịa tên máy hoặc thông số.
- Audio tag không đứng riêng.

${
  versions > 1
    ? `Mỗi phiên bản khác thật sự về góc kể hoặc nhịp kể.
Dùng các nhãn:
${labels.map((label) => `PHIÊN BẢN ${label}`).join("\n")}`
    : "Chỉ trả về nội dung kịch bản."
}`;
      }
    }

    const configured = process.env.GEMINI_MODEL?.trim();
    const models = [
      configured,
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-2.5-flash-lite",
    ].filter((item, index, array): item is string => Boolean(item) && array.indexOf(item) === index);

    let text = "";
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        text = await runGemini(model, apiKey, systemInstruction, prompt, jsonMode);
        lastError = null;
        break;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Lỗi Gemini.");
        const message = lastError.message.toLowerCase();
        if (
          !message.includes("model") &&
          !message.includes("not found") &&
          !message.includes("no longer available") &&
          !message.includes("not supported")
        ) {
          break;
        }
      }
    }

    if (lastError || !text) throw lastError || new Error("Không tìm thấy model Gemini phù hợp.");

    if (mode === "community" || mode === "community_refine") {
      try {
        const parsed = JSON.parse(stripJson(text));
        const questions = Array.isArray(parsed?.questions)
          ? parsed.questions.map((item: unknown) => String(item || "").trim()).filter(Boolean)
          : [];
        return NextResponse.json({ questions });
      } catch {
        const questions = text
          .split(/\n+/)
          .map((line) => line.replace(/^\s*\d+[.)-]?\s*/, "").trim())
          .filter(Boolean);
        return NextResponse.json({ questions });
      }
    }

    if (mode === "review") {
      try {
        const parsed = JSON.parse(stripJson(text));
        const scores: Scores = {
          hook: score(parsed?.scores?.hook),
          drama: score(parsed?.scores?.drama),
          twist: score(parsed?.scores?.twist),
          retention: score(parsed?.scores?.retention),
          natural: score(parsed?.scores?.natural),
          overall: score(parsed?.scores?.overall),
        };
        return NextResponse.json({
          text: String(parsed?.analysis || "Gemini chưa trả về phân tích."),
          scores,
        });
      } catch {
        return NextResponse.json({
          text,
          scores: {
            hook: 0,
            drama: 0,
            twist: 0,
            retention: 0,
            natural: 0,
            overall: 0,
          },
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
