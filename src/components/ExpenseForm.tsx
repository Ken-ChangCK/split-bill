import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus } from 'lucide-react'

interface Expense {
  id: number
  itemName: string
  amount: number
  payer: string
  participants: string[]
}

interface ExpenseFormProps {
  members: string[]
  onAddExpense: (expense: Expense) => void
  onSwitchToRecords: () => void
}

export default function ExpenseForm({ members, onAddExpense, onSwitchToRecords }: ExpenseFormProps) {
  const [itemName, setItemName] = useState('')
  const [amount, setAmount] = useState('')
  const [payer, setPayer] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [error, setError] = useState('')

  const handleSubmit = () => {
    // 驗證
    if (!itemName.trim()) {
      setError('請輸入項目名稱')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('請輸入有效的金額 (必須大於 0)')
      return
    }

    if (!payer) {
      setError('請選擇付款人')
      return
    }

    if (participants.length === 0) {
      setError('請至少選擇一位參與者')
      return
    }

    // 建立支出記錄
    const expense: Expense = {
      id: Date.now(),
      itemName: itemName.trim(),
      amount: parseFloat(amount),
      payer,
      participants
    }

    onAddExpense(expense)

    // 清空表單
    setItemName('')
    setAmount('')
    setPayer('')
    setParticipants([])
    setError('')

    // 自動切換到支出記錄 Tab
    onSwitchToRecords()
  }

  const handleParticipantsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setParticipants(selectedOptions)
  }

  if (members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>新增支出</CardTitle>
          <CardDescription>記錄一筆新的支出</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              請先到「成員管理」頁面新增成員
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新增支出</CardTitle>
        <CardDescription>記錄一筆新的支出</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">項目名稱</label>
          <Input
            placeholder="例如：晚餐、電影票"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">金額</label>
          <Input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">付款人</label>
          <Select value={payer} onChange={(e) => setPayer(e.target.value)}>
            <option value="">請選擇付款人</option>
            {members.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            參與分攤者 (可多選，按住 Ctrl/Cmd 選擇多個)
          </label>
          <Select
            multiple
            value={participants}
            onChange={handleParticipantsChange}
            className="min-h-[120px]"
          >
            {members.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </Select>
          {participants.length > 0 && (
            <div className="text-sm text-muted-foreground mt-2">
              已選擇 {participants.length} 位: {participants.join('、')}
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSubmit} className="w-full flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          新增支出
        </Button>
      </CardContent>
    </Card>
  )
}
