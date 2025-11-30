# Hooks

這個目錄包含專案中使用的自定義 React Hooks。

## useCurrentUser

身份管理 Hook，用於管理當前使用者身份（無登入系統）。

### 功能特性

- ✅ 使用 localStorage 儲存每個頻道的當前使用者
- ✅ Key 格式：`currentUser_${channelId}`
- ✅ 提供選擇、切換、清除功能
- ✅ 支援多頻道（不同頻道記住不同使用者）
- ✅ 自動處理錯誤（localStorage 存取失敗）
- ✅ TypeScript 型別支援

### API

```typescript
const {
  currentUser,       // string | null - 當前使用者名稱
  setCurrentUser,    // (userName: string) => void - 設定使用者
  clearCurrentUser,  // () => void - 清除使用者
  switchUser,        // (userName: string) => void - 切換使用者
  isUserSelected,    // boolean - 是否已選擇使用者
} = useCurrentUser(channelId);
```

### 基本使用

```typescript
import { useCurrentUser } from '@/hooks';

function MyComponent({ channelId }: { channelId: string }) {
  const { currentUser, setCurrentUser, clearCurrentUser } = useCurrentUser(channelId);

  return (
    <div>
      <p>當前使用者: {currentUser || '未選擇'}</p>
      <button onClick={() => setCurrentUser('小明')}>選擇小明</button>
      <button onClick={clearCurrentUser}>清除</button>
    </div>
  );
}
```

### 進階範例

請參考 `useCurrentUser.example.tsx` 檔案，包含以下範例：

1. **基本使用** - 設定和清除使用者
2. **使用者選擇器** - 首次選擇身份的介面
3. **使用者切換器** - 切換身份的介面
4. **品項認領** - 在認領操作中使用當前使用者

### 注意事項

- 此 Hook 使用 localStorage，因此只適用於瀏覽器環境
- 每個頻道的使用者資訊是獨立儲存的
- 如果 localStorage 不可用（如隱私模式），會優雅地降級（僅在記憶體中保存）
- 切換頻道時會自動載入該頻道的使用者設定
