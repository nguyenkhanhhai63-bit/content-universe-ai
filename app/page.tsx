"use client";

import { useEffect, useState } from "react";

type Hook = {
  id: string;
  theme: string;
  text: string;
  favorite?: boolean;
  used?: number;
};

type Formula = {
  id: string;
  name: string;
  category: string;
  description: string;
  template: string;
  favorite?: boolean;
};

type Story = {
  id: string;
  title: string;
  theme: string;
  status: "draft" | "posted";
  content: string;
  created: string;
  favorite?: boolean;
};

type AIResult = {
  text: string;
  scores?: {
    hook: number;
    logic: number;
    twist: number;
    emotion: number;
    retention: number;
  };
};

const defaultStyle = `Bạn là TikToker chuyên kể chuyện công nghệ cho Siêu Di Động, sử dụng giọng Adam trên ElevenLabs V3.

QUY TẮC BẮT BUỘC
- Viết giống người thật đang kể một chuyện vừa xảy ra tại shop.
- Không viết kiểu MC, quảng cáo hoặc review khô.
- Hook phải rõ ai, đang ở đâu, chuyện gì xảy ra và vì sao đáng chú ý.
- Có mâu thuẫn, diễn biến, cao trào, twist và kết thúc hợp lý.
- Không đánh số từng đoạn trong kịch bản.
- Không tự bịa thông số máy nếu người dùng chưa cung cấp.
- Không chê khách nghèo.
- Không dùng: chốt đơn, siêu phẩm, xuống tiền, múc, cấu hình khủng.
- Audio tag phải đi cùng cảm xúc và nội dung, ví dụ: [surprised] Hả??? ...
- Hook không bắt buộc dùng audio tag.
- Ưu tiên ngôn ngữ bình dân, tự nhiên, có chút hài hước và kịch tính.
- Những cụm có thể dùng: mấy má, ê ê ê, dữ thần nha, thiệt luôn á, dứt lẹ.
- Mỗi câu phải có tác dụng đẩy câu chuyện đi tiếp.
- Khi viết nhiều phiên bản, mỗi bản phải khác thật sự về góc kể hoặc nhịp kể.`;

const defaultHooks: Hook[] = [
  {
    id: "h1",
    theme: "Công việc",
    text: "Đang gọi video với đối tác nước ngoài, điện thoại anh khách đứng hình đúng lúc bên kia hỏi tới báo giá. Sếp quay sang nói thẳng: “Mai còn mang cái máy này đi làm thì nghỉ luôn đi!”",
    favorite: true,
    used: 6,
  },
  {
    id: "h2",
    theme: "Bị coi thường",
    text: "Đi cà phê với hội bạn, chị khách vừa đặt điện thoại lên bàn thì có đứa cười: “Android cỏ mà cũng đem ra khoe hả?”",
    favorite: false,
    used: 4,
  },
  {
    id: "h3",
    theme: "Gia đình",
    text: "Vừa bước vào Siêu Di Động, mẹ em khách đã nói lớn: “Tài chính hơn bốn triệu thôi, tư vấn sao cho nó học được chứ đừng dụ chơi game nha!”",
    favorite: true,
    used: 8,
  },
  {
    id: "h4",
    theme: "Tình yêu",
    text: "Chụp cho người yêu hơn ba chục tấm mà tấm nào cũng bị chê mờ, anh khách bị dọa chia tay ngay giữa quán cà phê.",
    favorite: false,
    used: 2,
  },
  {
    id: "h5",
    theme: "Hiểu lầm shop",
    text: "Anh khách vừa bước vào shop đã đập tay xuống bàn: “Shop làm ăn kiểu gì vậy em?” làm cả nhân viên đứng hình mất ba giây.",
    favorite: true,
    used: 5,
  },
];

const defaultFormulas: Formula[] = [
  {
    id: "f1",
    name: "Căng thẳng rồi bẻ lái",
    category: "Kể chuyện",
    description: "Mở đầu bằng sự cố nghiêm trọng, đẩy căng thẳng lên cao rồi bẻ lái theo hướng hài hoặc ấm áp.",
    favorite: true,
    template: "Hook → Sự cố → Phản ứng nhân vật → Cao trào → Bẻ lái → Kết",
  },
  {
    id: "f2",
    name: "Hiểu lầm rồi mua luôn",
    category: "Hiểu lầm",
    description: "Khách tới với thái độ căng, nhân viên kiểm tra, sự thật lộ ra và kết thúc bất ngờ.",
    favorite: false,
    template: "Hook căng → Đối chất → Test trực tiếp → Sự thật → Twist → Kết",
  },
  {
    id: "f3",
    name: "Bị coi thường rồi dằn mặt",
    category: "Gây tranh cãi",
    description: "Nhân vật bị chê, âm thầm đổi máy rồi quay lại khiến người chê phải im.",
    favorite: true,
    template: "Bị chê → Ấm ức → Tìm giải pháp → Trải nghiệm → Quay lại → Dằn mặt",
  },
  {
    id: "f4",
    name: "Phụ huynh cấm rồi bẻ lái",
    category: "Gia đình",
    description: "Phụ huynh đặt điều kiện gắt, nhân viên tư vấn hợp lý và cuối cùng phụ huynh đổi ý.",
    favorite: false,
    template: "Điều kiện gắt → Nhân viên giải thích → Con thử máy → Phụ huynh kiểm tra → Đồng ý",
  },
];

const STORAGE_KEY = "content_universe_v7";

const navItems = [
  ["dashboard", "⌂", "Tổng quan"],
  ["writer", "✦", "AI Writer"],
  ["review", "◎", "AI đọc lại"],
  ["hooks", "↗", "Kho Hook"],
  ["formulas", "◇", "Kho Công thức"],
  ["stories", "▤", "Kho Kịch bản"],
  ["universe", "◉", "Content Universe"],
  ["analytics", "⌁", "Phân tích"],
  ["settings", "⚙", "Thiết lập"],
];

const themes = [
  "Công việc",
  "Bị coi thường",
  "Tình yêu",
  "Gia đình",
  "Học sinh – sinh viên",
  "Game",
  "Tiền bạc",
  "Hiểu lầm shop",
];

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
  const [hooks, setHooks] = useState<Hook[]>(defaultHooks);
  const [formulas, setFormulas] = useState<Formula[]>(defaultFormulas);
  const [stories, setStories] = useState<Story[]>([]);
  const [style, setStyle] = useState(defaultStyle);
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState("Công việc");
  const [formulaId, setFormulaId] = useState("f1");
  const [versions, setVersions] = useState(1);
  const [result, setResult] = useState("");
  const [title, setTitle] = useState("");
  const [reviewInput, setReviewInput] = useState("");
  const [reviewResult, setReviewResult] = useState("");
  const [reviewScores, setReviewScores] = useState<AIResult["scores"]>();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [hookForm, setHookForm] = useState<Hook | null>(null);
  const [formulaForm, setFormulaForm] = useState<Formula | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setHooks(data.hooks || defaultHooks);
      setFormulas(data.formulas || defaultFormulas);
      setStories(data.stories || []);
      setStyle(data.style || defaultStyle);
      setDark(Boolean(data.dark));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ hooks, formulas, stories, style, dark })
    );
  }, [hooks, formulas, stories, style, dark]);

  async function callAI(mode: string, input = "") {
    setStatus("Gemini đang suy nghĩ...");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          input,
          prompt,
          theme,
          formula: formulas.find((item) => item.id === formulaId),
          versions,
          style,
          hooks: hooks.slice(0, 20),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lỗi AI.");

      if (mode === "review") {
        setReviewResult(data.text);
        setReviewScores(data.scores);
      } else if (mode === "rewrite") {
        setReviewResult(data.text);
      } else {
        setResult(data.text);
        if (!title) setTitle(`${theme} – ${new Date().toLocaleDateString("vi-VN")}`);
      }
      setStatus("Hoàn tất.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Lỗi AI.");
    }
  }

  async function saveStory() {
    if (!result.trim()) {
      setStatus("Chưa có nội dung để lưu.");
      return;
    }
    const story: Story = {
      id: crypto.randomUUID(),
      title: title || "Kịch bản chưa đặt tên",
      theme,
      status: "draft",
      content: result,
      created: new Date().toISOString(),
      favorite: false,
    };
    setStories((items) => [story, ...items]);
    setStatus("Đã lưu vào Kho Kịch bản.");
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Đã sao chép.");
    } catch {
      setStatus("Không thể sao chép tự động.");
    }
  }

  function exportData() {
    const payload = { hooks, formulas, stories, style, exportedAt: new Date().toISOString() };
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    );
    anchor.download = "content-universe-v7-data.json";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  }

  function importData(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data.hooks)) setHooks(data.hooks);
        if (Array.isArray(data.formulas)) setFormulas(data.formulas);
        if (Array.isArray(data.stories)) setStories(data.stories);
        if (typeof data.style === "string") setStyle(data.style);
        setStatus("Đã nhập dữ liệu.");
      } catch {
        setStatus("File dữ liệu không hợp lệ.");
      }
    };
    reader.readAsText(file);
  }

  const dashboardStats = [
    ["Tổng kịch bản", stories.length, "+12% tháng này"],
    ["AI đã viết", stories.length + 17, "Gemini"],
    ["Hook", hooks.length, `${hooks.filter((h) => h.favorite).length} yêu thích`],
    ["Công thức", formulas.length, `${formulas.filter((f) => f.favorite).length} nổi bật`],
  ];

  const themeCounts = themes.map((item) => ({
    name: item,
    count: stories.filter((story) => story.theme === item).length,
  }));
  const maxTheme = Math.max(1, ...themeCounts.map((item) => item.count));

  const currentTitle = navItems.find((item) => item[0] === page)?.[2] || "";

  return (
    <div className={dark ? "app dark" : "app"}>
      <aside className={mobileOpen ? "sidebar open" : "sidebar"}>
        <div className="brand-wrap">
          <div className="brand-mark">CU</div>
          <div>
            <div className="brand">CONTENT UNIVERSE</div>
            <div className="brand-sub">Siêu Di Động · V7</div>
          </div>
        </div>

        <div className="workspace">
          <span>WORKSPACE</span>
          <strong>Content Studio</strong>
        </div>

        <nav className="nav">
          {navItems.map(([id, icon, label]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id);
                setMobileOpen(false);
              }}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
              {id === "stories" && stories.length > 0 && (
                <span className="nav-count">{stories.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="ai-status">
            <span className="pulse" />
            <div>
              <strong>Gemini đang hoạt động</strong>
              <small>AI Writer sẵn sàng</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="top-title">
            <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>
              ☰
            </button>
            <div>
              <h1>{currentTitle}</h1>
              <p>Hệ điều hành nội dung dành riêng cho Siêu Di Động</p>
            </div>
          </div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => setDark(!dark)} title="Đổi giao diện">
              {dark ? "☀" : "☾"}
            </button>
            <button className="ghost-button" onClick={exportData}>Xuất dữ liệu</button>
            <button className="primary-button" onClick={() => setPage("writer")}>
              <span>＋</span> Kịch bản mới
            </button>
          </div>
        </header>

        <section className="content">
          {page === "dashboard" && (
            <>
              <div className="hero-card">
                <div>
                  <span className="eyebrow">CONTENT COMMAND CENTER</span>
                  <h2>Biến một ý tưởng nhỏ thành kịch bản giữ chân người xem.</h2>
                  <p>
                    Gemini sẽ đọc phong cách Siêu Di Động, chọn công thức phù hợp và tạo
                    câu chuyện hoàn chỉnh thay vì ghép từng ô máy móc.
                  </p>
                  <div className="hero-actions">
                    <button className="primary-button" onClick={() => setPage("writer")}>
                      ✦ Bắt đầu viết
                    </button>
                    <button className="glass-button" onClick={() => setPage("review")}>
                      ◎ Kiểm tra kịch bản
                    </button>
                  </div>
                </div>
                <div className="hero-orbit">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="ai-core">AI</div>
                  <span className="orbit-dot dot-one">HOOK</span>
                  <span className="orbit-dot dot-two">TWIST</span>
                  <span className="orbit-dot dot-three">STORY</span>
                </div>
              </div>

              <div className="stats-grid">
                {dashboardStats.map(([label, value, note]) => (
                  <article className="stat-card" key={String(label)}>
                    <div className="stat-top">
                      <span>{label}</span>
                      <span className="trend">↗</span>
                    </div>
                    <strong>{value}</strong>
                    <small>{note}</small>
                  </article>
                ))}
              </div>

              <div className="dashboard-grid">
                <section className="panel">
                  <div className="panel-head">
                    <div>
                      <span className="eyebrow">HIỆU SUẤT CHỦ ĐỀ</span>
                      <h3>Content Universe</h3>
                    </div>
                    <button className="text-button" onClick={() => setPage("universe")}>Xem tất cả</button>
                  </div>
                  <div className="bars">
                    {themeCounts.slice(0, 6).map((item) => (
                      <div className="bar-item" key={item.name}>
                        <div className="bar-label">
                          <span>{item.name}</span>
                          <strong>{item.count}</strong>
                        </div>
                        <div className="bar-track">
                          <span style={{ width: `${Math.max(7, (item.count / maxTheme) * 100)}%` }} />
                        </div>
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
                    <button className="text-button" onClick={() => setPage("stories")}>Mở kho</button>
                  </div>
                  <div className="recent-list">
                    {stories.length === 0 ? (
                      <div className="empty-mini">
                        <span>✦</span>
                        <strong>Chưa có kịch bản</strong>
                        <p>Tạo kịch bản đầu tiên bằng Gemini.</p>
                      </div>
                    ) : (
                      stories.slice(0, 5).map((story) => (
                        <button
                          className="recent-item"
                          key={story.id}
                          onClick={() => {
                            setResult(story.content);
                            setTitle(story.title);
                            setTheme(story.theme);
                            setPage("writer");
                          }}
                        >
                          <span className="recent-icon">▤</span>
                          <span>
                            <strong>{story.title}</strong>
                            <small>{story.theme} · {formatDate(story.created)}</small>
                          </span>
                          <span>›</span>
                        </button>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

          {page === "writer" && (
            <div className="writer-layout">
              <section className="writer-panel">
                <div className="writer-intro">
                  <span className="ai-badge">✦ GEMINI WRITER</span>
                  <h2>Hôm nay bạn muốn kể câu chuyện gì?</h2>
                  <p>
                    Chỉ cần mô tả tình huống. AI sẽ tự xây dựng hook, mâu thuẫn,
                    diễn biến, twist và kết thúc đúng chất Siêu Di Động.
                  </p>
                </div>

                <div className="prompt-box">
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Ví dụ: Anh khách đang gọi video với đối tác nước ngoài, điện thoại đứng hình đúng lúc hỏi báo giá. Sếp nổi nóng nhưng cuối cùng lại hỗ trợ tiền đổi máy..."
                  />
                  <div className="prompt-tools">
                    <span>{prompt.length} ký tự</span>
                    <button onClick={() => setPrompt("")}>Xóa</button>
                  </div>
                </div>

                <div className="control-grid">
                  <label>
                    <span>Chủ đề</span>
                    <select value={theme} onChange={(event) => setTheme(event.target.value)}>
                      {themes.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Công thức</span>
                    <select value={formulaId} onChange={(event) => setFormulaId(event.target.value)}>
                      {formulas.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Số phiên bản</span>
                    <select value={versions} onChange={(event) => setVersions(Number(event.target.value))}>
                      <option value={1}>1 phiên bản</option>
                      <option value={3}>3 phiên bản</option>
                      <option value={5}>5 phiên bản</option>
                    </select>
                  </label>
                </div>

                <div className="quick-prompts">
                  <span>Gợi ý nhanh</span>
                  {[
                    "Bị bạn bè coi thường vì dùng Android",
                    "Mẹ dắt con đi mua máy học online",
                    "Khách vào shop đòi gặp quản lý",
                  ].map((item) => (
                    <button key={item} onClick={() => setPrompt(item)}>{item}</button>
                  ))}
                </div>

                <div className="writer-actions">
                  <button
                    className="primary-button generate"
                    onClick={() => callAI("create")}
                    disabled={!prompt.trim()}
                  >
                    ✦ Viết bằng Gemini
                  </button>
                  <button className="ghost-button" onClick={() => callAI("hooks")} disabled={!prompt.trim()}>
                    Tạo 20 Hook
                  </button>
                  <span className={status.includes("lỗi") || status.includes("Lỗi") ? "status error" : "status"}>
                    {status}
                  </span>
                </div>
              </section>

              <section className="result-panel">
                <div className="result-head">
                  <div>
                    <span className="eyebrow">KẾT QUẢ</span>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Tiêu đề kịch bản"
                    />
                  </div>
                  <div className="result-actions">
                    <button onClick={() => copyText(result)}>Sao chép</button>
                    <button onClick={saveStory} className="save-button">Lưu kịch bản</button>
                  </div>
                </div>
                <textarea
                  className="script-editor"
                  value={result}
                  onChange={(event) => setResult(event.target.value)}
                  placeholder="Kịch bản do Gemini tạo sẽ xuất hiện tại đây..."
                />
                <div className="editor-footer">
                  <span>{result.trim() ? result.trim().split(/\s+/).length : 0} từ</span>
                  <span>Tự động lưu trong trình duyệt</span>
                </div>
              </section>
            </div>
          )}

          {page === "review" && (
            <div className="review-layout">
              <section className="panel review-input">
                <div className="panel-head">
                  <div>
                    <span className="eyebrow">AI ANALYST</span>
                    <h3>Dán kịch bản cần kiểm tra</h3>
                  </div>
                </div>
                <textarea
                  value={reviewInput}
                  onChange={(event) => setReviewInput(event.target.value)}
                  placeholder="Dán kịch bản TikTok vào đây..."
                />
                <div className="review-buttons">
                  <button className="primary-button" onClick={() => callAI("review", reviewInput)}>
                    ◎ Chấm điểm
                  </button>
                  <button className="ghost-button" onClick={() => callAI("rewrite", reviewInput)}>
                    ✦ Viết lại hoàn chỉnh
                  </button>
                </div>
              </section>

              <section className="review-result">
                <div className="score-grid">
                  {[
                    ["Hook", reviewScores?.hook ?? 0],
                    ["Logic", reviewScores?.logic ?? 0],
                    ["Twist", reviewScores?.twist ?? 0],
                    ["Cảm xúc", reviewScores?.emotion ?? 0],
                    ["Giữ chân", reviewScores?.retention ?? 0],
                  ].map(([label, value]) => (
                    <div className="score-card" key={String(label)}>
                      <span>{label}</span>
                      <strong>{value ? `${value}/10` : "—"}</strong>
                      <div className="score-track"><span style={{ width: `${Number(value) * 10}%` }} /></div>
                    </div>
                  ))}
                </div>
                <div className="panel analysis-card">
                  <div className="panel-head">
                    <div>
                      <span className="eyebrow">KẾT QUẢ PHÂN TÍCH</span>
                      <h3>Đề xuất của Gemini</h3>
                    </div>
                    <button className="text-button" onClick={() => copyText(reviewResult)}>Sao chép</button>
                  </div>
                  <textarea
                    value={reviewResult}
                    onChange={(event) => setReviewResult(event.target.value)}
                    placeholder="Kết quả phân tích sẽ xuất hiện tại đây..."
                  />
                </div>
              </section>
            </div>
          )}

          {page === "hooks" && (
            <section>
              <div className="library-head">
                <div>
                  <span className="eyebrow">HOOK LIBRARY</span>
                  <h2>Những câu mở đầu giữ người xem lại.</h2>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setHookForm({ id: "", theme: "Công việc", text: "", used: 0 })}
                >
                  ＋ Thêm Hook
                </button>
              </div>
              <div className="library-tools">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm hook..." />
                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="all">Tất cả chủ đề</option>
                  {themes.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div className="hook-grid">
                {hooks
                  .filter((hook) =>
                    (filter === "all" || hook.theme === filter) &&
                    `${hook.theme} ${hook.text}`.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((hook) => (
                    <article className="hook-card" key={hook.id}>
                      <div className="card-top">
                        <span className="tag">{hook.theme}</span>
                        <button
                          className={hook.favorite ? "favorite active" : "favorite"}
                          onClick={() =>
                            setHooks((items) =>
                              items.map((item) => item.id === hook.id ? { ...item, favorite: !item.favorite } : item)
                            )
                          }
                        >
                          ★
                        </button>
                      </div>
                      <p>{hook.text}</p>
                      <div className="hook-meta">
                        <span>Đã dùng {hook.used || 0} lần</span>
                        <div>
                          <button onClick={() => copyText(hook.text)}>Sao chép</button>
                          <button onClick={() => setHookForm(hook)}>Sửa</button>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          )}

          {page === "formulas" && (
            <section>
              <div className="library-head">
                <div>
                  <span className="eyebrow">FORMULA LIBRARY</span>
                  <h2>Công thức kể chuyện đã được đóng gói.</h2>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setFormulaForm({
                    id: "",
                    name: "",
                    category: "",
                    description: "",
                    template: "",
                  })}
                >
                  ＋ Thêm Công thức
                </button>
              </div>
              <div className="formula-grid">
                {formulas.map((formula, index) => (
                  <article className="formula-card" key={formula.id}>
                    <div className="formula-number">{String(index + 1).padStart(2, "0")}</div>
                    <div className="card-top">
                      <span className="tag">{formula.category}</span>
                      <button
                        className={formula.favorite ? "favorite active" : "favorite"}
                        onClick={() =>
                          setFormulas((items) =>
                            items.map((item) => item.id === formula.id ? { ...item, favorite: !item.favorite } : item)
                          )
                        }
                      >
                        ★
                      </button>
                    </div>
                    <h3>{formula.name}</h3>
                    <p>{formula.description}</p>
                    <div className="formula-flow">{formula.template}</div>
                    <div className="formula-actions">
                      <button onClick={() => {
                        setFormulaId(formula.id);
                        setPage("writer");
                      }}>Dùng công thức</button>
                      <button onClick={() => setFormulaForm(formula)}>Chỉnh sửa</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {page === "stories" && (
            <section>
              <div className="library-head">
                <div>
                  <span className="eyebrow">SCRIPT LIBRARY</span>
                  <h2>Kho nội dung của Siêu Di Động.</h2>
                </div>
                <button className="primary-button" onClick={() => setPage("writer")}>＋ Viết kịch bản</button>
              </div>
              <div className="library-tools">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tiêu đề hoặc nội dung..." />
                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="all">Tất cả trạng thái</option>
                  <option value="draft">Chưa đăng</option>
                  <option value="posted">Đã đăng</option>
                  <option value="favorite">Yêu thích</option>
                </select>
              </div>
              <div className="story-list">
                {stories
                  .filter((story) => {
                    const matchesFilter =
                      filter === "all" ||
                      story.status === filter ||
                      (filter === "favorite" && story.favorite);
                    return matchesFilter &&
                      `${story.title} ${story.content}`.toLowerCase().includes(search.toLowerCase());
                  })
                  .map((story) => (
                    <article className="story-card" key={story.id}>
                      <div className="story-main">
                        <span className="story-icon">▤</span>
                        <div>
                          <div className="story-title-row">
                            <h3>{story.title}</h3>
                            <button
                              className={story.favorite ? "favorite active" : "favorite"}
                              onClick={() =>
                                setStories((items) =>
                                  items.map((item) => item.id === story.id ? { ...item, favorite: !item.favorite } : item)
                                )
                              }
                            >★</button>
                          </div>
                          <p>{story.content.slice(0, 180)}{story.content.length > 180 ? "..." : ""}</p>
                          <div className="story-tags">
                            <span>{story.theme}</span>
                            <span>{story.status === "posted" ? "Đã đăng" : "Chưa đăng"}</span>
                            <span>{formatDate(story.created)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="story-actions">
                        <button onClick={() => {
                          setResult(story.content);
                          setTitle(story.title);
                          setTheme(story.theme);
                          setPage("writer");
                        }}>Mở</button>
                        <button onClick={() => copyText(story.content)}>Sao chép</button>
                        <button
                          onClick={() =>
                            setStories((items) =>
                              items.map((item) =>
                                item.id === story.id
                                  ? { ...item, status: item.status === "draft" ? "posted" : "draft" }
                                  : item
                              )
                            )
                          }
                        >Đổi trạng thái</button>
                        <button
                          className="danger"
                          onClick={() => setStories((items) => items.filter((item) => item.id !== story.id))}
                        >Xóa</button>
                      </div>
                    </article>
                  ))}
                {stories.length === 0 && (
                  <div className="large-empty">
                    <span>▤</span>
                    <h3>Kho kịch bản đang trống</h3>
                    <p>Những kịch bản bạn lưu từ AI Writer sẽ xuất hiện tại đây.</p>
                    <button className="primary-button" onClick={() => setPage("writer")}>Viết kịch bản đầu tiên</button>
                  </div>
                )}
              </div>
            </section>
          )}

          {page === "universe" && (
            <section>
              <div className="library-head">
                <div>
                  <span className="eyebrow">CONTENT UNIVERSE</span>
                  <h2>Bản đồ ý tưởng của Siêu Di Động.</h2>
                </div>
              </div>
              <div className="universe-canvas">
                <div className="universe-core">
                  <strong>SIÊU<br />DI ĐỘNG</strong>
                  <span>{stories.length} kịch bản</span>
                </div>
                {themes.map((item, index) => {
                  const angle = (index / themes.length) * Math.PI * 2 - Math.PI / 2;
                  const radius = 38;
                  const left = 50 + Math.cos(angle) * radius;
                  const top = 50 + Math.sin(angle) * radius;
                  const count = stories.filter((story) => story.theme === item).length;
                  return (
                    <button
                      key={item}
                      className="universe-node"
                      style={{ left: `${left}%`, top: `${top}%` }}
                      onClick={() => {
                        setTheme(item);
                        setPage("writer");
                      }}
                    >
                      <strong>{item}</strong>
                      <span>{count} kịch bản · {hooks.filter((hook) => hook.theme === item).length} hook</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {page === "analytics" && (
            <section>
              <div className="library-head">
                <div>
                  <span className="eyebrow">ANALYTICS</span>
                  <h2>Nhìn lại cách bạn đang xây nội dung.</h2>
                </div>
              </div>
              <div className="analytics-grid">
                <div className="panel analytics-main">
                  <div className="panel-head">
                    <div>
                      <span className="eyebrow">PHÂN BỔ CHỦ ĐỀ</span>
                      <h3>Kịch bản theo nhóm nội dung</h3>
                    </div>
                  </div>
                  <div className="chart-bars">
                    {themeCounts.map((item) => (
                      <div className="chart-column" key={item.name}>
                        <div className="chart-value">{item.count}</div>
                        <div className="chart-bar">
                          <span style={{ height: `${Math.max(8, (item.count / maxTheme) * 100)}%` }} />
                        </div>
                        <small>{item.name.replace("Học sinh – sinh viên", "Học sinh")}</small>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="panel insight-panel">
                  <span className="eyebrow">AI INSIGHT</span>
                  <h3>Gợi ý vận hành</h3>
                  <div className="insight-item">
                    <span>01</span>
                    <p>Chủ đề “Bị coi thường” phù hợp để tạo tranh luận và giữ chân mạnh.</p>
                  </div>
                  <div className="insight-item">
                    <span>02</span>
                    <p>Nên luân phiên công thức căng thẳng, hiểu lầm và gia đình để tránh lặp.</p>
                  </div>
                  <div className="insight-item">
                    <span>03</span>
                    <p>Ưu tiên hook có nhân vật, địa điểm và sự cố rõ ngay trong câu đầu.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {page === "settings" && (
            <div className="settings-grid">
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <span className="eyebrow">PROMPT ENGINE</span>
                    <h3>Phong cách Siêu Di Động</h3>
                  </div>
                </div>
                <textarea
                  className="style-editor"
                  value={style}
                  onChange={(event) => setStyle(event.target.value)}
                />
                <div className="setting-note">Mọi thay đổi được lưu tự động trong trình duyệt.</div>
              </section>
              <section className="panel">
                <div className="panel-head">
                  <div>
                    <span className="eyebrow">DỮ LIỆU</span>
                    <h3>Sao lưu và khôi phục</h3>
                  </div>
                </div>
                <div className="setting-card">
                  <strong>Xuất toàn bộ dữ liệu</strong>
                  <p>Tải Hook, Công thức, Kịch bản và Prompt Engine về máy.</p>
                  <button className="ghost-button" onClick={exportData}>Xuất file JSON</button>
                </div>
                <div className="setting-card">
                  <strong>Nhập dữ liệu</strong>
                  <p>Khôi phục dữ liệu từ file JSON đã xuất trước đó.</p>
                  <label className="upload-button">
                    Chọn file JSON
                    <input type="file" accept=".json" onChange={(event) => importData(event.target.files?.[0])} />
                  </label>
                </div>
                <div className="setting-card">
                  <strong>Giao diện</strong>
                  <p>Chuyển giữa chế độ sáng và tối.</p>
                  <button className="ghost-button" onClick={() => setDark(!dark)}>
                    {dark ? "Dùng giao diện sáng" : "Dùng giao diện tối"}
                  </button>
                </div>
              </section>
            </div>
          )}
        </section>
      </main>

      {hookForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">HOOK EDITOR</span>
                <h3>{hookForm.id ? "Chỉnh sửa Hook" : "Thêm Hook mới"}</h3>
              </div>
              <button onClick={() => setHookForm(null)}>×</button>
            </div>
            <label>
              <span>Chủ đề</span>
              <select value={hookForm.theme} onChange={(event) => setHookForm({ ...hookForm, theme: event.target.value })}>
                {themes.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span>Nội dung Hook</span>
              <textarea value={hookForm.text} onChange={(event) => setHookForm({ ...hookForm, text: event.target.value })} />
            </label>
            <div className="modal-actions">
              {hookForm.id && (
                <button className="danger-button" onClick={() => {
                  setHooks((items) => items.filter((item) => item.id !== hookForm.id));
                  setHookForm(null);
                }}>Xóa</button>
              )}
              <button className="ghost-button" onClick={() => setHookForm(null)}>Hủy</button>
              <button className="primary-button" onClick={() => {
                if (!hookForm.text.trim()) return;
                setHooks((items) =>
                  hookForm.id
                    ? items.map((item) => item.id === hookForm.id ? hookForm : item)
                    : [{ ...hookForm, id: crypto.randomUUID() }, ...items]
                );
                setHookForm(null);
              }}>Lưu Hook</button>
            </div>
          </div>
        </div>
      )}

      {formulaForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-head">
              <div>
                <span className="eyebrow">FORMULA EDITOR</span>
                <h3>{formulaForm.id ? "Chỉnh sửa Công thức" : "Thêm Công thức mới"}</h3>
              </div>
              <button onClick={() => setFormulaForm(null)}>×</button>
            </div>
            <label>
              <span>Tên công thức</span>
              <input value={formulaForm.name} onChange={(event) => setFormulaForm({ ...formulaForm, name: event.target.value })} />
            </label>
            <label>
              <span>Nhóm</span>
              <input value={formulaForm.category} onChange={(event) => setFormulaForm({ ...formulaForm, category: event.target.value })} />
            </label>
            <label>
              <span>Mô tả</span>
              <textarea className="short-textarea" value={formulaForm.description} onChange={(event) => setFormulaForm({ ...formulaForm, description: event.target.value })} />
            </label>
            <label>
              <span>Cấu trúc</span>
              <textarea className="short-textarea" value={formulaForm.template} onChange={(event) => setFormulaForm({ ...formulaForm, template: event.target.value })} />
            </label>
            <div className="modal-actions">
              {formulaForm.id && (
                <button className="danger-button" onClick={() => {
                  if (formulas.length > 1) setFormulas((items) => items.filter((item) => item.id !== formulaForm.id));
                  setFormulaForm(null);
                }}>Xóa</button>
              )}
              <button className="ghost-button" onClick={() => setFormulaForm(null)}>Hủy</button>
              <button className="primary-button" onClick={() => {
                if (!formulaForm.name.trim()) return;
                setFormulas((items) =>
                  formulaForm.id
                    ? items.map((item) => item.id === formulaForm.id ? formulaForm : item)
                    : [{ ...formulaForm, id: crypto.randomUUID() }, ...items]
                );
                setFormulaForm(null);
              }}>Lưu Công thức</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
