# Split Bill Backend

分帳系統的後端 API，使用 Node.js + Express + MongoDB Atlas。

## 功能特色

- **密碼驗證**: 使用 bcrypt 加密儲存密碼
- **JWT 認證**: 登入後返回 JWT token
- **定時任務**: 每天自動建立當日密碼
- **MongoDB Atlas**: 雲端資料庫儲存

## 環境需求

- Node.js 18+
- MongoDB Atlas 帳號

## 快速開始

### 1. 安裝依賴

```bash
cd backend
npm install
```

### 2. 設定環境變數

複製 `.env.example` 並重新命名為 `.env`:

```bash
cp .env.example .env
```

編輯 `.env` 文件:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/split-bill?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**如何取得 MongoDB URI:**

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 建立帳號並登入
3. 建立新的 Cluster（選擇免費方案 M0）
4. 在 Database Access 新增資料庫使用者
5. 在 Network Access 新增 IP 地址（開發時可用 `0.0.0.0/0` 允許所有 IP）
6. 點擊 "Connect" > "Connect your application"
7. 複製連接字串並替換 `<password>` 為你的資料庫密碼

### 3. 啟動開發伺服器

```bash
npm run dev
```

伺服器會運行在 `http://localhost:3001`

### 4. 啟動正式伺服器

```bash
npm start
```

## API 端點

### POST /api/auth/login

登入驗證

**Request Body:**
```json
{
  "password": "20251122"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "登入成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "date": "20251122"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "密碼錯誤"
}
```

### GET /api/auth/verify

驗證 JWT token

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "success": true,
  "message": "Token 有效",
  "date": "20251122"
}
```

### GET /health

健康檢查

**Response:**
```json
{
  "status": "OK",
  "message": "Split Bill Backend is running"
}
```

## 定時任務

後端會在以下時間自動建立密碼：

- **每天 00:01** (台北時間，+8時區)
- **伺服器啟動時**（確保當天密碼存在）

密碼格式為當天日期 (YYYYMMDD)，使用 bcrypt 加密後儲存。

## 專案結構

```
backend/
├── config/
│   └── db.js              # MongoDB 連接設定
├── middleware/
│   └── security.js        # 資安中介軟體
├── models/
│   └── Password.js        # 密碼資料模型
├── routes/
│   ├── auth.js           # 認證相關路由
│   └── cron.js           # Cron Job 路由
├── utils/
│   ├── jwt.js            # JWT 工具函數
│   └── dateHelper.js     # 日期工具函數
├── jobs/
│   └── passwordCron.js   # 定時任務（本地用）
├── server.js             # 主程式
├── vercel.json           # Vercel 配置
├── package.json
├── .env.example
├── README.md
├── VERCEL_DEPLOYMENT.md  # Vercel 部署詳細指南
└── SECURITY.md           # 資安說明文件
```

## 部署

### 🌟 部署到 Vercel（推薦）

**完整部署指南請參閱 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**

快速步驟：

1. 推送程式碼到 GitHub
2. 在 Vercel 匯入專案，設定 Root Directory 為 `backend`
3. 設定環境變數：`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `CRON_SECRET`
4. 部署並啟用 Vercel Cron Jobs
5. 測試 API 端點

### 部署到 Railway

1. 前往 [Railway](https://railway.app/)
2. 使用 GitHub 登入
3. 點擊 "New Project" > "Deploy from GitHub repo"
4. 選擇此專案的 backend 資料夾
5. 設定環境變數:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL` (部署後的前端網址)
6. 部署完成後會獲得一個 URL

### 部署到 Vercel

1. 安裝 Vercel CLI: `npm i -g vercel`
2. 在 backend 資料夾執行: `vercel`
3. 按照提示設定專案
4. 在 Vercel Dashboard 設定環境變數
5. 部署完成

## 安全性

**詳細資安說明請參閱 [SECURITY.md](./SECURITY.md)**

已實作的安全措施：

- ✅ **密碼加密**：bcrypt (salt rounds: 10)
- ✅ **JWT 認證**：24 小時過期
- ✅ **Rate Limiting**：防止暴力破解（15分鐘5次登入）
- ✅ **輸入驗證**：express-validator 驗證格式
- ✅ **CORS 限制**：僅允許指定網域
- ✅ **Helmet**：安全 HTTP Headers
- ✅ **環境變數**：敏感資訊分離
- ✅ **Cron Job 驗證**：防止未授權觸發

安全等級：★★★★☆ (4/5)

## 授權

MIT License
