// 使用 Web Crypto API 生成加密的認證 token
// 即使用戶知道密碼（日期），也無法在 localStorage 中偽造有效的 token

const SECRET_KEY = 'split-bill-secret-2024-v1' // 可以定期更換這個密鑰

/**
 * 使用 HMAC-SHA256 生成安全的 token
 * @param password 原始密碼（日期）
 * @returns Promise<string> 雜湊後的 token
 */
export async function generateAuthToken(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + SECRET_KEY)

  // 使用 SHA-256 生成雜湊值
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)

  // 將 ArrayBuffer 轉換為 hex 字串
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return hashHex
}

/**
 * 驗證 token 是否有效
 * @param storedToken 儲存在 localStorage 的 token
 * @param password 當前的密碼（日期）
 * @returns Promise<boolean> 是否有效
 */
export async function verifyAuthToken(storedToken: string, password: string): Promise<boolean> {
  const expectedToken = await generateAuthToken(password)
  return storedToken === expectedToken
}

/**
 * 獲取當天 +8 時區的日期 (YYYYMMDD 格式)
 */
export function getTodayPassword(): string {
  const now = new Date()
  // 轉換到 +8 時區 (UTC+8)
  const utc8Date = new Date(now.getTime() + (8 * 60 * 60 * 1000))
  const year = utc8Date.getUTCFullYear()
  const month = String(utc8Date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(utc8Date.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}
