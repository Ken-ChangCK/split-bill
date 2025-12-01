import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserSelector } from '@/components/itemized/UserSelector';
import { UserSwitcher } from '@/components/itemized/UserSwitcher';
import { useCurrentUser } from '@/hooks';
import { Trash2, Info } from 'lucide-react';

/**
 * 身份選擇功能整合測試頁面
 *
 * 測試項目：
 * 1. 首次進入（無 localStorage）
 * 2. 切換使用者
 * 3. 跨頻道（不同頻道記住不同使用者）
 */
export function UserIdentityTest() {
  // 測試用的頻道資料
  const [testChannels] = useState([
    {
      id: 'test-channel-1',
      name: '測試頻道 A',
      members: ['小明', '小華', '小美', '小強'],
    },
    {
      id: 'test-channel-2',
      name: '測試頻道 B',
      members: ['Alice', 'Bob', 'Charlie', 'David'],
    },
  ]);

  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const currentChannel = testChannels[currentChannelIndex];

  const { currentUser, isUserSelected, clearCurrentUser } = useCurrentUser(currentChannel.id);

  const [testResults, setTestResults] = useState<string[]>([]);

  // 監聽使用者變更
  useEffect(() => {
    const message = `頻道 ${currentChannel.name} 的當前使用者：${currentUser || '未選擇'}`;
    console.log(message);
  }, [currentUser, currentChannel.name]);

  // 清除所有測試資料
  const clearAllData = () => {
    testChannels.forEach(channel => {
      localStorage.removeItem(`currentUser_${channel.id}`);
    });
    window.location.reload();
  };

  // 清除當前頻道資料
  const clearCurrentChannelData = () => {
    clearCurrentUser();
    addTestResult(`✅ 已清除頻道 ${currentChannel.name} 的使用者資料`);
  };

  // 切換頻道
  const switchChannel = (index: number) => {
    setCurrentChannelIndex(index);
    addTestResult(`🔄 切換到頻道：${testChannels[index].name}`);
  };

  // 記錄測試結果
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // 使用者選擇回調
  const handleUserSelected = (userName: string) => {
    addTestResult(`✅ 測試 1 通過：首次選擇使用者 "${userName}"`);
  };

  // 使用者切換回調
  const handleUserChanged = (userName: string) => {
    addTestResult(`✅ 測試 2 通過：切換使用者到 "${userName}"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 標題 */}
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle className="text-2xl">身份選擇功能整合測試</CardTitle>
            <CardDescription className="text-gray-300">
              測試 Phase 2.4 的身份選擇功能整合
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 測試說明 */}
        <Card className="bg-blue-900/30 border-blue-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Info className="h-5 w-5" />
              測試指南
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200 space-y-2">
            <p><strong>測試 1：首次進入（無 localStorage）</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>點擊「清除當前頻道資料」按鈕</li>
              <li>應該看到 UserSelector 組件</li>
              <li>選擇一個使用者並確認</li>
              <li>應該看到 UserSwitcher 組件顯示已選擇的使用者</li>
            </ul>

            <p className="pt-4"><strong>測試 2：切換使用者</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>在 UserSwitcher 中點擊「切換身份」</li>
              <li>選擇另一個使用者並確認</li>
              <li>檢查 UserSwitcher 是否顯示新的使用者</li>
            </ul>

            <p className="pt-4"><strong>測試 3：跨頻道（不同頻道記住不同使用者）</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>在頻道 A 選擇一個使用者</li>
              <li>點擊「切換到頻道 B」</li>
              <li>在頻道 B 選擇另一個使用者</li>
              <li>切換回頻道 A，應該還是原來選擇的使用者</li>
              <li>切換回頻道 B，應該還是頻道 B 選擇的使用者</li>
            </ul>
          </CardContent>
        </Card>

        {/* 控制面板 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">控制面板</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 頻道切換 */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                當前測試頻道：{currentChannel.name}
              </label>
              <div className="flex gap-2">
                {testChannels.map((channel, index) => (
                  <Button
                    key={channel.id}
                    onClick={() => switchChannel(index)}
                    variant={currentChannelIndex === index ? 'default' : 'outline'}
                    size="sm"
                  >
                    {channel.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-2">
              <Button
                onClick={clearCurrentChannelData}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                清除當前頻道資料
              </Button>
              <Button
                onClick={clearAllData}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                清除所有測試資料並重新載入
              </Button>
            </div>

            {/* localStorage 狀態 */}
            <Alert>
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <p><strong>localStorage 狀態：</strong></p>
                  {testChannels.map(channel => {
                    const storedUser = localStorage.getItem(`currentUser_${channel.id}`);
                    return (
                      <p key={channel.id}>
                        • {channel.name}: {storedUser || '無資料'}
                      </p>
                    );
                  })}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 測試區域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側：身份選擇/切換組件 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              頻道：{currentChannel.name}
            </h3>

            {!isUserSelected ? (
              <UserSelector
                channelId={currentChannel.id}
                members={currentChannel.members}
                onUserSelected={handleUserSelected}
              />
            ) : (
              <UserSwitcher
                channelId={currentChannel.id}
                members={currentChannel.members}
                onUserChanged={handleUserChanged}
                showClaimedTotal={true}
                claimedTotal={0}
              />
            )}
          </div>

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

        {/* 當前狀態摘要 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">當前狀態摘要</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">當前頻道</p>
                <p className="font-semibold">{currentChannel.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">當前使用者</p>
                <p className="font-semibold">{currentUser || '未選擇'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">使用者選擇狀態</p>
                <p className="font-semibold">{isUserSelected ? '已選擇' : '未選擇'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">頻道成員數</p>
                <p className="font-semibold">{currentChannel.members.length} 人</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
