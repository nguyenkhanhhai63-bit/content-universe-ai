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
  drama: number;
  twist: number;
  retention: number;
  natural: number;
  overall: number;
};

const STORAGE_KEY = "content_universe_v8";

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

const nav = [
  ["dashboard", "⌂", "Tổng quan"],
  ["studio", "✦", "AI Studio"],
  ["chat", "◌", "AI Chat"],
  ["review", "◎", "AI đọc lại"],
  ["hooks", "↗", "Kho Hook"],
  ["formulas", "◇", "Kho Công thức"],
  ["library", "▤", "Kho Kịch bản"],
  ["planner", "▦", "Lịch nội dung"],
  ["promptlab", "⌘", "Prompt Lab"],
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
  const [result, setResult] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [reviewInput, setReviewInput] = useState("");
  const [reviewResult, setReviewResult] = useState("");
  const [scores, setScores] = useState<ReviewScores | null>(null);
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
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 850);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
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
      setBuyerType(data.buyerType || "Em khách");
      setCustomBuyerType(data.customBuyerType || "");
      setCompanion(data.companion || "Đi một mình");
      setLocation(data.location || defaultLocations[0]);
      setCustomCompanion(data.customCompanion || "");
      setHookSpeaker(data.hookSpeaker || "Người mua");
      setCustomHookSpeaker(data.customHookSpeaker || "");
      setOpeningEmotion(data.openingEmotion || "Căng thẳng");
      setMessages(data.messages || []);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        dark,
        uiScale,
        accentTheme,
        topics,
        buyerTypes,
        companions,
        hookSpeakers,
        openingEmotions,
        locations,
        hooks,
        formulas,
        scripts,
        style,
        messages,
        buyerType,
        customBuyerType,
        companion,
        customCompanion,
        location,
        hookSpeaker,
        customHookSpeaker,
        openingEmotion,
      })
    );
  }, [
    dark,
    uiScale,
    accentTheme,
    topics,
    buyerTypes,
    companions,
    hookSpeakers,
    openingEmotions,
    locations,
    hooks,
    formulas,
    scripts,
    style,
    messages,
    buyerType,
    customBuyerType,
    companion,
    customCompanion,
    location,
    hookSpeaker,
    customHookSpeaker,
    openingEmotion,
  ]);


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

  async function generateScript() {
    if (!idea.trim()) return;
    try {
      const data = await callAI("create");
      setResult(data.text);
      setTitle(`${theme} – ${new Date().toLocaleDateString("vi-VN")}`);
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

  async function reviewScript(rewrite = false) {
    if (!reviewInput.trim()) return;
    try {
      const data = await callAI(rewrite ? "rewrite" : "review", {
        input: reviewInput,
      });
      setReviewResult(data.text);
      if (data.scores) setScores(data.scores);
    } catch {}
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

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setStatus("Đã sao chép.");
  }

  function exportData() {
    const data = JSON.stringify({ hooks, formulas, scripts, style }, null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "content-universe-v8-data.json";
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
            <small>Siêu Di Động · V15.1</small>
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
                    V13 biến Content Universe thành trợ lý viết nội dung thực sự:
                    viết, trò chuyện, chấm điểm, lưu trữ và tối ưu trong một nơi.
                  </p>
                  <div className="hero-buttons">
                    <button className="yellow" onClick={() => setPage("studio")}>✦ Bắt đầu viết</button>
                    <button className="dark-ghost" onClick={() => setPage("chat")}>◌ Mở AI Chat</button>
                  </div>
                </div>
                <div className="hero-visual">
                  <div className="core">V13</div>
                  <div className="ring ring-a" />
                  <div className="ring ring-b" />
                  <span className="chip chip-a">HOOK</span>
                  <span className="chip chip-b">STORY</span>
                  <span className="chip chip-c">REVIEW</span>
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

                <div className="character-controls">
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
                  <label className="topic-control">
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
                  <label>
                    <span>Công thức</span>
                    <select value={formulaId} onChange={(event) => setFormulaId(event.target.value)}>
                      {formulas.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Phiên bản</span>
                    <select value={versions} onChange={(event) => setVersions(Number(event.target.value))}>
                      <option value={1}>1 bản</option>
                      <option value={3}>3 bản</option>
                      <option value={5}>5 bản</option>
                    </select>
                  </label>
                </div>

                <div className="story-summary">
                  <span>Nhân vật chính</span>
                  <strong>{resolvedBuyerType}</strong>
                  <span>Đi cùng</span>
                  <strong>{resolvedCompanion}</strong>
                  <span>Bối cảnh</span>
                  <strong>{resolvedLocation}</strong>
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
              </section>

              <section className="editor panel">
                <div className="editor-header">
                  <div>
                    <span className="eyebrow">RICH TEXT EDITOR</span>
                    <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tiêu đề kịch bản" />
                  </div>
                  <div>
                    <button onClick={() => copyText(result)}>Sao chép</button>
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
                  <span>Lưu tự động trong trình duyệt</span>
                </div>
              </section>
            </div>
          )}

          {page === "chat" && (
            <div className="chat-layout">
              <section className="chat-panel">
                <div className="chat-head">
                  <div className="chat-avatar">AI</div>
                  <div>
                    <strong>Content Assistant</strong>
                    <small><span className="online-dot" /> Gemini · Trực tuyến</small>
                  </div>
                  <button onClick={() => setMessages([])}>Xóa cuộc trò chuyện</button>
                </div>

                <div className="messages">
                  {messages.map((message) => (
                    <div key={message.id} className={`message ${message.role}`}>
                      <div className="message-avatar">{message.role === "user" ? "Bạn" : "AI"}</div>
                      <div className="bubble">{message.content}</div>
                    </div>
                  ))}
                </div>

                <div className="chat-composer">
                  <textarea
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendChat();
                      }
                    }}
                    placeholder="Ví dụ: Viết lại hook này gây sốc hơn, nhưng đừng chê khách nghèo..."
                  />
                  <button onClick={sendChat}>Gửi ↗</button>
                </div>
              </section>

              <aside className="chat-side panel">
                <span className="eyebrow">LỆNH NHANH</span>
                <h3>Sửa kịch bản bằng hội thoại</h3>
                {[
                  "Cho hài hơn nhưng vẫn hợp lý",
                  "Rút ngắn khoảng 20%",
                  "Thêm audio tag Adam V3",
                  "Viết hook rõ lý do hơn",
                  "Tạo một twist khác hoàn toàn",
                ].map((item) => (
                  <button key={item} onClick={() => setChatInput(item)}>{item}</button>
                ))}
                <div className="tip">
                  <strong>Mẹo</strong>
                  <p>Dán cả kịch bản vào chat rồi tiếp tục yêu cầu chỉnh từng phần. AI sẽ giữ ngữ cảnh các tin nhắn gần nhất.</p>
                </div>
              </aside>
            </div>
          )}

          {page === "review" && (
            <div className="review-layout">
              <section className="panel review-input">
                <span className="eyebrow">AI REVIEW</span>
                <h2>Chấm điểm trước khi đăng.</h2>
                <textarea
                  value={reviewInput}
                  onChange={(event) => setReviewInput(event.target.value)}
                  placeholder="Dán kịch bản TikTok vào đây..."
                />
                <div>
                  <button className="primary" onClick={() => reviewScript(false)}>◎ Chấm điểm</button>
                  <button className="secondary" onClick={() => reviewScript(true)}>✦ Viết lại</button>
                </div>
              </section>

              <section className="review-output">
                <div className="score-grid">
                  {[
                    ["Hook", scores?.hook],
                    ["Drama", scores?.drama],
                    ["Twist", scores?.twist],
                    ["Giữ chân", scores?.retention],
                    ["Tự nhiên", scores?.natural],
                    ["Tổng", scores?.overall],
                  ].map(([label, value]) => (
                    <article key={String(label)}>
                      <span>{label}</span>
                      <strong>{typeof value === "number" ? `${value}/10` : "—"}</strong>
                      <div><b style={{ width: `${Number(value || 0) * 10}%` }} /></div>
                    </article>
                  ))}
                </div>
                <div className="panel review-text">
                  <div className="panel-head">
                    <div><span className="eyebrow">PHÂN TÍCH</span><h3>Đề xuất của Gemini</h3></div>
                    <button onClick={() => copyText(reviewResult)}>Sao chép</button>
                  </div>
                  <textarea value={reviewResult} onChange={(event) => setReviewResult(event.target.value)} />
                </div>
              </section>
            </div>
          )}

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
                      <button onClick={() => copyText(item.content)}>Copy</button>
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
            <div className="prompt-lab">
              <section className="panel prompt-builder">
                <span className="eyebrow">PROMPT LAB</span>
                <h2>Thử prompt trước khi đưa vào hệ thống.</h2>
                <p>
                  Dùng khu vực này để kiểm tra cách Gemini phản hồi với một prompt mới,
                  rồi mới đưa quy tắc đó vào Prompt Engine.
                </p>
                <textarea
                  value={promptTest}
                  onChange={(event) => setPromptTest(event.target.value)}
                  placeholder="Ví dụ: Viết 5 hook có nhân vật rõ ràng, bối cảnh tại shop, gây tranh cãi nhưng không chê khách nghèo..."
                />
                <div className="prompt-lab-actions">
                  <button className="primary" onClick={runPromptLab} disabled={!promptTest.trim()}>⌘ Chạy thử prompt</button>
                  <button className="secondary" onClick={() => setPromptTest("")}>Xóa</button>
                </div>
              </section>
              <section className="panel prompt-preview">
                <div className="panel-head">
                  <div><span className="eyebrow">KẾT QUẢ THỬ</span><h3>Gemini Preview</h3></div>
                  <button onClick={() => copyText(promptOutput)}>Sao chép</button>
                </div>
                <textarea value={promptOutput} onChange={(event) => setPromptOutput(event.target.value)} placeholder="Kết quả chạy thử sẽ xuất hiện tại đây..." />
              </section>
            </div>
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
              </div>
            </>
          )}

          {page === "settings" && (
            <div className="settings-grid">
              <section className="panel">
                <span className="eyebrow">PROMPT ENGINE</span>
                <h2>Phong cách Siêu Di Động</h2>
                <textarea className="style-box" value={style} onChange={(event) => setStyle(event.target.value)} />
                <small>Mọi thay đổi được lưu tự động trong trình duyệt.</small>
              </section>
              <section className="panel setting-side">
                <span className="eyebrow">DỮ LIỆU</span>
                <h3>Sao lưu và khôi phục</h3>
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
      </main>

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
