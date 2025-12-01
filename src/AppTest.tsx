import { UserIdentityTest } from '@/components/test/UserIdentityTest';

/**
 * 測試應用程式入口
 * 用於 Phase 2.4 的身份選擇功能整合測試
 *
 * 使用方式：
 * 1. 將 main.tsx 中的 import App 改為 import AppTest
 * 2. 或者建立一個新的測試入口點
 */
function AppTest() {
  return <UserIdentityTest />;
}

export default AppTest;
