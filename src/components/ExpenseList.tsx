import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, Edit2, Save, X, Loader2, Eye } from 'lucide-react'
import { removeExpense, updateExpense } from '@/api/expenses'
import { Expense } from '@/types/channel'

interface ExpenseListProps {
  accessKey: string
  expenses: Expense[]
  members: string[]
  onExpensesUpdated: () => void
  onViewItemizedExpense?: (expenseId: number) => void
}

export default function ExpenseList({ accessKey, expenses, members, onExpensesUpdated, onViewItemizedExpense }: ExpenseListProps) {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Expense | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async (expense: Expense) => {
    if (!window.confirm(`確定要刪除支出「${expense.itemName}」嗎?`)) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await removeExpense(accessKey, expense.id)

      if (response.success) {
        onExpensesUpdated()
      } else {
        setError(response.message || '刪除支出失敗')
      }
    } catch (error) {
      setError('無法連接到伺服器，請稍後再試')
    } finally {
      setIsLoading(false)
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

  const handleSaveEdit = async () => {
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

    if (editForm.participants?.length === 0) {
      setError('請至少選擇一位參與者')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // 更新支出（不包含 id）
      const expenseData = {
        itemName: editForm.itemName.trim(),
        amount: editForm.amount,
        payer: editForm.payer,
        participants: editForm.participants
      }

      const response = await updateExpense(accessKey, editForm.id, expenseData)

      if (response.success) {
        setEditingId(null)
        setEditForm(null)
        onExpensesUpdated()
      } else {
        setError(response.message || '更新支出失敗')
      }
    } catch (error) {
      setError('無法連接到伺服器，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  const handleParticipantsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!editForm) return
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setEditForm({ ...editForm, participants: selectedOptions })
  }

  const totalAmount = expenses?.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>支出記錄</CardTitle>
        <CardDescription>
          共 {expenses?.length ?? 0} 筆支出，總金額 ${Math.round(totalAmount)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenses?.length === 0 ? (
          <Alert className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
            <AlertDescription>尚無支出記錄</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {expenses?.map((expense, index) => (
              <Card
                key={expense.id}
                className="bg-muted/50 transition-all hover:shadow-lg hover:scale-[1.02] animate-in fade-in-50 slide-in-from-bottom-5 duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="pt-6">
                  {editingId === expense.id && editForm ? (
                    // 編輯模式
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">項目名稱</label>
                        <Input
                          value={editForm.itemName}
                          onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })}
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">付款人</label>
                        <Select
                          value={editForm.payer}
                          onChange={(e) => setEditForm({ ...editForm, payer: e.target.value })}
                          disabled={isLoading}
                        >
                          <option value="">請選擇付款人</option>
                          {members?.map((member) => (
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
                          disabled={isLoading}
                        >
                          {members?.map((member) => (
                            <option key={member} value={member}>
                              {member}
                            </option>
                          ))}
                        </Select>
                        {editForm.participants && editForm?.participants?.length > 0 && (
                          <div className="text-sm text-muted-foreground mt-2">
                            已選擇 {editForm.participants?.length ?? 0} 位: {editForm.participants?.join('、') ?? ''}
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
                          className="flex-1 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 hover:shadow-md"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 transition-transform group-hover:scale-110" />
                          )}
                          {isLoading ? '儲存中...' : '儲存'}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 transition-transform group-hover:rotate-90" />
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
                          {expense.mode === 'itemized' && (
                            <Badge variant="outline" className="ml-2">
                              📋 明細模式
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">付款人:</span>
                          <Badge variant="default">{expense.payer}</Badge>
                        </div>

                        {expense.mode === 'itemized' ? (
                          // 明細模式顯示
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">品項數量:</span>
                              <Badge variant="secondary">{expense.items?.length || 0} 個品項</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">參與人數:</span>
                              <Badge variant="secondary">{expense.participants?.length || 0} 人</Badge>
                            </div>
                          </>
                        ) : (
                          // 平均分攤模式顯示
                          <>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-muted-foreground">參與者:</span>
                              <div className="flex flex-wrap gap-1">
                                {expense.participants?.map((participant) => (
                                  <Badge key={participant} variant="secondary">
                                    {participant}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              每人應付: ${expense?.participants ? Math.round(expense?.amount / expense?.participants?.length) : 0}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {expense.mode === 'itemized' ? (
                          // 明細模式：顯示「查看明細」按鈕
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onViewItemizedExpense?.(expense.id)}
                            disabled={isLoading}
                            className="gap-2 transition-all hover:scale-105 active:scale-95"
                          >
                            <Eye className="h-4 w-4" />
                            查看明細
                          </Button>
                        ) : (
                          // 平均分攤模式：顯示「編輯」按鈕
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(expense)}
                            disabled={isLoading}
                            className="transition-all hover:scale-110 active:scale-95"
                          >
                            <Edit2 className="h-4 w-4 transition-transform hover:rotate-12" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(expense)}
                          disabled={isLoading}
                          className="transition-all hover:scale-110 active:scale-95"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 transition-transform hover:rotate-12" />
                          )}
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
