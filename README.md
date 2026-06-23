# English Studio

Ứng dụng học tiếng Anh toàn diện dành cho người Việt. Đọc light novel, click từ để tra nghĩa AI, luyện dịch câu, luyện nói hội thoại, theo dõi tiến độ và quản lý từ vựng cá nhân.

---

## Tính năng

| Tính năng | Mô tả |
|---|---|
| **Light Novel Library** | Đọc truyện, click từng từ để tra nghĩa + IPA + collocation bằng AI |
| **Sentence Translator** | Dịch câu, AI chấm điểm bản dịch, highlight lỗi sai |
| **Vocabulary Notebook** | Lưu và ôn tập từ vựng cá nhân |
| **AI Lesson Generator** | Sinh đoạn văn học theo chủ đề và cấp độ CEFR tuỳ chọn |
| **Grammar Analyzer** | Phân tích cấu trúc ngữ pháp từng câu |
| **PDF Import (Admin)** | Upload PDF → tự động trích xuất thành văn bản đọc được |
| **Admin Panel** | Quản lý users, library, courses |

---

## Tech stack

| Layer | Công nghệ |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB + Mongoose |
| **AI** | Groq API (LLaMA 3.3 70B, LLaMA 3.1 8B) |
| **Auth** | JWT + bcrypt |
| **File storage** | Cloudinary (ảnh bìa, avatar) hoặc local uploads |

---

## Yêu cầu

- [Node.js](https://nodejs.org/) **v18 trở lên** (khuyến nghị v22)
- [MongoDB](https://www.mongodb.com/try/download/community) local **hoặc** [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **Groq API key** — đăng ký miễn phí tại [console.groq.com](https://console.groq.com)
- *(Tuỳ chọn)* [Cloudinary](https://cloudinary.com) account — dùng để lưu ảnh bìa và avatar. Nếu không có thì app vẫn chạy, chỉ mất tính năng upload ảnh.

---

## Cài đặt local

### 1. Clone repo

```bash
git clone <your-repo-url>
cd english-learning-app
```

### 2. Cài dependencies

```bash
# Backend
cd backend-web
npm install

# Frontend (mở terminal khác)
cd frontend
npm install
```

### 3. Cấu hình Backend — tạo file `.env`

Tạo file `backend-web/.env` với nội dung sau:

```env
# Server
PORT=4000

# MongoDB — chọn 1 trong 2:
# Local:
MONGO_URI=mongodb://localhost:27017/english-studio
# Hoặc Atlas (thay <user>, <password>, <cluster> bằng thông tin của bạn):
# MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/english-studio

# JWT — chuỗi bí mật bất kỳ, tối thiểu 32 ký tự
JWT_SECRET=replace_this_with_a_long_random_string_at_least_32_chars

# Groq API key — lấy tại https://console.groq.com
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx

# Frontend origin — dùng để cấu hình CORS
FRONTEND_ORIGIN=http://localhost:3000

# (Tuỳ chọn) Email tài khoản muốn đặt làm admin ngay từ đầu
# Nếu để trống thì người đăng ký đầu tiên tự động thành admin
ADMIN_EMAIL=your@email.com

# (Tuỳ chọn) Cloudinary — bỏ qua nếu không dùng upload ảnh
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> ⚠️ **Không commit file `.env` lên git.** File `.gitignore` đã loại trừ nó rồi.

### 4. Cấu hình Frontend — tạo file `.env.local`

Tạo file `frontend/.env.local`:

```env
# URL của backend (không có dấu / ở cuối)
API_URL=http://localhost:4000
```

> Nếu không tạo file này, frontend mặc định kết nối tới `http://localhost:4000`.

### 5. Chạy ứng dụng

Mở **2 terminal** riêng:

**Terminal 1 — Backend:**
```bash
cd backend-web
npm run dev
```
Backend chạy tại `http://localhost:4000`. Khi thấy dòng `Server running on port 4000` là OK.

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend chạy tại `http://localhost:3000`. Mở trình duyệt vào địa chỉ này.

---

## Tài khoản Admin

Có 2 cách để tạo tài khoản admin:

1. **Tự động theo email** — đặt `ADMIN_EMAIL=your@email.com` trong `.env` backend, rồi đăng ký tài khoản với đúng email đó.
2. **Người đăng ký đầu tiên** — nếu `ADMIN_EMAIL` không được đặt, tài khoản đầu tiên đăng ký trên hệ thống sẽ tự động thành admin.

Admin có thể truy cập panel tại `/admin` để:
- Quản lý users (cấp premium, cấp/thu hồi admin)
- Upload truyện PDF vào thư viện
- Quản lý Library series và chapters
- Quản lý Courses

---

## Giới hạn AI

| Loại tài khoản | Giới hạn |
|---|---|
| **Free** | 20 AI requests / ngày (reset lúc 00:00 UTC) |
| **Premium** | Không giới hạn |
| **Admin** | Không giới hạn |

Các action tính vào quota: tra từ, dịch câu, chấm điểm bản dịch, speaking, generate lesson, phân tích paragraph.

---

## Deploy lên production

### Backend → Railway

1. Tạo account tại [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub repo** → chọn thư mục `backend-web`
3. Thêm tất cả các biến trong bảng dưới vào **Variables**:

| Biến | Giá trị |
|---|---|
| `PORT` | `4000` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Chuỗi random dài ≥ 32 ký tự |
| `GROQ_API_KEY` | Groq API key của bạn |
| `FRONTEND_ORIGIN` | URL Vercel của frontend (sau khi deploy) |
| `ADMIN_EMAIL` | Email admin |
| `CLOUDINARY_CLOUD_NAME` | *(nếu dùng)* |
| `CLOUDINARY_API_KEY` | *(nếu dùng)* |
| `CLOUDINARY_API_SECRET` | *(nếu dùng)* |

4. Railway tự detect Node.js và chạy `npm start` (script build TypeScript rồi chạy `dist/index.js`)
5. Copy URL backend — ví dụ: `https://your-backend.railway.app`

### Frontend → Vercel

1. Tạo account tại [vercel.com](https://vercel.com)
2. **Import GitHub repo** → chọn thư mục `frontend`
3. Thêm **Environment Variable**:

| Biến | Giá trị |
|---|---|
| `API_URL` | URL Railway backend, ví dụ `https://your-backend.railway.app` |

4. Deploy.

### Sau khi deploy xong

Quay lại Railway, cập nhật biến `FRONTEND_ORIGIN` thành URL Vercel thực tế của bạn (ví dụ `https://your-app.vercel.app`) để CORS hoạt động đúng.

---

## Cấu trúc thư mục

```
english-learning-app/
├── backend-web/          # Express + TypeScript API
│   ├── src/
│   │   ├── modules/      # Feature modules (auth, ai, speaking, library…)
│   │   ├── models/       # Mongoose models
│   │   ├── common/       # Middleware, utils, types dùng chung
│   │   └── config/       # DB, env validation
│   └── package.json
│
├── frontend/             # Next.js 16 app
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # UI components dùng chung
│   │   └── client/       # Client-only pages và hooks
│   ├── share/            # Types và services chia sẻ với backend
│   └── package.json
│
└── .github/workflows/    # CI pipeline
```

---

## Câu hỏi thường gặp

**Q: Chạy backend thấy lỗi `Invalid environment variables`?**
Kiểm tra file `backend-web/.env` — đảm bảo `MONGO_URI` và `JWT_SECRET` đã được đặt. `JWT_SECRET` phải ≥ 32 ký tự.

**Q: Frontend báo lỗi 502 / không kết nối được backend?**
Kiểm tra `API_URL` trong `frontend/.env.local` có trỏ đúng địa chỉ backend không. Backend phải đang chạy trước.

**Q: AI không hoạt động, trả về lỗi?**
Kiểm tra `GROQ_API_KEY` trong `.env` backend. Lấy key miễn phí tại [console.groq.com](https://console.groq.com).

**Q: Tính năng upload ảnh bìa / avatar không hoạt động?**
Cần cấu hình Cloudinary: thêm `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` vào `.env`.

**Q: Quên email admin, muốn cấp lại quyền admin?**
Dùng MongoDB shell hoặc MongoDB Compass: `db.users.updateOne({ email: "your@email.com" }, { $set: { isAdmin: true } })`
