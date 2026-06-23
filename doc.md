# frontend-web — Phân tích chi tiết

> Dự án React + Vite + Tailwind v4 cũ, sẽ migrate sang Next.js 16 (`frontend/`).

---

## 1. Tổng quan

| Property | Value |
|----------|-------|
| Framework | React 19 + Vite 8 |
| Routing | react-router-dom v7 (BrowserRouter) |
| CSS | Tailwind v4 + CSS custom properties |
| API | axios (interceptor JWT) |
| Animation | framer-motion |
| Build | Vite + @vitejs/plugin-react |
| Backend API | Mặc định `http://localhost:5000/api` |

### Layout màn hình chính

```
┌─────────────────────────────────────┐
│         Sword Navbar (desktop)       │  ← 72px, sticky, ẩn khi zen mode
├─────────────────────────────────────┤
│                                     │
│           Main Content              │  ← Routes
│   (max-w-6xl, px-4, py-6)          │
│                                     │
├─────────────────────────────────────┤
│      Mobile Bottom Dock (md: ẩn)    │  ← 5 nav buttons + admin
└─────────────────────────────────────┘
```

---

## 2. Cấu trúc thư mục

```
frontend-web/
├── .env.example              # Mẫu env: VITE_API_URL
├── eslint.config.js          # ESLint flat config v10
├── index.html                # Entry HTML
├── package.json              # Dependencies
├── vite.config.js            # Vite + React + Tailwind plugin
├── public/
│   ├── favicon.svg
│   ├── icons.svg             # SVG sprite (Bluesky, Discord, GitHub, X)
│   └── sword.png             # Thanh kiếm — navbar decoration
└── src/
    ├── main.jsx              # Entry point React
    ├── App.jsx               # Root component: auth, router, shell
    ├── App.css               # Legacy Vite template styles (không dùng chính)
    ├── index.css             # Global styles: Tailwind + Berserk theme (1070 dòng)
    ├── assets/
    │   ├── hero.png          # Ảnh hero LearningHub
    │   ├── react.svg
    │   └── vite.svg
    ├── cache/
    │   └── wordLookupCache.js    # localStorage cache cho tra từ
    ├── components/
    │   ├── ExercisePanel.jsx
    │   ├── Icons.jsx             # SVG icons: Home, Sparkles, Book, Notebook, Settings, Logout, Sun, Moon, Translate, Mic
    │   ├── InteractiveWord.jsx   # Interactive word with tooltip (2 modes: hover + LN click)
    │   ├── LightNovelLibrary.jsx # LN reader: series grid + chapter view + zen mode
    │   ├── LnChapterView.jsx    # Render chapter paragraph → sentences → InteractiveWord
    │   ├── LnCursorTooltipProvider.jsx # Context provider + side panel cho LN word lookup
    │   ├── SentenceReaderWeb.jsx # Hiển thị kết quả phân tích câu
    │   ├── StoryReader.jsx      # Legacy story reader
    │   ├── ThemeSwitcher.jsx    # Light/Dark toggle (framer-motion)
    │   ├── WordTooltip.jsx      # Tooltip từ: meaning, IPA, definition, speak, save
    │   └── ln/
    │       └── VocabularyHeatmap.jsx # Heatmap activity (12 tuần)
    ├── data/
    │   ├── lnCommonGloss.js     # ~150 từ thông dụng: meaning (VI), IPA, POS, explanation, synonyms, collocations
    │   └── chapters/
    │       ├── index.js             # WEB_LIGHT_NOVEL_SERIES = []
    │       ├── academyVol1Ch1.js    # "Offline Mode at the Academy" — 25 paragraph, ~80 glossary
    │       ├── aliceVol1Ch1.js      # Alice in Wonderland Ch.1 — 18 paragraph, ~55 glossary
    │       └── ozVol1Ch1.js         # Wizard of Oz Ch.1 — 20 paragraph, ~35 glossary
    ├── pages/
    │   ├── AdminLibrary.jsx       # Admin: Library/Chapter editor/User management
    │   ├── AIDashboard.jsx        # AI Dashboard: weak vocab, recommended chapters
    │   ├── AIGeneratedLesson.jsx  # Generate AI lesson + StoryReader
    │   ├── CoursePage.jsx         # Course C1: chapters, grammar, vocabulary, exercises
    │   ├── EditProfile.jsx        # Edit username, email, password, avatar
    │   ├── Leaderboard.jsx        # XP Leaderboard top 20
    │   ├── LearningHub.jsx        # Home page: hero + CTA
    │   ├── LoginPage.jsx          # Login/Register form
    │   ├── SpeakingPractice.jsx   # "Talk with Alex" — AI speaking practice
    │   ├── StoryPage.jsx          # Legacy story reader (generate + display)
    │   ├── TranslationExercise.jsx # VI→EN translation exercise
    │   └── VocabularyNotebook.jsx  # Vocabulary list: search, filter, pagination
    ├── services/
    │   └── api.js                 # axios instance: JWT interceptor, 429 handling
    └── utils/
        ├── lnTooltipClamp.js      # Tooltip positioning (clamp to viewport)
        ├── segmentLnParagraph.js  # Regex segmentation: word/space/punct + glossary lookup
        ├── speak.js               # TTS: getBestVoice() + speak()
        ├── splitParagraphToSentences.js # Split by /[.!?]\s+/
        ├── themeStorage.js        # localStorage read/write theme
        └── vocabularyExport.js    # Export CSV, Anki TSV, Quizlet text
```

---

## 3. Chi tiết từng file

### 3.1 Root config files

#### `index.html`
- Entry point Vite: `<div id="root">` + `<script src="/src/main.jsx">`
- Title: "English Studio · Learning OS"

#### `vite.config.js`
- Plugins: `@vitejs/plugin-react`, `@tailwindcss/vite`
- Không có alias, proxy, hay custom config khác

#### `package.json`
- `dependencies`: react 19, react-dom 19, react-router-dom 7, axios 1, framer-motion 11, @tailwindcss/vite 4
- `devDependencies`: eslint 10, vite 8, tailwindcss 4, postcss, autoprefixer

#### `eslint.config.js`
- Flat config: `@eslint/js` recommended + `react-hooks` + `react-refresh`
- Ignores: `dist`
- JSX + browser globals

#### `.env.example`
```
VITE_API_URL=https://your-backend.railway.app/api
```

---

### 3.2 `src/main.jsx`
- StrictMode + createRoot
- Import `./index.css` (global styles)
- Render `<App />`

---

### 3.3 `src/App.jsx` — Root component (450 dòng)

**Luồng:**
1. `App()` kiểm tra `localStorage.getItem("token")` → authed?
2. Nếu chưa auth → `<LoginPage />`
3. Nếu đã auth → ` <BrowserRouter>` +`<AppShell>`

**AppShell** chứa toàn bộ layout:
- `TopNav` (Sword Navbar) — desktop-only, sticky
- `main` content với `<Routes>`
- Mobile bottom dock (ẩn khi zen mode)
- Quản lý state: `sentence`, `result`, `lnChapter`, `lnZenMode`, `apiError`
- Gọi `refreshProfile()` khi mount và khi route thay đổi

**Routes:**
| Path | Component | Ghi chú |
|------|-----------|---------|
| `/` | LearningHub | Home |
| `/analyze` | Inline analyzer UI | Sentence input + InteractiveWord result |
| `/read` | LightNovelLibrary | LN reader |
| `/notebook` | VocabularyNotebook | Tra cứu từ vựng |
| `/translate` | TranslationExercise | Dịch VI→EN |
| `/speaking` | SpeakingPractice | Luyện nói AI |
| `/profile` | EditProfile | Chỉnh sửa hồ sơ |
| `/admin` | AdminLibrary | Chỉ admin mới xem được |
| `*` | Navigate to `/` | Catch-all |

**TopNav** (Sword Navbar):
- Ảnh `sword.png` làm decoration
- Nav links: Home, Analyze, Translate, Speaking, Read
- Admin button (chỉ hiện nếu `profile.isAdmin`)
- User menu dropdown: avatar/initial, Edit profile, Vocabulary, Sign out
- Click outside để đóng dropdown

**analyzeSentence()**: `POST /sentences/analyze` → set `result` → render `SentenceReaderWeb`

**DailyLimitToast**: Lắng nghe event `daily-limit-reached` từ axios interceptor → hiện toast `429 DAILY_LIMIT_REACHED`

---

### 3.4 `src/index.css` — Global styles (1070 dòng)

**Theme "Berserk Dark Manga":**
- `:root` (light): bg #efe6d7, primary #c0392b, text #1c1917
- `.dark` (dark): bg #0c0a09, primary #e74c3c, text #e7e5e4
- CSS variables: `--bg`, `--bg-card`, `--primary`, `--text`, `--text-soft`, `--border`, `--accent`, `--surface-glass`

**Key custom classes:**
- `.font-literata` / `.font-display` / `.font-ln-reading` / `.font-ln-studio`
- `.app-atmosphere` + `.stars-layer` + `.sparkles` — animated background
- `.sword-nav`, `.sword-nav-link`, `.sword-nav-admin`, `.sword-nav-underline`
- `.mobile-nav-dock` — fixed bottom
- `.glass-sidebar`, `.surface-panel`, `.glass-frame`
- `.heatmap-l0` → `.heatmap-l4` — heatmap cell colors
- `.textarea-analyzer`, `.input-magic`, `.btn-primary-glow`, `.nav-pill`
- `.auth-scene` — login/register background
- Keyframes: `fade-rise`, `glow-pulse`, `tooltip-in`, `panel-slide-up`, `panel-slide-in`, `badge-float`

**Custom dark variant**: `@custom-variant dark (&:where(.dark, .dark *));`

---

### 3.5 `src/cache/wordLookupCache.js`

localStorage-based cache cho tra từ:
- Key: `englishStudio.wordLookup.v1`
- `readWordLookupCache(lemma)` — get entry
- `writeWordLookupCache(lemma, entry)` — set entry
- `deleteWordLookupCache(lemma)` — delete entry
- Dùng trong `InteractiveWord.jsx` và `LnCursorTooltipProvider.jsx`

---

### 3.6 Components

#### `Icons.jsx` (196 dòng)
10 SVG icon components: `IconHome`, `IconSparkles`, `IconBook`, `IconNotebook`, `IconSettings`, `IconLogout`, `IconSun`, `IconMoon`, `IconTranslate`, `IconMic`
- Mỗi icon: viewBox 24, 1em, fill none
- Dùng `baseProps` helper để tránh lặp

#### `InteractiveWord.jsx` (274 dòng)
**Memo-wrapped** component, optional `React.memo`.

**2 modes:**
1. **`InteractiveWordWordAnchored`** (hover) — tooltip xuất hiện khi hover, dùng `WordTooltip`. Gọi API `/dictionary/lookup` nếu không có trong glossary. Cache qua `wordLookupCache.js`.
2. **`LnInteractiveWordSpan`** (click) — click vào từ → mở side panel qua `LnCursorTooltipProvider`. Highlight từ đang active.

Props: `wordData`, `contextParagraph`, `tooltipAnchor`, `grammarUnderlineClass`, `grammarTitle`.

#### `WordTooltip.jsx` (188 dòng)
Popup tooltip chi tiết cho từ:
- Word + meaning (VI) + IPA + definition (EN)
- Loading skeleton
- Error state + retry button
- Save word (`POST /vocabulary/save`)
- Speak button (`speak.js`)
- Caret/arrow positioning

#### `LightNovelLibrary.jsx` (400 dòng)
**Phần chính của LN reader:**
1. **Series grid** (Netflix-style) — poster ảnh, overlay khi hover
2. **Chapter view** — zen mode toggle, scroll progress bar, export vocabulary (CSV/Anki/Quizlet)
3. Fetch series từ API `/library/series`, fallback về `WEB_LIGHT_NOVEL_SERIES`
4. Hiển thị `LnChapterView` khi chọn chapter

#### `LnChapterView.jsx` (222 dòng)
Render chapter với:
- Source/license header
- Title, author, blurb
- Paragraph → `splitParagraphToSentences()` → mỗi câu là `<p>` với `InteractiveWord`
- Double-click → grammar analysis (`POST /sentences/grammar`) → colored underlines (sky/rose/amber/emerald/violet/slate)
- Pagination 50 paragraphs/page
- Zen mode support

#### `LnCursorTooltipProvider.jsx` (394 dòng)
**Context provider** cho LN word tooltip:
- `ActionsContext` + `ActiveAnchorContext`
- `useLnCursorTooltipActions()` + `useLnCursorActiveAnchorId()`
- Click word → API lookup → cache → side panel
- Side panel: meaning, IPA, POS, explanation, save button
- Click outside → close panel
- Responsive: mobile bottom sheet, desktop fixed right panel

#### `SentenceReaderWeb.jsx` (43 dòng)
Hiển thị kết quả `analyzeSentence()`:
- POS tags
- Tokens as `InteractiveWord`
- Translated sentence

#### `StoryReader.jsx` (73 dòng)
Legacy: hiển thị lesson từ API với `InteractiveWord` cho từng từ.

#### `ExercisePanel.jsx` (154 dòng)
Fetch exercises từ `/exercises/c1/chapter/1` → render question + options buttons.


#### `ln/VocabularyHeatmap.jsx` (113 dòng)
Heatmap 12 tuần hoạt động vocabulary:
- Mỗi cell = 1 ngày, màu theo level 0-4
- Legend "less → more"

---

### 3.7 Pages

#### `LoginPage.jsx` (185 dòng)
- Toggle Login/Register
- Fields: username (register only), email, password
- API: `POST /auth/login` hoặc `POST /auth/register`
- Lưu token + user vào localStorage
- Layout: desktop 2-column (brand panel + form), mobile 1-column

#### `LearningHub.jsx` (89 dòng)
Home page:
- Dark atmospheric `app-atmosphere`
- Hero image (`hero.png`) với blend modes
- Headline: "LEARN ENGLISH NATURALLY THROUGH READING"
- CTA: "Start Reading Now" → `/read`, "Try Sentence Analyzer" → `/analyze`

#### `AdminLibrary.jsx` (698 dòng)
Admin panel với 3 tabs:
1. **Library**: Upload PDF, extract paragraphs, series cover, list/edit/delete chapters
2. **Chapter Editor**: Merge/delete/split blocks, raw text mode, pagination
3. **User Management**: Search users, premium/admin toggle, pagination

#### `EditProfile.jsx` (236 dòng)
- Username, email inputs
- Password change (current, new, confirm)
- Avatar upload (file input + preview)
- Loading/error/success states
- Gọi API `/auth/update`

#### `VocabularyNotebook.jsx` (321 dòng)
- Search + filter (All/Noun/Verb/Adj)
- Table: word, IPA, meaning, type, audio, delete
- Pagination with ellipsis
- Skeleton loading
- Empty state
- Word count summary

#### `TranslationExercise.jsx` (536 dòng)
VI→EN translation:
- Level selector (Beginner/Intermediate/Advanced)
- Content type (Diary/Essay/Article/Story)
- Passage + progress dots
- Input translation → submit → AI feedback
- Feedback: score circle, suggestion, highlighted translation, grammar, reference, comment
- Dictionary panel: word/phrase/idiom/collocation + save

#### `SpeakingPractice.jsx` (459 dòng)
"Talk with Alex" AI speaking:
- Topic selector (Daily Life/Work)
- Resume saved sessions
- Chat UI + voice input (Web Speech API)
- AI feedback: score, correction, suggestions, improvements
- Right panel: suggestions + tips
- Toggle text/voice input

#### `AIDashboard.jsx` (167 dòng)
- Weak vocabulary list
- Recommended chapters

#### `AIGeneratedLesson.jsx` (101 dòng)
- Generate button → `POST /ai/generate-lesson` → `StoryReader`

#### `CoursePage.jsx` (226 dòng)
- Course C1: chapters list, grammar focus, vocabulary focus, `ExercisePanel`

#### `Leaderboard.jsx` (157 dòng)
- Top 3 podium (gold highlight)
- Ranked list 4-20
- Medals, XP, level, streak

#### `StoryPage.jsx` (314 dòng)
Legacy: topic input → generate → paragraphs with `InteractiveWord` + translations

---

### 3.8 Services

#### `api.js` (32 dòng)
```js
const api = axios.create({ baseURL: VITE_API_URL || 'http://localhost:5000/api' });
// Request interceptor: attach JWT Bearer token
// Response interceptor: catch 429 DAILY_LIMIT_REACHED → dispatch event
```

---

### 3.9 Data

#### `lnCommonGloss.js` (1320 dòng)
~150 common English words with Vietnamese meaning, IPA, POS, explanation, synonyms, collocations, native_nuance.

**Các từ bao gồm:** articles (a, an, the), prepositions (in, on, at, to, for, with, by, from, of, about, into, through, during, before, after, between, under, over, without), conjunctions (and, but, or, because, if, when, while, although, since, unless, until, so, as, than), pronouns (I, you, he, she, it, we, they, me, him, her, us, them, my, your, his, who, what, this, that, these, those, some, any, all, each, both, no, every, nothing, something), verbs (be, have, do, say, get, make, go, know, take, see, come, think, look, want, give, use, find, tell, ask, work, seem, feel, try, leave, call, keep, let, begin, show, hear, play, run, move, live, believe, bring, happen, must, may, need, change, help), adjectives (good, new, first, last, long, great, little, own, other, old, right, big, high, different, small, important, large, full), adverbs (here, there, now, then, just, also, very, too, well, still, ever, always, never, often, again, soon, already, even, only, really), more (many, much, such, more, most, than, up, down, out, off, away, back, like, as, how, why)

#### `chapters/index.js`
```js
export const WEB_LIGHT_NOVEL_SERIES = [];  // fallback empty
```

#### `chapters/academyVol1Ch1.js` (785 dòng)
"Offline Mode at the Academy" — original LN:
- 25 paragraphs, EN+VI song ngữ
- ~80 glossary entries (spawned, debuff, reputation, alliances, empathy, etc.)

#### `chapters/aliceVol1Ch1.js` (224 dòng)
Alice in Wonderland Ch.1 "Down the Rabbit-Hole":
- 18 paragraphs, ~55 glossary entries
- Source: Project Gutenberg

#### `chapters/ozVol1Ch1.js` (190 dòng)
Wizard of Oz Ch.1 "The Cyclone":
- 20 paragraphs, ~35 glossary entries
- Source: Project Gutenberg

---

### 3.10 Utils

#### `segmentLnParagraph.js` (39 dòng)
```js
segmentLnParagraph(en, glossary, commonGloss)
// Regex: /(\b[\w']+\b)|(\s+)|([^\w\s]+)/g
// Trả về segments: [{ type: "word"|"plain", wordData?|text? }]
// Tra cứu glossary → wordData nếu tìm thấy
```

#### `splitParagraphToSentences.js` (9 dòng)
```js
splitParagraphToSentences(text)
// Split by /[.!?]\s+/
```

#### `speak.js` (64 dòng)
- `getBestVoice()`: Samantha > Karen > Moira > Zira > Jenny > Google US English
- `speak(text, rate=0.88)`: speechSynthesis.speak với pitch 1.05

#### `lnTooltipClamp.js` (55 dòng)
- `estimateTooltipSize()`: ước lượng kích thước tooltip dựa trên viewport
- `clampCursorTooltip(clientX, clientY)`: clamp tooltip trong viewport, ưu tiên top/bottom

#### `themeStorage.js` (18 dòng)
- `readStoredTheme()`: đọc từ localStorage key `es-ui-theme`
- `writeStoredTheme(id)`: ghi

#### `vocabularyExport.js` (51 dòng)
- `exportVocabularyCsv(words)`: download CSV (word, meaning_vi, definition_en, ipa, pos)
- `exportVocabularyAnkiTsv(words)`: download TSV cho Anki
- `buildQuizletImportText(words)`: tab-separated text cho Quizlet

---

## 4. API Endpoints sử dụng

| Method | Endpoint | File | Mục đích |
|--------|----------|------|----------|
| POST | `/auth/login` | LoginPage.jsx | Đăng nhập |
| POST | `/auth/register` | LoginPage.jsx | Đăng ký |
| GET | `/auth/me` | App.jsx | Lấy profile |
| POST | `/auth/update` | EditProfile.jsx | Cập nhật profile |
| POST | `/sentences/analyze` | App.jsx | Phân tích câu |
| POST | `/sentences/grammar` | LnChapterView.jsx | Phân tích grammar |
| GET | `/dictionary/lookup/:word` | InteractiveWord.jsx | Tra từ điển |
| GET | `/library/series` | LightNovelLibrary.jsx | Danh sách series LN |
| POST | `/library/upload` | AdminLibrary.jsx | Upload PDF |
| POST | `/library/series` | AdminLibrary.jsx | Tạo series |
| PUT | `/library/series/:id` | AdminLibrary.jsx | Sửa series |
| DELETE | `/library/series/:id` | AdminLibrary.jsx | Xóa series |
| POST | `/library/chapters` | AdminLibrary.jsx | Tạo chapter |
| PUT | `/library/chapters/:id` | AdminLibrary.jsx | Sửa chapter |
| DELETE | `/library/chapters/:id` | AdminLibrary.jsx | Xóa chapter |
| POST | `/library/chapters/:id/blocks` | AdminLibrary.jsx | Merge/split blocks |
| GET | `/vocabulary` | VocabularyNotebook.jsx | Danh sách từ vựng |
| POST | `/vocabulary/save` | WordTooltip.jsx | Lưu từ vựng |
| DELETE | `/vocabulary/:id` | VocabularyNotebook.jsx | Xóa từ vựng |
| GET | `/exercises/c1/chapter/:id` | ExercisePanel.jsx | Bài tập |
| GET | `/admin/users` | AdminLibrary.jsx | Danh sách users |
| PUT | `/admin/users/:id` | AdminLibrary.jsx | Sửa user |
| POST | `/ai/generate-lesson` | AIGeneratedLesson.jsx | Generate AI lesson |
| POST | `/ai/translate` | TranslationExercise.jsx | AI translation feedback |
| POST | `/ai/speaking` | SpeakingPractice.jsx | AI speaking feedback |
| POST | `/ai/speaking/session` | SpeakingPractice.jsx | Tạo session speaking |
| GET | `/ai/weak-vocab` | AIDashboard.jsx | Từ vựng yếu |

---

## 5. Data flow chính

### 5.1 Auth flow
```
LoginPage → POST /auth/login → token + user → localStorage
  → App() đọc localStorage → authed = true → render AppShell
  → AppShell mount → GET /auth/me → refreshProfile()
  → Logout → xóa localStorage → authed = false → LoginPage
```

### 5.2 Sentence analysis flow
```
User input sentence → analyzeSentence()
  → POST /sentences/analyze { sentence }
  → response { tokens, posTags, translation }
  → setResult → render SentenceReaderWeb
  → mỗi token là InteractiveWord (hover → tooltip)
```

### 5.3 Light Novel reading flow
```
LightNovelLibrary mount → GET /library/series
  → hiển thị series grid
  → chọn chapter → setLnChapter
  → LnChapterView render:
    → splitParagraphToSentences()
    → segmentLnParagraph() (regex + glossary lookup)
    → InteractiveWord (click → LnCursorTooltipProvider side panel)
  → Double-click sentence → POST /sentences/grammar
```

### 5.4 Word lookup flow
```
InteractiveWord/LnCursorTooltipProvider trigger
  → readWordLookupCache(lemma) → cache hit?
  → Nếu không: GET /dictionary/lookup/:word
  → writeWordLookupCache(lemma, data)
  → Hiển thị WordTooltip / SidePanel
  → Save: POST /vocabulary/save
```

---

## 6. Ghi chú migration

| frontend-web (cũ) | frontend (mới - Next.js) |
|---|---|
| `src/App.jsx` + react-router | `app/(user)/layout.tsx` + `app/(user)/page.tsx` |
| `src/pages/*` | `src/{auth,admin,client}/` + route groups |
| `src/components/*` | `share/component/` |
| `src/services/api.js` | `share/services/` + proxy |
| `src/hooks/*` | `share/hook/` |
| `src/utils/*` | `share/utils/` |
| `src/data/*` | `share/data/` |
| Vite config | next.config.ts |
| Tailwind v4 (`index.css`) | Tailwind v4 (`globals.css` `@theme`) |
| CSS custom properties | `@theme` directive + CSS variables |
| ESM `.js`/`.jsx` | TypeScript `.ts`/`.tsx` |
| `axios` | fetch qua proxy (hoặc axios) |
| `framer-motion` | Có thể dùng lại hoặc thay bằng CSS animation |
