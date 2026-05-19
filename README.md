# English Learning App (MERN + Mobile)

Monorepo gồm:
- `backend/`: Node.js + Express + MongoDB (Mongoose) API
- `frontend-web/`: React + Vite web client
- `mobile-app/`: Expo (React Native) mobile client

## Yêu cầu
- Node.js >= 18 (khuyến nghị LTS)
- MongoDB (local hoặc remote)

## 1) Backend (API)

### Cấu hình env
Tạo file `backend/.env` dựa trên `backend/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/learning
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

### Chạy backend
```bash
cd backend
npm install
npm run dev
```

API mặc định: `http://localhost:5000`

## 2) Frontend web

### Cấu hình API URL (tuỳ chọn)
Mặc định frontend gọi `http://localhost:5000/api`.
Nếu cần đổi, tạo file `frontend-web/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Chạy web
```bash
cd frontend-web
npm install
npm run dev
```

## 3) Mobile app (Expo)
```bash
cd mobile-app
npm install
npm run start
```

## Ghi chú bảo mật
- Không commit `.env` (repo đã ignore). Chỉ commit `.env.example`.
- Nếu lỡ lộ API key, phải rotate key ngay.

