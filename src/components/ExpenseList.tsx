import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Edit2, Save, X } from 'lucide-react'

interface Expense {
  id: number
  itemName: string
  amount: number
  payer: string
  participants: string[]
}

interface ExpenseListProps {
  expenses: Expense[]
  members: string[]
  onDeleteExpense: (id: number) => void
  onUpdateExpense: (id: number, updatedExpense: Expense) => void
}

export default function ExpenseList({ expenses, members, onDeleteExpense, onUpdateExpense }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Expense | null>(null)
  const [error, setError] = useState('')

  const handleDelete = (expense: Expense) => {
    if (window.confirm(`確定要刪除支出「${expense.itemName}」嗎?`)) {
      onDeleteExpense(expense.id)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setEditForm({ ...expense })
    setError('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setError('')
  }

  const handleSaveEdit = () => {
    if (!editForm) return

    // 驗證
    if (!editForm.itemName.trim()) {
      setError('請輸入項目名稱')
      return
    }

    if (!editForm.amount || editForm.amount <= 0) {
      setError('請輸入有效的金額 (必須大於 0)')
      return
    }

    if (!editForm.payer) {
      setError('請選擇付款人')
      return
    }

    if (editForm.participants.length === 0) {
      setError('請至少選擇一位參與者')
      return
    }

    onUpdateExpense(editForm.id, editForm)
    setEditingId(null)
    setEditForm(null)
    setError('')
  }

  const handleParticipantsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editForm) return
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setEditForm({ ...editForm, participants: selectedOptions })
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>支出記錄</CardTitle>
        <CardDescription>
          共 {expenses.length} 筆支出，總金額 ${Math.round(totalAmount)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <Alert>
            <AlertDescription>尚無支出記錄</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => (
              <Card key={expense.id} className="bg-muted/50">
                <CardContent className="pt-6">
                  {editingId === expense.id && editForm ? (
                    // 編輯模式
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">項目名稱</label>
                        <Input
                          value={editForm.itemName}
                          onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">金額</label>
                        <Input
                          type="number"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="1"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">付款人</label>
                        <Select
                          value={editForm.payer}
                          onChange={(e) => setEditForm({ ...editForm, payer: e.target.value })}
                        >
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
                          value={editForm.participants}
                          onChange={handleParticipantsChange}
                          className="min-h-[120px]"
                        >
                          {members.map((member) => (
                            <option key={member} value={member}>
                              {member}
                            </option>
                          ))}
                        </Select>
                        {editForm.participants.length > 0 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            已選擇 {editForm.participants.length} 位: {editForm.participants.join('、')}
                          </div>
                        )}
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          儲存
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // 顯示模式
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{expense.itemName}</h3>
                          <span className="text-2xl font-bold text-primary">
                            ${Math.round(expense.amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">付款人:</span>
                          <Badge variant="default">{expense.payer}</Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">參與者:</span>
                          <div className="flex flex-wrap gap-1">
                            {expense.participants.map((participant) => (
                              <Badge key={participant} variant="secondary">
                                {participant}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          每人應付: ${Math.round(expense.amount / expense.participants.length)}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(expense)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
