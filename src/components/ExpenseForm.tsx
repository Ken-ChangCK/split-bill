import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Plus, Loader2, Users, Receipt } from 'lucide-react'
import ReceiptUpload from '@/components/ReceiptUpload'
import { ReceiptData } from '@/services/geminiService'
import { addExpense } from '@/api/expenses'

interface ExpenseFormProps {
  accessKey: string
  members: string[]
  onExpenseAdded: (expenseId?: number, mode?: 'split' | 'itemized') => void
  onSwitchToRecords: () => void
}

export default function ExpenseForm({ accessKey, members, onExpenseAdded, onSwitchToRecords }: ExpenseFormProps) {
  const [mode, setMode] = useState<'split' | 'itemized'>('split')
  const [itemName, setItemName] = useState('')
  const [amount, setAmount] = useState('')
  const [payer, setPayer] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
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

    // 平分模式才需要驗證參與者
    if (mode === 'split' && participants.length === 0) {
      setError('請至少選擇一位參與者')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 建立支出記錄（不包含 id，讓後端生成）
      const expenseData: any = {
        itemName: itemName.trim(),
        amount: parseFloat(amount),
        payer,
        mode
      }

      // 平分模式才需要 participants
      if (mode === 'split') {
        expenseData.participants = participants
      } else {
        // 明細模式需要初始化 items 和 remainderHandling
        expenseData.items = []
        expenseData.remainderHandling = 'payer'
      }

      const response = await addExpense(accessKey, expenseData)

      if (response.success) {
        const newExpenseId = response.expense?.id

        // 清空表單
        setItemName('')
        setAmount('')
        setPayer('')
        setParticipants([])

        // 通知父元件更新資料
        onExpenseAdded(newExpenseId, mode)

        // 平分模式：自動切換到支出記錄 Tab
        // 明細模式：由父元件處理導航到品項管理頁面
        if (mode === 'split') {
          onSwitchToRecords()
        }
      } else {
        setError(response.message || '新增支出失敗')
      }
    } catch (error) {
      setError('無法連接到伺服器，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleParticipantsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setParticipants(selectedOptions)
  }

  const handleReceiptAnalyzed = (data: ReceiptData) => {
    // 自動填入發票識別的資訊
    if (data.storeName && data.date) {
      setItemName(`${data.storeName} (${data.date})`)
    } else if (data.storeName) {
      setItemName(data.storeName)
    }

    if (data.amount > 0) {
      setAmount(data.amount.toString())
    }

    setError('')
  }

  if (members?.length === 0) {
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
        <ReceiptUpload onReceiptAnalyzed={handleReceiptAnalyzed} />

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            或手動輸入支出資訊
          </p>
        </div>

        {/* 分攤方式選擇 */}
        <div>
          <label className="text-sm font-medium mb-3 block">分攤方式</label>
          <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'split' | 'itemized')} disabled={isLoading}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="split" id="mode-split" />
              <Label htmlFor="mode-split" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <div>
                    <div className="font-medium">平分模式</div>
                    <div className="text-xs text-muted-foreground">選擇參與者，金額平均分攤</div>
                  </div>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="itemized" id="mode-itemized" />
              <Label htmlFor="mode-itemized" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  <div>
                    <div className="font-medium">明細模式</div>
                    <div className="text-xs text-muted-foreground">適合居酒屋等場景，各付各的</div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">項目名稱</label>
          <Input
            placeholder="例如：晚餐、電影票"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">付款人</label>
          <Select value={payer} onChange={(e) => setPayer(e.target.value)} disabled={isLoading}>
            <option value="">請選擇付款人</option>
            {members?.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </Select>
        </div>

        {/* 只有平分模式才顯示參與者選擇 */}
        {mode === 'split' && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              參與分攤者 (可多選，按住 Ctrl/Cmd 選擇多個)
            </label>
            <Select
              multiple
              value={participants}
              onChange={handleParticipantsChange}
              className="min-h-[120px]"
              disabled={isLoading}
            >
              {members?.map((member) => (
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
        )}

        {/* 明細模式的說明 */}
        {mode === 'itemized' && (
          <Alert>
            <AlertDescription>
              建立後將進入品項管理頁面，可新增品項並讓成員認領
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {isLoading ? '新增中...' : '新增支出'}
        </Button>
      </CardContent>
    </Card>
  )
}
