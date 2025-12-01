import { useState, useCallback } from 'react';
import { claimItem, unclaimItem, deleteItem, updateItem } from '@/api/items';

interface UseItemActionsProps {
  accessKey: string;
  expenseId: number;
  currentUser: string | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * 品項操作 Hook
 *
 * 封裝品項的認領、取消認領、編輯、刪除等核心邏輯
 * 包含：
 * - 使用者身份檢查
 * - API 呼叫
 * - Loading 狀態管理
 * - 錯誤處理
 */
export function useItemActions({
  accessKey,
  expenseId,
  currentUser,
  onSuccess,
  onError,
}: UseItemActionsProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 認領品項
   *
   * 檢查：
   * 1. 是否已選擇使用者
   * 2. 使用者是否已認領此品項
   *
   * 執行：
   * - 未認領 → 加入 claimedBy
   * - 已認領 → 不執行（由 UI 層處理顯示）
   */
  const handleClaim = useCallback(async (itemId: string) => {
    // 檢查是否已選擇使用者
    if (!currentUser) {
      onError?.('請先選擇你的身份');
      return;
    }

    setIsLoading(true);

    try {
      const response = await claimItem(accessKey, expenseId, itemId, currentUser);

      if (response.success) {
        onSuccess?.();
      } else {
        onError?.(response.message || '認領失敗');
      }
    } catch (error) {
      console.error('Claim item error:', error);
      onError?.('認領時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  }, [accessKey, expenseId, currentUser, onSuccess, onError]);

  /**
   * 取消認領品項
   *
   * 檢查：
   * 1. 是否已選擇使用者
   * 2. 使用者是否已認領此品項
   *
   * 執行：
   * - 從 claimedBy 移除使用者
   */
  const handleUnclaim = useCallback(async (itemId: string) => {
    // 檢查是否已選擇使用者
    if (!currentUser) {
      onError?.('請先選擇你的身份');
      return;
    }

    setIsLoading(true);

    try {
      const response = await unclaimItem(accessKey, expenseId, itemId, currentUser);

      if (response.success) {
        onSuccess?.();
      } else {
        onError?.(response.message || '取消認領失敗');
      }
    } catch (error) {
      console.error('Unclaim item error:', error);
      onError?.('取消認領時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  }, [accessKey, expenseId, currentUser, onSuccess, onError]);

  /**
   * 編輯品項
   *
   * @param itemId 品項 ID
   * @param data 要更新的資料（名稱或金額）
   */
  const handleEdit = useCallback(async (
    itemId: string,
    data: { name?: string; price?: number }
  ) => {
    setIsLoading(true);

    try {
      const response = await updateItem(accessKey, expenseId, itemId, data);

      if (response.success) {
        onSuccess?.();
      } else {
        onError?.(response.message || '編輯失敗');
      }
    } catch (error) {
      console.error('Edit item error:', error);
      onError?.('編輯時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  }, [accessKey, expenseId, onSuccess, onError]);

  /**
   * 刪除品項
   *
   * @param itemId 品項 ID
   */
  const handleDelete = useCallback(async (itemId: string) => {
    setIsLoading(true);

    try {
      const response = await deleteItem(accessKey, expenseId, itemId);

      if (response.success) {
        onSuccess?.();
      } else {
        onError?.(response.message || '刪除失敗');
      }
    } catch (error) {
      console.error('Delete item error:', error);
      onError?.('刪除時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  }, [accessKey, expenseId, onSuccess, onError]);

  /**
   * 切換認領狀態
   *
   * 根據當前認領狀態自動選擇認領或取消認領
   *
   * @param itemId 品項 ID
   * @param isCurrentlyClaimed 當前是否已認領
   */
  const handleToggleClaim = useCallback(async (
    itemId: string,
    isCurrentlyClaimed: boolean
  ) => {
    if (isCurrentlyClaimed) {
      await handleUnclaim(itemId);
    } else {
      await handleClaim(itemId);
    }
  }, [handleClaim, handleUnclaim]);

  return {
    isLoading,
    handleClaim,
    handleUnclaim,
    handleEdit,
    handleDelete,
    handleToggleClaim,
  };
}
