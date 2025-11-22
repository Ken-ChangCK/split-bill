// 獲取當天 +8 時區的日期 (YYYYMMDD 格式)
export const getTodayDate = () => {
  const now = new Date()
  // 轉換到 +8 時區 (UTC+8)
  const utc8Date = new Date(now.getTime() + (8 * 60 * 60 * 1000))
  const year = utc8Date.getUTCFullYear()
  const month = String(utc8Date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(utc8Date.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}
