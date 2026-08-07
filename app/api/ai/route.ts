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
    const studioOriginal = String(body?.original || "");
    const studioIdea = String(body?.idea || "");
    const studioTitle = String(body?.title || "");
    const studioFeedback = Array.isArray(body?.feedback) ? body.feedback.slice(0, 20) : [];
    const studioRatingInput = Number(body?.rating || 0);
    const studioFeedbackMemoryInput = Array.isArray(body?.studioFeedbackMemory) ? body.studioFeedbackMemory.slice(0, 30) : [];
    const trainerExamples = Array.isArray(body?.trainerExamples) ? body.trainerExamples.slice(0, 40) : [];
    const trainerFeedbackMemory = Array.isArray(body?.feedbackMemory) ? body.feedbackMemory.slice(0, 60) : [];
    const trainerCopiedExamples = Array.isArray(body?.copiedExamples) ? body.copiedExamples.slice(0, 40) : [];
    const inspectorAnalysis = String(body?.analysis || "");
    const adaptiveLearningInput = body?.adaptiveLearning !== false;
    const trainerAnalysisInput = body?.trainerAnalysis || null;
    const adaptiveFeedbackMemory = Array.isArray(body?.feedbackMemory) ? body.feedbackMemory.slice(0, 40) : [];

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

Bạn đang vận hành Content Universe V28.
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

    const adaptiveContext = adaptiveLearningInput
      ? `
ADAPTIVE LEARNING ĐANG BẬT.
STYLE DNA:
${trainerAnalysisInput?.summary || "(chưa có phân tích Trainer)"}

QUY TẮC ĐÃ HỌC:
${Array.isArray(trainerAnalysisInput?.rules) && trainerAnalysisInput.rules.length
  ? trainerAnalysisInput.rules.map((item: unknown) => `- ${String(item)}`).join("\n")
  : "(chưa có quy tắc Trainer)"}

FEEDBACK GẦN ĐÂY:
${adaptiveFeedbackMemory.length
  ? adaptiveFeedbackMemory
      .flatMap((item: any) => Array.isArray(item.feedback) ? item.feedback : [])
      .slice(0, 20)
      .map((item: unknown) => `- ${String(item)}`)
      .join("\n")
  : "(chưa có feedback)"}

Hãy coi các dữ liệu trên là sở thích phong cách, không được sao chép nguyên văn bài cũ.
`
      : "";

    let prompt = "";
    let jsonMode = false;

    if (mode === "studio_refine") {
      prompt = `Bạn là biên tập viên nội dung của Siêu Di Động.

NỘI DUNG HIỆN TẠI:
${studioOriginal}

Ý TƯỞNG BAN ĐẦU:
${studioIdea}

TIÊU ĐỀ:
${studioTitle}

ĐÁNH GIÁ:
${studioRatingInput ? `${studioRatingInput}/5 sao` : "chưa chấm"}

GÓP Ý:
${studioFeedback.length ? studioFeedback.map((item: string) => `- ${item}`).join("\n") : "- Sửa tự nhiên hơn"}

STYLE DNA HIỆN TẠI:\n${adaptiveContext}\n\nMEMORY TỪ NHỮNG LẦN GÓP Ý TRƯỚC:
${studioFeedbackMemoryInput.length ? studioFeedbackMemoryInput.map((item: any) => Array.isArray(item.feedback) ? `- ${item.feedback.join(", ")}` : "").filter(Boolean).join("\n") : "(chưa có)"}

YÊU CẦU:
- Viết lại trực tiếp nội dung hiện tại theo đúng góp ý.
- Giữ phong cách kể chuyện tự nhiên của Siêu Di Động.
- Không viết kiểu MC, quảng cáo cứng hoặc review khô.
- Nếu góp ý là ngắn hơn thì cắt thật sự; hook mạnh hơn thì thay hook rõ rệt.
- Nếu bị chê giống AI hoặc quảng cáo thì giảm câu trau chuốt, tăng nhịp kể đời thường.
- Giữ Audio Tags nếu nội dung đang dùng.
- Không giải thích cách sửa.
- Chỉ trả nội dung đã chỉnh.`;
    } else if (mode === "community_refine") {
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
    } else if (mode === "trainer") {
      jsonMode = true;
      prompt = `Phân tích các bài mẫu mà người dùng muốn AI học phong cách.

BÀI MẪU:
${trainerExamples.length ? trainerExamples.map((item: string, index: number) => `--- MẪU ${index + 1} ---\n${item}`).join("\n\n") : input}

FEEDBACK ĐÃ HỌC:
${trainerFeedbackMemory.length ? trainerFeedbackMemory.map((item: any) => Array.isArray(item.feedback) ? `- ${item.feedback.join(", ")}` : "").filter(Boolean).join("\n") : "(chưa có)"}

MẪU ĐƯỢC COPY / XÁC NHẬN TỐT:
${trainerCopiedExamples.length ? trainerCopiedExamples.map((item: any) => `- ${String(item.content || "").slice(0, 600)}`).join("\n") : "(chưa có)"}

Không sao chép nội dung. Hãy rút ra DNA phong cách.

Trả đúng JSON:
{
  "summary": "Tóm tắt ngắn AI đã hiểu phong cách gì",
  "rules": ["quy tắc 1","quy tắc 2","..."],
  "dna": {
    "hook": 0-100,
    "storytelling": 0-100,
    "natural": 0-100,
    "twist": 0-100,
    "salesSoftness": 0-100
  }
}`;
    } else if (mode === "inspector") {
      jsonMode = true;
      prompt = `Đóng vai AI Inspector chuyên kiểm định kịch bản TikTok cho Siêu Di Động.

Chấm rất thực tế, không tâng bốc. Trả đúng JSON:
{
  "scores": {
    "hook": 0-10,
    "twist": 0-10,
    "retention": 0-10,
    "natural": 0-10,
    "logic": 0-10,
    "viral": 0-10,
    "aiLike": 0-10,
    "adRisk": 0-10,
    "overall": 0-10
  },
  "analysis": "Viết ngắn gọn theo 4 phần: Điểm mạnh; Vấn đề; Nên sửa; Gợi ý cụ thể."
}

Trong đó:
- aiLike: 0 là hoàn toàn tự nhiên, 10 là rất giống AI.
- adRisk: 0 là không có cảm giác quảng cáo, 10 là quảng cáo rất lộ.
- overall phải cân nhắc cả điểm mạnh và hai rủi ro trên.

KỊCH BẢN:
${input}`;
    } else if (mode === "inspector_fix") {
      prompt = `Sửa trực tiếp kịch bản theo kết quả kiểm định dưới đây.

KỊCH BẢN:
${input}

PHÂN TÍCH INSPECTOR:
${inspectorAnalysis}

Yêu cầu:
- Sửa các lỗi Inspector chỉ ra.
- Tăng độ tự nhiên và giữ chân.
- Giảm cảm giác AI và quảng cáo.
- Không giải thích.
- Chỉ trả về kịch bản hoàn chỉnh đã sửa.`;
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
        prompt = `${basePrompt}\n\n${adaptiveContext}\n\nSỐ PHIÊN BẢN:
${versions}

${
  versions > 1
    ? `Mỗi phiên bản phải khác rõ về góc kể hoặc nhịp kể.
Dùng nhãn:
${labels.map((label) => `PHIÊN BẢN ${label}`).join("\n")}`
    : "Chỉ trả về một kịch bản hoàn chỉnh."
}`;
      } else {
        prompt = `Viết ${versions} phiên bản kịch bản TikTok Voice Over hoàn chỉnh.\n\n${adaptiveContext}\n\nÝ TƯỞNG:
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

    if (mode === "trainer") {
      try {
        const parsed = JSON.parse(stripJson(text));
        return NextResponse.json({
          analysis: {
            summary: String(parsed?.summary || ""),
            rules: Array.isArray(parsed?.rules) ? parsed.rules.map((item: unknown) => String(item)) : [],
            dna: {
              hook: Math.max(0, Math.min(100, Number(parsed?.dna?.hook || 0))),
              storytelling: Math.max(0, Math.min(100, Number(parsed?.dna?.storytelling || 0))),
              natural: Math.max(0, Math.min(100, Number(parsed?.dna?.natural || 0))),
              twist: Math.max(0, Math.min(100, Number(parsed?.dna?.twist || 0))),
              salesSoftness: Math.max(0, Math.min(100, Number(parsed?.dna?.salesSoftness || 0))),
            }
          }
        });
      } catch {
        return NextResponse.json({ analysis: { summary: text, rules: [], dna: { hook:0, storytelling:0, natural:0, twist:0, salesSoftness:0 } } });
      }
    }

    if (mode === "inspector") {
      try {
        const parsed = JSON.parse(stripJson(text));
        const s = parsed?.scores || {};
        return NextResponse.json({
          text: String(parsed?.analysis || "Chưa có phân tích."),
          scores: {
            hook: score(s.hook),
            twist: score(s.twist),
            retention: score(s.retention),
            natural: score(s.natural),
            logic: score(s.logic),
            viral: score(s.viral),
            aiLike: score(s.aiLike),
            adRisk: score(s.adRisk),
            overall: score(s.overall),
          }
        });
      } catch {
        return NextResponse.json({
          text,
          scores: { hook:0, twist:0, retention:0, natural:0, logic:0, viral:0, aiLike:0, adRisk:0, overall:0 }
        });
      }
    }

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

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lỗi AI không xác định." },
      { status: 500 }
    );
  }
}
