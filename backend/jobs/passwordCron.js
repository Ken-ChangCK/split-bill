import cron from 'node-cron'
import Password from '../models/Password.js'
import { getTodayDate } from '../utils/dateHelper.js'

// 自動建立當天的密碼（密碼就是日期本身）
const createTodayPassword = async () => {
  try {
    const todayDate = getTodayDate()

    // 檢查今天的密碼是否已存在
    const existingPassword = await Password.findByDate(todayDate)

    if (existingPassword) {
      console.log(`密碼已存在: ${todayDate}`)
      return
    }

    // 建立新密碼（密碼就是日期）
    await Password.createPassword(todayDate, todayDate)
    console.log(`成功建立密碼: ${todayDate}`)
  } catch (error) {
    console.error('建立密碼失敗:', error)
  }
}

// 啟動定時任務
export const startPasswordCron = () => {
  // 每天凌晨 00:01 (+8時區) 自動建立新密碼
  // cron 格式: 秒 分 時 日 月 星期
  // '0 1 0 * * *' = 每天 00:01:00
  cron.schedule('0 1 0 * * *', async () => {
    console.log('執行定時任務：建立今日密碼')
    await createTodayPassword()
  }, {
    timezone: 'Asia/Taipei'  // 設定為台北時區 (+8)
  })

  console.log('密碼定時任務已啟動 (每天 00:01 台北時間)')

  // 伺服器啟動時也執行一次，確保當天密碼已建立
  console.log('執行初始密碼建立')
  createTodayPassword()
}

// 手動建立密碼的工具函數（用於測試或補建）
export const manualCreatePassword = async (date, password) => {
  try {
    await Password.createPassword(date, password)
    console.log(`手動建立密碼成功: ${date}`)
  } catch (error) {
    console.error('手動建立密碼失敗:', error)
  }
}
