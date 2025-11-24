import { Channel } from '../types/channel'

// 後端 API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface CreateChannelResponse {
  success: boolean
  message: string
  channel?: Channel
}

interface JoinChannelResponse {
  success: boolean
  message: string
  channel?: Channel
}

interface GetChannelResponse {
  success: boolean
  message: string
  channel?: Channel
}

interface DeleteChannelResponse {
  success: boolean
  message: string
}

/**
 * 建立新頻道
 * @param name 頻道名稱
 * @returns Promise<CreateChannelResponse>
 */
export const createChannel = async (name: string): Promise<CreateChannelResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Create channel API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}

/**
 * 加入頻道（驗證金鑰）
 * @param accessKey 頻道金鑰
 * @returns Promise<JoinChannelResponse>
 */
export const joinChannel = async (accessKey: string): Promise<JoinChannelResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessKey }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Join channel API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}

/**
 * 取得頻道完整資料
 * @param accessKey 頻道金鑰
 * @returns Promise<GetChannelResponse>
 */
export const getChannel = async (accessKey: string): Promise<GetChannelResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/${accessKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Get channel API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}

/**
 * 刪除頻道
 * @param accessKey 頻道金鑰
 * @returns Promise<DeleteChannelResponse>
 */
export const deleteChannel = async (accessKey: string): Promise<DeleteChannelResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/${accessKey}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Delete channel API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}
