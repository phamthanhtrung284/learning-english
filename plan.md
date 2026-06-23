# Backend Restructuring Plan — Module-based

## 1. Hiện trạng
- `backend/` — Express.js `.js` (ESM), cấu trúc flat theo layer:
  ```
  src/routes/  src/controllers/  src/services/  src/models/  src/middleware/
  ```
- Mỗi route/controller/service riêng rẽ, không gom theo module.

## 2. Mục tiêu
- Tạo `backend-web/` song song với `backend/` cũ
- Restructure theo **module** — mỗi module tự quản lý route + controller + service của nó
- JS → TypeScript, import alias
- Không thay đổi logic, chỉ tổ chức lại code

## 3. Module tree

Mỗi module là một thư mục trong `src/modules/`, tự chứa route + controller + service(s) của nó.
Các thành phần dùng chung để ở `src/common/`.

```
backend-web/
│
├── src/
│   ├── index.ts                         # dotenv → connectDB → listen
│   ├── app.ts                           # Express: CORS, parser, static, mount routes, error handler
│   │
│   ├── config/
│   │   ├── db.ts                        # mongoose.connect
│   │   └── env.ts                       # Typed env (zod)
│   │
│   ├── models/                          # Mongoose schemas (dùng chung)
│   │   ├── User.ts
│   │   ├── LibrarySeries.ts
│   │   ├── LibraryChapter.ts
│   │   ├── SpeakingSession.ts
│   │   ├── GrammarProgress.ts
│   │   ├── VocabularyProgress.ts
│   │   ├── StoryProgress.ts
│   │   ├── UserWord.ts
│   │   ├── Paragraph.ts
│   │   └── Sentence.ts
│   │
│   ├── common/                          # Dùng chung toàn bộ modules
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts        #   protect, adminOnly
│   │   │   ├── error.middleware.ts       #   notFound, errorHandler
│   │   │   ├── rateLimit.middleware.ts   #   Rate limiter instances
│   │   │   └── dailyLimit.middleware.ts  #   20 requests/day
│   │   ├── utils/
│   │   │   ├── asyncHandler.ts           #   Wrap async controller
│   │   │   ├── httpResponse.ts           #   Standard { success, data, error }
│   │   │   └── multerStorage.ts          #   Shared multer configs (PDF, avatar, cover)
│   │   └── types/
│   │       ├── index.ts                  #   Re-export
│   │       ├── user.types.ts
│   │       ├── api.types.ts
│   │       └── express.d.ts              #   Extend Express.Request (user)
│   │
│   └── modules/                          # Mỗi module = 1 tính năng
│       │
│       ├── auth/                         # POST /register, /login, GET /me, PATCH /profile
│       │   ├── auth.controller.ts
│       │   ├── auth.routes.ts
│       │   ├── auth.service.ts           #   register, login, getMe, updateProfile
│       │   ├── auth.validator.ts         #   Request validation
│       │   └── index.ts                  #   Export { routes, prefix: "/api/auth" }
│       │
│       ├── library/                      # /api/library — series, chapters, PDF import
│       │   ├── library.controller.ts
│       │   ├── library.routes.ts
│       │   ├── library.service.ts        #   CRUD series + chapters
│       │   ├── pdfParser.service.ts      #   PDF → paragraphs
│       │   └── index.ts
│       │
│       ├── vocabulary/                   # /api/vocabulary — SRS words
│       │   ├── vocabulary.controller.ts
│       │   ├── vocabulary.routes.ts
│       │   ├── vocabulary.service.ts
│       │   └── index.ts
│       │
│       ├── speaking/                     # /api/speaking — AI conversation
│       │   ├── speaking.controller.ts
│       │   ├── speaking.routes.ts
│       │   ├── speaking.service.ts       #   AI-powered conversation loop
│       │   └── index.ts
│       │
│       ├── ai/                           # /api/ai + /api/sentences — Groq-powered
│       │   ├── ai.controller.ts
│       │   ├── ai.routes.ts
│       │   ├── services/
│       │   │   ├── groqClient.ts         #   Groq SDK wrapper
│       │   │   ├── wordLookup.ts         #   Dictionary lookup via Groq
│       │   │   ├── sentenceGenerator.ts  #   Sentence generation
│       │   │   ├── lessonGenerator.ts    #   AI course/lesson gen
│       │   │   ├── passageGenerator.ts   #   Passage gen
│       │   │   └── aiContent.ts          #   General AI content
│       │   └── index.ts
│       │
│       ├── sentence/                     # /api/sentences — translate check
│       │   ├── sentence.controller.ts
│       │   ├── sentence.routes.ts
│       │   ├── sentence.service.ts
│       │   └── index.ts
│       │
│       ├── story/                        # /api/stories
│       │   ├── story.controller.ts
│       │   ├── story.routes.ts
│       │   ├── story.service.ts
│       │   └── index.ts
│       │
│       ├── paragraph/                    # /api/paragraphs
│       │   ├── paragraph.controller.ts
│       │   ├── paragraph.routes.ts
│       │   ├── paragraph.service.ts
│       │   └── index.ts
│       │
│       ├── course/                       # /api/courses
│       │   ├── course.controller.ts
│       │   ├── course.routes.ts
│       │   ├── course.service.ts
│       │   └── index.ts
│       │
│       ├── exercise/                     # /api/exercises
│       │   ├── exercise.controller.ts
│       │   ├── exercise.routes.ts
│       │   ├── exercise.service.ts
│       │   └── index.ts
│       │
│       ├── progress/                     # /api/progress — grammar + vocab progress
│       │   ├── progress.controller.ts
│       │   ├── progress.routes.ts
│       │   ├── progress.service.ts
│       │   └── index.ts
│       │
│       ├── adaptive/                     # /api/adaptive — adaptive learning plan
│       │   ├── adaptive.controller.ts
│       │   ├── adaptive.routes.ts
│       │   ├── adaptive.service.ts
│       │   └── index.ts
│       │
│       └── cloudinary/                   # Cloudinary upload/delete helper
│           ├── cloudinary.controller.ts
│           ├── cloudinary.routes.ts
│           ├── cloudinary.service.ts
│           └── index.ts
│
├── tests/
│   ├── setup.ts
│   └── auth.test.ts
│
├── uploads/                              # covers/, avatars/, library-pdfs/
│
├── data/
│   └── c1-course.ts
│
├── .env / .env.example
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 4. Cách app.ts mount routes

Mỗi module export `{ routes, prefix }`. `app.ts` chỉ cần loop:

```ts
import { authModule } from "./modules/auth/index.js";
// ...
const modules = [authModule, libraryModule, vocabularyModule, /* ... */];
for (const m of modules) {
  app.use(m.prefix, m.routes);
}
```

## 5. File mapping

| Old (backend/src/) | New (backend-web/) |
|---|---|
| `server.js` | `src/index.ts` |
| `app.js` | `src/app.ts` |
| `config/db.js` | `src/config/db.ts` |
| `models/*.js` | `src/models/*.ts` |
| `middleware/authMiddleware.js` | `src/common/middleware/auth.middleware.ts` |
| `middleware/errorMiddleware.js` | `src/common/middleware/error.middleware.ts` |
| `middleware/dailyLimitMiddleware.js` | `src/common/middleware/dailyLimit.middleware.ts` |
| `routes/*.js` + `controllers/*.js` + `services/*.js` | `src/modules/<name>/*.ts` |

## 6. Thứ tự thực hiện

| Step | Nội dung |
|---|---|
| 1 | Init project: `package.json`, `tsconfig.json`, `nodemon.json`, `.env` |
| 2 | `src/config/db.ts` + `src/config/env.ts` |
| 3 | `src/models/*.ts` — 10 Mongoose schemas |
| 4 | `src/common/types/` — shared interfaces |
| 5 | `src/common/middleware/*.middleware.ts` — auth, error, rateLimit, dailyLimit |
| 6 | `src/common/utils/` — asyncHandler, httpResponse |
| 7 | Module **auth** — register, login, me, profile, avatar, leaderboard, admin |
| 8 | Module **library** — series, chapters, PDF import, covers |
| 9 | Module **vocabulary** — SRS word CRUD |
| 10 | Module **speaking** — AI conversation |
| 11 | Module **ai** — Groq client + word lookup + lesson gen |
| 12 | Module **sentence** — translation check |
| 13 | Module **story**, **paragraph**, **course**, **exercise**, **progress**, **adaptive** |
| 14 | Module **cloudinary** — upload/delete helper |
| 15 | `src/app.ts` — Express setup + mount modules |
| 16 | `src/index.ts` — Entry point |
| 17 | Tests migration |
| 18 | `npm run dev` verify |

## 7. Nguyên tắc
- **Giữ nguyên logic** — không thay đổi hành vi, chỉ tổ chức code
- **Giữ nguyên API format** — frontend không bị ảnh hưởng
- **Giữ nguyên .env keys** — copy từ backend cũ
- **Backwards compatible** — `backend/` cũ vẫn chạy song song
