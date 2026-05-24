# Kế hoạch tạo dự án Next.js — `frontend`

## Vị trí

```
V:\english-learning-app\
├── backend\                  # backend cũ — giữ nguyên
├── frontend-web\             # frontend cũ — giữ nguyên
├── frontend\                 # NEXT.JS 16 MỚI — cùng cấp với backend, frontend-web
├── mobile-app\
└── ...
```

## Các bước thực hiện

### Bước 1 — Tạo project Next.js

```powershell
cd V:\english-learning-app
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

- `--typescript` → dùng TypeScript
- `--tailwind` → Tailwind CSS (mặc định v4 nếu Next 16)
- `--eslint` → ESLint flat config (v9)
- `--app` → App Router
- `--src-dir` → code trong `src/`
- `--import-alias "@/*"` → `@/` map vào `src/`

Sau lệnh này sẽ sinh ra:

```
V:\english-learning-app\frontend\
├── src/
│   └── app/
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── public/
├── next.config.ts
├── eslint.config.ts  (flat config)
├── tsconfig.json
└── package.json
```

### Bước 2 — Cài thêm dependencies

```powershell
cd V:\english-learning-app\frontend
npm install http-proxy
npm install -D @types/http-proxy
```

`http-proxy` dùng trong `proxy.ts` để forward request sang backend.

### Bước 3 — Tạo cấu trúc thư mục

```
V:\english-learning-app\frontend\
├── app/                          # App Router (root level)
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       └── proxy/
│           └── route.ts          # gọi proxy.ts
├── share/                        # code dùng chung
│   ├── component/
│   ├── hook/
│   ├── services/
│   ├── types/
│   └── utils/
├── src/
│   ├── auth/
│   │   ├── component/
│   │   ├── hook/
│   │   ├── services/
│   │   └── types/
│   ├── admin/
│   │   ├── component/
│   │   ├── hook/
│   │   ├── services/
│   │   └── types/
│   └── client/
│       ├── component/
│       ├── hook/
│       ├── services/
│       └── types/
├── public/
├── proxy.ts                      # reverse proxy handler
├── next.config.ts
├── eslint.config.ts
└── tsconfig.json
```

Chạy lệnh tạo toàn bộ thư mục:

```powershell
New-Item -ItemType Directory -Path "share\component","share\hook","share\services","share\types","share\utils"
New-Item -ItemType Directory -Path "src\auth\component","src\auth\hook","src\auth\services","src\auth\types"
New-Item -ItemType Directory -Path "src\admin\component","src\admin\hook","src\admin\services","src\admin\types"
New-Item -ItemType Directory -Path "src\client\component","src\client\hook","src\client\services","src\client\types"
```

### Bước 4 — Tạo proxy.ts

`V:\english-learning-app\frontend\proxy.ts`:

```ts
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { NextApiRequest, NextApiResponse } from 'next';

const proxy = createProxyMiddleware({
  target: process.env.API_URL || 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: { '^/api/proxy': '/api' },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Promise<void>((resolve, reject) => {
    (proxy as any)(req, res, (result: unknown) => {
      if (result instanceof Error) reject(result);
      resolve();
    });
  });
}
```

> **Ghi chú**: `proxy.ts` ở root là file handler. API route `app/api/proxy/route.ts` sẽ import nó để xử lý request. Nếu dùng `rewrites()` trong `next.config.ts` thì có thể bỏ qua API route và config thẳng.

### Bước 5 — Config next.config.ts

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/proxy/:path*',
      },
    ];
  },
};

export default nextConfig;
```

### Bước 6 — Config Tailwind v4

Sửa `src/app/globals.css` (hoặc `app/globals.css` nếu app ở root):

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --font-sans: "Inter", sans-serif;
}
```

Tailwind v4 không cần `tailwind.config.ts` — cấu hình qua `@theme` directive trong CSS.

### Bước 7 — Config ESLint v9

`create-next-app` đã sinh `eslint.config.ts` dạng flat config. Sửa lại:

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
  { ignores: ['dist', '.next'] },
]);
```

### Bước 8 — Config tsconfig.json

Bật strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    ...
  }
}
```

### Bước 9 — Tạo file .env.local

```
PORT=3000
API_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_IMAGE_URL=http://localhost:5000/images
```

### Bước 10 — Kiểm tra

```powershell
cd V:\english-learning-app\frontend
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm run build       # build thử
npm run dev         # start dev — mặc định chạy ở http://localhost:3000
```

## Quy tắc migration từ frontend-web cũ

| frontend-web (cũ)        | frontend (mới)              |
| ------------------------ | --------------------------- |
| `src/App.jsx`            | `app/page.tsx` + routes     |
| `src/pages/*`            | `src/{auth,admin,client}/`  |
| `src/components/*`       | `share/component/`          |
| `src/services/api.js`    | `share/services/`           |
| `src/hooks/*`            | `share/hook/`               |
| `src/utils/*`            | `share/utils/`              |
| `src/data/*`             | `share/data/`               |
| Vite + React Router      | Next.js App Router          |
| JSX + JS                 | TypeScript (TSX)            |

Thứ tự migrate ưu tiên: `share/` trước → `auth/` → `client/` → `admin/`.
