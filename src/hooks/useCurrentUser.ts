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

  /**
   * 設定當前使用者
   * @param userName - 使用者名稱
   */
  const setCurrentUser = useCallback((userName: string) => {
    try {
      localStorage.setItem(storageKey, userName);
      setCurrentUserState(userName);
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
