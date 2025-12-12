const STORAGE_KEYS = {
  entries: "minho_diary_entries",
  theme: "minho_theme",
  fontSize: "minho_font_size",
};

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
}

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.entries);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(entries));
}

function setStatus(msg) {
  statusText.textContent = msg;
  if (!msg) return;
  window.clearTimeout(setStatus._t);
  setStatus._t = window.setTimeout(() => (statusText.textContent = ""), 1500);
}

function renderList(entries) {
  diaryList.innerHTML = "";

  emptyText.style.display = entries.length === 0 ? "block" : "none";

  for (const e of entries) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "list-item-btn";
    btn.dataset.id = e.id;

    const title = document.createElement("p");
    title.className = "item-title";
    title.textContent = e.title || "(제목 없음)";

    const meta = document.createElement("p");
    meta.className = "item-meta";
    meta.textContent = formatDate(e.createdAt);

    btn.appendChild(title);
    btn.appendChild(meta);
    li.appendChild(btn);
    diaryList.appendChild(li);
  }
}

function showEntry(entry) {
  if (!entry) return;

  previewTitle.textContent = entry.title || "(제목 없음)";
  previewMeta.textContent = `작성: ${formatDate(entry.createdAt)}`;
  previewContent.textContent = entry.content || "";
}

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark", isDark);
  themeToggleBtn.setAttribute("aria-pressed", String(isDark));
  themeToggleBtn.textContent = isDark ? "라이트모드" : "다크모드";
}

function loadTheme() {
  const theme = localStorage.getItem(STORAGE_KEYS.theme);
  return theme === "dark" ? "dark" : "light";
}

function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function applyFontSize(px) {
  document.documentElement.style.setProperty("--base-font-size", `${px}px`);
}

function loadFontSize() {
  const raw = localStorage.getItem(STORAGE_KEYS.fontSize);
  const n = Number(raw);
  return Number.isFinite(n) ? clamp(n, 14, 22) : 16;
}

function saveFontSize(px) {
  localStorage.setItem(STORAGE_KEYS.fontSize, String(px));
}

// Elements
const diaryForm = document.getElementById("diaryForm");
const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const saveBtn = document.getElementById("saveBtn");
const clearBtn = document.getElementById("clearBtn");

const diaryList = document.getElementById("diaryList");
const emptyText = document.getElementById("emptyText");

const previewTitle = document.getElementById("previewTitle");
const previewMeta = document.getElementById("previewMeta");
const previewContent = document.getElementById("previewContent");

const statusText = document.getElementById("statusText");

const themeToggleBtn = document.getElementById("themeToggleBtn");

const fontUpBtn = document.getElementById("fontUpBtn");
const fontDownBtn = document.getElementById("fontDownBtn");

const deleteAllBtn = document.getElementById("deleteAllBtn");

// State
let entries = loadEntries();
let fontSize = loadFontSize();

// Init
renderList(entries);
applyTheme(loadTheme());
applyFontSize(fontSize);

if (entries[0]) showEntry(entries[0]);

// Events
diaryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!content) {
    setStatus("내용을 입력해 주세요.");
    contentInput.focus();
    return;
  }

  const entry = {
    id: uid(),
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  entries = [entry, ...entries];
  saveEntries(entries);
  renderList(entries);
  showEntry(entry);

  titleInput.value = "";
  contentInput.value = "";
  setStatus("저장되었습니다.");
});

clearBtn.addEventListener("click", () => {
  titleInput.value = "";
  contentInput.value = "";
  setStatus("입력을 초기화했어요.");
});

diaryList.addEventListener("click", (e) => {
  const btn = e.target.closest("button.list-item-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  const entry = entries.find((x) => x.id === id);
  showEntry(entry);
});

themeToggleBtn.addEventListener("click", () => {
  const next = document.body.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  saveTheme(next);
});

fontUpBtn.addEventListener("click", () => {
  fontSize = clamp(fontSize + 1, 14, 22);
  applyFontSize(fontSize);
  saveFontSize(fontSize);
});

fontDownBtn.addEventListener("click", () => {
  fontSize = clamp(fontSize - 1, 14, 22);
  applyFontSize(fontSize);
  saveFontSize(fontSize);
});

deleteAllBtn.addEventListener("click", () => {
  if (entries.length === 0) return;

  const ok = confirm("저장된 일기를 모두 삭제할까요? (되돌릴 수 없어요)");
  if (!ok) return;

  entries = [];
  saveEntries(entries);
  renderList(entries);

  previewTitle.textContent = "목록에서 일기를 선택하세요";
  previewMeta.textContent = "";
  previewContent.textContent = "";
  setStatus("전체 삭제했습니다.");
});