# Frontend Web — English Learning App

## Tech Stack

| Công nghệ    | Phiên bản |
| ------------ | --------- |
| Next.js      | ^16.x.x   |
| React        | ^19.x.x   |
| TypeScript   | ^5.x      |
| Tailwind CSS | ^4.x      |
| ESLint       | ^9.x      |

## Cấu trúc project

```
frontend-web/
├── app/                          # Next.js App Router (root level)
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...
├── share/                        # Reusable code
│   ├── component/                #   UI components dùng chung
│   ├── hook/                     #   Custom hooks dùng chung
│   ├── services/                 #   API services dùng chung
│   ├── types/                    #   Type definitions dùng chung
│   └── utils/                    #   Helper functions
├── src/
│   ├── auth/                     # Authentication module
│   │   ├── component/
│   │   ├── hook/
│   │   ├── services/
│   │   └── types/
│   ├── admin/                    # Admin module
│   │   ├── component/
│   │   ├── hook/
│   │   ├── services/
│   │   └── types/
│   └── client/                   # Client/user module
│       ├── component/
│       ├── hook/
│       ├── services/
│       └── types/
├── public/                       # Static assets
├── proxy.ts                      # API proxy thay thế Middleware
├── next.config.ts
├── eslint.config.ts              # ESLint v9 flat config
└── tsconfig.json
```

## Nguyên tắc kiến trúc

### Không dùng Middleware — dùng proxy.ts

Next.js Middleware chạy ở Edge Runtime, limited environment và không thể dùng các thư viện Node.js (fs, http-proxy, …). Thay vào đó, project dùng **`proxy.ts`** ở root — file xử lý reverse proxy:

- Request từ client → `app/api/...` → `proxy.ts` → Backend server
- Dùng `http-proxy` hoặc tự viết forwarding với `fetch`/`node:http`
- Cho phép xử lý authentication, rate limiting, logging ở server-side đầy đủ

```
Client → /api/* → app/api/route.ts → proxy.ts → backend:5000/api/*
```

Cấu hình trong `next.config.ts` dùng `rewrites()` nếu cần mapping path tĩnh.

### ESLint v9 Flat Config

Dùng `eslint.config.ts` thay vì `.eslintrc.*`:

```ts
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
]);
```

### Module phân tách theo domain — auth, admin, client

`src/` được tổ chức theo domain module, mỗi module tự quản lý toàn bộ logic của mình:

| Module   | Mục đích                                      |
| -------- | --------------------------------------------- |
| `auth/`  | Đăng nhập, đăng ký, quên mật khẩu, OAuth      |
| `admin/` | Quản lý người dùng, nội dung, dashboard admin  |
| `client/`| Tính năng người dùng thường (học, đọc, …)      |

Mỗi module gồm 4 thư mục con:
- **`component/`** — React components (Server & Client) của module đó
- **`hook/`** — Custom hooks riêng của module
- **`services/`** — API calls, business logic
- **`types/`** — TypeScript interfaces, types, enums

### share — code tái sử dụng chung

`share/` chứa mọi thứ dùng chung giữa các module:

| Thư mục        | Nội dung                                            |
| -------------- | --------------------------------------------------- |
| `component/`   | UI primitives (Button, Input, Modal, …)             |
| `hook/`        | Cross-cutting hooks (useAuth, useTheme, …)          |
| `services/`    | HTTP client (Axios instance), base API methods      |
| `types/`       | Global types (User, ApiResponse, …)                 |
| `utils/`       | Helper functions (formatDate, cn, …)                |

Nguyên tắc: `share/` không import từ `src/`, nhưng `src/*` có thể import từ `share/`.

### Tailwind v4

Tailwind v4 dùng cấu hình inline với `@import "tailwindcss"` trong CSS và `@theme` directive thay vì `tailwind.config.js` kiểu cũ:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --font-sans: "Inter", sans-serif;
}
```

## Scripts

| Lệnh                  | Mô tả                    |
| --------------------- | ------------------------ |
| `npm run dev`         | Start dev server         |
| `npm run build`       | Build production         |
| `npm run lint`        | ESLint kiểm tra toàn bộ  |
| `npm run typecheck`   | `tsc --noEmit`           |
| `npm run start`       | Start production server  |

## Môi trường

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Giá trị `NEXT_PUBLIC_*` sẽ được expose lên client. Các biến không có prefix `NEXT_PUBLIC_` chỉ dùng được ở server (proxy, server components, API routes).

## Quy tắc phát triển

1. **Server Components mặc định** — chỉ thêm `'use client'` khi cần interactivity (state, effect, event handler).
2. **Tuyệt đối không dùng Middleware** — mọi proxy/inspection dùng `proxy.ts`.
3. **ESLint v9 flat config** — không tạo file `.eslintrc.*`.
4. **TypeScript strict** — `strict: true` trong `tsconfig.json`.
5. **CSS với Tailwind v4** — dùng `@theme` directives, không dùng `tailwind.config.js`.
6. **API routes** trong `app/api/` hoặc qua `proxy.ts` — không gọi trực tiếp backend từ client.
7. **Module isolation** — `auth/`, `admin/`, `client/` không import chéo lẫn nhau. Logic chung đặt trong `share/`.
8. **share单向依赖** — `share/` không được import từ `src/*`, chỉ `src/*` import từ `share/`.
