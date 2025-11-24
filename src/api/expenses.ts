import { Expense } from '../types/channel'

// 後端 API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface ExpenseResponse {
  success: boolean
  message: string
  expense?: Expense
  expenses?: Expense[]
}

/**
 * 新增支出
 * @param accessKey 頻道金鑰
 * @param expense 支出資料
 * @returns Promise<ExpenseResponse>
 */
export const addExpense = async (accessKey: string, expense: Omit<Expense, 'id'>): Promise<ExpenseResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/${accessKey}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Add expense API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}

/**
 * 刪除支出
 * @param accessKey 頻道金鑰
 * @param expenseId 支出 ID
 * @returns Promise<ExpenseResponse>
 */
export const removeExpense = async (accessKey: string, expenseId: number): Promise<ExpenseResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/${accessKey}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Remove expense API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}

/**
 * 更新支出
 * @param accessKey 頻道金鑰
 * @param expenseId 支出 ID
 * @param expense 更新的支出資料
 * @returns Promise<ExpenseResponse>
 */
export const updateExpense = async (accessKey: string, expenseId: number, expense: Omit<Expense, 'id'>): Promise<ExpenseResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/${accessKey}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expense),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Update expense API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}
