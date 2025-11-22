# Split Bill 完整設定指南

本指南將帶你從零開始設定完整的 Split Bill 系統（前端 + 後端）。

## 系統架構

```
前端 (React + Vite)
    ↓ HTTP Request
後端 (Node.js + Express)
    ↓ MongoDB Driver
MongoDB Atlas (雲端資料庫)
```

## 第一步：設定 MongoDB Atlas

### 1. 建立 MongoDB Atlas 帳號

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 點擊 "Try Free" 註冊帳號
3. 使用 Google 帳號或 Email 註冊

### 2. 建立 Cluster

1. 登入後點擊 "Build a Database"
2. 選擇 **FREE** 方案 (M0 Sandbox)
3. 選擇雲端供應商和地區（建議選擇 AWS Singapore 或 GCP Taiwan）
4. Cluster 名稱保持預設即可，點擊 "Create"
5. 等待 1-3 分鐘讓 Cluster 建立完成

### 3. 設定資料庫使用者

1. 在彈出視窗中設定資料庫使用者
   - Username: 輸入使用者名稱（例如：`admin`）
   - Password: 點擊 "Autogenerate Secure Password" 並**複製保存**
   - 點擊 "Create User"

### 4. 設定網路存取

1. 在 "Where would you like to connect from?" 選擇 "My Local Environment"
2. 點擊 "Add My Current IP Address"
3. **重要**：為了讓部署的伺服器也能連接，需要新增 `0.0.0.0/0`
   - 點擊 "Add IP Address"
   - IP Address: `0.0.0.0/0`
   - Description: `Allow all`
   - 點擊 "Add Entry"
4. 點擊 "Finish and Close"

### 5. 取得連接字串

1. 回到 Cluster 頁面，點擊 "Connect"
2. 選擇 "Drivers"
3. Driver: **Node.js**，Version: **5.5 or later**
4. 複製連接字串，格式如下：
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. 將 `<password>` 替換成剛才保存的密碼
6. 在 `mongodb.net/` 後面加上資料庫名稱 `split-bill`，最終格式：
   ```
   mongodb+srv://admin:your_password@cluster0.xxxxx.mongodb.net/split-bill?retryWrites=true&w=majority
   ```

## 第二步：設定後端

### 1. 安裝依賴

```bash
cd backend
npm install
```

### 2. 設定環境變數

```bash
cp .env.example .env
```

編輯 `backend/.env`:

```env
# 貼上剛才複製的 MongoDB 連接字串
MONGODB_URI=mongodb+srv://admin:your_password@cluster0.xxxxx.mongodb.net/split-bill?retryWrites=true&w=majority

# JWT 密鑰（請自行生成一個複雜的隨機字串）
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string

# 伺服器 Port
PORT=3001

# 前端 URL（開發環境）
FRONTEND_URL=http://localhost:5173
```

**生成 JWT_SECRET 的方法：**

在終端機執行：
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

複製輸出的字串作為 JWT_SECRET。

### 3. 啟動後端

```bash
npm run dev
```

你應該會看到：
```
MongoDB Connected: cluster0-xxxxx.mongodb.net
密碼定時任務已啟動 (每天 00:01 台北時間)
執行初始密碼建立
成功建立密碼: 20251122
伺服器運行在 port 3001
```

### 4. 測試後端 API

開啟新的終端機視窗，測試健康檢查端點：

```bash
curl http://localhost:3001/health
```

應該返回：
```json
{"status":"OK","message":"Split Bill Backend is running"}
```

測試登入 API（假設今天是 2025年11月22日）：

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"20251122"}'
```

應該返回包含 token 的 JSON。

## 第三步：設定前端

### 1. 回到專案根目錄並設定環境變數

```bash
cd ..
cp .env.example .env
```

編輯 `.env`:

```env
# Gemini API Key (如果要使用發票辨識功能)
VITE_GEMINI_API_KEY=your_gemini_api_key

# 後端 API URL
VITE_API_URL=http://localhost:3001
```

### 2. 安裝前端依賴

```bash
npm install
```

### 3. 啟動前端

```bash
npm run dev
```

你應該會看到：
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### 4. 測試系統

1. 開啟瀏覽器訪問 http://localhost:5173/
2. 你會看到登入頁面
3. 輸入今天的日期作為密碼（格式：YYYYMMDD）
   - 例如：2025年11月22日 → `20251122`
4. 登入成功後就可以使用分帳系統了！

## 驗證檢查清單

- [ ] MongoDB Atlas Cluster 建立成功
- [ ] 資料庫使用者建立完成
- [ ] 網路存取設定完成（包含 0.0.0.0/0）
- [ ] 後端 .env 設定完成
- [ ] 後端成功啟動（顯示 MongoDB Connected）
- [ ] 後端 API 測試成功
- [ ] 前端 .env 設定完成
- [ ] 前端成功啟動
- [ ] 可以成功登入系統

## 常見問題

### Q: 後端啟動失敗，顯示 MongoServerError

**A:** 檢查以下項目：
1. MongoDB URI 是否正確（包含密碼和資料庫名稱）
2. 網路存取是否設定為 0.0.0.0/0
3. 密碼中的特殊字元是否需要 URL 編碼

### Q: 前端登入失敗，顯示「無法連接到伺服器」

**A:** 檢查：
1. 後端是否正在運行（http://localhost:3001/health）
2. VITE_API_URL 是否設定正確
3. CORS 設定是否正確

### Q: 登入失敗，顯示「今日密碼尚未設定」

**A:**
1. 檢查後端啟動時是否顯示「成功建立密碼」
2. 查看 MongoDB Atlas 資料庫中是否有 passwords collection
3. 手動執行建立密碼（參考後端 README）

### Q: 如何查看 MongoDB 中的資料？

**A:**
1. 登入 MongoDB Atlas
2. 點擊 "Browse Collections"
3. 選擇 split-bill 資料庫
4. 可以看到 passwords collection 和資料

## 下一步：部署到生產環境

完成本機開發後，可以參考以下文件部署到生產環境：

- 後端部署：參考 `backend/README.md` 的部署章節
- 前端部署：參考主 `README.md` 的部署章節

部署時記得更新環境變數：
- 後端的 `FRONTEND_URL` 要改成前端的正式網址
- 前端的 `VITE_API_URL` 要改成後端的正式網址
