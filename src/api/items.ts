import { ExpenseItem } from '../types/channel';

// 後端 API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ItemResponse {
  success: boolean;
  message: string;
  item?: ExpenseItem;
  items?: ExpenseItem[];
}

/**
 * 新增品項
 * @param accessKey 頻道金鑰
 * @param expenseId 支出 ID
 * @param item 品項資料（不含 id）
 * @returns Promise<ItemResponse>
 */
export const createItem = async (
  accessKey: string,
  expenseId: number,
  item: { name: string; price: number; createdBy?: string }
): Promise<ItemResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/channels/${accessKey}/expenses/${expenseId}/items`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Create item API error:', error);
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    };
  }
};

/**
 * 更新品項
 * @param accessKey 頻道金鑰
 * @param expenseId 支出 ID
 * @param itemId 品項 ID
 * @param data 要更新的資料（名稱或金額）
 * @returns Promise<ItemResponse>
 */
export const updateItem = async (
  accessKey: string,
  expenseId: number,
  itemId: string,
  data: { name?: string; price?: number }
): Promise<ItemResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/channels/${accessKey}/expenses/${expenseId}/items/${itemId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Update item API error:', error);
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    };
  }
};

/**
 * 刪除品項
 * @param accessKey 頻道金鑰
 * @param expenseId 支出 ID
 * @param itemId 品項 ID
 * @returns Promise<ItemResponse>
 */
export const deleteItem = async (
  accessKey: string,
  expenseId: number,
  itemId: string
): Promise<ItemResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/channels/${accessKey}/expenses/${expenseId}/items/${itemId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Delete item API error:', error);
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    };
  }
};

/**
 * 認領品項
 * @param accessKey 頻道金鑰
 * @param expenseId 支出 ID
 * @param itemId 品項 ID
 * @param userName 使用者名稱
 * @returns Promise<ItemResponse>
 */
export const claimItem = async (
  accessKey: string,
  expenseId: number,
  itemId: string,
  userName: string
): Promise<ItemResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/channels/${accessKey}/expenses/${expenseId}/items/${itemId}/claim`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Claim item API error:', error);
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    };
  }
};

/**
 * 取消認領品項
 * @param accessKey 頻道金鑰
 * @param expenseId 支出 ID
 * @param itemId 品項 ID
 * @param userName 使用者名稱
 * @returns Promise<ItemResponse>
 */
export const unclaimItem = async (
  accessKey: string,
  expenseId: number,
  itemId: string,
  userName: string
): Promise<ItemResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/channels/${accessKey}/expenses/${expenseId}/items/${itemId}/claim`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userName }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Unclaim item API error:', error);
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    };
  }
};

/**
 * 更新剩餘金額處理方式
 * @param accessKey 頻道金鑰
 * @param expenseId 支出 ID
 * @param handling 處理方式 ('payer' | 'split-all')
 * @returns Promise<ItemResponse>
 */
export const updateRemainderHandling = async (
  accessKey: string,
  expenseId: number,
  handling: 'payer' | 'split-all'
): Promise<ItemResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/channels/${accessKey}/expenses/${expenseId}/remainder`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remainderHandling: handling }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Update remainder handling API error:', error);
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    };
  }
};
