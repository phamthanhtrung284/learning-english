# English Studio

Ứng dụng học tiếng Anh qua đọc sách — click vào từ để tra nghĩa, IPA, lưu từ vựng cá nhân, luyện dịch và hội thoại với AI.

## Yêu cầu

- [Node.js](https://nodejs.org/) v18 trở lên
- [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud, free tier)
- Groq API key — đăng ký miễn phí tại [console.groq.com](https://console.groq.com)

---

## Cài đặt local

### 1. Clone repo

```bash
git clone https://github.com/phamthanhtrung284/learning-english.git
cd learning-english
```

### 2. Cài dependencies

```bash
cd backend && npm install
cd ../frontend-web && npm install
```

### 3. Tạo file `backend/.env`

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/english-studio
JWT_SECRET=your_super_secret_key_minimum_32_chars
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
ADMIN_EMAIL=your@email.com
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
```

### 4. Chạy local

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend-web && npm run dev
```

Mở **http://localhost:5173**

---

## Deploy lên production

### Backend → Railway

1. Tạo account tại [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo → chọn thư mục `backend`
3. Thêm environment variables (giống `.env` nhưng dùng MongoDB Atlas URI)
4. Railway sẽ tự detect Node.js và chạy `npm start`
5. Copy URL backend (vd: `https://your-app.railway.app`)

### Frontend → Vercel

1. Tạo account tại [vercel.com](https://vercel.com)
2. Import GitHub repo → chọn thư mục `frontend-web`
3. Thêm environment variable:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   ```
4. Deploy

### Sau khi deploy

- Cập nhật `FRONTEND_ORIGIN` trên Railway thành URL Vercel của mày
- Tài khoản đầu tiên đăng ký sẽ tự động là admin

---

## Giới hạn sử dụng

- **Free**: 20 AI requests/ngày (tra từ, dịch câu, speaking, v.v.)
- **Admin**: không giới hạn

---

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **AI:** Groq API (LLaMA 3.3 70B)
- **Auth:** JWT + bcrypt

## Yêu cầu

- [Node.js](https://nodejs.org/) v18 trở lên
- [MongoDB](https://www.mongodb.com/try/download/community) (local) hoặc [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud, miễn phí)
- Groq API key — đăng ký miễn phí tại [console.groq.com](https://console.groq.com)

---

## Cài đặt

### 1. Clone repo

```bash
git clone https://github.com/phamthanhtrung284/learning-english.git
cd learning-english
```

### 2. Cài dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend-web
npm install
```

### 3. Tạo file `.env` cho backend

Tạo file `backend/.env` với nội dung sau:

```env
# MongoDB — dùng local hoặc Atlas
MONGO_URI=mongodb://localhost:27017/english-studio

# JWT secret — đặt chuỗi bất kỳ, càng dài càng tốt
JWT_SECRET=your_super_secret_key_here

# Groq API key — lấy tại https://console.groq.com
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# (Tuỳ chọn) Email tài khoản admin đầu tiên
ADMIN_EMAIL=your@email.com

# (Tuỳ chọn) Port backend, mặc định 5000
PORT=5000

# (Tuỳ chọn) Cho phép CORS từ frontend — để trống thì cho phép tất cả
FRONTEND_ORIGIN=http://localhost:5173
```

> **Lưu ý:** File `.env` không được commit lên git. Đừng chia sẻ API key của bạn.

### 4. Tạo file `.env` cho frontend (tuỳ chọn)

Mặc định frontend kết nối tới `http://localhost:5000/api`. Nếu backend chạy port khác, tạo file `frontend-web/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Chạy ứng dụng

Mở **2 terminal** riêng:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend-web
npm run dev
```

Sau đó mở trình duyệt tại **http://localhost:5173**

---

## Tài khoản Admin

Tài khoản đầu tiên đăng ký sẽ tự động là admin, **hoặc** tài khoản có email trùng với `ADMIN_EMAIL` trong `.env`.

Admin có thể:
- Upload truyện PDF lên thư viện
- Upload ảnh bìa cho từng series
- Chỉnh sửa nội dung chapter

---

## Tính năng chính

| Tính năng | Mô tả |
|---|---|
| **Light Novel Library** | Đọc sách, click từng từ để tra nghĩa + IPA |
| **Sentence Analyzer** | Phân tích câu theo từng token bằng AI |
| **Vocabulary Notebook** | Lưu và quản lý từ vựng cá nhân |
| **AI Lesson Generator** | Sinh đoạn văn mẫu theo chủ đề tuỳ chọn |
| **PDF Import** | Admin upload PDF → tự động trích xuất thành văn bản đọc được |

---

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **AI:** Groq API (LLaMA 3.3 70B)
- **Auth:** JWT + bcrypt
