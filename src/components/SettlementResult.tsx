import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calculator, Users, Receipt } from 'lucide-react'
import { Expense } from '@/types/channel'
import {
  calculateMixedSettlement,
  Balance,
  Transaction,
  ItemizedDetails
} from '@/utils/settlement'

interface SettlementResultProps {
  members: string[]
  expenses: Expense[]
}

export default function SettlementResult({ members, expenses }: SettlementResultProps) {
  const [calculated, setCalculated] = useState(false)
  const [balances, setBalances] = useState<Balance[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [itemizedDetails, setItemizedDetails] = useState<ItemizedDetails>({})
  const [hasSplitExpenses, setHasSplitExpenses] = useState(false)
  const [hasItemizedExpenses, setHasItemizedExpenses] = useState(false)

  const calculateSettlement = () => {
    const result = calculateMixedSettlement(members, expenses)

    setBalances(result.balances)
    setTransactions(result.transactions)
    setItemizedDetails(result.itemizedDetails)
    setHasSplitExpenses(result.hasSplitExpenses)
    setHasItemizedExpenses(result.hasItemizedExpenses)
    setCalculated(true)
  }

  if (expenses?.length === 0) {
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
            {/* 模式標籤 */}
            {(hasSplitExpenses || hasItemizedExpenses) && (
              <div className="flex gap-2 mb-2">
                {hasSplitExpenses && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    平分模式
                  </Badge>
                )}
                {hasItemizedExpenses && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Receipt className="h-3 w-3" />
                    明細模式
                  </Badge>
                )}
              </div>
            )}

            {/* 明細模式詳細資訊 */}
            {hasItemizedExpenses && (
              <div>
                <h3 className="text-lg font-semibold mb-3">明細模式消費明細</h3>
                <div className="space-y-3">
                  {members.map(member => {
                    const details = itemizedDetails[member]
                    if (!details || details.items.length === 0) return null

                    return (
                      <Card key={member} className="bg-purple-50/50 dark:bg-purple-950/20">
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="flex items-center gap-2">
                                👤 {member}
                              </span>
                              <span className="text-purple-600 dark:text-purple-400">
                                ${Math.round(details.total)}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              {details.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between pl-4">
                                  <span className="text-muted-foreground">
                                    • {item.name}
                                    {item.isShared && (
                                      <span className="text-xs ml-1">
                                        (與 {item.sharedWith?.join(', ')} 平分)
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-medium">
                                    ${Math.round(item.personalShare)}
                                  </span>
                                </div>
                              ))}
                              {details.remainderShare && details.remainderShare > 0.01 && (
                                <div className="flex items-center justify-between pl-4 text-orange-600 dark:text-orange-400">
                                  <span>• 剩餘費用分攤</span>
                                  <span className="font-medium">
                                    ${Math.round(details.remainderShare)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

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
