import { GoogleGenAI } from '@google/genai'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const model = 'gemini-2.0-flash'

if (!API_KEY) {
  console.error('VITE_GEMINI_API_KEY is not set in environment variables')
}

const genAI = new GoogleGenAI({ apiKey: API_KEY || '' })

export interface ReceiptData {
  storeName: string
  amount: number
  date: string
  success: boolean
  error?: string
}

/**
 * 將圖片轉換為 Base64
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // 移除 data:image/...;base64, 前綴
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}

/**
 * 使用 Gemini API 識別發票圖片
 */
export async function analyzeReceipt(imageFile: File): Promise<ReceiptData> {
  try {
    if (!API_KEY) {
      return {
        storeName: '',
        amount: 0,
        date: '',
        success: false,
        error: '未設定 API Key，請在 .env 文件中設定 VITE_GEMINI_API_KEY'
      }
    }

    const base64Image = await fileToBase64(imageFile)
    const mimeType = imageFile.type

    const prompt = `請分析這張發票圖片，並以 JSON 格式回傳以下資訊：
{
  "storeName": "店家名稱",
  "amount": 總金額(數字),
  "date": "日期(YYYY/MM/DD格式)"
}

注意事項：
1. 如果是台灣的統一發票，請提取賣方名稱作為店家名稱
2. 總金額請提取「總計」或「合計」的金額
3. 日期請轉換為 YYYY/MM/DD 格式
4. 如果無法識別某個欄位，請使用空字串或 0
5. 只回傳 JSON 格式，不要包含其他文字說明`

    // 使用 @google/genai 的 API 格式
    // 直接使用模型 ID，不加 models/ 前綴
    const response = await genAI.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Image
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]
    })

    const text = response.text || ''

    // 嘗試解析 JSON 回應
    let jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('無法從回應中提取 JSON 資料')
    }

    const receiptData = JSON.parse(jsonMatch[0])

    return {
      storeName: receiptData.storeName || '',
      amount: parseFloat(receiptData.amount) || 0,
      date: receiptData.date || '',
      success: true
    }
  } catch (error) {
    console.error('發票識別錯誤:', error)
    return {
      storeName: '',
      amount: 0,
      date: '',
      success: false,
      error: error instanceof Error ? error.message : '發票識別失敗'
    }
  }
}
