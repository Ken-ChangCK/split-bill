import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AddItemDialog } from '@/components/itemized/AddItemDialog';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface TestItem {
  id: string;
  name: string;
  price: number;
  timestamp: Date;
}

/**
 * AddItemDialog 測試頁面
 *
 * 用於測試新增品項對話框的功能
 */
export function AddItemDialogTest() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState<TestItem[]>([]);
  const [testResults, setTestResults] = useState<string[]>([]);

  // 處理品項新增
  const handleItemAdded = async (item: { name: string; price: number }) => {
    addTestResult(`📝 嘗試新增品項：${item.name} - ¥${item.price}`);

    // 模擬 API 呼叫
    setIsLoading(true);

    try {
      // 模擬網路延遲
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 生成 ID 並新增品項
      const newItem: TestItem = {
        id: Date.now().toString(),
        name: item.name,
        price: item.price,
        timestamp: new Date(),
      };

      setItems(prev => [...prev, newItem]);
      addTestResult(`✅ 品項新增成功：${item.name} - ¥${item.price}`);

      // 關閉對話框
      setIsDialogOpen(false);
    } catch (error) {
      addTestResult(`❌ 品項新增失敗：${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 刪除品項
  const handleDeleteItem = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setItems(prev => prev.filter(i => i.id !== id));
      addTestResult(`🗑️ 刪除品項：${item.name}`);
    }
  };

  // 清除所有品項
  const handleClearAll = () => {
    setItems([]);
    addTestResult('🗑️ 清除所有品項');
  };

  // 記錄測試結果
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // 計算總額
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 標題 */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">AddItemDialog 功能測試</CardTitle>
            <CardDescription className="text-gray-300">
              測試 Phase 3.1 的新增品項對話框元件
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 測試說明 */}
        <Card className="bg-blue-900/30 border-blue-700">
          <CardHeader>
            <CardTitle className="text-white">測試項目</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200 space-y-2">
            <p><strong>功能驗證：</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>✅ 品項名稱輸入（最多 50 字元）</li>
              <li>✅ 金額輸入（正數，最多兩位小數）</li>
              <li>✅ 表單驗證（必填、格式、範圍）</li>
              <li>✅ 錯誤訊息顯示</li>
              <li>✅ Loading 狀態</li>
              <li>✅ Enter 鍵提交</li>
              <li>✅ 對話框開啟/關閉</li>
            </ul>
          </CardContent>
        </Card>

        {/* 控制面板 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">控制面板</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                開啟新增品項對話框
              </Button>

              {items.length > 0 && (
                <Button
                  onClick={handleClearAll}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  清除所有品項
                </Button>
              )}
            </div>

            {/* 統計資訊 */}
            <Alert>
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <p><strong>統計資訊：</strong></p>
                  <p>• 品項數量：{items.length} 個</p>
                  <p>• 總金額：¥{totalAmount.toFixed(2)}</p>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 測試區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側：品項列表 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">已新增的品項</CardTitle>
              <CardDescription className="text-gray-300">
                透過對話框新增的品項會顯示在這裡
              </CardDescription>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">尚無品項</p>
                  <p className="text-sm">點擊上方按鈕開始新增品項</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-900 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-sm text-gray-400">
                            ¥{item.price.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 右側：測試結果日誌 */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">測試結果日誌</CardTitle>
              <CardDescription className="text-gray-300">
                操作記錄和測試結果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-400 text-sm">尚無測試記錄...</p>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <p key={index} className="text-sm text-gray-300 font-mono">
                        {result}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              {testResults.length > 0 && (
                <Button
                  onClick={() => setTestResults([])}
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                >
                  清除日誌
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 驗證清單 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">功能驗證清單</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200">
            <div className="space-y-2">
              <p className="font-semibold mb-3">請依序測試以下項目：</p>
              <div className="space-y-2 text-sm">
                <p>□ 1. 開啟對話框，檢查 UI 是否正確顯示</p>
                <p>□ 2. 嘗試提交空表單，應顯示「請輸入品項名稱」錯誤</p>
                <p>□ 3. 輸入品項名稱但不輸入金額，應顯示「請輸入金額」錯誤</p>
                <p>□ 4. 輸入負數金額，應顯示「金額必須大於 0」錯誤</p>
                <p>□ 5. 輸入超過 50 字元的品項名稱，應顯示字元限制錯誤</p>
                <p>□ 6. 輸入超過兩位小數的金額（例如 10.123），應顯示小數位數錯誤</p>
                <p>□ 7. 輸入正確資料並提交，品項應出現在左側列表</p>
                <p>□ 8. 在品項名稱欄位按 Enter，應觸發提交</p>
                <p>□ 9. 提交時應顯示 Loading 狀態（按鈕文字變為「新增中...」）</p>
                <p>□ 10. 關閉並重新開啟對話框，表單應該被清空</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AddItemDialog 組件 */}
      <AddItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onItemAdded={handleItemAdded}
        isLoading={isLoading}
      />
    </div>
  );
}
