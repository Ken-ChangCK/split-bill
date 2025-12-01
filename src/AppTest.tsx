import { UserIdentityTest } from '@/components/test/UserIdentityTest';
import { AddItemDialogTest } from '@/components/test/AddItemDialogTest';

/**
 * 測試應用程式入口
 * 支援多個測試頁面，透過 URL 參數切換
 *
 * 使用方式：
 * - ?test=identity - Phase 2.4 身份選擇測試
 * - ?test=additem - Phase 3.1 新增品項對話框測試
 */
function AppTest() {
  const urlParams = new URLSearchParams(window.location.search);
  const testType = urlParams.get('test');

  switch (testType) {
    case 'identity':
      return <UserIdentityTest />;
    case 'additem':
      return <AddItemDialogTest />;
    default:
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 max-w-2xl text-white">
            <h1 className="text-2xl font-bold mb-4">測試頁面選單</h1>
            <p className="text-gray-300 mb-6">請選擇要測試的功能：</p>
            <div className="space-y-3">
              <a
                href="?test=identity"
                className="block p-4 bg-slate-900 hover:bg-slate-700 rounded-lg transition"
              >
                <p className="font-semibold">Phase 2.4 - 身份選擇測試</p>
                <p className="text-sm text-gray-400">測試 useCurrentUser Hook、UserSelector、UserSwitcher</p>
              </a>
              <a
                href="?test=additem"
                className="block p-4 bg-slate-900 hover:bg-slate-700 rounded-lg transition"
              >
                <p className="font-semibold">Phase 3.1 - 新增品項對話框測試</p>
                <p className="text-sm text-gray-400">測試 AddItemDialog 組件</p>
              </a>
            </div>
          </div>
        </div>
      );
  }
}

export default AppTest;
