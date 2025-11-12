import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MemberManagement from '@/components/MemberManagement'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import SettlementResult from '@/components/SettlementResult'

interface Expense {
  id: number
  itemName: string
  amount: number
  payer: string
  participants: string[]
}

function App() {
  const [activeTab, setActiveTab] = useState('members')
  const [members, setMembers] = useState<string[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])

  // 從 localStorage 載入資料
  useEffect(() => {
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
  }, [])

  // 儲存資料到 localStorage
  useEffect(() => {
    localStorage.setItem('splitBillMembers', JSON.stringify(members))
  }, [members])

  useEffect(() => {
    localStorage.setItem('splitBillExpenses', JSON.stringify(expenses))
  }, [expenses])

  const handleAddExpense = (expense: Expense) => {
    setExpenses([...expenses, expense])
  }

  const handleDeleteExpense = (id: number) => {
    setExpenses(expenses.filter(expense => expense.id !== id))
  }

  const handleSwitchToRecords = () => {
    setActiveTab('records')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            簡易分帳系統
          </h1>
          <p className="text-gray-600">輕鬆管理分帳，清楚明白每筆開銷</p>
        </div>

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
            <MemberManagement members={members} setMembers={setMembers} />
          </TabsContent>

          <TabsContent value="add">
            <ExpenseForm
              members={members}
              onAddExpense={handleAddExpense}
              onSwitchToRecords={handleSwitchToRecords}
            />
          </TabsContent>

          <TabsContent value="records">
            <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
          </TabsContent>

          <TabsContent value="settlement">
            <SettlementResult members={members} expenses={expenses} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>資料會自動儲存在瀏覽器本地</p>
        </div>
      </div>
    </div>
  )
}

export default App
