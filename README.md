# 簡易分帳系統 (Split Bill App)

一個支援多人協作的雲端分帳系統，幫助你輕鬆管理群組支出和結算。

## ✨ 主要特色

### 🌟 多人協作（NEW!）

- **頻道系統**：建立分帳頻道，使用金鑰邀請朋友加入
- **即時同步**：所有資料儲存在 MongoDB 雲端，多裝置即時同步
- **無縫協作**：所有成員都可以新增、編輯、刪除支出記錄

### 💰 核心功能

- **成員管理**：新增和刪除分帳成員
- **支出記錄**：記錄每筆支出的詳細資訊
- **智能結算**：使用貪婪算法計算最優還款方案，減少交易次數
- **發票辨識**：使用 Gemini AI 自動辨識發票內容
- **編輯功能**：支援編輯已新增的支出記錄

### 🎨 使用者體驗

- **響應式設計**：支援手機、平板和桌面裝置
- **美觀 UI**：使用 Tailwind CSS 和 shadcn/ui 打造精美介面
- **Loading 狀態**：所有操作都有清楚的載入提示
- **錯誤處理**：友善的錯誤訊息提示

### 🔐 安全性

- **金鑰保護**：每個頻道有獨立的 8 位金鑰
- **資料加密**：使用 MongoDB Atlas 雲端資料庫
- **CORS 保護**：後端 API 設有 CORS 和 Rate Limiting

## 🚀 技術棧

### 前端

- **React 18** - UI 框架
- **TypeScript** - 型別安全
- **Vite** - 建置工具
- **Tailwind CSS** - CSS 框架
- **shadcn/ui** - UI 元件庫
- **Lucide React** - 圖標庫
- **Google Gemini AI** - 發票辨識

### 後端

- **Node.js + Express** - 伺服器框架
- **MongoDB + Mongoose** - 資料庫
- **express-validator** - 輸入驗證
- **helmet** - 安全性中介軟體
- **express-rate-limit** - API 限流

### 部署

- **Vercel** - 前端和後端部署
- **MongoDB Atlas** - 資料庫託管

## 📦 快速開始

### 前端設定

#### 1. 安裝依賴

```bash
npm install
```

#### 2. 設定環境變數

複製 `.env.example` 並重新命名為 `.env`:

```bash
cp .env.example .env
```

編輯 `.env` 文件：

```env
# Gemini AI API Key（用於發票辨識）
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# 後端 API URL
VITE_API_URL=http://localhost:3001
```

**取得 Gemini API Key:**

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登入你的 Google 帳號
3. 點擊「Create API Key」
4. 複製 API Key 並貼到 `.env` 文件中

#### 3. 啟動開發伺服器

```bash
npm run dev
```

訪問 http://localhost:5173/ 即可使用。

### 後端設定

#### 1. 進入後端目錄

```bash
cd backend
```

#### 2. 安裝依賴

```bash
npm install
```

#### 3. 設定環境變數

創建 `backend/.env` 文件：

```env
# MongoDB 連接字串
MONGODB_URI=your_mongodb_connection_string

# JWT 密鑰
JWT_SECRET=your_random_secret_key

# 伺服器設定
PORT=3001

# CORS 允許的前端網址
FRONTEND_URL=http://localhost:5173
```

**取得 MongoDB 連接字串:**

1. 前往 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 建立免費帳號並創建 Cluster
3. 點擊 "Connect" → "Connect your application"
4. 複製連接字串並替換密碼

#### 4. 啟動後端伺服器

```bash
npm start
```

後端會運行在 http://localhost:3001

## 📖 使用指南

### 1️⃣ 建立頻道

1. 打開應用程式
2. 選擇「**建立頻道**」分頁
3. 輸入頻道名稱（例如：「週末旅遊」）
4. 點擊「建立頻道」
5. **記下 8 位金鑰**（例如：`8SSM D6EA`）
6. 點擊複製按鈕 📋 複製金鑰
7. 點擊「進入頻道」開始使用

### 2️⃣ 分享金鑰給朋友

透過以下方式分享金鑰：

- 📱 LINE / WhatsApp / Telegram
- 📧 Email
- 💬 任何通訊軟體

**分享內容範例：**

```
嗨！我建立了一個分帳頻道「週末旅遊」
請使用以下金鑰加入：

8SSM D6EA

打開分帳系統 → 選擇「加入頻道」→ 輸入金鑰即可
```

### 3️⃣ 加入頻道（其他成員）

1. 打開應用程式
2. 選擇「**加入頻道**」分頁
3. 輸入收到的 8 位金鑰
4. 點擊「加入頻道」
5. ✅ 成功進入相同頻道！

### 4️⃣ 開始協作

所有成員都可以：

#### 📌 成員管理

- ➕ 新增成員
- ❌ 刪除成員
- 👥 查看所有成員

#### 💰 支出記錄

- ➕ 新增支出（手動輸入或發票掃描）
- ✏️ 編輯支出資料
- 🗑️ 刪除支出記錄
- 📊 查看支出明細

#### 🧮 結算功能

- 💵 查看每個人應付/應收金額
- 📊 自動計算最少交易次數
- 📋 清楚的結算建議

## 🎯 功能詳解

### 頻道管理

#### 建立頻道

- 輸入頻道名稱（最多 50 字）
- 系統自動生成 8 位隨機金鑰
- 金鑰格式：`XXXX XXXX`（大寫英數字）
- 可隨時查看和複製金鑰

#### 加入頻道

- 輸入 8 位金鑰即可加入
- 支援有空格或無空格格式
- 金鑰驗證失敗會顯示錯誤訊息

#### 頻道操作

- **查看金鑰**：點擊頻道標題可顯示/隱藏金鑰
- **複製金鑰**：一鍵複製分享給其他人
- **登出頻道**：清除本地金鑰，需重新輸入才能進入
- **刪除頻道**：永久刪除頻道和所有資料（需確認）

### 成員管理

- 新增成員：輸入名稱並點擊「新增」
- 刪除成員：點擊成員旁的 ❌ 按鈕
- 成員名稱不可重複
- 所有成員都可以管理成員列表

### 支出記錄

#### 手動新增

1. 填寫項目名稱（例如：晚餐、電影票）
2. 輸入金額
3. 選擇付款人
4. 選擇參與分攤者（可多選，按住 Ctrl/Cmd）
5. 點擊「新增支出」
6. 自動切換到「支出記錄」頁面

#### 發票掃描（Gemini AI）

1. 點擊「掃描發票」按鈕
2. 上傳發票照片
3. AI 自動識別：
   - 店家名稱
   - 總金額
   - 日期
4. 手動選擇付款人和參與者
5. 確認並新增

#### 編輯支出

1. 在「支出記錄」頁面找到要編輯的支出
2. 點擊「編輯」按鈕 ✏️
3. 修改資料
4. 點擊「儲存」

#### 刪除支出

1. 點擊「刪除」按鈕 🗑️
2. 確認刪除
3. 資料即時從雲端移除

### 結算功能

系統使用**貪婪算法**計算最優還款方案：

1. 計算每個人的淨額（實際支付 - 應付金額）
2. 分離債權人（淨額 > 0）和債務人（淨額 < 0）
3. 貪婪配對：
   - 找最大債權人和最大債務人
   - 轉帳金額 = min(債權, 債務)
   - 更新雙方餘額
   - 重複直到所有人結清

**優勢：** 用最少的交易次數完成所有還款

### 資料同步

- ✅ 所有操作都會**即時同步**到 MongoDB 雲端
- ✅ 任何成員的修改都會影響所有人
- ✅ 重新整理頁面後資料不會消失
- ✅ 支援多裝置同時使用同一頻道

### 舊資料遷移

系統會自動偵測 localStorage 中的舊資料：

1. 啟動時檢查是否有舊的成員和支出資料
2. 顯示遷移提示對話框
3. 用戶可選擇：
   - **匯入到新頻道**：自動建立頻道並匯入所有資料
   - **不要匯入**：清除舊資料
4. 遷移完成後，所有資料儲存在雲端

## 📂 專案結構

```
split-bill/
├── backend/                 # 後端服務器
│   ├── models/             # MongoDB Models
│   │   └── Channel.js      # 頻道 Model
│   ├── routes/             # API 路由
│   │   ├── channel.js      # 頻道 API
│   │   ├── members.js      # 成員 API
│   │   └── expenses.js     # 支出 API
│   ├── middleware/         # 中介軟體
│   │   └── security.js     # 安全性設定
│   ├── config/             # 設定檔
│   │   └── db.js          # MongoDB 連線
│   └── server.js           # 伺服器入口
│
├── src/                    # 前端源碼
│   ├── components/         # React 元件
│   │   ├── ui/            # shadcn/ui 元件
│   │   ├── ChannelGate.tsx      # 頻道入口（建立/加入）
│   │   ├── ChannelHeader.tsx    # 頻道標題
│   │   ├── MemberManagement.tsx # 成員管理
│   │   ├── ExpenseForm.tsx      # 支出表單
│   │   ├── ExpenseList.tsx      # 支出列表
│   │   ├── SettlementResult.tsx # 結算結果
│   │   └── ReceiptUpload.tsx    # 發票上傳
│   ├── api/               # API 呼叫函數
│   │   ├── channel.ts     # 頻道 API
│   │   ├── members.ts     # 成員 API
│   │   └── expenses.ts    # 支出 API
│   ├── types/             # TypeScript 型別
│   │   └── channel.ts     # 頻道和支出型別
│   ├── services/          # 服務層
│   │   └── geminiService.ts # Gemini AI 服務
│   ├── lib/
│   │   └── utils.ts       # 工具函數
│   ├── App.tsx            # 主應用程式
│   ├── main.tsx           # 入口文件
│   └── index.css          # 全域樣式
│
├── USER_GUIDE.md          # 使用者指南
├── TESTING_SUMMARY.md     # 測試報告
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🔐 安全性

### 後端安全

- **CORS 保護**：只允許指定來源的請求
- **Rate Limiting**：限制 API 請求頻率
- **Helmet**：設定安全的 HTTP Headers
- **輸入驗證**：使用 express-validator 驗證所有輸入
- **MongoDB 注入防護**：使用 Mongoose ODM

### 前端安全

- **金鑰保護**：金鑰儲存在 localStorage
- **錯誤處理**：不暴露敏感資訊
- **輸入驗證**：前端表單驗證

## 🧪 測試案例

### 案例 1：三人旅遊分帳

**情境：** 小明、小華、小美一起去旅遊

**操作：**

1. 小明建立頻道「墾丁週末遊」
2. 小華和小美用金鑰加入
3. 記錄支出：
   - 小明付早餐 $300（3 人平分）
   - 小華付午餐 $450（3 人平分）
   - 小美付晚餐 $600（3 人平分）

**結算結果：**

- 小明：付 $300，應付 $450 → 欠 $150
- 小華：付 $450，應付 $450 → 已結清
- 小美：付 $600，應付 $450 → 應收 $150
- **最優方案：** 小明付 $150 給小美

### 案例 2：複雜分帳

**情境：** 4 人聚餐，不同人參與不同項目

**操作：**

- 支出 1：A 付 $400，ABCD 平分（每人 $100）
- 支出 2：B 付 $300，ABC 平分（每人 $100）
- 支出 3：C 付 $200，AB 平分（每人 $100）

**結算結果：**
系統自動計算各人淨額並給出最優還款方案

## 📱 瀏覽器支援

- ✅ Chrome（推薦）
- ✅ Firefox
- ✅ Safari
- ✅ Edge

需要支援以下功能的現代瀏覽器：

- localStorage
- Fetch API
- ES6+

## 🚀 部署

### Vercel 部署（推薦）

#### 前端部署

1. 將程式碼推送到 GitHub
2. 前往 [Vercel](https://vercel.com)
3. Import GitHub Repository
4. 設定環境變數：
   - `VITE_GEMINI_API_KEY`
   - `VITE_API_URL`（後端 URL）
5. 點擊 Deploy

#### 後端部署

1. 在 Vercel 創建新專案
2. 選擇 `backend` 資料夾
3. 設定環境變數：
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
4. 點擊 Deploy

## 📚 相關文件

- [USER_GUIDE.md](./USER_GUIDE.md) - 詳細使用指南
- [TESTING_SUMMARY.md](./backend/TESTING_SUMMARY.md) - 測試報告
- [CHANNEL_IMPLEMENTATION_PLAN.md](./backend/CHANNEL_IMPLEMENTATION_PLAN.md) - 實作計劃

## 🆕 更新日誌

### v2.0.1 (2025-11-27)

- 新增背景特效

### v2.0.0 (2025-11-26)

- 新增多人協作頻道系統
- 從 localStorage 遷移到 MongoDB 雲端儲存
- 金鑰分享功能
- 即時資料同步
- 舊資料自動遷移
- 完整的錯誤處理和 Loading 狀態
- 15 個階段全部完成

### v1.0.0

- 基礎分帳功能
- Gemini AI 發票辨識
- localStorage 資料儲存
- 智能結算算法

## 💡 常見問題

### Q: 忘記金鑰怎麼辦？

A: 如果還在頻道內，點擊頻道標題可查看金鑰。如果已登出，目前無法找回，建議建立頻道後立即保存金鑰。

### Q: 可以更改頻道名稱嗎？

A: 目前不支援更改頻道名稱。

### Q: 資料會保存多久？

A: 資料永久保存在 MongoDB，除非手動刪除頻道。

### Q: 可以建立多個頻道嗎？

A: 可以！使用不同的金鑰管理不同的分帳群組。

### Q: 多個人同時編輯會衝突嗎？

A: 不會！系統使用 MongoDB 保證資料一致性，最後的操作會覆蓋之前的操作。

## 📄 授權

MIT License

## 👨‍💻 作者

Built with Ken and Claude Code

---

**⭐ 如果這個專案對你有幫助，請給個星星！**
