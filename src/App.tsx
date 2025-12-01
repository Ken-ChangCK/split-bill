import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import MemberManagement from '@/components/MemberManagement'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import SettlementResult from '@/components/SettlementResult'
import ChannelGate from '@/components/ChannelGate'
import ChannelHeader from '@/components/ChannelHeader'
import InteractiveBackground from '@/components/InteractiveBackground'
import { ItemizedExpenseManager } from '@/components/itemized/ItemizedExpenseManager'
import { Channel, Expense } from '@/types/channel'
import { getChannel, createChannel } from '@/api/channel'
import { updateMembers } from '@/api/members'
import { addExpense } from '@/api/expenses'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft } from 'lucide-react'

function App() {
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members')
  const [members, setMembers] = useState<string[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showMigrationDialog, setShowMigrationDialog] = useState(false)
  const [migrationData, setMigrationData] = useState<{ members: string[], expenses: Expense[] } | null>(null)
  const [migrationChannelName, setMigrationChannelName] = useState('我的分帳')
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationError, setMigrationError] = useState('')

  // 明細模式頁面狀態
  const [viewingItemizedExpense, setViewingItemizedExpense] = useState<number | null>(null)

  // 啟動時檢查 localStorage 中的頻道金鑰
  useEffect(() => {
    const checkChannel = async () => {
      const storedKey = localStorage.getItem('currentChannelKey')

      // 如果有金鑰，向後端驗證並取得頻道資料
      if (storedKey) {
        try {
          const response = await getChannel(storedKey)
          if (response.success && response.channel) {
            setCurrentChannel(response.channel)
            // 從頻道資料載入成員和支出
            setMembers(response.channel.members)
            setExpenses(response.channel.expenses)
          } else {
            // 金鑰無效，清除
            localStorage.removeItem('currentChannelKey')
          }
        } catch (error) {
          console.error('Failed to load channel:', error)
          localStorage.removeItem('currentChannelKey')
        }
      } else {
        // 如果沒有頻道金鑰，檢查是否有舊資料
        const oldMembers = localStorage.getItem('splitBillMembers')
        const oldExpenses = localStorage.getItem('splitBillExpenses')

        if (oldMembers || oldExpenses) {
          // 偵測到舊資料，顯示遷移對話框
          const parsedMembers = oldMembers ? JSON.parse(oldMembers) : []
          const parsedExpenses = oldExpenses ? JSON.parse(oldExpenses) : []

          if (parsedMembers.length > 0 || parsedExpenses.length > 0) {
            setMigrationData({ members: parsedMembers, expenses: parsedExpenses })
            setShowMigrationDialog(true)
          }
        }
      }

      setIsLoading(false)
    }

    checkChannel()
  }, [])


  const handleSwitchToRecords = () => {
    setActiveTab('records')
  }

  // 處理資料遷移
  const handleMigration = async () => {
    if (!migrationData) return

    setIsMigrating(true)
    setMigrationError('')

    try {
      // 1. 建立新頻道
      const createResponse = await createChannel(migrationChannelName.trim() || '我的分帳')

      if (!createResponse.success || !createResponse.channel) {
        setMigrationError(createResponse.message || '建立頻道失敗')
        setIsMigrating(false)
        return
      }

      const newChannel = createResponse.channel

      // 2. 匯入成員資料
      if (migrationData.members.length > 0) {
        const membersResponse = await updateMembers(newChannel.accessKey, migrationData.members)
        if (!membersResponse.success) {
          setMigrationError('匯入成員失敗：' + membersResponse.message)
          setIsMigrating(false)
          return
        }
      }

      // 3. 匯入支出資料
      for (const expense of migrationData.expenses) {
        const expenseData = {
          itemName: expense.itemName,
          amount: expense.amount,
          payer: expense.payer,
          participants: expense.participants
        }
        const expenseResponse = await addExpense(newChannel.accessKey, expenseData)
        if (!expenseResponse.success) {
          setMigrationError('匯入支出失敗：' + expenseResponse.message)
          setIsMigrating(false)
          return
        }
      }

      // 4. 清除舊資料
      localStorage.removeItem('splitBillMembers')
      localStorage.removeItem('splitBillExpenses')

      // 5. 儲存新的頻道金鑰
      localStorage.setItem('currentChannelKey', newChannel.accessKey)

      // 6. 重新載入頻道資料
      const finalResponse = await getChannel(newChannel.accessKey)
      if (finalResponse.success && finalResponse.channel) {
        setCurrentChannel(finalResponse.channel)
        setMembers(finalResponse.channel.members)
        setExpenses(finalResponse.channel.expenses)
      }

      // 7. 關閉遷移對話框
      setShowMigrationDialog(false)
      setMigrationData(null)
      setIsMigrating(false)
    } catch (error) {
      console.error('Migration error:', error)
      setMigrationError('遷移過程中發生錯誤')
      setIsMigrating(false)
    }
  }

  // 取消遷移，清除舊資料
  const handleCancelMigration = () => {
    localStorage.removeItem('splitBillMembers')
    localStorage.removeItem('splitBillExpenses')
    setShowMigrationDialog(false)
    setMigrationData(null)
  }

  // 加入頻道成功
  const handleChannelJoined = (channel: Channel) => {
    setCurrentChannel(channel)
    // 從頻道資料載入成員和支出
    setMembers(channel.members)
    setExpenses(channel.expenses)
  }

  // 登出
  const handleLogout = () => {
    setCurrentChannel(null)
    setMembers([])
    setExpenses([])
  }

  // 頻道被刪除
  const handleChannelDeleted = () => {
    setCurrentChannel(null)
    setMembers([])
    setExpenses([])
  }

  // 重新載入頻道資料
  const refreshChannel = async () => {
    if (!currentChannel) return

    try {
      const response = await getChannel(currentChannel.accessKey)
      if (response.success && response.channel) {
        setCurrentChannel(response.channel)
        setMembers(response.channel.members)
        setExpenses(response.channel.expenses)
      }
    } catch (error) {
      console.error('Failed to refresh channel:', error)
    }
  }

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center relative">
        <InteractiveBackground />
        <div className="text-center relative z-10">
          <div className="text-xl text-gray-300">載入中...</div>
        </div>
      </div>
    )
  }

  // 顯示遷移對話框
  if (showMigrationDialog && migrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4 relative">
        <InteractiveBackground />
        <Card className="max-w-2xl w-full relative z-10 bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>偵測到舊資料</CardTitle>
            <CardDescription>
              我們發現您有舊版本的分帳資料，是否要匯入到新的頻道系統？
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>找到的資料：</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    {migrationData.members.length > 0 && (
                      <li>{migrationData.members.length} 位成員：{migrationData.members.join('、')}</li>
                    )}
                    {migrationData.expenses.length > 0 && (
                      <li>{migrationData.expenses.length} 筆支出記錄</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div>
              <label className="text-sm font-medium mb-2 block">新頻道名稱</label>
              <Input
                value={migrationChannelName}
                onChange={(e) => setMigrationChannelName(e.target.value)}
                placeholder="例如：我的分帳"
                disabled={isMigrating}
              />
            </div>

            {migrationError && (
              <Alert variant="destructive">
                <AlertDescription>{migrationError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleMigration}
                className="flex-1"
                disabled={isMigrating}
              >
                {isMigrating ? '匯入中...' : '匯入到新頻道'}
              </Button>
              <Button
                onClick={handleCancelMigration}
                variant="outline"
                className="flex-1"
                disabled={isMigrating}
              >
                不要匯入（清除舊資料）
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              匯入後，舊資料將被清除，所有資料將儲存到新的頻道系統中。
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 如果沒有頻道，顯示 ChannelGate
  if (!currentChannel) {
    return <ChannelGate onChannelJoined={handleChannelJoined} />
  }

  // 如果正在查看明細模式支出
  if (viewingItemizedExpense !== null) {
    const expense = expenses.find(e => e.id === viewingItemizedExpense)

    if (!expense || expense.mode !== 'itemized') {
      // 如果找不到支出或不是明細模式，返回列表
      setViewingItemizedExpense(null)
      return null
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-8 px-4 relative">
        <InteractiveBackground />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* 返回按鈕 */}
          <Button
            onClick={() => setViewingItemizedExpense(null)}
            variant="ghost"
            className="mb-4 gap-2 text-white hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            返回支出列表
          </Button>

          {/* 明細模式管理頁面 */}
          <ItemizedExpenseManager
            accessKey={currentChannel.accessKey}
            expenseId={expense.id}
            expenseName={expense.itemName}
            totalAmount={expense.amount}
            payer={expense.payer}
            members={members}
            items={expense.items || []}
            remainderHandling={expense.remainderHandling || 'payer'}
            createdAt={expense.createdAt}
            onRefresh={refreshChannel}
            onComplete={() => {
              setViewingItemizedExpense(null)
              setActiveTab('settlement')
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-8 px-4 relative">
      {/* 互動背景特效 */}
      <InteractiveBackground />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Channel Header */}
        <ChannelHeader
          channel={currentChannel}
          onLogout={handleLogout}
          onChannelDeleted={handleChannelDeleted}
        />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="members">
              <span className="mr-1">👥</span>
              成員管理
            </TabsTrigger>
            <TabsTrigger value="add">
              <span className="mr-1">➕</span>
              新增支出
            </TabsTrigger>
            <TabsTrigger value="records">
              <span className="mr-1">📋</span>
              支出記錄
            </TabsTrigger>
            <TabsTrigger value="settlement">
              <span className="mr-1">🧮</span>
              結算結果
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <MemberManagement
              accessKey={currentChannel.accessKey}
              members={members}
              onMembersUpdated={refreshChannel}
            />
          </TabsContent>

          <TabsContent value="add">
            <ExpenseForm
              accessKey={currentChannel.accessKey}
              members={members}
              onExpenseAdded={(expenseId, mode) => {
                refreshChannel()
                // 如果是明細模式，導航到品項管理頁面
                if (mode === 'itemized' && expenseId) {
                  setViewingItemizedExpense(expenseId)
                }
              }}
              onSwitchToRecords={handleSwitchToRecords}
            />
          </TabsContent>

          <TabsContent value="records">
            <ExpenseList
              accessKey={currentChannel.accessKey}
              expenses={expenses}
              members={members}
              onExpensesUpdated={refreshChannel}
              onViewItemizedExpense={setViewingItemizedExpense}
            />
          </TabsContent>

          <TabsContent value="settlement">
            <SettlementResult members={members} expenses={expenses} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-400">
          <p>頻道資料會自動同步到雲端</p>
        </div>
      </div>
    </div>
  )
}

export default App
