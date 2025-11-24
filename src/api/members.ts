// 後端 API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface MemberResponse {
  success: boolean
  message: string
  members?: string[]
}

/**
 * 新增成員
 * @param accessKey 頻道金鑰
 * @param name 成員名稱
 * @returns Promise<MemberResponse>
 */
export const addMember = async (accessKey: string, name: string): Promise<MemberResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/${accessKey}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Add member API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}

/**
 * 刪除成員
 * @param accessKey 頻道金鑰
 * @param name 成員名稱
 * @returns Promise<MemberResponse>
 */
export const removeMember = async (accessKey: string, name: string): Promise<MemberResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/${accessKey}/members/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Remove member API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}

/**
 * 批次更新成員列表
 * @param accessKey 頻道金鑰
 * @param members 成員名稱陣列
 * @returns Promise<MemberResponse>
 */
export const updateMembers = async (accessKey: string, members: string[]): Promise<MemberResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/channels/${accessKey}/members`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ members }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Update members API error:', error)
    return {
      success: false,
      message: '無法連接到伺服器，請稍後再試',
    }
  }
}
