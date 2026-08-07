"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Hook = {
  id: string;
  text: string;
  theme: string;
  favorite: boolean;
  used: number;
  retention?: number;
};

type Formula = {
  id: string;
  name: string;
  category: string;
  description: string;
  structure: string;
  favorite: boolean;
  used: number;
};

type Script = {
  id: string;
  title: string;
  theme: string;
  content: string;
  createdAt: string;
  favorite: boolean;
  status: "draft" | "posted";
  score?: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ReviewScores = {
  hook: number;
  twist: number;
  retention: number;
  natural: number;
  logic: number;
  viral: number;
  aiLike: number;
  adRisk: number;
  overall: number;
};

type TrainerAnalysis = {
  summary: string;
  rules: string[];
  dna: {
    hook: number;
    storytelling: number;
    natural: number;
    twist: number;
    salesSoftness: number;
  };
};

type ScriptVersion = {
  id: string;
  content: string;
  title: string;
  createdAt: string;
  reason: string;
};

type KnowledgeBase = {
  brandVoice: string;
  forbiddenWords: string;
  catchphrases: string;
  productRules: string;
};

type LearningExample = {
  id: string;
  content: string;
  title: string;
  theme: string;
  copiedAt: string;
  copyCount: number;
  source: "studio" | "library" | "review";
  signals: {
    opening: string;
    hasDialogue: boolean;
    hasAudioTags: boolean;
    approximateWords: number;
  };
};

type StudioFeedbackMemory = {
  id: string;
  createdAt: string;
  prompt: string;
  original: string;
  final: string;
  rating: number;
  feedback: string[];
  copied: boolean;
  savedAsTemplate: boolean;
};



type CommunityQuestion = {
  id: string;
  text: string;
  createdAt: string;
  copied: boolean;
  favorite: boolean;
  naturalScore: number;
  tags: string[];
  copyCount: number;
};

type CommunitySettings = {
  iphoneWeight: number;
  naturalness: number;
  omitSubject: boolean;
  location: string;
  intent: string;
  budget: string;
  quantity: number;
  compactMode: boolean;
  avoidDuplicates: boolean;
};


type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  favorite: boolean;
  isDefault: boolean;
  used: number;
};

const defaultPromptTemplates: PromptTemplate[] = [
  {
    id: "prompt-standard",
    name: "TikTok Chuẩn Siêu Di Động",
    description: "Kể chuyện tự nhiên, có hook, mâu thuẫn, twist và kết hợp lý.",
    favorite: true,
    isDefault: true,
    used: 0,
    systemPrompt: `Bạn là TikToker chuyên kể chuyện công nghệ cho Siêu Di Động.
Viết như người thật đang kể chuyện vừa xảy ra tại shop.
Không viết kiểu MC, quảng cáo hoặc review khô.
Giữ đúng cách xưng hô của nhân vật từ đầu đến cuối.`,
    userPrompt: `Viết kịch bản TikTok theo thông tin sau:

Người mua: {{buyer}}
Người đi cùng: {{companion}}
Nơi xảy ra: {{location}}
Người nói Hook: {{hookSpeaker}}
Cảm xúc mở đầu: {{emotion}}
Chủ đề: {{topic}}
Công thức: {{formula}}
Độ dài: {{length}}

Ý tưởng:
{{story}}

Yêu cầu:
- Hook rõ ai, ở đâu, chuyện gì xảy ra.
- Có mâu thuẫn, diễn biến, cao trào, twist và kết.
- Không quảng cáo lộ liễu.
- Không đánh số từng đoạn.`,
  },
  {
    id: "prompt-viral",
    name: "Viral Tranh Cãi",
    description: "Hook mạnh, gây tò mò và tạo tranh luận nhưng không xúc phạm khách.",
    favorite: true,
    isDefault: false,
    used: 0,
    systemPrompt: `Bạn là biên tập viên TikTok chuyên tạo nội dung gây tranh luận tích cực cho Siêu Di Động.
Ưu tiên câu mở đầu mạnh, rõ mâu thuẫn và khiến người xem muốn ở lại.`,
    userPrompt: `Tạo kịch bản viral dựa trên:

Nhân vật: {{buyer}}
Đi cùng: {{companion}}
Bối cảnh: {{location}}
Chủ đề: {{topic}}
Cảm xúc: {{emotion}}
Độ dài: {{length}}
Ý tưởng: {{story}}

Công thức: {{formula}}

Bắt buộc:
- Hook có câu nói hoặc hành động gây chú ý ngay đầu.
- Không chê khách nghèo.
- Twist phải hợp lý.
- Kết thúc đủ để người xem muốn bình luận.`,
  },
  {
    id: "prompt-funny",
    name: "Hài Hước",
    description: "Nhịp kể vui, đối thoại tự nhiên và bẻ lái hài.",
    favorite: false,
    isDefault: false,
    used: 0,
    systemPrompt: `Bạn viết content hài cho Siêu Di Động.
Hài phải đến từ tình huống và lời thoại tự nhiên, không cố nhét câu đùa.`,
    userPrompt: `Viết kịch bản hài:

Người mua: {{buyer}}
Người đi cùng: {{companion}}
Nơi xảy ra: {{location}}
Người nói Hook: {{hookSpeaker}}
Chủ đề: {{topic}}
Độ dài: {{length}}
Ý tưởng: {{story}}

Dùng cấu trúc: {{formula}}

Yêu cầu:
- Có ít nhất 2 câu thoại.
- Có một đoạn hiểu lầm hoặc phản ứng bất ngờ.
- Kết hài nhưng vẫn hợp logic.`,
  },
  {
    id: "prompt-emotion",
    name: "Cảm Xúc",
    description: "Tập trung sự đồng cảm, chuyển biến cảm xúc và kết ấm.",
    favorite: false,
    isDefault: false,
    used: 0,
    systemPrompt: `Bạn là người kể chuyện cảm xúc cho Siêu Di Động.
Viết chân thật, tiết chế, không sến và không quảng cáo lộ.`,
    userPrompt: `Viết kịch bản cảm xúc:

Nhân vật chính: {{buyer}}
Người đi cùng: {{companion}}
Bối cảnh: {{location}}
Chủ đề: {{topic}}
Cảm xúc mở đầu: {{emotion}}
Độ dài: {{length}}
Ý tưởng: {{story}}

Công thức: {{formula}}

Tạo chuyển biến cảm xúc rõ từ đầu tới cuối và kết thúc ấm áp.`,
  },
  {
    id: "prompt-drama",
    name: "Drama Căng",
    description: "Mâu thuẫn mạnh, cao trào nhanh và bẻ lái cuối.",
    favorite: true,
    isDefault: false,
    used: 0,
    systemPrompt: `Bạn viết drama TikTok cho Siêu Di Động.
Nhịp kể phải nhanh, câu ngắn, cao trào rõ nhưng không vô lý.`,
    userPrompt: `Viết drama TikTok:

Người mua: {{buyer}}
Đi cùng: {{companion}}
Bối cảnh: {{location}}
Người nói Hook: {{hookSpeaker}}
Cảm xúc: {{emotion}}
Chủ đề: {{topic}}
Độ dài: {{length}}
Ý tưởng: {{story}}

Công thức: {{formula}}

Bắt buộc có:
- Hook căng.
- Một lần hiểu lầm hoặc đối đầu.
- Một cao trào.
- Một twist hợp lý.`,
  },
  {
    id: "prompt-soft-sell",
    name: "Bán Hàng Mềm",
    description: "Lồng sản phẩm và nhu cầu mua tự nhiên, CTA nhẹ.",
    favorite: false,
    isDefault: false,
    used: 0,
    systemPrompt: `Bạn viết content bán hàng mềm cho Siêu Di Động.
Không ép mua, không liệt kê thông số khô, chỉ lồng lợi ích vào câu chuyện.`,
    userPrompt: `Viết kịch bản bán hàng mềm:

Người mua: {{buyer}}
Đi cùng: {{companion}}
Nơi xảy ra: {{location}}
Chủ đề: {{topic}}
Độ dài: {{length}}
Ý tưởng: {{story}}

Công thức: {{formula}}

Yêu cầu:
- Nhu cầu mua phải xuất phát từ sự cố thật.
- Sản phẩm xuất hiện như giải pháp.
- CTA nhẹ, tự nhiên.`,
  },
  {
    id: "prompt-auto",
    name: "AI Tự Quyết Định",
    description: "Gemini tự chọn góc kể và phong cách phù hợp nhất.",
    favorite: false,
    isDefault: false,
    used: 0,
    systemPrompt: `Bạn là Content Director của Siêu Di Động.
Hãy tự chọn phong cách phù hợp nhất với tình huống: hài, drama, cảm xúc, viral hoặc bán hàng mềm.`,
    userPrompt: `Tự chọn cách viết tốt nhất cho:

Người mua: {{buyer}}
Người đi cùng: {{companion}}
Nơi xảy ra: {{location}}
Người nói Hook: {{hookSpeaker}}
Cảm xúc mở đầu: {{emotion}}
Chủ đề: {{topic}}
Độ dài: {{length}}
Công thức tham khảo: {{formula}}
Ý tưởng: {{story}}

Chỉ trả về kịch bản hoàn chỉnh.`,
  },
];

const STORAGE_KEY = "content_universe_v8";
const SYNC_KEY_STORAGE = "content_universe_sync_key";

const defaultThemes = [
  "Công việc",
  "Bị coi thường",
  "Tình yêu",
  "Gia đình",
  "Học sinh – sinh viên",
  "Game",
  "Tiền bạc",
  "Hiểu lầm shop",
];


const defaultBuyerTypes = [
  "Em khách",
  "Anh khách",
  "Chị khách",
  "Ông chú",
  "Cô khách",
  "Em học sinh",
  "Bạn sinh viên",
  "Nhân viên văn phòng",
  "Tài xế",
  "Shipper",
  "Game thủ",
  "Khách nước ngoài",
  "Khác...",
];

const companionOptions = [
  "Đi một mình",
  "Mẹ",
  "Bố",
  "Vợ",
  "Chồng",
  "Người yêu",
  "Bạn bè",
  "Con nhỏ",
  "Đồng nghiệp",
  "Sếp",
  "Khác...",
];

const defaultLocations = [
  "Siêu Di Động Quy Nhơn",
  "Quầy tư vấn",
  "Quầy trải nghiệm",
  "Quầy Android",
  "Quầy iPhone",
  "Quầy thanh toán",
  "Cửa ra vào",
  "Bãi giữ xe",
  "Bàn kỹ thuật",
  "Kho máy",
  "Khu livestream",
  "Góc test game",
  "Góc chụp ảnh",
];

const hookSpeakerOptions = [
  "Người mua",
  "Nhân viên shop",
  "Mẹ",
  "Bố",
  "Người yêu",
  "Bạn bè",
  "Sếp",
  "Người đi cùng",
  "Khác...",
];

const openingEmotionOptions = [
  "Căng thẳng",
  "Hài hước",
  "Bất ngờ",
  "Sốc",
  "Bức xúc",
  "Ngại ngùng",
  "Ấm áp",
  "Tò mò",
];

const defaultHooks: Hook[] = [
  {
    id: "hook-1",
    theme: "Công việc",
    text: "Đang gọi video với đối tác nước ngoài, điện thoại anh khách đứng hình đúng lúc bên kia hỏi tới báo giá. Sếp quay sang nói thẳng: “Mai còn mang cái máy này đi làm thì nghỉ luôn đi!”",
    favorite: true,
    used: 12,
    retention: 94,
  },
  {
    id: "hook-2",
    theme: "Bị coi thường",
    text: "Đi cà phê với hội bạn, chị khách vừa đặt điện thoại lên bàn thì có đứa cười: “Android cỏ mà cũng đem ra khoe hả?”",
    favorite: true,
    used: 9,
    retention: 91,
  },
  {
    id: "hook-3",
    theme: "Gia đình",
    text: "Vừa bước vào Siêu Di Động, mẹ em khách đã nói lớn: “Tài chính hơn bốn triệu thôi, tư vấn sao cho nó học được chứ đừng dụ chơi game nha!”",
    favorite: false,
    used: 7,
    retention: 88,
  },
  {
    id: "hook-4",
    theme: "Hiểu lầm shop",
    text: "Anh khách vừa bước vào shop đã đập tay xuống bàn: “Shop làm ăn kiểu gì vậy em?” làm cả nhân viên đứng hình mất ba giây.",
    favorite: true,
    used: 8,
    retention: 92,
  },
];

const defaultFormulas: Formula[] = [
  {
    id: "formula-1",
    name: "Căng thẳng rồi bẻ lái",
    category: "Drama",
    description: "Đẩy sự cố lên cao, làm người xem tưởng kết quả rất nghiêm trọng rồi bẻ lái hợp lý.",
    structure: "Hook sốc → Sự cố → Phản ứng → Cao trào → Bẻ lái → Kết",
    favorite: true,
    used: 18,
  },
  {
    id: "formula-2",
    name: "Hiểu lầm rồi mua luôn",
    category: "Hài",
    description: "Khách vào với thái độ căng, nhân viên kiểm tra và sự thật khiến cả shop bật cười.",
    structure: "Hook căng → Đối chất → Kiểm tra → Sự thật → Twist → Kết",
    favorite: true,
    used: 13,
  },
  {
    id: "formula-3",
    name: "Bị coi thường rồi dằn mặt",
    category: "Gây tranh cãi",
    description: "Nhân vật bị chê, âm thầm nâng cấp rồi quay lại khiến người chê phải im.",
    structure: "Bị chê → Ấm ức → Tìm giải pháp → Trải nghiệm → Quay lại → Dằn mặt",
    favorite: false,
    used: 15,
  },
  {
    id: "formula-4",
    name: "Phụ huynh cấm rồi đổi ý",
    category: "Gia đình",
    description: "Phụ huynh đặt điều kiện gắt nhưng cuối cùng bị thuyết phục bởi cách tư vấn hợp lý.",
    structure: "Điều kiện gắt → Giải thích → Trải nghiệm → Kiểm tra → Đồng ý",
    favorite: false,
    used: 10,
  },
];

const defaultCommunityExamples = `tìm đth 2-3tr chữa cháy

giá 15pl với 14prm g bnhieu v ạ

Cần mua samsung giá tầm 2-3 triệu. Máy rin chuẩn cho người lớn dùng

Đang ở quy nhơn , cần mua android trong sáng nay , 2,5tr

ip11 64 màn chảy mực, pin 78, hư face .
Lên 14pro 256 thì bù thêm bao nhiêu ạ

Cần mua vài máy android cũ phần mềm ổn định, chạy app mượt , ngoại hình kh quan trọng vỡ nát cũng đc`;

const defaultCommunitySettings: CommunitySettings = {
  iphoneWeight: 70,
  naturalness: 90,
  omitSubject: true,
  location: "Quy Nhơn",
  intent: "Tự chọn",
  budget: "",
  quantity: 12,
  compactMode: true,
  avoidDuplicates: true,
};

const baseStyle = `Bạn là TikToker chuyên kể chuyện công nghệ cho Siêu Di Động, dùng giọng Adam trên ElevenLabs V3.

QUY TẮC:
- Viết như người thật đang kể chuyện vừa xảy ra tại shop.
- Không viết kiểu MC, quảng cáo hoặc review khô.
- Hook phải rõ ai, ở đâu, chuyện gì xảy ra và lý do đáng chú ý.
- Có mâu thuẫn, diễn biến, cao trào, twist và kết hợp lý.
- Không đánh số từng đoạn trong kịch bản.
- Không tự bịa thông số máy khi người dùng chưa cung cấp.
- Không chê khách nghèo.
- Không dùng: chốt đơn, siêu phẩm, xuống tiền, múc, cấu hình khủng.
- Audio tag phải đứng cùng câu cảm xúc, không để tag đứng riêng.
- Hook không bắt buộc có audio tag.
- Ngôn ngữ bình dân, tự nhiên, có chút hài và kịch tính.
- Có thể dùng: mấy má, ê ê ê, dữ thần nha, thiệt luôn á, dứt lẹ.
- Mỗi câu phải đẩy câu chuyện đi tiếp.
- Nếu tạo nhiều phiên bản, mỗi bản phải khác thật sự về góc kể hoặc nhịp kể.`;

const defaultKnowledge: KnowledgeBase = {
  brandVoice: "Kể như người thật vừa chứng kiến câu chuyện tại Siêu Di Động. Ngôn ngữ bình dân, tự nhiên, có chút hài và kịch tính.",
  forbiddenWords: "chốt đơn, siêu phẩm, xuống tiền, múc, cấu hình khủng, khách nghèo",
  catchphrases: "mấy má, ê ê ê, dữ thần nha, thiệt luôn á, dứt lẹ",
  productRules: "Không tự bịa thông số. Chỉ dùng thông tin sản phẩm do người dùng cung cấp. Lồng sản phẩm như giải pháp, không liệt kê thông số khô.",
};

const nav = [
  ["dashboard", "⌂", "Tổng quan"],
  ["studio", "✦", "AI Studio"],
  ["trainer", "◆", "AI Trainer"],
  ["inspector", "◎", "AI Inspector"],
  ["community", "◉", "Community AI"],
  ["hooks", "↗", "Kho Hook"],
  ["formulas", "◇", "Kho Công thức"],
  ["library", "▤", "Kho Kịch bản"],
  ["planner", "▦", "Lịch nội dung"],
  ["promptlab", "⌘", "Prompt Lab"],
  ["knowledge", "◈", "Knowledge Base"],
  ["analytics", "⌁", "Phân tích"],
  ["settings", "⚙", "Thiết lập"],
];

function today() {
  return new Date().toISOString();
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function Home() {
  const [page, setPage] = useState("dashboard");
  const [dark, setDark] = useState(false);
  const [topics, setTopics] = useState<string[]>(defaultThemes);
  const [buyerTypes, setBuyerTypes] = useState<string[]>(defaultBuyerTypes.filter((item) => item !== "Khác..."));
  const [companions, setCompanions] = useState<string[]>(companionOptions.filter((item) => item !== "Khác..."));
  const [hookSpeakers, setHookSpeakers] = useState<string[]>(hookSpeakerOptions.filter((item) => item !== "Khác..."));
  const [openingEmotions, setOpeningEmotions] = useState<string[]>(openingEmotionOptions);
  const [locations, setLocations] = useState<string[]>(defaultLocations);
  const [uiScale, setUiScale] = useState<"small" | "medium" | "large" | "xlarge">("large");
  const [accentTheme, setAccentTheme] = useState<"orange" | "gold" | "ocean" | "purple">("orange");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hooks, setHooks] = useState<Hook[]>(defaultHooks);
  const [formulas, setFormulas] = useState<Formula[]>(defaultFormulas);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [style, setStyle] = useState(baseStyle);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>(defaultPromptTemplates);
  const [selectedPromptId, setSelectedPromptId] = useState("prompt-standard");
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [idea, setIdea] = useState("");
  const [buyerType, setBuyerType] = useState("Em khách");
  const [customBuyerType, setCustomBuyerType] = useState("");
  const [companion, setCompanion] = useState("Đi một mình");
  const [location, setLocation] = useState(defaultLocations[0]);
  const [customCompanion, setCustomCompanion] = useState("");
  const [hookSpeaker, setHookSpeaker] = useState("Người mua");
  const [customHookSpeaker, setCustomHookSpeaker] = useState("");
  const [openingEmotion, setOpeningEmotion] = useState("Căng thẳng");
  const [theme, setTheme] = useState(defaultThemes[0]);
  const [formulaId, setFormulaId] = useState(defaultFormulas[0].id);
  const [versions, setVersions] = useState(1);
  const [scriptLength, setScriptLength] = useState<"short" | "medium" | "long">("short");
  const [result, setResult] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [reviewInput, setReviewInput] = useState("");
  const [reviewResult, setReviewResult] = useState("");
  const [scores, setScores] = useState<ReviewScores | null>(null);
  const [trainerInput, setTrainerInput] = useState("");
  const [trainerAnalysis, setTrainerAnalysis] = useState<TrainerAnalysis | null>(null);
  const [trainerLoading, setTrainerLoading] = useState(false);
  const [adaptiveLearning, setAdaptiveLearning] = useState(true);
  const [autoInspect, setAutoInspect] = useState(false);
  const [lastInspectionScores, setLastInspectionScores] = useState<ReviewScores | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Chào bạn, mình là Content Assistant của Siêu Di Động. Gửi một ý tưởng, một hook hoặc một kịch bản rồi bảo mình sửa theo cách bạn muốn.",
    },
  ]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingHook, setEditingHook] = useState<Hook | null>(null);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [topicManagerOpen, setTopicManagerOpen] = useState(false);
  const [fieldManager, setFieldManager] = useState<null | "buyer" | "companion" | "location" | "speaker" | "emotion">(null);
  const [newFieldValue, setNewFieldValue] = useState("");
  const [editingField, setEditingField] = useState<{ oldValue: string; value: string } | null>(null);
  const [newTopic, setNewTopic] = useState("");
  const [editingTopic, setEditingTopic] = useState<{ oldValue: string; value: string } | null>(null);
  const [plannerNote, setPlannerNote] = useState("");
  const [promptTest, setPromptTest] = useState("");
  const [promptOutput, setPromptOutput] = useState("");
  const [knowledge, setKnowledge] = useState<KnowledgeBase>(defaultKnowledge);
  const [learningExamples, setLearningExamples] = useState<LearningExample[]>([]);
  const [studioFeedbackText, setStudioFeedbackText] = useState("");
  const [studioFeedbackTags, setStudioFeedbackTags] = useState<string[]>([]);
  const [studioRating, setStudioRating] = useState(0);
  const [studioRefining, setStudioRefining] = useState(false);
  const [studioFeedbackMemory, setStudioFeedbackMemory] = useState<StudioFeedbackMemory[]>([]);
  const [communityExamples, setCommunityExamples] = useState(defaultCommunityExamples);
  const [communityCopiedExamples, setCommunityCopiedExamples] = useState<string[]>([]);
  const [communitySettings, setCommunitySettings] = useState<CommunitySettings>(defaultCommunitySettings);
  const [communityQuestions, setCommunityQuestions] = useState<CommunityQuestion[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communitySearch, setCommunitySearch] = useState("");
  const [communityTagFilter, setCommunityTagFilter] = useState("Tất cả");
  const [communityView, setCommunityView] = useState<"all" | "favorite" | "copied">("all");
  const [communityFeedback, setCommunityFeedback] = useState("");
  const [communityRefining, setCommunityRefining] = useState(false);
  const [showCommunityLearning, setShowCommunityLearning] = useState(false);
  const [versionsHistory, setVersionsHistory] = useState<ScriptVersion[]>([]);
  const [rewriteStyle, setRewriteStyle] = useState("viral");
  const editorRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);
  const cloudUpdatedAtRef = useRef("");
  const saveTimerRef = useRef<number | null>(null);
  const [syncState, setSyncState] = useState<"loading" | "saving" | "saved" | "offline">("loading");
  const [syncKey, setSyncKey] = useState("");
  const [syncKeyInput, setSyncKeyInput] = useState("");
  const [showSyncKey, setShowSyncKey] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");
  const [actionToast, setActionToast] = useState("");

  useEffect(() => {
    function animateButton(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const button = target?.closest("button") as HTMLButtonElement | null;
      if (!button || button.disabled) return;

      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "button-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      button.appendChild(ripple);
      button.classList.remove("button-success-click");
      void button.offsetWidth;
      button.classList.add("button-success-click");
      window.setTimeout(() => ripple.remove(), 650);
      window.setTimeout(() => button.classList.remove("button-success-click"), 520);
    }

    document.addEventListener("click", animateButton);
    return () => document.removeEventListener("click", animateButton);
  }, []);

  useEffect(() => {
    if (!status) return;
    setActionToast(status);
    const timer = window.setTimeout(() => setActionToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  function applySavedData(data: any) {
    setDark(Boolean(data.dark));
    setTopics(Array.isArray(data.topics) && data.topics.length ? data.topics : defaultThemes);
    setBuyerTypes(Array.isArray(data.buyerTypes) && data.buyerTypes.length ? data.buyerTypes : defaultBuyerTypes.filter((item) => item !== "Khác..."));
    setCompanions(Array.isArray(data.companions) && data.companions.length ? data.companions : companionOptions.filter((item) => item !== "Khác..."));
    setHookSpeakers(Array.isArray(data.hookSpeakers) && data.hookSpeakers.length ? data.hookSpeakers : hookSpeakerOptions.filter((item) => item !== "Khác..."));
    setOpeningEmotions(Array.isArray(data.openingEmotions) && data.openingEmotions.length ? data.openingEmotions : openingEmotionOptions);
    setLocations(Array.isArray(data.locations) && data.locations.length ? data.locations : defaultLocations);
    setUiScale(data.uiScale || "large");
    setAccentTheme(data.accentTheme || "orange");
    setHooks(data.hooks || defaultHooks);
    setFormulas(data.formulas || defaultFormulas);
    setScripts(data.scripts || []);
    setStyle(data.style || baseStyle);
    setPromptTemplates(Array.isArray(data.promptTemplates) && data.promptTemplates.length ? data.promptTemplates : defaultPromptTemplates);
    setSelectedPromptId(data.selectedPromptId || "prompt-standard");
    setBuyerType(data.buyerType || "Em khách");
    setCustomBuyerType(data.customBuyerType || "");
    setCompanion(data.companion || "Đi một mình");
    setLocation(data.location || defaultLocations[0]);
    setCustomCompanion(data.customCompanion || "");
    setHookSpeaker(data.hookSpeaker || "Người mua");
    setCustomHookSpeaker(data.customHookSpeaker || "");
    setOpeningEmotion(data.openingEmotion || "Căng thẳng");
    setTheme(data.theme || defaultThemes[0]);
    setFormulaId(data.formulaId || defaultFormulas[0].id);
    setVersions(Number(data.versions) || 1);
    setScriptLength(data.scriptLength || "short");
    setIdea(data.idea || "");
    setResult(data.result || "");
    setTitle(data.title || "");
    setMessages(Array.isArray(data.messages) ? data.messages : []);
    setKnowledge(data.knowledge || defaultKnowledge);
    setVersionsHistory(Array.isArray(data.versionsHistory) ? data.versionsHistory : []);
    setLearningExamples(Array.isArray(data.learningExamples) ? data.learningExamples : []);
    setCommunityExamples(typeof data.communityExamples === "string" ? data.communityExamples : defaultCommunityExamples);
    setCommunityCopiedExamples(Array.isArray(data.communityCopiedExamples) ? data.communityCopiedExamples : []);
    setCommunitySettings(data.communitySettings || defaultCommunitySettings);
    setCommunityQuestions(Array.isArray(data.communityQuestions) ? data.communityQuestions : []);
  }

  function getSavedData() {
    return {
      dark, uiScale, accentTheme, topics, buyerTypes, companions, hookSpeakers,
      openingEmotions, locations, hooks, formulas, scripts, style, promptTemplates,
      selectedPromptId, messages, knowledge, versionsHistory, buyerType,
      customBuyerType, companion, customCompanion, location, hookSpeaker,
      customHookSpeaker, openingEmotion, theme, formulaId, versions, scriptLength,
      idea, result, title, learningExamples, studioFeedbackMemory, trainerInput, trainerAnalysis, adaptiveLearning, autoInspect, lastInspectionScores, communityExamples, communityCopiedExamples, communitySettings, communityQuestions,
    };
  }

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      let localData: any = null;
      let storedSyncKey = "";
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) localData = JSON.parse(saved);
        storedSyncKey = localStorage.getItem(SYNC_KEY_STORAGE) || "";
      } catch {}

      if (localData && !cancelled) applySavedData(localData);
      if (storedSyncKey && !cancelled) {
        setSyncKey(storedSyncKey);
        setSyncKeyInput(storedSyncKey);
        try {
          const response = await fetch(`/api/sync?syncKey=${encodeURIComponent(storedSyncKey)}`, { cache: "no-store" });
          if (response.ok) {
            const cloud = await response.json();
            if (!cancelled && cloud?.payload) {
              applySavedData(cloud.payload);
              cloudUpdatedAtRef.current = cloud.updatedAt || "";
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud.payload));
              setSyncState("saved");
              hydratedRef.current = true;
              return;
            }
          }
        } catch {}
      }

      if (!cancelled) {
        setSyncState(storedSyncKey ? "offline" : "offline");
        hydratedRef.current = true;
      }
    }
    hydrate();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const payload = getSavedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    if (!syncKey) {
      setSyncState("offline");
      return;
    }

    setSyncState("saving");
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/sync", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncKey, payload }),
        });
        if (!response.ok) throw new Error("Cloud save failed");
        const saved = await response.json();
        cloudUpdatedAtRef.current = saved.updatedAt || "";
        setSyncState("saved");
      } catch {
        setSyncState("offline");
      }
    }, 900);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [
    dark, uiScale, accentTheme, topics, buyerTypes, companions, hookSpeakers,
    openingEmotions, locations, hooks, formulas, scripts, style, promptTemplates,
    selectedPromptId, messages, knowledge, versionsHistory, buyerType,
    customBuyerType, companion, customCompanion, location, hookSpeaker,
    customHookSpeaker, openingEmotion, theme, formulaId, versions, scriptLength,
    idea, result, title, learningExamples, studioFeedbackMemory, trainerInput, trainerAnalysis, adaptiveLearning, autoInspect, lastInspectionScores, communityExamples, communityCopiedExamples, communitySettings, communityQuestions, syncKey,
  ]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== result) {
      editorRef.current.innerText = result;
    }
  }, [result, page]);

  useEffect(() => {
    if (!syncKey) return;
    const pull = async () => {
      if (document.visibilityState !== "visible" || syncState === "saving") return;
      try {
        const response = await fetch(`/api/sync?syncKey=${encodeURIComponent(syncKey)}`, { cache: "no-store" });
        if (!response.ok) return;
        const cloud = await response.json();
        if (cloud?.payload && cloud.updatedAt && cloud.updatedAt !== cloudUpdatedAtRef.current) {
          applySavedData(cloud.payload);
          cloudUpdatedAtRef.current = cloud.updatedAt;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud.payload));
          setSyncState("saved");
        }
      } catch {}
    };
    const interval = window.setInterval(pull, 10000);
    window.addEventListener("focus", pull);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", pull);
    };
  }, [syncState, syncKey]);


  useEffect(() => {
    if (!mobileOpen) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    body.dataset.mobileMenuScrollY = String(scrollY);
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      const savedY = Number(body.dataset.mobileMenuScrollY || "0");

      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.style.overflow = "";
      body.style.touchAction = "";
      html.style.overflow = "";
      html.style.overscrollBehavior = "";
      delete body.dataset.mobileMenuScrollY;

      window.scrollTo(0, savedY);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== result) {
      editorRef.current.innerText = result;
    }
  }, [result]);

  const currentFormula = formulas.find((item) => item.id === formulaId) || formulas[0];
  const selectedPrompt = promptTemplates.find((item) => item.id === selectedPromptId) || promptTemplates[0];
  const currentTitle = nav.find(([id]) => id === page)?.[2] || "Content Universe";
  const themeStats = useMemo(
    () =>
      topics.map((name) => ({
        name,
        count: scripts.filter((item) => item.theme === name).length,
      })),
    [scripts, topics]
  );
  const maxTheme = Math.max(1, ...themeStats.map((item) => item.count));

  const resolvedBuyerType =
    buyerType === "Khác..." ? customBuyerType.trim() || "Khách hàng" : buyerType;
  const resolvedCompanion =
    companion === "Khác..." ? customCompanion.trim() || "Đi một mình" : companion;
  const resolvedLocation = location;
  const resolvedHookSpeaker =
    hookSpeaker === "Khác..." ? customHookSpeaker.trim() || "Người mua" : hookSpeaker;

  async function connectSyncKey() {
    const nextKey = syncKeyInput.trim();
    if (nextKey.length < 8) {
      setSyncNotice("Mã đồng bộ phải có ít nhất 8 ký tự.");
      return;
    }
    setSyncNotice("Đang kết nối...");
    setSyncState("loading");
    try {
      const response = await fetch(`/api/sync?syncKey=${encodeURIComponent(nextKey)}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Không thể kết nối Cloud");
      const cloud = await response.json();
      if (!cloud.configured) {
        setSyncNotice("Supabase chưa được cấu hình trên Vercel.");
        setSyncState("offline");
        return;
      }
      if (cloud?.payload) {
        applySavedData(cloud.payload);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cloud.payload));
        cloudUpdatedAtRef.current = cloud.updatedAt || "";
        setSyncNotice("Đã tải dữ liệu Cloud về thiết bị này.");
      } else {
        const saveResponse = await fetch("/api/sync", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ syncKey: nextKey, payload: getSavedData() }),
        });
        if (!saveResponse.ok) throw new Error("Không thể tạo vùng đồng bộ");
        const saved = await saveResponse.json();
        cloudUpdatedAtRef.current = saved.updatedAt || "";
        setSyncNotice("Đã tạo vùng đồng bộ và đưa dữ liệu hiện tại lên Cloud.");
      }
      localStorage.setItem(SYNC_KEY_STORAGE, nextKey);
      setSyncKey(nextKey);
      setSyncState("saved");
    } catch {
      setSyncNotice("Kết nối thất bại. Kiểm tra cấu hình Supabase hoặc mạng Internet.");
      setSyncState("offline");
    }
  }

  function disconnectSyncKey() {
    localStorage.removeItem(SYNC_KEY_STORAGE);
    setSyncKey("");
    setSyncKeyInput("");
    setSyncNotice("Đã ngắt Cloud. Dữ liệu vẫn còn trên thiết bị này.");
    setSyncState("offline");
  }

  function createSyncKey() {
    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    const key = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    setSyncKeyInput(key);
    setShowSyncKey(true);
    setSyncNotice("Đã tạo mã mới. Hãy lưu mã này ở nơi an toàn.");
  }

  async function callAI(mode: string, payload: Record<string, unknown> = {}) {
    setStatus("Gemini đang xử lý...");
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        style,
        idea,
        theme,
        versions,
        formula: currentFormula,
        hooks: hooks.slice(0, 20),
        buyerType: resolvedBuyerType,
        companion: resolvedCompanion,
        location: resolvedLocation,
        hookSpeaker: resolvedHookSpeaker,
        openingEmotion,
        scriptLength,
        promptTemplate: selectedPrompt,
        knowledge,
        learningExamples: learningExamples.slice(0, 12),
        adaptiveLearning,
        trainerAnalysis,
        feedbackMemory: studioFeedbackMemory.slice(0, 40),
        communityExamples,
        communityCopiedExamples: communityCopiedExamples.slice(0, 80),
        ...payload,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || "AI gặp lỗi.");
      throw new Error(data.error || "AI gặp lỗi.");
    }
    setStatus("Hoàn tất.");
    return data;
  }

  function addVersion(content: string, reason: string, versionTitle = title) {
    if (!content.trim()) return;
    setVersionsHistory((items) => [
      { id: makeId(), content, title: versionTitle || "Kịch bản chưa đặt tên", createdAt: today(), reason },
      ...items,
    ].slice(0, 30));
  }

  function downloadText(format: "txt" | "md") {
    if (!result.trim()) return;
    const body = format === "md" ? `# ${title || "Kịch bản Siêu Di Động"}\n\n${result}` : result;
    const url = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(title || "kich-ban-sieu-di-dong").replace(/[^a-zA-Z0-9À-ỹ -]/g, "").replace(/\s+/g, "-")}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function rewriteCurrent(styleName: string) {
    if (!result.trim()) return;
    addVersion(result, `Trước khi viết lại: ${styleName}`);
    try {
      const data = await callAI("rewrite", { input: result, rewriteStyle: styleName });
      setResult(data.text);
      setStatus(`Đã viết lại theo phong cách ${styleName}.`);
    } catch {}
  }

  async function generateScript() {
    if (!idea.trim()) return;
    try {
      const data = await callAI("create");
      setPromptTemplates((items) =>
        items.map((item) =>
          item.id === selectedPromptId ? { ...item, used: item.used + 1 } : item
        )
      );
      addVersion(result, "Trước khi tạo bản mới");
      setResult(data.text);
      setTitle(`${theme} – ${new Date().toLocaleDateString("vi-VN")}`);
      if (autoInspect && data.text) {
        try {
          const inspection = await callAI("inspector", { input: data.text });
          if (inspection.scores) setLastInspectionScores(inspection.scores);
        } catch {}
      }
    } catch {}
  }

  async function generateHooks() {
    if (!idea.trim()) return;
    try {
      const data = await callAI("hooks");
      setResult(data.text);
      setTitle(`20 Hook – ${theme}`);
    } catch {}
  }

  async function inspectCurrentStudio() {
    if (!result.trim()) {
      setStatus("AI Studio chưa có nội dung để kiểm định.");
      return;
    }
    try {
      const data = await callAI("inspector", { input: result });
      setLastInspectionScores(data.scores || null);
      setReviewInput(result);
      setReviewResult(data.text || "");
      setScores(data.scores || null);
      setStatus("Đã kiểm định nhanh kịch bản hiện tại.");
    } catch {}
  }

  async function inspectScript() {
    if (!reviewInput.trim()) return;
    try {
      const data = await callAI("inspector", { input: reviewInput });
      setReviewResult(data.text);
      if (data.scores) setScores(data.scores);
    } catch {}
  }

  async function fixFromInspector() {
    if (!reviewInput.trim()) return;
    try {
      const data = await callAI("inspector_fix", {
        input: reviewInput,
        analysis: reviewResult,
      });
      if (data.text) {
        addVersion(result, "Trước khi sửa theo AI Inspector");
        setResult(data.text);
        setReviewInput(data.text);
        setPage("studio");
        setStatus("Đã sửa theo AI Inspector.");
      }
    } catch {}
  }

  async function trainAIStyle() {
    if (!trainerInput.trim()) return;
    setTrainerLoading(true);
    try {
      const examples = trainerInput.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean).slice(0, 40);
      const data = await callAI("trainer", {
        input: trainerInput,
        trainerExamples: examples,
        feedbackMemory: studioFeedbackMemory.slice(0, 60),
        copiedExamples: learningExamples.slice(0, 40),
      });
      setTrainerAnalysis(data.analysis || null);

      const learned: LearningExample[] = examples.map((content, index) => {
        const firstLine = content.split(/\n+/).find(Boolean)?.trim() || content.slice(0, 120);
        return {
          id: makeId(),
          content,
          title: `Trainer mẫu ${index + 1}`,
          theme: "AI Trainer",
          copiedAt: today(),
          copyCount: 4,
          source: "studio",
          signals: {
            opening: firstLine.slice(0, 180),
            hasDialogue: /["“”]|:\s*["“]/.test(content),
            hasAudioTags: /\[[a-zA-Z]+\]/.test(content),
            approximateWords: content.split(/\s+/).filter(Boolean).length,
          },
        };
      });
      setLearningExamples((items) => [...learned, ...items].slice(0, 160));
      setStatus(`AI Trainer đã học ${examples.length} mẫu.`);
    } catch {
    } finally {
      setTrainerLoading(false);
    }
  }

  function scoreCommunityQuestion(text: string) {
    const lower = text.toLowerCase();
    let score = 68;
    if (text.length <= 95) score += 8;
    if (text.length <= 55) score += 6;
    if (/\b(ip|pr|prm|pl|bn|kh|ko|đc|g|v|tr)\b/i.test(lower)) score += 7;
    if (!/[.!?]$/.test(text.trim())) score += 4;
    if (!/^(mình|em|tôi|anh|chị|mọi người|các bác|anh em)\b/i.test(text.trim())) score += 5;
    if (text.includes("\n")) score += 2;
    return Math.max(45, Math.min(98, score));
  }

  function inferCommunityTags(text: string) {
    const value = text.toLowerCase();
    const tags: string[] = [];
    if (/\b(ip|iphone|11|12|13|14|15|16|17|pr|prm|pl)\b/.test(value)) tags.push("iPhone");
    if (/samsung/.test(value)) tags.push("Samsung");
    if (/android|redmi|xiaomi|oppo|vivo|honor|oneplus/.test(value)) tags.push("Android");
    if (/bù|lên đời|đổi máy|thu cũ/.test(value)) tags.push("Đổi máy");
    if (/giá|bn|bao nhiêu|nhiêu/.test(value)) tags.push("Hỏi giá");
    if (/pin|face|màn|mực|lỗi|hư/.test(value)) tags.push("Tình trạng máy");
    if (/quy nhơn/.test(value)) tags.push("Quy Nhơn");
    if (/tr|triệu|củ/.test(value)) tags.push("Ngân sách");
    return tags.length ? tags.slice(0, 3) : ["Khác"];
  }

  async function generateCommunityQuestions(append = false) {
    setCommunityLoading(true);
    try {
      const existingTexts = communityQuestions.map((item) => item.text);
      const data = await callAI("community", {
        communityExamples,
        communityCopiedExamples: communityCopiedExamples.slice(0, 80),
        communitySettings,
        existingQuestions: communitySettings.avoidDuplicates ? existingTexts.slice(-120) : [],
      });
      const questions = Array.isArray(data.questions) ? data.questions : [];
      const mapped = questions.map((text: string) => {
        const clean = String(text).trim();
        return {
          id: makeId(),
          text: clean,
          createdAt: today(),
          copied: false,
          favorite: false,
          naturalScore: scoreCommunityQuestion(clean),
          tags: inferCommunityTags(clean),
          copyCount: 0,
        } as CommunityQuestion;
      }).filter((item: CommunityQuestion) => item.text);

      setCommunityQuestions((items) => {
        const base = append ? items : [];
        const seen = new Set(base.map((item) => item.text.replace(/\s+/g, " ").trim().toLowerCase()));
        const unique = mapped.filter((item: CommunityQuestion) => {
          const key = item.text.replace(/\s+/g, " ").trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        return [...base, ...unique].slice(-250);
      });
      setStatus(append ? `Đã tạo thêm ${mapped.length} câu.` : `Đã tạo ${mapped.length} câu hỏi cộng đồng.`);
    } catch {
    } finally {
      setCommunityLoading(false);
    }
  }

  function toggleCommunityFavorite(id: string) {
    setCommunityQuestions((items) =>
      items.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item)
    );
  }

  async function copyCommunityQuestion(item: CommunityQuestion) {
    await navigator.clipboard.writeText(item.text);
    setCommunityQuestions((items) =>
      items.map((question) =>
        question.id === item.id
          ? { ...question, copied: true, copyCount: (question.copyCount || 0) + 1 }
          : question
      )
    );
    setCommunityCopiedExamples((items) => {
      const normalized = item.text.replace(/\s+/g, " ").trim().toLowerCase();
      if (items.some((value) => value.replace(/\s+/g, " ").trim().toLowerCase() === normalized)) {
        return items;
      }
      return [item.text, ...items].slice(0, 200);
    });
    setStatus("Đã sao chép · Community AI ghi nhận đây là câu hỏi đạt.");
  }

  async function refineCommunityQuestions() {
    if (!communityFeedback.trim() || communityQuestions.length === 0) {
      setStatus("Nhập góp ý và phải có kết quả trước khi yêu cầu AI sửa.");
      return;
    }
    setCommunityRefining(true);
    try {
      const data = await callAI("community_refine", {
        feedback: communityFeedback,
        questions: communityQuestions.map((item) => item.text),
        communityExamples,
        communityCopiedExamples: communityCopiedExamples.slice(0, 80),
        communitySettings,
      });
      const questions = Array.isArray(data.questions) ? data.questions : [];
      const mapped = questions.map((text: string) => {
        const clean = String(text).trim();
        return {
          id: makeId(),
          text: clean,
          createdAt: today(),
          copied: false,
          favorite: false,
          naturalScore: scoreCommunityQuestion(clean),
          tags: inferCommunityTags(clean),
          copyCount: 0,
        } as CommunityQuestion;
      }).filter((item: CommunityQuestion) => item.text);
      if (mapped.length) {
        setCommunityQuestions(mapped);
        setCommunityFeedback("");
        setStatus(`AI đã sửa lại ${mapped.length} câu theo góp ý.`);
      }
    } catch {
    } finally {
      setCommunityRefining(false);
    }
  }

  function loadCommunitySampleText(text: string) {
    const clean = text.replace(/\r\n/g, "\n").trim();
    if (!clean) {
      setStatus("File câu hỏi mẫu đang trống.");
      return;
    }
    setCommunityExamples(clean);
    setShowCommunityLearning(false);
    const count = clean.split(/\n\s*\n/).filter(Boolean).length;
    setStatus(`Đã nạp ${count} nhóm câu hỏi mẫu để AI học.`);
  }

  async function importCommunitySampleFile(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      if (file.name.toLowerCase().endsWith(".json")) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            loadCommunitySampleText(parsed.map((item) => typeof item === "string" ? item : item?.text || "").filter(Boolean).join("\n\n"));
            return;
          }
          if (typeof parsed?.communityExamples === "string") {
            loadCommunitySampleText(parsed.communityExamples);
            return;
          }
          if (Array.isArray(parsed?.questions)) {
            loadCommunitySampleText(parsed.questions.map((item: unknown) => String(item || "")).join("\n\n"));
            return;
          }
        } catch {}
      }
      loadCommunitySampleText(text);
    } catch {
      setStatus("Không đọc được file câu hỏi mẫu.");
    }
  }

  const studioQuickFeedback = [
    "Hook yếu",
    "Quá dài",
    "Quá ngắn",
    "Giống AI",
    "Giống quảng cáo",
    "Thiếu twist",
    "Thiếu cảm xúc",
    "Chưa tự nhiên",
    "Ngắn gọn hơn",
    "Bình dân hơn",
    "Hay rồi",
  ];

  function toggleStudioFeedbackTag(tag: string) {
    setStudioFeedbackTags((items) =>
      items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag]
    );
  }

  function buildStudioLearningExample(content: string, weight = 1): LearningExample {
    const clean = content.trim();
    const firstLine = clean.split(/\n+/).find(Boolean)?.trim() || clean.slice(0, 120);
    const approximateWords = clean.split(/\s+/).filter(Boolean).length;
    return {
      id: makeId(),
      content: clean,
      title: title || "AI Studio",
      theme: theme || "AI Studio",
      copiedAt: today(),
      copyCount: Math.max(1, weight),
      source: "studio",
      signals: {
        opening: firstLine.slice(0, 180),
        hasDialogue: /["“”]|:\s*["“]/.test(clean),
        hasAudioTags: /\[[a-zA-Z]+\]/.test(clean),
        approximateWords,
      },
    };
  }

  function saveStudioFeedbackMemory(finalText: string, extra?: Partial<StudioFeedbackMemory>) {
    if (!result.trim()) return;
    const memory: StudioFeedbackMemory = {
      id: makeId(),
      createdAt: today(),
      prompt: idea,
      original: result,
      final: finalText || result,
      rating: studioRating,
      feedback: [...studioFeedbackTags, ...(studioFeedbackText.trim() ? [studioFeedbackText.trim()] : [])],
      copied: false,
      savedAsTemplate: false,
      ...extra,
    };
    setStudioFeedbackMemory((items) => [memory, ...items].slice(0, 250));
  }

  async function refineStudioResult() {
    if (!result.trim()) {
      setStatus("Chưa có kết quả AI để sửa.");
      return;
    }
    const feedback = [...studioFeedbackTags, studioFeedbackText.trim()].filter(Boolean);
    if (!feedback.length) {
      setStatus("Hãy chọn góp ý nhanh hoặc nhập góp ý cho AI.");
      return;
    }
    setStudioRefining(true);
    try {
      const data = await callAI("studio_refine", {
        original: result,
        idea,
        title,
        feedback,
        rating: studioRating,
        learningExamples: learningExamples.slice(0, 12),
        studioFeedbackMemory: studioFeedbackMemory.slice(0, 30),
      });
      const revised = String(data.text || "").trim();
      if (revised) {
        saveStudioFeedbackMemory(revised);
        setResult(revised);
        setStudioFeedbackText("");
        setStudioFeedbackTags([]);
        setStatus("AI đã sửa lại theo góp ý.");
      }
    } catch {
    } finally {
      setStudioRefining(false);
    }
  }

  async function copyStudioResult() {
    if (!result.trim()) return;
    await navigator.clipboard.writeText(result);
    saveStudioFeedbackMemory(result, { copied: true, rating: Math.max(studioRating, 4) });
    setLearningExamples((items) => [buildStudioLearningExample(result, 3), ...items].slice(0, 120));
    setStatus("Đã sao chép · AI ghi nhận đây là kết quả đạt.");
  }

  function saveStudioAsTemplate() {
    if (!result.trim()) return;
    setLearningExamples((items) => [buildStudioLearningExample(result, 6), ...items].slice(0, 120));
    saveStudioFeedbackMemory(result, { savedAsTemplate: true, rating: Math.max(studioRating, 5) });
    setStatus("Đã lưu làm bài chuẩn. AI sẽ ưu tiên học theo mẫu này.");
  }

  async function sendChat() {
    const text = chatInput.trim();
    if (!text) return;
    const userMessage: ChatMessage = { id: makeId(), role: "user", content: text };
    const history = [...messages, userMessage];
    setMessages(history);
    setChatInput("");
    try {
      const data = await callAI("chat", {
        input: text,
        history: history.slice(-12),
      });
      setMessages((items) => [
        ...items,
        { id: makeId(), role: "assistant", content: data.text },
      ]);
    } catch {}
  }

  function execEditor(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    if (editorRef.current) setResult(editorRef.current.innerText);
  }

  function saveScript() {
    if (!result.trim()) return;
    addVersion(result, "Đã lưu vào Kho Kịch bản");
    const item: Script = {
      id: makeId(),
      title: title || "Kịch bản chưa đặt tên",
      theme,
      content: result,
      createdAt: today(),
      favorite: false,
      status: "draft",
    };
    setScripts((items) => [item, ...items]);
    setStatus("Đã lưu vào Kho Kịch bản.");
  }

  function learnFromCopiedScript(text: string, source: LearningExample["source"], learnedTitle?: string, learnedTheme?: string) {
    const clean = text.trim();
    if (clean.length < 120) return;
    const normalized = clean.replace(/\s+/g, " ").toLowerCase();
    const existing = learningExamples.find((item) => item.content.replace(/\s+/g, " ").toLowerCase() === normalized);
    if (existing) {
      setLearningExamples((items) => items.map((item) => item.id === existing.id
        ? { ...item, copiedAt: today(), copyCount: item.copyCount + 1 }
        : item));
      return;
    }
    const firstLine = clean.split("\n").find((line) => line.trim())?.trim() || clean.slice(0, 120);
    const example: LearningExample = {
      id: makeId(),
      content: clean,
      title: learnedTitle || title || "Kịch bản đã được xác nhận",
      theme: learnedTheme || theme,
      copiedAt: today(),
      copyCount: 1,
      source,
      signals: {
        opening: firstLine.slice(0, 180),
        hasDialogue: /[“"].+?[”"]|:\s*[“"]/.test(clean),
        hasAudioTags: /\[[^\]]+\]/.test(clean),
        approximateWords: clean.split(/\s+/).filter(Boolean).length,
      },
    };
    setLearningExamples((items) => [example, ...items].slice(0, 120));
  }

  async function copyText(text: string, learn?: { source: LearningExample["source"]; title?: string; theme?: string }) {
    await navigator.clipboard.writeText(text);
    if (learn) {
      learnFromCopiedScript(text, learn.source, learn.title, learn.theme);
      setStatus("Đã sao chép · AI đã ghi nhận đây là kịch bản đạt.");
    } else {
      setStatus("Đã sao chép.");
    }
  }

  function exportData() {
    const data = JSON.stringify({ hooks, formulas, scripts, style, promptTemplates, knowledge, versionsHistory, learningExamples }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "content-universe-v22-1-data.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function importData(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.hooks)) setHooks(data.hooks);
        if (Array.isArray(data.formulas)) setFormulas(data.formulas);
        if (Array.isArray(data.scripts)) setScripts(data.scripts);
        if (typeof data.style === "string") setStyle(data.style);
        if (Array.isArray(data.promptTemplates)) setPromptTemplates(data.promptTemplates);
        if (data.knowledge) setKnowledge(data.knowledge);
        if (Array.isArray(data.versionsHistory)) setVersionsHistory(data.versionsHistory);
        if (Array.isArray(data.learningExamples)) setLearningExamples(data.learningExamples);
        setStatus("Đã nhập dữ liệu.");
      } catch {
        setStatus("File không hợp lệ.");
      }
    };
    reader.readAsText(file);
  }


  async function runPromptLab() {
    if (!promptTest.trim()) return;
    try {
      const data = await callAI("chat", {
        input: `Hãy thử prompt sau và chỉ trả về kết quả cuối cùng:\n\n${promptTest}`,
        history: [],
      });
      setPromptOutput(data.text);
    } catch {}
  }


  function addTopic() {
    const value = newTopic.trim();
    if (!value) return;
    if (topics.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setStatus("Chủ đề này đã tồn tại.");
      return;
    }
    setTopics((items) => [...items, value]);
    setNewTopic("");
    setTheme(value);
    setStatus("Đã thêm chủ đề.");
  }

  function saveTopicEdit() {
    if (!editingTopic) return;
    const value = editingTopic.value.trim();
    if (!value) return;
    setTopics((items) =>
      items.map((item) => (item === editingTopic.oldValue ? value : item))
    );
    setHooks((items) =>
      items.map((item) =>
        item.theme === editingTopic.oldValue ? { ...item, theme: value } : item
      )
    );
    setScripts((items) =>
      items.map((item) =>
        item.theme === editingTopic.oldValue ? { ...item, theme: value } : item
      )
    );
    if (theme === editingTopic.oldValue) setTheme(value);
    setEditingTopic(null);
    setStatus("Đã đổi tên chủ đề.");
  }

  function removeTopic(value: string) {
    if (topics.length <= 1) {
      setStatus("Cần giữ lại ít nhất một chủ đề.");
      return;
    }
    const next = topics.filter((item) => item !== value);
    setTopics(next);
    if (theme === value) setTheme(next[0]);
    setStatus("Đã xóa chủ đề.");
  }


  const fieldManagerConfig = fieldManager
    ? {
        buyer: {
          title: "Người mua",
          values: buyerTypes,
          setValues: setBuyerTypes,
          current: buyerType,
          setCurrent: setBuyerType,
        },
        companion: {
          title: "Người đi cùng",
          values: companions,
          setValues: setCompanions,
          current: companion,
          setCurrent: setCompanion,
        },
        location: {
          title: "Nơi xảy ra",
          values: locations,
          setValues: setLocations,
          current: location,
          setCurrent: setLocation,
        },
        speaker: {
          title: "Người nói Hook",
          values: hookSpeakers,
          setValues: setHookSpeakers,
          current: hookSpeaker,
          setCurrent: setHookSpeaker,
        },
        emotion: {
          title: "Cảm xúc mở đầu",
          values: openingEmotions,
          setValues: setOpeningEmotions,
          current: openingEmotion,
          setCurrent: setOpeningEmotion,
        },
      }[fieldManager]
    : null;

  function addFieldOption() {
    if (!fieldManagerConfig) return;
    const value = newFieldValue.trim();
    if (!value) return;
    if (fieldManagerConfig.values.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setStatus("Nội dung này đã tồn tại.");
      return;
    }
    fieldManagerConfig.setValues((items: string[]) => [...items, value]);
    fieldManagerConfig.setCurrent(value);
    setNewFieldValue("");
    setStatus(`Đã thêm ${fieldManagerConfig.title.toLowerCase()}.`);
  }

  function saveFieldOption() {
    if (!fieldManagerConfig || !editingField) return;
    const value = editingField.value.trim();
    if (!value) return;
    fieldManagerConfig.setValues((items: string[]) =>
      items.map((item) => (item === editingField.oldValue ? value : item))
    );
    if (fieldManagerConfig.current === editingField.oldValue) {
      fieldManagerConfig.setCurrent(value);
    }
    setEditingField(null);
    setStatus("Đã cập nhật.");
  }

  function deleteFieldOption(value: string) {
    if (!fieldManagerConfig || fieldManagerConfig.values.length <= 1) {
      setStatus("Cần giữ lại ít nhất một lựa chọn.");
      return;
    }
    const next = fieldManagerConfig.values.filter((item) => item !== value);
    fieldManagerConfig.setValues(next);
    if (fieldManagerConfig.current === value) fieldManagerConfig.setCurrent(next[0]);
    setStatus("Đã xóa.");
  }

  return (
    <div className={`app ${dark ? "dark" : ""} scale-${uiScale} theme-${accentTheme}`}>
      {showSplash && (
        <div className="brand-splash" aria-hidden="true">
          <div className="brand-splash-inner brand-splash-v15">
            <img className="brand-splash-wordmark-only" src="/sieu-di-dong-wordmark.png" alt="" />
            <span>CONTENT UNIVERSE</span>
            <div className="splash-progress"><b /></div>
          </div>
        </div>
      )}
      {mobileOpen && (
        <button
          className="mobile-drawer-backdrop"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="brand-box brand-box-v13">
          <div className="brand-symbol">
            <img src="/sieu-di-dong-symbol.png" alt="Biểu tượng Siêu Di Động" />
          </div>
          <div className="brand-copy">
            <strong>CONTENT UNIVERSE</strong>
            <small>Siêu Di Động · V28</small>
          </div>
          <button
            className="mobile-drawer-close"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="workspace">
          <span>WORKSPACE</span>
          <strong>Content Studio</strong>
        </div>

        <nav>
          {nav.map(([id, icon, label]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id);
                setMobileOpen(false);
              }}
            >
              <span>{icon}</span>
              {label}
              {id === "library" && scripts.length > 0 && <b>{scripts.length}</b>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span className="online-dot" />
          <div>
            <strong>Gemini Online</strong>
            <small>Content Engine sẵn sàng</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="heading">
            <button className="menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
            <div>
              <h1>{currentTitle}</h1>
              <p>Hệ điều hành AI dành riêng cho đội content Siêu Di Động</p>
            </div>
          </div>
          <div className="top-actions">
            <button className="icon-btn" onClick={() => setDark(!dark)}>{dark ? "☀" : "☾"}</button>
            <button className="secondary" onClick={exportData}>Xuất dữ liệu</button>
            <button className="primary" onClick={() => setPage("studio")}>＋ Kịch bản mới</button>
          </div>
        </header>

        <section className="content">
          {page === "dashboard" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="hero-brand-row hero-brand-v13">
                    <img src="/sieu-di-dong-wordmark.png" alt="Logo Siêu Di Động" />
                    <span className="eyebrow">CONTENT COMMAND CENTER</span>
                  </div>
                  <h2>Một ý tưởng nhỏ.<br />Năm phiên bản đủ mạnh để chọn.</h2>
                  <p>
                    V27 giúp Content Universe học từ kịch bản đã Copy, góp ý và bài chuẩn:
                    AI Studio tạo nội dung, AI Trainer học gu viết và AI Inspector kiểm định trước khi đăng.
                  </p>
                  <div className="hero-buttons">
                    <button className="yellow" onClick={() => setPage("studio")}>✦ Bắt đầu viết</button>
                    <button className="dark-ghost" onClick={() => setPage("trainer")}>◆ Mở AI Trainer</button>
                  </div>
                </div>
                <div className="hero-visual">
                  <div className="core">V27</div>
                  <div className="ring ring-a" />
                  <div className="ring ring-b" />
                  <span className="chip chip-a">HOOK</span>
                  <span className="chip chip-b">STORY</span>
                  <span className="chip chip-c">INSPECT</span>
                </div>
              </section>

              <div className="stats">
                {[
                  ["Tổng kịch bản", scripts.length, "Thư viện"],
                  ["AI đã viết", scripts.length + 23, "Gemini"],
                  ["Hook", hooks.length, `${hooks.filter((item) => item.favorite).length} yêu thích`],
                  ["Công thức", formulas.length, `${formulas.reduce((sum, item) => sum + item.used, 0)} lượt dùng`],
                ].map(([label, value, note]) => (
                  <article key={String(label)}>
                    <div><span>{label}</span><b>↗</b></div>
                    <strong>{value}</strong>
                    <small>{note}</small>
                  </article>
                ))}
              </div>

              <div className="dashboard-grid">
  
              <section className="ai-brain-dashboard-v28">
                <div>
                  <span className="eyebrow">AI BRAIN · V28</span>
                  <h3>AI đang học theo cách bạn chọn nội dung.</h3>
                  <p>Copy, góp ý, bài chuẩn và Trainer đều trở thành tín hiệu cho lần viết tiếp theo.</p>
                </div>
                <div className="brain-metrics-v28">
                  <article><b>{learningExamples.length}</b><span>Mẫu học</span></article>
                  <article><b>{studioFeedbackMemory.length}</b><span>Feedback</span></article>
                  <article><b>{communityCopiedExamples.length}</b><span>Community Copy</span></article>
                  <article className={adaptiveLearning ? "active" : ""}><b>{adaptiveLearning ? "ON" : "OFF"}</b><span>Adaptive</span></article>
                </div>
                <button className="dark-ghost" onClick={() => setPage("trainer")}>Mở AI Trainer →</button>
              </section>

              <section className="panel">
                  <div className="panel-head">
                    <div>
                      <span className="eyebrow">CHỦ ĐỀ</span>
                      <h3>Content Universe</h3>
                    </div>
                    <button onClick={() => setPage("analytics")}>Xem phân tích</button>
                  </div>
                  <div className="bars">
                    {themeStats.slice(0, 6).map((item) => (
                      <div className="bar-row" key={item.name}>
                        <div><span>{item.name}</span><b>{item.count}</b></div>
                        <div className="bar"><span style={{ width: `${Math.max(8, item.count / maxTheme * 100)}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <span className="eyebrow">GẦN ĐÂY</span>
                      <h3>Kịch bản mới nhất</h3>
                    </div>
                    <button onClick={() => setPage("library")}>Mở kho</button>
                  </div>
                  {scripts.length === 0 ? (
                    <div className="empty">
                      <span>✦</span>
                      <strong>Chưa có kịch bản</strong>
                      <p>Tạo kịch bản đầu tiên bằng Gemini.</p>
                    </div>
                  ) : (
                    <div className="recent">
                      {scripts.slice(0, 5).map((item) => (
                        <button key={item.id} onClick={() => {
                          setResult(item.content);
                          setTitle(item.title);
                          setTheme(item.theme);
                          setPage("studio");
                        }}>
                          <span>▤</span>
                          <div><strong>{item.title}</strong><small>{item.theme} · {formatDate(item.createdAt)}</small></div>
                          <b>›</b>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {page === "studio" && (
            <div className="studio-layout">
              <section className="composer panel">
                <span className="ai-label">✦ GEMINI CONTENT ENGINE</span>
                <h2>Bạn muốn kể chuyện gì?</h2>
                <p>Viết tự nhiên như đang nhắn cho một nhân viên content. AI tự xây mạch câu chuyện.</p>

                <textarea
                  value={idea}
                  onChange={(event) => setIdea(event.target.value)}
                  placeholder="Ví dụ: Anh khách đang họp với đối tác nước ngoài, điện thoại đứng hình lúc báo giá. Sếp nói mai còn mang máy này đi làm thì nghỉ, nhưng cuối cùng lại hỗ trợ tiền đổi máy..."
                />

                <div className="story-meta-title">
                  <div>
                    <span className="eyebrow">THÔNG TIN NHÂN VẬT</span>
                    <strong>Ai đang mua và chuyện xảy ra ở đâu?</strong>
                  </div>
                </div>

                <div className="character-controls character-controls-v16">
                  <label>
                    <span>Người mua</span>
                    <div className="select-with-action">
                      <select value={buyerType} onChange={(event) => setBuyerType(event.target.value)}>
                        {buyerTypes.map((item) => <option key={item}>{item}</option>)}
                      </select>
                      <button type="button" className="manage-topic-btn" onClick={() => setFieldManager("buyer")} title="Chỉnh sửa Người mua">⚙</button>
                    </div>
                  </label>

                  <label>
                    <span>Người đi cùng</span>
                    <div className="select-with-action">
                      <select value={companion} onChange={(event) => setCompanion(event.target.value)}>
                        {companions.map((item) => <option key={item}>{item}</option>)}
                      </select>
                      <button type="button" className="manage-topic-btn" onClick={() => setFieldManager("companion")} title="Chỉnh sửa Người đi cùng">⚙</button>
                    </div>
                  </label>

                  <label>
                    <span>Nơi xảy ra</span>
                    <div className="select-with-action">
                      <select value={location} onChange={(event) => setLocation(event.target.value)}>
                        {locations.map((item) => <option key={item}>{item}</option>)}
                      </select>
                      <button
                        type="button"
                        className="manage-topic-btn"
                        onClick={() => setFieldManager("location")}
                        title="Chỉnh sửa Nơi xảy ra"
                      >
                        ⚙
                      </button>
                    </div>
                  </label>

                  <label>
                    <span>Người nói Hook</span>
                    <div className="select-with-action">
                      <select value={hookSpeaker} onChange={(event) => setHookSpeaker(event.target.value)}>
                        {hookSpeakers.map((item) => <option key={item}>{item}</option>)}
                      </select>
                      <button type="button" className="manage-topic-btn" onClick={() => setFieldManager("speaker")} title="Chỉnh sửa Người nói Hook">⚙</button>
                    </div>
                  </label>

                  <label>
                    <span>Cảm xúc mở đầu</span>
                    <div className="select-with-action">
                      <select value={openingEmotion} onChange={(event) => setOpeningEmotion(event.target.value)}>
                        {openingEmotions.map((item) => <option key={item}>{item}</option>)}
                      </select>
                      <button type="button" className="manage-topic-btn" onClick={() => setFieldManager("emotion")} title="Chỉnh sửa Cảm xúc">⚙</button>
                    </div>
                  </label>
                </div>

                <div className="controls">
                  <label className="topic-control control-topic">
                    <span>Chủ đề</span>
                    <div className="select-with-action">
                      <select value={theme} onChange={(event) => setTheme(event.target.value)}>
                        {topics.map((item) => <option key={item}>{item}</option>)}
                      </select>
                      <button
                        type="button"
                        className="manage-topic-btn"
                        onClick={() => setTopicManagerOpen(true)}
                        aria-label="Quản lý chủ đề"
                        title="Thêm hoặc chỉnh sửa chủ đề"
                      >
                        ⚙
                      </button>
                    </div>
                  </label>
                  <label className="control-formula">
                    <span>Công thức</span>
                    <select value={formulaId} onChange={(event) => setFormulaId(event.target.value)}>
                      {formulas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </label>

                  <label className="control-prompt">
                    <span>Prompt Style</span>
                    <div className="select-with-action">
                      <select value={selectedPromptId} onChange={(event) => setSelectedPromptId(event.target.value)}>
                        {promptTemplates.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.isDefault ? "⭐ " : ""}{item.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="manage-topic-btn"
                        onClick={() => setPage("promptlab")}
                        title="Mở Kho Prompt"
                      >
                        ⌘
                      </button>
                    </div>
                  </label>
                  <label className="control-version">
                    <span>Phiên bản</span>
                    <select value={versions} onChange={(event) => setVersions(Number(event.target.value))}>
                      <option value={1}>1 bản</option>
                      <option value={3}>3 bản</option>
                      <option value={5}>5 bản</option>
                    </select>
                  </label>

                  <label className="control-length">
                    <span>Độ dài kịch bản</span>
                    <select
                      value={scriptLength}
                      onChange={(event) =>
                        setScriptLength(event.target.value as "short" | "medium" | "long")
                      }
                    >
                      <option value="short">Ngắn · 45–60 giây</option>
                      <option value="medium">Vừa · 60–90 giây</option>
                      <option value="long">Dài · 90–120 giây</option>
                    </select>
                  </label>
                </div>

                <div className="story-summary story-summary-v18-2">
                  <div>
                    <span>Nhân vật chính</span>
                    <strong>{resolvedBuyerType}</strong>
                  </div>
                  <div>
                    <span>Đi cùng</span>
                    <strong>{resolvedCompanion}</strong>
                  </div>
                  <div>
                    <span>Bối cảnh</span>
                    <strong>{resolvedLocation}</strong>
                  </div>
                  <div>
                    <span>Độ dài</span>
                    <strong>
                      {scriptLength === "short"
                        ? "Ngắn · 45–60 giây"
                        : scriptLength === "medium"
                          ? "Vừa · 60–90 giây"
                          : "Dài · 90–120 giây"}
                    </strong>
                  </div>
                </div>

                <div className="quick">
                  {["Bị bạn coi thường vì Android", "Mẹ dắt con mua máy học online", "Khách vào shop đòi gặp quản lý"].map((item) => (
                    <button key={item} onClick={() => setIdea(item)}>{item}</button>
                  ))}
                </div>

                <div className="compose-actions">
                  <button className="primary" disabled={!idea.trim()} onClick={generateScript}>✦ Viết bằng Gemini</button>
                  <button className="secondary" disabled={!idea.trim()} onClick={generateHooks}>Tạo 20 Hook</button>
                  <span>{status}</span>
                </div>

                <div className="studio-adaptive-v28">
                  <div className="adaptive-toggle-v28">
                    <label>
                      <input
                        type="checkbox"
                        checked={adaptiveLearning}
                        onChange={(event) => setAdaptiveLearning(event.target.checked)}
                      />
                      <span>
                        <strong>Adaptive Learning</strong>
                        <small>Tự áp dụng Style DNA, bài đã Copy và feedback vào lần viết tiếp theo.</small>
                      </span>
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={autoInspect}
                        onChange={(event) => setAutoInspect(event.target.checked)}
                      />
                      <span>
                        <strong>Tự kiểm định sau khi viết</strong>
                        <small>AI Inspector chấm ngầm sau mỗi lần tạo kịch bản.</small>
                      </span>
                    </label>
                  </div>

                  {lastInspectionScores && (
                    <div className="studio-mini-inspector-v28">
                      <span>Inspector</span>
                      <b>{lastInspectionScores.overall}/10</b>
                      <small>
                        Tự nhiên {lastInspectionScores.natural}/10 · Viral {lastInspectionScores.viral}/10 · Giống AI {Math.round(lastInspectionScores.aiLike * 10)}%
                      </small>
                      <button onClick={() => setPage("inspector")}>Xem chi tiết →</button>
                    </div>
                  )}
                </div>

                {result.trim() && (
                  <section className="studio-feedback-card">
                    <div className="studio-feedback-head">
                      <div>
                        <span className="eyebrow">AI FEEDBACK · V28</span>
                        <h3>Sửa kết quả theo góp ý</h3>
                        <p>Không ưng kết quả? Góp ý ngay tại đây để AI sửa lại, không cần tạo bài mới.</p>
                      </div>
                      <div className="studio-rating" aria-label="Đánh giá kết quả">
                        {[1,2,3,4,5].map((star) => (
                          <button
                            key={star}
                            className={studioRating >= star ? "active" : ""}
                            onClick={() => setStudioRating(star)}
                            title={`${star} sao`}
                          >★</button>
                        ))}
                      </div>
                    </div>

                    <div className="studio-feedback-chips">
                      {studioQuickFeedback.map((tag) => (
                        <button
                          key={tag}
                          className={studioFeedbackTags.includes(tag) ? "active" : ""}
                          onClick={() => toggleStudioFeedbackTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="studio-feedback-compose">
                      <textarea
                        value={studioFeedbackText}
                        onChange={(event) => setStudioFeedbackText(event.target.value)}
                        placeholder='Ví dụ: "hook chưa đủ sốc, đoạn giữa dài quá, bớt quảng cáo và kể giống khách thật hơn"'
                      />
                      <button className="primary" onClick={refineStudioResult} disabled={studioRefining}>
                        {studioRefining ? "AI đang sửa..." : "✦ AI sửa theo góp ý"}
                      </button>
                    </div>

                    <div className="studio-feedback-actions">
                      <button className="secondary" onClick={copyStudioResult}>⧉ Copy & học</button>
                      <button className="secondary" onClick={saveStudioAsTemplate}>★ Lưu làm bài chuẩn</button>
                      <span>AI Memory: {studioFeedbackMemory.length} phản hồi · {learningExamples.length} mẫu học</span>
                    </div>
                  </section>
                )}
              </section>

              <section className="editor panel">
                <div className="editor-header">
                  <div>
                    <span className="eyebrow">RICH TEXT EDITOR</span>
                    <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề kịch bản" />
                  </div>
                  <div>
                    <button onClick={() => copyText(result, { source: "studio", title, theme })}>Sao chép</button>
                    <button onClick={inspectCurrentStudio}>◎ Kiểm định</button>
                    <button onClick={() => downloadText("txt")}>TXT</button>
                    <button onClick={() => downloadText("md")}>MD</button>
                    <button className="save" onClick={saveScript}>Lưu</button>
                  </div>
                </div>

                <div className="toolbar">
                  <button onClick={() => execEditor("bold")}><b>B</b></button>
                  <button onClick={() => execEditor("italic")}><i>I</i></button>
                  <button onClick={() => execEditor("underline")}><u>U</u></button>
                  <button onClick={() => execEditor("backColor", "#fff0a6")}>Highlight</button>
                  <button onClick={() => execEditor("removeFormat")}>Xóa định dạng</button>
                </div>

                <div className="rewrite-bar">
                  <span>Viết lại nhanh</span>
                  <select value={rewriteStyle} onChange={(event) => setRewriteStyle(event.target.value)}>
                    <option value="viral">Viral, gây tò mò</option>
                    <option value="hài hước">Hài hước tự nhiên</option>
                    <option value="drama">Drama căng</option>
                    <option value="cảm xúc">Cảm xúc</option>
                    <option value="ngắn gọn">Rút ngắn 20%</option>
                    <option value="bán hàng mềm">Bán hàng mềm</option>
                  </select>
                  <button onClick={() => rewriteCurrent(rewriteStyle)}>✦ Viết lại</button>
                </div>

                <div
                  ref={editorRef}
                  className="rich-editor"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => setResult(event.currentTarget.innerText)}
                  data-placeholder="Kịch bản sẽ xuất hiện tại đây..."
                />

                <div className="editor-foot">
                  <span>{result.trim() ? result.trim().split(/\s+/).length : 0} từ</span>
                  <span>{syncState === "saving" ? "Đang đồng bộ..." : syncState === "saved" ? "✓ Đã đồng bộ máy tính & điện thoại" : syncState === "loading" ? "Đang tải dữ liệu..." : syncKey ? "Đã lưu trên máy · Cloud đang mất kết nối" : "Đã lưu trên máy · Chưa nhập mã đồng bộ"}</span>
                </div>

                <details className="version-history">
                  <summary>Lịch sử phiên bản <b>{versionsHistory.length}</b></summary>
                  <div>
                    {versionsHistory.length === 0 ? (
                      <p>Chưa có phiên bản cũ.</p>
                    ) : versionsHistory.slice(0, 10).map((item) => (
                      <button key={item.id} onClick={() => { addVersion(result, "Trước khi khôi phục"); setResult(item.content); setTitle(item.title); }}>
                        <span>{item.reason}</span>
                        <small>{new Date(item.createdAt).toLocaleString("vi-VN")}</small>
                      </button>
                    ))}
                  </div>
                </details>
              </section>


            </div>
          )}

          {page === "trainer" && (
            <div className="trainer-v27">
              <section className="trainer-hero-v27">
                <div>
                  <span className="eyebrow">AI TRAINER · V28</span>
                  <h2>Dạy AI viết đúng gu của bạn.</h2>
                  <p>Dán những bài bạn thấy hay. AI rút ra quy tắc, Style DNA và đưa mẫu tốt vào bộ nhớ dùng cho AI Studio.</p>
                </div>
                <div className="trainer-brain-v27 trainer-brain-v28">
                  <strong>{learningExamples.length + studioFeedbackMemory.length}</strong>
                  <span>Tín hiệu đã học</span>
                  <em className={adaptiveLearning ? "on" : "off"}>{adaptiveLearning ? "Adaptive ON" : "Adaptive OFF"}</em>
                </div>
              </section>

              <div className="trainer-layout-v27">
                <section className="panel trainer-input-v27">
                  <div className="panel-head">
                    <div><span className="eyebrow">DỮ LIỆU HUẤN LUYỆN</span><h3>Nạp bài mẫu</h3></div>
                    <span>{trainerInput.split(/\n\s*\n/).filter(Boolean).length} mẫu</span>
                  </div>
                  <p>Mỗi bài cách nhau bằng một dòng trống. Nên dùng những bài bạn thực sự muốn AI học theo.</p>
                  <textarea
                    value={trainerInput}
                    onChange={(event) => setTrainerInput(event.target.value)}
                    placeholder={"Dán bài mẫu 1...\n\nDán bài mẫu 2...\n\nDán bài mẫu 3..."}
                  />
                  <button className="primary trainer-button-v27" disabled={!trainerInput.trim() || trainerLoading} onClick={trainAIStyle}>
                    {trainerLoading ? "AI đang phân tích..." : "◆ Phân tích & cho AI học"}
                  </button>
                  <label className="trainer-adaptive-switch-v28">
                    <input type="checkbox" checked={adaptiveLearning} onChange={(e) => setAdaptiveLearning(e.target.checked)} />
                    <span>Dùng Style DNA này tự động trong AI Studio</span>
                  </label>
                </section>

                <section className="trainer-output-v27">
                  <div className="trainer-stats-v27">
                    <article><b>{learningExamples.length}</b><span>Bài/mẫu học</span></article>
                    <article><b>{studioFeedbackMemory.length}</b><span>Feedback</span></article>
                    <article><b>{studioFeedbackMemory.filter((item) => item.copied).length}</b><span>Bài đã Copy</span></article>
                    <article><b>{studioFeedbackMemory.filter((item) => item.savedAsTemplate).length}</b><span>Bài chuẩn</span></article>
                  </div>

                  <div className="panel trainer-analysis-v27">
                    <div className="panel-head">
                      <div><span className="eyebrow">STYLE DNA</span><h3>AI đã hiểu gì?</h3></div>
                    </div>
                    {trainerAnalysis ? (
                      <>
                        <p className="trainer-summary-v27">{trainerAnalysis.summary}</p>
                        <div className="trainer-dna-v27">
                          {[
                            ["Hook", trainerAnalysis.dna?.hook],
                            ["Kể chuyện", trainerAnalysis.dna?.storytelling],
                            ["Đời thường", trainerAnalysis.dna?.natural],
                            ["Twist", trainerAnalysis.dna?.twist],
                            ["Bán hàng mềm", trainerAnalysis.dna?.salesSoftness],
                          ].map(([label, value]) => (
                            <div key={String(label)}>
                              <span>{label}</span><strong>{Number(value || 0)}%</strong>
                              <i><b style={{width:`${Number(value || 0)}%`}} /></i>
                            </div>
                          ))}
                        </div>
                        <div className="trainer-rules-v27">
                          <strong>Quy tắc AI vừa học</strong>
                          {(trainerAnalysis.rules || []).map((rule, index) => <p key={index}>✓ {rule}</p>)}
                        </div>
                      </>
                    ) : (
                      <div className="trainer-empty-v27">
                        <b>Chưa có phân tích mới.</b>
                        <p>Nạp các bài mẫu bên trái rồi bấm “Phân tích & cho AI học”.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {page === "inspector" && (
            <div className="inspector-v27">
              <section className="panel inspector-input-v27">
                <div className="v27-section-head">
                  <div>
                    <span className="eyebrow">AI INSPECTOR · V28</span>
                    <h2>Kiểm định trước khi đăng.</h2>
                    <p>Dán kịch bản hoặc lấy thẳng bài đang viết trong AI Studio.</p>
                  </div>
                  <button
                    className="secondary"
                    onClick={() => {
                      setReviewInput(result);
                      setStatus(result.trim() ? "Đã lấy kịch bản từ AI Studio." : "AI Studio chưa có nội dung.");
                    }}
                  >
                    ← Lấy bài AI Studio
                  </button>
                </div>
                <textarea
                  value={reviewInput}
                  onChange={(event) => setReviewInput(event.target.value)}
                  placeholder="Dán kịch bản cần kiểm định..."
                />
                <div className="inspector-actions-v27">
                  <button className="primary" disabled={!reviewInput.trim()} onClick={inspectScript}>◎ Kiểm định</button>
                  <button className="secondary" disabled={!reviewInput.trim() || !reviewResult.trim()} onClick={fixFromInspector}>✦ Sửa theo Inspector</button>
                </div>
              </section>

              <section className="inspector-output-v27">
                <div className="inspector-score-grid-v27">
                  {[
                    ["Hook", scores?.hook, "score"],
                    ["Twist", scores?.twist, "score"],
                    ["Giữ chân", scores?.retention, "score"],
                    ["Tự nhiên", scores?.natural, "score"],
                    ["Logic", scores?.logic, "score"],
                    ["Viral", scores?.viral, "score"],
                    ["Giống AI", scores?.aiLike, "risk"],
                    ["Quảng cáo", scores?.adRisk, "risk"],
                    ["Tổng", scores?.overall, "score"],
                  ].map(([label, value, kind]) => (
                    <article key={String(label)} className={kind === "risk" ? "risk" : ""}>
                      <span>{label}</span>
                      <strong>
                        {typeof value === "number"
                          ? kind === "risk" ? `${Math.round(value * 10)}%` : `${value}/10`
                          : "—"}
                      </strong>
                      <div><b style={{ width: `${Number(value || 0) * 10}%` }} /></div>
                    </article>
                  ))}
                </div>

                <div className="panel inspector-analysis-v27">
                  <div className="panel-head">
                    <div><span className="eyebrow">PHÂN TÍCH</span><h3>AI Inspector</h3></div>
                    <button className="secondary" disabled={!reviewResult.trim()} onClick={() => copyText(reviewResult)}>Sao chép</button>
                  </div>
                  <div className="inspector-analysis-text-v27">
                    {reviewResult || "Kết quả kiểm định sẽ xuất hiện ở đây."}
                  </div>
                </div>
              </section>
            </div>
          )}

          {page === "community" && (() => {
            const allTags = Array.from(new Set(communityQuestions.flatMap((item) => item.tags || [])));
            const filteredQuestions = communityQuestions.filter((item) => {
              const searchOk = !communitySearch.trim() || item.text.toLowerCase().includes(communitySearch.toLowerCase());
              const tagOk = communityTagFilter === "Tất cả" || (item.tags || []).includes(communityTagFilter);
              const viewOk =
                communityView === "all" ||
                (communityView === "favorite" && item.favorite) ||
                (communityView === "copied" && item.copied);
              return searchOk && tagOk && viewOk;
            });
            const learnedWords = [...communityExamples.split(/\s+/), ...communityCopiedExamples.join(" ").split(/\s+/)]
              .map((word) => word.toLowerCase().replace(/[.,!?():;"']/g, ""))
              .filter((word) => word.length >= 2 && word.length <= 8);
            const vocabMap = learnedWords.reduce<Record<string, number>>((acc, word) => {
              acc[word] = (acc[word] || 0) + 1;
              return acc;
            }, {});
            const topVocab = Object.entries(vocabMap).sort((a, b) => b[1] - a[1]).slice(0, 12);
            const sampleCount = communityExamples.split(/\n\s*\n/).filter(Boolean).length;

            return (
              <>
                <div className="community-v25-top">
                  <div>
                    <span className="eyebrow">COMMUNITY AI · V25</span>
                    <h2>Câu hỏi cộng đồng.</h2>
                    <p>Tạo → xem kết quả → góp ý → AI sửa lại ngay trên cùng một danh sách.</p>
                  </div>
                  <div className="community-top-actions">
                    <button className="secondary" onClick={() => generateCommunityQuestions(true)} disabled={communityLoading}>＋ Sinh thêm</button>
                    <button className="primary" onClick={() => generateCommunityQuestions(false)} disabled={communityLoading}>
                      {communityLoading ? "Đang tạo..." : "✦ Tạo câu hỏi"}
                    </button>
                  </div>
                </div>

                <div className="community-v25-layout">
                  <aside className="community-v25-sidebar">
                    <section className="panel v25-setup-card">
                      <div className="v24-card-title">
                        <div><span className="eyebrow">THIẾT LẬP NHANH</span><h3>Tạo câu hỏi</h3></div>
                        <span className="community-count">{communitySettings.quantity} câu</span>
                      </div>

                      <div className="v24-form-grid">
                        <label><span>Số lượng</span>
                          <select value={communitySettings.quantity} onChange={(e) => setCommunitySettings({...communitySettings, quantity: Number(e.target.value)})}>
                            {[5,10,12,20,30,50].map((value) => <option key={value} value={value}>{value} câu</option>)}
                          </select>
                        </label>
                        <label><span>Dạng câu</span>
                          <select value={communitySettings.intent} onChange={(e) => setCommunitySettings({...communitySettings, intent: e.target.value})}>
                            {["Tự chọn","Hỏi giá","Tìm máy theo ngân sách","Đổi máy / bù thêm","Thu cũ đổi mới","Máy cũ / likenew","Hỏi pin / màn / Face ID","Mua gấp trong ngày","So sánh 2 máy","Mua số lượng"].map((value) => <option key={value}>{value}</option>)}
                          </select>
                        </label>
                        <label><span>Ngân sách</span><input value={communitySettings.budget} onChange={(e) => setCommunitySettings({...communitySettings, budget:e.target.value})} placeholder="2-3tr, 8tr..." /></label>
                        <label><span>Khu vực</span><input value={communitySettings.location} onChange={(e) => setCommunitySettings({...communitySettings, location:e.target.value})} placeholder="Quy Nhơn" /></label>
                      </div>

                      <div className="v24-range">
                        <div><strong>Ưu tiên iPhone</strong><span>{communitySettings.iphoneWeight}%</span></div>
                        <input type="range" min="0" max="100" step="5" value={communitySettings.iphoneWeight} onChange={(e) => setCommunitySettings({...communitySettings, iphoneWeight:Number(e.target.value)})} />
                      </div>
                      <div className="v24-range">
                        <div><strong>Độ đời thường</strong><span>{communitySettings.naturalness}%</span></div>
                        <input type="range" min="40" max="100" step="5" value={communitySettings.naturalness} onChange={(e) => setCommunitySettings({...communitySettings, naturalness:Number(e.target.value)})} />
                      </div>

                      <div className="v24-toggle-list">
                        <label><input type="checkbox" checked={communitySettings.omitSubject} onChange={(e) => setCommunitySettings({...communitySettings, omitSubject:e.target.checked})} />
                          <span><strong>Ưu tiên bỏ chủ ngữ</strong><small>“15pr giờ bn”, “cần máy 2-3tr”</small></span>
                        </label>
                        <label><input type="checkbox" checked={communitySettings.avoidDuplicates !== false} onChange={(e) => setCommunitySettings({...communitySettings, avoidDuplicates:e.target.checked})} />
                          <span><strong>Tránh câu đã sinh</strong><small>Giảm lặp trong các lần tạo sau</small></span>
                        </label>
                      </div>
                    </section>

                    <section className="panel v25-learning-loader">
                      <div className="v25-learning-head">
                        <div>
                          <span className="eyebrow">AI LEARNING</span>
                          <h3>Dữ liệu câu hỏi mẫu</h3>
                        </div>
                        <span className={sampleCount ? "v25-ready" : "v25-empty-badge"}>{sampleCount ? `${sampleCount} mẫu` : "Chưa nạp"}</span>
                      </div>
                      <p>Không hiển thị ô mẫu thường trực. Chỉ nạp dữ liệu khi cần để AI học cách nói.</p>
                      <div className="v25-loader-actions">
                        <label className="secondary v25-file-button">
                          ↑ Nạp file mẫu
                          <input type="file" accept=".txt,.json,.md,.csv" onChange={(e) => importCommunitySampleFile(e.target.files?.[0] || null)} />
                        </label>
                        <button className="secondary" onClick={() => setShowCommunityLearning(!showCommunityLearning)}>
                          {showCommunityLearning ? "Đóng" : "Dán mẫu"}
                        </button>
                      </div>
                      {showCommunityLearning && (
                        <div className="v25-paste-box">
                          <textarea value={communityExamples} onChange={(e) => setCommunityExamples(e.target.value)} placeholder="Dán các câu hỏi mẫu vào đây, cách nhau bằng một dòng trống..." />
                          <button className="primary" onClick={() => {
                            setShowCommunityLearning(false);
                            setStatus(`Đã lưu ${sampleCount} nhóm câu hỏi mẫu để AI học.`);
                          }}>✓ Lưu dữ liệu học</button>
                        </div>
                      )}
                      {sampleCount > 0 && (
                        <div className="v25-learned-summary">
                          <span>✓ AI đang sử dụng dữ liệu mẫu</span>
                          <button onClick={() => { setCommunityExamples(""); setStatus("Đã xóa câu hỏi mẫu."); }}>Xóa mẫu</button>
                        </div>
                      )}
                    </section>

                    <details className="panel v24-learning-card">
                      <summary><span><span className="eyebrow">VOCABULARY</span><strong>AI đang học từ</strong></span><span>{communityCopiedExamples.length} Copy</span></summary>
                      <div className="v24-vocab">
                        {topVocab.length ? topVocab.map(([word,count]) => <span key={word}>{word}<b>{count}</b></span>) : <small>Copy vài câu đạt để AI tự học thêm.</small>}
                      </div>
                    </details>
                  </aside>

                  <main className="community-v25-main">
                    <section className="panel v25-feedback-card">
                      <div className="v25-feedback-head">
                        <div>
                          <span className="eyebrow">GÓP Ý CHO AI</span>
                          <h3>Sửa lại kết quả vừa tạo</h3>
                        </div>
                        <span>{communityQuestions.length ? `${communityQuestions.length} câu hiện tại` : "Chưa có kết quả"}</span>
                      </div>
                      <div className="v25-feedback-row">
                        <textarea
                          value={communityFeedback}
                          onChange={(e) => setCommunityFeedback(e.target.value)}
                          placeholder='Ví dụ: "ngắn hơn nữa, bớt viết tắt, ưu tiên hỏi giá iPhone 14-16, câu phải cụt và không chủ ngữ"'
                        />
                        <button className="primary" onClick={refineCommunityQuestions} disabled={communityRefining || !communityQuestions.length}>
                          {communityRefining ? "AI đang sửa..." : "✦ Sửa theo góp ý"}
                        </button>
                      </div>
                      <div className="v25-feedback-chips">
                        {["ngắn hơn nữa","đời hơn, cụt hơn","bớt viết tắt","ưu tiên iPhone","thêm câu hỏi giá","không cần chủ ngữ","đa dạng hơn, đừng lặp form"].map((text) => (
                          <button key={text} onClick={() => setCommunityFeedback((old) => old ? `${old}, ${text}` : text)}>{text}</button>
                        ))}
                      </div>
                    </section>

                    <section className="panel community-v25-results">
                      <div className="v24-results-head">
                        <div><span className="eyebrow">KẾT QUẢ</span><h3>{filteredQuestions.length} câu hỏi</h3></div>
                        <button className="secondary" onClick={async () => {
                          await navigator.clipboard.writeText(filteredQuestions.map((item) => item.text).join("\n\n"));
                          setStatus("Đã sao chép toàn bộ câu đang hiển thị.");
                        }}>Copy tất cả</button>
                      </div>

                      <div className="v24-toolbar">
                        <input className="v24-search" value={communitySearch} onChange={(e) => setCommunitySearch(e.target.value)} placeholder="Tìm trong câu đã tạo..." />
                        <div className="v24-view-tabs">
                          <button className={communityView==="all"?"active":""} onClick={() => setCommunityView("all")}>Tất cả</button>
                          <button className={communityView==="favorite"?"active":""} onClick={() => setCommunityView("favorite")}>★ Đã thích</button>
                          <button className={communityView==="copied"?"active":""} onClick={() => setCommunityView("copied")}>✓ Đã Copy</button>
                        </div>
                      </div>

                      <div className="v24-tags">
                        {["Tất cả",...allTags].map((tag) => <button key={tag} className={communityTagFilter===tag?"active":""} onClick={() => setCommunityTagFilter(tag)}>{tag}</button>)}
                      </div>

                      {filteredQuestions.length === 0 ? (
                        <div className="community-empty"><b>Chưa có câu hỏi.</b><p>Bấm “Tạo câu hỏi” để bắt đầu.</p></div>
                      ) : (
                        <div className="v24-question-list">
                          {filteredQuestions.map((item) => (
                            <article className={`v24-question ${item.copied ? "copied" : ""}`} key={item.id}>
                              <button className={`v24-star ${item.favorite ? "active" : ""}`} onClick={() => toggleCommunityFavorite(item.id)}>★</button>
                              <div className="v24-question-body">
                                <div className="v24-question-meta">
                                  <span className={`v24-score ${item.naturalScore >= 88 ? "great" : item.naturalScore >= 76 ? "good" : ""}`}>{item.naturalScore}% tự nhiên</span>
                                  {(item.tags || []).map((tag) => <span className="v24-tag" key={tag}>{tag}</span>)}
                                  {item.copyCount > 0 && <span className="v24-copy-count">{item.copyCount}× copy</span>}
                                </div>
                                <p>{item.text}</p>
                              </div>
                              <button className={item.copied ? "success-btn":"secondary"} onClick={() => copyCommunityQuestion(item)}>{item.copied ? "✓ Đã Copy":"Copy"}</button>
                            </article>
                          ))}
                        </div>
                      )}

                      <div className="v24-bottom-actions"><button className="secondary" onClick={() => generateCommunityQuestions(true)} disabled={communityLoading}>＋ Sinh thêm {communitySettings.quantity} câu</button></div>
                    </section>
                  </main>
                </div>
              </>
            );
          })()}

          {page === "hooks" && (
            <>
              <div className="library-head">
                <div><span className="eyebrow">HOOK LIBRARY</span><h2>Kho mở đầu giữ chân người xem.</h2></div>
                <button className="primary" onClick={() => setEditingHook({
                  id: "",
                  text: "",
                  theme: topics[0] || defaultThemes[0],
                  favorite: false,
                  used: 0,
                  retention: 0,
                })}>＋ Thêm Hook</button>
              </div>

              <div className="filters">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm hook..." />
                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="all">Tất cả chủ đề</option>
                  {topics.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>

              <div className="hook-grid">
                {hooks.filter((item) =>
                  (filter === "all" || item.theme === filter) &&
                  `${item.theme} ${item.text}`.toLowerCase().includes(search.toLowerCase())
                ).map((item) => (
                  <article className="hook-card" key={item.id}>
                    <div className="card-head">
                      <span>{item.theme}</span>
                      <button className={item.favorite ? "star active" : "star"} onClick={() =>
                        setHooks((items) => items.map((hook) => hook.id === item.id ? { ...hook, favorite: !hook.favorite } : hook))
                      }>★</button>
                    </div>
                    <p>{item.text}</p>
                    <div className="retention">
                      <span>Giữ chân dự đoán</span>
                      <strong>{item.retention || 0}%</strong>
                    </div>
                    <div className="retention-bar"><span style={{ width: `${item.retention || 0}%` }} /></div>
                    <footer>
                      <span>Đã dùng {item.used} lần</span>
                      <div>
                        <button onClick={() => copyText(item.text)}>Copy</button>
                        <button onClick={() => setEditingHook(item)}>Sửa</button>
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            </>
          )}

          {page === "formulas" && (
            <>
              <div className="library-head">
                <div><span className="eyebrow">FORMULA LIBRARY</span><h2>Công thức kể chuyện đã đóng gói.</h2></div>
                <button className="primary" onClick={() => setEditingFormula({
                  id: "",
                  name: "",
                  category: "",
                  description: "",
                  structure: "",
                  favorite: false,
                  used: 0,
                })}>＋ Thêm Công thức</button>
              </div>

              <div className="formula-grid">
                {formulas.map((item, index) => (
                  <article className="formula-card" key={item.id}>
                    <div className="formula-no">{String(index + 1).padStart(2, "0")}</div>
                    <div className="card-head">
                      <span>{item.category}</span>
                      <button className={item.favorite ? "star active" : "star"} onClick={() =>
                        setFormulas((items) => items.map((formula) => formula.id === item.id ? { ...formula, favorite: !formula.favorite } : formula))
                      }>★</button>
                    </div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="structure">{item.structure}</div>
                    <footer>
                      <span>{item.used} lượt dùng</span>
                      <div>
                        <button onClick={() => {
                          setFormulaId(item.id);
                          setPage("studio");
                        }}>Dùng ngay</button>
                        <button onClick={() => setEditingFormula(item)}>Sửa</button>
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            </>
          )}

          {page === "library" && (
            <>
              <div className="library-head">
                <div><span className="eyebrow">SCRIPT LIBRARY</span><h2>Toàn bộ nội dung đã tạo.</h2></div>
                <button className="primary" onClick={() => setPage("studio")}>＋ Viết mới</button>
              </div>

              <div className="filters">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kịch bản..." />
                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="all">Tất cả</option>
                  <option value="draft">Chưa đăng</option>
                  <option value="posted">Đã đăng</option>
                  <option value="favorite">Yêu thích</option>
                </select>
              </div>

              <div className="script-list">
                {scripts.filter((item) => {
                  const pass =
                    filter === "all" ||
                    item.status === filter ||
                    (filter === "favorite" && item.favorite);
                  return pass && `${item.title} ${item.content}`.toLowerCase().includes(search.toLowerCase());
                }).map((item) => (
                  <article key={item.id}>
                    <div className="script-icon">▤</div>
                    <div className="script-body">
                      <div>
                        <h3>{item.title}</h3>
                        <button className={item.favorite ? "star active" : "star"} onClick={() =>
                          setScripts((items) => items.map((script) => script.id === item.id ? { ...script, favorite: !script.favorite } : script))
                        }>★</button>
                      </div>
                      <p>{item.content.slice(0, 230)}{item.content.length > 230 ? "..." : ""}</p>
                      <div className="tags">
                        <span>{item.theme}</span>
                        <span>{item.status === "posted" ? "Đã đăng" : "Chưa đăng"}</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                    <div className="script-actions">
                      <button onClick={() => {
                        setResult(item.content);
                        setTitle(item.title);
                        setTheme(item.theme);
                        setPage("studio");
                      }}>Mở</button>
                      <button onClick={() => copyText(item.content, { source: "library", title: item.title, theme: item.theme })}>Copy</button>
                      <button onClick={() => setScripts((items) => items.map((script) =>
                        script.id === item.id ? { ...script, status: script.status === "draft" ? "posted" : "draft" } : script
                      ))}>Trạng thái</button>
                      <button className="danger" onClick={() => setScripts((items) => items.filter((script) => script.id !== item.id))}>Xóa</button>
                    </div>
                  </article>
                ))}
                {scripts.length === 0 && <div className="empty large"><span>▤</span><strong>Kho kịch bản đang trống</strong><p>Lưu một kịch bản từ AI Studio để bắt đầu.</p></div>}
              </div>
            </>
          )}

          {page === "planner" && (
            <>
              <div className="library-head">
                <div>
                  <span className="eyebrow">CONTENT PLANNER</span>
                  <h2>Lên lịch nội dung cho cả tuần.</h2>
                </div>
                <button className="primary" onClick={() => setPage("studio")}>＋ Viết nội dung mới</button>
              </div>

              <div className="planner-grid">
                {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"].map((day, index) => (
                  <section className="planner-day panel" key={day}>
                    <div className="planner-day-head">
                      <div>
                        <span>Ngày {index + 1}</span>
                        <h3>{day}</h3>
                      </div>
                      <button onClick={() => {
                        setIdea(`${day}: `);
                        setPage("studio");
                      }}>＋</button>
                    </div>
                    <div className="planner-slot">
                      <strong>{index % 2 === 0 ? "Ý tưởng TikTok" : "Chưa có nội dung"}</strong>
                      <p>{index % 2 === 0 ? "Tạo một câu chuyện khách hàng có hook rõ lý do." : "Bấm dấu cộng để bắt đầu."}</p>
                    </div>
                    <textarea
                      placeholder="Ghi chú trong ngày..."
                      value={index === 0 ? plannerNote : ""}
                      onChange={(event) => index === 0 && setPlannerNote(event.target.value)}
                    />
                  </section>
                ))}
              </div>
            </>
          )}

          {page === "promptlab" && (
            <>
              <div className="library-head">
                <div>
                  <span className="eyebrow">PROMPT ENGINE</span>
                  <h2>Kho Prompt của Siêu Di Động.</h2>
                </div>
                <button
                  className="primary"
                  onClick={() =>
                    setEditingPrompt({
                      id: "",
                      name: "",
                      description: "",
                      systemPrompt: "",
                      userPrompt: "",
                      favorite: false,
                      isDefault: false,
                      used: 0,
                    })
                  }
                >
                  ＋ Thêm Prompt
                </button>
              </div>

              <div className="prompt-library-grid">
                {promptTemplates.map((item) => (
                  <article className="prompt-card" key={item.id}>
                    <div className="card-head">
                      <span>{item.isDefault ? "MẶC ĐỊNH" : "PROMPT"}</span>
                      <button
                        className={item.favorite ? "star active" : "star"}
                        onClick={() =>
                          setPromptTemplates((items) =>
                            items.map((prompt) =>
                              prompt.id === item.id
                                ? { ...prompt, favorite: !prompt.favorite }
                                : prompt
                            )
                          )
                        }
                      >
                        ★
                      </button>
                    </div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="prompt-card-meta">
                      <span>{item.used} lượt dùng</span>
                      <span>{item.userPrompt.length} ký tự</span>
                    </div>
                    <footer>
                      <button
                        onClick={() => {
                          setSelectedPromptId(item.id);
                          setPage("studio");
                        }}
                      >
                        Dùng ngay
                      </button>
                      <button onClick={() => setEditingPrompt(item)}>Sửa</button>
                      <button
                        onClick={() => {
                          const copy = {
                            ...item,
                            id: makeId(),
                            name: `${item.name} – Bản sao`,
                            isDefault: false,
                            used: 0,
                          };
                          setPromptTemplates((items) => [copy, ...items]);
                        }}
                      >
                        Nhân bản
                      </button>
                    </footer>
                  </article>
                ))}
              </div>
            </>
          )}

          {page === "knowledge" && (
            <>
              <div className="library-head">
                <div><span className="eyebrow">KNOWLEDGE BASE</span><h2>Bộ nhớ thương hiệu Siêu Di Động.</h2></div>
                <button className="primary" onClick={() => setKnowledge(defaultKnowledge)}>Khôi phục mặc định</button>
              </div>
              <div className="knowledge-grid">
                <label className="panel"><span>Giọng thương hiệu</span><textarea value={knowledge.brandVoice} onChange={(e) => setKnowledge({...knowledge, brandVoice:e.target.value})} /></label>
                <label className="panel"><span>Từ và cách nói không được dùng</span><textarea value={knowledge.forbiddenWords} onChange={(e) => setKnowledge({...knowledge, forbiddenWords:e.target.value})} /></label>
                <label className="panel"><span>Câu cửa miệng được ưu tiên</span><textarea value={knowledge.catchphrases} onChange={(e) => setKnowledge({...knowledge, catchphrases:e.target.value})} /></label>
                <label className="panel"><span>Quy tắc thông tin sản phẩm</span><textarea value={knowledge.productRules} onChange={(e) => setKnowledge({...knowledge, productRules:e.target.value})} /></label>
              </div>
              <div className="panel knowledge-note"><strong>AI dùng tự động</strong><p>Nội dung tại đây được gửi kèm khi tạo, viết lại, chấm điểm và trò chuyện với Gemini.</p></div>
            </>
          )}

          {page === "analytics" && (
            <>
              <div className="library-head">
                <div><span className="eyebrow">ANALYTICS</span><h2>Hiệu suất hệ thống nội dung.</h2></div>
              </div>
              <div className="analytics-grid">
                <section className="panel chart-panel">
                  <div className="panel-head"><div><span className="eyebrow">PHÂN BỔ</span><h3>Kịch bản theo chủ đề</h3></div></div>
                  <div className="columns">
                    {themeStats.map((item) => (
                      <div key={item.name}>
                        <b>{item.count}</b>
                        <div><span style={{ height: `${Math.max(8, item.count / maxTheme * 100)}%` }} /></div>
                        <small>{item.name.replace("Học sinh – sinh viên", "Học sinh")}</small>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="panel insight">
                  <span className="eyebrow">AI INSIGHT</span>
                  <h3>Gợi ý vận hành</h3>
                  <div><b>01</b><p>Hook có nhân vật, bối cảnh và câu nói căng thường giữ chân tốt hơn.</p></div>
                  <div><b>02</b><p>Luân phiên nhóm Công việc, Gia đình và Bị coi thường để tránh nội dung bị lặp.</p></div>
                  <div><b>03</b><p>Dùng AI Chat để chỉnh từng đoạn thay vì tạo lại toàn bộ kịch bản.</p></div>
                </section>
                <section className="panel insight">
                  <span className="eyebrow">AI LEARNING V22</span>
                  <h3>Học từ thao tác Copy</h3>
                  <div><b>{learningExamples.length}</b><p>Kịch bản đã được bạn xác nhận là đạt.</p></div>
                  <div><b>{learningExamples.reduce((sum, item) => sum + item.copyCount, 0)}</b><p>Tổng số lần Copy được dùng làm tín hiệu tích cực.</p></div>
                  <div><b>{learningExamples.filter((item) => item.signals.hasDialogue).length}</b><p>Mẫu có lời thoại tự nhiên để Gemini tham khảo.</p></div>
                  {learningExamples.length > 0 && <button className="secondary" onClick={() => { if (confirm("Xóa toàn bộ dữ liệu AI đã học từ nút Copy?")) setLearningExamples([]); }}>Xóa dữ liệu đã học</button>}
                </section>
              </div>
            </>
          )}

          {page === "settings" && (
            <div className="settings-grid">
              <section className="panel">
                <span className="eyebrow">PROMPT ENGINE</span>
                <h2>Phong cách Siêu Di Động</h2>
                <textarea className="style-box" value={style} onChange={(event) => setStyle(event.target.value)} />
                <small>Mọi thay đổi được tự động lưu. Khi kết nối Cloud, dữ liệu sẽ đồng bộ giữa máy tính và điện thoại.</small>
              </section>
              <section className="panel setting-side">
                <span className="eyebrow">DỮ LIỆU</span>
                <h3>Sao lưu và khôi phục</h3>
                <div className="cloud-sync-card">
                  <div className="cloud-sync-title">
                    <div className="cloud-heading-copy"><strong><span className="cloud-icon" aria-hidden="true">☁</span> Đồng bộ Cloud cá nhân</strong><p>Không cần tài khoản. Nhập cùng một mã trên máy tính và điện thoại.</p></div>
                    <span className={`cloud-status ${syncKey && syncState === "saved" ? "online" : ""}`}>{syncKey && syncState === "saved" ? "Đã kết nối" : "Chưa kết nối"}</span>
                  </div>
                  <label className="sync-key-field">
                    <span>Mã đồng bộ bí mật</span>
                    <div>
                      <input type={showSyncKey ? "text" : "password"} value={syncKeyInput} onChange={(event) => setSyncKeyInput(event.target.value)} placeholder="Tối thiểu 8 ký tự" autoComplete="off" />
                      <button type="button" className="secondary sync-show-btn" onClick={() => setShowSyncKey(!showSyncKey)}>{showSyncKey ? "Ẩn" : "Hiện"}</button>
                      <button type="button" className="secondary sync-copy-btn" disabled={!syncKeyInput} onClick={() => copyText(syncKeyInput)}>Sao chép</button>
                    </div>
                  </label>
                  <div className="cloud-actions">
                    <button className="secondary cloud-create-btn" onClick={createSyncKey}>Tạo mã an toàn</button>
                    <button className="primary cloud-connect-btn" onClick={connectSyncKey}>{syncKey ? "Đổi / kết nối lại" : "Kết nối Cloud"}</button>
                    {syncKey && <button className="secondary cloud-disconnect-btn" onClick={disconnectSyncKey}>Ngắt kết nối</button>}
                  </div>
                  {syncNotice && <small className="sync-notice">{syncNotice}</small>}
                  <small>Giữ kín mã này. Ai có mã đều có thể mở dữ liệu đồng bộ của bạn.</small>
                </div>
                <div><strong>Xuất dữ liệu</strong><p>Tải Hook, Công thức, Kịch bản và Prompt Engine.</p><button className="secondary" onClick={exportData}>Xuất JSON</button></div>
                <div><strong>Nhập dữ liệu</strong><p>Khôi phục từ file JSON.</p><label className="upload">Chọn file<input type="file" accept=".json" onChange={(event) => importData(event.target.files?.[0])} /></label></div>
                <div><strong>Giao diện</strong><p>Chuyển sáng hoặc tối.</p><button className="secondary" onClick={() => setDark(!dark)}>{dark ? "Giao diện sáng" : "Giao diện tối"}</button></div>
                <div>
                  <strong>Chủ đề nội dung</strong>
                  <p>Thêm, đổi tên hoặc xóa các chủ đề dùng trong AI Studio.</p>
                  <button className="secondary" onClick={() => setTopicManagerOpen(true)}>
                    Quản lý {topics.length} chủ đề
                  </button>
                </div>
                <div className="brand-preview-card brand-preview-v15">
                  <strong>Nhận diện thương hiệu</strong>
                  <p>Logo dài Siêu Di Động được dùng tại màn hình mở đầu và khu vực Dashboard.</p>
                  <div className="brand-preview-clean">
                    <img src="/sieu-di-dong-wordmark.png" alt="Logo Siêu Di Động" />
                  </div>
                  <div className="brand-usage-list">
                    <span>✓ Splash Screen</span>
                    <span>✓ Dashboard</span>
                    <span>✓ Sidebar dùng biểu tượng S</span>
                    <span>✓ Favicon và PWA</span>
                  </div>
                </div>

                <div className="appearance-setting">
                  <strong>Kích thước giao diện</strong>
                  <p>Tăng chữ và khoảng cách để đọc dễ hơn trên màn hình lớn.</p>
                  <div className="segmented">
                    {[
                      ["small", "Nhỏ"],
                      ["medium", "Vừa"],
                      ["large", "Lớn"],
                      ["xlarge", "Siêu lớn"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        className={uiScale === value ? "active" : ""}
                        onClick={() => setUiScale(value as "small" | "medium" | "large" | "xlarge")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="appearance-setting">
                  <strong>Màu chủ đạo</strong>
                  <p>Chọn phong cách màu phù hợp với cách làm việc.</p>
                  <div className="theme-picker">
                    {[
                      ["orange", "Siêu Di Động"],
                      ["gold", "Gold"],
                      ["ocean", "Ocean"],
                      ["purple", "Purple"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        className={`theme-dot ${value} ${accentTheme === value ? "active" : ""}`}
                        onClick={() => setAccentTheme(value as "orange" | "gold" | "ocean" | "purple")}
                      >
                        <span />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
        </section>
        <footer className="site-copyright">
          <h3>Content Universe™ <small>v22.4</small></h3>
          <span>© 2026 Siêu Di Động</span>
          <strong>Thiết kế và phát triển bởi Nguyễn Khánh Hải</strong>
          <small>All Rights Reserved.</small>
        </footer>
      </main>

      {actionToast && (
        <div className="action-toast" role="status" aria-live="polite">
          <span className="action-toast-check">✓</span>
          <span>{actionToast}</span>
        </div>
      )}

      {editingPrompt && (
        <div className="modal-bg">
          <div className="modal prompt-editor-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">PROMPT EDITOR</span>
                <h3>{editingPrompt.id ? "Chỉnh sửa Prompt" : "Thêm Prompt mới"}</h3>
              </div>
              <button onClick={() => setEditingPrompt(null)}>×</button>
            </div>

            <div className="prompt-editor-grid">
              <label>
                <span>Tên Prompt</span>
                <input
                  value={editingPrompt.name}
                  onChange={(event) =>
                    setEditingPrompt({ ...editingPrompt, name: event.target.value })
                  }
                />
              </label>
              <label>
                <span>Mô tả</span>
                <input
                  value={editingPrompt.description}
                  onChange={(event) =>
                    setEditingPrompt({ ...editingPrompt, description: event.target.value })
                  }
                />
              </label>
            </div>

            <label>
              <span>System Prompt</span>
              <textarea
                className="prompt-code"
                value={editingPrompt.systemPrompt}
                onChange={(event) =>
                  setEditingPrompt({ ...editingPrompt, systemPrompt: event.target.value })
                }
              />
            </label>

            <label>
              <span>User Prompt</span>
              <textarea
                className="prompt-code large"
                value={editingPrompt.userPrompt}
                onChange={(event) =>
                  setEditingPrompt({ ...editingPrompt, userPrompt: event.target.value })
                }
              />
            </label>

            <div className="prompt-variables">
              <strong>Biến có thể dùng</strong>
              <div>
                {[
                  "{{buyer}}",
                  "{{companion}}",
                  "{{location}}",
                  "{{hookSpeaker}}",
                  "{{emotion}}",
                  "{{topic}}",
                  "{{formula}}",
                  "{{length}}",
                  "{{story}}",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setEditingPrompt({
                        ...editingPrompt,
                        userPrompt: `${editingPrompt.userPrompt}\n${item}`,
                      })
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="prompt-options">
              <label>
                <input
                  type="checkbox"
                  checked={editingPrompt.favorite}
                  onChange={(event) =>
                    setEditingPrompt({ ...editingPrompt, favorite: event.target.checked })
                  }
                />
                Yêu thích
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={editingPrompt.isDefault}
                  onChange={(event) =>
                    setEditingPrompt({ ...editingPrompt, isDefault: event.target.checked })
                  }
                />
                Đặt làm mặc định
              </label>
            </div>

            <div className="modal-actions">
              {editingPrompt.id && (
                <button
                  className="danger-btn"
                  onClick={() => {
                    if (promptTemplates.length <= 1) return;
                    setPromptTemplates((items) =>
                      items.filter((item) => item.id !== editingPrompt.id)
                    );
                    setEditingPrompt(null);
                  }}
                >
                  Xóa
                </button>
              )}
              <button className="secondary" onClick={() => setEditingPrompt(null)}>
                Hủy
              </button>
              <button
                className="primary"
                onClick={() => {
                  if (!editingPrompt.name.trim()) return;
                  let next = editingPrompt.id
                    ? promptTemplates.map((item) =>
                        item.id === editingPrompt.id ? editingPrompt : item
                      )
                    : [{ ...editingPrompt, id: makeId() }, ...promptTemplates];

                  if (editingPrompt.isDefault) {
                    next = next.map((item) => ({
                      ...item,
                      isDefault: item.id === (editingPrompt.id || next[0].id),
                    }));
                    setSelectedPromptId(editingPrompt.id || next[0].id);
                  }

                  setPromptTemplates(next);
                  setEditingPrompt(null);
                }}
              >
                Lưu Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {fieldManager && fieldManagerConfig && (
        <div className="modal-bg">
          <div className="modal topic-manager-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">FIELD MANAGER</span>
                <h3>Quản lý {fieldManagerConfig.title}</h3>
              </div>
              <button onClick={() => {
                setFieldManager(null);
                setEditingField(null);
                setNewFieldValue("");
              }}>×</button>
            </div>

            <div className="add-topic-row">
              <input
                value={newFieldValue}
                onChange={(event) => setNewFieldValue(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && addFieldOption()}
                placeholder={`Thêm ${fieldManagerConfig.title.toLowerCase()} mới...`}
              />
              <button className="primary" onClick={addFieldOption}>＋ Thêm</button>
            </div>

            <div className="topic-list">
              {fieldManagerConfig.values.map((item) => (
                <div className="topic-item field-option-item" key={item}>
                  {editingField?.oldValue === item ? (
                    <>
                      <input
                        autoFocus
                        value={editingField.value}
                        onChange={(event) => setEditingField({ ...editingField, value: event.target.value })}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveFieldOption();
                          if (event.key === "Escape") setEditingField(null);
                        }}
                      />
                      <button className="topic-save" onClick={saveFieldOption}>Lưu</button>
                      <button onClick={() => setEditingField(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <span>{item}</span>
                      <button onClick={() => setEditingField({ oldValue: item, value: item })}>Sửa</button>
                      <button className="topic-delete" onClick={() => deleteFieldOption(item)}>Xóa</button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="primary" onClick={() => setFieldManager(null)}>Xong</button>
            </div>
          </div>
        </div>
      )}

      {topicManagerOpen && (
        <div className="modal-bg">
          <div className="modal topic-manager-modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">TOPIC MANAGER</span>
                <h3>Quản lý Chủ đề</h3>
              </div>
              <button onClick={() => setTopicManagerOpen(false)}>×</button>
            </div>

            <div className="add-topic-row">
              <input
                value={newTopic}
                onChange={(event) => setNewTopic(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addTopic();
                }}
                placeholder="Nhập chủ đề mới..."
              />
              <button className="primary" onClick={addTopic}>＋ Thêm</button>
            </div>

            <div className="topic-list">
              {topics.map((item) => (
                <div className="topic-item" key={item}>
                  {editingTopic?.oldValue === item ? (
                    <>
                      <input
                        autoFocus
                        value={editingTopic.value}
                        onChange={(event) =>
                          setEditingTopic({ ...editingTopic, value: event.target.value })
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveTopicEdit();
                          if (event.key === "Escape") setEditingTopic(null);
                        }}
                      />
                      <button className="topic-save" onClick={saveTopicEdit}>Lưu</button>
                      <button onClick={() => setEditingTopic(null)}>Hủy</button>
                    </>
                  ) : (
                    <>
                      <span>{item}</span>
                      <small>
                        {scripts.filter((script) => script.theme === item).length} kịch bản ·{" "}
                        {hooks.filter((hook) => hook.theme === item).length} hook
                      </small>
                      <button onClick={() => setEditingTopic({ oldValue: item, value: item })}>
                        Sửa
                      </button>
                      <button className="topic-delete" onClick={() => removeTopic(item)}>
                        Xóa
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="primary" onClick={() => setTopicManagerOpen(false)}>Xong</button>
            </div>
          </div>
        </div>
      )}

      {editingHook && (
        <div className="modal-bg">
          <div className="modal">
            <div className="modal-head"><div><span className="eyebrow">HOOK EDITOR</span><h3>{editingHook.id ? "Chỉnh sửa Hook" : "Thêm Hook"}</h3></div><button onClick={() => setEditingHook(null)}>×</button></div>
            <label><span>Chủ đề</span><select value={editingHook.theme} onChange={(event) => setEditingHook({ ...editingHook, theme: event.target.value })}>{topics.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label><span>Nội dung</span><textarea value={editingHook.text} onChange={(event) => setEditingHook({ ...editingHook, text: event.target.value })} /></label>
            <label><span>Tỷ lệ giữ chân dự đoán</span><input type="number" min="0" max="100" value={editingHook.retention || 0} onChange={(event) => setEditingHook({ ...editingHook, retention: Number(event.target.value) })} /></label>
            <div className="modal-actions">
              {editingHook.id && <button className="danger-btn" onClick={() => { setHooks((items) => items.filter((item) => item.id !== editingHook.id)); setEditingHook(null); }}>Xóa</button>}
              <button className="secondary" onClick={() => setEditingHook(null)}>Hủy</button>
              <button className="primary" onClick={() => {
                if (!editingHook.text.trim()) return;
                setHooks((items) => editingHook.id
                  ? items.map((item) => item.id === editingHook.id ? editingHook : item)
                  : [{ ...editingHook, id: makeId() }, ...items]);
                setEditingHook(null);
              }}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {editingFormula && (
        <div className="modal-bg">
          <div className="modal">
            <div className="modal-head"><div><span className="eyebrow">FORMULA EDITOR</span><h3>{editingFormula.id ? "Chỉnh sửa Công thức" : "Thêm Công thức"}</h3></div><button onClick={() => setEditingFormula(null)}>×</button></div>
            <label><span>Tên</span><input value={editingFormula.name} onChange={(event) => setEditingFormula({ ...editingFormula, name: event.target.value })} /></label>
            <label><span>Nhóm</span><input value={editingFormula.category} onChange={(event) => setEditingFormula({ ...editingFormula, category: event.target.value })} /></label>
            <label><span>Mô tả</span><textarea value={editingFormula.description} onChange={(event) => setEditingFormula({ ...editingFormula, description: event.target.value })} /></label>
            <label><span>Cấu trúc</span><textarea value={editingFormula.structure} onChange={(event) => setEditingFormula({ ...editingFormula, structure: event.target.value })} /></label>
            <div className="modal-actions">
              {editingFormula.id && <button className="danger-btn" onClick={() => { setFormulas((items) => items.filter((item) => item.id !== editingFormula.id)); setEditingFormula(null); }}>Xóa</button>}
              <button className="secondary" onClick={() => setEditingFormula(null)}>Hủy</button>
              <button className="primary" onClick={() => {
                if (!editingFormula.name.trim()) return;
                setFormulas((items) => editingFormula.id
                  ? items.map((item) => item.id === editingFormula.id ? editingFormula : item)
                  : [{ ...editingFormula, id: makeId() }, ...items]);
                setEditingFormula(null);
              }}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
