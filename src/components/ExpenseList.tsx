import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2 } from 'lucide-react'

interface Expense {
  id: number
  itemName: string
  amount: number
  payer: string
  participants: string[]
}

interface ExpenseListProps {
  expenses: Expense[]
  onDeleteExpense: (id: number) => void
}

export default function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  const handleDelete = (expense: Expense) => {
    if (window.confirm(`確定要刪除支出「${expense.itemName}」嗎?`)) {
      onDeleteExpense(expense.id)
    }
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

                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(expense)}
                      className="ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
