import { useState, useEffect, useCallback } from 'react';

/**
 * 身份管理 Hook
 *
 * 用於管理當前使用者身份（無登入系統）
 * 使用 localStorage 儲存每個頻道的當前使用者
 *
 * @param channelId - 頻道 ID
 * @returns {object} - 包含當前使用者資訊和操作方法
 */
export function useCurrentUser(channelId: string) {
  const storageKey = `currentUser_${channelId}`;

  // 從 localStorage 讀取初始值
  const getStoredUser = useCallback((): string | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }, [storageKey]);

  const [currentUser, setCurrentUserState] = useState<string | null>(getStoredUser);

  // 當 channelId 變更時，重新讀取 localStorage
  useEffect(() => {
    const user = getStoredUser();
    setCurrentUserState(user);
  }, [channelId, getStoredUser]);

  // 監聽 localStorage 變更（用於跨組件同步）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey) {
        setCurrentUserState(e.newValue);
      }
    };

    // 自定義事件監聽（用於同一頁面內的更新）
    const handleCustomStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === storageKey) {
        setCurrentUserState(customEvent.detail.value);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [storageKey]);

  /**
   * 設定當前使用者
   * @param userName - 使用者名稱
   */
  const setCurrentUser = useCallback((userName: string) => {
    try {
      localStorage.setItem(storageKey, userName);
      setCurrentUserState(userName);

      // 觸發自定義事件，通知其他使用相同 hook 的組件
      const event = new CustomEvent('localStorageChange', {
        detail: { key: storageKey, value: userName }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [storageKey]);

  /**
   * 清除當前使用者
   */
  const clearCurrentUser = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setCurrentUserState(null);

      // 觸發自定義事件，通知其他使用相同 hook 的組件
      const event = new CustomEvent('localStorageChange', {
        detail: { key: storageKey, value: null }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }, [storageKey]);

  /**
   * 切換使用者（功能上等同於 setCurrentUser）
   * @param userName - 使用者名稱
   */
  const switchUser = useCallback((userName: string) => {
    setCurrentUser(userName);
  }, [setCurrentUser]);

  return {
    currentUser,
    setCurrentUser,
    clearCurrentUser,
    switchUser,
    isUserSelected: currentUser !== null,
  };
}
