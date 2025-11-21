# 簡易分帳系統 (Split Bill App)

一個簡單易用的分帳系統,幫助你輕鬆管理群組支出和結算。

## 功能特色

- **安全認證**: 使用加密 token 驗證機制,防止透過開發者工具繞過登入
- **成員管理**: 新增和刪除分帳成員
- **支出記錄**: 記錄每筆支出的詳細資訊
- **智能結算**: 使用貪婪算法計算最優還款方案,減少交易次數
- **發票辨識**: 使用 Gemini AI 自動辨識發票內容
- **拍照分析**: 可拍照上傳發票並自動辨識內容
- **編輯功能**: 支援編輯已新增的支出記錄
- **資料持久化**: 資料自動儲存在瀏覽器 localStorage
- **響應式設計**: 支援手機、平板和桌面裝置
- **美觀 UI**: 使用 Tailwind CSS 和 shadcn/ui 打造精美介面

## 技術棧

- **React 18** - UI 框架
- **TypeScript** - 型別安全
- **Vite** - 建置工具
- **Tailwind CSS** - CSS 框架
- **shadcn/ui** - UI 元件庫
- **Lucide React** - 圖標庫
- **Google Gemini AI** - 發票辨識

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.example` 並重新命名為 `.env`:

```bash
cp .env.example .env
```

編輯 `.env` 文件,填入你的 Gemini API Key:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**取得 API Key:**

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 登入你的 Google 帳號
3. 點擊「Create API Key」
4. 複製 API Key 並貼到 `.env` 文件中

**重要提醒:**

- 不要將 `.env` 文件提交到 GitHub (已在 `.gitignore` 中)
- 不要在程式碼中寫死 API Key
- API Key 應該保密,不要分享給他人

### 3. 啟動開發伺服器

```bash
npm run dev
```

訪問 http://localhost:5173/ 即可使用。

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 部署到 GitHub Pages

本專案已配置自動部署到 GitHub Pages。

### 自動部署 (推薦)

1. **設定 GitHub Secrets (重要!)**

   為了在部署時使用 Gemini API,需要設定環境變數:

   - 前往 GitHub 儲存庫
   - Settings > Secrets and variables > Actions
   - 點擊 "New repository secret"
   - Name: `VITE_GEMINI_API_KEY`
   - Secret: 貼上你的 Gemini API Key
   - 點擊 "Add secret"

2. 啟用 GitHub Pages:

   - 前往 Settings > Pages
   - Source 選擇 "GitHub Actions"

3. 將程式碼推送到 GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

4. 推送後會自動觸發部署,完成後可訪問:
   - https://你的使用者名稱.github.io/split-bill/

### 手動部署

如果需要手動部署:

```bash
npm run build
# 然後將 dist 資料夾的內容推送到 gh-pages 分支
```

## 使用說明

### 0. 登入系統

首次使用需要登入:

- 登入成功後會產生加密 token 儲存在瀏覽器
- 系統使用 SHA-256 加密,即使透過開發者工具也無法偽造有效 token
- 每日密碼會自動更新,過期後需要重新登入

### 1. 成員管理

在「成員管理」頁面新增參與分帳的成員:

- 輸入成員名稱
- 點擊「新增」按鈕
- 成員名稱不可重複
- 可隨時刪除成員(需確認)

### 2. 新增支出

在「新增支出」頁面記錄支出:

- 填寫項目名稱 (例如:晚餐、電影票)
- 輸入金額
- 選擇付款人
- 選擇參與分攤者 (可多選,按住 Ctrl/Cmd)
- 點擊「新增支出」
- 會自動切換到「支出記錄」頁面

### 3. 支出記錄

查看所有支出記錄:

- 顯示項目名稱、金額、付款人、參與者
- 顯示每人應付金額
- 可刪除任何支出記錄

### 4. 結算結果

計算並查看結算結果:

- 點擊「計算欠款」按鈕
- 查看各人收支狀況 (應收/應付/已結清)
- 查看最優還款方案
- 使用貪婪算法優化,減少交易次數

## 測試案例

### 案例 1: 三人平分晚餐

- 成員: 小明、小華、小美
- 支出: 小明付 300 元,三人平分
- 結果:
  - 小華欠小明 100
  - 小美欠小明 100

### 案例 2: 複雜分帳

- 成員: A、B、C
- 支出 1: A 付 300,ABC 平分 (每人應付 100)
- 支出 2: B 付 150,AB 平分 (每人應付 75)
- 支出 3: C 付 90,AC 平分 (每人應付 45)
- 系統會計算各人淨額並給出最優還款方案

## 專案結構

```
split-bill/
├── public/              # 靜態資源
├── src/
│   ├── components/      # React 元件
│   │   ├── ui/         # shadcn/ui 元件
│   │   ├── Login.tsx   # 登入元件
│   │   ├── MemberManagement.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseList.tsx
│   │   └── SettlementResult.tsx
│   ├── lib/
│   │   └── utils.ts    # 工具函數
│   ├── utils/
│   │   └── auth.ts     # 認證工具 (加密 token)
│   ├── App.tsx         # 主應用程式
│   ├── main.tsx        # 入口文件
│   └── index.css       # 全域樣式
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 核心算法

### 結算算法

使用貪婪算法優化還款路徑:

1. 計算每個人的淨額 (實際支付 - 應付金額)
2. 分離債權人 (淨額 > 0) 和債務人 (淨額 < 0)
3. 貪婪配對:
   - 找最大債權人和最大債務人
   - 轉帳金額 = min(債權, 債務)
   - 更新雙方餘額
   - 重複直到所有人結清

這樣可以用最少的交易次數完成所有還款。

### 安全認證算法

使用加密雜湊防止認證繞過:

1. 使用者輸入密碼（當天日期）
2. 系統使用 Web Crypto API 的 SHA-256 生成加密 token
   - token = SHA-256(密碼 + 密鑰)
3. 將加密後的 token 儲存到 localStorage
4. 每次載入應用時驗證 token:
   - 讀取 localStorage 中的 token
   - 比對兩個 token 是否相同
5. 如果 token 無效或日期已過期，清除認證並要求重新登入

**安全性優勢:**

- 即使使用者透過開發者工具查看 localStorage，也只能看到加密後的雜湊值
- 無法透過手動設定 localStorage 來繞過登入驗證
- 使用密鑰混合加密，增加破解難度
- 每日自動過期，限制 token 有效時間

## 瀏覽器支援

- Chrome (推薦)
- Firefox
- Safari
- Edge

需要支援以下功能的現代瀏覽器:

- localStorage (資料儲存)
- Web Crypto API (認證加密)

## 授權

MIT License

## 作者

Built with Claude Code
