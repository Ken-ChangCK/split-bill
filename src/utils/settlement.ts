import { Expense } from '@/types/channel'

export interface Balance {
  name: string
  balance: number
}

export interface Transaction {
  from: string
  to: string
  amount: number
}

export interface ItemizedDetails {
  [userName: string]: {
    items: Array<{
      name: string
      price: number
      isShared: boolean
      sharedWith?: string[]
      personalShare: number
    }>
    remainderShare?: number
    total: number
  }
}

/**
 * 計算平分模式的結算
 */
export function calculateSplitSettlement(
  members: string[],
  expenses: Expense[]
): { balances: Balance[]; transactions: Transaction[] } {
  // 初始化每個人的餘額
  const balanceMap: { [key: string]: number } = {}
  members.forEach(member => {
    balanceMap[member] = 0
  })

  // 計算每個人的淨額
  expenses.forEach(expense => {
    // 只處理平分模式的支出
    if (expense.mode === 'itemized' || !expense.participants || expense.participants.length === 0) {
      return
    }

    const { payer, amount, participants } = expense
    const sharePerPerson = amount / participants.length

    // 付款人實際支付了全額
    balanceMap[payer] += amount

    // 每個參與者應付的金額
    participants.forEach(participant => {
      balanceMap[participant] -= sharePerPerson
    })
  })

  // 轉換為 Balance 陣列
  const balances: Balance[] = Object.entries(balanceMap).map(([name, balance]) => ({
    name,
    balance
  }))

  // 計算還款方案
  const transactions = calculateTransactions(balances)

  return { balances, transactions }
}

/**
 * 計算明細模式的結算
 */
export function calculateItemizedSettlement(
  members: string[],
  expenses: Expense[]
): {
  balances: Balance[]
  transactions: Transaction[]
  details: ItemizedDetails
} {
  // 初始化每個人的餘額
  const balanceMap: { [key: string]: number } = {}
  members.forEach(member => {
    balanceMap[member] = 0
  })

  // 初始化明細資訊
  const details: ItemizedDetails = {}
  members.forEach(member => {
    details[member] = {
      items: [],
      total: 0
    }
  })

  // 處理每個明細模式支出
  expenses.forEach(expense => {
    // 只處理明細模式的支出
    if (expense.mode !== 'itemized' || !expense.items) {
      return
    }

    const { payer, amount, items, remainderHandling = 'payer' } = expense

    // 付款人先支付全額
    balanceMap[payer] += amount

    // 計算已認領品項的總額
    let claimedTotal = 0

    // 處理每個品項
    items.forEach(item => {
      if (item.claimedBy.length === 0) {
        // 未認領的品項不計算
        return
      }

      claimedTotal += item.price

      // 計算每人應付金額
      const sharePerPerson = item.price / item.claimedBy.length
      const isShared = item.claimedBy.length > 1

      // 每個認領人減去應付金額
      item.claimedBy.forEach(claimer => {
        balanceMap[claimer] -= sharePerPerson

        // 記錄明細
        details[claimer].items.push({
          name: item.name,
          price: item.price,
          isShared,
          sharedWith: isShared ? item.claimedBy.filter(c => c !== claimer) : undefined,
          personalShare: sharePerPerson
        })
        details[claimer].total += sharePerPerson
      })
    })

    // 處理剩餘金額
    const remainder = amount - claimedTotal
    if (remainder > 0.01) {
      if (remainderHandling === 'split-all') {
        // 全員平分剩餘金額
        const remainderPerPerson = remainder / members.length
        members.forEach(member => {
          balanceMap[member] -= remainderPerPerson
          details[member].remainderShare = remainderPerPerson
          details[member].total += remainderPerPerson
        })
      } else {
        // 付款人承擔剩餘金額
        balanceMap[payer] -= remainder
        details[payer].remainderShare = remainder
        details[payer].total += remainder
      }
    }
  })

  // 轉換為 Balance 陣列
  const balances: Balance[] = Object.entries(balanceMap).map(([name, balance]) => ({
    name,
    balance
  }))

  // 計算還款方案
  const transactions = calculateTransactions(balances)

  return { balances, transactions, details }
}

/**
 * 計算混合模式的結算（同時有平分模式和明細模式）
 */
export function calculateMixedSettlement(
  members: string[],
  expenses: Expense[]
): {
  balances: Balance[]
  transactions: Transaction[]
  itemizedDetails: ItemizedDetails
  hasSplitExpenses: boolean
  hasItemizedExpenses: boolean
} {
  // 初始化每個人的餘額
  const balanceMap: { [key: string]: number } = {}
  members.forEach(member => {
    balanceMap[member] = 0
  })

  // 初始化明細資訊
  const itemizedDetails: ItemizedDetails = {}
  members.forEach(member => {
    itemizedDetails[member] = {
      items: [],
      total: 0
    }
  })

  let hasSplitExpenses = false
  let hasItemizedExpenses = false

  expenses.forEach(expense => {
    if (expense.mode === 'itemized' && expense.items) {
      // 明細模式支出
      hasItemizedExpenses = true

      const { payer, amount, items, remainderHandling = 'payer' } = expense

      // 付款人先支付全額
      balanceMap[payer] += amount

      // 計算已認領品項的總額
      let claimedTotal = 0

      // 處理每個品項
      items.forEach(item => {
        if (item.claimedBy.length === 0) return

        claimedTotal += item.price
        const sharePerPerson = item.price / item.claimedBy.length
        const isShared = item.claimedBy.length > 1

        item.claimedBy.forEach(claimer => {
          balanceMap[claimer] -= sharePerPerson

          itemizedDetails[claimer].items.push({
            name: item.name,
            price: item.price,
            isShared,
            sharedWith: isShared ? item.claimedBy.filter(c => c !== claimer) : undefined,
            personalShare: sharePerPerson
          })
          itemizedDetails[claimer].total += sharePerPerson
        })
      })

      // 處理剩餘金額
      const remainder = amount - claimedTotal
      if (remainder > 0.01) {
        if (remainderHandling === 'split-all') {
          const remainderPerPerson = remainder / members.length
          members.forEach(member => {
            balanceMap[member] -= remainderPerPerson
            itemizedDetails[member].remainderShare =
              (itemizedDetails[member].remainderShare || 0) + remainderPerPerson
            itemizedDetails[member].total += remainderPerPerson
          })
        } else {
          balanceMap[payer] -= remainder
          itemizedDetails[payer].remainderShare =
            (itemizedDetails[payer].remainderShare || 0) + remainder
          itemizedDetails[payer].total += remainder
        }
      }
    } else if (expense.participants && expense.participants.length > 0) {
      // 平分模式支出
      hasSplitExpenses = true

      const { payer, amount, participants } = expense
      const sharePerPerson = amount / participants.length

      balanceMap[payer] += amount

      participants.forEach(participant => {
        balanceMap[participant] -= sharePerPerson
      })
    }
  })

  // 轉換為 Balance 陣列
  const balances: Balance[] = Object.entries(balanceMap).map(([name, balance]) => ({
    name,
    balance
  }))

  // 計算還款方案
  const transactions = calculateTransactions(balances)

  return {
    balances,
    transactions,
    itemizedDetails,
    hasSplitExpenses,
    hasItemizedExpenses
  }
}

/**
 * 使用貪婪算法計算最優還款方案
 */
function calculateTransactions(balances: Balance[]): Transaction[] {
  // 分離債權人和債務人
  const creditors = balances
    .filter(b => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance)
    .map(c => ({ ...c }))

  const debtors = balances
    .filter(b => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance)
    .map(d => ({ ...d }))

  const transactions: Transaction[] = []

  while (creditors.length > 0 && debtors.length > 0) {
    const maxCreditor = creditors[0]
    const maxDebtor = debtors[0]

    const transferAmount = Math.min(maxCreditor.balance, -maxDebtor.balance)

    transactions.push({
      from: maxDebtor.name,
      to: maxCreditor.name,
      amount: transferAmount
    })

    maxCreditor.balance -= transferAmount
    maxDebtor.balance += transferAmount

    if (maxCreditor.balance < 0.01) creditors.shift()
    if (maxDebtor.balance > -0.01) debtors.shift()
  }

  return transactions
}
