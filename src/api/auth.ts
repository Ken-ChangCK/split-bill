// 後端 API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface LoginResponse {
  success: boolean
  message: string
  token?: string
  date?: string
}

interface VerifyResponse {
  success: boolean
  message: string
  date?: string
}

/**
 * 登入 API
 * @param password 密碼
 * @returns Promise<LoginResponse>
 */
export const login = async (password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Login API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}

/**
 * 驗證 token API
 * @param token JWT token
 * @returns Promise<VerifyResponse>
 */
export const verifyToken = async (token: string): Promise<VerifyResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Verify API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器',
    }
  }
}
