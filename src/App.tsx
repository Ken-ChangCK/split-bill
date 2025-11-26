import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MemberManagement from '@/components/MemberManagement'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import SettlementResult from '@/components/SettlementResult'
import ChannelGate from '@/components/ChannelGate'
import ChannelHeader from '@/components/ChannelHeader'
import { Channel } from '@/types/channel'
import { getChannel } from '@/api/channel'

interface Expense {
  id: number
  itemName: string
  amount: number
  payer: string
  participants: string[]
}

function App() {
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('members')
  const [members, setMembers] = useState<string[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

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
      }

      setIsLoading(false)
    }

    checkChannel()
  }, [])

  // 從 localStorage 載入舊資料（向下相容）
  useEffect(() => {
    // 只在沒有頻道時載入舊資料
    if (!currentChannel) {
      const savedMembers = localStorage.getItem('splitBillMembers')
      const savedExpenses = localStorage.getItem('splitBillExpenses')

      if (savedMembers) {
        try {
          setMembers(JSON.parse(savedMembers))
        } catch (error) {
          console.error('Failed to parse members from localStorage', error)
        }
      }

      if (savedExpenses) {
        try {
          setExpenses(JSON.parse(savedExpenses))
        } catch (error) {
          console.error('Failed to parse expenses from localStorage', error)
        }
      }
    }
  }, [currentChannel])

  // 儲存資料到 localStorage（向下相容，後續階段會改用 API）
  useEffect(() => {
    if (!currentChannel) {
      localStorage.setItem('splitBillMembers', JSON.stringify(members))
    }
  }, [members, currentChannel])

  useEffect(() => {
    if (!currentChannel) {
      localStorage.setItem('splitBillExpenses', JSON.stringify(expenses))
    }
  }, [expenses, currentChannel])

  const handleAddExpense = (expense: Expense) => {
    setExpenses([...expenses, expense])
  }

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  const handleUpdateExpense = (id: number, updatedExpense: Expense) => {
    setExpenses(expenses.map(expense =>
      expense.id === id ? updatedExpense : expense
    ))
  }

  const handleSwitchToRecords = () => {
    setActiveTab('records')
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">載入中...</div>
        </div>
      </div>
    )
  }

  // 如果沒有頻道，顯示 ChannelGate
  if (!currentChannel) {
    return <ChannelGate onChannelJoined={handleChannelJoined} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
              onExpenseAdded={refreshChannel}
              onSwitchToRecords={handleSwitchToRecords}
            />
          </TabsContent>

          <TabsContent value="records">
            <ExpenseList
              accessKey={currentChannel.accessKey}
              expenses={expenses}
              members={members}
              onExpensesUpdated={refreshChannel}
            />
          </TabsContent>

          <TabsContent value="settlement">
            <SettlementResult members={members} expenses={expenses} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>頻道資料會自動同步到雲端</p>
        </div>
      </div>
    </div>
  )
}

export default App
