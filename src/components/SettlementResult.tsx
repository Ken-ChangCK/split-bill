import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calculator } from 'lucide-react'

interface Expense {
  id: number
  itemName: string
  amount: number
  payer: string
  participants: string[]
}

interface SettlementResultProps {
  members: string[]
  expenses: Expense[]
}

interface Balance {
  name: string
  balance: number
}

interface Transaction {
  from: string
  to: string
  amount: number
}

export default function SettlementResult({ members, expenses }: SettlementResultProps) {
  const [calculated, setCalculated] = useState(false)
  const [balances, setBalances] = useState<Balance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const calculateSettlement = () => {
    // 初始化每個人的餘額
    const balanceMap: { [key: string]: number } = {}
    members.forEach(member => {
      balanceMap[member] = 0
    })

    // 計算每個人的淨額
    expenses.forEach(expense => {
      const { payer, amount, participants } = expense
      const sharePerPerson = amount / participants.length

      // 付款人實際支付了全額
      balanceMap[payer] += amount

      // 每個參與者應付的金額
      participants.forEach(participant => {
        balanceMap[participant] -= sharePerPerson
      })
    })

    // 轉換為 Balance 陣列並排序
    const balanceList: Balance[] = Object.entries(balanceMap).map(([name, balance]) => ({
      name,
      balance
    }))

    // 分離債權人和債務人
    const creditors = balanceList.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance)
    const debtors = balanceList.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance)

    // 使用貪婪算法計算最優還款方案
    const transactionList: Transaction[] = []
    const creditorsCopy = creditors.map(c => ({ ...c }))
    const debtorsCopy = debtors.map(d => ({ ...d }))

    while (creditorsCopy.length > 0 && debtorsCopy.length > 0) {
      const maxCreditor = creditorsCopy[0]
      const maxDebtor = debtorsCopy[0]

      const transferAmount = Math.min(maxCreditor.balance, -maxDebtor.balance)

      transactionList.push({
        from: maxDebtor.name,
        to: maxCreditor.name,
        amount: transferAmount
      })

      maxCreditor.balance -= transferAmount
      maxDebtor.balance += transferAmount

      if (maxCreditor.balance < 0.01) creditorsCopy.shift()
      if (maxDebtor.balance > -0.01) debtorsCopy.shift()
    }

    setBalances(balanceList)
    setTransactions(transactionList)
    setCalculated(true)
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>結算結果</CardTitle>
          <CardDescription>計算每個人應收或應付的金額</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>尚無支出記錄可供結算</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>結算結果</CardTitle>
        <CardDescription>計算每個人應收或應付的金額</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!calculated ? (
          <Button
            onClick={calculateSettlement}
            className="w-full flex items-center justify-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            計算欠款
          </Button>
        ) : (
          <>
            {/* 各人收支狀況 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">各人收支狀況</h3>
              <div className="space-y-2">
                {balances
                  .sort((a, b) => b.balance - a.balance)
                  .map((balance) => (
                    <div
                      key={balance.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="font-medium">{balance.name}</span>
                      {balance.balance > 0.01 ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          應收 ${Math.round(balance.balance)}
                        </Badge>
                      ) : balance.balance < -0.01 ? (
                        <Badge variant="destructive">
                          應付 ${Math.round(Math.abs(balance.balance))}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">已結清</Badge>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* 還款方案 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                還款方案 (共 {transactions.length} 筆交易)
              </h3>
              {transactions.length === 0 ? (
                <Alert>
                  <AlertDescription>所有人已結清，無需還款</AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction, index) => (
                    <Card key={index} className="bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{transaction.from}</Badge>
                            <span className="text-muted-foreground">→</span>
                            <Badge variant="outline">{transaction.to}</Badge>
                          </div>
                          <span className="text-xl font-bold text-primary">
                            ${Math.round(transaction.amount)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setCalculated(false)}
              variant="outline"
              className="w-full"
            >
              重新計算
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
