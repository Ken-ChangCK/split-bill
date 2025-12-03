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
  const [showSplitDetails, setShowSplitDetails] = useState(true)
  const [showItemizedDetails, setShowItemizedDetails] = useState(true)

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
              <div className="flex gap-2 mb-4">
                {hasSplitExpenses && (
                  <Badge
                    variant={showSplitDetails ? "default" : "secondary"}
                    className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowSplitDetails(!showSplitDetails)}
                  >
                    <Users className="h-3 w-3" />
                    平分模式
                    {showSplitDetails ? (
                      <span className="ml-1 text-xs">▼</span>
                    ) : (
                      <span className="ml-1 text-xs">▶</span>
                    )}
                  </Badge>
                )}
                {hasItemizedExpenses && (
                  <Badge
                    variant={showItemizedDetails ? "default" : "secondary"}
                    className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setShowItemizedDetails(!showItemizedDetails)}
                  >
                    <Receipt className="h-3 w-3" />
                    明細模式
                    {showItemizedDetails ? (
                      <span className="ml-1 text-xs">▼</span>
                    ) : (
                      <span className="ml-1 text-xs">▶</span>
                    )}
                  </Badge>
                )}
              </div>
            )}

            {/* 平分模式支出明細 */}
            {hasSplitExpenses && showSplitDetails && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  平分模式支出明細
                </h3>
                <div className="space-y-3">
                  {expenses
                    .filter(expense => expense.mode !== 'itemized' && expense.participants && expense.participants.length > 0)
                    .map((expense, idx) => {
                      const sharePerPerson = expense.amount / expense.participants!.length
                      return (
                        <Card key={idx} className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="pt-4">
                            <div className="space-y-3">
                              {/* 支出標題和總額 */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  <span className="font-semibold text-base">{expense.itemName}</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  ${expense.amount.toFixed(2)}
                                </span>
                              </div>

                              {/* 付款人 */}
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">付款人：</span>
                                <Badge variant="outline" className="font-medium">
                                  {expense.payer}
                                </Badge>
                              </div>

                              {/* 參與者和分攤金額 */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">參與者：</span>
                                  <div className="flex gap-1 flex-wrap">
                                    {expense.participants!.map((participant, pIdx) => (
                                      <Badge key={pIdx} variant="secondary" className="text-xs">
                                        {participant}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">每人應付：</span>
                                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                                      ${sharePerPerson.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              </div>
            )}

            {/* 明細模式詳細資訊 */}
            {hasItemizedExpenses && showItemizedDetails && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  明細模式消費明細
                </h3>
                <div className="space-y-4">
                  {expenses
                    .filter(expense => expense.mode === 'itemized' && expense.items)
                    .map((expense, expIdx) => (
                      <Card key={expIdx} className="bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {/* 支出標題和付款人 */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Receipt className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                  <span className="font-semibold text-base">{expense.itemName}</span>
                                </div>
                                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                  ${expense.amount.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">付款人：</span>
                                <Badge variant="outline" className="font-medium">
                                  {expense.payer}
                                </Badge>
                              </div>
                            </div>

                            {/* 品項列表 */}
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-muted-foreground">品項明細：</div>
                              {expense.items!.map((item, itemIdx) => (
                                <div key={itemIdx} className="bg-white dark:bg-slate-800 rounded-lg p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                                      ${item.price.toFixed(2)}
                                    </span>
                                  </div>
                                  {item.claimedBy.length > 0 ? (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">認領人：</span>
                                        <div className="flex gap-1 flex-wrap">
                                          {item.claimedBy.map((claimer, cIdx) => (
                                            <Badge key={cIdx} variant="secondary" className="text-xs">
                                              {claimer}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                      {item.claimedBy.length > 1 && (
                                        <div className="text-xs text-muted-foreground">
                                          每人應付：${(item.price / item.claimedBy.length).toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-orange-600 dark:text-orange-400">
                                      尚未認領
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* 剩餘金額處理 */}
                            {(() => {
                              const claimedTotal = expense.items!.reduce((sum, item) =>
                                item.claimedBy.length > 0 ? sum + item.price : sum, 0
                              )
                              const remainder = expense.amount - claimedTotal
                              if (remainder > 0.01) {
                                return (
                                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-sm">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-medium text-orange-700 dark:text-orange-300">
                                        剩餘金額：
                                      </span>
                                      <span className="font-semibold text-orange-700 dark:text-orange-300">
                                        ${remainder.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="text-xs text-orange-600 dark:text-orange-400">
                                      {expense.remainderHandling === 'split-all'
                                        ? `全員平分（每人 $${(remainder / members.length).toFixed(2)}）`
                                        : `由付款人 ${expense.payer} 承擔`
                                      }
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>

                {/* 按人顯示的總額摘要 */}
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">各人明細模式消費總額：</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {members.map(member => {
                      const details = itemizedDetails[member]
                      if (!details || details.total === 0) return null
                      return (
                        <div key={member} className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">👤 {member}</span>
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              ${Math.round(details.total)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 各人收支狀況 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                各人收支狀況
              </h3>
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
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                💸 還款方案 ({transactions.length} 筆交易)
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
