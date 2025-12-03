import { useEffect, useRef, useState } from 'react'

interface UseAutoRefreshOptions {
  enabled: boolean
  interval?: number // 刷新間隔（毫秒），預設 10000ms (10秒)
  onRefresh: () => void | Promise<void>
  onError?: (error: Error) => void
}

/**
 * 自動刷新 Hook
 *
 * 用於實作輪詢機制，定期刷新資料
 *
 * @param options - 配置選項
 * @param options.enabled - 是否啟用自動刷新
 * @param options.interval - 刷新間隔（毫秒），預設 10000ms
 * @param options.onRefresh - 刷新時的回調函數
 * @param options.onError - 錯誤處理回調
 *
 * @returns 物件包含：
 * - isRefreshing: 是否正在刷新
 * - lastRefreshTime: 最後刷新時間
 * - pauseRefresh: 暫停自動刷新
 * - resumeRefresh: 恢復自動刷新
 * - manualRefresh: 手動觸發刷新
 *
 * @example
 * ```tsx
 * const { isRefreshing, pauseRefresh, resumeRefresh } = useAutoRefresh({
 *   enabled: true,
 *   interval: 10000,
 *   onRefresh: async () => {
 *     await fetchData()
 *   }
 * })
 * ```
 */
export function useAutoRefresh({
  enabled,
  interval = 10000,
  onRefresh,
  onError
}: UseAutoRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  // 執行刷新
  const refresh = async () => {
    // 如果正在刷新，跳過此次
    if (isRefreshingRef.current) {
      return
    }

    try {
      isRefreshingRef.current = true
      setIsRefreshing(true)

      await onRefresh()

      setLastRefreshTime(new Date())
    } catch (error) {
      console.error('Auto refresh error:', error)
      if (onError && error instanceof Error) {
        onError(error)
      }
    } finally {
      isRefreshingRef.current = false
      setIsRefreshing(false)
    }
  }

  // 暫停自動刷新
  const pauseRefresh = () => {
    setIsPaused(true)
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current)
      intervalIdRef.current = null
    }
  }

  // 恢復自動刷新
  const resumeRefresh = () => {
    setIsPaused(false)
  }

  // 手動刷新
  const manualRefresh = async () => {
    await refresh()
  }

  // 設定自動刷新
  useEffect(() => {
    if (!enabled || isPaused) {
      // 清理定時器
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
      return
    }

    // 設定定時器
    intervalIdRef.current = setInterval(refresh, interval)

    // 清理函數
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = null
      }
    }
  }, [enabled, interval, isPaused])

  // 元件卸載時清理
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current)
      }
    }
  }, [])

  return {
    isRefreshing,
    lastRefreshTime,
    isPaused,
    pauseRefresh,
    resumeRefresh,
    manualRefresh
  }
}
